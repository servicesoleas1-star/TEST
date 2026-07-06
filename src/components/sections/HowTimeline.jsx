import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { illustration } from '../../config/media';

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

function HowTimeline() {
  const rootRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ['start 0.9', 'end 0.15'],
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

export default HowTimeline;
