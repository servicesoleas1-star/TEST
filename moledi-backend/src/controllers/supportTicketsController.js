import { createSupportTicket, getUserTickets, getTicketDetails } from "../store/supportTicketsStore.js";
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
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.pageSize, 10) || 10));
  return { page, pageSize };
}

// ---------------------------------------------------------------------------
// POST /api/support/tickets
// Créer un nouveau ticket de support
// Body: { email, subject, description, attachments }
// ---------------------------------------------------------------------------
export async function createTicketHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { subject, description, attachments } = req.body;

  try {
    // Valider attachments (max 5 × 5 Mo)
    if (attachments && Array.isArray(attachments)) {
      if (attachments.length > 5) {
        return res.status(400).json({ error: "Maximum 5 pièces jointes autorisées." });
      }

      for (const att of attachments) {
        if (att.size > 5 * 1024 * 1024) {
          return res.status(400).json({ error: "Chaque fichier ne doit pas dépasser 5 Mo." });
        }
      }
    }

    const ticket = await createSupportTicket(user.user_id, {
      subject,
      description,
      attachments,
    });

    // TODO: Envoyer email avec numéro de ticket
    // TODO: Notifier admin
    console.log(`[INFO] Ticket créé : ${ticket.ticket_number}`);

    return res.status(201).json(ticket);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// GET /api/support/tickets?email=&page=&pageSize=
// Lister les tickets de l'utilisateur
// ---------------------------------------------------------------------------
export async function listTicketsHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  const { page, pageSize } = parsePagination(req);

  try {
    const result = await getUserTickets(user.user_id, page, pageSize);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
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
    const ticket = await getTicketDetails(ticketId, user.user_id);
    return res.status(200).json(ticket);
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }
}