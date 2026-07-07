import { pool } from "../db/pool.js";

// ---------------------------------------------------------------------------
// Messages de tickets et suivi
//
// Alignement avec le schema reel (ticket_messages) :
//   - author_id (pas user_id), author_role (pas sender_type), content (pas
//     message), attachments_urls. Alias en SELECT pour garder la meme forme
//     de reponse JSON qu'avant (message, sender_type, user_id) et ne pas
//     casser le frontend existant.
//   - support_tickets.number (pas ticket_number), meme traitement.
// ---------------------------------------------------------------------------

/**
 * Ajoute un message au ticket (utilisateur ou admin).
 */
export async function addTicketMessage(ticketId, userId, message, senderType = "user") {
  const { rows } = await pool.query(
    `INSERT INTO ticket_messages (ticket_id, author_id, author_role, content)
     VALUES ($1, $2, $3, $4)
     RETURNING message_id, ticket_id, author_id AS user_id, content AS message, author_role AS sender_type, created_at`,
    [ticketId, userId, senderType, message]
  );
  return rows[0];
}

/**
 * Récupère tous les messages d'un ticket avec pagination.
 */
export async function getTicketMessages(ticketId, page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;
  const { rows } = await pool.query(
    `SELECT message_id, ticket_id, author_id AS user_id, content AS message, author_role AS sender_type, created_at
     FROM ticket_messages
     WHERE ticket_id = $1
     ORDER BY created_at ASC
     LIMIT $2 OFFSET $3`,
    [ticketId, pageSize, offset]
  );

  const { rows: countRows } = await pool.query(
    `SELECT count(*)::int AS total FROM ticket_messages WHERE ticket_id = $1`,
    [ticketId]
  );

  return { items: rows, total: countRows[0].total, page, pageSize };
}

/**
 * Récupère les détails d'un ticket avec son nombre de messages.
 */
export async function getTicketWithDetails(ticketId, userId) {
  const { rows } = await pool.query(
    `SELECT
       t.ticket_id,
       t.number AS ticket_number,
       t.user_id,
       t.subject,
       t.description,
       t.status,
       t.created_at,
       t.updated_at,
       (SELECT count(*)::int FROM ticket_messages WHERE ticket_id = t.ticket_id) AS message_count
     FROM support_tickets t
     WHERE t.ticket_id = $1 AND t.user_id = $2`,
    [ticketId, userId]
  );

  if (rows.length === 0) {
    throw new Error("Ticket non trouvé.");
  }

  return rows[0];
}

/**
 * Met à jour le statut d'un ticket.
 */
export async function updateTicketStatus(ticketId, newStatus) {
  const validStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
  if (!validStatuses.includes(newStatus)) {
    throw new Error("Statut invalide.");
  }

  const { rows } = await pool.query(
    `UPDATE support_tickets
     SET status = $1, updated_at = now()
     WHERE ticket_id = $2
     RETURNING ticket_id, status, updated_at`,
    [newStatus, ticketId]
  );

  if (rows.length === 0) {
    throw new Error("Ticket non trouvé.");
  }

  return rows[0];
}

/**
 * Réouvre un ticket fermé.
 */
export async function reopenTicket(ticketId, userId) {
  const { rows } = await pool.query(
    `UPDATE support_tickets
     SET status = 'OPEN', updated_at = now()
     WHERE ticket_id = $1 AND user_id = $2 AND status = 'CLOSED'
     RETURNING ticket_id, status`,
    [ticketId, userId]
  );

  if (rows.length === 0) {
    throw new Error("Impossible de réouvrir ce ticket.");
  }

  return rows[0];
}