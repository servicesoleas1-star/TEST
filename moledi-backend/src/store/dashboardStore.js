import crypto from "node:crypto";
import { pool } from "../db/pool.js";

// ---------------------------------------------------------------------------
// Identification utilisateur : en attendant un vrai système de session/JWT
// (ticket AUTH dédié non encore construit), tous les endpoints dashboard
// identifient l'utilisateur par email en paramètre — comme le reste du
// backend jusqu'ici (voir authController.js, profileController.js).
// ---------------------------------------------------------------------------

export async function findUserByEmail(email) {
  const { rows } = await pool.query(
    `SELECT user_id, email, full_name, pseudonymised FROM users WHERE email = $1 AND deleted_at IS NULL`,
    [email]
  );
  return rows[0] || null;
}

/**
 * Profil complet (dashboard V2 > Mon profil) -- inclut les champs non
 * couverts par findUserByEmail (utilisé partout ailleurs pour l'auth
 * légère) : téléphone, avatar, numéro mobile money, date d'inscription, +
 * quelques statistiques globales agrégées.
 */
export async function getFullProfile(userId) {
  const { rows } = await pool.query(
    `SELECT user_id, email, full_name, phone, phone_country_code, avatar_url,
            payout_phone, payout_operator, created_at, role
     FROM users WHERE user_id = $1 AND deleted_at IS NULL`,
    [userId]
  );
  const user = rows[0];
  if (!user) return null;

  const { rows: statRows } = await pool.query(
    `SELECT
       (SELECT count(*) FROM polls p JOIN campaigns c ON c.campaign_id = p.poll_id WHERE c.owner_user_id = $1)::int AS total_campaigns,
       (SELECT count(*) FROM votes v JOIN campaigns c ON c.campaign_id = v.poll_id WHERE c.owner_user_id = $1 AND v.status = 'COUNTED')::int AS total_votes,
       (SELECT COALESCE(sum(net_organizer), 0) FROM transactions t JOIN campaigns c ON c.campaign_id = t.campaign_id WHERE c.owner_user_id = $1 AND t.status = 'CONFIRMED')::numeric AS total_revenue,
       (SELECT count(*) FROM payout_requests WHERE user_id = $1 AND status = 'COMPLETED')::int AS total_payouts`,
    [userId]
  );

  return { ...user, stats: statRows[0] };
}

/**
 * Configure/modifie le numéro Mobile Money de reversement -- pré-configuré
 * dans le profil, utilisé ensuite tel quel par la demande de retrait (voir
 * Spec Fonctionnelle : "Numéro Mobile Money de destination — pré-configuré
 * dans le profil, non modifiable ici [dans le formulaire de retrait]").
 * L'ancien numéro est conservé dans payout_phone_history pour piste d'audit
 * anti-fraude (déjà prévu par le schéma, users.payout_phone_history).
 */
export async function updatePayoutPhone(userId, { phone, operator }) {
  if (!phone || !phone.trim()) throw new Error("Numéro Mobile Money requis.");

  const { rows } = await pool.query(
    `UPDATE users SET
       payout_phone_history = CASE
         WHEN payout_phone IS NOT NULL AND payout_phone <> $2
           THEN array_append(payout_phone_history, payout_phone)
         ELSE payout_phone_history
       END,
       payout_phone = $2,
       payout_operator = COALESCE($3, payout_operator)
     WHERE user_id = $1
     RETURNING payout_phone, payout_operator, payout_phone_history`,
    [userId, phone.trim(), operator || null]
  );
  return rows[0] || null;
}

export async function updateProfile(userId, { fullName, phone, phoneCountryCode, avatarUrl }) {
  const { rows } = await pool.query(
    `UPDATE users SET
       full_name = COALESCE($2, full_name),
       phone = COALESCE($3, phone),
       phone_country_code = COALESCE($4, phone_country_code),
       avatar_url = COALESCE($5, avatar_url)
     WHERE user_id = $1
     RETURNING user_id, email, full_name, phone, phone_country_code, avatar_url`,
    [userId, fullName || null, phone || null, phoneCountryCode || null, avatarUrl || null]
  );
  return rows[0] || null;
}

// ---------------------------------------------------------------------------
// Widgets — résumé
// ---------------------------------------------------------------------------

export async function getBalance(userId) {
  const { rows } = await pool.query(
    `SELECT available_amount, reserved_amount FROM organizer_balances WHERE user_id = $1`,
    [userId]
  );
  return rows[0] || { available_amount: 0, reserved_amount: 0 };
}

export async function countActiveCampaigns(userId) {
  // MVP : seuls les scrutins (polls) sont implémentés. La requête est
  // volontairement écrite pour être étendue aux autres types de campagne
  // (events, fundraisers...) au fur et à mesure de leur construction —
  // "les types de campagnes affichés s'adaptent à la version active du site".
  const { rows } = await pool.query(
    `SELECT count(*)::int AS count
     FROM polls p
     JOIN campaigns c ON c.campaign_id = p.poll_id
     WHERE c.owner_user_id = $1 AND p.status = 'PUBLISHED'`,
    [userId]
  );
  return rows[0].count;
}

export async function sumVotesThisMonth(userId) {
  const { rows } = await pool.query(
    `SELECT count(v.vote_id)::int AS count
     FROM votes v
     JOIN campaigns c ON c.campaign_id = v.poll_id
     WHERE c.owner_user_id = $1
       AND v.status = 'COUNTED'
       AND date_trunc('month', v.created_at) = date_trunc('month', now())`,
    [userId]
  );
  return rows[0].count;
}

export async function sumRevenueThisMonth(userId) {
  const { rows } = await pool.query(
    `SELECT COALESCE(sum(t.net_organizer), 0) AS total
     FROM transactions t
     JOIN campaigns c ON c.campaign_id = t.campaign_id
     WHERE c.owner_user_id = $1
       AND t.status = 'CONFIRMED'
       AND date_trunc('month', t.confirmed_at) = date_trunc('month', now())`,
    [userId]
  );
  return rows[0].total;
}

export async function countUnreadAlerts(userId) {
  const { rows } = await pool.query(
    `SELECT count(*)::int AS count FROM notifications WHERE user_id = $1 AND read = FALSE`,
    [userId]
  );
  return rows[0].count;
}

// ---------------------------------------------------------------------------
// Graphiques revenus / votes (agrégation quotidienne sur une période)
// ---------------------------------------------------------------------------

export async function getRevenueChartData(userId, days = 30) {
  const { rows } = await pool.query(
    `SELECT date_trunc('day', t.confirmed_at)::date AS day, COALESCE(sum(t.net_organizer), 0) AS amount
     FROM transactions t
     JOIN campaigns c ON c.campaign_id = t.campaign_id
     WHERE c.owner_user_id = $1
       AND t.status = 'CONFIRMED'
       AND t.confirmed_at >= now() - ($2 || ' days')::interval
     GROUP BY day
     ORDER BY day ASC`,
    [userId, days]
  );
  return rows;
}

export async function getVotesChartData(userId, days = 30) {
  const { rows } = await pool.query(
    `SELECT date_trunc('day', v.created_at)::date AS day, count(*)::int AS count
     FROM votes v
     JOIN campaigns c ON c.campaign_id = v.poll_id
     WHERE c.owner_user_id = $1
       AND v.status = 'COUNTED'
       AND v.created_at >= now() - ($2 || ' days')::interval
     GROUP BY day
     ORDER BY day ASC`,
    [userId, days]
  );
  return rows;
}

// ---------------------------------------------------------------------------
// Campagnes (paginées côté serveur)
// ---------------------------------------------------------------------------

export async function getPaginatedCampaigns(userId, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  const { rows } = await pool.query(
    `SELECT p.poll_id AS campaign_id, p.title, p.status, p.vote_type, p.slug, p.created_at,
            p.cover_photo_url,
            (SELECT count(*) FROM votes v WHERE v.poll_id = p.poll_id AND v.status = 'COUNTED') AS vote_count
     FROM polls p
     JOIN campaigns c ON c.campaign_id = p.poll_id
     WHERE c.owner_user_id = $1
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, pageSize, offset]
  );
  const { rows: countRows } = await pool.query(
    `SELECT count(*)::int AS total FROM polls p
     JOIN campaigns c ON c.campaign_id = p.poll_id
     WHERE c.owner_user_id = $1`,
    [userId]
  );
  return { items: rows, total: countRows[0].total, page, pageSize };
}

/**
 * Duplique une campagne en brouillon — critère : "ne déclenche PAS de
 * notification admin" (contrairement à la publication d'une nouvelle
 * campagne, qui elle notifierait l'admin pour modération).
 */
export async function duplicateCampaign(userId, campaignId) {
  const { rows } = await pool.query(
    `SELECT * FROM polls p
     JOIN campaigns c ON c.campaign_id = p.poll_id
     WHERE p.poll_id = $1 AND c.owner_user_id = $2`,
    [campaignId, userId]
  );
  const original = rows[0];
  if (!original) return null;

  const newCampaignId = crypto.randomUUID();
  const newSlug = `${original.slug}-copie-${Date.now().toString(36)}`;

  await pool.query(
    `INSERT INTO campaigns (campaign_id, campaign_type, owner_user_id)
     VALUES ($1, 'POLL', $2)`,
    [newCampaignId, userId]
  );

  await pool.query(
    `INSERT INTO polls
       (poll_id, user_id, slug, title, description, vote_type, price_per_vote,
        max_votes_per_visitor, otp_enabled, results_visibility, open_at, close_at,
        timezone, status)
     VALUES
       ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now(), now() + interval '30 days', $11, 'DRAFT')`,
    [
      newCampaignId,
      userId,
      newSlug,
      `${original.title} (copie)`,
      original.description,
      original.vote_type,
      original.price_per_vote,
      original.max_votes_per_visitor,
      original.otp_enabled,
      original.results_visibility,
      original.timezone,
    ]
  );

  // Volontairement AUCUN appel à une fonction de notification ici — c'est
  // le cœur du critère d'acceptation testé.
  return { campaign_id: newCampaignId, slug: newSlug, status: "DRAFT" };
}

// ---------------------------------------------------------------------------
// Mon activité (votes + transactions récents sur les campagnes de l'organisateur)
// ---------------------------------------------------------------------------

export async function getPaginatedActivity(userId, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  const { rows } = await pool.query(
    `SELECT 'VOTE' AS activity_type, v.vote_id AS id, v.created_at,
            p.title AS campaign_title, v.vote_type AS detail
     FROM votes v
     JOIN campaigns c ON c.campaign_id = v.poll_id
     JOIN polls p ON p.poll_id = v.poll_id
     WHERE c.owner_user_id = $1 AND v.status = 'COUNTED'
     ORDER BY v.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, pageSize, offset]
  );
  const { rows: countRows } = await pool.query(
    `SELECT count(*)::int AS total FROM votes v
     JOIN campaigns c ON c.campaign_id = v.poll_id
     WHERE c.owner_user_id = $1 AND v.status = 'COUNTED'`,
    [userId]
  );
  return { items: rows, total: countRows[0].total, page, pageSize };
}

// ---------------------------------------------------------------------------
// "Mon activité" (dashboard V2) — PROPRES actions de l'organisateur en tant
// que participant/électeur sur la plateforme (votes qu'il a lui-même
// effectués), retrouvées via le visitor_id lié à son compte
// (visitors.account_id), pas les votes reçus sur ses propres campagnes
// (voir getPaginatedActivity ci-dessus, qui répond à un besoin différent :
// le fil "Activité récente" de la page d'accueil organisateur).
// ---------------------------------------------------------------------------

export async function getPaginatedOwnVotes(userId, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  const { rows } = await pool.query(
    `SELECT v.vote_id, v.created_at, v.status, v.vote_type,
            p.title AS poll_title, p.slug AS poll_slug,
            cd.display_name AS candidate_name
     FROM votes v
     JOIN visitors vis ON vis.visitor_id = v.visitor_id
     JOIN polls p ON p.poll_id = v.poll_id
     JOIN candidates cd ON cd.candidate_id = v.candidate_id
     WHERE vis.account_id = $1
     ORDER BY v.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, pageSize, offset]
  );
  const { rows: countRows } = await pool.query(
    `SELECT count(*)::int AS total FROM votes v
     JOIN visitors vis ON vis.visitor_id = v.visitor_id
     WHERE vis.account_id = $1`,
    [userId]
  );
  return { items: rows, total: countRows[0].total, page, pageSize };
}

// ---------------------------------------------------------------------------
// Classement des candidats (pour un scrutin donné, vue organisateur — pas
// soumise à la politique de visibilité publique puisque c'est son propre
// tableau de bord).
// ---------------------------------------------------------------------------

export async function getLeaderboard(userId, campaignId) {
  const { rows } = await pool.query(
    `SELECT cd.candidate_id, cd.display_name, count(v.vote_id)::int AS vote_count
     FROM candidates cd
     JOIN polls p ON p.poll_id = cd.poll_id
     JOIN campaigns c ON c.campaign_id = p.poll_id
     LEFT JOIN votes v ON v.candidate_id = cd.candidate_id AND v.status = 'COUNTED'
     WHERE c.owner_user_id = $1 AND cd.poll_id = $2
     GROUP BY cd.candidate_id, cd.display_name
     ORDER BY vote_count DESC`,
    [userId, campaignId]
  );
  return rows;
}

// ---------------------------------------------------------------------------
// Notifications & journal de connexion (paginés)
// ---------------------------------------------------------------------------

export async function getPaginatedNotifications(userId, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  const { rows } = await pool.query(
    `SELECT notif_id, type, title, message, read, created_at
     FROM notifications WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, pageSize, offset]
  );
  const { rows: countRows } = await pool.query(
    `SELECT count(*)::int AS total FROM notifications WHERE user_id = $1`,
    [userId]
  );
  return { items: rows, total: countRows[0].total, page, pageSize };
}

/**
 * Voir commentaire de colonne notifications.read : "Passé à TRUE
 * automatiquement quand l'utilisateur ouvre le panneau de notifications."
 * Appelé après getPaginatedNotifications sur la première page uniquement
 * (voir controller) pour ne marquer comme lu que ce qui vient d'être vu.
 */
export async function markNotificationsRead(userId, notifIds) {
  if (!notifIds || notifIds.length === 0) return;
  await pool.query(
    `UPDATE notifications SET read = TRUE WHERE user_id = $1 AND notif_id = ANY($2::uuid[])`,
    [userId, notifIds]
  );
}

/**
 * Bouton "Tout marquer comme lu" (dashboard V2 > Notifications) — marque
 * TOUTES les notifications non lues d'un coup, contrairement à
 * markNotificationsRead qui ne marque que la page consultée.
 */
export async function markAllNotificationsRead(userId) {
  await pool.query(`UPDATE notifications SET read = TRUE WHERE user_id = $1 AND read = FALSE`, [userId]);
}

export async function getPaginatedLoginLogs(userId, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  const { rows } = await pool.query(
    `SELECT log_id, ip, browser, device_name, success, created_at
     FROM login_logs WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, pageSize, offset]
  );
  const { rows: countRows } = await pool.query(
    `SELECT count(*)::int AS total FROM login_logs WHERE user_id = $1`,
    [userId]
  );
  return { items: rows, total: countRows[0].total, page, pageSize };
}

// ---------------------------------------------------------------------------
// Retrait (payout) — critère : bloqué si solde insuffisant OU blocage actif
// ---------------------------------------------------------------------------

export async function hasActivePayoutBlock(userId) {
  const { rows } = await pool.query(
    `SELECT block_id, reason FROM payout_blocks
     WHERE active = TRUE AND (user_id = $1 OR user_id IS NULL)
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

export async function createPayoutRequest(userId, amount, phone, aggregatorId) {
  const { rows } = await pool.query(
    `INSERT INTO payout_requests (user_id, requested_amount, net_amount, payout_phone, aggregator_id)
     VALUES ($1, $2, $2, $3, $4)
     RETURNING payout_id, requested_amount, status, requested_at`,
    [userId, amount, phone, aggregatorId]
  );
  // Le montant demandé passe de "disponible" à "réservé" en attendant l'exécution.
  await pool.query(
    `UPDATE organizer_balances
     SET available_amount = available_amount - $2,
         reserved_amount = reserved_amount + $2,
         updated_at = now()
     WHERE user_id = $1`,
    [userId, amount]
  );
  return rows[0];
}

// ---------------------------------------------------------------------------
// Export financier — URL signée temporaire (≤ 1h)
// ---------------------------------------------------------------------------

const exportTokens = new Map(); // token -> { userId, expiresAt } — voir note ci-dessous

/**
 * Note sur la persistance : comme pour paidVoteContext (voir paidVoteController.js),
 * ce contexte en mémoire est suffisant pour la durée de vie très courte
 * d'un export (≤ 1h) mais devrait être remplacé par une table dédiée
 * (ou un JWT signé auto-porteur) en production, pour survivre à un redémarrage.
 */
export function generateSignedExportToken(userId) {
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1h — critère "durée ≤ 1h"
  exportTokens.set(token, { userId, expiresAt });
  return { token, expiresAt };
}

export function validateSignedExportToken(token) {
  const entry = exportTokens.get(token);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    exportTokens.delete(token);
    return null;
  }
  return entry;
}

/**
 * Historique des revenus paginé (dashboard V2 > Finances > Historique) --
 * même données que getTransactionsForExport mais paginées pour l'affichage
 * écran plutôt que pour un export complet.
 */
export async function getPaginatedTransactions(userId, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  const { rows } = await pool.query(
    `SELECT t.transaction_id, t.gross_amount, t.moledi_commission, t.net_organizer,
            t.status, t.payment_method, t.initiated_at, t.confirmed_at,
            p.title AS campaign_title
     FROM transactions t
     JOIN campaigns c ON c.campaign_id = t.campaign_id
     LEFT JOIN polls p ON p.poll_id = t.campaign_id
     WHERE c.owner_user_id = $1
     ORDER BY t.initiated_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, pageSize, offset]
  );
  const { rows: countRows } = await pool.query(
    `SELECT count(*)::int AS total FROM transactions t
     JOIN campaigns c ON c.campaign_id = t.campaign_id
     WHERE c.owner_user_id = $1`,
    [userId]
  );
  return { items: rows, total: countRows[0].total, page, pageSize };
}

/**
 * Reversements (payout_requests) paginés (dashboard V2 > Finances > Reversements).
 */
export async function getPaginatedPayouts(userId, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  const { rows } = await pool.query(
    `SELECT payout_id, requested_amount, net_amount, payout_phone, status, requested_at, executed_at
     FROM payout_requests
     WHERE user_id = $1
     ORDER BY requested_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, pageSize, offset]
  );
  const { rows: countRows } = await pool.query(
    `SELECT count(*)::int AS total FROM payout_requests WHERE user_id = $1`,
    [userId]
  );
  return { items: rows, total: countRows[0].total, page, pageSize };
}

export async function getTransactionsForExport(userId) {
  const { rows } = await pool.query(
    `SELECT t.transaction_id, t.gross_amount, t.moledi_commission, t.net_organizer,
            t.status, t.payment_method, t.initiated_at, t.confirmed_at
     FROM transactions t
     JOIN campaigns c ON c.campaign_id = t.campaign_id
     WHERE c.owner_user_id = $1
     ORDER BY t.initiated_at DESC
     LIMIT 5000`, // garde-fou raisonnable même pour un export ; pagination réelle si dépassé
    [userId]
  );
  return rows;
}

// ---------------------------------------------------------------------------
// Suppression de compte — pseudonymisation (+ suppression logique des
// campagnes en option), invalidation immédiate de toutes les sessions.
// ---------------------------------------------------------------------------

export async function pseudonymizeAccount(userId, deleteCampaigns) {
  await pool.query(
    `UPDATE users
     SET pseudonymised = TRUE,
         full_name = 'Utilisateur supprimé',
         phone = NULL,
         email = CONCAT('deleted-', user_id, '@moledievents.invalid'),
         avatar_url = NULL,
         deleted_at = now()
     WHERE user_id = $1`,
    [userId]
  );

  if (deleteCampaigns) {
    await pool.query(
      `UPDATE polls SET status = 'ARCHIVED'
       WHERE poll_id IN (SELECT campaign_id FROM campaigns WHERE owner_user_id = $1)`,
      [userId]
    );
  }

  // Critère : "invalide immédiatement toutes les sessions actives"
  await pool.query(
    `UPDATE user_sessions SET invalidated = TRUE WHERE user_id = $1 AND invalidated = FALSE`,
    [userId]
  );
}