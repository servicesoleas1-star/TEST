// pages/HowItWorksPageV2.jsx — Route publique : /comment-ca-marche/v2
//
// Refonte complète de HowItWorksPage.jsx (V1, conservée intacte à
// /comment-ca-marche) : même source de données (config/eventTypesConfig,
// howItWorksConfig, faqConfig — inchangées, réutilisées telles quelles),
// mais présentation entièrement retravaillée : hero animé, blocs qui
// glissent à l'écran en alternance gauche/droite avec de vraies images,
// FAQ complète, CTAs alignés sur la charte de la page d'accueil.

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import Footer from '../components/Footer';
import AnimatedSection from '../components/AnimatedSection';
import HowItWorksBlock from '../components/HowItWorksBlock';
import FAQAccordion from '../components/FAQAccordion';
import { getAvailableEventTypes } from '../components/config/eventTypesConfig';
import { getHowItWorksContent } from '../components/config/howItWorksConfig';
import { fetchAllFAQ, getGlobalFAQ } from '../components/config/faqConfig';
import { illustration } from '../config/media';

const TYPE_IMAGE = {
  POLL: illustration.votes,
  EVENT: illustration.ticketing,
  DONATION: illustration.donations,
  CROWDFUNDING: illustration.crowdfunding,
  SPONSORING: illustration.sponsoring,
  CONTEST: illustration.contests,
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
      <div className="pointer-events-none absolute bottom-0 right-0 w-[30rem] h-[30rem] rounded-full bg-secondary/10 blur-[120px]" />
      <div className="relative max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-primary font-semibold tracking-[0.25em] uppercase text-[11px] sm:text-xs mb-4"
        >
          Guide complet
        </motion.p>
        <h1 className="text-ink-900 font-heading leading-[1.05]" style={{ fontSize: 'clamp(2.2rem, 7vw, 4.5rem)' }}>
          <WordsReveal text="Comment ça marche" />
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6 text-ink-700 text-sm sm:text-lg normal-case max-w-2xl mx-auto"
        >
          De la création de votre page au versement de vos fonds : voici, étape par étape et type de
          campagne par type de campagne, exactement comment fonctionne Moledi Event.
        </motion.p>
      </div>
    </section>
  );
}

function TypeBlock({ eventType, index, allFaqs }) {
  const rightSide = index % 2 === 1;
  const content = getHowItWorksContent(eventType.type);
  if (!content) return null;

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center py-12 sm:py-16 ${
      rightSide ? 'lg:[&>*:first-child]:order-2' : ''
    }`}>
      <motion.div
        initial={{ opacity: 0, x: rightSide ? 60 : -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-15% 0px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl overflow-hidden border border-ink-200 shadow-xl aspect-[16/11]"
      >
        <img src={TYPE_IMAGE[eventType.type]} alt={content.title} className="w-full h-full object-cover" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15% 0px' }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <HowItWorksBlock content={content} faqItems={getGlobalFAQ(allFaqs, eventType.faqType)} />
      </motion.div>
    </div>
  );
}

export default function HowItWorksPageV2() {
  const availableTypes = getAvailableEventTypes();
  const [allFaqs, setAllFaqs] = useState([]);
  useEffect(() => {
    fetchAllFAQ().then(setAllFaqs);
  }, []);
  const generalFAQ = getGlobalFAQ(allFaqs, 'HOW_IT_WORKS');

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader activeHref="/comment-ca-marche" />
      <Hero />

      <main>
        <section className="bg-ink-100/60 py-4">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center pt-12 sm:pt-16">
              <p className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-2">
                Par type de campagne
              </p>
              <h2 className="text-3xl sm:text-5xl text-ink-900">Le détail, campagne par campagne</h2>
              <p className="text-ink-700 normal-case mt-4 max-w-xl mx-auto">
                Fonctionnement, frais et reversements pour chaque type de campagne disponible sur la plateforme.
              </p>
            </AnimatedSection>
            <div className="divide-y divide-ink-200">
              {availableTypes.map((eventType, i) => (
                <TypeBlock key={eventType.type} eventType={eventType} index={i} allFaqs={allFaqs} />
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <AnimatedSection className="text-center mb-10">
            <p className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-2">
              Questions fréquentes
            </p>
            <h2 className="text-3xl sm:text-5xl text-ink-900">Toutes vos questions, une réponse</h2>
          </AnimatedSection>
          <AnimatedSection>
            <FAQAccordion items={generalFAQ} />
          </AnimatedSection>
        </section>

        <section className="pb-20 sm:pb-28">
          <AnimatedSection className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <a href="/inscription" className="btn btn-primary">
              Créer mon événement <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a href="/contact" className="btn btn-light !border !border-ink-200 !text-ink-900">
              Contacter l'équipe
            </a>
          </AnimatedSection>
        </section>
      </main>

      <Footer />
    </div>
  );
}
