import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Wallet, Send, AlertCircle, Download, FileSpreadsheet, FileText, FileDown } from "lucide-react";
import { getOrganizerSessionEmail } from "../../lib/session.js";
import { apiGet, apiPost, formatAmount, formatDateTime } from "./dashboardApi.js";

const TRANSACTION_STATUS = {
  CONFIRMED: { label: "Confirmé", color: "#1B7A3D", bg: "#ECFDF5" },
  PENDING: { label: "En attente", color: "#B45309", bg: "#FEF3C7" },
  FAILED: { label: "Échoué", color: "#B42318", bg: "#FEE2E2" },
};

const PAYOUT_STATUS = {
  PENDING: { label: "En attente", color: "#B45309", bg: "#FEF3C7" },
  PROCESSING: { label: "En cours", color: "#2B6BFF", bg: "#DBEAFE" },
  COMPLETED: { label: "Réussi", color: "#1B7A3D", bg: "#ECFDF5" },
  FAILED: { label: "Échoué", color: "#B42318", bg: "#FEE2E2" },
};

const TABS = [
  { key: "historique", label: "Historique des revenus" },
  { key: "reversements", label: "Historique de reversement" },
  { key: "retrait", label: "Demande de retrait" },
  { key: "export", label: "Export financier" },
];

function TransactionsTab({ email }) {
  const [data, setData] = useState({ items: [], total: 0 });
  useEffect(() => {
    if (!email) return;
    apiGet(`/api/dashboard/transactions?email=${encodeURIComponent(email)}&page=1&pageSize=30`).then(setData);
  }, [email]);

  if (data.items.length === 0) return <p className="text-sm text-ink-700">Aucune transaction pour le moment.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-ink-50">
          <tr className="text-left text-ink-700">
            <th className="px-4 py-3 font-medium">Campagne</th>
            <th className="px-4 py-3 font-medium">Brut</th>
            <th className="px-4 py-3 font-medium">Commission</th>
            <th className="px-4 py-3 font-medium">Net</th>
            <th className="px-4 py-3 font-medium">Méthode</th>
            <th className="px-4 py-3 font-medium">Statut</th>
            <th className="px-4 py-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((t) => {
            const s = TRANSACTION_STATUS[t.status] || TRANSACTION_STATUS.PENDING;
            return (
              <tr key={t.transaction_id} className="border-t border-ink-200">
                <td className="px-4 py-3 text-ink-900 font-medium">{t.campaign_title || "—"}</td>
                <td className="px-4 py-3 text-ink-700">{formatAmount(t.gross_amount)}</td>
                <td className="px-4 py-3 text-ink-700">{formatAmount(t.moledi_commission)}</td>
                <td className="px-4 py-3 text-ink-900 font-semibold">{formatAmount(t.net_organizer)}</td>
                <td className="px-4 py-3 text-ink-700">{t.payment_method}</td>
                <td className="px-4 py-3">
                  <span className="text-[11px] font-semibold px-2 py-1 rounded-lg" style={{ backgroundColor: s.bg, color: s.color }}>
                    {s.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-ink-700">{formatDateTime(t.initiated_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PayoutsTab({ email }) {
  const [data, setData] = useState({ items: [], total: 0 });
  useEffect(() => {
    if (!email) return;
    apiGet(`/api/dashboard/payouts?email=${encodeURIComponent(email)}&page=1&pageSize=30`).then(setData);
  }, [email]);

  if (data.items.length === 0) {
    return <p className="text-sm text-ink-700">Aucun reversement demandé pour le moment.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-ink-50">
          <tr className="text-left text-ink-700">
            <th className="px-4 py-3 font-medium">Montant demandé</th>
            <th className="px-4 py-3 font-medium">Net</th>
            <th className="px-4 py-3 font-medium">Numéro</th>
            <th className="px-4 py-3 font-medium">Statut</th>
            <th className="px-4 py-3 font-medium">Demandé le</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((p) => {
            const s = PAYOUT_STATUS[p.status] || PAYOUT_STATUS.PENDING;
            const maskedPhone = p.payout_phone ? `••••${p.payout_phone.slice(-3)}` : "—";
            return (
              <tr key={p.payout_id} className="border-t border-ink-200">
                <td className="px-4 py-3 text-ink-900">{formatAmount(p.requested_amount)} FCFA</td>
                <td className="px-4 py-3 text-ink-900 font-semibold">{formatAmount(p.net_amount)} FCFA</td>
                <td className="px-4 py-3 text-ink-700">{maskedPhone}</td>
                <td className="px-4 py-3">
                  <span className="text-[11px] font-semibold px-2 py-1 rounded-lg" style={{ backgroundColor: s.bg, color: s.color }}>
                    {s.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-ink-700">{formatDateTime(p.requested_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function WithdrawTab({ email, balance, onRequested }) {
  const [amount, setAmount] = useState("");
  const [payoutPhone, setPayoutPhone] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!email) return;
    apiGet(`/api/dashboard/profile?email=${encodeURIComponent(email)}`).then((p) => setPayoutPhone(p.payout_phone || ""));
  }, [email]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await apiPost("/api/dashboard/payout-requests", { email, amount: Number(amount) });
      setSuccess(true);
      setAmount("");
      onRequested?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (payoutPhone === null) return <p className="text-sm text-ink-700">Chargement…</p>;

  if (!payoutPhone) {
    return (
      <div className="max-w-md flex flex-col gap-3">
        <div className="flex items-start gap-2 text-sm rounded-xl p-4" style={{ backgroundColor: "#FEF3C7", color: "#B45309" }}>
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          Aucun numéro Mobile Money configuré. Configurez-le dans Mon profil avant de demander un retrait.
        </div>
        <Link to="/dashboard-v2/profil" className="btn btn-primary !text-sm self-start">Configurer mon numéro</Link>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <p className="text-sm text-ink-700 mb-1">
        Solde disponible : <strong className="text-ink-900">{formatAmount(balance)} FCFA</strong>
      </p>
      <p className="text-xs text-ink-400 mb-4">
        Versé sur ••••{payoutPhone.slice(-3)} — <Link to="/dashboard-v2/profil" className="text-secondary font-semibold">changer</Link>
      </p>
      {success && (
        <div className="flex items-start gap-2 text-sm rounded-xl p-3 mb-4" style={{ backgroundColor: "#ECFDF5", color: "#1B7A3D" }}>
          Demande envoyée. Suivez son statut dans l'onglet Reversements.
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="number"
          min="1"
          placeholder="Montant (FCFA)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="rounded-xl px-3 py-2.5 text-sm border border-ink-200"
        />
        {error && (
          <div className="flex items-start gap-2 text-sm rounded-xl p-3" style={{ backgroundColor: "#FDECEC", color: "#B42318" }}>
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}
        <button type="submit" disabled={submitting} className="btn btn-primary !text-sm disabled:opacity-50">
          <Send size={14} /> {submitting ? "Envoi…" : "Confirmer la demande"}
        </button>
      </form>
    </div>
  );
}

function ExportTab({ email }) {
  const [exporting, setExporting] = useState(null);
  const [error, setError] = useState("");

  async function handleExport(format) {
    setExporting(format);
    setError("");
    try {
      const data = await apiGet(`/api/dashboard/export/financial?email=${encodeURIComponent(email)}&format=${format}`);
      window.location.href = data.download_url;
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(null);
    }
  }

  const options = [
    { format: "pdf", label: "PDF", icon: FileText, desc: "Rapport formaté, prêt à imprimer" },
    { format: "xlsx", label: "Excel (.xlsx)", icon: FileSpreadsheet, desc: "Tableau modifiable" },
    { format: "csv", label: "CSV", icon: FileDown, desc: "Données brutes" },
  ];

  return (
    <div className="flex flex-col gap-4 max-w-lg">
      <p className="text-sm text-ink-700">Générez un export de toutes vos transactions confirmées.</p>
      {error && (
        <div className="rounded-xl p-3 text-sm" style={{ backgroundColor: "#FDECEC", color: "#B42318" }}>{error}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map((o) => {
          const Icon = o.icon;
          return (
            <button
              key={o.format}
              type="button"
              onClick={() => handleExport(o.format)}
              disabled={exporting !== null}
              className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-ink-200 hover:border-primary transition-colors disabled:opacity-50"
            >
              <Icon size={22} className="text-secondary" />
              <span className="text-sm font-semibold text-ink-900">{o.label}</span>
              <span className="text-[11px] text-ink-700 text-center">{o.desc}</span>
              {exporting === o.format && <span className="text-[11px] text-primary">Génération…</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardV2Finances() {
  const email = getOrganizerSessionEmail();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = TABS.find((t) => t.key === searchParams.get("tab"))?.key || "historique";
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!email) return;
    apiGet(`/api/dashboard/summary?email=${encodeURIComponent(email)}`).then((d) => setBalance(d.available_balance));
  }, [email]);

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-3xl p-6 bg-ink-900 text-white flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-white/50 font-semibold mb-1 flex items-center gap-1.5">
            <Wallet size={13} /> Solde disponible
          </p>
          <p className="text-3xl font-bold">{formatAmount(balance)} <span className="text-sm font-normal text-white/60">FCFA</span></p>
        </div>
        <button onClick={() => setSearchParams({ tab: "retrait" })} className="btn btn-primary !text-sm">
          Demander un retrait
        </button>
      </div>

      <div className="flex items-center gap-1 border-b border-ink-200 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setSearchParams({ tab: t.key })}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === t.key ? "border-primary text-primary" : "border-transparent text-ink-700 hover:text-ink-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white border border-ink-200 p-5">
        {activeTab === "historique" && <TransactionsTab email={email} />}
        {activeTab === "reversements" && <PayoutsTab email={email} />}
        {activeTab === "retrait" && <WithdrawTab email={email} balance={balance} onRequested={() => setSearchParams({ tab: "reversements" })} />}
        {activeTab === "export" && <ExportTab email={email} />}
      </div>
    </div>
  );
}
