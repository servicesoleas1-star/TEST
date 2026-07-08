import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Upload,
  Trash2,
  Edit2,
  GripVertical,
  Download,
  AlertCircle,
  X,
} from "lucide-react";
import { getOrganizerSessionEmail } from "../lib/session.js";

const API_BASE = "http://localhost:4000";

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

async function apiPatch(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");
  return data;
}

async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");
  return data;
}

async function apiPut(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");
  return data;
}

// ---------------------------------------------------------------------------
// Modale ajout/édition candidat
// ---------------------------------------------------------------------------
function CandidateModal({ candidate, onClose, onSave, email }) {
  const [form, setForm] = useState(
    candidate || {
      display_name: "",
      real_name: "",
      photo_url: "",
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
          <input
            type="url"
            placeholder="URL photo"
            value={form.photo_url || ""}
            onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
            className="rounded-xl px-3 py-2 text-sm border border-ink-200"
          />
          <textarea
            placeholder="Description"
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
            placeholder="Téléphone"
            value={form.phone || ""}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="rounded-xl px-3 py-2 text-sm border border-ink-200"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email || ""}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-xl px-3 py-2 text-sm border border-ink-200"
          />
          <input
            type="text"
            placeholder="Mobile Money"
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
function ImportModal({ onClose, onImport, email }) {
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

        <p className="text-xs mb-3 text-ink-700">
          Format CSV (virgule) : <code>display_name, real_name, photo_url, description, category, phone, email, mobile_money</code>
        </p>

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
    try {
      await apiPost(
        `/api/dashboard/campaigns/${campaignId}/candidates`,
        { ...formData, email }
      );
      setToast("Candidat ajouté.");
      await loadCandidates();
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateCandidate = async (formData) => {
    try {
      await apiPatch(
        `/api/dashboard/campaigns/${campaignId}/candidates/${editingCandidate.candidate_id}`,
        { ...formData, email }
      );
      setToast("Candidat modifié.");
      setEditingCandidate(null);
      await loadCandidates();
    } catch (err) {
      throw err;
    }
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
    try {
      const data = await apiPost(
        `/api/dashboard/campaigns/${campaignId}/candidates/import`,
        { csvContent, email }
      );
      setToast(`${data.count} candidat(s) importé(s).`);
      await loadCandidates();
    } catch (err) {
      throw err;
    }
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
    const csv = "display_name,real_name,photo_url,description,category,phone,email,mobile_money\nCandidat 1,Jean Dupont,,,Groupe A,+237XXXXXXX,jean@example.com,\nCandidat 2,Marie Martin,,,Groupe B,+237XXXXXXX,marie@example.com,";
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

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 px-4 sm:px-8 py-4 flex items-center gap-3 bg-white border-b border-ink-200">
        <Link to="/organisateur/tableau-de-bord" className="text-secondary">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg sm:text-xl font-bold text-ink-900">
          Gérer les candidats
        </h1>
      </header>

      <main className="px-4 sm:px-8 py-6 max-w-4xl mx-auto flex flex-col gap-6">
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
          <div className="rounded-2xl bg-white p-5 border border-ink-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-ink-700">
                    <th className="pb-2 font-medium w-8"></th>
                    <th className="pb-2 font-medium">Nom</th>
                    <th className="pb-2 font-medium">Catégorie</th>
                    <th className="pb-2 font-medium">Contact</th>
                    <th className="pb-2 font-medium w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate) => (
                      <tr
                        key={candidate.candidate_id}
                        draggable
                        onDragStart={() => handleDragStart(candidate.candidate_id)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(candidate)}
                        className={`border-t border-ink-200 cursor-grab ${
                          draggingId === candidate.candidate_id ? "opacity-50" : "opacity-100"
                        }`}
                      >
                        <td className="py-3 text-center">
                          <GripVertical size={16} className="text-ink-700" />
                        </td>
                        <td className="py-3 text-ink-900">
                          <strong>{candidate.display_name}</strong>
                          {candidate.real_name && (
                            <div className="text-xs text-ink-700">
                              {candidate.real_name}
                            </div>
                          )}
                        </td>
                        <td className="py-3 text-ink-900">
                          {candidate.category || "-"}
                        </td>
                        <td className="py-3 text-xs text-ink-700">
                          {candidate.email && <div>{candidate.email}</div>}
                          {candidate.phone && <div>{candidate.phone}</div>}
                        </td>
                        <td className="py-3 flex gap-2">
                          <button
                            onClick={() => setEditingCandidate(candidate)}
                            className="p-1.5 rounded-lg border border-ink-200 text-secondary"
                            title="Modifier"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCandidate(candidate.candidate_id)}
                            className="p-1.5 rounded-lg border border-ink-200"
                            style={{ color: "#B42318" }}
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {showAddModal && (
        <CandidateModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddCandidate}
          email={email}
        />
      )}

      {editingCandidate && (
        <CandidateModal
          candidate={editingCandidate}
          onClose={() => setEditingCandidate(null)}
          onSave={handleUpdateCandidate}
          email={email}
        />
      )}

      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImportCandidates}
          email={email}
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