import crypto from "node:crypto";
import { pool } from "../db/pool.js";

// ---------------------------------------------------------------------------
// Tickets de support
//
// Alignement avec le schema reel (db/migrations/10_support_notifications_audit.sql) :
//   - la colonne s'appelle `number`, pas `ticket_number` (alias en SELECT
//     pour ne pas casser le frontend existant).
//   - `subject` est un ENUM (ticket_subject: VOTE/TICKET/PAYMENT/REFUND/
//     FRAUD/TECHNICAL/OTHER), pas un texte libre.
//   - pas de colonne attachments_json sur support_tickets : les pieces
//     jointes vivent sur ticket_messages (attachments_urls). La description
//     initiale est donc aussi enregistree comme premier message.
//   - visitor_id est desormais nullable (migration 15) pour les tickets
//     ouverts par un organisateur connecte (pas de visitor anonyme associe).
// ---------------------------------------------------------------------------

const VALID_SUBJECTS = ["VOTE", "TICKET", "PAYMENT", "REFUND", "FRAUD", "TECHNICAL", "OTHER"];

/**
 * Crée un nouveau ticket de support, avec la description initiale comme
 * premier message (pour permettre les pièces jointes, qui vivent sur
 * ticket_messages).
 */
export async function createSupportTicket(userId, data) {
  const { subject, description, attachments } = data;

  if (!subject || !description) {
    throw new Error("Sujet et description requis.");
  }

  const normalizedSubject = String(subject).toUpperCase();
  if (!VALID_SUBJECTS.includes(normalizedSubject)) {
    throw new Error(`Sujet invalide. Valeurs acceptées : ${VALID_SUBJECTS.join(", ")}.`);
  }

  if (description.length < 20) {
    throw new Error("La description doit faire au minimum 20 caractères.");
  }

  const ticketId = crypto.randomUUID();
  const ticketNumber = `TK-${Date.now().toString(36).toUpperCase()}`;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `INSERT INTO support_tickets
         (ticket_id, number, user_id, subject, description, status)
       VALUES ($1, $2, $3, $4, $5, 'OPEN')
       RETURNING ticket_id, number AS ticket_number, subject, description, status, created_at`,
      [ticketId, ticketNumber, userId, normalizedSubject, description]
    );

    await client.query(
      `INSERT INTO ticket_messages (ticket_id, author_id, author_role, content, attachments_urls)
       VALUES ($1, $2, 'user', $3, $4)`,
      [ticketId, userId, description, (attachments || []).map((a) => a.url || a).filter(Boolean)]
    );

    await client.query("COMMIT");
    return rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Liste les tickets d'un utilisateur avec pagination.
 */
export async function getUserTickets(userId, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  const { rows } = await pool.query(
    `SELECT ticket_id, number AS ticket_number, subject, status, created_at, updated_at
     FROM support_tickets
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, pageSize, offset]
  );

  const { rows: countRows } = await pool.query(
    `SELECT count(*)::int AS total FROM support_tickets WHERE user_id = $1`,
    [userId]
  );

  return { items: rows, total: countRows[0].total, page, pageSize };
}

/**
 * Récupère les détails d'un ticket.
 */
export async function getTicketDetails(ticketId, userId) {
  const { rows } = await pool.query(
    `SELECT ticket_id, number AS ticket_number, user_id, subject, description, status, created_at, updated_at
     FROM support_tickets
     WHERE ticket_id = $1 AND user_id = $2`,
    [ticketId, userId]
  );

  if (rows.length === 0) {
    throw new Error("Ticket non trouvé.");
  }

  return rows[0];
}

/**
 * Liste TOUS les tickets pour l'admin (sans limite utilisateur).
 */
export async function getAllTickets(page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;
  const { rows } = await pool.query(
    `SELECT ticket_id, number AS ticket_number, user_id, subject, status, created_at
     FROM support_tickets
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [pageSize, offset]
  );

  const { rows: countRows } = await pool.query(`SELECT count(*)::int AS total FROM support_tickets`);

  return { items: rows, total: countRows[0].total, page, pageSize };
}