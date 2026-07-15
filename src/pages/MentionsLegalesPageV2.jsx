// pages/MentionsLegalesPageV2.jsx — Route publique : /mentions-legales/v2
//
// Refonte complète de MentionsLegalesPage.jsx (V1, conservée intacte à
// /mentions-legales) : même source de contenu (legalPagesConfig.js,
// type LEGAL_NOTICE — texte désormais complet et réel, voir ce fichier),
// mais présentation en cartes structurées avec animations au scroll plutôt
// qu'un simple bloc de texte.

import { motion } from 'framer-motion';
import { Building2, Server, Copyright, ShieldCheck, Cookie, Scale, Gavel } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import Footer from '../components/Footer';
import AnimatedSection from '../components/AnimatedSection';
import { getLegalPage } from '../components/config/legalPagesConfig';

const SECTION_ICONS = [Building2, Server, Copyright, ShieldCheck, Cookie, ShieldCheck, Scale, Gavel];

function parseSections(content) {
  // Le contenu est découpé en paragraphes "N. Titre\nCorps" séparés par
  // \n\n -- on isole le préambule (avant la première section numérotée) du
  // reste, pour donner un vrai chapô en haut de page.
  const blocks = content.split('\n\n');
  const preamble = blocks[0];
  const sections = blocks.slice(1).map((block) => {
    const match = block.match(/^(\d+)\.\s(.+?)\n([\s\S]*)$/);
    if (!match) return { number: null, title: null, body: block };
    return { number: match[1], title: match[2], body: match[3] };
  });
  return { preamble, sections };
}

function WordsReveal({ text, className = '' }) {
  const words = text.split(' ');
  return (
    <span className={className}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 + i * 0.07 }}
        >
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </span>
  );
}

export default function MentionsLegalesPageV2() {
  const page = getLegalPage('LEGAL_NOTICE');
  const { preamble, sections } = parseSections(page.content);

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader activeHref="/mentions-legales" />

      <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-20 overflow-hidden bg-white">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[50rem] h-[30rem] rounded-full bg-secondary/10 blur-[130px]" />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-primary font-semibold tracking-[0.25em] uppercase text-[11px] sm:text-xs mb-4"
          >
            Informations légales
          </motion.p>
          <h1 className="text-ink-900 font-heading leading-[1.05]" style={{ fontSize: 'clamp(2rem, 6vw, 3.6rem)' }}>
            <WordsReveal text="Mentions légales" />
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-5 text-ink-700 text-sm normal-case max-w-xl mx-auto"
          >
            {preamble}
          </motion.p>
          <p className="mt-4 text-ink-700/50 text-xs">Dernière mise à jour : {page.updatedAtLabel}</p>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="space-y-6">
          {sections.map((section, i) => {
            const Icon = SECTION_ICONS[i % SECTION_ICONS.length];
            return (
              <AnimatedSection key={section.number || i} className="rounded-3xl border border-ink-200 p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 shrink-0 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl text-ink-900 normal-case font-semibold mb-2">
                      {section.title}
                    </h2>
                    <p className="text-ink-700 text-sm leading-relaxed normal-case whitespace-pre-line">
                      {section.body}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
