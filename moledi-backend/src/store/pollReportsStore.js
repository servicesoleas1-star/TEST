import { pool } from "../db/pool.js";

// ---------------------------------------------------------------------------
// Routage des signalements (TODO -- envoi d'e-mail réel non branché, aucun
// serveur SMTP configuré pour l'instant, voir .env.example) :
//
//   - TECHNICAL  -> équipe Moledi (support interne). Ce sont les seuls
//     signalements qui NE concernent PAS l'organisateur (bug technique de
//     la plateforme, pas de sa campagne) -- un ticket support_tickets est
//     déjà créé ci-dessous pour ce cas, à faire apparaître dans un futur
//     tableau de bord admin (/admin/tickets, encore à construire).
//   - Tous les autres types (VOTE_NOT_COUNTED, PAYMENT_WITHOUT_VOTE,
//     DUPLICATE_VOTE, WRONG_INFO, SUSPECTED_FRAUD, MISSING_CANDIDATE,
//     WRONG_SCORE, OTHER) -> e-mail à l'organisateur de CE scrutin
//     (users.email, via polls.user_id), pas à l'admin plateforme. Un ticket
//     de support est quand même créé pour garder une trace consultable
//     dans le back-office, même sans envoi d'e-mail fonctionnel pour
//     l'instant.
//
// Une fois un serveur SMTP configuré (SMTP_HOST/SMTP_USER/SMTP_PASS dans
// .env, voir services/emailService.js si déjà présent, sinon à créer sur
// le même modèle que sendEmailVerification()), brancher ici :
//   const organizer = await getPollOrganizerEmail(pollId);
//   if (complaintType === 'TECHNICAL') await notifySupportTeam(report);
//   else await notifyOrganizer(organizer.email, report);
// ---------------------------------------------------------------------------

const COMPLAINT_TO_TICKET_SUBJECT = {
  VOTE_NOT_COUNTED: "VOTE",
  PAYMENT_WITHOUT_VOTE: "PAYMENT",
  DUPLICATE_VOTE: "VOTE",
  TECHNICAL: "TECHNICAL",
  WRONG_INFO: "OTHER",
  SUSPECTED_FRAUD: "FRAUD",
  MISSING_CANDIDATE: "OTHER",
  WRONG_SCORE: "VOTE",
  OTHER: "OTHER",
};

async function nextTicketNumber(client) {
  const { rows } = await client.query(`SELECT count(*)::int AS total FROM support_tickets`);
  return `TKT-${String(rows[0].total + 1).padStart(5, "0")}`;
}

/**
 * Crée un signalement pour un scrutin (poll_reports) ET, en best effort, un
 * ticket de support lié (support_tickets) -- "Génère un ticket de support
 * dans le back-office" (spec fonctionnelle, page Aide/Signalement). Le
 * signalement lui-même est toujours créé même si la création du ticket
 * échoue (ex. visitor_id manquant) : perdre le signalement serait pire que
 * perdre le lien de ticket.
 */
export async function createPollReport({ pollId, campaignId, visitorId, candidateId, reporterName, reporterPhone, complaintType, description, attachmentsUrls }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let ticketId = null;
    if (visitorId) {
      try {
        const number = await nextTicketNumber(client);
        const { rows } = await client.query(
          `INSERT INTO support_tickets (number, visitor_id, campaign_id, subject, description, status)
           VALUES ($1, $2, $3, $4, $5, 'OPEN')
           RETURNING ticket_id`,
          [number, visitorId, campaignId, COMPLAINT_TO_TICKET_SUBJECT[complaintType] || "OTHER", description]
        );
        ticketId = rows[0].ticket_id;
      } catch (err) {
        console.warn("Création du ticket de support liée au signalement échouée :", err.message);
      }
    }

    const { rows: reportRows } = await client.query(
      `INSERT INTO poll_reports (poll_id, candidate_id, reporter_name, reporter_phone, complaint_type, description, attachments_urls, ticket_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING report_id, created_at`,
      [pollId, candidateId || null, reporterName, reporterPhone, complaintType, description, attachmentsUrls || [], ticketId]
    );

    await client.query("COMMIT");
    return reportRows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
