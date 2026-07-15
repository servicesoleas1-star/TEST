import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, ShieldAlert, Trash2, AlertCircle, Lock, Settings } from "lucide-react";
import { getOrganizerSessionEmail, clearOrganizerSession } from "../lib/session.js";

const API_BASE = "http://localhost:4000";

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Erreur de chargement.");
  return data;
}

function LoginLogTable({ email }) {
  const [logs, setLogs] = useState({ items: [], total: 0, page: 1, pageSize: 10 });
  const [error, setError] = useState("");

  const load = useCallback(
    async (page = 1) => {
      try {
        const data = await apiGet(
          `/api/dashboard/login-logs?email=${encodeURIComponent(email)}&page=${page}&pageSize=10`
        );
        setLogs(data);
      } catch (err) {
        setError(err.message);
      }
    },
    [email]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(logs.total / logs.pageSize));

  return (
    <div className="rounded-2xl bg-white p-5 border border-ink-200">
      <h2 className="font-semibold mb-3 text-ink-900">
        Journal de connexion
      </h2>
      {error && <p className="text-sm mb-2" style={{ color: "#B42318" }}>{error}</p>}
      {logs.items.length === 0 ? (
        <p className="text-sm text-ink-700">
          Aucune connexion enregistrée.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-700">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Adresse IP</th>
                <th className="pb-2 font-medium">Navigateur</th>
                <th className="pb-2 font-medium">Résultat</th>
              </tr>
            </thead>
            <tbody>
              {logs.items.map((l) => (
                <tr key={l.log_id} className="border-t border-ink-200">
                  <td className="py-2 text-ink-900">
                    {new Date(l.created_at).toLocaleString("fr-FR")}
                  </td>
                  <td className="py-2 text-ink-900">
                    {l.ip}
                  </td>
                  <td className="py-2 text-ink-900">
                    {l.browser}
                  </td>
                  <td className="py-2">
                    {l.success ? (
                      <span className="flex items-center gap-1" style={{ color: "#1B7A3D" }}>
                        <ShieldCheck size={14} /> Réussie
                      </span>
                    ) : (
                      <span className="flex items-center gap-1" style={{ color: "#B42318" }}>
                        <ShieldAlert size={14} /> Échouée
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 text-sm text-ink-900">
          <button
            onClick={() => load(logs.page - 1)}
            disabled={logs.page <= 1}
            className="px-2 py-1 rounded-lg disabled:opacity-30 border border-ink-200"
          >
            Précédent
          </button>
          <span className="text-ink-700">
            Page {logs.page} / {totalPages}
          </span>
          <button
            onClick={() => load(logs.page + 1)}
            disabled={logs.page >= totalPages}
            className="px-2 py-1 rounded-lg disabled:opacity-30 border border-ink-200"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}

function PreferencesSection({ email }) {
  const [prefs, setPrefs] = useState({
    language: "FR",
    notif_email_validation: true,
    notif_email_rejection: true,
    notif_email_payment: true,
    notif_email_payout: true,
    notif_email_ticket: true,
    notif_whatsapp_validation: false,
    notif_whatsapp_payment: false,
    notif_whatsapp_payout: false,
    newsletter_frequency: "WEEKLY",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const data = await apiGet(
          `/api/user/preferences?email=${encodeURIComponent(email)}`
        );
        setPrefs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPrefs();
  }, [email]);

  const handleChange = (key, value) => {
    setPrefs({ ...prefs, [key]: value });
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch(`${API_BASE}/api/user/preferences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...prefs }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");

      setSuccess("Préférences mises à jour !");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-5 border border-ink-200">
        <p className="text-ink-700">Chargement des préférences…</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-5 border border-ink-200">
      <h2 className="font-semibold mb-4 flex items-center gap-2 text-ink-900">
        <Settings size={18} /> Préférences
      </h2>

      {error && (
        <div className="flex items-start gap-2 text-sm rounded-xl p-3 mb-4" style={{ backgroundColor: "#FDECEC", color: "#B42318" }}>
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 text-sm rounded-xl p-3 mb-4" style={{ backgroundColor: "#ECFDF5", color: "#1B7A3D" }}>
          <span>✓ {success}</span>
        </div>
      )}

      <div className="space-y-5">
        {/* Langue */}
        <div>
          <label className="text-sm font-medium text-ink-900">
            Langue
          </label>
          <select
            value={prefs.language}
            onChange={(e) => handleChange("language", e.target.value)}
            className="w-full rounded-xl px-3 py-2 text-sm mt-1 border border-ink-200"
          >
            <option value="FR">Français</option>
            <option value="EN">English</option>
          </select>
        </div>

        {/* Notifications par email */}
        <div>
          <h3 className="text-xs font-semibold mb-2 text-ink-900">
            Notifications par email
          </h3>
          <label className="flex items-center gap-2 text-sm mb-2 text-ink-900">
            <input
              type="checkbox"
              checked={prefs.notif_email_validation}
              onChange={(e) => handleChange("notif_email_validation", e.target.checked)}
            />
            Campagne validée
          </label>
          <label className="flex items-center gap-2 text-sm mb-2 text-ink-900">
            <input
              type="checkbox"
              checked={prefs.notif_email_rejection}
              onChange={(e) => handleChange("notif_email_rejection", e.target.checked)}
            />
            Campagne rejetée
          </label>
          <label className="flex items-center gap-2 text-sm mb-2 text-ink-900">
            <input
              type="checkbox"
              checked={prefs.notif_email_payment}
              onChange={(e) => handleChange("notif_email_payment", e.target.checked)}
            />
            Paiement reçu
          </label>
          <label className="flex items-center gap-2 text-sm mb-2 text-ink-900">
            <input
              type="checkbox"
              checked={prefs.notif_email_payout}
              onChange={(e) => handleChange("notif_email_payout", e.target.checked)}
            />
            Retrait traité
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-900">
            <input
              type="checkbox"
              checked={prefs.notif_email_ticket}
              onChange={(e) => handleChange("notif_email_ticket", e.target.checked)}
            />
            Réponse à un ticket de support
          </label>
        </div>

        {/* Notifications par WhatsApp */}
        <div>
          <h3 className="text-xs font-semibold mb-2 text-ink-900">
            Notifications par WhatsApp
          </h3>
          <label className="flex items-center gap-2 text-sm mb-2 text-ink-900">
            <input
              type="checkbox"
              checked={prefs.notif_whatsapp_validation}
              onChange={(e) => handleChange("notif_whatsapp_validation", e.target.checked)}
            />
            Campagne validée
          </label>
          <label className="flex items-center gap-2 text-sm mb-2 text-ink-900">
            <input
              type="checkbox"
              checked={prefs.notif_whatsapp_payment}
              onChange={(e) => handleChange("notif_whatsapp_payment", e.target.checked)}
            />
            Paiement reçu
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-900">
            <input
              type="checkbox"
              checked={prefs.notif_whatsapp_payout}
              onChange={(e) => handleChange("notif_whatsapp_payout", e.target.checked)}
            />
            Retrait traité
          </label>
        </div>

        {/* Fréquence newsletters */}
        <div>
          <label className="text-sm font-medium text-ink-900">
            Fréquence newsletters
          </label>
          <select
            value={prefs.newsletter_frequency}
            onChange={(e) => handleChange("newsletter_frequency", e.target.value)}
            className="w-full rounded-xl px-3 py-2 text-sm mt-1 border border-ink-200"
          >
            <option value="INSTANT">Instantanée</option>
            <option value="DAILY">Quotidienne</option>
            <option value="WEEKLY">Hebdomadaire</option>
            <option value="NEVER">Jamais</option>
          </select>
        </div>

        {/* Bouton enregistrer */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full text-sm font-semibold py-2.5 rounded-xl text-white disabled:opacity-50 bg-secondary"
        >
          {saving ? "Enregistrement..." : "Enregistrer les préférences"}
        </button>
      </div>
    </div>
  );
}

function ChangePasswordSection({ email }) {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Le nouveau mot de passe doit faire au minimum 8 caractères.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");

      clearOrganizerSession();
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl bg-white p-5 border border-ink-200">
        <p className="text-sm text-ink-900">
          Votre mot de passe a été changé. Toutes vos sessions ont été invalidées pour des raisons de sécurité.
          Veuillez vous reconnecter.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-5 border border-ink-200">
      <h2 className="font-semibold mb-1 text-ink-900">
        Changer mon mot de passe
      </h2>
      <p className="text-sm mb-4 text-ink-700">
        Toutes vos sessions actives seront invalidées après changement.
      </p>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl text-secondary border border-ink-200"
        >
          <Lock size={16} /> Changer le mot de passe
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            placeholder="Mot de passe actuel"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="rounded-xl px-3 py-2 text-sm border border-ink-200"
          />
          <input
            type="password"
            placeholder="Nouveau mot de passe (min. 8 caractères)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="rounded-xl px-3 py-2 text-sm border border-ink-200"
          />
          <input
            type="password"
            placeholder="Confirmer le nouveau mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 text-sm font-semibold py-2.5 rounded-xl text-white disabled:opacity-50 bg-secondary"
            >
              {submitting ? "Changement..." : "Changer le mot de passe"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function DeleteAccountSection({ email }) {
  const [open, setOpen] = useState(false);
  const [deleteCampaigns, setDeleteCampaigns] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [understood, setUnderstood] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!understood) {
      setError("Vous devez cocher la case pour confirmer.");
      return;
    }

    if (confirmText !== "SUPPRIMER") {
      setError('Veuillez saisir "SUPPRIMER" pour confirmer.');
      return;
    }

    if (!password) {
      setError("Mot de passe requis.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/dashboard/account/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, deleteCampaigns }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");
      clearOrganizerSession();
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl bg-white p-5 border border-ink-200">
        <p className="text-sm font-semibold mb-2 text-ink-900">
          ✓ Votre compte a été supprimé
        </p>
        <p className="text-sm text-ink-700">
          Vos données personnelles ont été pseudonymisées. Vous allez être déconnecté(e).
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-5 border border-ink-200">
      <h2 className="font-semibold mb-1 text-ink-900">
        Zone dangereuse : Supprimer mon compte
      </h2>
      <p className="text-sm mb-4 text-ink-700">
        Attention : cette action est irréversible. Vos données personnelles seront pseudonymisées.
      </p>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl"
          style={{ color: "#B42318", border: "1px solid #F3C6C1" }}
        >
          <Trash2 size={16} /> Supprimer mon compte
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="rounded-xl p-3 text-sm" style={{ backgroundColor: "#FEF2F2", color: "#B42318" }}>
            <strong>⚠ Attention :</strong> Une fois supprimé, votre compte ne peut pas être récupéré.
          </div>

          <div>
            <label className="flex items-start gap-2 text-sm rounded-xl p-3 border border-ink-200">
              <input
                type="radio"
                name="delete-mode"
                checked={!deleteCampaigns}
                onChange={() => setDeleteCampaigns(false)}
                className="mt-1"
              />
              <span className="text-ink-900">
                <strong>Option 1 : Pseudonymisation seule</strong>
                <div className="text-ink-700 text-[0.85rem] mt-1">
                  Mes informations personnelles sont anonymisées. Mes campagnes restent visibles et actives.
                </div>
              </span>
            </label>

            <label className="flex items-start gap-2 text-sm rounded-xl p-3 mt-2 border border-ink-200">
              <input
                type="radio"
                name="delete-mode"
                checked={deleteCampaigns}
                onChange={() => setDeleteCampaigns(true)}
                className="mt-1"
              />
              <span className="text-ink-900">
                <strong>Option 2 : Pseudonymisation + suppression campagnes</strong>
                <div className="text-ink-700 text-[0.85rem] mt-1">
                  Mes informations personnelles sont anonymisées. Toutes mes campagnes liées sont
                  supprimées logiquement (archived).
                </div>
              </span>
            </label>
          </div>

          <div>
            <label className="text-xs font-medium text-ink-900">
              Saisissez "SUPPRIMER" pour confirmer
            </label>
            <input
              type="text"
              placeholder="SUPPRIMER"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              className="w-full rounded-xl px-3 py-2 text-sm mt-1 border border-ink-200"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink-900">
              Confirmez votre mot de passe
            </label>
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl px-3 py-2 text-sm mt-1 border border-ink-200"
            />
          </div>

          <label className="flex items-start gap-2 text-sm rounded-xl p-3 border border-ink-200">
            <input
              type="checkbox"
              checked={understood}
              onChange={(e) => setUnderstood(e.target.checked)}
              className="mt-1"
            />
            <span className="text-ink-900">
              Je comprends que cette action est <strong>irréversible</strong> et que mes données personnelles seront
              pseudonymisées à jamais.
            </span>
          </label>

          {error && (
            <div className="flex items-start gap-2 text-sm rounded-xl p-3" style={{ backgroundColor: "#FDECEC", color: "#B42318" }}>
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setConfirmText("");
                setPassword("");
                setUnderstood(false);
                setError("");
              }}
              className="flex-1 text-sm font-medium py-2.5 rounded-xl text-ink-900 border border-ink-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || confirmText !== "SUPPRIMER" || !understood}
              className="flex-1 text-sm font-semibold py-2.5 rounded-xl text-white disabled:opacity-50"
              style={{ backgroundColor: "#B42318" }}
            >
              {submitting ? "Suppression en cours..." : "Supprimer définitivement"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function OrganizerSettingsPage() {
  const email = getOrganizerSessionEmail();

  if (!email) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-6 bg-white text-ink-900">
        <h1 className="text-xl font-bold">Session organisateur introuvable</h1>
        <p className="text-ink-700">Veuillez vous reconnecter pour accéder à vos paramètres.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 px-4 sm:px-8 py-4 flex items-center gap-3 bg-white border-b border-ink-200">
        <Link to="/dashboard" className="text-secondary">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg sm:text-xl font-bold text-ink-900">
          Paramètres
        </h1>
      </header>

      <main className="px-4 sm:px-8 py-6 max-w-3xl mx-auto flex flex-col gap-4">
        <PreferencesSection email={email} />
        <ChangePasswordSection email={email} />
        <LoginLogTable email={email} />
        <DeleteAccountSection email={email} />
      </main>
    </div>
  );
}