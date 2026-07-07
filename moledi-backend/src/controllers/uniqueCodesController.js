import {
  generateUniqueCodes,
  importUniqueCodesFromCSV,
  listUniqueCodes,
  cancelUniqueCode,
  exportUniqueCodesAsCSV,
} from "../store/uniqueCodesStore.js";
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
// POST /api/dashboard/campaigns/:pollId/unique-codes/generate
// Générer un lot de codes uniques
// Body: { email, count }
// ---------------------------------------------------------------------------
export async function generateCodesHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { pollId } = req.params;
  const { count } = req.body;

  if (!Number.isInteger(count) || count <= 0) {
    return res.status(400).json({ error: "count doit être un entier positif." });
  }

  const isOwner = await verifyCampaignOwnership(pollId, user.user_id);
  if (!isOwner) {
    return res.status(403).json({ error: "Vous n'êtes pas propriétaire de cette campagne." });
  }

  try {
    const codes = await generateUniqueCodes(pollId, count);
    return res.status(201).json({ items: codes, count: codes.length });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// POST /api/dashboard/campaigns/:pollId/unique-codes/import
// Importer des codes via CSV
// Body: { email, csvContent }
// ---------------------------------------------------------------------------
export async function importCodesHandler(req, res) {
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
    const codes = await importUniqueCodesFromCSV(pollId, csvContent);
    return res.status(201).json({ items: codes, count: codes.length });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/campaigns/:pollId/unique-codes
// Lister les codes
// ---------------------------------------------------------------------------
export async function listCodesHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { pollId } = req.params;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 20));

  const isOwner = await verifyCampaignOwnership(pollId, user.user_id);
  if (!isOwner) {
    return res.status(403).json({ error: "Vous n'êtes pas propriétaire de cette campagne." });
  }

  try {
    const result = await listUniqueCodes(pollId, page, pageSize);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/dashboard/campaigns/:pollId/unique-codes/:codeId
// Annuler un code (et invalider le vote associé)
// ---------------------------------------------------------------------------
export async function cancelCodeHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { pollId, codeId } = req.params;

  const isOwner = await verifyCampaignOwnership(pollId, user.user_id);
  if (!isOwner) {
    return res.status(403).json({ error: "Vous n'êtes pas propriétaire de cette campagne." });
  }

  try {
    await cancelUniqueCode(codeId);
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/campaigns/:pollId/unique-codes/export
// Exporter tous les codes en CSV
// ---------------------------------------------------------------------------
export async function exportCodesHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { pollId } = req.params;

  const isOwner = await verifyCampaignOwnership(pollId, user.user_id);
  if (!isOwner) {
    return res.status(403).json({ error: "Vous n'êtes pas propriétaire de cette campagne." });
  }

  try {
    const csv = await exportUniqueCodesAsCSV(pollId);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=codes-uniques.csv");
    return res.status(200).send(csv);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}