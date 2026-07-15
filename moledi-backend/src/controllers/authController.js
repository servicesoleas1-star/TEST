import { generateSecureToken } from "../utils/tokens.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { safeRedirect } from "../utils/redirect.js";
import { sendMail } from "../utils/mailer.js";
import { associateVisitor } from "../store/visitorsStore.js";
import { updateUserPreferences } from "../store/userPreferencesStore.js";
import { getClientIp } from "../utils/hashIp.js";
import { passesHumanCheck, verifyTurnstileToken } from "../utils/antiBot.js";
import { setSessionCookies, clearSessionCookies } from "../utils/cookies.js";
import {
  createSession,
  recordLoginLog,
  invalidateSessionByAccessToken,
} from "../store/sessionStore.js";
import {
  findUserByEmail,
  createUser,
  markEmailVerified,
  saveVerificationToken,
  getVerificationToken,
  markTokenUsed,
  invalidateTokensForEmail,
  getLastResendAt,
  setLastResendAt,
  getLoginAttempts,
  registerFailedLogin,
  resetLoginAttempts,
} from "../store/pgStore.js";
import { pool } from "../db/pool.js";

const TOKEN_TTL_HOURS = parseInt(process.env.EMAIL_VERIFICATION_TOKEN_TTL_HOURS || "24", 10);
const RESEND_COOLDOWN_SECONDS = parseInt(process.env.EMAIL_RESEND_COOLDOWN_SECONDS || "60", 10);
const LOGIN_MAX_ATTEMPTS = parseInt(process.env.LOGIN_MAX_ATTEMPTS || "5", 10);
const LOGIN_LOCKOUT_MINUTES = parseInt(process.env.LOGIN_LOCKOUT_MINUTES || "15", 10);

// Message générique unique pour toute erreur d'authentification, afin de ne
// jamais permettre à un attaquant de déduire si un email existe en base
// (énumération de comptes interdite par les critères d'acceptation).
const GENERIC_AUTH_ERROR = "Email ou mot de passe incorrect.";
const GENERIC_RESEND_MESSAGE =
  "Si un compte existe avec cet email, un nouveau lien de vérification vient d'être envoyé.";

// Le visitor_id anonyme (cookie moledi_visitor_id, voir lib/visitorId.js
// côté frontend) peut arriver soit dans le body, soit dans le header
// X-Visitor-Id (withVisitorHeader()) — on accepte les deux.
function resolveVisitorId(req) {
  return req.body?.visitorId || req.headers["x-visitor-id"] || null;
}

// La colonne visitors.language contient soit une locale brute détectée
// automatiquement à la première visite (ex: "fr-FR", "en-US", voir
// visitorsController.initVisitor), soit "FR"/"EN" normalisé si le visiteur a
// explicitement basculé le sélecteur de langue -- on normalise dans tous les
// cas avant de l'appliquer à user_preferences.language (qui n'accepte que
// "FR" ou "EN").
function normalizeLanguage(rawLanguage) {
  if (!rawLanguage) return null;
  return rawLanguage.toLowerCase().startsWith("en") ? "EN" : "FR";
}

/**
 * Lie le visiteur anonyme au compte, sans jamais faire échouer la requête
 * d'auth appelante en cas de souci (l'association est un bonus analytique,
 * pas une condition de connexion/inscription). Synchronise au passage la
 * langue déjà connue du visiteur (choisie avant inscription/connexion) vers
 * ses préférences de compte, pour que le dashboard s'ouvre directement dans
 * la langue qu'il utilisait déjà sur le site public.
 */
async function tryAssociateVisitor(req, userId) {
  const visitorId = resolveVisitorId(req);
  if (!visitorId) return;
  try {
    const result = await associateVisitor(visitorId, userId);
    const language = normalizeLanguage(result?.language);
    if (language) {
      await updateUserPreferences(userId, { language });
    }
  } catch (err) {
    console.warn("Visitor association failed:", err.message);
  }
}

/**
 * Ouvre une session serveur réelle (ligne user_sessions + cookies httpOnly)
 * pour un utilisateur qui vient de se connecter ou de vérifier son email.
 * Fenêtre glissante de 2h côté access token, 30 jours côté refresh token
 * (voir store/sessionStore.js et middleware/auth.js) — répond au besoin de
 * rester connecté même après fermeture du navigateur.
 */
async function establishSession(req, res, userId) {
  const session = await createSession(userId, {
    ip: getClientIp(req),
    browser: typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"].slice(0, 500) : null,
  });
  setSessionCookies(res, { accessToken: session.access_token, refreshToken: session.refresh_token });
}

/**
 * Émet un nouveau token de vérification pour un email donné et l'envoie
 * (ici : log console — à remplacer par un vrai envoi SMTP/service d'emailing).
 * Invalide tout token précédent non utilisé pour cet email.
 */
async function issueVerificationToken(email) {
  await invalidateTokensForEmail(email);
  const token = generateSecureToken();
  await saveVerificationToken(token, email, TOKEN_TTL_HOURS);

  const link = `${process.env.FRONTEND_URL || "http://localhost:5173"}/inscription/verification?token=${token}`;
  try {
    await sendMail({
      to: email,
      subject: "Vérifiez votre adresse email — Moledi Events",
      html: `<p>Bienvenue sur Moledi Events !</p><p>Cliquez sur le lien ci-dessous pour vérifier votre adresse email (valable ${TOKEN_TTL_HOURS}h) :</p><p><a href="${link}">${link}</a></p>`,
    });
  } catch (err) {
    console.warn("Envoi de l'email de vérification échoué :", err.message);
  }

  return token;
}

/**
 * GET /api/auth/check-email?email=...
 * Vérification d'unicité en temps réel pour le formulaire d'inscription
 * (contrairement à la connexion, il est normal et attendu ici de révéler
 * si un email est déjà pris — voir RegistrationForm.jsx).
 */
export async function checkEmail(req, res) {
  const email = typeof req.query.email === "string" ? req.query.email : "";

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "Adresse email invalide." });
  }

  const existing = await findUserByEmail(email);
  return res.status(200).json({ available: !existing });
}

/**
 * POST /api/auth/register
 * Body: { fullName, email, password }
 * Crée le compte (role=ORGANIZER par défaut, seul rôle accessible via ce
 * formulaire public — ADMIN/SUPER_ADMIN sont provisionnés autrement) et
 * envoie immédiatement un lien de vérification email, comme le fait déjà
 * le flux de renvoi (resendVerification) — même mécanisme, même cooldown.
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function register(req, res) {
  const { fullName, email, password, phone, phoneCountryCode, acquisitionSourceId } = req.body;

  if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
    return res.status(400).json({ error: "Le nom complet est requis." });
  }
  if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "Adresse email invalide." });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères." });
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(409).json({
      error: existing.email_verified
        ? "Un compte existe déjà avec cet email. Connectez-vous."
        : "Un compte existe déjà avec cet email, en attente de vérification. Vérifiez votre boîte mail ou demandez un nouveau lien depuis la page de vérification.",
    });
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser({
    email,
    passwordHash,
    fullName: fullName.trim(),
    role: "ORGANIZER",
    phone: typeof phone === "string" && phone.trim() ? phone.trim() : null,
    phoneCountryCode: typeof phoneCountryCode === "string" && phoneCountryCode.trim() ? phoneCountryCode.trim() : null,
    // Validé en format UUID uniquement : une source invalide/inconnue ne doit
    // jamais faire échouer la création de compte (FK acquisition_sources).
    acquisitionSourceId: typeof acquisitionSourceId === "string" && UUID_REGEX.test(acquisitionSourceId)
      ? acquisitionSourceId
      : null,
  });

  await issueVerificationToken(user.email);
  await setLastResendAt(user.email, Date.now());
  await tryAssociateVisitor(req, user.user_id);

  return res.status(201).json({
    success: true,
    email: user.email,
    redirect_to: "/inscription/verification",
  });
}

/**
 * POST /api/auth/verify-email
 * Body: { token }
 * Vérifie le token, active le compte si valide, marque le token comme utilisé.
 */
export async function verifyEmail(req, res) {
  const { token } = req.body;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "Token manquant." });
  }

  const entry = await getVerificationToken(token);

  if (!entry) {
    return res.status(400).json({ error: "Lien de vérification invalide." });
  }

  if (entry.used) {
    return res.status(400).json({ error: "Ce lien a déjà été utilisé." });
  }

  if (Date.now() > entry.expiresAt) {
    return res.status(400).json({ error: "Ce lien a expiré. Demandez-en un nouveau." });
  }

  await markTokenUsed(token);
  const user = await markEmailVerified(entry.email);

  // Vérification email réussie = l'utilisateur entre officiellement dans
  // l'application : on ouvre déjà sa session ici (plutôt que d'attendre un
  // login séparé) pour qu'il arrive sur /inscription/profil puis /dashboard
  // déjà connecté.
  if (user) {
    await establishSession(req, res, user.user_id);
  }

  return res.status(200).json({
    success: true,
    email: entry.email,
    redirect_to: "/inscription/profil",
  });
}

/**
 * POST /api/auth/resend-verification
 * Body: { email }
 * Renvoie un email de vérification, avec cooldown de 60s appliqué CÔTÉ
 * SERVEUR (pas seulement côté frontend — un attaquant peut ignorer l'UI).
 * Réponse générique dans tous les cas pour ne pas révéler si l'email existe.
 */
export async function resendVerification(req, res) {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email manquant." });
  }

  const user = await findUserByEmail(email);

  // Toujours répondre pareil, que le compte existe ou non (anti-énumération).
  if (!user || user.email_verified) {
    return res.status(200).json({ success: true, message: GENERIC_RESEND_MESSAGE });
  }

  const lastSent = await getLastResendAt(email);
  const elapsedSeconds = (Date.now() - lastSent) / 1000;

  if (lastSent && elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
    const retryAfter = Math.ceil(RESEND_COOLDOWN_SECONDS - elapsedSeconds);
    return res.status(429).json({
      error: `Veuillez patienter ${retryAfter}s avant de redemander un lien.`,
      retry_after_seconds: retryAfter,
    });
  }

  await issueVerificationToken(email);
  await setLastResendAt(email, Date.now());

  return res.status(200).json({ success: true, message: GENERIC_RESEND_MESSAGE });
}

/**
 * POST /api/auth/login
 * Body: { email, password, redirect_to? }
 * - Verrouille le compte après 5 échecs (15 min de blocage).
 * - Message d'erreur générique identique pour email inconnu / mdp incorrect.
 * - redirect_to validé comme chemin interne uniquement (anti open-redirect).
 */
export async function login(req, res) {
  const { email, password, redirect_to } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: GENERIC_AUTH_ERROR });
  }

  // Vérification anti-robot : honeypot + délai de remplissage (filtre
  // gratuit contre les bots basiques) PUIS Cloudflare Turnstile (vraie
  // analyse de l'activité du navigateur, voir utils/antiBot.js). Une
  // soumission jugée robotique est traitée exactement comme un échec de
  // connexion classique, pour ne jamais révéler à un attaquant qu'il a été
  // détecté.
  if (!passesHumanCheck(req.body)) {
    await registerFailedLogin(email, LOGIN_MAX_ATTEMPTS, LOGIN_LOCKOUT_MINUTES);
    return res.status(401).json({ error: GENERIC_AUTH_ERROR });
  }

  const turnstileValid = await verifyTurnstileToken(req.body.turnstileToken, getClientIp(req));
  if (!turnstileValid) {
    await registerFailedLogin(email, LOGIN_MAX_ATTEMPTS, LOGIN_LOCKOUT_MINUTES);
    return res.status(401).json({ error: "Vérification anti-robot échouée. Rechargez la page et réessayez." });
  }

  const attempts = await getLoginAttempts(email);
  if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
    const minutesLeft = Math.ceil((attempts.lockedUntil - Date.now()) / 60000);
    return res.status(423).json({
      error: `Compte temporairement verrouillé. Réessayez dans ${minutesLeft} min.`,
    });
  }

  const user = await findUserByEmail(email);
  const passwordValid = user ? await verifyPassword(password, user.password_hash) : false;
  const userAgent = req.headers["user-agent"];
  const ip = getClientIp(req);

  if (!user || !passwordValid) {
    await registerFailedLogin(email, LOGIN_MAX_ATTEMPTS, LOGIN_LOCKOUT_MINUTES);
    if (user) {
      // Le journal de connexion nécessite un user_id valide (FK) — une
      // tentative sur un email inconnu n'a donc pas de ligne à rattacher.
      await recordLoginLog({ userId: user.user_id, ip, userAgent, success: false });
    }
    // Même message que l'email soit inconnu ou le mot de passe faux.
    return res.status(401).json({ error: GENERIC_AUTH_ERROR });
  }

  if (!user.email_verified) {
    return res.status(403).json({ error: "Veuillez d'abord vérifier votre adresse email." });
  }

  await resetLoginAttempts(email);
  await recordLoginLog({ userId: user.user_id, ip, userAgent, success: true });
  await establishSession(req, res, user.user_id);
  await tryAssociateVisitor(req, user.user_id);

  return res.status(200).json({
    success: true,
    email: user.email,
    redirect_to: safeRedirect(redirect_to, "/dashboard"),
  });
}

/**
 * GET /api/auth/me
 * Retourne l'utilisateur de la session en cours (cookie httpOnly, voir
 * middleware/auth.js), ou 401 si aucune session valide. Permet au frontend
 * de savoir qu'il est toujours connecté après une fermeture du navigateur,
 * sans dépendre uniquement de sessionStorage (perdu à la fermeture de
 * l'onglet).
 */
export async function me(req, res) {
  if (!req.authUser) {
    return res.status(401).json({ error: "Aucune session active." });
  }
  return res.status(200).json({ user: req.authUser });
}

/**
 * POST /api/auth/logout
 * Invalide la session courante (côté serveur) et efface les cookies.
 */
export async function logout(req, res) {
  const accessToken = req.cookies?.moledi_session;
  if (accessToken) {
    await invalidateSessionByAccessToken(accessToken);
  }
  clearSessionCookies(res);
  return res.status(200).json({ success: true });
}

// ---------------------------------------------------------------------------
// POST /api/auth/change-password
// Body: { email, currentPassword, newPassword }
// Invalide toutes les AUTRES sessions après changement (sécurité), en
// préservant la session du navigateur courant pour ne pas déconnecter
// l'utilisateur juste après qu'il ait changé son propre mot de passe.
// ---------------------------------------------------------------------------
export async function changePassword(req, res) {
  const { email, currentPassword, newPassword } = req.body;

  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ error: "Email, ancien mot de passe et nouveau mot de passe requis." });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: "Le nouveau mot de passe doit faire au minimum 8 caractères." });
  }

  try {
    // Récupérer l'utilisateur
    const { rows } = await pool.query(
      `SELECT user_id, password_hash FROM users WHERE email = $1 AND deleted_at IS NULL`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    const user = rows[0];

    // Vérifier l'ancien mot de passe
    const isValid = await verifyPassword(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    // Vérifier que le nouveau mot de passe != ancien
    const isSame = await verifyPassword(newPassword, user.password_hash);
    if (isSame) {
      return res.status(400).json({ error: "Le nouveau mot de passe doit être différent de l'ancien." });
    }

    // Hasher le nouveau mot de passe
    const newPasswordHash = await hashPassword(newPassword);

    // Mettre à jour le mot de passe
    await pool.query(
      `UPDATE users SET password_hash = $1 WHERE user_id = $2`,
      [newPasswordHash, user.user_id]
    );

    // Invalider toutes les sessions actives SAUF celle du navigateur courant
    // (identifiée par le cookie moledi_session déjà présent sur cette
    // requête) -- force la déconnexion partout ailleurs sans déconnecter
    // l'utilisateur qui vient de faire le changement.
    const currentAccessToken = req.cookies?.moledi_session || null;
    await pool.query(
      `UPDATE user_sessions SET invalidated = TRUE
       WHERE user_id = $1 AND invalidated = FALSE
         AND ($2::text IS NULL OR access_token IS DISTINCT FROM $2::text)`,
      [user.user_id, currentAccessToken]
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Erreur changement mot de passe :", err);
    return res.status(500).json({ error: "Une erreur est survenue." });
  }
}