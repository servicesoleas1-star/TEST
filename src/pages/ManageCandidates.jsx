import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Plus,
  Upload,
  Trash2,
  Edit2,
  GripVertical,
  Download,
  AlertCircle,
  X,
  Image as ImageIcon,
  Video,
  Trophy,
  Info,
} from "lucide-react";
import { getOrganizerSessionEmail } from "../lib/session.js";

// URLs relatives + cookies de session, cohérent avec dashboard-v2/dashboardApi.js
// (l'ancien API_BASE="http://localhost:4000" codé en dur cassait toute requête
// hors environnement de dev local, y compris en production).
function redirectToLogin() {
  const redirectTo = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.href = `/connexion?redirect_to=${redirectTo}`;
}

async function handleAuthAndJson(res) {
  if (res.status === 401) {
    redirectToLogin();
    return new Promise(() => {});
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");
  return data;
}

async function apiGet(path) {
  const res = await fetch(path, { credentials: "include" });
  return handleAuthAndJson(res);
}

async function apiPost(path, body) {
  const res = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleAuthAndJson(res);
}

async function apiPatch(path, body) {
  const res = await fetch(path, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleAuthAndJson(res);
}

async function apiDelete(path) {
  const res = await fetch(path, { method: "DELETE", credentials: "include" });
  return handleAuthAndJson(res);
}

async function apiPut(path, body) {
  const res = await fetch(path, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleAuthAndJson(res);
}

// ---------------------------------------------------------------------------
// Bouton d'upload de photo -- remplace l'ancien champ "URL photo" en texte
// libre : téléverse réellement le fichier via /api/uploads/image et stocke
// l'URL renvoyée, cohérent avec le reste du produit (couverture de
// campagne, voir DashboardV2CampaignsNew.jsx).
// ---------------------------------------------------------------------------
function PhotoUploadField({ label, value, onChange }) {
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
      onChange(data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {value ? (
        <img src={value} alt="" className="w-11 h-11 rounded-lg object-cover border border-ink-200 shrink-0" />
      ) : (
        <div className="w-11 h-11 rounded-lg bg-ink-100 shrink-0" />
      )}
      <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-ink-300 text-sm text-ink-700 cursor-pointer hover:border-primary hover:text-primary transition-colors">
        <Upload size={14} />
        {uploading ? "Envoi…" : value ? "Changer" : label}
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
      </label>
      {error && <p className="text-xs" style={{ color: "#B42318" }}>{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Upload multiple -- photos ou vidéos additionnelles (galerie du candidat).
// Stockées côté API comme tableau (additional_photos_urls / videos_urls).
// ---------------------------------------------------------------------------
function MultiUploadField({ label, icon: Icon, accept, kind, values, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const list = Array.isArray(values) ? values : [];

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const uploaded = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append(kind === "video" ? "video" : "image", file);
        const endpoint = kind === "video" ? "/api/uploads/video" : "/api/uploads/image";
        const res = await fetch(endpoint, { method: "POST", credentials: "include", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Échec du téléversement.");
        uploaded.push(data.url);
      }
      onChange([...list, ...uploaded]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeAt(idx) {
    onChange(list.filter((_, i) => i !== idx));
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-ink-300 text-sm text-ink-700 cursor-pointer hover:border-primary hover:text-primary transition-colors">
        <Icon size={14} />
        {uploading ? "Envoi…" : label}
        <input type="file" accept={accept} multiple className="hidden" onChange={handleFiles} disabled={uploading} />
      </label>
      {error && <p className="text-xs" style={{ color: "#B42318" }}>{error}</p>}
      {list.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {list.map((url, idx) => (
            <div key={url + idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-ink-200 bg-ink-100 group">
              {kind === "video" ? (
                <video src={url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={url} alt="" className="w-full h-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-ink-900/70 text-white flex items-center justify-center text-[10px]"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modale ajout/édition candidat
// ---------------------------------------------------------------------------
function CandidateModal({ candidate, onClose, onSave }) {
  const [form, setForm] = useState(
    candidate || {
      display_name: "",
      real_name: "",
      photo_url: "",
      additional_photos_urls: [],
      videos_urls: [],
      description: "",
      category: "",
      phone: "",
      email: "",
      mobile_money: "",
    }
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-ink-900/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-ink-900">
            {candidate ? "Modifier candidat" : "Ajouter un candidat"}
          </h3>
          <button onClick={onClose}>
            <X size={20} className="text-ink-900" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nom à afficher *"
            value={form.display_name}
            onChange={(e) => setForm({ ...form, display_name: e.target.value })}
            required
            className="rounded-xl px-3 py-2 text-sm border border-ink-200"
          />
          <input
            type="text"
            placeholder="Nom réel"
            value={form.real_name || ""}
            onChange={(e) => setForm({ ...form, real_name: e.target.value })}
            className="rounded-xl px-3 py-2 text-sm border border-ink-200"
          />

          <p className="text-xs font-semibold text-ink-700 -mb-1">Photo de couverture (principale)</p>
          <PhotoUploadField
            label="Photo de couverture"
            value={form.photo_url}
            onChange={(url) => setForm({ ...form, photo_url: url })}
          />

          <p className="text-xs font-semibold text-ink-700 -mb-1">Photos additionnelles</p>
          <MultiUploadField
            label="Ajouter des photos"
            icon={ImageIcon}
            accept="image/*"
            kind="image"
            values={form.additional_photos_urls}
            onChange={(list) => setForm({ ...form, additional_photos_urls: list })}
          />

          <p className="text-xs font-semibold text-ink-700 -mb-1">Vidéos additionnelles</p>
          <MultiUploadField
            label="Ajouter des vidéos"
            icon={Video}
            accept="video/*"
            kind="video"
            values={form.videos_urls}
            onChange={(list) => setForm({ ...form, videos_urls: list })}
          />

          <textarea
            placeholder="Biographie / description"
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="rounded-xl px-3 py-2 text-sm border border-ink-200"
            rows={3}
          />
          <input
            type="text"
            placeholder="Catégorie"
            value={form.category || ""}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="rounded-xl px-3 py-2 text-sm border border-ink-200"
          />
          <input
            type="tel"
            placeholder="Téléphone (privé)"
            value={form.phone || ""}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="rounded-xl px-3 py-2 text-sm border border-ink-200"
          />
          <input
            type="email"
            placeholder="Email (privé)"
            value={form.email || ""}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-xl px-3 py-2 text-sm border border-ink-200"
          />
          <input
            type="text"
            placeholder="Numéro Mobile Money (reversement candidat)"
            value={form.mobile_money || ""}
            onChange={(e) => setForm({ ...form, mobile_money: e.target.value })}
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
              onClick={onClose}
              className="flex-1 text-sm font-medium py-2.5 rounded-xl text-ink-900 border border-ink-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary flex-1 !text-sm disabled:opacity-50"
            >
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modale import CSV
// ---------------------------------------------------------------------------
function ImportModal({ onClose, onImport }) {
  const [csvText, setCsvText] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onImport(csvText);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-ink-900/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-ink-900">
            Importer des candidats
          </h3>
          <button onClick={onClose}>
            <X size={20} className="text-ink-900" />
          </button>
        </div>

        <div className="flex items-start gap-2 text-xs mb-3 rounded-xl p-3 bg-secondary-50 text-ink-700">
          <Info size={15} className="shrink-0 mt-0.5 text-secondary" />
          <div>
            <p className="font-semibold text-ink-900 mb-1">Comment ça marche ?</p>
            <p>
              Collez une ligne par candidat, colonnes séparées par une virgule, dans l'ordre :
              {" "}<code className="font-mono">display_name, real_name, description, category, phone, email, mobile_money</code>.
              Seul <strong>display_name</strong> est obligatoire.
            </p>
            <p className="mt-1">
              Les photos et vidéos ne s'importent pas par CSV — ajoutez-les ensuite candidat par
              candidat (bouton Modifier), une fois les fiches créées.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            placeholder="Collez votre CSV ici..."
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            required
            className="rounded-xl px-3 py-2 text-sm font-mono border border-ink-200"
            rows={8}
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
              onClick={onClose}
              className="flex-1 text-sm font-medium py-2.5 rounded-xl text-ink-900 border border-ink-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary flex-1 !text-sm disabled:opacity-50"
            >
              {submitting ? "Import..." : "Importer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------
export default function ManageCandidatesPage() {
  const email = getOrganizerSessionEmail();
  const { campaignId } = useParams();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [draggingId, setDraggingId] = useState(null);

  const loadCandidates = useCallback(async () => {
    if (!email || !campaignId) return;
    try {
      const data = await apiGet(
        `/api/dashboard/campaigns/${campaignId}/candidates?email=${encodeURIComponent(email)}`
      );
      setCandidates(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [email, campaignId]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  const handleAddCandidate = async (formData) => {
    await apiPost(
      `/api/dashboard/campaigns/${campaignId}/candidates`,
      { ...formData, email }
    );
    setToast("Candidat ajouté.");
    await loadCandidates();
  };

  const handleUpdateCandidate = async (formData) => {
    await apiPatch(
      `/api/dashboard/campaigns/${campaignId}/candidates/${editingCandidate.candidate_id}`,
      { ...formData, email }
    );
    setToast("Candidat modifié.");
    setEditingCandidate(null);
    await loadCandidates();
  };

  const handleDeleteCandidate = async (candidateId) => {
    if (!confirm("Êtes-vous sûr ?")) return;
    try {
      await apiDelete(
        `/api/dashboard/campaigns/${campaignId}/candidates/${candidateId}?email=${encodeURIComponent(email)}`
      );
      setToast("Candidat supprimé.");
      await loadCandidates();
    } catch (err) {
      setToast(err.message);
    }
  };

  const handleImportCandidates = async (csvContent) => {
    const data = await apiPost(
      `/api/dashboard/campaigns/${campaignId}/candidates/import`,
      { csvContent, email }
    );
    setToast(`${data.count} candidat(s) importé(s).`);
    await loadCandidates();
  };

  const handleReorder = async (newCandidates) => {
    const items = newCandidates.map((c, idx) => ({
      candidate_id: c.candidate_id,
      position: idx,
    }));
    try {
      await apiPut(
        `/api/dashboard/campaigns/${campaignId}/candidates/reorder`,
        { items, email }
      );
      setToast("Ordre des candidats mis à jour.");
      await loadCandidates();
    } catch (err) {
      setToast(err.message);
    }
  };

  const handleDragStart = (candidateId) => {
    setDraggingId(candidateId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetCandidate) => {
    if (!draggingId || draggingId === targetCandidate.candidate_id) {
      setDraggingId(null);
      return;
    }
    const draggedCandidate = candidates.find((c) => c.candidate_id === draggingId);
    const newList = candidates.filter((c) => c.candidate_id !== draggingId);
    const targetIdx = newList.findIndex((c) => c.candidate_id === targetCandidate.candidate_id);
    newList.splice(targetIdx, 0, draggedCandidate);
    setCandidates(newList);
    handleReorder(newList);
    setDraggingId(null);
  };

  const handleDownloadTemplate = () => {
    const csv = "display_name,real_name,description,category,phone,email,mobile_money\nCandidat 1,Jean Dupont,,Groupe A,+237XXXXXXX,jean@example.com,\nCandidat 2,Marie Martin,,Groupe B,+237XXXXXXX,marie@example.com,";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  if (!email) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-6 bg-white text-ink-900">
        <h1 className="text-xl font-bold">Session introuvable</h1>
      </div>
    );
  }

  // Classement live basé sur le score renvoyé par l'API (candidates.score) --
  // recalculé côté serveur à chaque vote comptabilisé.
  const ranked = [...candidates].sort((a, b) => (b.score || 0) - (a.score || 0));
  const rankByCandidateId = new Map(ranked.map((c, idx) => [c.candidate_id, idx + 1]));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link to={`/dashboard-v2/campagnes/${campaignId}`} className="text-xs font-semibold text-secondary">← Retour à la campagne</Link>
        <h1 className="text-xl font-bold text-ink-900 mt-1">Gérer les candidats</h1>
      </div>

      <div className="flex flex-col gap-6">
        {error && (
          <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: "#FDECEC", color: "#B42318" }}>
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary !text-sm"
          >
            <Plus size={16} /> Ajouter un candidat
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl text-secondary border border-ink-200"
          >
            <Upload size={16} /> Importer CSV
          </button>
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl text-secondary border border-ink-200"
          >
            <Download size={16} /> Télécharger template
          </button>
        </div>

        {loading ? (
          <p className="text-ink-700">Chargement des candidats…</p>
        ) : candidates.length === 0 ? (
          <p className="text-ink-700">Aucun candidat pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map((candidate) => (
              <div
                key={candidate.candidate_id}
                draggable
                onDragStart={() => handleDragStart(candidate.candidate_id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(candidate)}
                className={`relative rounded-2xl overflow-hidden border border-ink-200 h-56 flex flex-col justify-between text-white transition-opacity cursor-grab ${
                  draggingId === candidate.candidate_id ? "opacity-50" : "opacity-100"
                }`}
                style={{
                  backgroundImage: candidate.photo_url
                    ? `linear-gradient(180deg, rgba(11,19,36,0.15) 0%, rgba(11,19,36,0.85) 100%), url(${candidate.photo_url})`
                    : "linear-gradient(135deg, #0B1324, #1E293B)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="flex items-start justify-between p-3">
                  <span className="w-7 h-7 rounded-full bg-gold text-ink-900 text-xs font-bold flex items-center justify-center shrink-0 shadow">
                    <Trophy size={12} className="mr-0.5" />
                    {rankByCandidateId.get(candidate.candidate_id)}
                  </span>
                  <GripVertical size={16} className="text-white/70" />
                </div>

                <div className="p-3 flex flex-col gap-1">
                  {candidate.category && (
                    <span className="self-start text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur">
                      {candidate.category}
                    </span>
                  )}
                  <strong className="text-sm leading-snug truncate">{candidate.display_name}</strong>
                  <div className="flex items-center justify-between text-xs text-white/80">
                    <span>{candidate.score || 0} votes</span>
                    {!candidate.active && <span className="text-[10px] font-semibold text-white/60">Inactif</span>}
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => setEditingCandidate(candidate)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-lg bg-white text-ink-900"
                      title="Modifier"
                    >
                      <Edit2 size={12} /> Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteCandidate(candidate.candidate_id)}
                      className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-white/15 backdrop-blur"
                      style={{ color: "#FCA5A5" }}
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <CandidateModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddCandidate}
        />
      )}

      {editingCandidate && (
        <CandidateModal
          candidate={editingCandidate}
          onClose={() => setEditingCandidate(null)}
          onSave={handleUpdateCandidate}
        />
      )}

      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImportCandidates}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl px-4 py-3 text-sm text-white shadow-lg bg-ink-900">
          {toast}
        </div>
      )}
    </div>
  );
}
