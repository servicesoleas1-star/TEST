import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  TrendingUp,
  Vote,
  Bell,
  Users,
  KeyRound,
  BarChart3,
  Settings,
  Download,
  Send,
  AlertCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getOrganizerSessionEmail } from "../lib/session.js";
 
const API_BASE = "http://localhost:4000";
 
// Recharts consomme des couleurs directement (fill/stroke), pas de classes
// Tailwind possibles ici — valeurs alignées à la main sur les tokens du thème.
const CHART_SECONDARY = "#2B6BFF";
const CHART_PRIMARY = "#FF6A00";
const CHART_LINE = "#E4E2DC";
const CHART_MUTED = "#3D3F54B3";
 
const STATUS_STYLES = {
  DRAFT: { bg: "#F3F4F6", color: "#6B7280", label: "Brouillon" },
  PENDING_VALIDATION: { bg: "#FEF3C7", color: "#B45309", label: "En validation" },
  PUBLISHED: { bg: "#DBEAFE", color: "#2B6BFF", label: "Publié" },
  OPEN: { bg: "#ECFDF5", color: "#1B7A3D", label: "Ouvert" },
  SUSPENDED: { bg: "#FEE2E2", color: "#B42318", label: "Suspendu" },
  CLOSED: { bg: "#F3F4F6", color: "#6B7280", label: "Clôturé" },
  CANCELLED: { bg: "#FEE2E2", color: "#B42318", label: "Annulé" },
  REJECTED: { bg: "#FEE2E2", color: "#B42318", label: "Rejeté" },
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
 
function formatAmount(n) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(n || 0));
}
 
function KpiCard({ icon: Icon, label, value, unit, color }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-2 bg-white border border-ink-200">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink-700">{label}</span>
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}1A` }}
        >
          <Icon size={18} color={color} />
        </span>
      </div>
      <div className="text-2xl font-bold text-ink-900">
        {value}
        {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
      </div>
    </div>
  );
}
 
function CampaignRow({ campaign }) {
  const style = STATUS_STYLES[campaign.status] || STATUS_STYLES.DRAFT;
  return (
    <tr className="border-t border-ink-200">
      <td className="py-3 text-ink-900 font-semibold">{campaign.title}</td>
      <td className="py-3">
        <span
          className="text-xs font-semibold px-2 py-1 rounded-lg"
          style={{ backgroundColor: style.bg, color: style.color }}
        >
          {style.label}
        </span>
      </td>
      <td className="py-3 text-ink-700">{campaign.vote_count || 0}</td>
      <td className="py-3 text-xs text-ink-700">
        {new Date(campaign.created_at).toLocaleDateString("fr-FR")}
      </td>
      <td className="py-3">
        <div className="flex gap-2">
          <Link
            to={`/dashboard/campagnes/${campaign.campaign_id}/candidats`}
            className="p-1.5 rounded-lg border border-ink-200 text-secondary"
            title="Candidats"
          >
            <Users size={14} />
          </Link>
          <Link
            to={`/dashboard/campagnes/${campaign.campaign_id}/codes`}
            className="p-1.5 rounded-lg border border-ink-200 text-secondary"
            title="Codes uniques"
          >
            <KeyRound size={14} />
          </Link>
          <Link
            to={`/dashboard/campagnes/${campaign.campaign_id}/analytics`}
            className="p-1.5 rounded-lg border border-ink-200 text-secondary"
            title="Analytics"
          >
            <BarChart3 size={14} />
          </Link>
        </div>
      </td>
    </tr>
  );
}
 
function PayoutSection({ email, balance, onRequested }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await apiPost("/api/dashboard/payout-requests", {
        email,
        amount: Number(amount),
        phone,
        country,
      });
      setSuccess(true);
      setAmount("");
      setPhone("");
      setCountry("");
      onRequested?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };
 
  return (
    <div className="rounded-2xl bg-white p-5 border border-ink-200">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold flex items-center gap-2 text-ink-900">
          <Wallet size={18} /> Solde disponible
        </h2>
      </div>
      <p className="text-3xl font-bold text-ink-900 mb-1">
        {formatAmount(balance.available_balance)}{" "}
        <span className="text-sm font-normal text-ink-700">FCFA</span>
      </p>
      <p className="text-xs text-ink-700 mb-4">
        + {formatAmount(balance.reserved_balance)} FCFA réservés (en cours de traitement)
      </p>
 
      {success && (
        <div className="flex items-start gap-2 text-sm rounded-xl p-3 mb-3" style={{ backgroundColor: "#ECFDF5", color: "#1B7A3D" }}>
          <span>✓ Demande de retrait envoyée. Elle sera traitée sous peu.</span>
        </div>
      )}
 
      {!open ? (
        <button onClick={() => setOpen(true)} className="btn btn-primary !text-sm">
          Demander un retrait
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="number"
            min="1"
            placeholder="Montant (FCFA)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="rounded-xl px-3 py-2 text-sm border border-ink-200"
          />
          <input
            type="tel"
            placeholder="Numéro Mobile Money"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="rounded-xl px-3 py-2 text-sm border border-ink-200"
          />
          <input
            type="text"
            placeholder="Pays"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            className="rounded-xl px-3 py-2 text-sm border border-ink-200"
          />
          {error && (
            <div className="flex items-start gap-2 text-sm rounded-xl p-3" style={{ backgroundColor: "#FDECEC", color: "#B42318" }}>
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 text-sm font-medium py-2.5 rounded-xl text-ink-900 border border-ink-200"
            >
              Annuler
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary flex-1 !text-sm disabled:opacity-50">
              <Send size={14} /> {submitting ? "Envoi..." : "Confirmer"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
 
export default function OrganizerDashboardPage() {
  const email = getOrganizerSessionEmail();
 
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState({ revenue: [], votes: [] });
  const [campaigns, setCampaigns] = useState({ items: [], total: 0, page: 1, pageSize: 10 });
  const [activity, setActivity] = useState({ items: [], total: 0 });
  const [notifications, setNotifications] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
 
  const loadAll = useCallback(async () => {
    if (!email) return;
    try {
      const q = `email=${encodeURIComponent(email)}`;
      const [summaryData, chartsData, campaignsData, activityData, notifData] = await Promise.all([
        apiGet(`/api/dashboard/summary?${q}`),
        apiGet(`/api/dashboard/charts?${q}&days=30`),
        apiGet(`/api/dashboard/campaigns?${q}&page=1&pageSize=10`),
        apiGet(`/api/dashboard/activity?${q}&page=1&pageSize=8`),
        apiGet(`/api/dashboard/notifications?${q}&page=1&pageSize=6`),
      ]);
      setSummary(summaryData);
      setCharts(chartsData);
      setCampaigns(campaignsData);
      setActivity(activityData);
      setNotifications(notifData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [email]);
 
  useEffect(() => {
    loadAll();
  }, [loadAll]);
 
  const handleExport = async () => {
    setExporting(true);
    try {
      const q = `email=${encodeURIComponent(email)}`;
      const data = await apiGet(`/api/dashboard/export/financial?${q}`);
      window.location.href = `${API_BASE}${data.download_url}`;
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  };
 
  if (!email) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-6 bg-white text-ink-900">
        <h1 className="text-xl font-bold">Session introuvable</h1>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 px-4 sm:px-8 py-4 flex items-center justify-between gap-3 bg-white border-b border-ink-200">
        <h1 className="text-lg sm:text-xl font-bold text-ink-900">
          Tableau de bord
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-xl text-secondary border border-ink-200 disabled:opacity-50"
          >
            <Download size={16} /> {exporting ? "Génération..." : "Export financier"}
          </button>
          <Link
            to="/dashboard/parametres"
            className="p-2 rounded-xl border border-ink-200 text-secondary"
            title="Paramètres"
          >
            <Settings size={18} />
          </Link>
        </div>
      </header>
 
      <main className="px-4 sm:px-8 py-6 max-w-6xl mx-auto flex flex-col gap-6">
        {error && (
          <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: "#FDECEC", color: "#B42318" }}>
            {error}
          </div>
        )}
 
        {loading ? (
          <p className="text-ink-700">Chargement du tableau de bord…</p>
        ) : (
          <>
            {/* KPI Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                icon={Vote}
                label="Campagnes actives"
                value={summary?.active_campaigns || 0}
                color={CHART_SECONDARY}
              />
              <KpiCard
                icon={TrendingUp}
                label="Votes ce mois-ci"
                value={summary?.votes_this_month || 0}
                color={CHART_PRIMARY}
              />
              <KpiCard
                icon={Wallet}
                label="Revenu ce mois-ci"
                value={formatAmount(summary?.revenue_this_month)}
                unit="FCFA"
                color="#1B7A3D"
              />
              <KpiCard
                icon={Bell}
                label="Alertes non lues"
                value={summary?.unread_alerts || 0}
                color="#B42318"
              />
            </div>
 
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Solde + retrait */}
              <PayoutSection
                email={email}
                balance={{
                  available_balance: summary?.available_balance,
                  reserved_balance: summary?.reserved_balance,
                }}
                onRequested={loadAll}
              />
 
              {/* Notifications */}
              <div className="rounded-2xl bg-white p-5 border border-ink-200 lg:col-span-2">
                <h2 className="font-semibold mb-3 flex items-center gap-2 text-ink-900">
                  <Bell size={18} /> Notifications récentes
                </h2>
                {notifications.items.length === 0 ? (
                  <p className="text-sm text-ink-700">Aucune notification.</p>
                ) : (
                  <div className="space-y-2">
                    {notifications.items.map((n) => (
                      <div
                        key={n.notif_id}
                        className={`text-sm p-3 rounded-xl border border-ink-200 ${n.read ? "" : "bg-secondary-50"}`}
                      >
                        <p className="font-semibold text-ink-900">{n.title}</p>
                        <p className="text-ink-700 text-xs mt-0.5">{n.message}</p>
                        <p className="text-ink-700 text-[11px] mt-1">
                          {new Date(n.created_at).toLocaleString("fr-FR")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
 
            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white p-5 border border-ink-200">
                <h2 className="font-semibold mb-3 text-ink-900">Revenus (30 derniers jours)</h2>
                {charts.revenue.length === 0 ? (
                  <p className="text-ink-700">Pas de données.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={charts.revenue}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_PRIMARY} stopOpacity={0.35} />
                          <stop offset="95%" stopColor={CHART_PRIMARY} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke={CHART_LINE} vertical={false} />
                      <XAxis
                        dataKey="day"
                        tickFormatter={(d) => new Date(d).toLocaleDateString("fr-FR", { month: "2-digit", day: "2-digit" })}
                        fontSize={11}
                        stroke={CHART_MUTED}
                      />
                      <YAxis fontSize={11} stroke={CHART_MUTED} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${CHART_LINE}` }} />
                      <Area type="monotone" dataKey="amount" stroke={CHART_PRIMARY} fill="url(#colorRevenue)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
 
              <div className="rounded-2xl bg-white p-5 border border-ink-200">
                <h2 className="font-semibold mb-3 text-ink-900">Votes (30 derniers jours)</h2>
                {charts.votes.length === 0 ? (
                  <p className="text-ink-700">Pas de données.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={charts.votes}>
                      <CartesianGrid stroke={CHART_LINE} vertical={false} />
                      <XAxis
                        dataKey="day"
                        tickFormatter={(d) => new Date(d).toLocaleDateString("fr-FR", { month: "2-digit", day: "2-digit" })}
                        fontSize={11}
                        stroke={CHART_MUTED}
                      />
                      <YAxis fontSize={11} stroke={CHART_MUTED} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${CHART_LINE}` }} />
                      <Bar dataKey="count" fill={CHART_SECONDARY} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
 
            {/* Campagnes */}
            <div className="rounded-2xl bg-white p-5 border border-ink-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-ink-900">Mes campagnes</h2>
                <a href="/inscription" className="btn btn-primary !text-sm !py-2">
                  Nouvelle campagne
                </a>
              </div>
              {campaigns.items.length === 0 ? (
                <p className="text-ink-700">Aucune campagne pour le moment.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-ink-700">
                        <th className="pb-2 font-medium">Titre</th>
                        <th className="pb-2 font-medium">Statut</th>
                        <th className="pb-2 font-medium">Votes</th>
                        <th className="pb-2 font-medium">Créée le</th>
                        <th className="pb-2 font-medium">Gérer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.items.map((c) => (
                        <CampaignRow key={c.campaign_id} campaign={c} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
 
            {/* Activité récente */}
            <div className="rounded-2xl bg-white p-5 border border-ink-200">
              <h2 className="font-semibold mb-3 text-ink-900">Activité récente</h2>
              {activity.items.length === 0 ? (
                <p className="text-ink-700">Aucune activité récente.</p>
              ) : (
                <div className="space-y-2">
                  {activity.items.map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-sm border-t border-ink-200 pt-2 first:border-t-0 first:pt-0">
                      <span className="text-ink-900">
                        Vote {a.detail === "PAID" ? "payant" : "gratuit"} — {a.campaign_title}
                      </span>
                      <span className="text-ink-700 text-xs">
                        {new Date(a.created_at).toLocaleString("fr-FR")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
 