import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Send, AlertCircle, RotateCcw } from "lucide-react";
import { getOrganizerSessionEmail } from "../lib/session.js";

const API_BASE = "http://localhost:4000";

const STATUS_COLORS = {
  OPEN: { bg: "#FEF3C7", color: "#B45309", label: "Ouvert" },
  IN_PROGRESS: { bg: "#DBEAFE", color: "#2B6BFF", label: "En cours" },
  RESOLVED: { bg: "#ECFDF5", color: "#1B7A3D", label: "Résolu" },
  CLOSED: { bg: "#F3F4F6", color: "#6B7280", label: "Fermé" },
};

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Erreur de chargement.");
  return data;
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");
  return data;
}

export default function TicketDetailPage() {
  const email = getOrganizerSessionEmail();
  const { ticketId } = useParams();

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState({ items: [], total: 0, page: 1, pageSize: 20 });
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  const loadTicket = useCallback(async () => {
    if (!email || !ticketId) return;
    try {
      const ticketData = await apiGet(
        `/api/support/tickets/${ticketId}?email=${encodeURIComponent(email)}`
      );
      setTicket(ticketData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [email, ticketId]);

  const loadMessages = useCallback(
    async (page = 1) => {
      if (!email || !ticketId) return;
      try {
        const data = await apiGet(
          `/api/support/tickets/${ticketId}/messages?email=${encodeURIComponent(email)}&page=${page}&pageSize=20`
        );
        setMessages(data);
      } catch (err) {
        setError(err.message);
      }
    },
    [email, ticketId]
  );

  useEffect(() => {
    loadTicket();
    loadMessages(1);
  }, [loadTicket, loadMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setError("");

    if (!newMessage.trim()) {
      setError("Le message ne peut pas être vide.");
      return;
    }

    setSubmitting(true);
    try {
      await apiPost(`${API_BASE}/api/support/tickets/${ticketId}/messages`, {
        email,
        message: newMessage,
      });
      setToast("Message envoyé !");
      setNewMessage("");
      await loadMessages(1);
      await loadTicket();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReopenTicket = async () => {
    if (!confirm("Êtes-vous sûr de vouloir réouvrir ce ticket ?")) return;

    try {
      await apiPost(`${API_BASE}/api/support/tickets/${ticketId}/reopen`, { email });
      setToast("Ticket réouvert !");
      await loadTicket();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!email) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-ink-900">
        <h1>Session introuvable</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 px-8 py-4 flex items-center gap-3 bg-white border-b border-ink-200">
        <Link to="/support/tickets" className="text-secondary no-underline">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-[18px] font-bold text-ink-900 m-0">
          {loading ? "Chargement..." : ticket?.ticket_number}
        </h1>
      </header>

      <main className="px-8 py-6 max-w-[900px] mx-auto">
        {error && (
          <div className="p-4 rounded-xl mb-6 text-sm" style={{ backgroundColor: "#FDECEC", color: "#B42318" }}>
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-ink-700">Chargement du ticket...</p>
        ) : ticket ? (
          <>
            {/* En-tête ticket */}
            <div className="bg-white border border-ink-200 rounded-xl p-5 mb-6">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-ink-900 m-0 text-xl font-semibold">
                  {ticket.subject}
                </h2>
                <div
                  className="px-3 py-1.5 rounded-md text-xs font-semibold"
                  style={{
                    backgroundColor: STATUS_COLORS[ticket.status].bg,
                    color: STATUS_COLORS[ticket.status].color,
                  }}
                >
                  {STATUS_COLORS[ticket.status].label}
                </div>
              </div>
              <p className="text-ink-700 m-0 text-[13px]">
                {new Date(ticket.created_at).toLocaleString("fr-FR")}
              </p>
              <p className="text-ink-900 mt-3 text-sm leading-relaxed">
                {ticket.description}
              </p>
              {ticket.status === "CLOSED" && (
                <button
                  onClick={handleReopenTicket}
                  className="mt-3 flex items-center gap-1.5 text-secondary border border-ink-200 px-3 py-2 rounded-lg bg-transparent cursor-pointer text-[13px] font-semibold"
                >
                  <RotateCcw size={14} /> Réouvrir
                </button>
              )}
            </div>

            {/* Fil conversation */}
            <div className="bg-white border border-ink-200 rounded-xl p-5 mb-6 max-h-[400px] overflow-y-auto">
              <h3 className="text-ink-900 mt-0 text-sm font-semibold mb-4">
                Conversation ({messages.total})
              </h3>
              {messages.items.length === 0 ? (
                <p className="text-ink-700 text-[13px]">Aucun message pour le moment.</p>
              ) : (
                messages.items.map((msg) => (
                  <div key={msg.message_id} className="mb-3 pb-3 border-b border-ink-200">
                    <p className="text-xs text-ink-700 mb-1 font-semibold">
                      {msg.sender_type === "admin" ? "🛡️ Admin" : "Vous"} —{" "}
                      {new Date(msg.created_at).toLocaleString("fr-FR")}
                    </p>
                    <p className="text-ink-900 m-0 text-sm leading-normal">
                      {msg.message}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Formulaire nouveau message */}
            {ticket.status !== "CLOSED" && (
              <form onSubmit={handleSendMessage} className="bg-white border border-ink-200 rounded-xl p-5">
                <h3 className="text-ink-900 mt-0 text-sm font-semibold mb-3">
                  Répondre
                </h3>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Votre message..."
                  className="w-full p-2.5 rounded-lg border border-ink-200 text-sm mb-3 resize-y min-h-[80px] box-border"
                />
                <button type="submit" disabled={submitting} className="btn btn-primary !text-sm disabled:cursor-not-allowed disabled:opacity-50">
                  <Send size={16} /> {submitting ? "Envoi..." : "Envoyer"}
                </button>
              </form>
            )}
          </>
        ) : null}
      </main>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink-900 text-white px-5 py-3 rounded-lg text-[13px] font-semibold">
          {toast}
        </div>
      )}
    </div>
  );
}