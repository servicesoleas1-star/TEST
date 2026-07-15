import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  Megaphone,
  HelpCircle,
  Image as ImageIcon,
  Newspaper,
  Handshake,
  Palette,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { getOrganizerSessionEmail } from "../../lib/session.js";
import { apiGet, apiPost, apiPatch, apiDelete } from "./dashboardApi.js";

const TABS = [
  { key: "annonces", label: "Annonces", icon: Megaphone },
  { key: "faq", label: "FAQ", icon: HelpCircle },
  { key: "galerie", label: "Galerie", icon: ImageIcon },
  { key: "actualites", label: "Actualités", icon: Newspaper },
  { key: "partenaires", label: "Partenaires", icon: Handshake },
  { key: "personnalisation", label: "Personnalisation", icon: Palette },
];

function Card({ children, className = "" }) {
  return <div className={`rounded-2xl bg-white border border-ink-200 p-5 ${className}`}>{children}</div>;
}

function EmptyState({ label }) {
  return <p className="text-sm text-ink-700 py-6 text-center">{label}</p>;
}

// ---------------------------------------------------------------------------
// Onglet Annonces / Pop-ups
// ---------------------------------------------------------------------------
function NoticesTab({ base, email, refreshKey, bump }) {
  const [items, setItems] = useState(null);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("ANNOUNCEMENT");
  const [permanent, setPermanent] = useState(true);
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiGet(`${base}/notices?email=${encodeURIComponent(email)}`).then((d) => setItems(d.items));
  }, [base, email, refreshKey]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await apiPost(`${base}/notices`, { email, message, type, permanent, expiresAt: permanent ? null : expiresAt || null });
      setMessage("");
      bump();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(noticeId) {
    await apiDelete(`${base}/notices/${noticeId}?email=${encodeURIComponent(email)}`);
    bump();
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <p className="font-semibold text-ink-900 mb-3">Nouvelle annonce</p>
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <textarea
            placeholder="Message à afficher sur la page publique du scrutin..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            className="rounded-xl border border-ink-200 px-3 py-2.5 text-sm resize-none"
          />
          <div className="flex flex-wrap items-center gap-3">
            <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border border-ink-200 px-3 py-2 text-sm bg-white">
              <option value="ANNOUNCEMENT">Bandeau (annonce)</option>
              <option value="POPUP">Pop-up</option>
            </select>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-ink-700">
              <input type="checkbox" checked={permanent} onChange={(e) => setPermanent(e.target.checked)} />
              Permanent
            </label>
            {!permanent && (
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="rounded-xl border border-ink-200 px-3 py-2 text-sm"
              />
            )}
            <button type="submit" disabled={submitting} className="btn btn-primary !text-xs !py-2 ml-auto disabled:opacity-50">
              <Plus size={14} /> Publier
            </button>
          </div>
          {error && <p className="text-xs" style={{ color: "#B42318" }}>{error}</p>}
        </form>
      </Card>

      {items === null ? (
        <p className="text-sm text-ink-700">Chargement…</p>
      ) : items.length === 0 ? (
        <EmptyState label="Aucune annonce publiée pour le moment." />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((n) => (
            <div key={n.notice_id} className="flex items-start justify-between gap-3 rounded-xl border border-ink-200 bg-white p-4">
              <div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${n.type === "POPUP" ? "bg-secondary-50 text-secondary" : "bg-primary-50 text-primary"}`}>
                  {n.type === "POPUP" ? "Pop-up" : "Bandeau"}
                </span>
                {n.permanent && <span className="ml-2 text-[10px] text-ink-400">Permanent</span>}
                <p className="text-sm text-ink-900 mt-1">{n.message}</p>
              </div>
              <button onClick={() => handleDelete(n.notice_id)} className="p-1.5 rounded-lg border border-ink-200 shrink-0" style={{ color: "#B42318" }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Onglet FAQ
// ---------------------------------------------------------------------------
function FaqTab({ base, email, refreshKey, bump }) {
  const [items, setItems] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiGet(`${base}/faqs?email=${encodeURIComponent(email)}`).then((d) => setItems(d.items));
  }, [base, email, refreshKey]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    setSubmitting(true);
    try {
      await apiPost(`${base}/faqs`, { email, question, answer, position: items?.length || 0 });
      setQuestion("");
      setAnswer("");
      bump();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(faqId) {
    await apiDelete(`${base}/faqs/${faqId}?email=${encodeURIComponent(email)}`);
    bump();
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <p className="font-semibold text-ink-900 mb-3">Nouvelle question</p>
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Question"
            className="rounded-xl border border-ink-200 px-3 py-2.5 text-sm" />
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Réponse" rows={2}
            className="rounded-xl border border-ink-200 px-3 py-2.5 text-sm resize-none" />
          <button type="submit" disabled={submitting} className="btn btn-primary !text-xs !py-2 self-start disabled:opacity-50">
            <Plus size={14} /> Ajouter
          </button>
        </form>
      </Card>

      {items === null ? (
        <p className="text-sm text-ink-700">Chargement…</p>
      ) : items.length === 0 ? (
        <EmptyState label="Aucune question pour le moment." />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((f) => (
            <div key={f.faq_id} className="flex items-start justify-between gap-3 rounded-xl border border-ink-200 bg-white p-4">
              <div>
                <p className="text-sm font-semibold text-ink-900">{f.question}</p>
                <p className="text-sm text-ink-700 mt-0.5">{f.answer}</p>
              </div>
              <button onClick={() => handleDelete(f.faq_id)} className="p-1.5 rounded-lg border border-ink-200 shrink-0" style={{ color: "#B42318" }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Onglet Galerie
// ---------------------------------------------------------------------------
const GALLERY_TAGS = [
  { value: "BEFORE", label: "Avant" },
  { value: "DURING", label: "Pendant" },
  { value: "AFTER", label: "Après" },
];

function GalleryTab({ base, email, refreshKey, bump }) {
  const [items, setItems] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [tag, setTag] = useState("DURING");
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet(`${base}/gallery?email=${encodeURIComponent(email)}`).then((d) => setItems(d.items));
  }, [base, email, refreshKey]);

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        const isVideo = file.type.startsWith("video/");
        const formData = new FormData();
        formData.append(isVideo ? "video" : "image", file);
        const res = await fetch(isVideo ? "/api/uploads/video" : "/api/uploads/image", { method: "POST", credentials: "include", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Échec du téléversement.");
        await apiPost(`${base}/gallery`, { email, mediaUrl: data.url, mediaType: isVideo ? "VIDEO" : "PHOTO", tag });
      }
      bump();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(itemId) {
    if (itemId.startsWith("poll-media-")) return; // médias de la fiche campagne, gérés depuis l'étape Informations
    await apiDelete(`${base}/gallery/${itemId}?email=${encodeURIComponent(email)}`);
    bump();
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <p className="font-semibold text-ink-900 mb-3">Ajouter à la galerie</p>
        <div className="flex flex-wrap items-center gap-3">
          <select value={tag} onChange={(e) => setTag(e.target.value)} className="rounded-xl border border-ink-200 px-3 py-2 text-sm bg-white">
            {GALLERY_TAGS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-ink-300 text-sm text-ink-700 cursor-pointer hover:border-primary hover:text-primary transition-colors">
            <Upload size={14} />
            {uploading ? "Envoi…" : "Ajouter photos/vidéos"}
            <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFiles} disabled={uploading} />
          </label>
        </div>
        {error && <p className="text-xs mt-2" style={{ color: "#B42318" }}>{error}</p>}
      </Card>

      {items === null ? (
        <p className="text-sm text-ink-700">Chargement…</p>
      ) : items.length === 0 ? (
        <EmptyState label="Galerie vide pour le moment." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((it) => (
            <div key={it.item_id} className="relative aspect-square rounded-xl overflow-hidden border border-ink-200 bg-ink-100 group">
              {it.media_type === "VIDEO" ? (
                <video src={it.media_url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={it.media_url} alt="" className="w-full h-full object-cover" />
              )}
              {it.tag && <span className="absolute top-1.5 left-1.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-black/60 text-white">{GALLERY_TAGS.find((t) => t.value === it.tag)?.label}</span>}
              {!String(it.item_id).startsWith("poll-media-") && (
                <button onClick={() => handleDelete(it.item_id)} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-ink-900/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Onglet Actualités
// ---------------------------------------------------------------------------
function NewsTab({ base, email, refreshKey, bump }) {
  const [items, setItems] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiGet(`${base}/news?email=${encodeURIComponent(email)}`).then((d) => setItems(d.items));
  }, [base, email, refreshKey]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      await apiPost(`${base}/news`, { email, title, body });
      setTitle("");
      setBody("");
      bump();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(newsId) {
    await apiDelete(`${base}/news/${newsId}?email=${encodeURIComponent(email)}`);
    bump();
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <p className="font-semibold text-ink-900 mb-3">Nouvelle publication</p>
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre"
            className="rounded-xl border border-ink-200 px-3 py-2.5 text-sm" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Texte" rows={3}
            className="rounded-xl border border-ink-200 px-3 py-2.5 text-sm resize-none" />
          <button type="submit" disabled={submitting} className="btn btn-primary !text-xs !py-2 self-start disabled:opacity-50">
            <Plus size={14} /> Publier
          </button>
        </form>
      </Card>

      {items === null ? (
        <p className="text-sm text-ink-700">Chargement…</p>
      ) : items.length === 0 ? (
        <EmptyState label="Aucune actualité publiée pour le moment." />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((n) => (
            <div key={n.news_id} className="flex items-start justify-between gap-3 rounded-xl border border-ink-200 bg-white p-4">
              <div>
                <p className="text-sm font-semibold text-ink-900">{n.title}</p>
                <p className="text-sm text-ink-700 mt-0.5">{n.body}</p>
              </div>
              <button onClick={() => handleDelete(n.news_id)} className="p-1.5 rounded-lg border border-ink-200 shrink-0" style={{ color: "#B42318" }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Onglet Partenaires
// ---------------------------------------------------------------------------
const PARTNER_LEVELS = [
  { value: "", label: "Sans niveau" },
  { value: "Or", label: "Or" },
  { value: "Argent", label: "Argent" },
  { value: "Bronze", label: "Bronze" },
];

function PartnersTab({ base, email, refreshKey, bump }) {
  const [items, setItems] = useState(null);
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [level, setLevel] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiGet(`${base}/partners?email=${encodeURIComponent(email)}`).then((d) => setItems(d.items));
  }, [base, email, refreshKey]);

  async function handleLogoFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/uploads/image", { method: "POST", credentials: "include", body: formData });
      const data = await res.json();
      if (res.ok) setLogoUrl(data.url);
    } finally {
      setUploading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await apiPost(`${base}/partners`, { email, name, websiteUrl, level: level || null, logoUrl });
      setName(""); setWebsiteUrl(""); setLevel(""); setLogoUrl("");
      bump();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(partnerId) {
    await apiDelete(`${base}/partners/${partnerId}?email=${encodeURIComponent(email)}`);
    bump();
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <p className="font-semibold text-ink-900 mb-3">Nouveau partenaire</p>
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom du partenaire"
              className="rounded-xl border border-ink-200 px-3 py-2.5 text-sm" />
            <input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="Site web (optionnel)"
              className="rounded-xl border border-ink-200 px-3 py-2.5 text-sm" />
          </div>
          <div className="flex items-center gap-3">
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="rounded-xl border border-ink-200 px-3 py-2 text-sm bg-white">
              {PARTNER_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            {logoUrl && <img src={logoUrl} alt="" className="w-9 h-9 rounded-lg object-cover border border-ink-200" />}
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-ink-300 text-xs text-ink-700 cursor-pointer hover:border-primary hover:text-primary transition-colors">
              <Upload size={13} /> {uploading ? "Envoi…" : "Logo"}
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoFile} disabled={uploading} />
            </label>
            <button type="submit" disabled={submitting} className="btn btn-primary !text-xs !py-2 ml-auto disabled:opacity-50">
              <Plus size={14} /> Ajouter
            </button>
          </div>
        </form>
      </Card>

      {items === null ? (
        <p className="text-sm text-ink-700">Chargement…</p>
      ) : items.length === 0 ? (
        <EmptyState label="Aucun partenaire pour le moment." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {items.map((p) => (
            <div key={p.partner_id} className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-3">
              {p.logo_url ? <img src={p.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-ink-200 shrink-0" /> : <div className="w-10 h-10 rounded-lg bg-ink-100 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-900 truncate">{p.name}</p>
                <p className="text-[11px] text-ink-700">{p.level || "—"}</p>
              </div>
              <button onClick={() => handleDelete(p.partner_id)} className="p-1.5 rounded-lg border border-ink-200 shrink-0" style={{ color: "#B42318" }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Onglet Personnalisation (couleurs, logo, message d'accueil, sections)
// ---------------------------------------------------------------------------
const SECTION_OPTIONS = [
  { key: "candidats", label: "Candidats" },
  { key: "regles", label: "Règles" },
  { key: "faq", label: "FAQ" },
  { key: "actualites", label: "Actualités" },
  { key: "partenaires", label: "Partenaires" },
  { key: "galerie", label: "Galerie" },
];

function PersonalizationTab({ base, email }) {
  const [data, setData] = useState(null);
  const [primaryColor, setPrimaryColor] = useState("#FF6A00");
  const [secondaryColor, setSecondaryColor] = useState("#2B6BFF");
  const [accentColor, setAccentColor] = useState("#1B7A3D");
  const [logoUrl, setLogoUrl] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [visibleSections, setVisibleSections] = useState(SECTION_OPTIONS.map((s) => s.key));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    apiGet(`${base}/personalization?email=${encodeURIComponent(email)}`).then((d) => {
      setData(d);
      if (d.brand) {
        setPrimaryColor(d.brand.primary_color || "#FF6A00");
        setSecondaryColor(d.brand.secondary_color || "#2B6BFF");
        setAccentColor(d.brand.accent_color || "#1B7A3D");
        setLogoUrl(d.brand.logo_url || "");
      }
      setWelcomeMessage(d.welcome_message || "");
      setVisibleSections(Array.isArray(d.visible_sections) ? d.visible_sections : SECTION_OPTIONS.map((s) => s.key));
    });
  }, [base, email]);

  async function handleLogoFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/uploads/image", { method: "POST", credentials: "include", body: formData });
      const data = await res.json();
      if (res.ok) setLogoUrl(data.url);
    } finally {
      setUploading(false);
    }
  }

  function toggleSection(key) {
    setVisibleSections((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  async function handleSave() {
    setSaving(true);
    setSuccess(false);
    try {
      await apiPost(`${base}/personalization/brand`, { email, primaryColor, secondaryColor, accentColor, logoUrl });
      await apiPost(`${base}/personalization`, { email, welcomeMessage, visibleSections });
      setSuccess(true);
    } finally {
      setSaving(false);
    }
  }

  if (!data) return <p className="text-sm text-ink-700">Chargement…</p>;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <p className="font-semibold text-ink-900 mb-3">Couleurs & logo</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {[
            { label: "Couleur principale", value: primaryColor, set: setPrimaryColor },
            { label: "Couleur secondaire", value: secondaryColor, set: setSecondaryColor },
            { label: "Couleur d'accent", value: accentColor, set: setAccentColor },
          ].map((c) => (
            <label key={c.label} className="text-xs font-semibold text-ink-700">
              {c.label}
              <div className="mt-1 flex items-center gap-2">
                <input type="color" value={c.value} onChange={(e) => c.set(e.target.value)} className="w-10 h-10 rounded-lg border border-ink-200 cursor-pointer" />
                <input value={c.value} onChange={(e) => c.set(e.target.value)} className="flex-1 rounded-xl border border-ink-200 px-2 py-2 text-xs font-mono" />
              </div>
            </label>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {logoUrl && <img src={logoUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-ink-200" />}
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-ink-300 text-sm text-ink-700 cursor-pointer hover:border-primary hover:text-primary transition-colors">
            <Upload size={14} /> {uploading ? "Envoi…" : "Logo de la campagne"}
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoFile} disabled={uploading} />
          </label>
        </div>
      </Card>

      <Card>
        <p className="font-semibold text-ink-900 mb-3">Message d'accueil</p>
        <textarea
          value={welcomeMessage}
          onChange={(e) => setWelcomeMessage(e.target.value)}
          rows={3}
          placeholder="Message mis en avant sur la section Accueil de la page publique (optionnel)"
          className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm resize-none"
        />
      </Card>

      <Card>
        <p className="font-semibold text-ink-900 mb-3">Sections visibles sur la page publique</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SECTION_OPTIONS.map((s) => (
            <label key={s.key} className="flex items-center gap-2 text-sm text-ink-900 rounded-xl border border-ink-200 px-3 py-2 cursor-pointer">
              <input type="checkbox" checked={visibleSections.includes(s.key)} onChange={() => toggleSection(s.key)} />
              {s.label}
            </label>
          ))}
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving} className="btn btn-primary !text-sm disabled:opacity-50">
          {saving ? "Enregistrement…" : "Enregistrer la personnalisation"}
        </button>
        {success && <span className="text-xs" style={{ color: "#1B7A3D" }}>Enregistré.</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------
export default function DashboardV2CampaignContent() {
  const { campaignId } = useParams();
  const email = getOrganizerSessionEmail();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = TABS.find((t) => t.key === searchParams.get("tab"))?.key || "annonces";
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = () => setRefreshKey((k) => k + 1);

  const base = `/api/dashboard/campaigns/${campaignId}/content`;

  if (!email) {
    return <div className="text-center py-20 text-ink-700">Session introuvable. Reconnectez-vous.</div>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link to={`/dashboard-v2/campagnes/${campaignId}`} className="text-xs font-semibold text-secondary">← Retour à la campagne</Link>
        <h1 className="text-xl font-bold text-ink-900 mt-1">Contenu de la campagne</h1>
      </div>

      <div className="flex items-center gap-1 border-b border-ink-200 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setSearchParams({ tab: t.key })}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === t.key ? "border-primary text-primary" : "border-transparent text-ink-700 hover:text-ink-900"
              }`}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === "annonces" && <NoticesTab base={base} email={email} refreshKey={refreshKey} bump={bump} />}
      {activeTab === "faq" && <FaqTab base={base} email={email} refreshKey={refreshKey} bump={bump} />}
      {activeTab === "galerie" && <GalleryTab base={base} email={email} refreshKey={refreshKey} bump={bump} />}
      {activeTab === "actualites" && <NewsTab base={base} email={email} refreshKey={refreshKey} bump={bump} />}
      {activeTab === "partenaires" && <PartnersTab base={base} email={email} refreshKey={refreshKey} bump={bump} />}
      {activeTab === "personnalisation" && <PersonalizationTab base={base} email={email} />}
    </div>
  );
}
