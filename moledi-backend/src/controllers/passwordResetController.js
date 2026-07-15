import { generateSecureToken } from "../utils/tokens.js";
import { hashPassword } from "../utils/password.js";
import { sendMail } from "../utils/mailer.js";
import {
  findUserByEmail,
  invalidatePasswordResetTokens,
  savePasswordResetToken,
  getPasswordResetToken,
  markPasswordResetTokenUsed,
  updatePassword,
  invalidateAllSessions,
  resetLoginAttempts,
} from "../store/pgStore.js";

const RESET_TOKEN_TTL_HOURS = 1; // "token valide 1h" — critère d'acceptation

// Même message quel que soit le cas, pour ne jamais révéler si un email
// existe en base (critère : "réponse identique qu'un compte existe ou non").
const GENERIC_RESET_MESSAGE =
  "Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé.";

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 * Toujours la même réponse, que le compte existe ou non. Un seul token actif
 * à la fois : tout token précédent non utilisé est invalidé avant d'en créer
 * un nouveau.
 */
export async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    // Toujours générique, même sur une erreur de saisie — ne pas donner
    // d'indice sur la validité du format attendu vs l'existence du compte.
    return res.status(200).json({ success: true, message: GENERIC_RESET_MESSAGE });
  }

  const user = await findUserByEmail(email);

  if (user) {
    await invalidatePasswordResetTokens(email);
    const token = generateSecureToken();
    await savePasswordResetToken(token, email, RESET_TOKEN_TTL_HOURS);

    const link = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reinitialiser-mot-de-passe?token=${token}`;
    try {
      await sendMail({
        to: email,
        subject: "Réinitialisation de votre mot de passe — Moledi Events",
        html: `<p>Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe (valable ${RESET_TOKEN_TTL_HOURS}h) :</p><p><a href="${link}">${link}</a></p><p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>`,
      });
    } catch (err) {
      console.warn("Envoi de l'email de réinitialisation échoué :", err.message);
    }
  }

  // Réponse strictement identique dans les deux cas.
  return res.status(200).json({ success: true, message: GENERIC_RESET_MESSAGE });
}

/**
 * POST /api/auth/reset-password
 * Body: { token, newPassword }
 * Valide le token (existe, non utilisé, non expiré), hache le nouveau mot
 * de passe, invalide TOUTES les sessions actives de l'utilisateur, et
 * réinitialise le compteur de tentatives de connexion échouées.
 */
export async function resetPassword(req, res) {
  const { token, newPassword } = req.body;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "Lien de réinitialisation invalide." });
  }

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères." });
  }

  const entry = await getPasswordResetToken(token);

  if (!entry) {
    return res.status(400).json({ error: "Lien de réinitialisation invalide." });
  }

  if (entry.used) {
    return res.status(400).json({ error: "Ce lien a déjà été utilisé." });
  }

  if (Date.now() > entry.expiresAt) {
    return res.status(400).json({ error: "Ce lien a expiré. Demandez-en un nouveau." });
  }

  const passwordHash = await hashPassword(newPassword);

  await updatePassword(entry.email, passwordHash);
  await markPasswordResetTokenUsed(token);
  await invalidateAllSessions(entry.email);
  await resetLoginAttempts(entry.email); // repart sur une base saine après réinitialisation

  return res.status(200).json({ success: true, redirect_to: "/mot-de-passe-modifie" });
}
