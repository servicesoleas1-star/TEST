import crypto from "node:crypto";
import { pool } from "../db/pool.js";
import { getDeviceName } from "../utils/deviceName.js";
import { ACCESS_TOKEN_MAX_AGE_MS, REFRESH_TOKEN_MAX_AGE_MS } from "../utils/cookies.js";

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Crée une nouvelle ligne user_sessions (access + refresh token) pour un
 * user_id donné, à la connexion. expires_at gouverne la durée de vie de
 * l'access token (12h, glissante — voir touchSession).
 */
export async function createSession(userId, { ip, browser }) {
  const accessToken = generateToken();
  const refreshToken = generateToken();

  const { rows } = await pool.query(
    `INSERT INTO user_sessions (user_id, access_token, refresh_token, ip, browser, expires_at)
     VALUES ($1, $2, $3, $4, $5, now() + interval '12 hours')
     RETURNING session_id, access_token, refresh_token, expires_at`,
    [userId, accessToken, refreshToken, ip || null, browser || null]
  );
  return rows[0];
}

/**
 * Recherche une session active par access token (non invalidée, non expirée)
 * et retourne l'utilisateur associé. Utilisé par le middleware attachAuthUser
 * sur chaque requête authentifiée.
 */
export async function findSessionByAccessToken(accessToken) {
  const { rows } = await pool.query(
    `SELECT s.session_id, s.user_id, s.expires_at,
            u.email, u.full_name, u.role, u.avatar_url, u.pseudonymised
     FROM user_sessions s
     JOIN users u ON u.user_id = s.user_id
     WHERE s.access_token = $1 AND s.invalidated = FALSE AND s.expires_at > now()
       AND u.deleted_at IS NULL`,
    [accessToken]
  );
  return rows[0] || null;
}

/**
 * Prolonge la fenêtre d'inactivité de 12h (expiration glissante) — appelé à
 * chaque requête authentifiée réussie.
 */
export async function touchSession(sessionId) {
  await pool.query(
    `UPDATE user_sessions SET expires_at = now() + interval '12 hours' WHERE session_id = $1`,
    [sessionId]
  );
}

/**
 * Recherche par refresh token (valide jusqu'à REFRESH_TOKEN_MAX_AGE_MS après
 * sa création, indépendamment de l'expiration de l'access token) — permet de
 * retrouver une session silencieusement après une fermeture de navigateur
 * prolongée, sans forcer une reconnexion, tant que le refresh token n'a pas
 * dépassé sa propre durée de vie ni été invalidé (déconnexion, changement de
 * mot de passe).
 */
export async function findSessionByRefreshToken(refreshToken) {
  const { rows } = await pool.query(
    `SELECT s.session_id, s.user_id, u.email, u.full_name, u.role, u.avatar_url, u.pseudonymised
     FROM user_sessions s
     JOIN users u ON u.user_id = s.user_id
     WHERE s.refresh_token = $1 AND s.invalidated = FALSE
       AND s.created_at > now() - interval '${Math.floor(REFRESH_TOKEN_MAX_AGE_MS / 1000)} seconds'
       AND u.deleted_at IS NULL`,
    [refreshToken]
  );
  return rows[0] || null;
}

/**
 * Remplace l'access token d'une session existante (utilisé lors d'un
 * rafraîchissement silencieux via refresh token) et relance la fenêtre de 12h.
 */
export async function rotateAccessToken(sessionId) {
  const accessToken = generateToken();
  await pool.query(
    `UPDATE user_sessions SET access_token = $2, expires_at = now() + interval '12 hours' WHERE session_id = $1`,
    [sessionId, accessToken]
  );
  return accessToken;
}

export async function invalidateSessionByAccessToken(accessToken) {
  await pool.query(`UPDATE user_sessions SET invalidated = TRUE WHERE access_token = $1`, [accessToken]);
}

/**
 * Journal de connexion — une ligne par tentative (succès ou échec), avec le
 * nom d'appareil déduit du User-Agent (paramètres du compte > journal de
 * connexion).
 */
export async function recordLoginLog({ userId, ip, userAgent, success }) {
  await pool.query(
    `INSERT INTO login_logs (user_id, ip, browser, device_name, success)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, ip || null, userAgent || null, getDeviceName(userAgent), success]
  );
}

export { ACCESS_TOKEN_MAX_AGE_MS };
