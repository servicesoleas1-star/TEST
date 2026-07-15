// pages/AboutPageV2.jsx — Route publique : /a-propos/v2
//
// Refonte complète de AboutPage.jsx (V1, conservée intacte à /a-propos) :
// mêmes sources de données (aboutConfig, kpiConfig — inchangées), mais
// storytelling avancé avec animations au scroll, imagerie réelle et un
// habillage aligné sur la page d'accueil, là où la V1 était un simple
// empilement de texte centré.

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import Footer from '../components/Footer';
import AnimatedSection from '../components/AnimatedSection';
import TeamMemberCard from '../components/TeamMemberCard';
import { getAboutContent } from '../components/config/aboutConfig';
import { getAvailableEventTypes } from '../components/config/eventTypesConfig';
import { getHowItWorksContent } from '../components/config/howItWorksConfig';
import { illustration } from '../config/media';

const STORY_IMAGES = [illustration.howGeneric, illustration.trust, illustration.audience];

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
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[40rem] rounded-full bg-secondary/10 blur-[140px]" />
      <div className="relative max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-primary font-semibold tracking-[0.25em] uppercase text-[11px] sm:text-xs mb-4"
        >
          Notre histoire
        </motion.p>
        <h1 className="text-ink-900 font-heading leading-[1.05]" style={{ fontSize: 'clamp(2.2rem, 7vw, 4.5rem)' }}>
          <WordsReveal text="À propos de Moledi Event" />
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6 text-ink-700 text-sm sm:text-lg normal-case max-w-2xl mx-auto"
        >
          Une plateforme pensée en Afrique, pour l'Afrique — votes, événements, cagnottes et
          crowdfunding, réunis autour du Mobile Money.
        </motion.p>
      </div>
    </section>
  );
}

function StoryRow({ title, text, image, index }) {
  const rightSide = index % 2 === 1;
  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center py-12 sm:py-16 ${
        rightSide ? 'lg:[&>*:first-child]:order-2' : ''
      }`}
    >
      <motion.div
        initial={{ opacity: 0, x: rightSide ? 60 : -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-15% 0px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl overflow-hidden border border-ink-200 shadow-xl aspect-[16/11]"
      >
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15% 0px' }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <h2 className="text-2xl sm:text-4xl text-ink-900 mb-4 normal-case">{title}</h2>
        <p className="text-ink-700 text-sm sm:text-lg leading-relaxed normal-case max-w-md">{text}</p>
      </motion.div>
    </div>
  );
}

function CampaignTypeCard({ eventType }) {
  const detail = getHowItWorksContent(eventType.type);
  if (!detail) return null;

  return (
    <AnimatedSection className="rounded-3xl border border-ink-200 bg-white p-8">
      <h3 className="text-lg sm:text-xl text-ink-900 mb-2 normal-case">{detail.title}</h3>
      <p className="text-ink-700 text-sm leading-relaxed normal-case">{detail.description}</p>
    </AnimatedSection>
  );
}

export default function AboutPageV2() {
  const content = getAboutContent();
  const campaignTypes = getAvailableEventTypes();

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader activeHref="/a-propos" />
      <Hero />

      <main>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="divide-y divide-ink-200">
            <StoryRow title={content.histoire.title} text={content.histoire.text} image={STORY_IMAGES[0]} index={0} />
            <StoryRow title={content.mission.title} text={content.mission.text} image={STORY_IMAGES[1]} index={1} />
            <StoryRow title={content.vision.title} text={content.vision.text} image={STORY_IMAGES[2]} index={2} />
          </div>
        </section>

        {/* Nos types de campagnes */}
        <section className="bg-ink-50 py-16 sm:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-12">
              <p className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-2">Le catalogue</p>
              <h2 className="text-3xl sm:text-5xl text-ink-900">Nos types de campagnes</h2>
              <p className="mt-4 text-ink-700 text-sm sm:text-base normal-case max-w-xl mx-auto">
                Une seule plateforme pour tous vos besoins de campagnes participatives, du scrutin
                au crowdfunding.
              </p>
            </AnimatedSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {campaignTypes.map((eventType) => (
                <CampaignTypeCard key={eventType.type} eventType={eventType} />
              ))}
            </div>
          </div>
        </section>

        {/* Équipe -- masquable, comme en V1 */}
        {content.showTeamSection && content.team.length > 0 && (
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <AnimatedSection className="text-center mb-12">
              <p className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-2">L'équipe</p>
              <h2 className="text-3xl sm:text-5xl text-ink-900">Les personnes derrière Moledi Event</h2>
            </AnimatedSection>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              {content.team.map((member, i) => (
                <AnimatedSection key={member.id} className={i % 2 === 1 ? 'sm:mt-8' : ''}>
                  <TeamMemberCard member={member} />
                </AnimatedSection>
              ))}
            </div>
          </section>
        )}

        {/* Partenaires technologiques -- masquée si vide, comme en V1 */}
        {content.partenairesTechnologiques.length > 0 && (
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
            <AnimatedSection className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl text-ink-900">Partenaires technologiques</h2>
            </AnimatedSection>
            <AnimatedSection className="flex flex-wrap items-center justify-center gap-8">
              {content.partenairesTechnologiques.map((partner) => (
                <img key={partner.id} src={partner.logoUrl} alt={partner.name} className="h-10 object-contain grayscale" />
              ))}
            </AnimatedSection>
          </section>
        )}

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
