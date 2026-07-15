import { useEffect, useState } from "react";
import { Save, ShieldCheck, ShieldAlert, Smartphone } from "lucide-react";
import { getOrganizerSessionEmail } from "../../lib/session.js";
import { apiGet, apiPost, formatDateTime } from "./dashboardApi.js";
import { applyLanguage } from "../../services/googleTranslateService.js";

const LANGUAGE_OPTIONS = [
  { value: "FR", label: "Français", flag: "🇫🇷" },
  { value: "EN", label: "English", flag: "🇬🇧" },
];

const NEWSLETTER_OPTIONS = [
  { value: "INSTANT", label: "Immédiate" },
  { value: "DAILY", label: "Quotidienne" },
  { value: "WEEKLY", label: "Hebdomadaire" },
  { value: "NEVER", label: "Jamais" },
];

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center justify-between gap-3 py-2 cursor-pointer">
      <span className="text-sm text-ink-900">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors shrink-0 ${checked ? "bg-primary justify-end" : "bg-ink-200 justify-start"}`}
      >
        <span className="w-5 h-5 rounded-full bg-white shadow" />
      </button>
    </label>
  );
}

function LoginLogTable({ email }) {
  const [logs, setLogs] = useState({ items: [], total: 0 });

  useEffect(() => {
    if (!email) return;
    apiGet(`/api/dashboard/login-logs?email=${encodeURIComponent(email)}&page=1&pageSize=10`).then(setLogs);
  }, [email]);

  return (
    <div className="rounded-2xl bg-white border border-ink-200 p-6">
      <p className="font-semibold text-ink-900 mb-3">Journal de connexion</p>
      {logs.items.length === 0 ? (
        <p className="text-sm text-ink-700">Aucune connexion enregistrée.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-700">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Appareil</th>
                <th className="pb-2 font-medium">IP</th>
                <th className="pb-2 font-medium">Résultat</th>
              </tr>
            </thead>
            <tbody>
              {logs.items.map((l) => (
                <tr key={l.log_id} className="border-t border-ink-200">
                  <td className="py-2 text-ink-900 text-xs">{formatDateTime(l.created_at)}</td>
                  <td className="py-2 text-ink-700 flex items-center gap-1.5">
                    <Smartphone size={13} /> {l.device_name || "Appareil inconnu"}
                  </td>
                  <td className="py-2 text-ink-700 text-xs">{l.ip ? `${l.ip.split(".").slice(0, 2).join(".")}.•.•` : "—"}</td>
                  <td className="py-2">
                    {l.success ? (
                      <span className="flex items-center gap-1 text-xs" style={{ color: "#1B7A3D" }}>
                        <ShieldCheck size={13} /> Réussie
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs" style={{ color: "#B42318" }}>
                        <ShieldAlert size={13} /> Échouée
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function DashboardV2Settings() {
  const email = getOrganizerSessionEmail();
  const [prefs, setPrefs] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [changingLanguage, setChangingLanguage] = useState(false);

  useEffect(() => {
    if (!email) return;
    apiGet(`/api/user/preferences?email=${encodeURIComponent(email)}`).then(setPrefs);
  }, [email]);

  function set(key, value) {
    setPrefs((p) => ({ ...p, [key]: value }));
    setSuccess(false);
  }

  // Contrairement aux autres préférences (regroupées dans "Enregistrer les
  // préférences" plus bas), la langue s'applique immédiatement : on
  // enregistre côté compte (user_preferences.language) PUIS on déclenche
  // applyLanguage(), qui pose le cookie Google Translate et recharge la
  // page -- l'interface change de langue tout de suite, sans étape
  // supplémentaire (voir services/googleTranslateService.js).
  async function handleLanguageChange(lang) {
    if (lang === prefs.language || changingLanguage) return;
    setChangingLanguage(true);
    try {
      await apiPost("/api/user/preferences", { email, language: lang });
    } catch {
      // On applique quand même la traduction côté client -- la préférence
      // pourra se resynchroniser au prochain enregistrement réussi.
    }
    applyLanguage(lang); // recharge la page
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await apiPost("/api/user/preferences", { email, ...prefs });
      setPrefs(updated);
      setSuccess(true);
    } finally {
      setSaving(false);
    }
  }

  if (!prefs) return <p className="text-sm text-ink-700">Chargement…</p>;

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <h1 className="text-xl font-bold text-ink-900">Paramètres du compte</h1>

      <div className="rounded-2xl bg-white border border-ink-200 p-6">
        <p className="font-semibold text-ink-900 mb-1">Langue de l'interface</p>
        <p className="text-xs text-ink-700 mb-3">Appliquée immédiatement à toutes les pages.</p>
        <div className="flex gap-2">
          {LANGUAGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleLanguageChange(opt.value)}
              disabled={changingLanguage}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border disabled:opacity-50 ${
                prefs.language === opt.value ? "bg-primary text-white border-primary" : "border-ink-200 text-ink-700"
              }`}
            >
              <span className="text-base">{opt.flag}</span> {opt.label}
            </button>
          ))}
          {changingLanguage && <span className="text-xs text-ink-400 self-center">Application…</span>}
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-ink-200 p-6">
        <p className="font-semibold text-ink-900 mb-2">Notifications par email</p>
        <div className="divide-y divide-ink-100">
          <Toggle checked={prefs.notif_email_validation} onChange={(v) => set("notif_email_validation", v)} label="Validation de campagne" />
          <Toggle checked={prefs.notif_email_rejection} onChange={(v) => set("notif_email_rejection", v)} label="Rejet de campagne" />
          <Toggle checked={prefs.notif_email_payment} onChange={(v) => set("notif_email_payment", v)} label="Paiements" />
          <Toggle checked={prefs.notif_email_payout} onChange={(v) => set("notif_email_payout", v)} label="Reversements" />
          <Toggle checked={prefs.notif_email_ticket} onChange={(v) => set("notif_email_ticket", v)} label="Réponses support" />
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-ink-200 p-6">
        <p className="font-semibold text-ink-900 mb-2">Notifications par WhatsApp</p>
        <div className="divide-y divide-ink-100">
          <Toggle checked={prefs.notif_whatsapp_validation} onChange={(v) => set("notif_whatsapp_validation", v)} label="Validation de campagne" />
          <Toggle checked={prefs.notif_whatsapp_payment} onChange={(v) => set("notif_whatsapp_payment", v)} label="Paiements" />
          <Toggle checked={prefs.notif_whatsapp_payout} onChange={(v) => set("notif_whatsapp_payout", v)} label="Reversements" />
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-ink-200 p-6">
        <p className="font-semibold text-ink-900 mb-3">Fréquence des newsletters</p>
        <div className="flex flex-wrap gap-2">
          {NEWSLETTER_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => set("newsletter_frequency", o.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                prefs.newsletter_frequency === o.value ? "bg-primary text-white border-primary" : "border-ink-200 text-ink-700"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving} className="btn btn-primary !text-sm disabled:opacity-50">
          <Save size={14} /> {saving ? "Enregistrement…" : "Enregistrer les préférences"}
        </button>
        {success && <span className="text-sm" style={{ color: "#1B7A3D" }}>Enregistré.</span>}
      </div>

      <LoginLogTable email={email} />
    </div>
  );
}
