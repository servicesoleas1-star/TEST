// pages/EventsPage.jsx — Route publique : /evenements
//
// Catalogue public de toutes les campagnes (scrutins, billetterie, dons,
// crowdfunding, loteries, concours, sponsoring) : recherche live,
// filtres (type, statut, pays), tri, bande d'événements épinglés,
// grille avec chargement progressif (scroll infini).
//
// Données lues depuis /api/events (table event_listings dédiée à cette
// vitrine publique — voir db/migrations/17_event_listings.sql pour le
// contexte : le schéma réel modélise chaque type de campagne dans sa
// propre table sans catalogue unifié).
//
// Pas de page de détail générique : chaque type de campagne aura sa PROPRE
// page publique (le scrutin a déjà la sienne, /vote/:slug, en construction
// — les autres types viendront plus tard). Une carte ne navigue donc que si
// son type a une vraie destination (voir EVENT_TYPES[].getDestination dans
// config/eventListingTypes.js) ; sinon son CTA reste visible mais inerte
// ("Bientôt disponible") plutôt que de pointer vers un lien cassé.

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import Footer from '../components/Footer';
import { EVENT_TYPES, EVENT_STATUSES, SORT_OPTIONS, getEventTypeMeta, getStatusMeta } from '../components/config/eventListingTypes';

const HERO_IMAGE = '/concert-crowd.jpg';
const COUNTRIES = ['Cameroun', "Côte d'Ivoire", 'Sénégal', 'Gabon', 'Mali', 'Bénin'];
const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 350;
const DESCRIPTION_MAX_CHARS = 100;

function truncate(text, max) {
  if (!text || text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

function formatShortDate(iso) {
  if (!iso) return null;
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
}

// Compte à rebours adaptatif pour les cartes "à venir" -- jours si c'est
// encore loin, puis heures/minutes/secondes à mesure que l'échéance
// approche, pour que le chiffre affiché reste toujours parlant.
function formatCountdown(iso) {
  if (!iso) return null;
  const diffMs = new Date(iso).getTime() - Date.now();
  if (diffMs <= 0) return null;
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}j ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}min`;
  if (minutes > 0) return `${minutes}min ${seconds}s`;
  return `${seconds}s`;
}

function useCountdown(iso, active) {
  const [label, setLabel] = useState(() => (active ? formatCountdown(iso) : null));
  useEffect(() => {
    if (!active || !iso) return;
    setLabel(formatCountdown(iso));
    const id = setInterval(() => setLabel(formatCountdown(iso)), 1000);
    return () => clearInterval(id);
  }, [iso, active]);
  return label;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

// --- Récupération des données ------------------------------------------------

function buildParams({ search, type, status, country, sort, offset, limit }) {
  const params = new URLSearchParams({ offset: String(offset), limit: String(limit), sort });
  if (search) params.set('q', search);
  if (type) params.set('type', type);
  if (status) params.set('status', status);
  if (country) params.set('country', country);
  return params;
}

function useEventListings({ search, type, status, country, sort }) {
  const [items, setItems] = useState([]);
  const [pinned, setPinned] = useState([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const offsetRef = useRef(0);
  const requestIdRef = useRef(0);

  // Recherche/filtres/tri changent -> on repart de zéro (offset 0).
  useEffect(() => {
    const thisRequestId = ++requestIdRef.current;
    offsetRef.current = 0;
    setLoading(true);

    const params = buildParams({ search, type, status, country, sort, offset: 0, limit: PAGE_SIZE });

    fetch(`/api/events?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (requestIdRef.current !== thisRequestId) return; // réponse obsolète
        setItems(data.items || []);
        setPinned(data.pinned || []);
        setTotal(data.total || 0);
        setHasMore(Boolean(data.hasMore));
        offsetRef.current = (data.items || []).length;
      })
      .catch(() => {
        if (requestIdRef.current !== thisRequestId) return;
        setItems([]);
        setHasMore(false);
      })
      .finally(() => {
        if (requestIdRef.current === thisRequestId) setLoading(false);
      });
  }, [search, type, status, country, sort]);

  // `loadMore` a besoin de lire l'état le plus récent (loading/hasMore/offset)
  // sans re-déclencher la mise en place de l'IntersectionObserver à chaque
  // rendu (voir EventsGrid) -- toute la logique vit donc dans un ref stable,
  // exposé via une fonction elle-même stable (useCallback, tableau de
  // dépendances vide).
  const stateRef = useRef({ loading, hasMore, search, type, status, country, sort });
  stateRef.current = { loading, hasMore, search, type, status, country, sort };

  const stableLoadMore = useCallback(() => {
    const s = stateRef.current;
    if (s.loading || !s.hasMore) return;
    const thisRequestId = requestIdRef.current;
    setLoading(true);
    const params = buildParams({ ...s, offset: offsetRef.current, limit: PAGE_SIZE });

    fetch(`/api/events?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (requestIdRef.current !== thisRequestId) return;
        setItems((prev) => [...prev, ...(data.items || [])]);
        setHasMore(Boolean(data.hasMore));
        offsetRef.current += (data.items || []).length;
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoading(false));
  }, []);

  return { items, pinned, total, hasMore, loading, loadMore: stableLoadMore };
}

// --- Barre de recherche + hero ---------------------------------------------

function SearchHero({ value, onChange }) {
  return (
    <section className="relative pt-28 sm:pt-32 pb-10 sm:pb-14 overflow-hidden bg-ink-900">
      <img src={HERO_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900/60 via-ink-900/70 to-ink-900" />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-primary font-semibold tracking-[0.25em] uppercase text-[11px] sm:text-xs mb-4">
          Le catalogue Moledi Event
        </p>
        <h1 className="text-white font-heading leading-[1.05] mb-6" style={{ fontSize: 'clamp(1.9rem, 6vw, 3.6rem)' }}>
          Tous les événements
        </h1>
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <input
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Rechercher un scrutin, un concert, une cagnotte..."
            aria-label="Rechercher un événement"
            className="w-full rounded-full bg-white pl-12 pr-5 py-3.5 sm:py-4 text-sm sm:text-base text-ink-900 placeholder:text-ink-400 outline-none focus:ring-2 focus:ring-primary shadow-xl"
          />
        </div>
      </div>
    </section>
  );
}

// --- Panneau de filtres -----------------------------------------------------

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
        active ? 'border-primary bg-primary/10 text-primary' : 'border-ink-200 text-ink-700 hover:border-ink-300 bg-white'
      }`}
    >
      {children}
    </button>
  );
}

function FilterGroupHeader({ label, active, onReset }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-ink-700">{label}</p>
      {active && (
        <button type="button" onClick={onReset} className="text-[11px] font-semibold text-primary hover:underline">
          Réinitialiser
        </button>
      )}
    </div>
  );
}

function FilterContent({ filters, onChange }) {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      <div>
        <FilterGroupHeader label="Type de campagne" active={Boolean(filters.type)} onReset={() => onChange({ type: '' })} />
        <div className="flex flex-wrap gap-2">
          <Chip active={!filters.type} onClick={() => onChange({ type: '' })}>Tous</Chip>
          {EVENT_TYPES.map((t) => (
            <Chip key={t.value} active={filters.type === t.value} onClick={() => onChange({ type: filters.type === t.value ? '' : t.value })}>
              {t.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <FilterGroupHeader label="Statut" active={Boolean(filters.status)} onReset={() => onChange({ status: '' })} />
        <div className="flex flex-wrap gap-2">
          <Chip active={!filters.status} onClick={() => onChange({ status: '' })}>Tous</Chip>
          {EVENT_STATUSES.map((s) => (
            <Chip key={s.value} active={filters.status === s.value} onClick={() => onChange({ status: filters.status === s.value ? '' : s.value })}>
              {s.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <FilterGroupHeader label="Pays" active={Boolean(filters.country)} onReset={() => onChange({ country: '' })} />
        <div className="flex flex-wrap gap-2">
          <Chip active={!filters.country} onClick={() => onChange({ country: '' })}>Tous</Chip>
          {COUNTRIES.map((c) => (
            <Chip key={c} active={filters.country === c} onClick={() => onChange({ country: filters.country === c ? '' : c })}>
              {c}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterPanel({ filters, onChange, resultCount }) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const activeCount = [filters.type, filters.status, filters.country].filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-1 mb-8 relative">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button type="button" onClick={() => setOpen((o) => !o)} className="btn btn-ghost !px-5 !py-2.5">
          <SlidersHorizontal size={16} aria-hidden="true" />
          Filtres
          {activeCount > 0 && (
            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold">
              {activeCount}
            </span>
          )}
          {!isMobile && <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />}
        </button>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => onChange({ type: '', status: '', country: '' })}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-700 hover:text-primary transition-colors"
          >
            <X size={13} aria-hidden="true" />
            Réinitialiser les filtres
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-700 hidden sm:inline">Trier :</span>
          <select
            value={filters.sort}
            onChange={(e) => onChange({ sort: e.target.value })}
            className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-900 outline-none focus:ring-2 focus:ring-primary"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <p className="text-xs text-ink-700 ml-auto">{resultCount} résultat{resultCount > 1 ? 's' : ''}</p>
      </div>

      {/* Desktop/tablette : panneau qui se déplie sur place. */}
      {!isMobile && (
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-4 rounded-2xl border border-ink-200 bg-ink-100/40 p-5 sm:p-6">
                <FilterContent filters={filters} onChange={onChange} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Mobile : pop-up plein écran plutôt qu'une section qui pousse le
          contenu -- prend moins de place, se ferme d'un tap. */}
      {isMobile && (
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
                className="fixed inset-0 z-[80] bg-ink-900/50 backdrop-blur-sm"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-x-0 bottom-0 z-[90] max-h-[80vh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-5">
                  <p className="font-heading text-lg text-ink-900">Filtres</p>
                  <button type="button" onClick={() => setOpen(false)} className="w-9 h-9 rounded-full flex items-center justify-center bg-ink-100 text-ink-700">
                    <X size={16} aria-hidden="true" />
                  </button>
                </div>
                <FilterContent filters={filters} onChange={onChange} />
                <button type="button" onClick={() => setOpen(false)} className="btn btn-primary w-full mt-6">
                  Voir {resultCount} résultat{resultCount > 1 ? 's' : ''}
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

// --- Cartes ------------------------------------------------------------------

function OrganizerAvatar({ name }) {
  const initials = String(name || '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <span className="w-5 h-5 rounded-full bg-ink-900/10 text-ink-900 text-[9px] font-bold flex items-center justify-center shrink-0">
      {initials}
    </span>
  );
}

function EventCard({ item, compact = false, index = 0 }) {
  const [zooming, setZooming] = useState(false);
  const meta = getEventTypeMeta(item.campaign_type);
  const status = getStatusMeta(item.status);
  const destination = meta.getDestination(item);
  const endDate = formatShortDate(item.ends_at);
  const startDate = formatShortDate(item.starts_at);
  const countdown = useCountdown(item.starts_at, status.value === 'UPCOMING');

  function handleActivate(e) {
    e.preventDefault();
    if (!destination || zooming) return;
    setZooming(true);
    // Pas de vraie transition partagée entre pages : toute la navigation
    // publique du site se fait en rechargement complet (liens <a href>,
    // requis pour Google Translate). On simule "la caméra qui zoome
    // progressivement vers le bloc" avant de naviguer : d'abord une légère
    // avancée, puis une accélération nette vers la fin -- un fondu simple ne
    // rendait pas la sensation de zoom demandée.
    setTimeout(() => {
      window.location.href = destination;
    }, 520);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.5, delay: Math.min(index % 6, 5) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className={compact ? 'w-72 sm:w-80 shrink-0' : ''}
    >
      <motion.a
        href={destination || undefined}
        onClick={handleActivate}
        animate={zooming ? { scale: 3.2, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={zooming ? { duration: 0.52, ease: [0.6, 0, 0.9, 0] } : { duration: 0.2 }}
        style={{ transformOrigin: '50% 50%', position: 'relative', zIndex: zooming ? 50 : 1 }}
        className={`group block rounded-xl border border-ink-200 bg-white overflow-hidden shadow-sm transition-shadow duration-200 ${
          destination ? 'hover:shadow-xl cursor-pointer' : 'cursor-default'
        }`}
      >
        {/* Ruban de type collé en haut de la carte -- pleine largeur, pas
            une pastille flottante qui rendait mal sur certaines images. */}
        <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: meta.color }}>
          <span>{meta.label}</span>
          {item.is_live && (
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              Live
            </span>
          )}
        </div>

        <div className="relative w-full aspect-[4/5] overflow-hidden">
          <img src={item.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          {/* Net sur les 3/4 supérieurs ; un seul dégradé continu (plus de
              paliers de flou superposés qui cassaient la transition) qui
              assombrit progressivement le dernier quart pour la lisibilité
              du texte. */}
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-b from-transparent via-black/60 to-black/95 backdrop-blur-[2px] [mask-image:linear-gradient(to_bottom,transparent,black_35%)] pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-b from-transparent via-black/50 to-black/90 pointer-events-none" />

          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="text-white font-heading text-base sm:text-lg leading-tight mb-1.5 line-clamp-2">{item.title}</p>
            {!compact && item.description && (
              <p className="text-white/75 text-[12px] leading-snug mb-2 normal-case line-clamp-2">
                {truncate(item.description, DESCRIPTION_MAX_CHARS)}
              </p>
            )}
            <div className="flex items-center gap-2 mb-1.5">
              <OrganizerAvatar name={item.organizer_name} />
              <span className="text-white/85 text-[11px] truncate">{item.organizer_name}</span>
              {startDate && <span className="text-white/50 text-[11px] shrink-0">· {startDate}</span>}
            </div>
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg text-white shadow-sm"
              style={{ backgroundColor: status.color }}
            >
              {status.value === 'UPCOMING' && <span className="w-1.5 h-1.5 rounded-full bg-white/90 animate-pulse" />}
              {status.value === 'UPCOMING' && countdown ? `Dans ${countdown}` : status.label}
              {status.value === 'ENDED' && endDate ? ` · ${endDate}` : ''}
            </span>
          </div>
        </div>

        {!compact && (
          <div className="p-3">
            <span
              className={`btn w-full !py-2.5 !text-xs sm:!text-sm ${destination ? '' : 'opacity-50 pointer-events-none'}`}
              style={{ backgroundColor: meta.color, color: '#fff' }}
            >
              {destination ? meta.cta : 'Bientôt disponible'}
            </span>
          </div>
        )}
      </motion.a>
    </motion.div>
  );
}

// --- Bande des épinglés / à la une ------------------------------------------

// Auto-défilement continu (piste doublée pour boucler sans à-coup), mais
// entièrement pilotable au doigt : la mise à jour de scrollLeft se fait via
// requestAnimationFrame plutôt qu'une animation CSS, pour que le
// défilement natif au toucher (overflow-x-auto) reste possible en même
// temps. Une pression du doigt met juste l'incrément en pause -- au
// relâchement, il reprend exactement là où il en était (jamais un retour
// au début).
// Vitesse en px/seconde plutôt qu'un increment fixe par frame : un
// increment fixe (ex: 0.6px/frame) dépend du taux de rafraîchissement de
// l'écran -- deux fois plus vite sur un mobile 120Hz que sur un écran 60Hz,
// et perceptiblement saccadé/lent si le navigateur regroupe des frames sous
// charge (fréquent sur mobile bas de gamme). Le delta-temps rend le
// défilement visuellement identique quel que soit l'appareil.
const AUTO_SCROLL_PX_PER_SECOND = 36;

function usePinnedAutoScroll(containerRef, enabled) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return;

    let rafId;
    let paused = false;
    let lastTimestamp = null;

    function tick(timestamp) {
      if (lastTimestamp === null) lastTimestamp = timestamp;
      const deltaSeconds = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (!paused && el.scrollWidth > el.clientWidth) {
        el.scrollLeft += AUTO_SCROLL_PX_PER_SECOND * deltaSeconds;
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft -= el.scrollWidth / 2;
        }
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    // La reprise après un contact tactile doit attendre la fin de l'inertie
    // native (momentum scrolling) quand elle a lieu, sinon le défilement
    // auto "arrache" le défilement au doigt en pleine glissade. Mais un
    // contact qui NE fait PAS défiler cette piste horizontalement (ex : un
    // balayage vertical de la page qui démarre juste au-dessus/sur la
    // piste) déclenche quand même `pointerdown` ici sans jamais produire de
    // `scrollend` sur cet élément puisqu'il n'a pas scrollé -- avec l'ancien
    // code (repli sur `scrollend` uniquement quand supporté), l'auto-
    // défilement restait figé dès le tout premier contact tactile de
    // l'utilisateur sur mobile, quelle que soit sa nature. D'où ce filet de
    // sécurité : on reprend toujours au bout d'un court délai après
    // pointerup/pointerleave, indépendamment de `scrollend` (qui reste un
    // signal de reprise plus rapide quand une vraie inertie est en cours).
    let resumeTimer = null;
    const clearResumeTimer = () => {
      if (resumeTimer) {
        clearTimeout(resumeTimer);
        resumeTimer = null;
      }
    };
    const pause = () => {
      paused = true;
      clearResumeTimer();
    };
    const resume = () => {
      clearResumeTimer();
      lastTimestamp = null;
      paused = false;
    };
    const scheduleResume = () => {
      clearResumeTimer();
      resumeTimer = setTimeout(resume, 400);
    };
    el.addEventListener('pointerdown', pause);
    el.addEventListener('pointerup', scheduleResume);
    el.addEventListener('pointercancel', resume);
    el.addEventListener('pointerleave', scheduleResume);
    el.addEventListener('scrollend', resume);

    return () => {
      cancelAnimationFrame(rafId);
      clearResumeTimer();
      el.removeEventListener('pointerdown', pause);
      el.removeEventListener('pointerup', scheduleResume);
      el.removeEventListener('pointercancel', resume);
      el.removeEventListener('pointerleave', scheduleResume);
      el.removeEventListener('scrollend', resume);
    };
  }, [containerRef, enabled]);
}

function PinnedRow({ items }) {
  const trackRef = useRef(null);
  // Défilement automatique actif PC ET mobile, même vitesse des deux côtés.
  usePinnedAutoScroll(trackRef, items.length > 1);

  if (!items.length) return null;
  const track = items.length > 1 ? [...items, ...items] : items;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 pb-6 border-b border-ink-200">
      <p className="text-[11px] font-bold uppercase tracking-wider text-ink-700 mb-3">À la une</p>
      {/* Pas de touch-action restrictif ici : laisser le navigateur gérer
          nativement le "scroll chaining" -- un balayage horizontal fait
          défiler cette piste, un balayage vertical remonte naturellement à
          la page (ce carousel n'a pas de débordement vertical propre). Une
          tentative précédente avait posé touch-action:pan-x pour "ne
          capturer que l'horizontal", mais pan-x désactive justement le
          pan-y du navigateur sur cet élément -- c'est ce qui bloquait le
          défilement vertical de la page quand le doigt restait sur une
          carte. */}
      <div ref={trackRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        {track.map((item, i) => (
          <EventCard key={`${item.listing_id}-${i}`} item={item} compact />
        ))}
      </div>
    </section>
  );
}

// --- Grille principale avec scroll infini -----------------------------------

function EventsGrid({ items, loading, hasMore, onLoadMore }) {
  const sentinelRef = useRef(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  // Mis en place UNE SEULE FOIS (tableau de dépendances vide) : recréer
  // l'observer à chaque rendu (ce qui arrivait quand `onLoadMore` changeait
  // d'identité à chaque rendu) provoquait des rechargements en boucle et un
  // comportement de scroll erratique. `onLoadMoreRef` garde toujours la
  // dernière version de la fonction sans jamais forcer une reconnexion.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMoreRef.current();
      },
      { rootMargin: '600px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!loading && items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-ink-700">Aucun événement ne correspond à votre recherche pour le moment.</p>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {items.map((item, i) => (
          <EventCard key={item.listing_id} item={item} index={i} />
        ))}
      </div>
      <div ref={sentinelRef} className="h-1" />
      {loading && (
        <div className="flex justify-center pt-10">
          <span className="w-8 h-8 rounded-full border-2 border-ink-200 border-t-primary animate-spin" aria-label="Chargement" />
        </div>
      )}
      {!hasMore && items.length > 0 && !loading && (
        <p className="text-center text-xs text-ink-400 pt-10">Vous avez vu tous les événements disponibles.</p>
      )}
    </section>
  );
}

// --- Page --------------------------------------------------------------------

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export default function EventsPage() {
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const [filters, setFilters] = useState({ type: '', status: '', country: '', sort: 'recent' });

  const updateFilters = (patch) => setFilters((prev) => ({ ...prev, ...patch }));

  const { items, pinned, total, hasMore, loading, loadMore } = useEventListings({ search, ...filters });

  // La bande "épinglés" ne fait sens que sur la vue non filtrée (sinon on
  // afficherait des épinglés qui ne correspondent pas à la recherche/aux
  // filtres actifs juste en dessous, ce qui serait incohérent).
  const showPinned = !search && !filters.type && !filters.status && !filters.country;

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader activeHref="/evenements" />
      <main>
        <SearchHero value={searchInput} onChange={setSearchInput} />
        <div className="pt-10">
          {showPinned && <PinnedRow items={pinned} />}
          <FilterPanel filters={filters} onChange={updateFilters} resultCount={total} />
          <EventsGrid items={items} loading={loading} hasMore={hasMore} onLoadMore={loadMore} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
