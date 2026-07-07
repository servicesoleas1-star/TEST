import { pool } from "../db/pool.js";

// ---------------------------------------------------------------------------
// Préférences utilisateur : langue, notifications, newsletter.
// Noms de colonnes alignés strictement sur le schéma réel
// (db/migrations/02_auth_users.sql) : pas de colonne `updated_at` sur cette
// table, et les notifications sont groupées par évènement (validation,
// rejection, payment, payout, ticket) — pas par thème "campagne/sécurité"
// comme le laissait supposer une version précédente de ce fichier.
// ---------------------------------------------------------------------------

const VALID_LANGUAGES = ["FR", "EN"];
const VALID_NEWSLETTER_FREQUENCIES = ["INSTANT", "DAILY", "WEEKLY", "NEVER"];

const SELECT_COLUMNS = `
  user_id,
  language,
  notif_email_validation,
  notif_email_rejection,
  notif_email_payment,
  notif_email_payout,
  notif_email_ticket,
  notif_whatsapp_validation,
  notif_whatsapp_payment,
  notif_whatsapp_payout,
  newsletter_frequency
`;

/**
 * Récupère les préférences d'un utilisateur. Les crée avec les valeurs par
 * défaut du schéma si elles n'existent pas encore (ex: utilisateur connecté
 * sans être passé par la complétion de profil, qui peut aussi créer la ligne
 * via `upsertPreferences` dans pgStore.js pour ses propres colonnes).
 */
export async function getUserPreferences(userId) {
  const { rows } = await pool.query(
    `SELECT ${SELECT_COLUMNS} FROM user_preferences WHERE user_id = $1`,
    [userId]
  );

  if (rows.length === 0) {
    return await createDefaultPreferences(userId);
  }

  return rows[0];
}

/**
 * Crée la ligne de préférences avec uniquement les valeurs par défaut du
 * schéma (tous les autres champs ont un DEFAULT en base). ON CONFLICT DO
 * NOTHING gère le cas où `upsertPreferences` (pgStore.js, onboarding) aurait
 * déjà créé la ligne entre-temps — on relit alors simplement ce qui existe.
 */
async function createDefaultPreferences(userId) {
  const { rows } = await pool.query(
    `INSERT INTO user_preferences (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING
     RETURNING ${SELECT_COLUMNS}`,
    [userId]
  );

  if (rows[0]) return rows[0];

  const { rows: existing } = await pool.query(
    `SELECT ${SELECT_COLUMNS} FROM user_preferences WHERE user_id = $1`,
    [userId]
  );
  return existing[0];
}

/**
 * Met à jour les préférences d'un utilisateur.
 */
export async function updateUserPreferences(userId, preferences) {
  const {
    language,
    notif_email_validation,
    notif_email_rejection,
    notif_email_payment,
    notif_email_payout,
    notif_email_ticket,
    notif_whatsapp_validation,
    notif_whatsapp_payment,
    notif_whatsapp_payout,
    newsletter_frequency,
  } = preferences;

  if (language && !VALID_LANGUAGES.includes(language)) {
    throw new Error("Langue invalide (FR ou EN).");
  }

  if (newsletter_frequency && !VALID_NEWSLETTER_FREQUENCIES.includes(newsletter_frequency)) {
    throw new Error("Fréquence newsletter invalide (INSTANT, DAILY, WEEKLY ou NEVER).");
  }

  const { rows } = await pool.query(
    `UPDATE user_preferences
     SET language = COALESCE($2, language),
         notif_email_validation = COALESCE($3, notif_email_validation),
         notif_email_rejection = COALESCE($4, notif_email_rejection),
         notif_email_payment = COALESCE($5, notif_email_payment),
         notif_email_payout = COALESCE($6, notif_email_payout),
         notif_email_ticket = COALESCE($7, notif_email_ticket),
         notif_whatsapp_validation = COALESCE($8, notif_whatsapp_validation),
         notif_whatsapp_payment = COALESCE($9, notif_whatsapp_payment),
         notif_whatsapp_payout = COALESCE($10, notif_whatsapp_payout),
         newsletter_frequency = COALESCE($11, newsletter_frequency)
     WHERE user_id = $1
     RETURNING ${SELECT_COLUMNS}`,
    [
      userId,
      language || null,
      notif_email_validation === undefined ? null : notif_email_validation,
      notif_email_rejection === undefined ? null : notif_email_rejection,
      notif_email_payment === undefined ? null : notif_email_payment,
      notif_email_payout === undefined ? null : notif_email_payout,
      notif_email_ticket === undefined ? null : notif_email_ticket,
      notif_whatsapp_validation === undefined ? null : notif_whatsapp_validation,
      notif_whatsapp_payment === undefined ? null : notif_whatsapp_payment,
      notif_whatsapp_payout === undefined ? null : notif_whatsapp_payout,
      newsletter_frequency || null,
    ]
  );

  if (rows.length === 0) {
    await createDefaultPreferences(userId);
    return updateUserPreferences(userId, preferences);
  }

  return rows[0];
}