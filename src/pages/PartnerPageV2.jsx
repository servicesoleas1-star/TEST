// pages/PartnerPageV2.jsx — Route publique : /partenaire/v2
//
// Refonte complète de PartnerPage.jsx (V1, conservée intacte à
// /partenaire) : même source de types de partenariat (partnershipTypesConfig,
// inchangée) et même formulaire de candidature (PartnerApplicationForm,
// logique/validation inchangées), mais présentation entièrement retravaillée.

import { motion } from 'framer-motion';
import { Megaphone, Cpu, Handshake, Sparkles } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import Footer from '../components/Footer';
import AnimatedSection from '../components/AnimatedSection';
import PartnerApplicationForm from '../components/PartnerApplicationForm';
import { getPartnershipTypes } from '../components/config/partnershipTypesConfig';

const ICONS = {
  MEDIA: Megaphone,
  TECHNOLOGIQUE: Cpu,
  COMMERCIAL: Handshake,
  SPONSORING: Sparkles,
};

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

function Hero() {
  return (
    <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-24 overflow-hidden bg-white">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[40rem] rounded-full bg-primary/10 blur-[140px]" />
      <div className="relative max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-primary font-semibold tracking-[0.25em] uppercase text-[11px] sm:text-xs mb-4"
        >
          Écosystème
        </motion.p>
        <h1 className="text-ink-900 font-heading leading-[1.05]" style={{ fontSize: 'clamp(2.2rem, 7vw, 4.5rem)' }}>
          <WordsReveal text="Devenir partenaire" />
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 text-ink-700 text-sm sm:text-lg normal-case max-w-2xl mx-auto"
        >
          Rejoignez l'écosystème Moledi Event et construisons ensemble des campagnes plus fortes,
          plus visibles et plus impactantes.
        </motion.p>
      </div>
    </section>
  );
}

function TypeCard({ type, index }) {
  const Icon = ICONS[type.value] || Sparkles;
  const isBlue = index % 2 === 1;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-3xl border border-ink-200 p-6 sm:p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white"
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${
          isBlue ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
        }`}
      >
        <Icon size={22} aria-hidden="true" />
      </div>
      <h3 className="text-lg sm:text-xl text-ink-900 mb-2 normal-case font-semibold">{type.label}</h3>
      <p className="text-ink-700 text-sm leading-relaxed normal-case">{type.description}</p>
    </motion.div>
  );
}

export default function PartnerPageV2() {
  const partnershipTypes = getPartnershipTypes();

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader activeHref="/partenaire" />
      <Hero />

      <main>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <AnimatedSection className="text-center mb-12">
            <p className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-2">
              4 façons de collaborer
            </p>
            <h2 className="text-3xl sm:text-5xl text-ink-900">Un partenariat à la mesure de vos objectifs</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {partnershipTypes.map((t, i) => (
              <TypeCard key={t.value} type={t} index={i} />
            ))}
          </div>
        </section>

        <section className="bg-ink-100/60 py-16 sm:py-24">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-10">
              <p className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-2">
                Candidature
              </p>
              <h2 className="text-3xl sm:text-5xl text-ink-900">Proposer un partenariat</h2>
              <p className="text-ink-700 normal-case mt-4">
                Décrivez votre projet, notre équipe revient vers vous sous 48h ouvrées.
              </p>
            </AnimatedSection>
            <AnimatedSection className="rounded-3xl border border-ink-200 bg-white p-6 sm:p-8 shadow-xl">
              <PartnerApplicationForm />
            </AnimatedSection>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
