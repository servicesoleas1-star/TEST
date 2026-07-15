// pages/PartnerPage.jsx
// Route publique : /partenaire  [MVP]
//
// Assemble la présentation des types de partenariat + le formulaire de
// candidature.

import { getPartnershipTypes } from '../components/config/partnershipTypesConfig';
import PartnerApplicationForm from '../components/PartnerApplicationForm';
import SiteHeader from '../components/SiteHeader';
import Footer from '../components/Footer';

export default function PartnerPage() {
  const partnershipTypes = getPartnershipTypes();

  return (
    <div className="min-h-screen bg-white">
    <SiteHeader activeHref="/partenaire" />
    <main className="mx-auto max-w-3xl px-4 pt-28 pb-10 sm:px-6 sm:pt-32 lg:px-8">
      <h1
        className="mb-4 text-center text-4xl font-bold uppercase text-[color:var(--color-ink,#0B1324)] sm:text-5xl"
        style={{ fontFamily: 'Anton, sans-serif' }}
      >
        Devenir partenaire
      </h1>
      <p className="mb-10 text-center text-[color:var(--color-slate,#475569)]">
        Rejoignez l'écosystème Moledi Events et construisons ensemble des campagnes
        plus fortes.
      </p>

      {/* Présentation des types de partenariat */}
      <section className="mb-14 grid gap-6 sm:grid-cols-2">
        {partnershipTypes.map((t) => (
          <div
            key={t.value}
            className="rounded-2xl border border-[color:var(--color-border,#E2E8F0)] p-6"
          >
            <h2 className="mb-2 font-semibold text-[color:var(--color-ink,#0B1324)]">
              {t.label}
            </h2>
            <p className="text-sm text-[color:var(--color-slate,#475569)]">{t.description}</p>
          </div>
        ))}
      </section>

      {/* Formulaire de candidature */}
      <section>
        <h2
          className="mb-6 text-2xl font-bold uppercase text-[color:var(--color-ink,#0B1324)]"
          style={{ fontFamily: 'Anton, sans-serif' }}
        >
          Proposer un partenariat
        </h2>
        <PartnerApplicationForm />
      </section>
    </main>
    <Footer />
    </div>
  );
}
