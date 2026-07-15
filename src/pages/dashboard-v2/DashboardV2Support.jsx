import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LifeBuoy, Send, MessageCircle, Plus } from "lucide-react";
import { getOrganizerSessionEmail } from "../../lib/session.js";
import { usePlatformConfig } from "../../components/PlatformConfig";
import { apiGet, apiPost, formatDateTime } from "./dashboardApi.js";

const SUBJECT_OPTIONS = [
  { value: "VOTE", label: "Problème de vote" },
  { value: "TICKET", label: "Billetterie" },
  { value: "PAYMENT", label: "Paiement" },
  { value: "REFUND", label: "Remboursement" },
  { value: "FRAUD", label: "Fraude suspectée" },
  { value: "TECHNICAL", label: "Problème technique" },
  { value: "OTHER", label: "Autre" },
];

const STATUS_STYLES = {
  OPEN: { label: "Ouvert", color: "#2B6BFF", bg: "#DBEAFE" },
  IN_PROGRESS: { label: "En cours", color: "#B45309", bg: "#FEF3C7" },
  RESOLVED: { label: "Résolu", color: "#1B7A3D", bg: "#ECFDF5" },
  CLOSED: { label: "Fermé", color: "#6B7280", bg: "#F3F4F6" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.OPEN;
  return (
    <span className="text-[11px] font-semibold px-2 py-1 rounded-lg shrink-0" style={{ backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function NewTicketForm({ email, onCreated }) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("VOTE");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (description.trim().length < 20) {
      setError("La description doit faire au minimum 20 caractères.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await apiPost("/api/support/tickets", { email, subject, description });
      setDescription("");
      setOpen(false);
      onCreated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn btn-primary !text-sm">
        <Plus size={15} /> Ouvrir un ticket
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-ink-200 p-5 flex flex-col gap-3">
      <select value={subject} onChange={(e) => setSubject(e.target.value)} className="rounded-xl border border-ink-200 px-3 py-2.5 text-sm">
        {SUBJECT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Décrivez votre problème (20 caractères minimum)…"
        rows={4}
        className="rounded-xl border border-ink-200 px-3 py-2.5 text-sm resize-none"
      />
      {error && <p className="text-sm" style={{ color: "#B42318" }}>{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="flex-1 text-sm font-medium py-2.5 rounded-xl text-ink-900 border border-ink-200">
          Annuler
        </button>
        <button type="submit" disabled={submitting} className="btn btn-primary flex-1 !text-sm disabled:opacity-50">
          {submitting ? "Envoi…" : "Envoyer"}
        </button>
      </div>
    </form>
  );
}

export function DashboardV2SupportList() {
  const email = getOrganizerSessionEmail();
  const { supportWhatsAppNumber } = usePlatformConfig();
  const [data, setData] = useState({ items: [], total: 0 });

  function load() {
    if (!email) return;
    apiGet(`/api/support/tickets?email=${encodeURIComponent(email)}&page=1&pageSize=30`).then(setData);
  }
  useEffect(load, [email]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-ink-900 flex items-center gap-2">
          <LifeBuoy size={20} /> Support
        </h1>
        <a
          href={`https://wa.me/${(supportWhatsAppNumber || "").replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl text-white bg-[#25D366]"
        >
          <MessageCircle size={16} /> WhatsApp direct
        </a>
      </div>

      <NewTicketForm email={email} onCreated={load} />

      {data.items.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 border border-ink-200 text-center text-sm text-ink-700">
          Aucun ticket de support pour le moment.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {data.items.map((t) => (
            <Link
              key={t.ticket_id}
              to={`/dashboard-v2/support/${t.ticket_id}`}
              className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-ink-200 hover:border-primary transition-colors"
            >
              <div className="min-w-0">
                <p className="text-xs font-mono text-ink-400">{t.ticket_number}</p>
                <p className="font-semibold text-ink-900 text-sm truncate">
                  {SUBJECT_OPTIONS.find((o) => o.value === t.subject)?.label || t.subject}
                </p>
                <p className="text-xs text-ink-700 mt-0.5">{formatDateTime(t.created_at)}</p>
              </div>
              <StatusBadge status={t.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function DashboardV2TicketDetail() {
  const { ticketId } = useParams();
  const email = getOrganizerSessionEmail();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  function load() {
    if (!email || !ticketId) return;
    const q = `email=${encodeURIComponent(email)}`;
    apiGet(`/api/support/tickets/${ticketId}?${q}`).then(setTicket);
    apiGet(`/api/support/tickets/${ticketId}/messages?${q}`).then((d) => setMessages(d.items || []));
  }
  useEffect(load, [email, ticketId]);

  async function handleReply(e) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      await apiPost(`/api/support/tickets/${ticketId}/messages`, { email, message: reply });
      setReply("");
      load();
    } finally {
      setSending(false);
    }
  }

  if (!ticket) return <p className="text-sm text-ink-700">Chargement…</p>;

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div>
        <Link to="/dashboard-v2/support" className="text-xs font-semibold text-secondary">← Support</Link>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <h1 className="text-lg font-bold text-ink-900">{ticket.ticket_number}</h1>
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-ink-200 p-5 flex flex-col gap-3">
        {messages.map((m) => (
          <div
            key={m.message_id}
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
              m.sender_type === "user" ? "self-end bg-primary text-white" : "self-start bg-ink-100 text-ink-900"
            }`}
          >
            <p>{m.message}</p>
            <p className={`text-[10px] mt-1 ${m.sender_type === "user" ? "text-white/70" : "text-ink-400"}`}>
              {formatDateTime(m.created_at)}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleReply} className="flex gap-2">
        <input
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Écrire une réponse…"
          className="flex-1 rounded-xl border border-ink-200 px-3 py-2.5 text-sm"
        />
        <button type="submit" disabled={sending} className="btn btn-primary !text-sm disabled:opacity-50">
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
