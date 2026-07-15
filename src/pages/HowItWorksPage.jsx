// pages/HowItWorksPage.jsx
// Route publique : /comment-ca-marche  [MVP]
//
// Assemble :
//   1. Un bloc explicatif par type d'événement disponible (HowItWorksBlock)
//   2. La FAQ générale du site (type HOW_IT_WORKS)
//   3. Les deux CTA de bas de page exigés par la spec :
//      "Créer mon premier événement" + "Contacter l'équipe"
//
// Pourquoi centraliser le chargement ici plutôt que dans chaque bloc :
// la spec §4.D (dashboard) documente déjà le principe "une seule requête au
// chargement pour limiter les allers-retours serveur" — on applique le même
// principe ici : cette page charge tout une fois, et distribue les données
// aux composants enfants via props. Si un jour ces fonctions deviennent de
// vrais appels API asynchrones, seul ce fichier aura besoin d'un état de
// chargement (loading/error) — pas chaque bloc individuellement.

// Chemins ajustés à la structure réelle du projet liboka-vote :
// src/pages/HowItWorksPage.jsx -> src/components/config/... (config)
// src/pages/HowItWorksPage.jsx -> src/components/...        (composants)
import { useEffect, useState } from 'react';
import { getAvailableEventTypes } from '../components/config/eventTypesConfig';
import { getHowItWorksContent } from '../components/config/howItWorksConfig';
import { fetchAllFAQ, getGlobalFAQ } from '../components/config/faqConfig';
import HowItWorksBlock from '../components/HowItWorksBlock';
import FAQAccordion from '../components/FAQAccordion';
import { ArrowRight } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import Footer from '../components/Footer';

export default function HowItWorksPage() {
  // Étape 1 — quels types d'événements sont disponibles sur cette version
  // du site (jamais coder "scrutins uniquement" en dur : ça doit suivre
  // automatiquement l'ouverture des futures versions V1, V2...).
  const availableTypes = getAvailableEventTypes();

  // Étape 2 — FAQ générale, chargée depuis la table réelle global_faqs
  // (modifiable depuis l'admin, critère d'acceptation "FAQ générale
  // modifiable depuis l'admin") — un seul appel, filtré par type ensuite.
  const [allFaqs, setAllFaqs] = useState([]);
  useEffect(() => {
    fetchAllFAQ().then(setAllFaqs);
  }, []);
  const generalFAQ = getGlobalFAQ(allFaqs, 'HOW_IT_WORKS');

  return (
    <div className="min-h-screen bg-white">
    <SiteHeader activeHref="/comment-ca-marche" />
    <main className="mx-auto max-w-3xl px-4 pt-28 pb-10 sm:px-6 sm:pt-32 lg:px-8">
      <h1
        className="mb-8 text-4xl font-bold uppercase text-[color:var(--color-ink,#0B1324)] sm:text-5xl"
        style={{ fontFamily: 'Anton, sans-serif' }}
      >
        Comment ça marche
      </h1>

      {/* Un bloc par type disponible — si availableTypes est vide (config
          cassée), la page reste utilisable : elle affiche juste la FAQ
          générale et les CTA, plutôt que de planter. */}
      <div className="mb-10">
        {availableTypes.map((eventType) => (
          <HowItWorksBlock
            key={eventType.type}
            content={getHowItWorksContent(eventType.type)}
            faqItems={getGlobalFAQ(allFaqs, eventType.faqType)}
          />
        ))}
      </div>

      {/* FAQ générale */}
      <section className="mb-12">
        <h2
          className="mb-4 text-2xl font-bold uppercase text-[color:var(--color-ink,#0B1324)]"
          style={{ fontFamily: 'Anton, sans-serif' }}
        >
          Questions fréquentes
        </h2>
        <FAQAccordion items={generalFAQ} />
      </section>

      {/* CTA bas de page — exigés explicitement par le critère d'acceptation
          "CTAs bas de page". Deux boutons, un primaire et un secondaire,
          conformes à la charte graphique (voir composants Bouton). */}
      <section className="flex flex-col gap-3 border-t border-[color:var(--color-border,#E2E8F0)] pt-8 sm:flex-row sm:justify-center">
        <a
          href="/inscription"
          className="inline-flex items-center justify-center gap-2 rounded-full
                     bg-[color:var(--color-primary,#FF6A00)] px-6 py-3 font-semibold text-white
                     hover:bg-[color:var(--color-orange-900,#F8533A)]
                     active:scale-95 transition"
        >
          Créer mon premier événement
          <ArrowRight size={18} aria-hidden="true" />
        </a>
        <a
          href="/contact"
          className="inline-flex items-center justify-center gap-2 rounded-full
                     border border-[color:var(--color-secondary,#2B6BFF)] px-6 py-3 font-semibold
                     text-[color:var(--color-secondary,#2B6BFF)]
                     hover:bg-[color:var(--color-blue-100,#DOE8FF)]
                     active:scale-95 transition"
        >
          Contacter l'équipe
        </a>
      </section>
    </main>
    <Footer />
    </div>
  );
}
