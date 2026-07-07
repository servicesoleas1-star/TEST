import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  Vote,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { getOrganizerSessionEmail } from "../lib/session.js";

// Recharts consomme des couleurs directement (fill/stroke), pas de classes
// Tailwind possibles ici — ces valeurs sont donc alignées à la main sur les
// tokens du thème (primary/secondary) pour rester visuellement cohérentes.
const CHART_SECONDARY = "#2B6BFF"; // = theme secondary
const CHART_PRIMARY = "#FF6A00"; // = theme primary
const CHART_GREEN = "#1B7A3D";
const CHART_RED = "#B42318";
const CHART_LINE = "#E4E2DC"; // = theme ink-200
const CHART_MUTED = "#3D3F54B3"; // ~ ink-700 à 70% d'opacité
const API_BASE = "http://localhost:4000";

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Erreur de chargement.");
  return data;
}

function KpiCard({ icon: Icon, label, value, unit, color }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-2 bg-white border border-ink-200">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink-700">
          {label}
        </span>
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

export default function CampaignAnalyticsPage() {
  const email = getOrganizerSessionEmail();
  const { campaignId } = useParams();

  const [summary, setSummary] = useState(null);
  const [votesByDay, setVotesByDay] = useState([]);
  const [votesByHour, setVotesByHour] = useState([]);
  const [voteBreakdown, setVoteBreakdown] = useState([]);
  const [topCandidates, setTopCandidates] = useState([]);
  const [paymentFailures, setPaymentFailures] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async () => {
    if (!email || !campaignId) return;
    try {
      const [summaryData, votesDayData, votesHourData, breakdownData, candidatesData, failuresData] =
        await Promise.all([
          apiGet(
            `/api/dashboard/campaigns/${campaignId}/analytics/summary?email=${encodeURIComponent(email)}`
          ),
          apiGet(
            `/api/dashboard/campaigns/${campaignId}/analytics/votes-by-day?email=${encodeURIComponent(email)}&days=30`
          ),
          apiGet(
            `/api/dashboard/campaigns/${campaignId}/analytics/votes-by-hour?email=${encodeURIComponent(email)}`
          ),
          apiGet(
            `/api/dashboard/campaigns/${campaignId}/analytics/vote-breakdown?email=${encodeURIComponent(email)}`
          ),
          apiGet(
            `/api/dashboard/campaigns/${campaignId}/analytics/top-candidates?email=${encodeURIComponent(email)}&limit=10`
          ),
          apiGet(
            `/api/dashboard/campaigns/${campaignId}/analytics/payment-failures?email=${encodeURIComponent(email)}`
          ),
        ]);

      setSummary(summaryData);
      setVotesByDay(votesDayData.items || []);
      setVotesByHour(votesHourData.items || []);
      setVoteBreakdown(breakdownData.items || []);
      setTopCandidates(candidatesData.items || []);
      setPaymentFailures(failuresData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [email, campaignId]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (!email) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-6 bg-white text-ink-900">
        <h1 className="text-xl font-bold">Session introuvable</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 px-4 sm:px-8 py-4 flex items-center gap-3 bg-white border-b border-ink-200">
        <Link to="/organisateur/tableau-de-bord" className="text-secondary">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg sm:text-xl font-bold text-ink-900">
          Analytics
        </h1>
      </header>

      <main className="px-4 sm:px-8 py-6 max-w-6xl mx-auto flex flex-col gap-6">
        {error && (
          <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: "#FDECEC", color: "#B42318" }}>
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-ink-700">Chargement des analytics…</p>
        ) : summary ? (
          <>
            {/* KPI Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                icon={Vote}
                label="Total votes"
                value={summary.total_votes || 0}
                color={CHART_SECONDARY}
              />
              <KpiCard
                icon={TrendingUp}
                label="Votes payants"
                value={summary.paid_votes || 0}
                color={CHART_PRIMARY}
              />
              <KpiCard
                icon={DollarSign}
                label="Revenu total"
                value={`${Number(summary.total_revenue || 0).toLocaleString("fr-FR")}`}
                unit="FCFA"
                color={CHART_GREEN}
              />
              <KpiCard
                icon={AlertTriangle}
                label="Échecs paiement"
                value={`${paymentFailures.failure_rate_percent || 0}`}
                unit="%"
                color={CHART_RED}
              />
            </div>

            {/* Votes par jour */}
            <div className="rounded-2xl bg-white p-5 border border-ink-200">
              <h2 className="font-semibold mb-3 text-ink-900">
                Votes par jour (30 derniers jours)
              </h2>
              {votesByDay.length === 0 ? (
                <p className="text-ink-700">Pas de données.</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={votesByDay}>
                    <defs>
                      <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_SECONDARY} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={CHART_SECONDARY} stopOpacity={0} />
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
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: `1px solid ${CHART_LINE}` }}
                      labelFormatter={(d) => new Date(d).toLocaleDateString("fr-FR")}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke={CHART_SECONDARY}
                      fill="url(#colorVotes)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Votes par heure */}
            <div className="rounded-2xl bg-white p-5 border border-ink-200">
              <h2 className="font-semibold mb-3 text-ink-900">
                Votes par heure (dernières 24h)
              </h2>
              {votesByHour.length === 0 ? (
                <p className="text-ink-700">Pas de données.</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={votesByHour}>
                    <CartesianGrid stroke={CHART_LINE} vertical={false} />
                    <XAxis dataKey="hour_label" fontSize={11} stroke={CHART_MUTED} />
                    <YAxis fontSize={11} stroke={CHART_MUTED} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${CHART_LINE}` }} />
                    <Bar dataKey="count" fill={CHART_SECONDARY} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Répartition votes & Top candidats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Vote Breakdown */}
              <div className="rounded-2xl bg-white p-5 border border-ink-200">
                <h2 className="font-semibold mb-3 text-ink-900">
                  Répartition des votes
                </h2>
                {voteBreakdown.length === 0 ? (
                  <p className="text-ink-700">Pas de données.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={voteBreakdown}
                        dataKey="count"
                        nameKey="vote_type"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ vote_type, percentage }) => `${vote_type}: ${percentage}%`}
                      >
                        <Cell fill={CHART_SECONDARY} />
                        <Cell fill={CHART_PRIMARY} />
                        <Cell fill={CHART_GREEN} />
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: `1px solid ${CHART_LINE}` }}
                        formatter={(value, name) => {
                          if (name === "count") return value;
                          return value;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Top Candidats */}
              <div className="rounded-2xl bg-white p-5 border border-ink-200">
                <h2 className="font-semibold mb-3 text-ink-900">
                  Top candidats
                </h2>
                {topCandidates.length === 0 ? (
                  <p className="text-ink-700">Pas de données.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={topCandidates}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
                    >
                      <CartesianGrid stroke={CHART_LINE} />
                      <XAxis type="number" fontSize={11} stroke={CHART_MUTED} />
                      <YAxis dataKey="display_name" type="category" fontSize={10} stroke={CHART_MUTED} width={190} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${CHART_LINE}` }} />
                      <Bar dataKey="vote_count" fill={CHART_PRIMARY} radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Payment Failures Details */}
            <div className="rounded-2xl bg-white p-5 border border-ink-200">
              <h2 className="font-semibold mb-4 text-ink-900">
                Transactions et paiements
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-ink-700">
                    Total transactions
                  </p>
                  <p className="text-2xl font-bold text-ink-900">
                    {paymentFailures.total_transactions || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ink-700">
                    Échecs
                  </p>
                  <p className="text-2xl font-bold" style={{ color: CHART_RED }}>
                    {paymentFailures.failed_count || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ink-700">
                    Taux d'échec
                  </p>
                  <p className="text-2xl font-bold" style={{ color: CHART_RED }}>
                    {Number(paymentFailures.failure_rate_percent || 0).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}