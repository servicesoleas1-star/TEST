import crypto from "node:crypto";
import { pool } from "../db/pool.js";

export async function findFreePollBySlug(slug) {
  const { rows } = await pool.query(
    `SELECT poll_id, title, vote_type, max_votes_per_visitor, status
     FROM polls WHERE slug = $1`,
    [slug]
  );
  return rows[0] || null;
}

export async function findCandidate(pollId, candidateId) {
  const { rows } = await pool.query(
    `SELECT candidate_id, display_name FROM candidates WHERE poll_id = $1 AND candidate_id = $2`,
    [pollId, candidateId]
  );
  return rows[0] || null;
}

/**
 * Compte tous les votes déjà déposés par ce visiteur sur ce scrutin (tous
 * candidats confondus) — c'est ce compteur qui applique la limite
 * max_votes_per_visitor (critère "méthode anti-doublon").
 */
export async function countVisitorVotesOnPoll(pollId, visitorId) {
  const { rows } = await pool.query(
    `SELECT count(*)::int AS count
     FROM votes
     WHERE poll_id = $1 AND visitor_id = $2 AND status = 'COUNTED'`,
    [pollId, visitorId]
  );
  return rows[0].count;
}

/**
 * Garantit qu'un visiteur existe en base avant l'insertion du vote (FK).
 * Même logique que pour le tunnel payant — voir paidVoteStore.js.
 */
export async function ensureVisitorExists(visitorId) {
  await pool.query(
    `INSERT INTO visitors (visitor_id, ip_hashed) VALUES ($1, 'unknown')
     ON CONFLICT (visitor_id) DO NOTHING`,
    [visitorId]
  );
}

/**
 * Crédite immédiatement le vote gratuit — contrairement au vote payant, il
 * n'y a pas d'attente de confirmation PSP, le vote est donc COUNTED dès
 * l'insertion.
 */
export async function createFreeVote(pollId, candidateId, visitorId, ipHashed) {
  const shortId = crypto.randomBytes(4).toString("hex");
  const { rows } = await pool.query(
    `INSERT INTO votes
       (poll_id, candidate_id, visitor_id, vote_type, status,
        verification_method, short_id, ip_hashed)
     VALUES
       ($1, $2, $3, 'FREE_VISITOR_ID', 'COUNTED',
        'VISITOR_ID', $4, $5)
     RETURNING vote_id, created_at`,
    [pollId, candidateId, visitorId, shortId, ipHashed || "unknown"]
  );
  return rows[0];
}
