import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import SiteHeader from '../components/SiteHeader';
import Footer from '../components/Footer';
import { media } from '../config/media';
import {
  FeaturedMarquee,
  ShowcaseMarquee,
  HowTimeline,
  Coverage,
  PricingTeaser,
  SparkleCursor,
  universes,
} from './Home2';

gsap.registerPlugin(ScrollTrigger);

/**
 * Storytelling section — "push parallax stack" (à la floema.com).
 *
 *  - ONE pinned, fixed-camera section. The TEXT is on its own layer that
 *    never moves — only its opacity/content crossfades between panels.
 *    Only the IMAGE layers slide/push; text does not travel with them
 *    (an image visually passes behind the still text as it moves).
 *  - Panel 0 is a special intro: its image starts small (scaled down,
 *    centered) and grows until it fills the whole screen — like a photo
 *    being brought up close — then locks in place, fully covering the
 *    static hero underneath. Only once that's done does the real
 *    scroll-driven story begin.
 *  - From panel 1 onward: each panel rises from below (`yPercent: 100` ->
 *    `0`) while the panel before it gets pushed further back
 *    (`yPercent: -45`) — two images that appear to shove each other up the
 *    screen. The next panel only starts rising once the current push is
 *    almost finished (a small overlap, not an early cut), so the hand-off
 *    reads as a continuous shove rather than an abrupt swap.
 *  - Text metamorphosis: exactly at the geometric midpoint of that
 *    hand-off, the outgoing panel's text fades out and the incoming one
 *    fades in, in the exact same on-screen position — the numbering,
 *    headline and details change, but nothing physically moves.
 *  - Lenis drives the actual smooth-scroll feel; GSAP's ticker drives
 *    Lenis's raf loop (the documented Lenis+GSAP integration) so
 *    ScrollTrigger and the smoothing never fight each other.
 */

const PANELS = [
  {
    universe: universes[0],
    eyebrow: '01 · Votes',
    headline: 'Chaque voix compte,',
    accent: 'et chaque voix se compte.',
    body:
      "Des scrutins certifiés, du concours de talents à l'élection associative — un procès-verbal en fin de vote, aucune contestation possible.",
    cta: 'Découvrir les votes',
    tone: 'orange',
  },
  {
    universe: universes[1],
    eyebrow: '02 · Billetterie',
    headline: 'Vos billets voyagent',
    accent: 'aussi vite que Mobile Money.',
    body:
      "Concert, conférence, atelier : votre page, vos catégories de billets, un QR envoyé en direct sur WhatsApp — contrôle d'accès à l'entrée en un scan.",
    cta: 'Découvrir la billetterie',
    tone: 'blue',
  },
  {
    universe: universes[2],
    eyebrow: '03 · Dons & cagnottes',
    headline: 'Une cause,',
    accent: 'une communauté qui répond.',
    body:
      'Que ce soit pour une urgence médicale, une ONG, un mariage ou une funéraille : lancez la collecte en trois minutes, chaque contribution est visible en temps réel.',
    cta: 'Ouvrir une cagnotte',
    tone: 'orange',
  },
  {
    universe: universes[3],
    eyebrow: '04 · Crowdfunding',
    headline: "L'idée d'un seul,",
    accent: 'financée par plusieurs.',
    body:
      "Portez votre projet devant votre communauté avec un objectif clair, des paliers et une progression suivie — les fonds ne sont libérés que si le seuil promis est atteint.",
    cta: 'Lancer un projet',
    tone: 'blue',
  },
  {
    universe: universes[4],
    eyebrow: '05 · Sponsoring',
    headline: 'Faites entrer',
    accent: 'les marques dans votre histoire.',
    body:
      "Constituez un dossier — audience, budget recherché, contreparties — et proposez-le aux marques prêtes à s'associer à votre événement, en toute transparence.",
    cta: 'Chercher un sponsor',
    tone: 'orange',
  },
  {
    universe: universes[5],
    eyebrow: '06 · Concours & tombolas',
    headline: 'Un tirage sans doute,',
    accent: 'un gagnant sans contestation.',
    body:
      'Algorithme de tirage vérifiable, procès-verbal automatique, désignation publique du gagnant : tout est prévu pour que personne ne remette le résultat en question.',
    cta: 'Organiser un tirage',
    tone: 'blue',
  },
];

// Timeline formula constants — see the file-level comment above.
const INTRO_DURATION = 1; // panel 0's scale-to-fullscreen intro
const STAGGER = 0.92; // next panel starts this far into the previous rise
const RISE_DURATION = 1;
const PUSH_Y = -45; // percent — how far a covered panel recedes
const META_DURATION = 0.15;
const SCROLL_PX_PER_UNIT = 1100;

function StaticHeroLayer() {
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const id = requestAnimationFrame(() => {
      v.play().catch(() => {});
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="absolute inset-0 bg-ink-900">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        className="absolute inset-0 w-full h-full object-cover scale-105 blur-[2px] opacity-60"
      >
        <source src={media.heroVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900/70 via-ink-900/45 to-ink-900/85" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/50 via-transparent to-transparent" />
      {/* Smooth hand-off into the next (white) section, exactly as before. */}
      <div className="absolute inset-x-0 bottom-0 h-40 sm:h-56 bg-gradient-to-b from-transparent to-white pointer-events-none" />
      <div className="relative h-full flex items-center justify-center px-5 sm:px-6 lg:px-8 text-center">
        <div className="max-w-6xl mx-auto w-full">
          <h1
            className="text-white leading-[1.06] sm:leading-[1.0]"
            style={{ fontSize: 'clamp(2.1rem, 8vw, 5.2rem)' }}
          >
            <span className="block">De l'idée à l'événement,</span>
            <span className="block bg-gradient-to-r from-primary-300 to-primary-100 bg-clip-text text-transparent">
              en un clic
            </span>
          </h1>
          <p className="mt-6 sm:mt-7 text-sm sm:text-lg md:text-xl text-white/85 normal-case max-w-xl sm:max-w-2xl mx-auto">
            Chaque événement raconte une histoire. Moledi Event vous aide à
            l'écrire, du premier billet, du premier vote, du premier don, au
            dernier applaudissement.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-row items-stretch justify-center gap-3 sm:gap-4 px-2">
            <a href="/inscription" className="btn btn-primary flex-1 sm:flex-initial px-5 sm:px-8 py-3 sm:py-3.5">
              Créer un événement
            </a>
            <a href="/evenements" className="btn btn-light flex-1 sm:flex-initial px-5 sm:px-8 py-3 sm:py-3.5">
              Parcourir les événements
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Image-only layer — no text inside. Panel 0 is full-bleed (it grows to
// cover the whole screen); every other panel sits on a slightly inset,
// rounded frame so a sliver of what's behind is visible while it's still
// mid-rise, instead of a hard full-screen cut.
function ImageLayer({ panel, index, panelRef }) {
  const isIntro = index === 0;
  return (
    <div
      ref={panelRef}
      className={`absolute bg-ink-900 overflow-hidden ${
        isIntro ? 'inset-0' : 'inset-[3%] sm:inset-[4%] rounded-[1.75rem] sm:rounded-[2.5rem] shadow-2xl'
      }`}
      style={{ willChange: 'transform', backfaceVisibility: 'hidden', transformOrigin: '50% 50%' }}
    >
      <img src={panel.universe.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900/50 via-ink-900/25 to-ink-900/65" />
    </div>
  );
}

// Fixed text layer — every panel's content lives in the exact same spot;
// only opacity crossfades between them, driven entirely by GSAP (never by
// React state), so nothing ever "travels" with the sliding images behind
// it.
function PanelContent({ panel, contentRef }) {
  const isBlue = panel.tone === 'blue';
  const btnClass = isBlue ? 'btn-secondary' : 'btn-primary';
  const chips = [panel.universe.nested.how.image, panel.universe.nested.who.image, panel.universe.nested.trust.image];

  return (
    <div
      ref={contentRef}
      className="absolute inset-0 h-full flex items-center px-6 sm:px-10 md:px-16 lg:px-24"
      style={{ willChange: 'opacity' }}
    >
      <div className="max-w-3xl">
        <span
          className={`btn ${btnClass} !inline-flex !px-4 !py-1.5 !text-xs sm:!text-sm mb-6 sm:mb-8`}
          style={{ transform: 'rotate(-3deg)' }}
        >
          {panel.eyebrow}
        </span>
        <h2
          className="normal-case font-heading text-white mb-6 sm:mb-8 tracking-tight"
          style={{ fontSize: 'clamp(1.9rem, 5.2vw, 4.5rem)', lineHeight: 1.05 }}
        >
          <span className="block">{panel.headline}</span>
          <span
            className={`block bg-clip-text text-transparent ${
              isBlue
                ? 'bg-gradient-to-r from-secondary-100 via-white to-secondary-100'
                : 'bg-gradient-to-r from-primary-100 via-white to-primary-100'
            }`}
          >
            {panel.accent}
          </span>
        </h2>
        <p className="text-white/85 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl normal-case mb-8 sm:mb-10">
          {panel.body}
        </p>
        <div className="flex items-center gap-5 sm:gap-6 flex-wrap">
          <a href="/inscription" className={`btn ${btnClass}`}>
            {panel.cta}
            <span aria-hidden>→</span>
          </a>
          <div className="hidden sm:flex -space-x-3">
            {chips.map((src, ci) => (
              <img
                key={ci}
                src={src}
                alt=""
                className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-lg"
                style={{ transform: `rotate(${(ci - 1) * 9}deg)` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ParallaxStory() {
  const sectionRef = useRef(null);
  const panelRefs = useRef([]);
  const contentRefs = useRef([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panels = panelRefs.current;
      const contents = contentRefs.current;

      gsap.set(panels[0], { scale: 0.4 });
      gsap.set(panels.slice(1), { yPercent: 100 });
      // Panel 0's text is visible from the very start (nothing to hand off
      // from except the static hero) and never moves.
      gsap.set(contents[0], { opacity: 1, pointerEvents: 'auto' });
      gsap.set(contents.slice(1), { opacity: 0, pointerEvents: 'none', attr: { 'aria-hidden': 'true' } });

      const tl = gsap.timeline({ defaults: { ease: 'none' } });

      // Panel 0: image grows from a small centred frame to full-screen,
      // then holds — this is the "wait for it to fill the page" beat
      // before any real scroll-driven motion starts.
      tl.to(panels[0], { scale: 1, duration: INTRO_DURATION, ease: 'power2.out' }, 0);

      PANELS.forEach((_, i) => {
        if (i === 0) return;
        const startTime = INTRO_DURATION + (i - 1) * STAGGER;

        tl.to(panels[i], { yPercent: 0, duration: RISE_DURATION }, startTime);
        tl.to(panels[i - 1], { yPercent: PUSH_Y, duration: RISE_DURATION }, startTime);

        const intersectTime = startTime + RISE_DURATION * 0.5;
        const half = META_DURATION / 2;
        tl.to(contents[i - 1], { opacity: 0, duration: META_DURATION, ease: 'power2.inOut' }, intersectTime - half);
        tl.to(contents[i], { opacity: 1, duration: META_DURATION, ease: 'power2.inOut' }, intersectTime - half);
        tl.set(contents[i - 1], { pointerEvents: 'none', attr: { 'aria-hidden': 'true' } }, intersectTime);
        tl.set(contents[i], { pointerEvents: 'auto', attr: { 'aria-hidden': 'false' } }, intersectTime);
      });

      const totalUnits = INTRO_DURATION + (PANELS.length - 2) * STAGGER + RISE_DURATION;

      ScrollTrigger.create({
        animation: tl,
        trigger: sectionRef.current,
        start: 'top top',
        end: () => `+=${totalUnits * SCROLL_PX_PER_UNIT}`,
        scrub: 1,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[100svh] overflow-hidden"
      aria-label="Les univers de Moledi Event"
    >
      <StaticHeroLayer />
      {PANELS.map((panel, i) => (
        <ImageLayer key={panel.universe.id} panel={panel} index={i} panelRef={(el) => (panelRefs.current[i] = el)} />
      ))}
      {/* Fixed text layer sits above every image layer and never moves. */}
      <div className="absolute inset-0 z-30">
        {PANELS.map((panel, i) => (
          <PanelContent key={panel.universe.id} panel={panel} contentRef={(el) => (contentRefs.current[i] = el)} />
        ))}
      </div>
    </section>
  );
}

/**
 * Header wrapper — translucent once the visitor has scrolled past the very
 * top of the pinned story, so it never fights the panels' own imagery for
 * contrast.
 */
function ScrolledHeaderShell() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div
      className={`fixed top-0 inset-x-0 z-[60] transition-colors duration-300 ${
        scrolled
          ? '[&_header]:!bg-white/40 [&_header]:!backdrop-blur-md [&_header]:!border-white/30'
          : '[&_header]:!bg-transparent [&_header]:!border-transparent'
      }`}
    >
      <SiteHeader activeHref="/" />
    </div>
  );
}

// Lenis drives the actual smooth-scroll feel for this page; GSAP's own
// ticker drives Lenis's raf loop (the integration Lenis's docs recommend
// for use alongside GSAP/ScrollTrigger) so the two never fight for control
// of the scroll position.
function useLenisScroll() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
}

function Home1() {
  useLenisScroll();

  return (
    <>
      <SparkleCursor />
      <ScrolledHeaderShell />
      <main>
        <ParallaxStory />
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

export default Home1;
