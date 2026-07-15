import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCircle, Save, Vote, Wallet, LayoutGrid, Send, Smartphone, Lock, Trash2, AlertTriangle, Eye, EyeOff, Camera } from "lucide-react";
import { getOrganizerSessionEmail, clearOrganizerSession } from "../../lib/session.js";
import { apiGet, apiPost, formatAmount, formatDate } from "./dashboardApi.js";

const FALLBACK_OPERATOR_OPTIONS = ["Orange Money", "MTN Mobile Money", "Moov Money", "Wave", "Autre"];

// Les opérateurs proposés dépendent du pays d'inscription de l'organisateur
// (users.phone_country_code) plutôt que d'être une liste générique fixe :
// on ne veut pas proposer "MTN Mobile Money" à quelqu'un inscrit en France,
// ni cacher un opérateur disponible dans son pays. Source : /api/payment-methods
// (table aggregators, colonne countries) -- même source que la page Tarifs.
function useOperatorsForCountry(countryCode) {
  const [operators, setOperators] = useState(FALLBACK_OPERATOR_OPTIONS);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/payment-methods")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const items = Array.isArray(data?.methods) ? data.methods : Array.isArray(data) ? data : [];
        const matching = countryCode
          ? items.filter((m) => Array.isArray(m.countries) && m.countries.includes(countryCode))
          : [];
        const names = matching.map((m) => m.operator).filter(Boolean);
        if (names.length > 0) {
          setOperators([...new Set(names)].concat("Autre"));
        }
      })
      .catch(() => {
        // Silencieux : on garde la liste de repli générique en cas d'erreur réseau.
      });
    return () => {
      cancelled = true;
    };
  }, [countryCode]);

  return operators;
}

function PayoutPhoneSection({ profile, email, onUpdated }) {
  const operatorOptions = useOperatorsForCountry(profile.phone_country_code);
  const [phone, setPhone] = useState(profile.payout_phone || "");
  const [operator, setOperator] = useState(profile.payout_operator || operatorOptions[0]);
  const [editing, setEditing] = useState(!profile.payout_phone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await apiPost("/api/dashboard/profile/payout-phone", { email, phone, operator });
      setSuccess(true);
      setEditing(false);
      onUpdated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white border border-ink-200 p-6 flex flex-col gap-4">
      <p className="font-semibold text-ink-900 flex items-center gap-2"><Smartphone size={16} /> Numéro Mobile Money (reversements)</p>
      <p className="text-xs text-ink-700">
        Ce numéro est utilisé pour toutes vos demandes de retrait — il n'est pas modifiable depuis le formulaire de retrait lui-même.
      </p>

      {!editing ? (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink-900">••••{profile.payout_phone?.slice(-3)}</p>
            <p className="text-xs text-ink-700">{profile.payout_operator || "—"}</p>
          </div>
          <button onClick={() => setEditing(true)} className="text-xs font-semibold text-secondary">Modifier</button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <input
            type="tel"
            placeholder="Numéro Mobile Money"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="rounded-xl border border-ink-200 px-3 py-2.5 text-sm"
          />
          <select value={operator} onChange={(e) => setOperator(e.target.value)} className="rounded-xl border border-ink-200 px-3 py-2.5 text-sm">
            {operatorOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          {profile.phone_country_code && (
            <p className="text-[11px] text-ink-400 -mt-2">
              Opérateurs disponibles pour votre pays d'inscription.
            </p>
          )}
          {error && <p className="text-xs" style={{ color: "#B42318" }}>{error}</p>}
          <div className="flex gap-2">
            {profile.payout_phone && (
              <button type="button" onClick={() => setEditing(false)} className="flex-1 text-sm font-medium py-2.5 rounded-xl text-ink-900 border border-ink-200">
                Annuler
              </button>
            )}
            <button type="submit" disabled={saving} className="btn btn-primary flex-1 !text-sm disabled:opacity-50">
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      )}
      {success && !editing && <p className="text-xs" style={{ color: "#1B7A3D" }}>Numéro mis à jour.</p>}
    </div>
  );
}

// Champ mot de passe avec bascule afficher/masquer (œil) -- permet à
// l'utilisateur de vérifier ce qu'il saisit avant de valider.
function PasswordField({ value, onChange, placeholder, minLength, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-ink-200 px-3 py-2.5 pr-10 text-sm"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function ChangePasswordSection({ email }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("La confirmation ne correspond pas au nouveau mot de passe.");
      return;
    }
    setSaving(true);
    try {
      await apiPost("/api/auth/change-password", { email, currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-ink-200 p-6 flex flex-col gap-4">
      <p className="font-semibold text-ink-900 flex items-center gap-2"><Lock size={16} /> Changer le mot de passe</p>
      <PasswordField
        placeholder="Mot de passe actuel"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        autoComplete="current-password"
      />
      <PasswordField
        placeholder="Nouveau mot de passe (8 caractères min.)"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        minLength={8}
        autoComplete="new-password"
      />
      <PasswordField
        placeholder="Confirmer le nouveau mot de passe"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        autoComplete="new-password"
      />
      {error && <p className="text-xs" style={{ color: "#B42318" }}>{error}</p>}
      {success && <p className="text-xs" style={{ color: "#1B7A3D" }}>Mot de passe modifié. Toutes vos sessions ont été déconnectées ailleurs.</p>}
      <button type="submit" disabled={saving} className="btn btn-primary !text-sm self-start disabled:opacity-50">
        {saving ? "Enregistrement…" : "Changer le mot de passe"}
      </button>
    </form>
  );
}

function DeleteAccountSection({ email }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [deleteCampaigns, setDeleteCampaigns] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleDelete(e) {
    e.preventDefault();
    if (confirmText !== "SUPPRIMER") {
      setError('Tapez "SUPPRIMER" en majuscules pour confirmer.');
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await apiPost("/api/dashboard/account/delete", { email, password, deleteCampaigns });
      clearOrganizerSession();
      navigate("/connexion");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white border border-red-200 p-6 flex flex-col gap-4">
      <p className="font-semibold text-red-600 flex items-center gap-2"><AlertTriangle size={16} /> Supprimer le compte</p>
      {!open ? (
        <button onClick={() => setOpen(true)} className="text-sm font-semibold text-red-600 self-start flex items-center gap-1.5">
          <Trash2 size={14} /> Supprimer mon compte
        </button>
      ) : (
        <form onSubmit={handleDelete} className="flex flex-col gap-3">
          <label className="flex items-center gap-2 text-sm text-ink-900">
            <input type="checkbox" checked={deleteCampaigns} onChange={(e) => setDeleteCampaigns(e.target.checked)} />
            Supprimer aussi toutes mes campagnes
          </label>
          <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="rounded-xl border border-ink-200 px-3 py-2.5 text-sm" />
          <input placeholder='Tapez "SUPPRIMER" pour confirmer' value={confirmText} onChange={(e) => setConfirmText(e.target.value)} required
            className="rounded-xl border border-ink-200 px-3 py-2.5 text-sm" />
          {error && <p className="text-xs" style={{ color: "#B42318" }}>{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 text-sm font-medium py-2.5 rounded-xl text-ink-900 border border-ink-200">Annuler</button>
            <button type="submit" disabled={submitting} className="flex-1 text-sm font-semibold py-2.5 rounded-xl text-white bg-red-600 disabled:opacity-50">
              {submitting ? "Suppression…" : "Confirmer la suppression"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// Photo de profil de l'organisateur -- sert aussi de logo par défaut sur les
// pages publiques d'événements (voir PollHeader.jsx : utilisé quand la
// campagne n'a pas son propre logo/branding configuré).
function AvatarUpload({ avatarUrl, fullName, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/uploads/image", { method: "POST", credentials: "include", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec du téléversement.");
      await onUploaded(data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="relative shrink-0">
      <div className="w-16 h-16 rounded-full bg-ink-900 text-white flex items-center justify-center overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
        ) : (
          <UserCircle size={32} />
        )}
      </div>
      <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow border-2 border-white">
        <Camera size={12} />
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
      </label>
      {error && <p className="absolute top-full mt-1 text-[11px] whitespace-nowrap" style={{ color: "#B42318" }}>{error}</p>}
    </div>
  );
}

export default function DashboardV2Profile() {
  const email = getOrganizerSessionEmail();
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function load() {
    if (!email) return;
    apiGet(`/api/dashboard/profile?email=${encodeURIComponent(email)}`).then((p) => {
      setProfile(p);
      setFullName(p.full_name || "");
      setPhone(p.phone || "");
    });
  }

  useEffect(load, [email]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError("");
    try {
      await apiPost("/api/dashboard/profile", { email, fullName, phone });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUploaded(avatarUrl) {
    await apiPost("/api/dashboard/profile", { email, avatarUrl });
    load();
  }

  if (!profile) return <p className="text-sm text-ink-700">Chargement…</p>;

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <h1 className="text-xl font-bold text-ink-900">Mon profil</h1>

      <div className="rounded-2xl bg-white border border-ink-200 p-6 flex items-center gap-4">
        <AvatarUpload avatarUrl={profile.avatar_url} fullName={profile.full_name} onUploaded={handleAvatarUploaded} />
        <div>
          <p className="font-bold text-ink-900 text-lg">{profile.full_name}</p>
          <p className="text-sm text-ink-700">{profile.email}</p>
          <p className="text-xs text-ink-400 mt-0.5">Membre depuis {formatDate(profile.created_at, { month: "long", year: "numeric" })}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-white border border-ink-200 p-4 text-center">
          <LayoutGrid size={16} className="mx-auto text-secondary mb-1.5" />
          <p className="text-lg font-bold text-ink-900">{profile.stats.total_campaigns}</p>
          <p className="text-[11px] text-ink-700">Campagnes</p>
        </div>
        <div className="rounded-2xl bg-white border border-ink-200 p-4 text-center">
          <Vote size={16} className="mx-auto text-primary mb-1.5" />
          <p className="text-lg font-bold text-ink-900">{profile.stats.total_votes}</p>
          <p className="text-[11px] text-ink-700">Votes reçus</p>
        </div>
        <div className="rounded-2xl bg-white border border-ink-200 p-4 text-center">
          <Wallet size={16} className="mx-auto text-[#1B7A3D] mb-1.5" />
          <p className="text-lg font-bold text-ink-900">{formatAmount(profile.stats.total_revenue)}</p>
          <p className="text-[11px] text-ink-700">Revenus (FCFA)</p>
        </div>
        <div className="rounded-2xl bg-white border border-ink-200 p-4 text-center">
          <Send size={16} className="mx-auto text-gold mb-1.5" />
          <p className="text-lg font-bold text-ink-900">{profile.stats.total_payouts}</p>
          <p className="text-[11px] text-ink-700">Reversements</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="rounded-2xl bg-white border border-ink-200 p-6 flex flex-col gap-4">
        <p className="font-semibold text-ink-900">Informations personnelles</p>
        <label className="text-xs font-semibold text-ink-700">
          Nom complet
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900"
          />
        </label>
        <label className="text-xs font-semibold text-ink-700">
          Téléphone
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900"
          />
        </label>
        {/* TODO : modification d'email en libre-service, avec lien de
            vérification envoyé à la nouvelle adresse avant application du
            changement -- pas encore implémenté côté API, d'où le champ
            désactivé ci-dessous (sans bannière "bientôt disponible" visible
            à l'utilisateur, sur demande). */}
        <label className="text-xs font-semibold text-ink-700">
          Email
          <input value={profile.email} disabled className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-400 bg-ink-50" />
        </label>

        {success && <p className="text-sm" style={{ color: "#1B7A3D" }}>Profil mis à jour.</p>}
        {error && <p className="text-sm" style={{ color: "#B42318" }}>{error}</p>}

        <button type="submit" disabled={saving} className="btn btn-primary !text-sm self-start disabled:opacity-50">
          <Save size={14} /> {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>

      <PayoutPhoneSection profile={profile} email={email} onUpdated={load} />
      <ChangePasswordSection email={email} />
      <DeleteAccountSection email={email} />
    </div>
  );
}
