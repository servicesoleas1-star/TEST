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
 * as literally as possible from the client's own reference implementation
 * (GSAP timeline + ScrollTrigger scrub + Lenis):
 *
 *  - ONE pinned, fixed-camera section, three stacked layers: a static hero
 *    at the bottom, an image layer in the middle, a text layer on top.
 *  - Panel 0 is the only panel whose text+mini-chips are NOT fixed: they
 *    ride up together with panel 0's own image (both go from
 *    `yPercent: 100` to `0` over the same duration), covering the static
 *    hero underneath as one solid block — no crossfade for this one.
 *  - From panel 1 onward, `startTime = i * 0.85` (a 15% overlap) — the
 *    panel rises (`yPercent: 100` -> `0`) while the previous one is pushed
 *    further back (`yPercent: -30`). Once a panel is at rest, its text sits
 *    in a fixed position and never moves again — only opacity (plus a
 *    small ±30px shift) crossfades it in/out, exactly at
 *    `intersectTime = startTime + 0.5`, the moment the incoming image's
 *    edge crosses the screen's vertical centre.
 *  - Lenis drives the actual smooth-scroll feel; GSAP's ticker drives
 *    Lenis's raf loop (the integration Lenis's own docs recommend for use
 *    alongside GSAP/ScrollTrigger) so the two never fight for control.
 */

const PANELS = [
  {
    universe: universes[0],
    eyebrow: '01 · Votes',
    headline: 'Chaque voix compte,',
    accent: 'et chaque voix se compte.',
    body:
      "Des scrutins certifiés, du concours de talents à l'élection associative — un procès-verbal en fin de vote, aucune contestation possible.",
    cta: 'Lancer mon concours de vote et scrutin',
    tone: 'orange',
  },
  {
    universe: universes[1],
    eyebrow: '02 · Billetterie',
    headline: 'Vos billets voyagent',
    accent: 'aussi vite que Mobile Money.',
    body:
      "Concert, conférence, atelier : votre page, vos catégories de billets, un QR envoyé en direct sur WhatsApp — contrôle d'accès à l'entrée en un scan.",
    cta: 'Vendre les billets de mon événement',
    tone: 'blue',
  },
  {
    universe: universes[2],
    eyebrow: '03 · Dons & cagnottes',
    headline: 'Une cause,',
    accent: 'une communauté qui répond.',
    body:
      'Que ce soit pour une urgence médicale, une ONG, un mariage ou une funéraille : lancez la collecte en trois minutes, chaque contribution est visible en temps réel.',
    cta: 'Lancer une cagnotte',
    tone: 'orange',
  },
  {
    universe: universes[3],
    eyebrow: '04 · Crowdfunding',
    headline: "L'idée d'un seul,",
    accent: 'financée par plusieurs.',
    body:
      "Portez votre projet devant votre communauté avec un objectif clair, des paliers et une progression suivie — les fonds ne sont libérés que si le seuil promis est atteint.",
    cta: 'Lancer un projet pour me faire financer',
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
      'Jeux-concours, tombolas ou tirages au sort : algorithme vérifiable, procès-verbal automatique, désignation publique du gagnant — tout est prévu pour que personne ne remette le résultat en question.',
    cta: 'Organiser un tirage ou un jeu-concours',
    tone: 'blue',
  },
];

// Timeline formula constants — the exact values from the reference: a
// 0.85 stagger (15% overlap), a full unit-duration rise/push, and a -30%
// recede for whichever panel is being covered.
const STAGGER = 0.85;
const RISE_DURATION = 1;
const PUSH_Y = -30; // percent — how far a covered panel recedes
const META_DURATION = 0.15;
const META_OFFSET = 0.05; // exit starts at intersect-0.05, enter at intersect+0.05
// The push tween for panel i-1 starts before its own rise tween finishes
// (that's the intentional 15% overlap). GSAP's implicit "from" for a
// chained .to() on the same property uses the earlier tween's END value
// (0), not its live-interpolated value at that moment — so without an
// explicit start point the push snapped instantly from ~15% to 0% the
// moment it kicked in. This is the rise's actual live position at the
// overlap point (it's still 15% of the way from 100 to 0 at that instant).
const PUSH_FROM_Y = 100 * (1 - STAGGER / RISE_DURATION);

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

// Image-only layer — no text inside. Every panel is full-bleed, edge to
// edge with the viewport, exactly like panel 0 — none of them are boxed
// into a smaller inset card.
function ImageLayer({ panel, panelRef }) {
  return (
    <div
      ref={panelRef}
      className="absolute inset-0 bg-ink-900 overflow-hidden"
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
      className="absolute inset-0 h-full flex flex-col items-center justify-center text-center px-6 sm:px-10"
      style={{ willChange: 'opacity' }}
    >
      <div className="max-w-3xl flex flex-col items-center">
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
        <div className="flex flex-col items-center gap-5 sm:gap-6">
          <a href="/inscription" className={`btn ${btnClass}`}>
            {panel.cta}
            <span aria-hidden>→</span>
          </a>
          <div className="flex -space-x-3">
            {chips.map((src, ci) => (
              <img
                key={ci}
                src={src}
                alt=""
                className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl object-cover border-2 border-white shadow-lg"
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

      // Every panel starts fully below the viewport.
      gsap.set(panels, { yPercent: 100 });
      // Panel 0's content rides up together with its own image (frame-0
      // exception — nothing to hand off from except the static hero), so it
      // starts hidden below the screen exactly like its image.
      gsap.set(contents[0], { yPercent: 100, opacity: 1, pointerEvents: 'auto' });
      // Every other panel's content is fixed in place from the start —
      // it never travels, only opacity (+ a small px shift) crossfades it.
      gsap.set(contents.slice(1), { opacity: 0, pointerEvents: 'none', attr: { 'aria-hidden': 'true' } });

      const tl = gsap.timeline({ defaults: { ease: 'none' } });

      // Frame-0 exception: image + text/chips rise together, in lockstep,
      // to cover the static hero underneath as one solid block.
      tl.to(panels[0], { yPercent: 0, duration: RISE_DURATION }, 0);
      tl.to(contents[0], { yPercent: 0, duration: RISE_DURATION }, 0);

      PANELS.forEach((_, i) => {
        if (i === 0) return;
        const startTime = i * STAGGER;

        tl.to(panels[i], { yPercent: 0, duration: RISE_DURATION }, startTime);
        // `immediateRender: false` is essential here: `fromTo()` defaults to
        // immediateRender:true, which applies its FROM value to the DOM
        // synchronously the instant this call runs (at build time, long
        // before the timeline ever plays) — that clobbered the earlier
        // `gsap.set(panels, { yPercent: 100 })` baseline before the rise
        // tween even got its first real render, corrupting the whole rise.
        tl.fromTo(
          panels[i - 1],
          { yPercent: PUSH_FROM_Y },
          { yPercent: PUSH_Y, duration: RISE_DURATION, immediateRender: false },
          startTime
        );

        const intersectTime = startTime + RISE_DURATION * 0.5;
        tl.to(
          contents[i - 1],
          { y: -30, opacity: 0, duration: META_DURATION, ease: 'power2.inOut' },
          intersectTime - META_OFFSET
        );
        tl.fromTo(
          contents[i],
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: META_DURATION, ease: 'power2.inOut' },
          intersectTime + META_OFFSET
        );
        tl.set(contents[i - 1], { pointerEvents: 'none', attr: { 'aria-hidden': 'true' } }, intersectTime);
        tl.set(contents[i], { pointerEvents: 'auto', attr: { 'aria-hidden': 'false' } }, intersectTime);
      });

      const totalUnits = (PANELS.length - 1) * STAGGER + RISE_DURATION;

      ScrollTrigger.create({
        animation: tl,
        trigger: sectionRef.current,
        start: 'top top',
        // Scaled off the viewport height (like the reference's `+=600%`
        // for 5 panels), so the pacing stays consistent across screen sizes.
        end: () => `+=${totalUnits * window.innerHeight * 1.35}`,
        // `scrub: true` (not a numeric lag) — Lenis already supplies the
        // smoothing feel; stacking ScrollTrigger's own lag on top of it
        // caused a "rubber band" catch-up where the panel visibly rocketed
        // to its resting position instead of moving at a steady pace.
        scrub: true,
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
        <ImageLayer key={panel.universe.id} panel={panel} panelRef={(el) => (panelRefs.current[i] = el)} />
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
          : '[&_header]:!bg-transparent [&_header]:!border-transparent [&_.hamburger-btn]:!text-white'
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
