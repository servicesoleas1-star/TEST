// ---------------------------------------------------------------------------
// Store PostgreSQL — remplace memoryStore.js maintenant que le schéma existe
// (voir db/migrations/02_auth_users.sql et 14_auth_security.sql).
// Même interface que memoryStore.js pour que authController.js n'ait pas
// à changer.
// ---------------------------------------------------------------------------

import { pool } from "../db/pool.js";

export async function findUserByEmail(email) {
  const { rows } = await pool.query(
    `SELECT user_id, email, password_hash, email_verified,
            failed_login_attempts, locked_until, last_verification_sent_at
     FROM users WHERE email = $1 AND deleted_at IS NULL`,
    [email]
  );
  return rows[0] || null;
}

export async function createUser({
  email,
  passwordHash,
  fullName = "Utilisateur",
  role = "ORGANIZER",
  phone = null,
  phoneCountryCode = null,
  acquisitionSourceId = null,
}) {
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, full_name, role, phone, phone_country_code, acquisition_source_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING user_id, email, password_hash, email_verified`,
    [email, passwordHash, fullName, role, phone, phoneCountryCode, acquisitionSourceId]
  );
  return rows[0];
}

export async function markEmailVerified(email) {
  const { rows } = await pool.query(
    `UPDATE users SET email_verified = TRUE WHERE email = $1 RETURNING user_id, email`,
    [email]
  );
  return rows[0] || null;
}

export async function saveVerificationToken(token, email, ttlHours) {
  const user = await findUserByEmail(email);
  if (!user) return; // ne devrait pas arriver (appelant vérifie déjà)

  await pool.query(
    `INSERT INTO email_verification_tokens (token, user_id, expires_at)
     VALUES ($1, $2, now() + ($3 || ' hours')::interval)`,
    [token, user.user_id, ttlHours]
  );
}

export async function getVerificationToken(token) {
  const { rows } = await pool.query(
    `SELECT t.token, t.expires_at, t.used, u.email
     FROM email_verification_tokens t
     JOIN users u ON u.user_id = t.user_id
     WHERE t.token = $1`,
    [token]
  );
  if (!rows[0]) return null;
  return {
    email: rows[0].email,
    expiresAt: new Date(rows[0].expires_at).getTime(),
    used: rows[0].used,
  };
}

export async function markTokenUsed(token) {
  await pool.query(`UPDATE email_verification_tokens SET used = TRUE WHERE token = $1`, [token]);
}

export async function invalidateTokensForEmail(email) {
  await pool.query(
    `DELETE FROM email_verification_tokens
     WHERE used = FALSE
       AND user_id = (SELECT user_id FROM users WHERE email = $1)`,
    [email]
  );
}

export async function getLastResendAt(email) {
  const user = await findUserByEmail(email);
  if (!user || !user.last_verification_sent_at) return 0;
  return new Date(user.last_verification_sent_at).getTime();
}

export async function setLastResendAt(email, timestampMs) {
  await pool.query(
    `UPDATE users SET last_verification_sent_at = to_timestamp($1 / 1000.0) WHERE email = $2`,
    [timestampMs, email]
  );
}

export async function getLoginAttempts(email) {
  const user = await findUserByEmail(email);
  if (!user) return { count: 0, lockedUntil: 0 };
  return {
    count: user.failed_login_attempts || 0,
    lockedUntil: user.locked_until ? new Date(user.locked_until).getTime() : 0,
  };
}

export async function registerFailedLogin(email, maxAttempts, lockoutMinutes) {
  const current = await getLoginAttempts(email);
  const newCount = current.count + 1;

  if (newCount >= maxAttempts) {
    await pool.query(
      `UPDATE users
       SET failed_login_attempts = 0,
           locked_until = now() + ($2 || ' minutes')::interval
       WHERE email = $1`,
      [email, lockoutMinutes]
    );
    return { count: 0, lockedUntil: Date.now() + lockoutMinutes * 60 * 1000 };
  }

  await pool.query(`UPDATE users SET failed_login_attempts = $1 WHERE email = $2`, [newCount, email]);
  return { count: newCount, lockedUntil: 0 };
}

export async function resetLoginAttempts(email) {
  await pool.query(
    `UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE email = $1`,
    [email]
  );
}

/**
 * Enregistre (ou met à jour) les préférences d'onboarding d'un utilisateur.
 * user_preferences a user_id en PRIMARY KEY 1-1 avec users — un simple
 * UPSERT couvre à la fois la première complétion et une modification future.
 */
export async function upsertPreferences(email, { eventTypes, frequency, country }) {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const { rows } = await pool.query(
    `INSERT INTO user_preferences (user_id, preferred_event_types, organization_frequency, activity_country)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id) DO UPDATE
       SET preferred_event_types  = EXCLUDED.preferred_event_types,
           organization_frequency = EXCLUDED.organization_frequency,
           activity_country       = EXCLUDED.activity_country
     RETURNING user_id, preferred_event_types, organization_frequency, activity_country`,
    [user.user_id, eventTypes || [], frequency || null, country || null]
  );
  return rows[0];
}

// ---------------------------------------------------------------------------
// Réinitialisation de mot de passe — utilise la table générique `tokens`
// (type = 'PASSWORD_RESET'), prévue par le schéma pour tous les liens à
// usage unique (contrairement à email_verification_tokens, dédiée, gardée
// telle quelle pour ne pas casser ce qui est déjà en production).
// ---------------------------------------------------------------------------

export async function invalidatePasswordResetTokens(email) {
  await pool.query(
    `DELETE FROM tokens
     WHERE type = 'PASSWORD_RESET'
       AND used = FALSE
       AND user_id = (SELECT user_id FROM users WHERE email = $1)`,
    [email]
  );
}

export async function savePasswordResetToken(token, email, ttlHours) {
  const user = await findUserByEmail(email);
  if (!user) return;

  await pool.query(
    `INSERT INTO tokens (user_id, value, type, expires_at)
     VALUES ($1, $2, 'PASSWORD_RESET', now() + ($3 || ' hours')::interval)`,
    [user.user_id, token, ttlHours]
  );
}

export async function getPasswordResetToken(token) {
  const { rows } = await pool.query(
    `SELECT t.value, t.expires_at, t.used, u.email
     FROM tokens t
     JOIN users u ON u.user_id = t.user_id
     WHERE t.value = $1 AND t.type = 'PASSWORD_RESET'`,
    [token]
  );
  if (!rows[0]) return null;
  return {
    email: rows[0].email,
    expiresAt: new Date(rows[0].expires_at).getTime(),
    used: rows[0].used,
  };
}

export async function markPasswordResetTokenUsed(token) {
  await pool.query(`UPDATE tokens SET used = TRUE WHERE value = $1 AND type = 'PASSWORD_RESET'`, [
    token,
  ]);
}

export async function updatePassword(email, passwordHash) {
  await pool.query(`UPDATE users SET password_hash = $1 WHERE email = $2`, [passwordHash, email]);
}

/**
 * Invalide toutes les sessions actives d'un utilisateur — appelé après un
 * changement de mot de passe réussi, pour forcer une reconnexion partout.
 */
export async function invalidateAllSessions(email) {
  await pool.query(
    `UPDATE user_sessions SET invalidated = TRUE
     WHERE invalidated = FALSE
       AND user_id = (SELECT user_id FROM users WHERE email = $1)`,
    [email]
  );
}
