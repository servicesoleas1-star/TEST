// components/FAQAccordion.jsx
//
// Composant générique d'accordéon FAQ. Volontairement indépendant de toute
// source de données (il ne connaît pas GlobalFAQ) : il reçoit juste un
// tableau { question, answer } et affiche/masque les réponses au clic,
// sans rechargement de page, comme demandé par la spec (§4.A) :
// "Chaque question s'affiche en accordéon — au clic, la réponse se déploie
// côté client sans rechargement."
//
// Réutilisable partout où il y a une FAQ (page Comment ça marche, page
// Tarifs, FAQ d'un scrutin, FAQ d'un événement...) : ne pas recréer un
// composant équivalent ailleurs dans le projet.

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * @param {{ items: Array<{ faq_id: string, question: string, answer: string }> }} props
 */
export default function FAQAccordion({ items }) {
  // On garde uniquement l'id de la question actuellement ouverte.
  // null = tout est fermé. Un seul élément ouvert à la fois (comportement
  // accordéon classique) ; si le besoin change vers "plusieurs ouvertes en
  // même temps", remplacer par un Set d'ids ici.
  const [openId, setOpenId] = useState(null);

  // Si la source de données ne renvoie rien (section vide), on ne rend rien
  // plutôt qu'un bloc vide avec un titre sans contenu.
  if (!items || items.length === 0) {
    return null;
  }

  function toggle(id) {
    setOpenId((current) => (current === id ? null : id));
  }

  return (
    <div className="divide-y divide-[color:var(--color-border,#E2E8F0)]">
      {items.map((item) => {
        const isOpen = openId === item.faq_id;

        return (
          <div key={item.faq_id}>
            <button
              type="button"
              onClick={() => toggle(item.faq_id)}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${item.faq_id}`}
              className="flex w-full items-center justify-between gap-4 py-4 text-left
                         font-medium text-[color:var(--color-ink,#0B1324)]
                         focus:outline-none focus:ring-2 focus:ring-[color:var(--color-secondary,#2B6BFF)]"
            >
              <span>{item.question}</span>
              <ChevronDown
                size={20}
                className={`shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>

            {/* On rend toujours le contenu dans le DOM (accessibilité /
                lecteurs d'écran) et on masque juste visuellement avec max-h,
                plutôt que de monter/démonter le noeud à chaque clic. */}
            <div
              id={`faq-answer-${item.faq_id}`}
              className={`overflow-hidden transition-all duration-200 ${
                isOpen ? 'max-h-96 pb-4' : 'max-h-0'
              }`}
            >
              <p className="text-[color:var(--color-slate,#475569)]">{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
