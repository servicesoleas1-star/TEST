import {
  addTicketMessage,
  getTicketMessages,
  getTicketWithDetails,
  updateTicketStatus,
  reopenTicket,
} from "../store/ticketMessagesStore.js";
import { findUserByEmail } from "../store/dashboardStore.js";

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

function parsePagination(req, MAX_PAGE_SIZE = 50) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.pageSize, 10) || 20));
  return { page, pageSize };
}

// ---------------------------------------------------------------------------
// GET /api/support/tickets/:ticketId?email=
// Récupérer les détails d'un ticket
// ---------------------------------------------------------------------------
export async function getTicketHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { ticketId } = req.params;

  try {
    const ticket = await getTicketWithDetails(ticketId, user.user_id);
    return res.status(200).json(ticket);
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// GET /api/support/tickets/:ticketId/messages?email=&page=&pageSize=
// Récupérer les messages d'un ticket avec pagination
// ---------------------------------------------------------------------------
export async function getMessagesHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { ticketId } = req.params;
  const { page, pageSize } = parsePagination(req);

  try {
    // Vérifier que l'utilisateur est propriétaire du ticket
    const ticket = await getTicketWithDetails(ticketId, user.user_id);
    if (!ticket) {
      return res.status(403).json({ error: "Accès refusé." });
    }

    const result = await getTicketMessages(ticketId, page, pageSize);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// POST /api/support/tickets/:ticketId/messages
// Ajouter un message au ticket (user répond)
// Body: { email, message }
// ---------------------------------------------------------------------------
export async function addMessageHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { ticketId } = req.params;
  const { message } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: "Message vide." });
  }

  try {
    // Vérifier ownership
    const ticket = await getTicketWithDetails(ticketId, user.user_id);
    if (!ticket) {
      return res.status(403).json({ error: "Accès refusé." });
    }

    const newMessage = await addTicketMessage(ticketId, user.user_id, message, "user");

    // Remettre en OPEN si réouverture après CLOSED
    if (ticket.status === "CLOSED") {
      await reopenTicket(ticketId, user.user_id);
    }

    // TODO: Notifier admin
    console.log(`[INFO] Message ajouté au ticket ${ticketId}`);

    return res.status(201).json(newMessage);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/support/tickets/:ticketId/status
// Mettre à jour le statut (admin seulement, à implémenter avec auth)
// Body: { email, status }
// ---------------------------------------------------------------------------
export async function updateStatusHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { ticketId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Statut requis." });
  }

  try {
    // TODO: Vérifier que l'utilisateur est admin
    const updated = await updateTicketStatus(ticketId, status);
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// POST /api/support/tickets/:ticketId/reopen
// Réouvrir un ticket fermé
// Body: { email }
// ---------------------------------------------------------------------------
export async function reopenTicketHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { ticketId } = req.params;

  try {
    const updated = await reopenTicket(ticketId, user.user_id);
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}