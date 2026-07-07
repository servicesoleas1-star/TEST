import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { getOrganizerSessionEmail } from "../lib/session.js";

const API_BASE = "http://localhost:4000";

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Erreur de chargement.");
  return data;
}

export default function SupportTicketsPage() {
  const email = getOrganizerSessionEmail();
  const [tickets, setTickets] = useState({ items: [], total: 0, page: 1, pageSize: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTickets = useCallback(
    async (page = 1) => {
      if (!email) return;
      try {
        const data = await apiGet(
          `/api/support/tickets?email=${encodeURIComponent(email)}&page=${page}&pageSize=10`
        );
        setTickets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [email]
  );

  useEffect(() => {
    loadTickets(1);
  }, [loadTickets]);

  if (!email) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-6 bg-white text-ink-900">
        <h1 className="text-xl font-bold">Session introuvable</h1>
      </div>
    );
  }

  const totalPages = Math.ceil(tickets.total / tickets.pageSize);

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 px-4 sm:px-8 py-4 flex items-center gap-3 bg-white border-b border-ink-200">
        <Link to="/organisateur/tableau-de-bord" className="text-secondary">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg sm:text-xl font-bold text-ink-900">
          Mes tickets de support
        </h1>
      </header>

      <main className="px-4 sm:px-8 py-6 max-w-4xl mx-auto flex flex-col gap-6">
        {error && (
          <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: "#FDECEC", color: "#B42318" }}>
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-ink-700">Chargement des tickets…</p>
        ) : tickets.items.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center border border-ink-200">
            <p className="text-ink-700">Aucun ticket pour le moment.</p>
            <p className="text-sm mt-2 text-ink-700">
              Cliquez sur le bouton support pour ouvrir un nouveau ticket.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {tickets.items.map((ticket) => (
                <Link
                  key={ticket.ticket_id}
                  to={`/support/tickets/${ticket.ticket_id}`}
                  className="no-underline"
                >
                  <div className="rounded-2xl bg-white p-4 sm:p-5 cursor-pointer hover:shadow-md transition border border-ink-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm text-ink-900">
                            {ticket.subject}
                          </p>
                          {ticket.status === "OPEN" && (
                            <span
                              className="text-xs font-semibold px-2 py-1 rounded-lg flex items-center gap-1"
                              style={{ backgroundColor: "#FEF3C7", color: "#B45309" }}
                            >
                              <Clock size={12} /> Ouvert
                            </span>
                          )}
                          {ticket.status === "CLOSED" && (
                            <span
                              className="text-xs font-semibold px-2 py-1 rounded-lg flex items-center gap-1"
                              style={{ backgroundColor: "#ECFDF5", color: "#1B7A3D" }}
                            >
                              <CheckCircle size={12} /> Fermé
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-ink-700">
                          {ticket.ticket_number}
                        </p>
                        <p className="text-xs mt-1 text-ink-700">
                          {new Date(ticket.created_at).toLocaleString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between text-sm text-ink-900">
                <button
                  onClick={() => loadTickets(tickets.page - 1)}
                  disabled={tickets.page <= 1}
                  className="px-3 py-2 rounded-lg disabled:opacity-30 border border-ink-200"
                >
                  Précédent
                </button>
                <span className="text-ink-700">
                  Page {tickets.page} / {totalPages}
                </span>
                <button
                  onClick={() => loadTickets(tickets.page + 1)}
                  disabled={tickets.page >= totalPages}
                  className="px-3 py-2 rounded-lg disabled:opacity-30 border border-ink-200"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}