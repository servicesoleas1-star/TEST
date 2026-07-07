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
 * Storytelling section — "push parallax stack" (à la floema.com), ported
 * faithfully from the reference GSAP/Lenis timeline the client provided:
 *
 *  - ONE pinned, fixed-camera section. Every panel is `position:absolute`,
 *    stacked on top of a static hero layer that never moves.
 *  - Each panel starts fully below the viewport (`yPercent: 100`) and rises
 *    to `yPercent: 0`. Panel `i` starts at `startTime = i * 0.85` (a unit
 *    timeline, not real seconds — ScrollTrigger's `scrub` maps scroll
 *    distance onto it), duration `1`. Because the next panel starts before
 *    the current one finishes (0.85 < 1), there's a real overlap window
 *    where the incoming panel visibly slides up OVER the previous one.
 *  - The previous panel is simultaneously pushed further back
 *    (`yPercent: -30`) during that same window — the "push" in push
 *    parallax: it doesn't just sit still and get covered, it recedes.
 *  - Text/card metamorphosis: the outgoing panel's text+card fades/slides
 *    out and the incoming one fades/slides in, both centered exactly on
 *    `intersectTime = startTime + 0.5` (the geometric crossing point),
 *    over a short 0.15 duration — a quick hand-off, not a slow crossfade.
 *  - Frame-0 exception: panel 0 has no previous panel's text to hand off
 *    from (only the static hero underneath), so its image + text + card
 *    all rise together as a single block, no separate fade.
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
const STAGGER = 0.85;
const RISE_DURATION = 1;
const PUSH_Y = -30; // percent
const META_DURATION = 0.15;
const SCROLL_PX_PER_UNIT = 900;

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
    <div className="absolute inset-0 bg-ink-900" aria-hidden={false}>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster={media.heroPoster}
        className="absolute inset-0 w-full h-full object-cover scale-105 blur-[2px] opacity-60"
      >
        <source src={media.heroVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900/70 via-ink-900/45 to-ink-900/85" />
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

function StoryPanel({ panel, index, panelRef, contentRef }) {
  const isBlue = panel.tone === 'blue';

  return (
    <div
      ref={panelRef}
      className="absolute inset-0 bg-ink-900"
      style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
    >
      <img src={panel.universe.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900/55 via-ink-900/40 to-ink-900/70" />

      <div
        ref={contentRef}
        className="relative h-full flex items-center px-6 sm:px-10 md:px-16 lg:px-24"
        style={{ willChange: 'opacity, transform' }}
      >
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <span
              className={`text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase ${
                isBlue ? 'text-secondary-100' : 'text-primary-100'
              }`}
            >
              {panel.eyebrow}
            </span>
            <span className="h-px w-12 sm:w-16 bg-white/50" />
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-white/10 backdrop-blur-sm border border-white/25 text-white">
              {panel.universe.label}
            </span>
          </div>
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
          <a
            href="/inscription"
            className={`inline-flex items-center gap-2 rounded-full px-6 py-3 sm:px-7 sm:py-3.5 text-sm sm:text-base font-semibold transition-transform hover:scale-[1.03] active:scale-95 ${
              isBlue ? 'bg-white text-secondary-300' : 'bg-white text-primary-600'
            }`}
          >
            {panel.cta}
            <span aria-hidden>→</span>
          </a>
        </div>

        {/* Floating catalogue card — part of the same content block, so it
            metamorphoses (fades/slides) in perfect sync with the text. */}
        <div className="hidden sm:flex absolute left-6 md:left-10 lg:left-16 bottom-8 md:bottom-10 items-center gap-3 pl-3 pr-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-sm text-ink-900 shadow-xl">
          <img src={panel.universe.image} alt="" className="w-11 h-11 rounded-xl object-cover" />
          <div className="text-left">
            <p className="text-[11px] uppercase tracking-wide text-ink-700 font-semibold">
              Catalogue {panel.universe.label}
            </p>
            <p className="text-xs text-ink-900 font-semibold">Télécharger ↓</p>
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

      gsap.set(panels, { yPercent: 100 });
      // Frame-0 exception: panel 0's content is always visible (rises as
      // one block with its image, no separate crossfade needed since
      // there's no previous panel text to hand off from).
      gsap.set(contents[0], { opacity: 1, y: 0 });
      // Every other panel's text/card starts hidden until its own
      // metamorphosis fires.
      gsap.set(contents.slice(1), { opacity: 0, y: 24 });

      const tl = gsap.timeline({ defaults: { ease: 'none' } });

      PANELS.forEach((_, i) => {
        const startTime = i * STAGGER;

        tl.to(panels[i], { yPercent: 0, duration: RISE_DURATION }, startTime);

        if (i > 0) {
          tl.to(panels[i - 1], { yPercent: PUSH_Y, duration: RISE_DURATION }, startTime);

          const intersectTime = startTime + 0.5;
          const half = META_DURATION / 2;
          tl.to(
            contents[i - 1],
            { opacity: 0, y: -24, duration: META_DURATION, ease: 'power2.inOut' },
            intersectTime - half
          );
          tl.to(
            contents[i],
            { opacity: 1, y: 0, duration: META_DURATION, ease: 'power2.inOut' },
            intersectTime - half
          );
          // Accessibility: only the panel currently "readable" (post
          // crossfade) is exposed to assistive tech / tab order — driven by
          // GSAP itself so it never fights React for control of this
          // pinned subtree.
          tl.set(contents[i - 1], { attr: { 'aria-hidden': 'true' } }, intersectTime);
          tl.set(contents[i], { attr: { 'aria-hidden': 'false' } }, intersectTime);
        }
      });

      const totalUnits = (PANELS.length - 1) * STAGGER + RISE_DURATION;

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
        <StoryPanel
          key={panel.universe.id}
          panel={panel}
          index={i}
          panelRef={(el) => (panelRefs.current[i] = el)}
          contentRef={(el) => (contentRefs.current[i] = el)}
        />
      ))}
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
