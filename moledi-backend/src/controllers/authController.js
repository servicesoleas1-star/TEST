import { generateSecureToken } from "../utils/tokens.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { safeRedirect } from "../utils/redirect.js";
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

/**
 * Émet un nouveau token de vérification pour un email donné et l'envoie
 * (ici : log console — à remplacer par un vrai envoi SMTP/service d'emailing).
 * Invalide tout token précédent non utilisé pour cet email.
 */
async function issueVerificationToken(email) {
  await invalidateTokensForEmail(email);
  const token = generateSecureToken();
  await saveVerificationToken(token, email, TOKEN_TTL_HOURS);

  // TODO: remplacer par un vrai envoi d'email (SendGrid, SES, Postmark...)
  console.log(
    `[EMAIL] Lien de vérification pour ${email} : /inscription/verification?token=${token}`
  );

  return token;
}

/**
 * POST /api/auth/register
 * Body: { fullName, email, password }
 * Crée le compte (role=ORGANIZER par défaut, seul rôle accessible via ce
 * formulaire public — ADMIN/SUPER_ADMIN sont provisionnés autrement) et
 * envoie immédiatement un lien de vérification email, comme le fait déjà
 * le flux de renvoi (resendVerification) — même mécanisme, même cooldown.
 */
export async function register(req, res) {
  const { fullName, email, password } = req.body;

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
  });

  await issueVerificationToken(user.email);
  await setLastResendAt(user.email, Date.now());

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
  await markEmailVerified(entry.email);

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

  const attempts = await getLoginAttempts(email);
  if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
    const minutesLeft = Math.ceil((attempts.lockedUntil - Date.now()) / 60000);
    return res.status(423).json({
      error: `Compte temporairement verrouillé. Réessayez dans ${minutesLeft} min.`,
    });
  }

  const user = await findUserByEmail(email);
  const passwordValid = user ? await verifyPassword(password, user.password_hash) : false;

  if (!user || !passwordValid) {
    await registerFailedLogin(email, LOGIN_MAX_ATTEMPTS, LOGIN_LOCKOUT_MINUTES);
    // Même message que l'email soit inconnu ou le mot de passe faux.
    return res.status(401).json({ error: GENERIC_AUTH_ERROR });
  }

  if (!user.email_verified) {
    return res.status(403).json({ error: "Veuillez d'abord vérifier votre adresse email." });
  }

  await resetLoginAttempts(email);

  return res.status(200).json({
    success: true,
    email: user.email,
    redirect_to: safeRedirect(redirect_to, "/dashboard"),
  });
}

// ---------------------------------------------------------------------------
// POST /api/auth/change-password
// Body: { email, currentPassword, newPassword }
// Invalide toutes les sessions après changement
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

    // Invalider TOUTES les sessions actives (sécurité : force la déconnexion partout)
    await pool.query(
      `UPDATE user_sessions SET invalidated = TRUE WHERE user_id = $1 AND invalidated = FALSE`,
      [user.user_id]
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Erreur changement mot de passe :", err);
    return res.status(500).json({ error: "Une erreur est survenue." });
  }
}