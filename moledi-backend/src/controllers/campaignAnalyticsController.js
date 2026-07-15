import {
  getCampaignSummary,
  getVotesByDay,
  getRevenueByDay,
  getVotesByHour,
  getVoteBreakdown,
  getTopCandidates,
  getPaymentFailureRate,
} from "../store/campaignAnalyticsStore.js";
import { findUserByEmail } from "../store/dashboardStore.js";
import { pool } from "../db/pool.js";

// Vérifier que l'utilisateur est propriétaire de la campagne
async function verifyCampaignOwnership(pollId, userId) {
  const { rows } = await pool.query(
    `SELECT campaign_id FROM campaigns c
     JOIN polls p ON p.poll_id = c.campaign_id
     WHERE p.poll_id = $1 AND c.owner_user_id = $2`,
    [pollId, userId]
  );
  return rows.length > 0;
}

async function resolveUser(req, res) {
  const email = req.query.email;
  if (!email) {
    res.status(400).json({ error: "Session invalide." });
    return null;
  }
  const user = await findUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: "Session invalide." });
    return null;
  }
  return user;
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/campaigns/:pollId/analytics/summary
// Résumé analytics (KPI)
// ---------------------------------------------------------------------------
export async function getSummaryHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { pollId } = req.params;

  const isOwner = await verifyCampaignOwnership(pollId, user.user_id);
  if (!isOwner) {
    return res.status(403).json({ error: "Vous n'êtes pas propriétaire de cette campagne." });
  }

  try {
    const summary = await getCampaignSummary(pollId);
    return res.status(200).json(summary);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/campaigns/:pollId/analytics/votes-by-day?days=
// Graphique votes par jour
// ---------------------------------------------------------------------------
export async function getVotesByDayHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { pollId } = req.params;
  const days = Math.min(365, Math.max(7, parseInt(req.query.days, 10) || 30));

  const isOwner = await verifyCampaignOwnership(pollId, user.user_id);
  if (!isOwner) {
    return res.status(403).json({ error: "Vous n'êtes pas propriétaire de cette campagne." });
  }

  try {
    const data = await getVotesByDay(pollId, days);
    return res.status(200).json({ items: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/campaigns/:pollId/analytics/revenue-by-day?days=
// Graphique revenus par jour
// ---------------------------------------------------------------------------
export async function getRevenueByDayHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { pollId } = req.params;
  const days = Math.min(365, Math.max(7, parseInt(req.query.days, 10) || 30));

  const isOwner = await verifyCampaignOwnership(pollId, user.user_id);
  if (!isOwner) {
    return res.status(403).json({ error: "Vous n'êtes pas propriétaire de cette campagne." });
  }

  try {
    const data = await getRevenueByDay(pollId, days);
    return res.status(200).json({ items: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/campaigns/:pollId/analytics/votes-by-hour
// Graphique votes par heure
// ---------------------------------------------------------------------------
export async function getVotesByHourHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { pollId } = req.params;

  const isOwner = await verifyCampaignOwnership(pollId, user.user_id);
  if (!isOwner) {
    return res.status(403).json({ error: "Vous n'êtes pas propriétaire de cette campagne." });
  }

  try {
    const data = await getVotesByHour(pollId);
    return res.status(200).json({ items: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/campaigns/:pollId/analytics/vote-breakdown
// Répartition votes PAID/FREE/ADSENSE
// ---------------------------------------------------------------------------
export async function getVoteBreakdownHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { pollId } = req.params;

  const isOwner = await verifyCampaignOwnership(pollId, user.user_id);
  if (!isOwner) {
    return res.status(403).json({ error: "Vous n'êtes pas propriétaire de cette campagne." });
  }

  try {
    const data = await getVoteBreakdown(pollId);
    return res.status(200).json({ items: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/campaigns/:pollId/analytics/top-candidates?limit=
// Top candidats
// ---------------------------------------------------------------------------
export async function getTopCandidatesHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { pollId } = req.params;
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const isOwner = await verifyCampaignOwnership(pollId, user.user_id);
  if (!isOwner) {
    return res.status(403).json({ error: "Vous n'êtes pas propriétaire de cette campagne." });
  }

  try {
    const data = await getTopCandidates(pollId, limit);
    return res.status(200).json({ items: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/campaigns/:pollId/analytics/payment-failures
// Taux d'échec paiements
// ---------------------------------------------------------------------------
export async function getPaymentFailuresHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { pollId } = req.params;

  const isOwner = await verifyCampaignOwnership(pollId, user.user_id);
  if (!isOwner) {
    return res.status(403).json({ error: "Vous n'êtes pas propriétaire de cette campagne." });
  }

  try {
    const data = await getPaymentFailureRate(pollId);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}