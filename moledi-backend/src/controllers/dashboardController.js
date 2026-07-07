import { pool } from "../db/pool.js";
import bcryptjs from "bcryptjs";
import {
  findUserByEmail,
  getBalance,
  countActiveCampaigns,
  sumVotesThisMonth,
  sumRevenueThisMonth,
  countUnreadAlerts,
  getRevenueChartData,
  getVotesChartData,
  getPaginatedCampaigns,
  duplicateCampaign,
  getPaginatedActivity,
  getLeaderboard,
  getPaginatedNotifications,
  markNotificationsRead,
  getPaginatedLoginLogs,
  hasActivePayoutBlock,
  createPayoutRequest,
  generateSignedExportToken,
  validateSignedExportToken,
  getTransactionsForExport,
  pseudonymizeAccount,
} from "../store/dashboardStore.js";

// Helpers
function parsePagination(req, MAX_PAGE_SIZE = 50) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.pageSize, 10) || 10));
  return { page, pageSize };
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

async function verifyPassword(password, hash) {
  try {
    return await bcryptjs.compare(password, hash);
  } catch (err) {
    return false;
  }
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/summary
// KPI synthèse du dashboard
// ---------------------------------------------------------------------------
export async function getSummary(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  try {
    const [balance, campaigns, votes, revenue, alerts] = await Promise.all([
      getBalance(user.user_id),
      countActiveCampaigns(user.user_id),
      sumVotesThisMonth(user.user_id),
      sumRevenueThisMonth(user.user_id),
      countUnreadAlerts(user.user_id),
    ]);

    return res.status(200).json({
      available_balance: balance.available_amount,
      reserved_balance: balance.reserved_amount,
      active_campaigns: campaigns,
      votes_this_month: votes,
      revenue_this_month: revenue,
      unread_alerts: alerts,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/charts?email=&days=
// Graphiques revenus et votes
// ---------------------------------------------------------------------------
export async function getCharts(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const days = Math.min(365, Math.max(7, parseInt(req.query.days, 10) || 30));

  try {
    const [revenue, votes] = await Promise.all([
      getRevenueChartData(user.user_id, days),
      getVotesChartData(user.user_id, days),
    ]);

    return res.status(200).json({ revenue, votes });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/campaigns?email=&page=&pageSize=
// Lister campagnes avec pagination
// ---------------------------------------------------------------------------
export async function listCampaigns(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { page, pageSize } = parsePagination(req);

  try {
    const result = await getPaginatedCampaigns(user.user_id, page, pageSize);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// POST /api/dashboard/campaigns/:campaignId/duplicate
// Dupliquer une campagne
// ---------------------------------------------------------------------------
export async function duplicateCampaignHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { campaignId } = req.params;

  try {
    const result = await duplicateCampaign(user.user_id, campaignId);
    if (!result) {
      return res.status(404).json({ error: "Campagne non trouvée." });
    }
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/activity?email=&page=&pageSize=
// Mon activité paginée
// ---------------------------------------------------------------------------
export async function listActivity(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { page, pageSize } = parsePagination(req);

  try {
    const result = await getPaginatedActivity(user.user_id, page, pageSize);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/leaderboard?email=&campaignId=
// Classement candidats pour une campagne
// ---------------------------------------------------------------------------
export async function getLeaderboardHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { campaignId } = req.query;
  if (!campaignId) {
    return res.status(400).json({ error: "campaignId requis." });
  }

  try {
    const items = await getLeaderboard(user.user_id, campaignId);
    return res.status(200).json({ items });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/notifications?email=&page=&pageSize=
// Notifications paginées (marque comme lues sur page 1)
// ---------------------------------------------------------------------------
export async function listNotifications(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { page, pageSize } = parsePagination(req);

  try {
    const result = await getPaginatedNotifications(user.user_id, page, pageSize);

    // Marquer comme lues si page 1
    if (page === 1 && result.items.length > 0) {
      const notifIds = result.items.map((n) => n.notif_id);
      await markNotificationsRead(user.user_id, notifIds);
    }

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/login-logs?email=&page=&pageSize=
// Journal de connexion paginé
// ---------------------------------------------------------------------------
export async function listLoginLogs(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { page, pageSize } = parsePagination(req);

  try {
    const result = await getPaginatedLoginLogs(user.user_id, page, pageSize);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// POST /api/dashboard/payout-requests
// Demander un retrait
// ---------------------------------------------------------------------------
export async function requestPayout(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { amount, phone, country } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Montant invalide." });
  }

  try {
    // Vérifier blocage actif
    const block = await hasActivePayoutBlock(user.user_id);
    if (block) {
      return res.status(403).json({ error: `Retrait bloqué : ${block.reason}` });
    }

    // Vérifier solde
    const balance = await getBalance(user.user_id);
    if (balance.available_amount < amount) {
      return res.status(400).json({ error: "Solde insuffisant." });
    }

    // TODO: intégrer PSP pour récupérer aggregatorId
    const aggregatorId = null; // Placeholder

    const result = await createPayoutRequest(user.user_id, amount, phone, aggregatorId);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/export/financial
// Générer URL signée pour export financier (≤ 1h)
// ---------------------------------------------------------------------------
export async function requestFinancialExport(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  try {
    const { token, expiresAt } = generateSignedExportToken(user.user_id);
    return res.status(200).json({
      download_url: `/api/dashboard/export/financial/download?token=${token}`,
      expires_at: new Date(expiresAt).toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/export/financial/download?token=
// Télécharger export financier CSV (URL signée)
// ---------------------------------------------------------------------------
export async function downloadFinancialExport(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Token manquant." });
  }

  try {
    const entry = validateSignedExportToken(token);
    if (!entry) {
      return res.status(410).json({ error: "Token expiré ou invalide." });
    }

    const transactions = await getTransactionsForExport(entry.userId);

    // Générer CSV
    const header = "ID Transaction,Montant brut,Commission Moledi,Revenu net,Statut,Méthode paiement,Initié,Confirmé";
    const lines = transactions.map((t) =>
      [
        t.transaction_id,
        t.gross_amount,
        t.moledi_commission,
        t.net_organizer,
        t.status,
        t.payment_method,
        new Date(t.initiated_at).toISOString(),
        t.confirmed_at ? new Date(t.confirmed_at).toISOString() : "",
      ].join(",")
    );

    const csv = [header, ...lines].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=export-financier.csv");
    return res.status(200).send(csv);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// POST /api/dashboard/account/delete
// Supprimer le compte (pseudonymisation ± campagnes + invalidate sessions)
// Body: { email, password, deleteCampaigns }
// ---------------------------------------------------------------------------
export async function deleteAccount(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { password, deleteCampaigns } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Mot de passe requis." });
  }

  try {
    // Vérifier le mot de passe
    const { rows: userRows } = await pool.query(
      `SELECT password_hash FROM users WHERE user_id = $1`,
      [user.user_id]
    );

    if (userRows.length === 0) {
      return res.status(401).json({ error: "Utilisateur non trouvé." });
    }

    const isValid = await verifyPassword(password, userRows[0].password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Mot de passe incorrect." });
    }

    // Pseudonymiser le compte
    await pseudonymizeAccount(user.user_id, deleteCampaigns === true);

    // Log (TODO: intégrer service email si nécessaire)
    console.log(`[INFO] Compte supprimé pour ${user.email}`);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Erreur suppression compte :", err);
    return res.status(500).json({ error: "Une erreur est survenue." });
  }
}