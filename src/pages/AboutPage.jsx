// pages/AboutPage.jsx
// Route publique : /a-propos  [MVP]
//
// Assemble : Histoire, Mission, Vision, Équipe (masquable), Partenaires
// technologiques (masquée si vide), Chiffres clés (avec fallback).
// Chaque section est enveloppée dans <AnimatedSection> pour l'effet de
// scroll exigé par le ticket.

import { getAboutContent } from '../components/config/aboutConfig';
import { getAvailableEventTypes } from '../components/config/eventTypesConfig';
import { getHowItWorksContent } from '../components/config/howItWorksConfig';
import AnimatedSection from '../components/AnimatedSection';
import TeamMemberCard from '../components/TeamMemberCard';
import SiteHeader from '../components/SiteHeader';
import Footer from '../components/Footer';

export default function AboutPage() {
  const content = getAboutContent();
  const campaignTypes = getAvailableEventTypes();

  return (
    <div className="min-h-screen bg-white">
    <SiteHeader activeHref="/a-propos" />
    <main className="mx-auto max-w-4xl px-4 pt-28 pb-10 sm:px-6 sm:pt-32 lg:px-8">
      <h1
        className="mb-12 text-center text-4xl font-bold uppercase text-[color:var(--color-ink,#0B1324)] sm:text-5xl"
        style={{ fontFamily: 'Anton, sans-serif' }}
      >
        À propos
      </h1>

      {/* Histoire */}
      <AnimatedSection className="mb-14">
        <h2
          className="mb-3 text-2xl font-bold uppercase text-[color:var(--color-ink,#0B1324)]"
          style={{ fontFamily: 'Anton, sans-serif' }}
        >
          {content.histoire.title}
        </h2>
        <p className="text-[color:var(--color-slate,#475569)]">{content.histoire.text}</p>
      </AnimatedSection>

      {/* Mission + Vision côte à côte sur desktop */}
      <div className="mb-14 grid gap-10 sm:grid-cols-2">
        <AnimatedSection>
          <h2
            className="mb-3 text-2xl font-bold uppercase text-[color:var(--color-ink,#0B1324)]"
            style={{ fontFamily: 'Anton, sans-serif' }}
          >
            {content.mission.title}
          </h2>
          <p className="text-[color:var(--color-slate,#475569)]">{content.mission.text}</p>
        </AnimatedSection>

        <AnimatedSection>
          <h2
            className="mb-3 text-2xl font-bold uppercase text-[color:var(--color-ink,#0B1324)]"
            style={{ fontFamily: 'Anton, sans-serif' }}
          >
            {content.vision.title}
          </h2>
          <p className="text-[color:var(--color-slate,#475569)]">{content.vision.text}</p>
        </AnimatedSection>
      </div>

      {/* Équipe -- section optionnelle/masquable, pilotée par showTeamSection */}
      {content.showTeamSection && content.team.length > 0 && (
        <AnimatedSection className="mb-14">
          <h2
            className="mb-6 text-2xl font-bold uppercase text-[color:var(--color-ink,#0B1324)]"
            style={{ fontFamily: 'Anton, sans-serif' }}
          >
            L'équipe
          </h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {content.team.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        </AnimatedSection>
      )}

      {/* Partenaires technologiques -- masquée si aucun partenaire (pas de
          bloc "0 partenaires" affiché, cf. principe déjà appliqué sur les
          autres pages du module pour les sections vides). */}
      {content.partenairesTechnologiques.length > 0 && (
        <AnimatedSection className="mb-14">
          <h2
            className="mb-6 text-2xl font-bold uppercase text-[color:var(--color-ink,#0B1324)]"
            style={{ fontFamily: 'Anton, sans-serif' }}
          >
            Partenaires technologiques
          </h2>
          <div className="flex flex-wrap items-center gap-8">
            {content.partenairesTechnologiques.map((partner) => (
              <img
                key={partner.id}
                src={partner.logoUrl}
                alt={partner.name}
                className="h-10 object-contain grayscale"
              />
            ))}
          </div>
        </AnimatedSection>
      )}

      {/* Nos types de campagnes */}
      <AnimatedSection>
        <h2
          className="mb-6 text-2xl font-bold uppercase text-[color:var(--color-ink,#0B1324)]"
          style={{ fontFamily: 'Anton, sans-serif' }}
        >
          Nos types de campagnes
        </h2>
        <div className="grid gap-8 sm:grid-cols-2">
          {campaignTypes.map((eventType) => {
            const detail = getHowItWorksContent(eventType.type);
            if (!detail) return null;
            return (
              <div key={eventType.type}>
                <h3 className="mb-1 font-semibold text-[color:var(--color-ink,#0B1324)]">
                  {detail.title}
                </h3>
                <p className="text-sm text-[color:var(--color-slate,#475569)]">{detail.description}</p>
              </div>
            );
          })}
        </div>
      </AnimatedSection>
    </main>
    <Footer />
    </div>
  );
}
