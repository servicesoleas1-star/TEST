// components/LegalPageContent.jsx
//
// Composant générique qui affiche le contenu d'une page légale (titre,
// date de mise à jour, contenu formaté). Réutilisé par les 4 pages
// (CGU, CGV, Mentions légales, Cookies) plutôt que dupliqué 4 fois --
// c'est le champ `type` qui change, pas le composant.

import { getLegalPage } from './config/legalPagesConfig';
import SiteHeader from './SiteHeader';
import Footer from './Footer';

/**
 * @param {{ type: 'TERMS'|'SALES_TERMS'|'LEGAL_NOTICE'|'COOKIES' }} props
 */
export default function LegalPageContent({ type }) {
  const page = getLegalPage(type);

  // Si jamais le type demandé n'existe pas en config (erreur de câblage
  // d'une des 4 pages), on affiche un message clair plutôt qu'une page
  // blanche silencieuse -- plus facile à repérer en revue de code ou en test.
  if (!page) {
    return (
      <p className="text-red-600">
        Contenu introuvable pour le type de page légale « {type} ».
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 pt-28 pb-10 sm:px-6 sm:pt-32 lg:px-8">
      <h1
        className="mb-2 text-3xl font-bold uppercase text-[color:var(--color-ink,#0B1324)] sm:text-4xl"
        style={{ fontFamily: 'Anton, sans-serif' }}
      >
        {page.title}
      </h1>

      <p className="mb-8 text-sm text-[color:var(--color-slate,#475569)]">
        Dernière mise à jour : {page.updatedAtLabel}
      </p>

      {/* Le contenu est stocké en texte simple avec des retours à la ligne
          (\n) plutôt qu'en HTML -- on découpe donc en paragraphes ici.
          Si un jour le back-office permet du contenu riche (gras, liens...),
          il faudra remplacer ce rendu par un rendu HTML sécurisé (avec
          sanitisation côté serveur, jamais dangerouslySetInnerHTML sans
          nettoyage préalable). */}
      <div className="space-y-4 text-[color:var(--color-slate,#475569)]">
        {page.content.split('\n\n').map((paragraph, index) => (
          <p key={index} className="whitespace-pre-line">
            {paragraph}
          </p>
        ))}
      </div>
      </main>
      <Footer />
    </div>
  );
}
