import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SiteHeader from '../components/SiteHeader';
import Footer from '../components/Footer';
import { media, illustration, flag } from '../config/media';

gsap.registerPlugin(ScrollTrigger);


// --- Couverture géographique (backlog LAN-01, section Coverage) ---
// Same pattern as Tarifs: countries and payment methods are read live from
// `/api/countries` / `/api/payment-methods` (the real CountryConfig /
// Aggregator tables), not a hardcoded list. Empty table = empty strip,
// nothing invented client-side.
function useCountries() {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/countries')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setCountries(data.ok ? data.countries : []);
      })
      .catch(() => {
        if (!cancelled) setCountries([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { countries };
}

function usePaymentMethods() {
  const [methods, setMethods] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/payment-methods')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setMethods(data.ok ? data.methods : []);
      })
      .catch(() => {
        if (!cancelled) setMethods([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { methods };
}

// --- Les 6 univers Moledi Event (backlog LAN-01, ZUIHubStory) ---
/**
 * The 6 Moledi Events universes, ordered as validated by the user.
 * Content for each level:
 *   - level-1 (overview): image + short definition (the "block" seen from far)
 *   - level-2 (zoom 2)  : 3 nested cards → Comment ça marche · Pour qui · Confiance
 */

const u = (id, w = 700) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const universes = [
  {
    id: 'votes',
    label: 'Votes & Scrutins',
    image: illustration.votes,
    definition:
      "Organisez un vote fiable et transparent, du concours de talents à l'élection interne.",
    nested: {
      how: {
        title: 'Comment ça marche',
        text:
          "Création des candidats ou options → les votants paient ou votent gratuitement selon la formule → résultats calculés en direct.",
        image: u('1494172961521-33799ddd43a5'),
      },
      who: {
        title: 'Pour qui',
        text:
          'Concours de beauté / talent, élections associatives, votes communautaires, awards.',
        image: u('1523580494863-6f3031224c94'),
      },
      trust: {
        title: 'Confiance',
        text:
          "Procès-verbal certifié en fin de scrutin, résultats infalsifiables, historique conservé. Chaque vote est horodaté et traçable, pour un résultat que personne ne peut contester.",
        image: u('1450101499163-c8848c66ca85'),
      },
    },
  },
  {
    id: 'billetterie',
    label: 'Billetterie & Événementiel',
    image: illustration.ticketing,
    definition:
      "Vendez vos billets en ligne et gérez tout l'accès à votre événement, du concert à la conférence.",
    nested: {
      how: {
        title: 'Comment ça marche',
        text:
          'Création de la page événement → choix des catégories de billets (prix, quota) → paiement Mobile Money → billet QR envoyé automatiquement.',
        image: u('1501281668745-f7f57925c3b4'),
      },
      who: {
        title: 'Pour qui',
        text: 'Concerts, conférences, ateliers, soirées, spectacles.',
        image: u('1470229722913-7c0e2dbbafd3'),
      },
      trust: {
        title: 'Confiance',
        text:
          "Contrôle d'accès par QR code à l'entrée, suivi des ventes en temps réel, aucun risque de fraude sur les billets. Chaque billet est unique et ne peut être scanné qu'une seule fois.",
        image: u('1533174072545-7a4b6ad7a6c3'),
      },
    },
  },
  {
    id: 'dons',
    label: 'Système de Dons & Cagnottes',
    image: illustration.donations,
    definition:
      "Recevez des dons ou lancez une cagnotte pour une cause, une personne ou un événement personnel.",
    nested: {
      how: {
        title: 'Comment ça marche',
        text:
          "Page de don ou cagnotte avec présentation de la cause → montant libre ou suggéré → contribution Mobile Money en un clic.",
        image: u('1593113630400-ea4288922497'),
      },
      who: {
        title: 'Pour qui',
        text:
          "ONG, associations, causes humanitaires, mariages, funérailles, urgences médicales, cadeaux collectifs.",
        image: u('1509099836639-18ba1795216d'),
      },
      trust: {
        title: 'Confiance',
        text:
          "Reçu automatique, montant collecté visible en temps réel, reversement sécurisé à l'organisateur. Chaque don est enregistré et consultable à tout moment par les donateurs.",
        image: u('1450101499163-c8848c66ca85'),
      },
    },
  },
  {
    id: 'crowdfunding',
    label: 'Crowdfunding',
    image: illustration.crowdfunding,
    definition:
      'Financez votre projet en mobilisant une communauté autour d’un objectif commun.',
    nested: {
      how: {
        title: 'Comment ça marche',
        text:
          "Présentation du projet et de l'objectif financier → contributions des soutiens → suivi de la progression en pourcentage.",
        image: u('1521737604893-d14cc237f11d'),
      },
      who: {
        title: 'Pour qui',
        text: 'Projets entrepreneuriaux, causes sociales, projets créatifs, innovations.',
        image: u('1522202176988-66273c2fd55f'),
      },
      trust: {
        title: 'Confiance',
        text:
          'Transparence sur le montant collecté, mises à jour du porteur de projet, traçabilité des contributions. Les fonds ne sont reversés que si l’objectif ou les paliers annoncés sont respectés.',
        image: u('1454165804606-c3d57bc86b40'),
      },
    },
  },
  {
    id: 'sponsoring',
    label: 'Sponsoring',
    image: illustration.sponsoring,
    definition:
      "Mettez en relation votre événement avec des marques prêtes à investir en visibilité.",
    nested: {
      how: {
        title: 'Comment ça marche',
        text:
          'Dépôt d’un dossier (audience, budget recherché) → mise en avant auprès des marques partenaires → mise en relation directe.',
        image: u('1552664730-d307ca884978'),
      },
      who: {
        title: 'Pour qui',
        text:
          'Organisateurs cherchant des financements, marques cherchant de la visibilité événementielle.',
        image: u('1556742049-0cfed4f6a45d'),
      },
      trust: {
        title: 'Confiance',
        text:
          'Dossiers vérifiés, statistiques d’audience fiables, mise en relation encadrée par la plateforme. Aucun engagement financier n’est pris sans validation des deux parties.',
        image: u('1450101499163-c8848c66ca85'),
      },
    },
  },
  {
    id: 'tombolas',
    label: 'Jeux-Concours & Tombolas',
    image: illustration.contests,
    definition:
      'Organisez un tirage au sort ou un jeu-concours certifié, sans contestation possible.',
    nested: {
      how: {
        title: 'Comment ça marche',
        text:
          'Définition des lots et conditions de participation → inscription ou achat de tickets → tirage automatique et certifié.',
        image: u('1513151233558-d860c5398176'),
      },
      who: {
        title: 'Pour qui',
        text:
          "Promotions commerciales, animations d'événements, levées de fonds ludiques.",
        image: u('1513151233558-d860c5398176'),
      },
      trust: {
        title: 'Confiance',
        text:
          'Algorithme de tirage vérifiable, procès-verbal de tirage, aucune manipulation possible. Le gagnant est désigné publiquement, à l’abri de toute contestation.',
        image: u('1450101499163-c8848c66ca85'),
      },
    },
  },
];

const wrap = {
  hidden: {},
  show: { transition: { delayChildren: 0.3, staggerChildren: 0.14 } },
};
const rise = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

// Word-by-word reveal with a soft rise + blur-out — no overflow clipping
// (per-word clipping proved unreliable on some mobile browsers).
function WordsReveal({ text, delay = 0, className = '', wordClassName = () => '' }) {
  const words = text.split(' ');
  return (
    <span className={className}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          className={`inline-block whitespace-pre ${wordClassName(w, i)}`}
          initial={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: delay + i * 0.08 }}
        >
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </span>
  );
}

function Hero() {
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoAvailable, setVideoAvailable] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onData = () => setVideoReady(true);
    const onError = () => setVideoAvailable(false);
    v.addEventListener('loadeddata', onData);
    v.addEventListener('error', onError, true);
    const id = requestAnimationFrame(() => {
      v.load();
      v.play().catch(() => {});
    });
    return () => {
      v.removeEventListener('loadeddata', onData);
      v.removeEventListener('error', onError, true);
      cancelAnimationFrame(id);
    };
  }, []);

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-ink-900">
      {/* Video background — fills the ENTIRE header, including the menu
          band above it (the navbar floats transparent on top until the
          user scrolls). Looping, softly blurred and dimmed to ~60% so it
          reads as ambient footage (illustrations only, no text on it)
          rather than a sharp, competing layer — the copy stays the focus. */}
      {videoAvailable && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster={media.heroPoster}
          className={`absolute inset-0 w-full h-full object-cover scale-105 blur-[2px] transition-opacity duration-1000 ${
            videoReady ? 'opacity-60' : 'opacity-0'
          }`}
        >
          <source src={media.heroVideo} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900/70 via-ink-900/45 to-ink-900/85" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/50 via-transparent to-transparent" />
      {/* Smooth hand-off into the next (white) section — no hard seam. */}
      <div className="absolute inset-x-0 bottom-0 h-40 sm:h-56 bg-gradient-to-b from-transparent to-white pointer-events-none" />

      <motion.div
        variants={wrap}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 w-full text-center"
      >
        <h1
          className="text-white leading-[1.06] sm:leading-[1.0]"
          style={{ fontSize: 'clamp(2.1rem, 8vw, 5.2rem)' }}
        >
          <WordsReveal text="De l'idée à l'événement," delay={0.3} className="block" />
          <WordsReveal
            text="en un clic"
            delay={0.8}
            className="block"
            wordClassName={() => 'bg-gradient-to-r from-primary-300 to-primary-100 bg-clip-text text-transparent'}
          />
        </h1>

        <motion.p
          variants={rise}
          className="mt-6 sm:mt-7 text-sm sm:text-lg md:text-xl text-white/85 normal-case max-w-xl sm:max-w-2xl mx-auto"
        >
          Chaque événement raconte une histoire. Moledi Event vous aide à
          l'écrire, du premier billet, du premier vote, du premier don, au
          dernier applaudissement.
        </motion.p>

        <motion.div
          variants={rise}
          className="mt-8 sm:mt-10 flex flex-row items-stretch justify-center gap-3 sm:gap-4 px-2"
        >
          <motion.a
            href="/inscription"
            whileTap={{ scale: 0.97 }}
            className="btn btn-primary flex-1 sm:flex-initial px-5 sm:px-8 py-3 sm:py-3.5"
          >
            Créer un événement
          </motion.a>
          <motion.a
            href="/evenements"
            whileTap={{ scale: 0.97 }}
            className="btn btn-light flex-1 sm:flex-initial px-5 sm:px-8 py-3 sm:py-3.5"
          >
            Parcourir les événements
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
}


gsap.registerPlugin(ScrollTrigger);

// Once the visitor has ridden the story all the way through the finale, it
// is remembered for the rest of the tab session — scrolling back up into
// the section afterwards shows the resting final frame instead of replaying
// the whole thing. A hard refresh is the only way to see it again.
const DONE_KEY = 'moledi_zui_done';

const BLOCK_W = 640;
const BLOCK_H = 780;
// Wide ellipse rather than a circle: on a wide desktop viewport the height
// (navbar-minus-viewport) is always the tighter constraint, so a circular
// orbit left huge unused margins left/right. Stretching horizontally and
// compressing vertically lets the whole story fill far more of a wide
// screen while still resolving to the same "6 blocks in a ring" layout.
const ORBIT_RX = 1520;
const ORBIT_RY = 840;
const ANGLES = [-90, -30, 30, 90, 150, 210];
const RING_COLORS = ['#FF6A00', '#2B6BFF', '#FF6A00', '#2B6BFF', '#FF6A00', '#2B6BFF'];

function positionsFor(count) {
  return ANGLES.slice(0, count).map((angle) => {
    const rad = (angle * Math.PI) / 180;
    return { x: Math.round(Math.cos(rad) * ORBIT_RX), y: Math.round(Math.sin(rad) * ORBIT_RY) };
  });
}

const positions = positionsFor(universes.length);

// Relative weights for the sub-animations inside each transition (arbitrary
// units — the real on-screen speed of a step is set by STEP_DURATION below,
// GSAP just samples these proportionally within that window). `hold` is the
// deliberate dwell at zoom-1 in the middle of a flight: the camera parks on
// the block for a beat — long enough to read its title/description — before
// diving on into zoom-2.
// `surface` (zoom-1 -> overview, showing every block again) and `out` (the
// tail end of that same dézoom) now weigh as much as `in` — the reported
// bug was that leaving zoom-1 to show the full overview felt like a jump
// cut, because those phases were much shorter than the entrance. They're
// deliberately symmetric now: leaving is as slow and deliberate as arriving.
const T = { in: 2.2, hold: 0.7, deepen: 1.1, surface: 1.9, out: 2.1 };

// Real seconds for each clip. Simple pause-per-block pacing, like a video
// you scroll to play/pause: one scroll takes you from the overview into a
// block's zoom-1 then all the way into its zoom-2, where it PAUSES. The
// next scroll resumes — dézooms back to the overview and dives into the
// next block, pausing again at its zoom-2. No speed-up, no "turbo": every
// clip always plays at its own natural pace — slow and cinematic, like a
// film reel, never a snap-cut.
const STEP_DURATION = { inDeep: 5.2, next: 8, out: 4.4, finale: 4.2 };
const STEP_EASE = 'power2.inOut';

// One camera easing curve for every block — kept uniform on purpose so the
// flight never has a jarring speed change from one step to the next; only
// the decorative ring accent's easing varies per universe.
const FLIGHT_STYLES = [
  { ringEase: 'back.out(1.4)' },
  { ringEase: 'elastic.out(1,0.65)' },
  { ringEase: 'back.out(2)' },
  { ringEase: 'power1.out' },
  { ringEase: 'back.out(1.8)' },
  { ringEase: 'elastic.out(1,0.5)' },
];

// ---------------------------------------------------------------------
// Finale: once every universe has been visited, the blocks slide left and
// stack into a single deck, a white iris wipes over to "close" the scene,
// then the slogan pops in, holds, and fades — a clean hand-off into the
// rest of the page instead of just stopping cold.
// ---------------------------------------------------------------------
const FINALE_SLOGAN_LINE_1 = 'Faites entrer la fête';
const FINALE_SLOGAN_LINE_2 = 'dans votre poche';

function ZUIHubStory({ onReplay }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRefs = useRef([]);
  const descRefs = useRef([]);
  const ringRefs = useRef([]);
  const overlayRefs = useRef([]);
  const blockRefs = useRef([]);
  const titleRefs = useRef([]);
  const flashRefs = useRef([]);
  const logoRef = useRef(null);
  const irisRef = useRef(null);
  const finaleTextRef = useRef(null);
  const tlRef = useRef(null);
  const stRef = useRef(null);
  const stopsRef = useRef([]);
  const currentStepRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const accumRef = useRef(0);
  const lastScrollRef = useRef(0);

  // Story already finished once this tab session — render the resting
  // final frame statically, no pin, no replay (only a hard refresh resets
  // sessionStorage and brings the animated version back).
  const [alreadyDone] = useState(() => {
    try {
      return sessionStorage.getItem(DONE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [finished, setFinished] = useState(alreadyDone);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const canvas = canvasRef.current;
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;

      const navHeight = viewportW < 1024 ? 64 : 80;
      const usableH = viewportH - navHeight;

      const maxX = Math.max(...positions.map((p) => Math.abs(p.x))) + BLOCK_W / 2;
      const maxY = Math.max(...positions.map((p) => Math.abs(p.y))) + BLOCK_H / 2;
      // Fuller bleed than before (0.94/0.9) — the wide-ellipse orbit above
      // already frees up the margin this used to need as safety room.
      const OVERVIEW = Math.min(
        (viewportW * 0.97) / (maxX * 2),
        (usableH * 0.94) / (maxY * 2)
      );
      const mobile = viewportW < 768;
      // Always clamp to the viewport (not just on mobile) so a bigger
      // BLOCK_W never overflows a narrower desktop/tablet window — on wide
      // screens this resolves to 1 exactly as before, no regression there.
      const ZOOM_1 = Math.min(1, (viewportW * 0.92) / BLOCK_W);
      const ZOOM_2 = ZOOM_1 * 1.45;
      // Push the whole scene down by the full navbar height (blocks got
      // bigger, so half a header-height was no longer enough clearance —
      // the fixed header was visibly cutting into the top block).
      const yOffset = navHeight;

      gsap.set(canvas, { x: 0, y: yOffset, scale: OVERVIEW, transformOrigin: '50% 50%' });
      gsap.set(imgRefs.current, { scale: 1, transformOrigin: '50% 50%' });
      gsap.set(descRefs.current, { opacity: 0, y: 12 });
      gsap.set(ringRefs.current, { opacity: 0, scale: 0.92 });
      gsap.set(overlayRefs.current, { opacity: 0, pointerEvents: 'none' });
      gsap.set(flashRefs.current, { opacity: 0 });
      gsap.set(blockRefs.current, { opacity: 1, filter: 'blur(0px)' });
      gsap.set(logoRef.current, { opacity: 1, filter: 'blur(0px)' });
      gsap.set(irisRef.current, { scale: 0 });
      gsap.set(finaleTextRef.current, { opacity: 0, scale: 0.85, filter: 'blur(0px)' });

      // Already rode the full story this session — leave the canvas parked
      // on the resting overview frame and skip building the scroll-jacking
      // timeline altogether (no pin is created in the effect below either).
      if (alreadyDone) return;

      // This timeline is never scrubbed by raw scroll position. It's a fixed
      // score of camera moves, paused, that we play with tl.tweenTo() one
      // clip at a time — a scroll only presses "play" on the next clip.
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' } });
      tlRef.current = tl;

      const flyTo = (dx, dy, S, dur, ease, pos) =>
        tl.to(canvas, { x: -dx * S, y: -dy * S + yOffset, scale: S, duration: dur, ease: ease || 'power3.inOut' }, pos ?? '>');

      const stops = ['overview-0'];
      tl.addLabel('overview-0');

      positions.forEach((p, i) => {
        const desc = descRefs.current[i];
        const ring = ringRefs.current[i];
        const overlay = overlayRefs.current[i];
        const title = titleRefs.current[i];
        const flash = flashRefs.current[i];
        const ringColor = RING_COLORS[i % RING_COLORS.length];
        const others = blockRefs.current.filter((_, idx) => idx !== i).concat([logoRef.current]);
        const style = FLIGHT_STYLES[i % FLIGHT_STYLES.length];
        gsap.set(ring, { '--ring-color': ringColor });

        // 1. OVERVIEW → ZOOM-1  (spotlight this block, dim every other one)
        // Anchored explicitly on tl.duration() (the timeline's true furthest
        // point) rather than the implicit '>' shorthand — '>' resolves to
        // "end of the most recently *inserted* tween", which for i>0 is the
        // previous block's `others` dim-restore tween, not its actual (later)
        // ending flyTo. Without this, this block's camera flight used to
        // start early and visibly collide with the previous block's outro.
        let t0 = tl.duration();
        flyTo(p.x, p.y, ZOOM_1, T.in, 'power2.inOut', t0);
        tl.to(ring, { opacity: 1, scale: 1, duration: T.in * 0.6, ease: style.ringEase }, '<');
        tl.to(desc, { opacity: 1, y: 0, duration: T.in * 0.45, ease: 'power2.out' }, `>-${T.in * 0.25}`);
        // Anchored on the phase's own start time (not chained with '<') so it
        // never shifts the ring/desc sequence above.
        tl.to(others, { opacity: 0.2, filter: 'blur(8px)', duration: T.in, ease: 'power2.out' }, t0);
        tl.addLabel(`zoom1-${i}`);
        // Reading pause: the camera parks at zoom-1 for a beat (relative
        // weight T.hold of the whole clip) so the block's title/description
        // can actually be read before the dive continues into zoom-2.
        tl.to({}, { duration: T.hold });

        // 2. ZOOM-1 → ZOOM-2  (dive in with a quick colored flash)
        tl.to(ring, { opacity: 0, scale: 1.08, duration: T.deepen * 0.35, ease: 'power2.in' });
        tl.to(desc, { opacity: 0, y: -6, duration: T.deepen * 0.3 }, '<');
        if (title) {
          // Fully hidden (not just reset) once the immersive overlay takes
          // over — otherwise the block's own title, blown up underneath,
          // shows through as a stray duplicate of the overlay's big title.
          tl.to(title, { opacity: 0, scale: 1, duration: T.deepen * 0.3 }, '<');
        }
        t0 = tl.duration();
        flyTo(p.x, p.y, ZOOM_2, T.deepen, 'power2.inOut');
        tl.to(overlay, { opacity: 1, pointerEvents: 'auto', duration: T.deepen * 0.55, ease: 'power2.inOut' }, `>-${T.deepen * 0.45}`);
        if (flash) {
          tl.set(flash, { '--flash-color': ringColor }, t0);
          tl.to(flash, { opacity: 0.35, duration: T.deepen * 0.25, ease: 'power1.in' }, t0);
          tl.to(flash, { opacity: 0, duration: T.deepen * 0.5, ease: 'power1.out' }, t0 + T.deepen * 0.25);
        }
        tl.addLabel(`zoom2-${i}`);
        // The zoom-2 screens are resting "paused" stops — like a paused
        // video — plus the initial overview and the finale at the very end:
        // one scroll always plays the clip through to the next pause point.
        stops.push(`zoom2-${i}`);

        // 3. ZOOM-2 → OVERVIEW, one continuous dézoom with a brief pass
        // through zoom-1 on the way out, then straight into the next
        // universe's flight (this whole path plays as ONE clip per scroll).
        tl.to(overlay, { opacity: 0, pointerEvents: 'none', duration: T.surface * 0.45, ease: 'power2.in' });
        flyTo(p.x, p.y, ZOOM_1, T.surface, 'power2.out');
        tl.to(desc, { opacity: 1, y: 0, duration: T.surface * 0.5 }, `>-${T.surface * 0.35}`);
        if (title) {
          tl.to(title, { opacity: 1, duration: T.surface * 0.5 }, '<');
        }
        tl.to(ring, { opacity: 1, scale: 1, duration: T.surface * 0.4 }, `>-${T.surface * 0.35}`);

        t0 = tl.duration();
        tl.to(ring, { opacity: 0, scale: 0.92, duration: T.out * 0.4, ease: 'power2.in' });
        tl.to(desc, { opacity: 0, duration: T.out * 0.35 }, '<');
        flyTo(0, 0, OVERVIEW, T.out, 'power3.inOut');
        tl.to(others, { opacity: 1, filter: 'blur(0px)', duration: T.out, ease: 'power2.inOut' }, t0);
        tl.addLabel(`overview-${i + 1}`);
      });

      // The last "back to overview" reached above is the resting stop right
      // before the finale — give it a stable name and register it.
      tl.addLabel('overview-final', `overview-${positions.length}`);
      stops.push('overview-final');

      // -----------------------------------------------------------------
      // FINALE — every block slides left and stacks into one deck, a white
      // iris wipes over to "close" the scene (game-transition style), then
      // the slogan pops in, holds, and fades before the section lets go.
      // -----------------------------------------------------------------
      const stackTarget = { x: -maxX * 0.42, y: 0 };
      const finaleStart = tl.duration();
      const stackStagger = 0.32;
      const stackDuration = 1.05;

      universes.forEach((_, i) => {
        const dx = stackTarget.x - positions[i].x;
        const dy = stackTarget.y - positions[i].y;
        const block = blockRefs.current[i];
        const t0 = finaleStart + i * stackStagger;
        tl.to(
          [descRefs.current[i], titleRefs.current[i], ringRefs.current[i]].filter(Boolean),
          { opacity: 0, duration: 0.3 },
          t0
        );
        tl.to(
          block,
          {
            x: `+=${dx}`,
            y: `+=${dy}`,
            rotation: -8 + i * 3.5,
            scale: 0.82,
            duration: stackDuration,
            ease: 'power2.inOut',
          },
          t0
        );
      });
      tl.to(logoRef.current, { opacity: 0, scale: 0.8, duration: 0.5 }, finaleStart);

      const stackDoneAt = finaleStart + (universes.length - 1) * stackStagger + stackDuration;

      // Iris closes over the stacked deck, tucking it away like slipping
      // it into a pocket...
      tl.to(irisRef.current, { scale: 1, duration: 0.6, ease: 'power2.in' }, stackDoneAt - 0.2);
      tl.set(blockRefs.current, { opacity: 0 }, stackDoneAt + 0.4);
      tl.set(canvas, { x: 0, y: yOffset, scale: OVERVIEW }, stackDoneAt + 0.4);
      // ...and the slogan surfaces exactly as the iris starts to part again,
      // as if it had been hiding behind the stacked blocks all along and is
      // now pulled back out of the pocket.
      tl.to(irisRef.current, { scale: 0, duration: 0.75, ease: 'power2.out' }, stackDoneAt + 0.4);
      tl.to(finaleTextRef.current, { opacity: 1, scale: 1, duration: 0.75, ease: 'back.out(1.3)' }, stackDoneAt + 0.4);

      // The slogan stays on screen — it does not fade away — until the
      // visitor chooses to "Revoir le récap" (full remount, see onReplay).
      tl.to({}, { duration: 0.6 });

      tl.addLabel('finale-done');
      stops.push('finale-done');

      stopsRef.current = stops;
    }, rootRef);
    return () => ctx.revert();
  }, [alreadyDone]);

  // -- Step engine: pause-per-block, like a video you scroll to play/pause --
  // One scroll plays the next clip through to its resting pause point. No
  // "turbo", no fast-forward: every clip always plays at its own natural
  // pace, and scrolling while one is already playing does nothing — exactly
  // like scrolling can't speed up a video that's already unpaused.

  const durationFor = (fromIdx, toIdx) => {
    const stops = stopsRef.current;
    const from = stops[Math.min(fromIdx, toIdx)];
    const to = stops[Math.max(fromIdx, toIdx)];
    if (to === 'finale-done') return STEP_DURATION.finale;
    if (from === 'overview-0') return STEP_DURATION.inDeep;
    if (to === 'overview-final') return STEP_DURATION.out;
    return STEP_DURATION.next;
  };

  const markDoneIfFinished = (clamped, stopsLength) => {
    if (clamped !== stopsLength - 1) return;
    try {
      sessionStorage.setItem(DONE_KEY, '1');
    } catch {
      /* private browsing / storage disabled — harmless to skip */
    }
    setFinished(true);
  };

  const goToStep = (rawIndex) => {
    const stops = stopsRef.current;
    const tl = tlRef.current;
    if (!tl || !stops.length || isAnimatingRef.current) return;
    const clamped = Math.max(0, Math.min(stops.length - 1, rawIndex));
    if (clamped === currentStepRef.current) return;
    const duration = durationFor(currentStepRef.current, clamped);
    isAnimatingRef.current = true;
    currentStepRef.current = clamped;
    tl.tweenTo(stops[clamped], {
      duration,
      ease: STEP_EASE,
      onComplete: () => {
        isAnimatingRef.current = false;
        // Once the very first or very last stop is genuinely reached (the
        // clip has finished playing), snap the real scroll position to the
        // trigger's start/end so ScrollTrigger's pin releases immediately
        // instead of requiring the user to scroll through dead space.
        const st = stRef.current;
        if (st) {
          if (clamped === 0) st.scroll(st.start);
          else if (clamped === stops.length - 1) st.scroll(st.end);
          lastScrollRef.current = st.scroll();
        }
        markDoneIfFinished(clamped, stops.length);
      },
    });
  };

  // "Passer" — a quick shuffle (not a literal fast-forward through every
  // remaining block's zoom-in/zoom-out) straight to the overview, then the
  // finale plays at its normal, full cinematic pace: blocks group up, the
  // slogan writes itself, then everything fades. Runs every time, even if
  // the story already reached its resting frame this session.
  const skipToEnd = () => {
    const stops = stopsRef.current;
    const tl = tlRef.current;
    if (!tl || !stops.length) return;
    const last = stops.length - 1;
    const overviewFinalIdx = stops.indexOf('overview-final');

    const playFinale = () => {
      currentStepRef.current = last;
      tl.tweenTo(stops[last], {
        duration: STEP_DURATION.finale,
        ease: STEP_EASE,
        onComplete: () => {
          isAnimatingRef.current = false;
          const st = stRef.current;
          if (st) {
            st.scroll(st.end);
            lastScrollRef.current = st.scroll();
          }
          markDoneIfFinished(last, stops.length);
        },
      });
    };

    isAnimatingRef.current = true;
    if (currentStepRef.current >= overviewFinalIdx) {
      playFinale();
    } else {
      currentStepRef.current = overviewFinalIdx;
      tl.tweenTo(stops[overviewFinalIdx], { duration: 1, ease: 'power2.inOut', onComplete: playFinale });
    }
  };

  // The whole pin + capture engine is delegated to GSAP's ScrollTrigger —
  // `normalizeScroll(true)` irons out mobile touch/momentum inconsistencies.
  // We never scrub the camera 1:1 with scroll position: a small scroll is
  // just the "play" signal, and the clip's own duration paces the story.
  useEffect(() => {
    if (alreadyDone) return;
    ScrollTrigger.normalizeScroll(true);

    // Lower than before: the old threshold made a normal scroll gesture
    // feel like it "didn't register", tempting a second scroll while the
    // first one was already queued — this fires sooner, closer to the
    // gesture itself.
    const FIRE_THRESHOLD = 10;

    const st = ScrollTrigger.create({
      trigger: rootRef.current,
      // The story only starts capturing scroll once the section is centred
      // in the viewport — not the instant it's merely entered — so arriving
      // at it never feels like an ambush mid-scroll.
      start: 'center center',
      end: () => `+=${Math.max(stopsRef.current.length, 1) * 800}`,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        const stops = stopsRef.current;
        if (!stops.length) return;

        const scroll = self.scroll();
        const delta = scroll - lastScrollRef.current;
        lastScrollRef.current = scroll;
        if (!delta) return;

        const atStart = currentStepRef.current === 0;
        const atEnd = currentStepRef.current === stops.length - 1;
        // Let native scroll take over at the story's two ends.
        if (atStart && delta < 0) return;
        if (atEnd && delta > 0) return;

        // A clip is already playing — like a video already un-paused,
        // extra scroll input while it plays doesn't do anything. This is
        // the whole "pause per block" behaviour: no banking, no chaining.
        if (isAnimatingRef.current) return;

        if (Math.sign(accumRef.current) === -Math.sign(delta)) {
          accumRef.current = 0;
        }
        accumRef.current += delta;

        if (Math.abs(accumRef.current) >= FIRE_THRESHOLD) {
          const dir = accumRef.current > 0 ? 1 : -1;
          accumRef.current = 0;
          goToStep(currentStepRef.current + dir);
        }
      },
    });
    stRef.current = st;

    return () => st.kill();
  }, [alreadyDone]);

  return (
    // ScrollTrigger's `pin: true` wraps this in its own spacer and pins it
    // at top:0 for the whole scroll budget above. Do NOT wrap this section
    // in anything that changes size/style based on React state — GSAP
    // mutates this subtree's DOM directly (pin spacer, inline transforms)
    // outside of React's knowledge, and a surrounding re-render fights that
    // and corrupts the layout (this broke the whole page once already).
    <section
      ref={rootRef}
      className="relative h-[100svh] overflow-hidden"
      aria-label="Les 6 univers de Moledi Event"
    >

      <div className="absolute inset-0 flex items-center justify-center">
        <div ref={canvasRef} data-testid="zui-canvas" className="absolute left-1/2 top-1/2" style={{ willChange: 'transform' }}>
          <CenterLogo logoRef={logoRef} />
          {universes.map((univ, i) => (
            <Block
              key={univ.id}
              univ={univ}
              pos={positions[i]}
              imgRef={(el) => (imgRefs.current[i] = el)}
              descRef={(el) => (descRefs.current[i] = el)}
              ringRef={(el) => (ringRefs.current[i] = el)}
              blockRef={(el) => (blockRefs.current[i] = el)}
              titleRef={(el) => (titleRefs.current[i] = el)}
            />
          ))}
        </div>
      </div>

      {universes.map((univ, i) => (
        <div
          key={`${univ.id}-flash`}
          ref={(el) => (flashRefs.current[i] = el)}
          className="pointer-events-none fixed inset-0 z-20"
          style={{ background: 'radial-gradient(circle at 50% 50%, var(--flash-color, #FF6A00) 0%, transparent 65%)' }}
        />
      ))}

      {universes.map((univ, i) => (
        <ImmersiveOverlay
          key={`${univ.id}-overlay`}
          univ={univ}
          index={i}
          overlayRef={(el) => (overlayRefs.current[i] = el)}
        />
      ))}

      {/* Finale iris — a plain white disc that wipes over the stacked deck
          (closing) then back down (opening) onto the empty resting scene,
          like a classic game-transition cut. */}
      <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center overflow-hidden">
        <div ref={irisRef} className="w-[300vmax] h-[300vmax] rounded-full bg-white" />
      </div>

      {/* Finale slogan — surfaces from behind the stacked blocks, holds
          large and bold in the upper half of the screen, then dissipates
          like smoke. */}
      <div
        ref={finaleTextRef}
        className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center px-6 pt-24 sm:pt-32"
      >
        <p className="text-ink-900 font-black text-4xl sm:text-7xl lg:text-8xl leading-[1.05] text-center max-w-4xl">
          <span className="block">{FINALE_SLOGAN_LINE_1}</span>
          <span className="block bg-gradient-to-r from-primary to-primary-300 bg-clip-text text-transparent">
            {FINALE_SLOGAN_LINE_2}
          </span>
        </p>
      </div>

      {/* Sober "skip" while the story is still running; once it's done, a
          "Revoir le récap" button takes its place instead (the slogan
          itself stays on screen, it no longer fades away). */}
      {!finished ? (
        <button
          type="button"
          onClick={skipToEnd}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[60] text-xs font-semibold text-ink-700 bg-white/80 backdrop-blur-sm border border-ink-200 rounded-lg px-4 py-2 hover:text-ink-900 hover:border-ink-300 transition-colors"
        >
          Passer
        </button>
      ) : (
        <button
          type="button"
          onClick={onReplay}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[60] text-xs font-semibold text-white bg-primary shadow-lg shadow-primary/30 rounded-full px-5 py-2.5 hover:bg-primary-600 transition-colors"
        >
          ↻ Revoir le récap
        </button>
      )}
    </section>
  );
}

function CenterLogo({ logoRef }) {
  return (
    <div ref={logoRef} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: 0, top: 0, willChange: 'opacity, filter' }}>
      <div className="relative w-64 h-40 sm:w-96 sm:h-60 flex items-center justify-center">
        <div className="absolute inset-[-30px] rounded-full bg-primary/15 blur-3xl animate-pulse" />
        <LogoImg />
      </div>
    </div>
  );
}

function LogoImg() {
  return (
    <img
      src={media.logo}
      alt="Moledi Event"
      className="relative w-56 h-auto sm:w-80 object-contain drop-shadow-[0_18px_40px_rgba(255,106,0,0.35)]"
    />
  );
}

function Block({ univ, pos, imgRef, descRef, ringRef, blockRef, titleRef }) {
  return (
    <div
      ref={blockRef}
      className="absolute"
      style={{
        left: 0,
        top: 0,
        width: BLOCK_W,
        transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
        willChange: 'opacity, filter',
      }}
    >
      <div
        ref={ringRef}
        className="pointer-events-none absolute -inset-2.5 rounded-[36px]"
        style={{
          border: '3px solid var(--ring-color, #FF6A00)',
          boxShadow: '0 0 60px -10px var(--ring-color, #FF6A00), inset 0 0 30px -15px var(--ring-color, #FF6A00)',
        }}
      />
      <div
        className="relative rounded-[28px] overflow-hidden shadow-[0_24px_60px_-18px_rgba(11,19,36,0.35)] bg-white"
        style={{ height: BLOCK_H }}
      >
        <img
          ref={imgRef}
          src={univ.image}
          alt={univ.label}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ willChange: 'transform' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/25 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <h3
            ref={titleRef}
            className="font-heading text-white text-2xl sm:text-3xl leading-tight normal-case"
            style={{ willChange: 'transform' }}
          >
            {univ.label}
          </h3>
          <p ref={descRef} className="text-white/90 text-sm sm:text-base leading-relaxed normal-case mt-3">
            {univ.definition}
          </p>
        </div>
      </div>
    </div>
  );
}

function IconSteps({ color }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round">
      <path d="M4 6h4M4 12h4M4 18h4" />
      <path d="M12 6h8M12 12h8M12 18h8" opacity="0.5" />
    </svg>
  );
}

function IconPeople({ color }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <path d="M16 8.5a3 3 0 1 0 0-5.4" opacity="0.6" />
      <path d="M18 14.3c2.6.5 4.5 2.6 4.5 5.7" opacity="0.6" />
    </svg>
  );
}

function IconShield({ color }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function StepsWidget({ steps, color, layout }) {
  if (layout === 'row') {
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        {steps.map((step, idx) => (
          <div key={idx} className="flex-1 flex sm:flex-col items-start gap-2.5">
            <span
              className="flex-none w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {idx + 1}
            </span>
            <p className="text-ink-700 text-xs sm:text-[13px] leading-snug normal-case">{step}</p>
          </div>
        ))}
      </div>
    );
  }
  return (
    <ol>
      {steps.map((step, idx) => (
        <li key={idx} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className="flex-none w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {idx + 1}
            </span>
            {idx < steps.length - 1 && <span className="w-px flex-1 min-h-[0.8rem] my-1 bg-ink-200" />}
          </div>
          <p className="text-ink-700 text-xs sm:text-sm leading-snug normal-case pb-2.5">{step}</p>
        </li>
      ))}
    </ol>
  );
}

function TagsWidget({ tags }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag, idx) => (
        <span
          key={idx}
          className="text-[11px] sm:text-xs text-ink-700 px-2.5 py-1 rounded-full border border-ink-200 bg-white normal-case"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function Panel({ children, className = '' }) {
  return (
    <div className={`rounded-2xl bg-white border border-ink-200 p-4 sm:p-5 shadow-[0_10px_30px_-18px_rgba(11,19,36,0.25)] ${className}`}>
      {children}
    </div>
  );
}

function PanelHeading({ icon, color, children }) {
  return (
    <h4 className="flex items-center gap-2 text-ink-900 font-heading text-xs sm:text-sm tracking-wide uppercase mb-3">
      {icon({ color })}
      {children}
    </h4>
  );
}

function Thumb({ src, className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
    </div>
  );
}

// Each universe gets its own genuinely different way of presenting the same
// three pieces of data (steps / who / trust), with real imagery inside, all
// sized to fit a single viewport on desktop (no internal scrolling).
const DETAIL_LAYOUTS = [TimelineDetail, TicketDetail, RadialDetail, ProgressDetail, SplitDetail, RaffleDetail];

function ImmersiveOverlay({ univ, overlayRef, index }) {
  const color = RING_COLORS[index % RING_COLORS.length];
  const steps = univ.nested.how.text.split('→').map((s) => s.trim()).filter(Boolean);
  const tags = univ.nested.who.text.split(',').map((s) => s.trim()).filter(Boolean);
  const trust = univ.nested.trust;
  const Layout = DETAIL_LAYOUTS[index % DETAIL_LAYOUTS.length];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-30 overflow-y-auto lg:overflow-hidden"
      style={{ pointerEvents: 'none' }}
    >
      <div className="absolute inset-0">
        <img src={univ.image} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/[0.93]" />
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(circle at 50% 0%, ${color}14, transparent 55%)` }}
        />
      </div>

      <div className="relative min-h-full lg:h-full flex items-center justify-center px-4 pt-20 pb-8 lg:pt-24 lg:pb-6">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-5 sm:mb-6">
            <h3 className="font-heading text-ink-900 text-2xl sm:text-3xl lg:text-4xl normal-case">
              {univ.label}
            </h3>
            <p className="mt-2 max-w-2xl mx-auto text-ink-700 text-xs sm:text-sm leading-relaxed normal-case">
              {univ.definition}
            </p>
          </div>

          <Layout univ={univ} steps={steps} tags={tags} trust={trust} color={color} />
        </div>
      </div>
    </div>
  );
}

// Votes & Scrutins — a connected vertical timeline beside a tall visual.
function TimelineDetail({ univ, steps, tags, trust, color }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
      <Thumb src={univ.nested.how.image} className="hidden lg:block lg:col-span-3 min-h-[16rem]" />
      <Panel className="lg:col-span-5">
        <PanelHeading icon={IconSteps} color={color}>Comment ça marche</PanelHeading>
        <StepsWidget steps={steps} color={color} layout="column" />
      </Panel>
      <div className="lg:col-span-4 flex flex-col gap-3 sm:gap-4">
        <Panel>
          <PanelHeading icon={IconPeople} color={color}>Pour qui</PanelHeading>
          <TagsWidget tags={tags} />
        </Panel>
        <div className="rounded-2xl p-4 sm:p-5 border flex-1" style={{ background: `${color}0d`, borderColor: `${color}35` }}>
          <PanelHeading icon={IconShield} color={color}>Confiance</PanelHeading>
          <p className="text-ink-700 text-xs sm:text-sm leading-snug normal-case">{trust.text}</p>
        </div>
      </div>
    </div>
  );
}

// Billetterie — a boarding-pass: photo on the left of the ticket, steps as
// stages printed across it, perforated divider before the who/trust stub.
function TicketDetail({ univ, steps, tags, trust, color }) {
  return (
    <div className="rounded-3xl bg-white border border-ink-200 shadow-[0_18px_50px_-20px_rgba(11,19,36,0.3)] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-4">
        <Thumb src={univ.nested.how.image} className="hidden lg:block rounded-none min-h-full" />
        <div className="lg:col-span-3 p-4 sm:p-6">
          <PanelHeading icon={IconSteps} color={color}>Comment ça marche</PanelHeading>
          <div className="flex flex-col sm:flex-row items-start sm:items-stretch gap-4 sm:gap-0">
            {steps.map((step, idx) => (
              <div key={idx} className="flex-1 flex sm:flex-col items-center gap-2.5 relative">
                <span
                  className="flex-none w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {idx + 1}
                </span>
                <p className="text-ink-700 text-xs leading-snug normal-case text-left sm:text-center sm:px-2">{step}</p>
                {idx < steps.length - 1 && (
                  <span
                    className="hidden sm:block absolute top-4 left-[calc(50%+22px)] right-[calc(-50%+22px)] border-t-2 border-dashed"
                    style={{ borderColor: `${color}45` }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="relative border-t-2 border-dashed border-ink-200 mx-5 sm:mx-8">
        <span className="absolute -left-[30px] -top-2.5 w-5 h-5 rounded-full bg-ink-100" />
        <span className="absolute -right-[30px] -top-2.5 w-5 h-5 rounded-full bg-ink-100" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 p-4 sm:p-6">
        <div>
          <PanelHeading icon={IconPeople} color={color}>Pour qui</PanelHeading>
          <TagsWidget tags={tags} />
        </div>
        <div className="rounded-xl p-3.5 border" style={{ background: `${color}0d`, borderColor: `${color}35` }}>
          <PanelHeading icon={IconShield} color={color}>Confiance</PanelHeading>
          <p className="text-ink-700 text-xs leading-snug normal-case">{trust.text}</p>
        </div>
      </div>
    </div>
  );
}

// Dons & Cagnottes — a radial dial (trust at the centre, steps orbiting)
// beside the who/imagery column: reads like a fundraising meter.
function RadialDetail({ univ, steps, tags, trust, color }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 items-stretch">
      <Panel>
        <PanelHeading icon={IconSteps} color={color}>Comment ça marche</PanelHeading>
        <StepsWidget steps={steps} color={color} layout="row" />
      </Panel>
      <div className="flex flex-col gap-3 sm:gap-4">
        <Thumb src={univ.nested.who.image} className="hidden lg:block h-28" />
        <Panel>
          <PanelHeading icon={IconPeople} color={color}>Pour qui</PanelHeading>
          <TagsWidget tags={tags} />
        </Panel>
        <div className="rounded-2xl p-4 sm:p-5 border" style={{ background: `${color}0d`, borderColor: `${color}35` }}>
          <PanelHeading icon={IconShield} color={color}>Confiance</PanelHeading>
          <p className="text-ink-700 text-xs sm:text-sm leading-snug normal-case">{trust.text}</p>
        </div>
      </div>
    </div>
  );
}

// Crowdfunding — a milestone progress bar with panels below.
function ProgressDetail({ univ, steps, tags, trust, color }) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <Panel>
        <PanelHeading icon={IconSteps} color={color}>Comment ça marche</PanelHeading>
        <div className="pt-1">
          <div className="h-2.5 rounded-full bg-ink-100 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: '72%', background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
          </div>
          <div className="flex justify-between mt-3 gap-2">
            {steps.map((step, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center text-center">
                <span className="w-2.5 h-2.5 rounded-full mb-2" style={{ backgroundColor: color }} />
                <p className="text-ink-700 text-[11px] sm:text-xs leading-snug normal-case">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </Panel>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Thumb src={univ.nested.who.image} className="hidden sm:block min-h-[8rem]" />
        <Panel>
          <PanelHeading icon={IconPeople} color={color}>Pour qui</PanelHeading>
          <TagsWidget tags={tags} />
        </Panel>
        <div className="rounded-2xl p-4 sm:p-5 border" style={{ background: `${color}0d`, borderColor: `${color}35` }}>
          <PanelHeading icon={IconShield} color={color}>Confiance</PanelHeading>
          <p className="text-ink-700 text-xs leading-snug normal-case">{trust.text}</p>
        </div>
      </div>
    </div>
  );
}

// Sponsoring — a split "matchmaking" panel: organizer steps on one side,
// the brand-facing tinted side on the other, with a photo bridge.
function SplitDetail({ univ, steps, tags, trust, color }) {
  return (
    <div className="rounded-3xl bg-white border border-ink-200 shadow-[0_18px_50px_-20px_rgba(11,19,36,0.3)] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-5">
        <div className="lg:col-span-2 p-4 sm:p-6 lg:border-r border-ink-200 border-b lg:border-b-0">
          <PanelHeading icon={IconSteps} color={color}>Comment ça marche</PanelHeading>
          <StepsWidget steps={steps} color={color} layout="column" />
        </div>
        <Thumb src={univ.nested.how.image} className="hidden lg:block rounded-none" />
        <div className="lg:col-span-2 p-4 sm:p-6 flex flex-col gap-4" style={{ background: `${color}0a` }}>
          <div>
            <PanelHeading icon={IconPeople} color={color}>Pour qui</PanelHeading>
            <TagsWidget tags={tags} />
          </div>
          <div className="rounded-xl p-3.5 border bg-white/70" style={{ borderColor: `${color}35` }}>
            <PanelHeading icon={IconShield} color={color}>Confiance</PanelHeading>
            <p className="text-ink-700 text-xs leading-snug normal-case">{trust.text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tombolas — scattered raffle-ticket cards with a light tilt.
function RaffleDetail({ univ, steps, tags, trust, color }) {
  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <div>
        <div className="flex justify-center mb-3">
          <PanelHeading icon={IconSteps} color={color}>Comment ça marche</PanelHeading>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative w-full sm:w-52 rounded-xl bg-white border-2 border-dashed p-3.5 shadow-sm"
              style={{ borderColor: `${color}50`, transform: `rotate(${(idx % 2 === 0 ? -1 : 1) * (1.5 + idx)}deg)` }}
            >
              <span
                className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {idx + 1}
              </span>
              <p className="text-ink-700 text-xs leading-snug normal-case">{step}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-2xl p-4 border-2 sm:col-span-1" style={{ background: `${color}0d`, borderColor: color }}>
          <PanelHeading icon={IconShield} color={color}>Confiance</PanelHeading>
          <p className="text-ink-700 text-xs leading-snug normal-case">{trust.text}</p>
        </div>
        <Panel>
          <PanelHeading icon={IconPeople} color={color}>Pour qui</PanelHeading>
          <TagsWidget tags={tags} />
        </Panel>
        <Thumb src={univ.nested.who.image} className="hidden sm:block min-h-[8rem]" />
      </div>
    </div>
  );
}


/**
 * Featured events — a conceptual teaser, not a live feed. Per spec: no
 * invented dates, vote counts or amounts here (that data belongs to real
 * event pages, once they exist) — just event visuals presented as
 * partially overlapping tickets, each labelled with its category only,
 * inviting the visitor to the full catalog.
 */

const TICKETS = [
  { image: illustration.ticketing, rotate: -10, z: 1 },
  { image: illustration.votes, rotate: 0, z: 3 },
  { image: illustration.crowdfunding, rotate: 9, z: 2 },
];

function Ticket({ image, rotate, z, index }) {
  return (
    <motion.div
      animate={{ rotate }}
      transition={{ duration: 0.9, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -10, rotate: 0, zIndex: 10 }}
      style={{ zIndex: z, marginLeft: index === 0 ? 0 : '-2.5rem' }}
      className="group relative w-32 sm:w-52 lg:w-64 aspect-[3/4.2] rounded-[1.75rem] overflow-hidden border-[6px] border-white shadow-[0_30px_60px_-20px_rgba(11,19,36,0.45)] shrink-0 transition-shadow hover:shadow-[0_36px_70px_-16px_rgba(11,19,36,0.55)]"
    >
      <img
        src={image}
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/10 to-transparent" />
      {/* Perforated ticket stub line */}
      <div className="absolute inset-x-0 top-8 border-t-2 border-dashed border-white/60" />
      <span className="absolute -left-2.5 top-8 w-5 h-5 rounded-full bg-white -translate-y-1/2" />
      <span className="absolute -right-2.5 top-8 w-5 h-5 rounded-full bg-white -translate-y-1/2" />
    </motion.div>
  );
}

/**
 * Featured events teaser. At rest the three tickets sit stacked tightly
 * together, centred over the text. As the visitor scrolls through the
 * section, the tickets glide apart to the left (fanning out to their
 * final resting positions) while the copy slides out from behind them
 * to the right — a single scroll-linked reveal instead of three
 * separate fade-ins, and no ticket ever overlaps the text column since
 * both sides finish in their own half of the row.
 */
function FeaturedMarquee() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.75', 'start 0.25'],
  });
  const ticketsX = useTransform(scrollYProgress, [0, 1], [90, 0]);
  const textX = useTransform(scrollYProgress, [0, 1], [-70, 0]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);

  return (
    <section ref={sectionRef} className="relative py-20 sm:py-28 overflow-hidden">
      {/* Restrained backdrop glow — orange + light blue only */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[42rem] h-[42rem] rounded-full bg-primary/5 blur-[120px]" />
      <div className="pointer-events-none absolute top-0 right-0 w-[28rem] h-[28rem] rounded-full bg-secondary/5 blur-[100px]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* flex, not grid: the ticket fan only ever takes the width it
            actually needs (shrink-0) and the text takes what's left
            (flex-1) — a 50/50 grid split used to let the fan's real width
            spill into the text column and cover part of the headline. */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-16">
          {/* Ticket fan — order-2 on mobile so the headline reads first */}
          <motion.div
            style={{ x: ticketsX }}
            className="order-2 lg:order-1 shrink-0 flex justify-center lg:justify-start"
          >
            {TICKETS.map((t, i) => (
              <Ticket key={i} {...t} index={i} />
            ))}
          </motion.div>

          <motion.div
            style={{ x: textX, opacity: textOpacity }}
            className="order-1 lg:order-2 flex-1 min-w-0 text-center lg:text-left"
          >
            <p className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-2">
              En ce moment
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl text-ink-900 mb-5">
              Événements en vedette
            </h2>
            <p className="text-ink-700 text-base sm:text-lg normal-case mb-8 max-w-md mx-auto lg:mx-0">
              Concerts, votes, cagnottes, projets — de nouveaux événements
              rejoignent la plateforme chaque semaine.
            </p>
            <a href="/evenements" className="btn btn-secondary">
              Découvrir tous les événements
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


/**
 * Vertical chronology "Comment ça marche".
 *
 * Structure:
 *   - a coloured line runs down the left edge; it fills progressively as the
 *     user scrolls (the "story" is being written).
 *   - 4 steps stack vertically. Each step shows a bold number, an image and a
 *     text block. Layout alternates left/right on desktop, single-column on
 *     mobile — the image is always visible on mobile (never hidden).
 */

const STEPS = [
  {
    n: '01',
    title: 'Créez',
    text:
      "Choisissez votre type — billetterie, vote, cagnotte, crowdfunding, sponsoring ou concours — et lancez votre page en quelques minutes.",
    image: illustration.create,
  },
  {
    n: '02',
    title: 'Configurez',
    text:
      "Tarifs, billets, options de vote, paliers, dates, personnalisation : vous gardez le contrôle sur chaque détail.",
    image: illustration.configure,
  },
  {
    n: '03',
    title: 'Partagez',
    text:
      "Un lien unique, un QR code, et le partage WhatsApp / réseaux sociaux intégré pour mobiliser votre communauté.",
    image: illustration.share,
  },
  {
    n: '04',
    title: 'Encaissez',
    text:
      "Chaque paiement Mobile Money confirmé en temps réel, reçu automatique et reversements fiables sur votre compte.",
    image: illustration.cashout,
  },
];

// Real event photos (provided by the client, dropped in public/) — one
// distinct photo per card, no repeats. Votes opens the strip, then
// categories are mixed, never grouped back-to-back. Miss/Mister shows up
// several times on purpose (explicitly asked to be one of the most
// prominent categories here).
const SHOWCASE_CARDS = [
  { image: '/election-vote.jpg', text: 'Pour toutes vos élections associatives', color: '#2B6BFF' },
  { image: '/donation-coins.jpg', text: 'Pour toutes vos collectes de fonds', color: '#FF6A00' },
  { image: '/concert-crowd.jpg', text: 'Pour tous vos concerts et spectacles', color: '#2B6BFF' },
  { image: '/contest-trophy.jpg', text: 'Pour tous vos jeux-concours', color: '#FF6A00' },
  { image: '/community-hands.jpg', text: 'Pour tous vos partenariats de marque', color: '#2B6BFF' },
  { image: '/miss-universe.jpg', text: 'Pour tous vos concours de Miss & Mister', color: '#FF6A00' },
  { image: '/concert-jazz.jpg', text: 'Pour toutes vos soirées live', color: '#2B6BFF' },
  { image: '/community-heart.jpg', text: "Pour tous vos appels à la générosité", color: '#FF6A00' },
  { image: '/dance-contest.jpg', text: 'Pour tous vos concours de danse', color: '#2B6BFF' },
  { image: '/awards-gala.jpg', text: 'Pour toutes vos remises de prix', color: '#FF6A00' },
  { image: '/concert-stadium.jpg', text: 'Pour tous vos grands concerts', color: '#2B6BFF' },
  { image: '/miss-mister-pageant.jpg', text: 'Pour tous vos concours de talents', color: '#FF6A00' },
  { image: '/gala-performance.jpg', text: 'Pour tous vos galas culturels', color: '#2B6BFF' },
  { image: '/choir-performance.jpg', text: 'Pour toutes vos soirées gospel', color: '#FF6A00' },
  { image: '/concert-outdoor.jpg', text: 'Pour tous vos festivals', color: '#2B6BFF' },
  { image: '/award-winner.jpg', text: 'Pour toutes vos cérémonies de récompense', color: '#FF6A00' },
  { image: '/miss-crown.jpg', text: 'Pour toutes vos élections de reines de beauté', color: '#2B6BFF' },
  { image: '/concert-singer.jpg', text: 'Pour toutes vos scènes ouvertes', color: '#FF6A00' },
];

function ShowcaseCard({ image, text, color, index }) {
  const tilt = index % 2 === 0 ? -2 : 2;
  return (
    <div
      className="group relative shrink-0 w-36 sm:w-64 aspect-[4/5] rounded-[1.5rem] overflow-hidden border-4 border-white shadow-[0_20px_45px_-20px_rgba(11,19,36,0.4)] transition-transform duration-300 hover:rotate-0 hover:scale-[1.03]"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <img src={image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/15 to-transparent" />
      <span
        className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 w-2.5 h-2.5 rounded-full ring-2 ring-white/70"
        style={{ backgroundColor: color }}
      />
      <p className="absolute inset-x-0 bottom-0 p-3 sm:p-5 text-white text-[11px] sm:text-base font-semibold leading-snug normal-case">
        {text}
      </p>
    </div>
  );
}

function ShowcaseMarquee() {
  const track = [...SHOWCASE_CARDS, ...SHOWCASE_CARDS];
  return (
    <section className="py-16 sm:py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
        <p className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-2">
          Une plateforme, mille façons d'organiser
        </p>
        <h2 className="text-3xl sm:text-5xl text-ink-900">Quel événement ne peux-tu pas faire avec Moledi ?</h2>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-white to-transparent z-10" />
        <motion.div
          className="flex gap-4 sm:gap-6"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
        >
          {track.map((c, i) => (
            <ShowcaseCard key={i} {...c} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function HowTimeline() {
  const rootRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: rootRef,
    // Finishes filling while the last step is still comfortably on screen
    // (bottom of the section at 60% down the viewport), instead of waiting
    // until it's almost scrolled past — that's what made the line look
    // like it never quite reached the last node.
    offset: ['start 0.85', 'end 0.6'],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section ref={rootRef} className="relative py-16 sm:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-24">
          <p className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-2">
            Comment ça marche
          </p>
          <h2 className="text-3xl sm:text-5xl text-ink-900">Quatre étapes, zéro friction</h2>
        </div>

        <div className="relative pb-2">
          {/* Timeline rail — a single thin line running the full height of
              the section (including past the last step), positioned near
              the left edge on mobile and centred on desktop. */}
          <div className="absolute top-0 bottom-0 w-px bg-ink-200 left-4 sm:left-1/2 sm:-translate-x-1/2" />
          <motion.div
            style={{ height: lineHeight }}
            className="absolute top-0 w-px bg-primary left-4 sm:left-1/2 sm:-translate-x-1/2"
          />

          <ul className="space-y-10 sm:space-y-28">
            {STEPS.map((s, i) => (
              <Step key={s.n} step={s} index={i} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Step({ step, index }) {
  const rightSide = index % 2 === 1;

  return (
    <li className="relative pl-14 sm:pl-0">
      {/* Node */}
      <div className="absolute top-2 left-1 sm:left-1/2 sm:-translate-x-1/2 z-10">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-7 h-7 rounded-full bg-primary flex items-center justify-center ring-4 ring-white shadow-lg shadow-primary/40"
        >
          <span className="w-2 h-2 rounded-full bg-white" />
        </motion.div>
      </div>

      {/* Content row — image + text, alternating layout on desktop */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12 items-center ${
          rightSide ? 'sm:[&>*:first-child]:order-2' : ''
        }`}
      >
        <motion.figure
          initial={{ opacity: 0, x: rightSide ? 40 : -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-12% 0px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={`relative rounded-2xl sm:rounded-3xl overflow-hidden border border-ink-200 shadow-lg sm:shadow-xl aspect-video max-h-48 sm:max-h-none w-full ${
            index % 3 === 0 ? 'sm:aspect-[4/3]' : index % 3 === 1 ? 'sm:aspect-square' : 'sm:aspect-[5/4]'
          }`}
        >
          <img src={step.image} alt={step.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/50 to-transparent" />
          <span className="absolute top-3 left-3 sm:top-4 sm:left-4 font-heading text-white text-4xl sm:text-7xl drop-shadow-lg leading-none">
            {step.n}
          </span>
        </motion.figure>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <span className="text-primary text-[10px] sm:text-xs tracking-[0.25em] uppercase font-semibold mb-2 sm:mb-3 inline-block">
            Étape {step.n}
          </span>
          <h3 className="text-xl sm:text-4xl text-ink-900 mb-2 sm:mb-3 normal-case">{step.title}</h3>
          <p className="text-ink-700 text-sm sm:text-lg normal-case max-w-md">{step.text}</p>
        </motion.div>
      </div>
    </li>
  );
}


/**
 * Coverage strip — same live-data pattern as the Tarifs page: countries
 * from `/api/countries`, payment operators from `/api/payment-methods`,
 * rendered as real brand logos (not text labels) with an initials fallback
 * if a logo fails to load.
 */

function CountryChip({ c }) {
  return (
    <div className="shrink-0 flex items-center gap-2.5 px-1">
      <img
        src={flag(c.country_code.toLowerCase(), 80)}
        alt={c.country_name}
        width="28"
        height="20"
        className="w-7 h-5 object-cover rounded shadow-sm"
        loading="lazy"
      />
      <span className="text-sm font-semibold text-ink-900 whitespace-nowrap">
        {c.country_name}
      </span>
    </div>
  );
}

function PaymentLogoChip({ m }) {
  const [failed, setFailed] = useState(!m.logo_url);

  if (failed) {
    return (
      <span
        className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center font-heading text-xs normal-case tracking-wide text-center leading-tight bg-ink-100 text-ink-900"
        title={m.operator}
      >
        {String(m.operator || '')
          .split(' ')
          .map((w) => w[0])
          .join('')
          .slice(0, 3)}
      </span>
    );
  }

  return (
    <img
      src={m.logo_url}
      alt={m.operator}
      onError={() => setFailed(true)}
      className="shrink-0 w-14 h-14 rounded-xl object-contain bg-white border border-ink-200 p-2"
      loading="lazy"
    />
  );
}

function Coverage() {
  const { countries } = useCountries();
  const { methods } = usePaymentMethods();
  const active = countries.filter((c) => c.active);

  return (
    <section id="couverture" className="relative py-20 sm:py-24 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15% 0px' }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12"
      >
        <p className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-2">
          Couverture géographique
        </p>
        <h2 className="text-3xl sm:text-5xl text-ink-900">Toute l'Afrique francophone</h2>
        <p className="text-ink-700 normal-case mt-4 max-w-xl mx-auto">
          Des paiements locaux, via les opérateurs que vos participants
          utilisent déjà au quotidien.
        </p>
      </motion.div>

      {active.length > 0 && (
        <div className="relative mb-8">
          <div className="flex gap-8 w-max animate-marquee">
            {[...active, ...active].map((c, i) => (
              <CountryChip key={`c-${i}`} c={c} />
            ))}
          </div>
        </div>
      )}

      {methods.length > 0 && (
        <div className="relative">
          <div className="flex gap-4 w-max animate-marquee-slow">
            {[...methods, ...methods].map((m, i) => (
              <PaymentLogoChip key={`m-${i}`} m={m} />
            ))}
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-white to-transparent" />
    </section>
  );
}


/**
 * Pricing teaser — a light, airy interlude pointing to /tarifs. No numbers,
 * no commission breakdown here (that detail lives on the pricing page
 * itself, driven by CommissionConfig / UserCommissionConfig — UML DC-08).
 */

/**
 * Same scroll-linked decal reveal as FeaturedMarquee — a big, imposing
 * image block glides in from one side while the copy glides in from the
 * other — instead of the old small centered thumbnail.
 */
function PricingTeaser() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.75', 'start 0.3'],
  });
  const imageX = useTransform(scrollYProgress, [0, 1], [-90, 0]);
  const textX = useTransform(scrollYProgress, [0, 1], [90, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);

  return (
    <section ref={sectionRef} className="py-20 sm:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            style={{ x: imageX, opacity }}
            className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-3xl overflow-hidden border border-ink-200 shadow-[0_30px_70px_-25px_rgba(11,19,36,0.35)]"
          >
            <img
              src={illustration.pricing}
              alt="Tarifs Moledi Event"
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div style={{ x: textX, opacity }} className="text-center lg:text-left">
            <p className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-3">
              Tarification claire
            </p>
            <h2 className="text-3xl sm:text-5xl text-ink-900 mb-5">Découvrez nos tarifs</h2>
            <p className="text-ink-700 normal-case mb-8 max-w-md mx-auto lg:mx-0">
              Une seule commission, prélevée uniquement quand vous encaissez.
              Voyez exactement ce que vous gardez, pays par pays.
            </p>
            <a href="/tarifs" className="btn btn-secondary">
              Voir le détail
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


// Desktop-only custom cursor: a small trail of star sparkles follows the
// pointer, kept subtle (brand orange/blue, low opacity, short-lived) rather
// than a loud/childish effect. Never active on touch devices.
function useIsFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    setFine(mq.matches);
    const handler = (e) => setFine(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return fine;
}

function SparkleCursor() {
  const fine = useIsFinePointer();
  const [sparkles, setSparkles] = useState([]);
  const idRef = useRef(0);
  const lastRef = useRef(0);

  // The pointer itself stays the normal, standard system cursor — only a
  // trail of sparkles rides along with it while scrolling/navigating.
  useEffect(() => {
    if (!fine) return;
    const onMove = (e) => {
      const now = performance.now();
      if (now - lastRef.current < 45) return;
      lastRef.current = now;
      const id = idRef.current++;
      setSparkles((s) => [
        ...s.slice(-18),
        { id, x: e.clientX, y: e.clientY, blue: Math.random() > 0.5 },
      ]);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [fine]);

  if (!fine) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[999] overflow-hidden">
      <AnimatePresence>
        {sparkles.map((s) => (
          <motion.span
            key={s.id}
            initial={{ opacity: 0.85, scale: 0.4 }}
            animate={{ opacity: 0, scale: 1, y: -16 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            onAnimationComplete={() => setSparkles((cur) => cur.filter((c) => c.id !== s.id))}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-xs select-none"
            style={{ left: s.x, top: s.y, color: s.blue ? '#5F8EFF' : '#FF8533' }}
          >
            ✦
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

function Home() {
  // Remount key for "Revoir le récap": bumping it forces ZUIHubStory to
  // unmount/remount from scratch, which is the safe way to reset all its
  // GSAP/ScrollTrigger internals rather than trying to rewind them by hand.
  const [zuiKey, setZuiKey] = useState(0);
  const replayZui = () => {
    try {
      sessionStorage.removeItem(DONE_KEY);
    } catch {
      /* private browsing / storage disabled — harmless to skip */
    }
    setZuiKey((k) => k + 1);
  };

  return (
    <>
      <SparkleCursor />
      <SiteHeader activeHref="/" />
      <main>
        <Hero />
        <ZUIHubStory key={zuiKey} onReplay={replayZui} />
        <FeaturedMarquee />
        <ShowcaseMarquee />
        <HowTimeline />
        <Coverage />
        <PricingTeaser />
      </main>
      <Footer />
    </>
  );
}

export default Home;
