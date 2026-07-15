import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Vote,
  Ticket,
  Gift,
  Rocket,
  Users2,
  Trophy,
  Dices,
  Plus,
  Trash2,
  Upload,
  Loader2,
  Check,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Video,
  X,
  Link2,
  Hash,
  Share2,
  MessageCircle,
  Globe,
} from "lucide-react";
import { getOrganizerSessionEmail } from "../../lib/session.js";
import { apiPost } from "./dashboardApi.js";

// ---------------------------------------------------------------------------
// Sélecteur de type de campagne
// ---------------------------------------------------------------------------

const CAMPAIGN_TYPES = [
  { key: "scrutin", label: "Scrutin & Vote", icon: Vote, ready: true, desc: "Concours de votes gratuits ou payants", image: "/election-vote.jpg" },
  { key: "evenement", label: "Événement & Billetterie", icon: Ticket, ready: false, badge: "V1", image: "/concert-crowd.jpg" },
  { key: "don", label: "Don & Cagnotte", icon: Gift, ready: false, badge: "V2", image: "/donation-coins.jpg" },
  { key: "crowdfunding", label: "Financement participatif", icon: Rocket, ready: false, badge: "V2", image: "/community-hands.jpg" },
  { key: "sponsoring", label: "Recherche de sponsors", icon: Users2, ready: false, badge: "V3", image: "/africa-network.jpg" },
  { key: "concours", label: "Jeu-concours", icon: Trophy, ready: false, badge: "V3", image: "/contest-trophy.jpg" },
  { key: "tombola", label: "Tombola", icon: Dices, ready: false, badge: "V3", image: "/award-winner.jpg" },
];

export function DashboardV2CampaignTypeSelector() {
  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="flex flex-col gap-5">
      <motion.div variants={{ hidden: { opacity: 0, y: -10 }, show: { opacity: 1, y: 0 } }}>
        <h1 className="text-xl font-bold text-ink-900 mb-1">Créer une campagne</h1>
        <p className="text-sm text-ink-700">Choisissez le type de campagne à créer.</p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CAMPAIGN_TYPES.map((t) => {
          const Icon = t.icon;
          const card = (
            <motion.div
              variants={{ hidden: { opacity: 0, y: 24, scale: 0.96 }, show: { opacity: 1, y: 0, scale: 1 } }}
              whileHover={t.ready ? { y: -4 } : undefined}
              className="relative h-40 rounded-2xl overflow-hidden border border-ink-200 flex flex-col justify-between p-4 text-white"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(11,19,36,${t.ready ? 0.35 : 0.65}) 0%, rgba(11,19,36,0.9) 100%), url(${t.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: t.ready ? "none" : "grayscale(0.5)",
              }}
            >
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.ready ? "bg-white/20 backdrop-blur" : "bg-white/10"}`}>
                <Icon size={20} />
              </span>
              <div>
                <p className="font-semibold text-sm">{t.label}</p>
                {t.ready ? (
                  <p className="text-[11px] text-white/70 mt-0.5">{t.desc}</p>
                ) : (
                  <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-white/15">
                    Disponible en {t.badge}
                  </span>
                )}
              </div>
            </motion.div>
          );
          return t.ready ? (
            <Link key={t.key} to={`/dashboard-v2/campagnes/nouvelle/${t.key}`}>
              {card}
            </Link>
          ) : (
            <div key={t.key} className="cursor-not-allowed">
              {card}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Champs réutilisables
// ---------------------------------------------------------------------------

const CANDIDATE_CATEGORIES = [
  "Élection de Miss / Beauté", "Élection de Mister", "Concours de talents", "Concours de chant",
  "Concours de danse", "Concours sportif", "Hackathon / Innovation", "Remise de prix",
  "Personnalité de l'année", "Meilleur artiste", "Meilleur influenceur", "Concours photo",
  "Concours de mode", "Miss / Mister Junior", "Miss / Mister Ados", "Concours culinaire",
  "Concours d'éloquence", "Concours de startups", "Concours agricole", "Miss / Mister Université",
  "Reine / Roi des marchés", "Beauté traditionnelle", "Talent caché", "Meilleur DJ",
  "Meilleur humoriste", "Excellence académique", "Concours communautaire", "Élection d'entreprise",
  "Prix de la meilleure entreprise", "Autre",
];

// Icônes génériques (pas de logos de marque dans cette version de
// lucide-react -- Facebook/Instagram/Twitter/Youtube n'y existent plus).
const SOCIAL_FIELDS = [
  { key: "facebook", label: "Facebook", icon: Link2, placeholder: "https://facebook.com/..." },
  { key: "instagram", label: "Instagram", icon: Globe, placeholder: "https://instagram.com/..." },
  { key: "twitter", label: "Twitter / X", icon: Hash, placeholder: "https://x.com/..." },
  { key: "tiktok", label: "TikTok", icon: Video, placeholder: "https://tiktok.com/@..." },
  { key: "youtube", label: "YouTube", icon: Share2, placeholder: "https://youtube.com/..." },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, placeholder: "+237 6XX XXX XXX" },
];

function ImageUploadField({ label, value, onChange }) {
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
    <div>
      <label className="text-xs font-semibold text-ink-700 block mb-1">{label}</label>
      <div className="flex items-center gap-3">
        {value && <img src={value} alt="" className="w-14 h-14 rounded-xl object-cover border border-ink-200" />}
        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-ink-300 text-sm text-ink-700 cursor-pointer hover:border-primary hover:text-primary transition-colors">
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          {uploading ? "Envoi…" : value ? "Changer l'image" : "Choisir une image"}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
      </div>
      {error && <p className="text-xs mt-1" style={{ color: "#B42318" }}>{error}</p>}
    </div>
  );
}

// Upload multiple -- photos/vidéos additionnelles de la campagne (distinctes
// de l'image de couverture), affichées ensuite dans la galerie publique du
// scrutin (voir moledi-backend/src/store/pollContentStore.js listPollGallery).
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
    <div>
      <label className="text-xs font-semibold text-ink-700 block mb-1">{label}</label>
      <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-ink-300 text-sm text-ink-700 cursor-pointer hover:border-primary hover:text-primary transition-colors">
        <Icon size={14} />
        {uploading ? "Envoi…" : "Ajouter"}
        <input type="file" accept={accept} multiple className="hidden" onChange={handleFiles} disabled={uploading} />
      </label>
      {error && <p className="text-xs mt-1" style={{ color: "#B42318" }}>{error}</p>}
      {list.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {list.map((url, idx) => (
            <div key={url + idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-ink-200 bg-ink-100">
              {kind === "video" ? <video src={url} className="w-full h-full object-cover" muted /> : <img src={url} alt="" className="w-full h-full object-cover" />}
              <button type="button" onClick={() => removeAt(idx)} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-ink-900/70 text-white flex items-center justify-center">
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
// Assistant multi-étapes
// ---------------------------------------------------------------------------

const STEPS = [
  { key: "infos", label: "Informations" },
  { key: "vote", label: "Type de vote" },
  { key: "candidats", label: "Candidats" },
  { key: "regles", label: "Règles & dates" },
  { key: "remboursement", label: "Remboursement" },
  { key: "recap", label: "Récapitulatif" },
];

function StepProgress({ current, onJump }) {
  return (
    <div className="flex items-center overflow-x-auto pb-2 -mx-1 px-1">
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => onJump(i)}
            className="flex flex-col items-center gap-1.5 group"
          >
            <motion.span
              animate={{
                backgroundColor: i <= current ? "#FF6A00" : "#FFFFFF",
                color: i <= current ? "#FFFFFF" : "#3D3F54",
                borderColor: i <= current ? "#FF6A00" : "#D9DBE3",
              }}
              transition={{ duration: 0.25 }}
              className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0"
            >
              {i < current ? <Check size={14} /> : i + 1}
            </motion.span>
            <span className={`text-[10px] font-semibold whitespace-nowrap ${i === current ? "text-ink-900" : "text-ink-400"}`}>
              {s.label}
            </span>
          </button>
          {i < STEPS.length - 1 && (
            <div className="w-8 sm:w-14 h-0.5 mx-1 mb-4 rounded-full overflow-hidden bg-ink-200 shrink-0">
              <motion.div
                animate={{ width: i < current ? "100%" : "0%" }}
                transition={{ duration: 0.3 }}
                className="h-full bg-primary"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const VOTE_TYPE_OPTIONS = [
  { value: "FREE_VISITOR_ID", label: "Public — un vote par appareil", detail: "Aucune vérification, le plus simple pour démarrer rapidement." },
  { value: "FREE_EMAIL", label: "Vérifié par email", detail: "Le votant confirme son vote via un lien reçu par email." },
  { value: "FREE_PHONE", label: "Vérifié par numéro de téléphone", detail: "Le votant confirme via un code envoyé par SMS." },
];

// Pas d'AnimatePresence mode="wait" ici : ce mode retarde le montage de
// l'étape suivante jusqu'à la fin de l'animation de sortie de l'étape
// précédente -- en pratique peu fiable avec un changement de `key` piloté
// par un simple state (l'étape sortante peut rester "coincée" en attente de
// fin d'animation et bloquer indéfiniment la suivante). On anime seulement
// l'entrée de la nouvelle étape ; React démonte l'ancienne immédiatement via
// le changement de `key`, donc la navigation reste toujours instantanée et
// fiable, avec juste un glissement/fondu à l'arrivée.
function stepEnterVariant(dir) {
  return {
    hidden: { opacity: 0, x: dir > 0 ? 40 : -40 },
    show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  };
}

export function DashboardV2CreatePoll() {
  const email = getOrganizerSessionEmail();
  const navigate = useNavigate();

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
  const [additionalPhotosUrls, setAdditionalPhotosUrls] = useState([]);
  const [videosUrls, setVideosUrls] = useState([]);
  const [category, setCategory] = useState("");
  const [displayOrganizerName, setDisplayOrganizerName] = useState("");
  const [socialLinks, setSocialLinks] = useState({});

  const [voteKind, setVoteKind] = useState(null); // "FREE" | "PAID"
  const [voteType, setVoteType] = useState("FREE_VISITOR_ID");
  const [pricePerVote, setPricePerVote] = useState("");
  const [maxVotesPerVisitor, setMaxVotesPerVisitor] = useState("");

  const [candidates, setCandidates] = useState([{ display_name: "", photo_url: "" }]);

  const [openAt, setOpenAt] = useState("");
  const [closeAt, setCloseAt] = useState("");

  const [refundable, setRefundable] = useState(false);
  const [delayHours, setDelayHours] = useState("48");
  const [percentage, setPercentage] = useState("100");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isPaid = voteKind === "PAID";
  const effectiveVoteType = isPaid ? "PAID" : voteType;

  function goTo(index) {
    setDirection(index > stepIndex ? 1 : -1);
    setStepIndex(Math.max(0, Math.min(STEPS.length - 1, index)));
  }
  function next() {
    setError("");
    goTo(stepIndex + 1);
  }
  function prev() {
    setError("");
    goTo(stepIndex - 1);
  }

  function updateCandidate(i, field, value) {
    setCandidates((prev) => prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));
  }
  function addCandidate() {
    setCandidates((prev) => [...prev, { display_name: "", photo_url: "" }]);
  }
  function removeCandidate(i) {
    setCandidates((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit() {
    setError("");
    if (!title.trim()) { setError("Le titre est requis."); return goTo(0); }
    if (!openAt || !closeAt) { setError("Les dates d'ouverture et de clôture sont requises."); return goTo(3); }
    if (isPaid && (!pricePerVote || Number(pricePerVote) <= 0)) { setError("Le prix par vote est requis pour un scrutin payant."); return goTo(1); }

    setSubmitting(true);
    try {
      const payload = {
        email,
        title: title.trim(),
        description,
        coverPhotoUrl,
        additionalPhotosUrls,
        videosUrls,
        category,
        displayOrganizerName,
        socialLinks,
        voteType: effectiveVoteType,
        pricePerVote: isPaid ? Number(pricePerVote) : null,
        maxVotesPerVisitor: maxVotesPerVisitor ? Number(maxVotesPerVisitor) : null,
        openAt: new Date(openAt).toISOString(),
        closeAt: new Date(closeAt).toISOString(),
        candidates: candidates.filter((c) => c.display_name.trim()),
        refundPolicy: isPaid ? { refundable, delayHours: Number(delayHours), percentage: Number(percentage) } : null,
      };
      const data = await apiPost("/api/dashboard/campaigns", payload);
      navigate(`/dashboard-v2/campagnes/${data.campaign.poll_id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const currentKey = STEPS[stepIndex].key;

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div>
        <Link to="/dashboard-v2/campagnes/nouvelle" className="text-xs font-semibold text-secondary">← Type de campagne</Link>
        <h1 className="text-xl font-bold text-ink-900 mt-1">Créer un scrutin</h1>
      </div>

      <StepProgress current={stepIndex} onJump={goTo} />

      {error && (
        <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: "#FDECEC", color: "#B42318" }}>{error}</div>
      )}

      <div className="relative overflow-hidden">
          <motion.div
            key={currentKey}
            variants={stepEnterVariant(direction)}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-5"
          >
            {currentKey === "infos" && (
              <section className="rounded-2xl bg-white border border-ink-200 p-5 flex flex-col gap-4">
                <p className="font-semibold text-ink-900">Informations</p>
                <label className="text-xs font-semibold text-ink-700">
                  Titre <span className="text-primary">*</span>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100}
                    className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm" />
                </label>
                <label className="text-xs font-semibold text-ink-700">
                  Description
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                    className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm resize-none" />
                </label>
                <ImageUploadField label="Image de couverture (16:9)" value={coverPhotoUrl} onChange={setCoverPhotoUrl} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MultiUploadField label="Photos additionnelles (galerie)" icon={ImageIcon} accept="image/*" kind="image" values={additionalPhotosUrls} onChange={setAdditionalPhotosUrls} />
                  <MultiUploadField label="Vidéos additionnelles (galerie)" icon={Video} accept="video/*" kind="video" values={videosUrls} onChange={setVideosUrls} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="text-xs font-semibold text-ink-700">
                    Catégorie
                    <select value={category} onChange={(e) => setCategory(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm bg-white">
                      <option value="">Sélectionner…</option>
                      {CANDIDATE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                  <label className="text-xs font-semibold text-ink-700">
                    Nom affiché de l'organisateur
                    <input value={displayOrganizerName} onChange={(e) => setDisplayOrganizerName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm" />
                  </label>
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink-700 mb-2">Réseaux sociaux (optionnel)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SOCIAL_FIELDS.map((s) => {
                      const SIcon = s.icon;
                      return (
                        <div key={s.key} className="flex items-center gap-2 rounded-xl border border-ink-200 px-3 py-2">
                          <SIcon size={15} className="text-ink-400 shrink-0" />
                          <input
                            placeholder={s.placeholder}
                            value={socialLinks[s.key] || ""}
                            onChange={(e) => setSocialLinks((p) => ({ ...p, [s.key]: e.target.value }))}
                            className="w-full text-sm focus:outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {currentKey === "vote" && (
              <section className="rounded-2xl bg-white border border-ink-200 p-5 flex flex-col gap-4">
                <p className="font-semibold text-ink-900">Type de vote</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVoteKind("FREE")}
                    className={`text-left p-4 rounded-xl border-2 transition-colors ${voteKind === "FREE" ? "border-primary bg-primary-50" : "border-ink-200"}`}
                  >
                    <p className="font-semibold text-sm text-ink-900">Gratuit</p>
                    <p className="text-xs text-ink-700 mt-0.5">Les votants ne paient rien pour voter.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoteKind("PAID")}
                    className={`text-left p-4 rounded-xl border-2 transition-colors ${voteKind === "PAID" ? "border-primary bg-primary-50" : "border-ink-200"}`}
                  >
                    <p className="font-semibold text-sm text-ink-900">Payant</p>
                    <p className="text-xs text-ink-700 mt-0.5">Chaque vote est payé via Mobile Money.</p>
                  </button>
                </div>

                <AnimatePresence>
                  {voteKind === "FREE" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col gap-2 overflow-hidden"
                    >
                      {VOTE_TYPE_OPTIONS.map((o) => (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() => setVoteType(o.value)}
                          className={`text-left px-4 py-3 rounded-xl border text-sm transition-colors ${
                            voteType === o.value ? "border-primary bg-primary-50" : "border-ink-200"
                          }`}
                        >
                          <p className={`font-semibold ${voteType === o.value ? "text-primary" : "text-ink-900"}`}>{o.label}</p>
                          <p className="text-xs text-ink-700 mt-0.5">{o.detail}</p>
                        </button>
                      ))}
                    </motion.div>
                  )}

                  {voteKind === "PAID" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <label className="text-xs font-semibold text-ink-700">
                        Prix par vote (FCFA) <span className="text-primary">*</span>
                        <input type="number" min="1" value={pricePerVote} onChange={(e) => setPricePerVote(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm" />
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>

                <label className="text-xs font-semibold text-ink-700">
                  Nombre maximum de votes par visiteur (optionnel)
                  <input type="number" min="1" value={maxVotesPerVisitor} onChange={(e) => setMaxVotesPerVisitor(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm" />
                </label>
              </section>
            )}

            {currentKey === "candidats" && (
              <section className="rounded-2xl bg-white border border-ink-200 p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-ink-900">Candidats</p>
                  <button type="button" onClick={addCandidate} className="text-xs font-semibold text-secondary flex items-center gap-1">
                    <Plus size={14} /> Ajouter
                  </button>
                </div>
                {candidates.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      placeholder="Nom du candidat"
                      value={c.display_name}
                      onChange={(e) => updateCandidate(i, "display_name", e.target.value)}
                      className="flex-1 rounded-xl border border-ink-200 px-3 py-2.5 text-sm"
                    />
                    {candidates.length > 1 && (
                      <button type="button" onClick={() => removeCandidate(i)} className="p-2 text-red-600" aria-label="Retirer">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <p className="text-[11px] text-ink-400">Vous pourrez ajouter des photos, vidéos et importer une liste complète (CSV) après la création, depuis Gérer les candidats.</p>
              </section>
            )}

            {currentKey === "regles" && (
              <section className="rounded-2xl bg-white border border-ink-200 p-5 flex flex-col gap-4">
                <p className="font-semibold text-ink-900">Règles & Dates</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="text-xs font-semibold text-ink-700">
                    Ouverture <span className="text-primary">*</span>
                    <input type="datetime-local" value={openAt} onChange={(e) => setOpenAt(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm" />
                  </label>
                  <label className="text-xs font-semibold text-ink-700">
                    Clôture <span className="text-primary">*</span>
                    <input type="datetime-local" value={closeAt} onChange={(e) => setCloseAt(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm" />
                  </label>
                </div>
              </section>
            )}

            {currentKey === "remboursement" && (
              <section className="rounded-2xl bg-white border border-ink-200 p-5 flex flex-col gap-4">
                <p className="font-semibold text-ink-900">Conditions de remboursement</p>
                {!isPaid ? (
                  <p className="text-sm text-ink-700">Non applicable : ce scrutin est gratuit, aucun vote n'est payé.</p>
                ) : (
                  <>
                    <p className="text-xs text-ink-700">Configuration obligatoire pour toute campagne payante.</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setRefundable(true)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border ${refundable ? "bg-primary text-white border-primary" : "border-ink-200 text-ink-700"}`}>
                        Remboursable
                      </button>
                      <button type="button" onClick={() => setRefundable(false)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border ${!refundable ? "bg-primary text-white border-primary" : "border-ink-200 text-ink-700"}`}>
                        Non remboursable
                      </button>
                    </div>
                    {refundable && (
                      <div className="grid grid-cols-2 gap-4">
                        <label className="text-xs font-semibold text-ink-700">
                          Délai avant l'événement (heures)
                          <input type="number" min="0" value={delayHours} onChange={(e) => setDelayHours(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm" />
                        </label>
                        <label className="text-xs font-semibold text-ink-700">
                          Pourcentage remboursable (%)
                          <input type="number" min="0" max="100" value={percentage} onChange={(e) => setPercentage(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm" />
                        </label>
                      </div>
                    )}
                  </>
                )}
              </section>
            )}

            {currentKey === "recap" && (
              <section className="rounded-2xl bg-white border border-ink-200 p-5 flex flex-col gap-4">
                <p className="font-semibold text-ink-900">Récapitulatif</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-ink-50 p-3"><p className="text-[11px] text-ink-700">Titre</p><p className="font-semibold text-ink-900">{title || "—"}</p></div>
                  <div className="rounded-xl bg-ink-50 p-3"><p className="text-[11px] text-ink-700">Catégorie</p><p className="font-semibold text-ink-900">{category || "—"}</p></div>
                  <div className="rounded-xl bg-ink-50 p-3"><p className="text-[11px] text-ink-700">Type de vote</p><p className="font-semibold text-ink-900">{isPaid ? `Payant — ${pricePerVote || 0} FCFA/vote` : (VOTE_TYPE_OPTIONS.find((o) => o.value === voteType)?.label || "Gratuit")}</p></div>
                  <div className="rounded-xl bg-ink-50 p-3"><p className="text-[11px] text-ink-700">Candidats</p><p className="font-semibold text-ink-900">{candidates.filter((c) => c.display_name.trim()).length}</p></div>
                  <div className="rounded-xl bg-ink-50 p-3"><p className="text-[11px] text-ink-700">Ouverture</p><p className="font-semibold text-ink-900">{openAt || "—"}</p></div>
                  <div className="rounded-xl bg-ink-50 p-3"><p className="text-[11px] text-ink-700">Clôture</p><p className="font-semibold text-ink-900">{closeAt || "—"}</p></div>
                </div>
                <p className="text-xs text-ink-400">La campagne sera visible publiquement après validation par un administrateur.</p>
                <button type="button" onClick={handleSubmit} disabled={submitting} className="btn btn-primary !text-sm self-start disabled:opacity-50">
                  {submitting ? "Envoi…" : "Soumettre pour validation"}
                </button>
              </section>
            )}
          </motion.div>
      </div>

      {currentKey !== "recap" && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={prev}
            disabled={stepIndex === 0}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl border border-ink-200 text-ink-700 disabled:opacity-40"
          >
            <ChevronLeft size={15} /> Précédent
          </button>
          <button type="button" onClick={next} className="btn btn-primary !text-sm">
            Suivant <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
