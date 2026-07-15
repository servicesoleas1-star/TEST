import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPollHome } from "../store/pollPublicStore.js";
import { listPollNews, listPollPartners, listPollGallery, listPollFaqs, listActivePollNotices, getPollResults } from "../store/pollContentStore.js";
import { createPollReport } from "../store/pollReportsStore.js";
import { listPollCandidates } from "../store/pollPublicStore.js";
import { generateClosingReport } from "../services/closingReportService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VALID_COMPLAINT_TYPES = [
  "VOTE_NOT_COUNTED", "PAYMENT_WITHOUT_VOTE", "DUPLICATE_VOTE", "TECHNICAL",
  "WRONG_INFO", "SUSPECTED_FRAUD", "MISSING_CANDIDATE", "WRONG_SCORE", "OTHER",
];

async function resolvePollId(req, res) {
  const poll = await getPollHome(req.params.slug);
  if (!poll) {
    res.status(404).json({ error: "Scrutin introuvable." });
    return null;
  }
  return poll.poll_id;
}

export async function getNews(req, res) {
  const pollId = await resolvePollId(req, res);
  if (!pollId) return;
  const news = await listPollNews(pollId);
  return res.status(200).json({ news });
}

export async function getPartners(req, res) {
  const pollId = await resolvePollId(req, res);
  if (!pollId) return;
  const partners = await listPollPartners(pollId);
  return res.status(200).json({ partners });
}

export async function getGallery(req, res) {
  const pollId = await resolvePollId(req, res);
  if (!pollId) return;
  const gallery = await listPollGallery(pollId);
  return res.status(200).json({ gallery });
}

export async function getFaq(req, res) {
  const pollId = await resolvePollId(req, res);
  if (!pollId) return;
  const faq = await listPollFaqs(pollId);
  return res.status(200).json({ faq });
}

/**
 * GET /api/polls/:slug/notices
 * Annonces / pop-ups actifs -- affichés en bandeau (ANNOUNCEMENT) ou en
 * pop-up (POPUP) sur la page publique du scrutin (voir Poll.jsx).
 */
export async function getNotices(req, res) {
  const pollId = await resolvePollId(req, res);
  if (!pollId) return;
  const notices = await listActivePollNotices(pollId);
  return res.status(200).json({ notices });
}

export async function getResults(req, res) {
  const pollId = await resolvePollId(req, res);
  if (!pollId) return;
  const results = await getPollResults(pollId);
  if (!results) {
    return res.status(200).json({ available: false });
  }
  return res.status(200).json({ available: true, ...results });
}

/**
 * POST /api/polls/:slug/pv/generate
 * Génère réellement le PDF du procès-verbal de clôture (voir
 * services/closingReportService.js) -- pas un lien factice. Réservé en
 * théorie à l'admin/superviseur qui clôture le scrutin (TODO : brancher sur
 * le vrai middleware d'authentification admin une fois le tableau de bord
 * de clôture construit ; volontairement ouvert pour l'instant, comme le
 * reste des routes non encore protégées de ce backend en développement).
 */
export async function postGeneratePv(req, res) {
  const poll = await getPollHome(req.params.slug);
  if (!poll) {
    return res.status(404).json({ error: "Scrutin introuvable." });
  }
  try {
    // supervisor_id est NOT NULL en base (closing_reports.supervisor_id) --
    // à remplacer par req.user.id une fois l'auth admin branchée sur cette
    // route ; repli sur le super-admin de démo en attendant.
    const supervisorId = req.body.supervisorId || "10000000-0000-0000-0000-000000000001";
    const report = await generateClosingReport(poll.poll_id, {
      supervisorId,
      publicReport: req.body.public !== false,
    });
    return res.status(201).json({ success: true, report });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

/**
 * GET /api/polls/:slug/pv/download
 * Forcé en téléchargement de fichier (Content-Disposition: attachment) --
 * contrairement au simple lien statique /uploads/pv/*.pdf (servi "inline"
 * par défaut par express.static), qui peut s'ouvrir dans l'onglet au lieu
 * de déclencher un vrai téléchargement selon le visualiseur PDF du
 * navigateur. Le PDF existe déjà sur disque (généré par
 * generateClosingReport, voir postGeneratePv juste au-dessus) ; cette
 * route ne fait que le renvoyer avec le bon en-tête.
 */
export async function downloadPv(req, res) {
  const pollId = await resolvePollId(req, res);
  if (!pollId) return;
  const results = await getPollResults(pollId);
  if (!results?.report?.pdf_url) {
    return res.status(404).json({ error: "Aucun procès-verbal disponible pour ce scrutin." });
  }
  const fileName = path.basename(results.report.pdf_url);
  const filePath = path.join(__dirname, "..", "uploads", "pv", fileName);
  return res.download(filePath, `PV-${req.params.slug}.pdf`, (err) => {
    if (err && !res.headersSent) {
      res.status(404).json({ error: "Fichier PV introuvable." });
    }
  });
}

/**
 * POST /api/polls/:slug/report
 * Page Aide / Signalement -- crée un signalement (poll_reports) + un ticket
 * de support lié. Revalide côté serveur les mêmes champs que le formulaire.
 */
export async function postReport(req, res) {
  const poll = await getPollHome(req.params.slug);
  if (!poll) {
    return res.status(404).json({ error: "Scrutin introuvable." });
  }

  const { name, phone, complaintType, candidateId, description } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Le nom est requis." });
  }
  if (!phone || typeof phone !== "string" || phone.trim().length < 8) {
    return res.status(400).json({ error: "Numéro de téléphone invalide." });
  }
  if (!VALID_COMPLAINT_TYPES.includes(complaintType)) {
    return res.status(400).json({ error: "Type de signalement invalide." });
  }
  if (!description || typeof description !== "string" || description.trim().length < 10) {
    return res.status(400).json({ error: "Merci de décrire le problème (10 caractères minimum)." });
  }

  if (candidateId) {
    const candidates = await listPollCandidates(poll.poll_id);
    if (!candidates.some((c) => c.candidate_id === candidateId)) {
      return res.status(400).json({ error: "Candidat invalide pour ce scrutin." });
    }
  }

  const visitorId = req.headers["x-visitor-id"] || req.body.visitorId || null;

  const report = await createPollReport({
    pollId: poll.poll_id,
    campaignId: poll.poll_id, // campaign_id == poll_id (CTI, voir 03_campaigns_core.sql)
    visitorId,
    candidateId: candidateId || null,
    reporterName: name.trim(),
    reporterPhone: phone.trim(),
    complaintType,
    description: description.trim(),
    attachmentsUrls: [],
  });

  return res.status(201).json({ success: true, reportId: report.report_id });
}
