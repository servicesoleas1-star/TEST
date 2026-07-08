import { pool } from "../db/pool.js";

// ---------------------------------------------------------------------------
// Analytics campagne — votes, paiements, candidats
// ---------------------------------------------------------------------------

/**
 * Résumé analytics : total votes, répartition payant/gratuit/adsense,
 * revenu total, taux d'échec paiement.
 */
export async function getCampaignSummary(pollId) {
  const { rows } = await pool.query(
    `SELECT
       COUNT(DISTINCT v.vote_id)::int AS total_votes,
       COUNT(CASE WHEN v.vote_type = 'PAID' THEN 1 END)::int AS paid_votes,
       COUNT(CASE WHEN v.vote_type = 'FREE' THEN 1 END)::int AS free_votes,
       COUNT(CASE WHEN v.vote_type = 'ADSENSE' THEN 1 END)::int AS adsense_votes,
       COALESCE(SUM(t.net_organizer) FILTER (WHERE t.status = 'CONFIRMED'), 0)::numeric AS total_revenue,
       COUNT(CASE WHEN t.status = 'FAILED' THEN 1 END)::int AS failed_payments,
       COUNT(CASE WHEN t.status IN ('PENDING', 'FAILED') THEN 1 END)::int AS pending_failed_payments,
       COUNT(DISTINCT t.transaction_id)::int AS total_transactions
     FROM votes v
     LEFT JOIN transactions t ON v.vote_id = t.vote_id
     WHERE v.poll_id = $1 AND v.status = 'COUNTED'`,
    [pollId]
  );
  return rows[0] || {};
}

/**
 * Votes par jour sur les N derniers jours (agrégation quotidienne).
 */
export async function getVotesByDay(pollId, days = 30) {
  const { rows } = await pool.query(
    `SELECT
       date_trunc('day', v.created_at)::date AS day,
       COUNT(*)::int AS count,
       COUNT(CASE WHEN v.vote_type = 'PAID' THEN 1 END)::int AS paid,
       COUNT(CASE WHEN v.vote_type = 'FREE' THEN 1 END)::int AS free,
       COUNT(CASE WHEN v.vote_type = 'ADSENSE' THEN 1 END)::int AS adsense
     FROM votes v
     WHERE v.poll_id = $1
       AND v.status = 'COUNTED'
       AND v.created_at >= now() - ($2 || ' days')::interval
     GROUP BY day
     ORDER BY day ASC`,
    [pollId, days]
  );
  return rows;
}

/**
 * Votes par heure du jour actuel (24h dernières heures, par heure).
 */
export async function getVotesByHour(pollId) {
  const { rows } = await pool.query(
    `SELECT
       date_trunc('hour', v.created_at)::timestamp AS hour,
       TO_CHAR(v.created_at, 'HH24:00') AS hour_label,
       COUNT(*)::int AS count,
       COUNT(CASE WHEN v.vote_type = 'PAID' THEN 1 END)::int AS paid,
       COUNT(CASE WHEN v.vote_type = 'FREE' THEN 1 END)::int AS free,
       COUNT(CASE WHEN v.vote_type = 'ADSENSE' THEN 1 END)::int AS adsense
     FROM votes v
     WHERE v.poll_id = $1
       AND v.status = 'COUNTED'
       AND v.created_at >= now() - interval '24 hours'
     GROUP BY date_trunc('hour', v.created_at), TO_CHAR(v.created_at, 'HH24:00')
     ORDER BY hour ASC`,
    [pollId]
  );
  return rows;
}

/**
 * Répartition votes : PAID / FREE / ADSENSE avec counts.
 */
export async function getVoteBreakdown(pollId) {
  const { rows } = await pool.query(
    `SELECT
       v.vote_type,
       COUNT(*)::int AS count,
       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2)::numeric AS percentage
     FROM votes v
     WHERE v.poll_id = $1 AND v.status = 'COUNTED'
     GROUP BY v.vote_type`,
    [pollId]
  );
  return rows;
}

/**
 * Top N candidats par nombre de votes (avec classement).
 */
export async function getTopCandidates(pollId, limit = 10) {
  const { rows } = await pool.query(
    `SELECT
       cd.candidate_id,
       cd.display_name,
       COUNT(v.vote_id)::int AS vote_count,
       ROUND(100.0 * COUNT(v.vote_id) / SUM(COUNT(v.vote_id)) OVER (), 2)::numeric AS percentage,
       ROW_NUMBER() OVER (ORDER BY COUNT(v.vote_id) DESC) AS rank
     FROM candidates cd
     LEFT JOIN votes v ON v.candidate_id = cd.candidate_id AND v.status = 'COUNTED'
     WHERE cd.poll_id = $1
     GROUP BY cd.candidate_id, cd.display_name
     ORDER BY vote_count DESC
     LIMIT $2`,
    [pollId, limit]
  );
  return rows;
}

/**
 * Taux d'échec paiements : total FAILED / total transactions.
 */
export async function getPaymentFailureRate(pollId) {
  const { rows } = await pool.query(
    `SELECT
       COUNT(*)::int AS total_transactions,
       COUNT(CASE WHEN status = 'FAILED' THEN 1 END)::int AS failed_count,
       ROUND(100.0 * COUNT(CASE WHEN status = 'FAILED' THEN 1 END) / NULLIF(COUNT(*), 0), 2)::numeric AS failure_rate_percent
     FROM transactions t
     JOIN votes v ON v.vote_id = t.vote_id
     WHERE v.poll_id = $1`,
    [pollId]
  );
  return rows[0] || { total_transactions: 0, failed_count: 0, failure_rate_percent: 0 };
}