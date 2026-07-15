import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";
import { pool } from "../db/pool.js";

// ---------------------------------------------------------------------------
// Génération réelle du PV (procès-verbal) de clôture d'un scrutin -- un vrai
// PDF téléchargeable, pas un lien factice. pdfkit est pur JS (aucun binaire
// externe type Chromium requis), adapté à un déploiement VPS simple.
//
// Stockage : disque local du backend (src/uploads/pv/), servi en statique
// via /uploads (voir app.js). À remplacer par un vrai bucket (S3/Supabase
// Storage) en production -- ce commentaire marque explicitement cette
// limite pour la suite.
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "pv");

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Résout un superviseur par défaut (premier SUPER_ADMIN actif) pour les PV
 * générés automatiquement par le cron de clôture (closeElapsedPolls) — aucun
 * humain n'est disponible pour renseigner supervisor_id à ce moment-là, mais
 * la colonne est NOT NULL en base (traçabilité légale du PV).
 */
async function resolveDefaultSupervisorId() {
  const { rows } = await pool.query(
    `SELECT user_id FROM users WHERE role = 'SUPER_ADMIN' AND deleted_at IS NULL ORDER BY created_at ASC LIMIT 1`
  );
  return rows[0]?.user_id || null;
}

async function getPollForReport(pollId) {
  const { rows } = await pool.query(
    `SELECT poll_id, slug, title, display_organizer_name, close_at, status
       FROM polls WHERE poll_id = $1`,
    [pollId]
  );
  return rows[0] || null;
}

async function getCandidatesForReport(pollId) {
  const { rows } = await pool.query(
    `SELECT c.candidate_id, c.display_name, c.score, c.rank, cc.name AS category_name
       FROM candidates c
       LEFT JOIN candidate_categories cc ON cc.category_id = c.category_id
       WHERE c.poll_id = $1 AND c.active = TRUE
       ORDER BY COALESCE(c.rank, 999999), c.score DESC`,
    [pollId]
  );
  return rows;
}

/**
 * Dessine le document PDF (titre, méta, tableau des candidats trié par
 * rang) et retourne le buffer final une fois le flux terminé.
 */
function renderPdfBuffer({ poll, candidates, version, generatedAt }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).font("Helvetica-Bold").text("Procès-verbal de clôture", { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(13).font("Helvetica").fillColor("#475569").text(poll.title, { align: "center" });
    doc.moveDown(1.2);

    doc.fillColor("#0B1324").fontSize(10).font("Helvetica");
    doc.text(`Version : ${version}`);
    doc.text(`Organisateur : ${poll.display_organizer_name || "—"}`);
    doc.text(`Clôturé le : ${new Date(poll.close_at).toLocaleString("fr-FR")}`);
    doc.text(`Généré le : ${generatedAt.toLocaleString("fr-FR")}`);
    doc.text(`Nombre de candidats classés : ${candidates.length}`);
    doc.moveDown(1);

    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#E2E8F0").stroke();
    doc.moveDown(0.8);

    doc.font("Helvetica-Bold").fontSize(12).text("Classement final");
    doc.moveDown(0.5);

    const colRank = 50, colName = 90, colCategory = 320, colScore = 470;
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#475569");
    doc.text("Rang", colRank, doc.y, { continued: false, width: 30 });
    doc.text("Candidat", colName, doc.y - 11, { width: colCategory - colName - 10 });
    doc.text("Catégorie", colCategory, doc.y - 11, { width: colScore - colCategory - 10 });
    doc.text("Votes", colScore, doc.y - 11, { width: 70 });
    doc.moveDown(0.4);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#E2E8F0").stroke();
    doc.moveDown(0.3);

    doc.font("Helvetica").fontSize(9).fillColor("#0B1324");
    candidates.forEach((c, i) => {
      if (doc.y > 760) doc.addPage();
      const y = doc.y;
      doc.text(String(c.rank ?? i + 1), colRank, y, { width: 30 });
      doc.text(c.display_name, colName, y, { width: colCategory - colName - 10 });
      doc.text(c.category_name || "—", colCategory, y, { width: colScore - colCategory - 10 });
      doc.text(Number(c.score).toLocaleString("fr-FR"), colScore, y, { width: 70 });
      doc.moveDown(0.6);
    });

    doc.moveDown(1.5);
    doc.fontSize(8).fillColor("#94A3B8").text(
      "Ce document est généré automatiquement à partir des données de vote enregistrées sur Moledi Events. Son intégrité peut être vérifiée via le hash SHA-256 associé, disponible sur la page du procès-verbal.",
      { align: "left" }
    );

    doc.end();
  });
}

/**
 * Génère (ou régénère, en incrémentant la version) le PV de clôture d'un
 * scrutin CLOSED : rend le PDF, l'écrit sur disque, calcule son hash
 * SHA-256, et insère la ligne closing_reports correspondante.
 */
export async function generateClosingReport(pollId, { supervisorId, publicReport = true } = {}) {
  const poll = await getPollForReport(pollId);
  if (!poll) throw new Error("Scrutin introuvable.");
  if (poll.status !== "CLOSED") throw new Error("Le PV ne peut être généré que pour un scrutin clôturé.");

  const resolvedSupervisorId = supervisorId || (await resolveDefaultSupervisorId());
  if (!resolvedSupervisorId) throw new Error("Aucun superviseur disponible pour générer le PV.");

  const candidates = await getCandidatesForReport(pollId);
  const generatedAt = new Date();

  const { rows: versionRows } = await pool.query(
    `SELECT COALESCE(MAX(version), 0) + 1 AS next_version FROM closing_reports WHERE poll_id = $1`,
    [pollId]
  );
  const version = versionRows[0].next_version;

  const pdfBuffer = await renderPdfBuffer({ poll, candidates, version, generatedAt });
  const sha256Hash = crypto.createHash("sha256").update(pdfBuffer).digest("hex");

  ensureUploadDir();
  const fileName = `${poll.slug}-v${version}.pdf`;
  fs.writeFileSync(path.join(UPLOAD_DIR, fileName), pdfBuffer);
  const pdfUrl = `/uploads/pv/${fileName}`;

  const contentJson = {
    poll_title: poll.title,
    organizer: poll.display_organizer_name,
    closed_at: poll.close_at,
    candidates: candidates.map((c) => ({ name: c.display_name, category: c.category_name, score: c.score, rank: c.rank })),
  };

  const { rows } = await pool.query(
    `INSERT INTO closing_reports (poll_id, version, content_json, sha256_hash, pdf_url, public, generated_at, supervisor_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING report_id, version, pdf_url, sha256_hash, generated_at`,
    [pollId, version, JSON.stringify(contentJson), sha256Hash, pdfUrl, publicReport, generatedAt, resolvedSupervisorId]
  );

  return rows[0];
}

/**
 * Clôture automatique des scrutins dont l'échéance (close_at) est dépassée
 * et déclenchement immédiat de la génération du PV correspondant. Jusqu'ici
 * RIEN dans le backend ne faisait jamais passer un scrutin en CLOSED ni
 * n'appelait generateClosingReport automatiquement : postGeneratePv existait
 * mais n'était appelé par aucun job, donc en pratique la page résultats et
 * le PV restaient indéfiniment indisponibles pour tout scrutin arrivé à
 * échéance sans intervention manuelle. Appelé par le cron dans server.js
 * (même pattern que expirePendingTransactions).
 */
export async function closeElapsedPolls() {
  const { rows: pollsToClose } = await pool.query(
    `SELECT poll_id, slug FROM polls
     WHERE status IN ('PUBLISHED', 'OPEN') AND close_at <= now()`
  );

  const results = [];
  for (const { poll_id, slug } of pollsToClose) {
    try {
      await pool.query(`UPDATE polls SET status = 'CLOSED' WHERE poll_id = $1`, [poll_id]);
      const report = await generateClosingReport(poll_id, { publicReport: true });
      results.push({ poll_id, slug, report_id: report.report_id, success: true });
    } catch (err) {
      // Un échec de génération de PV ne doit jamais empêcher la clôture des
      // autres scrutins de ce même passage de cron, ni rouvrir le scrutin —
      // le statut CLOSED est déjà posé ; le PV pourra être régénéré
      // manuellement via POST /:slug/pv/generate en cas d'erreur ponctuelle.
      console.error(`[closeElapsedPolls] Échec génération PV pour ${slug} :`, err.message);
      results.push({ poll_id, slug, success: false, error: err.message });
    }
  }
  return results;
}
