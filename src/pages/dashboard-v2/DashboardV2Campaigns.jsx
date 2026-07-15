import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Users, KeyRound, BarChart3, FileCheck, Copy, Plus, Vote, Wallet, TrendingUp, XCircle, ExternalLink, Palette } from "lucide-react";
import { getOrganizerSessionEmail } from "../../lib/session.js";
import { apiGet, apiPost, formatAmount, formatDate } from "./dashboardApi.js";

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

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.DRAFT;
  return (
    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg shrink-0" style={{ backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

export function DashboardV2CampaignsList() {
  const email = getOrganizerSessionEmail();
  const navigate = useNavigate();
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [duplicating, setDuplicating] = useState(null);

  function load() {
    if (!email) return;
    apiGet(`/api/dashboard/campaigns?email=${encodeURIComponent(email)}&page=1&pageSize=50`)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [email]);

  async function handleDuplicate(campaignId) {
    setDuplicating(campaignId);
    try {
      await apiPost(`/api/dashboard/campaigns/${campaignId}/duplicate`, { email });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDuplicating(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-ink-900">Mes campagnes</h1>
        <Link to="/dashboard-v2/campagnes/nouvelle" className="btn btn-primary !text-sm !py-2.5">
          <Plus size={15} /> Nouvelle campagne
        </Link>
      </div>

      {error && (
        <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: "#FDECEC", color: "#B42318" }}>
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-ink-700 text-sm">Chargement…</p>
      ) : data.items.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 border border-ink-200 text-center text-sm text-ink-700">
          Aucune campagne pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.items.map((c) => (
            <div
              key={c.campaign_id}
              role="link"
              tabIndex={0}
              onClick={() => navigate(`/dashboard-v2/campagnes/${c.campaign_id}`)}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/dashboard-v2/campagnes/${c.campaign_id}`)}
              className="rounded-2xl overflow-hidden border border-ink-200 hover:border-primary transition-colors cursor-pointer flex flex-col text-white relative h-64"
              style={{
                backgroundImage: c.cover_photo_url
                  ? `linear-gradient(180deg, rgba(11,19,36,0.25) 0%, rgba(11,19,36,0.92) 78%), url(${c.cover_photo_url})`
                  : "linear-gradient(135deg, #0B1324, #1E293B)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="flex items-start justify-between gap-2 p-4">
                <StatusBadge status={c.status} />
                <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg bg-white/15 backdrop-blur">
                  <Vote size={12} /> {c.vote_count || 0} votes
                </span>
              </div>

              <div className="mt-auto p-4 flex flex-col gap-3">
                <div>
                  <p className="font-semibold text-sm leading-snug truncate">{c.title}</p>
                  <p className="text-[11px] text-white/60">{formatDate(c.created_at)}</p>
                </div>

                <div className="grid grid-cols-2 gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <Link
                    to={`/dashboard-v2/campagnes/${c.campaign_id}/candidats`}
                    className="flex items-center justify-center gap-1.5 text-[11px] font-semibold py-2 rounded-lg bg-white text-ink-900"
                  >
                    <Users size={12} /> Candidats
                  </Link>
                  <Link
                    to={`/dashboard-v2/campagnes/${c.campaign_id}/analytics`}
                    className="flex items-center justify-center gap-1.5 text-[11px] font-semibold py-2 rounded-lg bg-white/15 backdrop-blur"
                  >
                    <BarChart3 size={12} /> Analytics
                  </Link>
                  <Link
                    to={`/dashboard-v2/campagnes/${c.campaign_id}/codes`}
                    className="flex items-center justify-center gap-1.5 text-[11px] font-semibold py-2 rounded-lg bg-white/15 backdrop-blur"
                  >
                    <KeyRound size={12} /> Codes
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(c.campaign_id)}
                    disabled={duplicating === c.campaign_id}
                    className="flex items-center justify-center gap-1.5 text-[11px] font-semibold py-2 rounded-lg bg-white/15 backdrop-blur disabled:opacity-50"
                  >
                    <Copy size={12} /> {duplicating === c.campaign_id ? "…" : "Dupliquer"}
                  </button>
                </div>

                {c.slug && (
                  <a
                    href={`/vote/${c.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 text-[11px] font-semibold py-2 rounded-lg border border-white/30"
                  >
                    <ExternalLink size={12} /> Voir la page publique
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DashboardV2CampaignDetail() {
  const { campaignId } = useParams();
  const email = getOrganizerSessionEmail();
  const [summary, setSummary] = useState(null);
  const [topCandidates, setTopCandidates] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email || !campaignId) return;
    const q = `email=${encodeURIComponent(email)}`;
    Promise.all([
      apiGet(`/api/dashboard/campaigns/${campaignId}/analytics/summary?${q}`),
      apiGet(`/api/dashboard/campaigns/${campaignId}/analytics/top-candidates?${q}&limit=5`),
      apiGet(`/api/dashboard/campaigns?${q}&page=1&pageSize=50`),
    ])
      .then(([summaryData, topData, campaignsData]) => {
        setSummary(summaryData);
        setTopCandidates(topData.items);
        setCampaign(campaignsData.items.find((c) => c.campaign_id === campaignId) || null);
      })
      .catch((err) => setError(err.message));
  }, [email, campaignId]);

  if (error) {
    return <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: "#FDECEC", color: "#B42318" }}>{error}</div>;
  }
  if (!summary) {
    return <p className="text-ink-700 text-sm">Chargement…</p>;
  }

  const failureRate = summary.total_transactions > 0
    ? Math.round((summary.pending_failed_payments / summary.total_transactions) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link to="/dashboard-v2/campagnes" className="text-xs font-semibold text-secondary">
          ← Mes campagnes
        </Link>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <h1 className="text-xl font-bold text-ink-900">{campaign?.title || "Campagne"}</h1>
          {campaign && <StatusBadge status={campaign.status} />}
          {campaign?.slug && (
            <a
              href={`/vote/${campaign.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-ink-200 text-secondary hover:border-primary ml-auto"
            >
              <ExternalLink size={13} /> Voir la campagne
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-white border border-ink-200 p-4">
          <p className="text-xs font-semibold text-ink-700 mb-1 flex items-center gap-1.5"><Vote size={13} /> Votes totaux</p>
          <p className="text-xl font-bold text-ink-900">{summary.total_votes}</p>
        </div>
        <div className="rounded-2xl bg-white border border-ink-200 p-4">
          <p className="text-xs font-semibold text-ink-700 mb-1">Payants / Gratuits</p>
          <p className="text-xl font-bold text-ink-900">{summary.paid_votes} / {summary.free_votes}</p>
        </div>
        <div className="rounded-2xl bg-white border border-ink-200 p-4">
          <p className="text-xs font-semibold text-ink-700 mb-1 flex items-center gap-1.5"><Wallet size={13} /> Revenu net</p>
          <p className="text-xl font-bold text-ink-900">{formatAmount(summary.total_revenue)} <span className="text-xs font-normal">FCFA</span></p>
        </div>
        <div className="rounded-2xl bg-white border border-ink-200 p-4">
          <p className="text-xs font-semibold text-ink-700 mb-1 flex items-center gap-1.5"><XCircle size={13} /> Échecs paiement</p>
          <p className="text-xl font-bold text-ink-900">{failureRate}%</p>
        </div>
      </div>

      {topCandidates.length > 0 && (
        <div className="rounded-2xl bg-white border border-ink-200 p-5">
          <p className="font-semibold text-ink-900 mb-3 flex items-center gap-2"><TrendingUp size={16} /> Top 5 candidats</p>
          <div className="flex flex-col gap-2">
            {topCandidates.map((c, i) => (
              <div key={c.candidate_id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-ink-50">
                <span className="w-7 h-7 rounded-full bg-ink-900 text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="flex-1 text-sm font-semibold text-ink-900 truncate">{c.display_name}</span>
                <span className="text-sm font-bold text-ink-700">{c.vote_count} votes</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white border border-ink-200 p-5">
        <p className="font-semibold text-ink-900 mb-3">Gestion de la campagne</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to={`/dashboard-v2/campagnes/${campaignId}/candidats`} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-ink-200 hover:border-primary text-center">
            <Users size={20} className="text-secondary" />
            <span className="text-xs font-semibold text-ink-900">Candidats</span>
          </Link>
          <Link to={`/dashboard-v2/campagnes/${campaignId}/codes`} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-ink-200 hover:border-primary text-center">
            <KeyRound size={20} className="text-secondary" />
            <span className="text-xs font-semibold text-ink-900">Codes uniques</span>
          </Link>
          <Link to={`/dashboard-v2/campagnes/${campaignId}/analytics`} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-ink-200 hover:border-primary text-center">
            <BarChart3 size={20} className="text-secondary" />
            <span className="text-xs font-semibold text-ink-900">Analytics complet</span>
          </Link>
          <Link to={`/dashboard-v2/campagnes/${campaignId}/contenu`} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-ink-200 hover:border-primary text-center">
            <Palette size={20} className="text-secondary" />
            <span className="text-xs font-semibold text-ink-900">Annonces, FAQ, galerie...</span>
          </Link>
          {campaign?.slug && (
            <a href={`/vote/${campaign.slug}/pv`} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-ink-200 hover:border-primary text-center">
              <FileCheck size={20} className="text-secondary" />
              <span className="text-xs font-semibold text-ink-900">PV de clôture</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
