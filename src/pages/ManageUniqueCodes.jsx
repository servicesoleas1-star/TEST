import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Upload,
  Trash2,
  Download,
  AlertCircle,
  X,
  Copy,
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

async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");
  return data;
}

// ---------------------------------------------------------------------------
// Modale génération
// ---------------------------------------------------------------------------
function GenerateModal({ onClose, onGenerate, email }) {
  const [count, setCount] = useState(100);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onGenerate(count);
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
            Générer des codes
          </h3>
          <button onClick={onClose}>
            <X size={20} className="text-ink-900" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-sm font-medium text-ink-900">
              Nombre de codes à générer (1-10000)
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10))}
              required
              className="w-full rounded-xl px-3 py-2 text-sm mt-1 border border-ink-200"
            />
          </div>

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
              {submitting ? "Génération..." : "Générer"}
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
            Importer des codes
          </h3>
          <button onClick={onClose}>
            <X size={20} className="text-ink-900" />
          </button>
        </div>

        <p className="text-xs mb-3 text-ink-700">
          Format CSV (virgule) : <code>code</code>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            placeholder="Collez votre CSV ici... (une ligne par code)"
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
export default function ManageUniqueCodesPage() {
  const email = getOrganizerSessionEmail();
  const { campaignId } = useParams();

  const [codes, setCodes] = useState({ items: [], total: 0, page: 1, pageSize: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const loadCodes = useCallback(
    async (page = 1) => {
      if (!email || !campaignId) return;
      try {
        const data = await apiGet(
          `/api/dashboard/campaigns/${campaignId}/unique-codes?email=${encodeURIComponent(email)}&page=${page}&pageSize=20`
        );
        setCodes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [email, campaignId]
  );

  useEffect(() => {
    loadCodes(1);
  }, [loadCodes]);

  const handleGenerateCodes = async (count) => {
    try {
      await apiPost(
        `/api/dashboard/campaigns/${campaignId}/unique-codes/generate`,
        { count, email }
      );
      setToast(`${count} code(s) généré(s).`);
      await loadCodes(1);
    } catch (err) {
      throw err;
    }
  };

  const handleImportCodes = async (csvContent) => {
    try {
      const data = await apiPost(
        `/api/dashboard/campaigns/${campaignId}/unique-codes/import`,
        { csvContent, email }
      );
      setToast(`${data.count} code(s) importé(s).`);
      await loadCodes(1);
    } catch (err) {
      throw err;
    }
  };

  const handleCancelCode = async (codeId) => {
    if (!confirm("Êtes-vous sûr ? Cela invalider aussi le vote associé.")) return;
    try {
      await apiDelete(
        `/api/dashboard/campaigns/${campaignId}/unique-codes/${codeId}?email=${encodeURIComponent(email)}`
      );
      setToast("Code annulé.");
      await loadCodes(codes.page);
    } catch (err) {
      setToast(err.message);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/dashboard/campaigns/${campaignId}/unique-codes/export?email=${encodeURIComponent(email)}`
      );
      if (!res.ok) throw new Error("Erreur lors de l'export.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "codes-uniques.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setToast(err.message);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setToast("Code copié !");
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
          Codes uniques
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
            onClick={() => setShowGenerateModal(true)}
            className="btn btn-primary !text-sm"
          >
            <Plus size={16} /> Générer des codes
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl text-secondary border border-ink-200"
          >
            <Upload size={16} /> Importer CSV
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl text-secondary border border-ink-200"
          >
            <Download size={16} /> Exporter
          </button>
        </div>

        {loading ? (
          <p className="text-ink-700">Chargement des codes…</p>
        ) : codes.items.length === 0 ? (
          <p className="text-ink-700">Aucun code pour le moment.</p>
        ) : (
          <>
            <div className="rounded-2xl bg-white p-5 border border-ink-200">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-ink-700">
                      <th className="pb-2 font-medium">Code</th>
                      <th className="pb-2 font-medium">Statut</th>
                      <th className="pb-2 font-medium">Date d'utilisation</th>
                      <th className="pb-2 font-medium w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {codes.items.map((code) => (
                      <tr key={code.code_id} className="border-t border-ink-200">
                        <td className="py-3 text-ink-900">
                          <code className="font-mono font-semibold">{code.code}</code>
                        </td>
                        <td className="py-3">
                          {code.status === "UNUSED" && (
                            <span
                              className="text-xs font-semibold px-2 py-1 rounded-lg"
                              style={{ backgroundColor: "#E0F2FE", color: "#2B6BFF" }}
                            >
                              Inutilisé
                            </span>
                          )}
                          {code.status === "USED" && (
                            <span
                              className="text-xs font-semibold px-2 py-1 rounded-lg"
                              style={{ backgroundColor: "#DBEAFE", color: "#2B6BFF" }}
                            >
                              Utilisé
                            </span>
                          )}
                          {code.status === "CANCELLED" && (
                            <span
                              className="text-xs font-semibold px-2 py-1 rounded-lg"
                              style={{ backgroundColor: "#FEE2E2", color: "#B42318" }}
                            >
                              Annulé
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-xs text-ink-700">
                          {code.used_at ? new Date(code.used_at).toLocaleString("fr-FR") : "-"}
                        </td>
                        <td className="py-3 flex gap-2">
                          <button
                            onClick={() => handleCopyCode(code.code)}
                            className="p-1.5 rounded-lg border border-ink-200 text-secondary"
                            title="Copier"
                          >
                            <Copy size={14} />
                          </button>
                          {code.status !== "CANCELLED" && (
                            <button
                              onClick={() => handleCancelCode(code.code_id)}
                              className="p-1.5 rounded-lg border border-ink-200"
                              style={{ color: "#B42318" }}
                              title="Annuler"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {codes.total > codes.pageSize && (
              <div className="flex items-center justify-between text-sm text-ink-900">
                <button
                  onClick={() => loadCodes(codes.page - 1)}
                  disabled={codes.page <= 1}
                  className="px-3 py-2 rounded-lg disabled:opacity-30 border border-ink-200"
                >
                  Précédent
                </button>
                <span className="text-ink-700">
                  Page {codes.page} / {Math.ceil(codes.total / codes.pageSize)}
                </span>
                <button
                  onClick={() => loadCodes(codes.page + 1)}
                  disabled={codes.page >= Math.ceil(codes.total / codes.pageSize)}
                  className="px-3 py-2 rounded-lg disabled:opacity-30 border border-ink-200"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {showGenerateModal && (
        <GenerateModal
          onClose={() => setShowGenerateModal(false)}
          onGenerate={handleGenerateCodes}
          email={email}
        />
      )}

      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImportCodes}
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