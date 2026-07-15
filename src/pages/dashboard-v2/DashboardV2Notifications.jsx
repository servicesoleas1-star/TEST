import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { getOrganizerSessionEmail } from "../../lib/session.js";
import { apiGet, apiPost, formatDateTime } from "./dashboardApi.js";

const TYPE_ICON_COLOR = {
  CAMPAIGN_VALIDATED: "#1B7A3D",
  CAMPAIGN_REJECTED: "#B42318",
  PAYMENT: "#2B6BFF",
  PAYOUT: "#F5B93D",
  TICKET_REPLY: "#2B6BFF",
};

export default function DashboardV2Notifications() {
  const email = getOrganizerSessionEmail();
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  function load() {
    if (!email) return;
    apiGet(`/api/dashboard/notifications?email=${encodeURIComponent(email)}&page=1&pageSize=30`)
      .then(setData)
      .finally(() => setLoading(false));
  }

  useEffect(load, [email]);

  async function markAllRead() {
    setMarking(true);
    try {
      await apiPost("/api/dashboard/notifications/mark-all-read", { email });
      load();
    } finally {
      setMarking(false);
    }
  }

  const unreadCount = data.items.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-ink-900 flex items-center gap-2">
          <Bell size={20} /> Notifications
        </h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} disabled={marking} className="btn btn-primary !text-xs !py-2 disabled:opacity-50">
            <CheckCheck size={14} /> Tout marquer comme lu
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-ink-700">Chargement…</p>
      ) : data.items.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 border border-ink-200 text-center text-sm text-ink-700">
          Aucune notification pour le moment.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {data.items.map((n) => (
            <div
              key={n.notif_id}
              className={`flex items-start gap-3 p-4 rounded-2xl border ${n.read ? "border-ink-200 bg-white" : "border-primary/30 bg-primary-50"}`}
            >
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: `${TYPE_ICON_COLOR[n.type] || "#6B7280"}1A` }}
              >
                <Bell size={15} color={TYPE_ICON_COLOR[n.type] || "#6B7280"} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink-900 text-sm">{n.title}</p>
                <p className="text-ink-700 text-sm mt-0.5">{n.message}</p>
                <p className="text-ink-400 text-xs mt-1.5">{formatDateTime(n.created_at)}</p>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
