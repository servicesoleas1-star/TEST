import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wallet,
  Vote,
  Bell,
  TrendingUp,
  Gift,
  Ticket,
  ChevronRight,
  Trophy,
  ArrowUpRight,
  AlertTriangle,
  Activity as ActivityIcon,
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
import { getOrganizerSessionEmail } from "../../lib/session.js";
import { apiGet, formatAmount, formatDate, formatDateTime } from "./dashboardApi.js";

const CHART_PRIMARY = "#FF6A00";
const CHART_SECONDARY = "#2B6BFF";
const CHART_LINE = "#E4E2DC";
const CHART_MUTED = "#3D3F54B3";

const PERIOD_PRESETS = [
  { label: "7 jours", days: 7 },
  { label: "30 jours", days: 30 },
  { label: "90 jours", days: 90 },
];

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

// ---------------------------------------------------------------------------
// Animation d'entrée -- chaque bloc du dashboard glisse depuis la gauche ou
// la droite en alternance (au lieu d'un simple fade-up plat), pour un rendu
// plus travaillé au premier affichage de la page.
// ---------------------------------------------------------------------------
const PAGE_STAGGER = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

function revealVariant(direction = "up") {
  const offset =
    direction === "left" ? { x: -36, y: 0 } : direction === "right" ? { x: 36, y: 0 } : { x: 0, y: 22 };
  return {
    hidden: { opacity: 0, ...offset },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
    },
  };
}

function Reveal({ direction, className = "", children }) {
  return (
    <motion.div variants={revealVariant(direction)} className={className}>
      {children}
    </motion.div>
  );
}

function Widget({ className = "", style, children }) {
  return (
    <div
      className={`rounded-2xl bg-white p-5 border border-ink-200 shadow-[0_2px_10px_-4px_rgba(11,19,36,0.06)] relative overflow-hidden ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

// Superpose une image de fond thématique avec un voile sombre dégradé pour
// que le texte blanc reste lisible par-dessus, réutilisé sur les cartes
// vote/dons/tickets/activité.
function bgImageStyle(url) {
  if (!url) return {};
  return {
    backgroundImage: `linear-gradient(160deg, rgba(11,19,36,0.72) 10%, rgba(11,19,36,0.4) 60%, rgba(11,19,36,0.72) 100%), url(${url})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}

const STAT_TILE_IMAGES = {
  Votes: "/election-vote.jpg",
  Dons: "/donation-coins.jpg",
  "Tickets achetés": "/ticket-icon.jpg",
};

function StatTile({ icon: Icon, label, value, unit, color, comingSoon }) {
  const bg = STAT_TILE_IMAGES[label];
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`rounded-2xl p-4 border flex flex-col gap-2 relative overflow-hidden ${
        bg ? "text-white border-transparent" : "bg-white border-ink-200"
      }`}
      style={bg ? bgImageStyle(bg) : undefined}
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold ${bg ? "text-white/90" : "text-ink-700"}`}>{label}</span>
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: bg ? "rgba(255,255,255,0.18)" : `${color}1A` }}
        >
          <Icon size={15} color={bg ? "#fff" : color} />
        </span>
      </div>
      <div className={`text-xl font-bold ${bg ? "text-white" : "text-ink-900"}`}>
        {comingSoon ? (
          <span className={`text-sm font-medium ${bg ? "text-white/70" : "text-ink-400"}`}>Bientôt</span>
        ) : (
          value
        )}
        {!comingSoon && unit && (
          <span className={`text-xs font-normal ml-1 ${bg ? "text-white/70" : "text-ink-700"}`}>{unit}</span>
        )}
      </div>
    </motion.div>
  );
}

function PeriodPicker({ days, onPresetChange, customRange, onCustomRange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5 flex-wrap">
        {PERIOD_PRESETS.map((p) => (
          <button
            key={p.days}
            type="button"
            onClick={() => {
              onPresetChange(p.days);
              setOpen(false);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              !customRange && days === p.days
                ? "bg-primary text-white border-primary"
                : "bg-white text-ink-700 border-ink-200 hover:border-primary"
            }`}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            customRange ? "bg-primary text-white border-primary" : "bg-white text-ink-700 border-ink-200 hover:border-primary"
          }`}
        >
          Personnalisé
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 mt-2 z-20 bg-white border border-ink-200 rounded-2xl shadow-xl p-4 w-72"
        >
          <p className="text-xs font-semibold text-ink-700 mb-2">Choisir une période</p>
          <div className="flex flex-col gap-2">
            <label className="text-[11px] text-ink-700 font-medium">
              Date de début
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-ink-200 px-2 py-1.5 text-sm"
                onChange={(e) => onCustomRange((r) => ({ ...r, start: e.target.value }))}
              />
            </label>
            <label className="text-[11px] text-ink-700 font-medium">
              Date de fin
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-ink-200 px-2 py-1.5 text-sm"
                onChange={(e) => onCustomRange((r) => ({ ...r, end: e.target.value }))}
              />
            </label>
            <button type="button" onClick={() => setOpen(false)} className="btn btn-primary !text-xs !py-2 mt-1">
              Appliquer
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function DashboardV2Home() {
  const email = getOrganizerSessionEmail();
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState({ revenue: [], votes: [] });
  const [campaigns, setCampaigns] = useState({ items: [] });
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [activity, setActivity] = useState({ items: [] });
  const [notifications, setNotifications] = useState({ items: [] });
  const [leaderboard, setLeaderboard] = useState([]);
  const [days, setDays] = useState(30);
  const [customRange, setCustomRange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const effectiveDays = useMemo(() => {
    if (customRange?.start && customRange?.end) {
      const diff = Math.round((new Date(customRange.end) - new Date(customRange.start)) / 86400000);
      return Math.max(1, diff);
    }
    return days;
  }, [customRange, days]);

  const loadAll = useCallback(async () => {
    if (!email) return;
    try {
      const q = `email=${encodeURIComponent(email)}`;
      const [summaryData, campaignsData, activityData, notifData] = await Promise.all([
        apiGet(`/api/dashboard/summary?${q}`),
        apiGet(`/api/dashboard/campaigns?${q}&page=1&pageSize=10`),
        apiGet(`/api/dashboard/activity?${q}&page=1&pageSize=5`),
        apiGet(`/api/dashboard/notifications?${q}&page=1&pageSize=3`),
      ]);
      setSummary(summaryData);
      setCampaigns(campaignsData);
      setActivity(activityData);
      setNotifications(notifData);

      // La campagne "de référence" pour les graphiques et le classement live
      // est la dernière campagne publiée/active de l'organisateur -- priorité
      // à une campagne OPEN, sinon la plus récente publiée, sinon la plus
      // récente tout statut confondu (les items arrivent déjà triés par
      // created_at DESC côté API, voir getPaginatedCampaigns).
      const items = campaignsData.items || [];
      const current =
        items.find((c) => c.status === "OPEN") ||
        items.find((c) => c.status === "PUBLISHED") ||
        items[0] ||
        null;
      setActiveCampaign(current);

      if (current) {
        const cq = `email=${encodeURIComponent(email)}`;
        const [votesData, revenueData] = await Promise.all([
          apiGet(`/api/dashboard/campaigns/${current.campaign_id}/analytics/votes-by-day?${cq}&days=${effectiveDays}`),
          apiGet(`/api/dashboard/campaigns/${current.campaign_id}/analytics/revenue-by-day?${cq}&days=${effectiveDays}`),
        ]);
        setCharts({
          votes: (votesData.items || []).map((d) => ({ day: d.day, count: d.count })),
          revenue: (revenueData.items || []).map((d) => ({ day: d.day, amount: Number(d.amount) })),
        });

        if (current.status === "OPEN") {
          const lb = await apiGet(`/api/dashboard/leaderboard?${q}&campaignId=${current.campaign_id}`);
          setLeaderboard(lb.items.slice(0, 3));
        } else {
          setLeaderboard([]);
        }
      } else {
        setCharts({ revenue: [], votes: [] });
        setLeaderboard([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [email, effectiveDays]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (!email) {
    return (
      <div className="text-center py-20 text-ink-700">Session introuvable. Reconnectez-vous.</div>
    );
  }

  if (loading) {
    return <div className="text-center py-20 text-ink-700">Chargement du tableau de bord…</div>;
  }

  const recentActivity = activity.items.slice(0, 5);

  return (
    <motion.div variants={PAGE_STAGGER} initial="hidden" animate="show" className="flex flex-col gap-6">
      {error && (
        <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: "#FDECEC", color: "#B42318" }}>
          {error}
        </div>
      )}

      {/* Solde disponible -- mis en avant, en tout premier, avec l'image de
          fond solde.jpg (fournie dans public/) */}
      <Reveal direction="up">
        <div
          className="rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden"
          style={{
            backgroundImage:
              "linear-gradient(120deg, rgba(11,19,36,0.88) 0%, rgba(11,19,36,0.6) 55%, rgba(11,19,36,0.9) 100%), url(/solde.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-orange opacity-20 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-white/50 font-semibold mb-2 flex items-center gap-1.5">
                <Wallet size={14} /> Solde disponible
              </p>
              <p className="text-4xl sm:text-5xl font-bold">
                {formatAmount(summary?.available_balance)} <span className="text-lg font-normal text-white/60">FCFA</span>
              </p>
              <p className="text-xs text-white/50 mt-2">
                + {formatAmount(summary?.reserved_balance)} FCFA réservés (en cours de traitement)
              </p>
            </div>
            <Link to="/dashboard-v2/finances?tab=retrait" className="btn btn-primary !text-sm shrink-0">
              Demander un retrait <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </Reveal>

      {/* Campagnes actives + alertes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Reveal direction="left">
          <Widget className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-ink-700 mb-1">Campagnes actives</p>
              <p className="text-2xl font-bold text-ink-900">{summary?.active_campaigns || 0}</p>
            </div>
            <Link to="/dashboard-v2/campagnes" className="text-secondary text-xs font-semibold flex items-center gap-1">
              Voir tout <ChevronRight size={14} />
            </Link>
          </Widget>
        </Reveal>
        <Reveal direction="right">
          <Widget className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-ink-700 mb-1 flex items-center gap-1.5">
                <AlertTriangle size={13} /> Alertes non lues
              </p>
              <p className="text-2xl font-bold text-ink-900">{summary?.unread_alerts || 0}</p>
            </div>
            <Link to="/dashboard-v2/notifications" className="text-secondary text-xs font-semibold flex items-center gap-1">
              Voir tout <ChevronRight size={14} />
            </Link>
          </Widget>
        </Reveal>
      </div>

      {/* Indicateurs mensuels + sélecteur de période */}
      <Reveal direction="up">
        <Widget>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <p className="font-semibold text-ink-900">Indicateurs de la période</p>
            <PeriodPicker
              days={days}
              customRange={customRange}
              onPresetChange={(d) => {
                setDays(d);
                setCustomRange(null);
              }}
              onCustomRange={setCustomRange}
            />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatTile icon={Vote} label="Votes" value={summary?.votes_this_month || 0} color={CHART_PRIMARY} />
            <StatTile icon={Gift} label="Dons" comingSoon color="#1B7A3D" />
            <StatTile icon={Ticket} label="Tickets achetés" comingSoon color={CHART_SECONDARY} />
            <StatTile
              icon={TrendingUp}
              label="Revenus"
              value={formatAmount(summary?.revenue_this_month)}
              unit="FCFA"
              color="#1B7A3D"
            />
          </div>
        </Widget>
      </Reveal>

      {/* Mon activité (raccourci) + campagnes récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Reveal direction="left" className="lg:col-span-1">
          <Widget
            className="h-full flex flex-col justify-between text-white border-transparent"
            style={bgImageStyle("/africa-network.jpg")}
          >
            <div>
              <p className="font-semibold flex items-center gap-1.5 mb-1"><ActivityIcon size={15} /> Mon activité</p>
              <p className="text-sm text-white/80">
                Vous avez effectué <strong className="text-white">{activity.items.length}</strong> action{activity.items.length > 1 ? "s" : ""} récemment.
              </p>
            </div>
            <Link to="/dashboard-v2/activite" className="btn btn-primary !text-xs !py-2 mt-4 self-start">
              Voir tout
            </Link>
          </Widget>
        </Reveal>

        <Reveal direction="right" className="lg:col-span-2">
          <Widget>
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-ink-900">Mes campagnes récentes</p>
              <Link to="/dashboard-v2/campagnes" className="text-secondary text-xs font-semibold flex items-center gap-1">
                Voir tout <ChevronRight size={14} />
              </Link>
            </div>
            {campaigns.items.length === 0 ? (
              <p className="text-sm text-ink-700">Aucune campagne pour le moment.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {campaigns.items.slice(0, 3).map((c) => {
                  const style = STATUS_STYLES[c.status] || STATUS_STYLES.DRAFT;
                  return (
                    <Link
                      key={c.campaign_id}
                      to={`/dashboard-v2/campagnes/${c.campaign_id}`}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-ink-200 hover:border-primary transition-colors"
                    >
                      <span className="text-sm font-semibold text-ink-900 truncate">{c.title}</span>
                      <span
                        className="text-[11px] font-semibold px-2 py-1 rounded-lg shrink-0"
                        style={{ backgroundColor: style.bg, color: style.color }}
                      >
                        {style.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </Widget>
        </Reveal>
      </div>

      {/* Classement en direct */}
      {leaderboard.length > 0 && (
        <Reveal direction="up">
          <Widget>
            <p className="font-semibold text-ink-900 mb-3 flex items-center gap-2">
              <Trophy size={17} className="text-gold" /> Ça se joue en ce moment
            </p>
            <div className="flex flex-col gap-2">
              {leaderboard.map((c, i) => (
                <div key={c.candidate_id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-ink-50">
                  <span className="w-7 h-7 rounded-full bg-ink-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-semibold text-ink-900 truncate">{c.display_name}</span>
                  <span className="text-sm font-bold text-ink-700">{c.vote_count} votes</span>
                </div>
              ))}
            </div>
          </Widget>
        </Reveal>
      )}

      {/* Graphiques -- scopés à la dernière campagne active/publiée */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Reveal direction="left">
          <Widget>
            <p className="font-semibold text-ink-900 mb-0.5">Revenus ({effectiveDays} derniers jours)</p>
            {activeCampaign && (
              <p className="text-xs text-ink-700 mb-3 truncate">Campagne : {activeCampaign.title}</p>
            )}
            {charts.revenue.length === 0 ? (
              <p className="text-ink-700 text-sm mt-3">Pas de données.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={charts.revenue}>
                  <defs>
                    <linearGradient id="colorRevenueV2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_PRIMARY} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={CHART_PRIMARY} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={CHART_LINE} vertical={false} />
                  <XAxis dataKey="day" tickFormatter={(d) => formatDate(d, { month: "2-digit", day: "2-digit" })} fontSize={11} stroke={CHART_MUTED} />
                  <YAxis fontSize={11} stroke={CHART_MUTED} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${CHART_LINE}` }} />
                  <Area type="monotone" dataKey="amount" stroke={CHART_PRIMARY} fill="url(#colorRevenueV2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Widget>
        </Reveal>
        <Reveal direction="right">
          <Widget>
            <p className="font-semibold text-ink-900 mb-0.5">Votes ({effectiveDays} derniers jours)</p>
            {activeCampaign && (
              <p className="text-xs text-ink-700 mb-3 truncate">Campagne : {activeCampaign.title}</p>
            )}
            {charts.votes.length === 0 ? (
              <p className="text-ink-700 text-sm mt-3">Pas de données.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={charts.votes}>
                  <CartesianGrid stroke={CHART_LINE} vertical={false} />
                  <XAxis dataKey="day" tickFormatter={(d) => formatDate(d, { month: "2-digit", day: "2-digit" })} fontSize={11} stroke={CHART_MUTED} />
                  <YAxis fontSize={11} stroke={CHART_MUTED} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${CHART_LINE}` }} />
                  <Bar dataKey="count" fill={CHART_SECONDARY} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Widget>
        </Reveal>
      </div>

      {/* Activité récente -- top 5 uniquement */}
      <Reveal direction="up">
        <Widget>
          <p className="font-semibold text-ink-900 mb-3">Activité récente</p>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-ink-700">Aucune activité récente.</p>
          ) : (
            <div className="flex flex-col">
              {recentActivity.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm border-t border-ink-200 py-2.5 first:border-t-0 first:pt-0">
                  <span className="text-ink-900">
                    Vote {a.detail === "PAID" ? "payant" : "gratuit"} — {a.campaign_title}
                  </span>
                  <span className="text-ink-700 text-xs shrink-0">{formatDateTime(a.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </Widget>
      </Reveal>

      {/* Notifications non lues */}
      {notifications.items.length > 0 && (
        <Reveal direction="up">
          <Widget>
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-ink-900 flex items-center gap-2">
                <Bell size={16} /> Notifications récentes
              </p>
              <Link to="/dashboard-v2/notifications" className="text-secondary text-xs font-semibold">
                Voir tout
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {notifications.items.map((n) => (
                <div key={n.notif_id} className={`text-sm p-3 rounded-xl border border-ink-200 ${n.read ? "" : "bg-secondary-50"}`}>
                  <p className="font-semibold text-ink-900">{n.title}</p>
                  <p className="text-ink-700 text-xs mt-0.5">{n.message}</p>
                </div>
              ))}
            </div>
          </Widget>
        </Reveal>
      )}
    </motion.div>
  );
}
