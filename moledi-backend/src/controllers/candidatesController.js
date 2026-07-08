import {
  createCandidate,
  listCandidates,
  updateCandidate,
  deleteCandidate,
  reorderCandidates,
  importCandidatesFromCSV,
} from "../store/candidatesStore.js";
import { findUserByEmail } from "../store/dashboardStore.js";

// Vérifier que l'utilisateur est propriétaire de la campagne (poll)
async function verifyCampaignOwnership(pollId, userId) {
  const { rows } = await (await import("../db/pool.js")).pool.query(
    `SELECT campaign_id FROM campaigns c
     JOIN polls p ON p.poll_id = c.campaign_id
     WHERE p.poll_id = $1 AND c.owner_user_id = $2`,
    [pollId, userId]
  );
  return rows.length > 0;
}

async function resolveUser(req, res) {
  const email = req.body.email || req.query.email;
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
// POST /api/dashboard/campaigns/:pollId/candidates
// Ajouter un candidat manuellement
// ---------------------------------------------------------------------------
export async function createCandidateHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { pollId } = req.params;
  const isOwner = await verifyCampaignOwnership(pollId, user.user_id);
  if (!isOwner) {
    return res.status(403).json({ error: "Vous n'êtes pas propriétaire de cette campagne." });
  }

  try {
    const candidate = await createCandidate(pollId, req.body);
    return res.status(201).json(candidate);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/campaigns/:pollId/candidates
// Lister les candidats
// ---------------------------------------------------------------------------
export async function listCandidatesHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { pollId } = req.params;
  const isOwner = await verifyCampaignOwnership(pollId, user.user_id);
  if (!isOwner) {
    return res.status(403).json({ error: "Vous n'êtes pas propriétaire de cette campagne." });
  }

  try {
    const candidates = await listCandidates(pollId);
    return res.status(200).json({ items: candidates });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/dashboard/campaigns/:pollId/candidates/:candidateId
// Modifier un candidat
// ---------------------------------------------------------------------------
export async function updateCandidateHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { pollId, candidateId } = req.params;
  const isOwner = await verifyCampaignOwnership(pollId, user.user_id);
  if (!isOwner) {
    return res.status(403).json({ error: "Vous n'êtes pas propriétaire de cette campagne." });
  }

  try {
    const candidate = await updateCandidate(candidateId, req.body);
    if (!candidate) {
      return res.status(404).json({ error: "Candidat non trouvé." });
    }
    return res.status(200).json(candidate);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/dashboard/campaigns/:pollId/candidates/:candidateId
// Supprimer (soft delete) un candidat
// ---------------------------------------------------------------------------
export async function deleteCandidateHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { pollId, candidateId } = req.params;
  const isOwner = await verifyCampaignOwnership(pollId, user.user_id);
  if (!isOwner) {
    return res.status(403).json({ error: "Vous n'êtes pas propriétaire de cette campagne." });
  }

  try {
    await deleteCandidate(candidateId);
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// PUT /api/dashboard/campaigns/:pollId/candidates/reorder
// Réordonner les candidats
// Body: { items: [{ candidate_id, position }, ...] }
// ---------------------------------------------------------------------------
export async function reorderCandidatesHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { pollId } = req.params;
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "items doit être un tableau." });
  }

  const isOwner = await verifyCampaignOwnership(pollId, user.user_id);
  if (!isOwner) {
    return res.status(403).json({ error: "Vous n'êtes pas propriétaire de cette campagne." });
  }

  try {
    await reorderCandidates(items);
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// POST /api/dashboard/campaigns/:pollId/candidates/import
// Importer des candidats via CSV
// Body: { email, csvContent }
// ---------------------------------------------------------------------------
export async function importCandidatesHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { pollId } = req.params;
  const { csvContent } = req.body;

  if (!csvContent) {
    return res.status(400).json({ error: "csvContent est requis." });
  }

  const isOwner = await verifyCampaignOwnership(pollId, user.user_id);
  if (!isOwner) {
    return res.status(403).json({ error: "Vous n'êtes pas propriétaire de cette campagne." });
  }

  try {
    const imported = await importCandidatesFromCSV(pollId, csvContent);
    return res.status(201).json({ items: imported, count: imported.length });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}