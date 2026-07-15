import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Vote, Ticket, Gift, Users2, ChevronRight } from "lucide-react";
import { getOrganizerSessionEmail } from "../../lib/session.js";
import { apiGet, formatDateTime } from "./dashboardApi.js";

const VOTE_STATUS_LABEL = {
  COUNTED: { label: "Comptabilisé", color: "#1B7A3D", bg: "#ECFDF5" },
  NOT_COUNTED: { label: "Non comptabilisé", color: "#B45309", bg: "#FEF3C7" },
  REJECTED: { label: "Rejeté", color: "#B42318", bg: "#FEE2E2" },
};

const ACTIVITY_TABS = [
  { key: "votes", label: "Mes votes", icon: Vote, ready: true },
  { key: "billets", label: "Mes billets achetés", icon: Ticket, ready: false },
  { key: "dons", label: "Mes dons", icon: Gift, ready: false },
  { key: "participations", label: "Mes participations", icon: Users2, ready: false },
];

function ActivityOverview() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-ink-900 mb-1">Mon activité</h1>
        <p className="text-sm text-ink-700">
          Toutes vos actions effectuées sur la plateforme en tant que participant (votes, billets, dons...),
          reliées à votre compte.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ACTIVITY_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.key}
              to={tab.ready ? `/dashboard-v2/${tab.key}` : "#"}
              className={`flex items-center gap-3 p-4 rounded-2xl border border-ink-200 bg-white transition-colors ${
                tab.ready ? "hover:border-primary" : "opacity-60 cursor-not-allowed"
              }`}
              onClick={(e) => !tab.ready && e.preventDefault()}
            >
              <span className="w-11 h-11 rounded-xl bg-primary-50 text-primary flex items-center justify-center shrink-0">
                <Icon size={19} />
              </span>
              <div className="flex-1">
                <p className="font-semibold text-ink-900 text-sm">{tab.label}</p>
                {!tab.ready && <p className="text-[11px] text-ink-400">Bientôt disponible</p>}
              </div>
              {tab.ready && <ChevronRight size={16} className="text-ink-400" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function MyVotesList() {
  const email = getOrganizerSessionEmail();
  const [data, setData] = useState({ items: [], total: 0, page: 1, pageSize: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email) return;
    apiGet(`/api/dashboard/my-votes?email=${encodeURIComponent(email)}&page=1&pageSize=20`)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [email]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link to="/dashboard-v2/activite" className="text-xs font-semibold text-secondary">
          ← Mon activité
        </Link>
        <h1 className="text-xl font-bold text-ink-900 mt-1">Mes votes</h1>
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
          Vous n'avez encore effectué aucun vote sur la plateforme.
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-ink-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50">
                <tr className="text-left text-ink-700">
                  <th className="px-4 py-3 font-medium">Scrutin</th>
                  <th className="px-4 py-3 font-medium">Candidat</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((v) => {
                  const status = VOTE_STATUS_LABEL[v.status] || VOTE_STATUS_LABEL.NOT_COUNTED;
                  return (
                    <tr key={v.vote_id} className="border-t border-ink-200">
                      <td className="px-4 py-3">
                        <a href={`/vote/${v.poll_slug}`} className="text-ink-900 font-semibold hover:text-primary">
                          {v.poll_title}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-ink-700">{v.candidate_name}</td>
                      <td className="px-4 py-3 text-ink-700 text-xs">{formatDateTime(v.created_at)}</td>
                      <td className="px-4 py-3 text-ink-700">{v.vote_type === "PAID" ? "Payant" : "Gratuit"}</td>
                      <td className="px-4 py-3">
                        <span
                          className="text-[11px] font-semibold px-2 py-1 rounded-lg"
                          style={{ backgroundColor: status.bg, color: status.color }}
                        >
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ComingSoonList({ tabKey }) {
  const tab = ACTIVITY_TABS.find((t) => t.key === tabKey);
  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link to="/dashboard-v2/activite" className="text-xs font-semibold text-secondary">
          ← Mon activité
        </Link>
        <h1 className="text-xl font-bold text-ink-900 mt-1">{tab?.label}</h1>
      </div>
      <div className="rounded-2xl bg-white p-8 border border-ink-200 text-center text-sm text-ink-700">
        Cette section arrive bientôt — elle regroupera vos {tab?.label.toLowerCase()} dès que les modules
        billetterie/dons du MVP seront disponibles.
      </div>
    </div>
  );
}

export function DashboardV2ActivityIndex() {
  return <ActivityOverview />;
}
export function DashboardV2Votes() {
  return <MyVotesList />;
}
export function DashboardV2Tickets() {
  return <ComingSoonList tabKey="billets" />;
}
export function DashboardV2Donations() {
  return <ComingSoonList tabKey="dons" />;
}
export function DashboardV2Participations() {
  return <ComingSoonList tabKey="participations" />;
}
