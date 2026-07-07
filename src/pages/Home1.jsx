import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import SiteHeader from '../components/SiteHeader';
import Footer from '../components/Footer';
import {
  Hero,
  FeaturedMarquee,
  ShowcaseMarquee,
  HowTimeline,
  Coverage,
  PricingTeaser,
  SparkleCursor,
  universes,
} from './Home2';

/**
 * Proposition 1 for the storytelling section: instead of the ZUI 6-universes
 * zoom animation, six full-viewport panels stack vertically. Each panel's
 * background image scrolls slower than the panel itself (parallax), so a new
 * panel physically pushes over the previous one from the bottom. Text is
 * centered inside each panel and moves at the natural scroll speed.
 *
 * Bug notes vs. the reference PHP snippet:
 *  - Original used a single scroll-jacked GSAP timeline that made every image
 *    animate at once, which is what created the "everything covers the screen
 *    early" glitch. Here each panel owns its own ScrollTrigger-free framer
 *    `useScroll({ target })`, so a panel only moves while it's actually in
 *    the viewport — no cross-contamination.
 *  - The text metamorphosis is per-panel too, not a shared stack, so there's
 *    no visible "seam" where two texts overlap.
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

function ParallaxPanel({ panel, index, total }) {
  const ref = useRef(null);
  // `start end` = panel's top touches viewport bottom; `end start` = panel's
  // bottom touches viewport top. We drive the image's Y from 15% (below its
  // natural position, hidden by the previous panel) up to -15% (past the
  // top). Because the panel itself scrolls at 100%, a subject-of-the-image
  // moves at 70% of scroll speed — a soft parallax that keeps the image on
  // the screen long enough to breathe.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['15%', '-15%']);
  // Text moves at scroll speed (already true because it sits inside the
  // panel), but we fade + shift it in at the very start of the panel and out
  // at the very end so the metamorphosis reads as a hand-off, not a scroll.
  const textOpacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.85, 1],
    [0, 1, 1, 0],
  );
  const textY = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [40, 0, 0, -40],
  );

  const isBlue = panel.tone === 'blue';

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{
        height: '100vh',
        // Give the last panel a natural exit into the next section — no need
        // to pin, the flow of full-viewport blocks already produces the
        // stack.
        marginBottom: index === total - 1 ? 0 : 0,
      }}
    >
      {/* Parallax background image */}
      <motion.div
        style={{ y: imageY }}
        className="absolute inset-x-0 -top-[15%] h-[130%] will-change-transform"
      >
        <img
          src={panel.universe.image}
          alt=""
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900/55 via-ink-900/40 to-ink-900/70" />

      {/* Content, vertically centered within THIS panel (not sticky
          across the whole page) — that's what produces the "text moves
          with the section" behavior described in the spec. */}
      <motion.div
        style={{ opacity: textOpacity, y: textY }}
        className="relative h-full flex items-center px-6 sm:px-10 md:px-16 lg:px-24"
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
          <h2 className="normal-case font-heading text-white text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6 sm:mb-8 tracking-tight">
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
              isBlue
                ? 'bg-white text-secondary-300'
                : 'bg-white text-primary-600'
            }`}
          >
            {panel.cta}
            <span aria-hidden>→</span>
          </a>
        </div>
      </motion.div>

      {/* Small floating catalogue card, bottom-left — same idea as the
          reference PHP mock. Only shown from `sm` up: on mobile the
          content column already fills the width, no room for a corner
          card without stepping on the CTA. */}
      <div className="hidden sm:flex absolute left-6 md:left-10 lg:left-16 bottom-8 md:bottom-10 z-10 items-center gap-3 pl-3 pr-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-sm text-ink-900 shadow-xl">
        <img
          src={panel.universe.image}
          alt=""
          className="w-11 h-11 rounded-xl object-cover"
        />
        <div className="text-left">
          <p className="text-[11px] uppercase tracking-wide text-ink-700 font-semibold">
            Catalogue {panel.universe.label}
          </p>
          <p className="text-xs text-ink-900 font-semibold">
            Télécharger ↓
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Header wrapper for Home1 — SiteHeader already switches to solid on
 * scroll, but on top of the panel section we want an even softer, more
 * translucent bar to avoid competing with the images. This wrapper toggles
 * a class that overrides the default background once we've scrolled past
 * the Hero.
 */
function ScrolledHeaderShell() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 200);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div
      className={`fixed top-0 inset-x-0 z-[60] transition-colors duration-300 ${
        scrolled
          ? '[&_header]:!bg-white/40 [&_header]:!backdrop-blur-md [&_header]:!border-white/30'
          : ''
      }`}
    >
      <SiteHeader activeHref="/" />
    </div>
  );
}

function Home1() {
  return (
    <>
      <SparkleCursor />
      <ScrolledHeaderShell />
      <main>
        <Hero />
        {/* PROPOSITION 1 — Parallax stacked panels */}
        <div className="relative">
          {PANELS.map((p, i) => (
            <ParallaxPanel key={p.universe.id} panel={p} index={i} total={PANELS.length} />
          ))}
        </div>
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
