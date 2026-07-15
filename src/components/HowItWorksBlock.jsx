// components/HowItWorksBlock.jsx
//
// Affiche un bloc explicatif pour UN type d'événement : titre, description,
// frais, reversements, puis la FAQ spécifique à ce type (via faqType).
//
// Ce composant ne fait aucun appel réseau lui-même : il reçoit les données
// déjà chargées en props. C'est la page parente (HowItWorksPage) qui décide
// quels types afficher et qui va chercher le contenu — voir le commentaire
// "pourquoi centraliser le chargement" dans HowItWorksPage.jsx.

import FAQAccordion from './FAQAccordion';

/**
 * @param {{
 *   content: { title: string, description: string, fees: string, payout: string },
 *   faqItems: Array<{ faq_id: string, question: string, answer: string }>
 * }} props
 */
export default function HowItWorksBlock({ content, faqItems }) {
  // Si aucun contenu n'est défini pour ce type (cas config manquante), on
  // n'affiche rien plutôt qu'un bloc à moitié vide — cf. même logique de
  // sécurité que WhatsAppFloatingButton (retourner null plutôt qu'un
  // rendu cassé).
  if (!content) {
    return null;
  }

  return (
    <section className="py-8 border-b border-[color:var(--color-border,#E2E8F0)] last:border-b-0">
      <h3
        className="mb-3 text-2xl font-bold uppercase text-[color:var(--color-ink,#0B1324)]"
        style={{ fontFamily: 'Anton, sans-serif' }}
      >
        {content.title}
      </h3>

      <p className="mb-4 text-[color:var(--color-slate,#475569)]">{content.description}</p>

      <dl className="mb-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-semibold text-[color:var(--color-ink,#0B1324)]">
            Frais
          </dt>
          <dd className="text-[color:var(--color-slate,#475569)]">{content.fees}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-[color:var(--color-ink,#0B1324)]">
            Reversements
          </dt>
          <dd className="text-[color:var(--color-slate,#475569)]">{content.payout}</dd>
        </div>
      </dl>

      {/* FAQ spécifique à ce type — absente si aucune question n'est
          définie (FAQAccordion retourne null dans ce cas, section masquée
          comme demandé par la spec pour les FAQ de scrutin/événement). */}
      <FAQAccordion items={faqItems} />
    </section>
  );
}
