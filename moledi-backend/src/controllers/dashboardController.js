import { pool } from "../db/pool.js";
import bcryptjs from "bcryptjs";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { createPollCampaign } from "../store/campaignCreationStore.js";
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
  getPaginatedOwnVotes,
  getLeaderboard,
  getPaginatedNotifications,
  markNotificationsRead,
  markAllNotificationsRead,
  getPaginatedLoginLogs,
  hasActivePayoutBlock,
  createPayoutRequest,
  getPaginatedTransactions,
  getPaginatedPayouts,
  getFullProfile,
  updateProfile,
  updatePayoutPhone,
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

async function resolveDefaultAggregatorId() {
  const { rows } = await pool.query(
    `SELECT aggregator_id FROM aggregators WHERE active = TRUE ORDER BY name ASC LIMIT 1`
  );
  return rows[0]?.aggregator_id || null;
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
// POST /api/dashboard/campaigns
// Créer une campagne Scrutin & Vote (seul type disponible au MVP).
// Body: { email, title, description, coverPhotoUrl, category,
//         displayOrganizerName, voteType, pricePerVote, votePacks,
//         maxVotesPerVisitor, openAt, closeAt, timezone, resultsVisibility,
//         candidates: [...], refundPolicy: { refundable, delayHours, percentage } }
// Statut initial PENDING_VALIDATION -- attend une validation admin comme
// toute nouvelle campagne (voir Spec Fonctionnelle section D).
// ---------------------------------------------------------------------------
export async function createCampaignHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  try {
    const poll = await createPollCampaign(user.user_id, req.body);
    return res.status(201).json({ success: true, campaign: poll });
  } catch (err) {
    return res.status(400).json({ error: err.message });
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
// GET /api/dashboard/my-votes?email=&page=&pageSize=
// "Mon activité > Mes votes" (dashboard V2) -- votes propres de
// l'organisateur en tant que participant, pas ceux reçus sur ses campagnes.
// ---------------------------------------------------------------------------
export async function listMyVotes(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { page, pageSize } = parsePagination(req);

  try {
    const result = await getPaginatedOwnVotes(user.user_id, page, pageSize);
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
// POST /api/dashboard/notifications/mark-all-read
// Bouton "Tout marquer comme lu" (dashboard V2 > Notifications)
// ---------------------------------------------------------------------------
export async function markAllNotificationsReadHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  try {
    await markAllNotificationsRead(user.user_id);
    return res.status(200).json({ success: true });
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
// GET /api/dashboard/transactions?email=&page=&pageSize=
// Historique des revenus paginé (dashboard V2 > Finances > Historique)
// ---------------------------------------------------------------------------
export async function listTransactions(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { page, pageSize } = parsePagination(req);

  try {
    const result = await getPaginatedTransactions(user.user_id, page, pageSize);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/payouts?email=&page=&pageSize=
// Reversements paginés (dashboard V2 > Finances > Reversements)
// ---------------------------------------------------------------------------
export async function listPayouts(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { page, pageSize } = parsePagination(req);

  try {
    const result = await getPaginatedPayouts(user.user_id, page, pageSize);
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

  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Montant invalide." });
  }

  try {
    // Le numéro de destination n'est jamais saisi ici -- il est pré-configuré
    // dans le profil (voir updatePayoutPhoneHandler / Mon profil > Numéro
    // Mobile Money) et seulement RÉUTILISÉ, jamais modifiable depuis ce
    // formulaire (voir Spec Fonctionnelle, section Finances > Demande de retrait).
    const profile = await getFullProfile(user.user_id);
    if (!profile?.payout_phone) {
      return res.status(400).json({
        error: "Aucun numéro Mobile Money configuré. Configurez-le dans Mon profil avant de demander un retrait.",
      });
    }

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

    // aggregator_id est NOT NULL en base (payout_requests) -- en l'absence
    // d'une vraie logique de sélection de PSP par pays/opérateur (à
    // brancher plus tard), on résout le premier agrégateur actif comme
    // valeur par défaut plutôt que d'envoyer null, ce qui violait la
    // contrainte et faisait toujours échouer la demande de retrait.
    const aggregatorId = await resolveDefaultAggregatorId();
    if (!aggregatorId) {
      return res.status(503).json({ error: "Aucun prestataire de paiement disponible pour le moment." });
    }

    const result = await createPayoutRequest(user.user_id, amount, profile.payout_phone, aggregatorId);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/export/financial
// Générer URL signée pour export financier (≤ 1h)
// ---------------------------------------------------------------------------
const EXPORT_FORMATS = new Set(["csv", "xlsx", "pdf"]);

export async function requestFinancialExport(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const format = EXPORT_FORMATS.has(req.query.format) ? req.query.format : "csv";

  try {
    const { token, expiresAt } = generateSignedExportToken(user.user_id);
    return res.status(200).json({
      download_url: `/api/dashboard/export/financial/download?token=${token}&format=${format}`,
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
const EXPORT_COLUMNS = [
  { key: "transaction_id", header: "ID Transaction" },
  { key: "gross_amount", header: "Montant brut" },
  { key: "moledi_commission", header: "Commission Moledi" },
  { key: "net_organizer", header: "Revenu net" },
  { key: "status", header: "Statut" },
  { key: "payment_method", header: "Méthode paiement" },
  { key: "initiated_at", header: "Initié" },
  { key: "confirmed_at", header: "Confirmé" },
];

function toExportRow(t) {
  return {
    transaction_id: t.transaction_id,
    gross_amount: Number(t.gross_amount) || 0,
    moledi_commission: Number(t.moledi_commission) || 0,
    net_organizer: Number(t.net_organizer) || 0,
    status: t.status,
    payment_method: t.payment_method,
    initiated_at: new Date(t.initiated_at).toLocaleString("fr-FR"),
    confirmed_at: t.confirmed_at ? new Date(t.confirmed_at).toLocaleString("fr-FR") : "—",
  };
}

function sendCsvExport(res, rows) {
  const header = EXPORT_COLUMNS.map((c) => c.header).join(",");
  const lines = rows.map((r) => EXPORT_COLUMNS.map((c) => r[c.key]).join(","));
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=export-financier.csv");
  return res.status(200).send([header, ...lines].join("\n"));
}

async function sendXlsxExport(res, rows) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Export financier");
  sheet.columns = EXPORT_COLUMNS.map((c) => ({ header: c.header, key: c.key, width: 22 }));
  sheet.getRow(1).font = { bold: true };
  rows.forEach((r) => sheet.addRow(r));

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=export-financier.xlsx");
  await workbook.xlsx.write(res);
  return res.end();
}

function sendPdfExport(res, rows) {
  const doc = new PDFDocument({ size: "A4", margin: 40, layout: "landscape" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=export-financier.pdf");
  doc.pipe(res);

  doc.fontSize(16).font("Helvetica-Bold").text("Export financier — Moledi Events", { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(9).font("Helvetica").fillColor("#475569").text(
    `Généré le ${new Date().toLocaleString("fr-FR")} — ${rows.length} transaction(s)`,
    { align: "center" }
  );
  doc.moveDown(1);

  const colWidths = [130, 70, 90, 80, 70, 90, 100, 100];
  const startX = doc.page.margins.left;
  let y = doc.y;

  function drawRow(values, { bold = false } = {}) {
    if (y > doc.page.height - doc.page.margins.bottom - 20) {
      doc.addPage();
      y = doc.y;
    }
    doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(8).fillColor(bold ? "#0B1324" : "#1E293B");
    let x = startX;
    values.forEach((v, i) => {
      doc.text(String(v ?? ""), x, y, { width: colWidths[i], ellipsis: true });
      x += colWidths[i];
    });
    y += 18;
  }

  drawRow(EXPORT_COLUMNS.map((c) => c.header), { bold: true });
  doc.moveTo(startX, y - 4).lineTo(startX + colWidths.reduce((a, b) => a + b, 0), y - 4).strokeColor("#E2E8F0").stroke();

  rows.forEach((r) => drawRow(EXPORT_COLUMNS.map((c) => r[c.key])));

  doc.end();
}

export async function downloadFinancialExport(req, res) {
  const { token, format } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Token manquant." });
  }

  try {
    const entry = validateSignedExportToken(token);
    if (!entry) {
      return res.status(410).json({ error: "Token expiré ou invalide." });
    }

    const transactions = await getTransactionsForExport(entry.userId);
    const rows = transactions.map(toExportRow);

    if (format === "xlsx") return await sendXlsxExport(res, rows);
    if (format === "pdf") return sendPdfExport(res, rows);
    return sendCsvExport(res, rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/profile?email=
// Profil complet (dashboard V2 > Mon profil)
// ---------------------------------------------------------------------------
export async function getProfile(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  try {
    const profile = await getFullProfile(user.user_id);
    return res.status(200).json(profile);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// POST /api/dashboard/profile
// Body: { email, fullName, phone, phoneCountryCode }
// ---------------------------------------------------------------------------
export async function updateProfileHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  try {
    const updated = await updateProfile(user.user_id, req.body);
    return res.status(200).json({ success: true, user: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// POST /api/dashboard/profile/payout-phone
// Configure/modifie le numéro Mobile Money de reversement.
// Body: { email, phone, operator }
// ---------------------------------------------------------------------------
export async function updatePayoutPhoneHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  try {
    const updated = await updatePayoutPhone(user.user_id, req.body);
    return res.status(200).json({ success: true, ...updated });
  } catch (err) {
    return res.status(400).json({ error: err.message });
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