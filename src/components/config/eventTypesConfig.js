// config/eventTypesConfig.js
//
// Rôle : dire quels types d'événements (scrutins, billetterie, dons...) sont
// disponibles sur la version actuelle du site, pour ne jamais afficher
// comme actif un bloc qui correspond à une fonctionnalité pas encore livrée.
//
// Référence cahier des charges : section 1.1 "Diagramme général de
// l'architecture fonctionnelle" — chaque type de campagne est rattaché à
// une version (MVP, V1, V2, V3, V4+).
//
// IMPORTANT (TODO) : ce fichier est un mock temporaire. Dès que le module
// Back-office > Paramètres plateforme est livré (table FeatureFlag, DC-10),
// remplacer getAvailableEventTypes() par un vrai appel, par exemple :
//   GET /api/platform/event-types
// La fonction doit garder exactement la même signature de retour pour ne
// rien casser côté composants qui l'utilisent déjà.

// Décision produit (CPO, 2026-07-09) : on n'affiche plus certains types
// comme "pas encore disponibles" — tous les types du catalogue sont montrés
// partout sur le site (page Comment ça marche incluse), qu'ils soient
// pleinement livrés côté backend ou non. getAvailableEventTypes() renvoie
// donc désormais la liste complète, sans filtre de version.
const EVENT_TYPES = [
  { type: 'POLL', label: 'Scrutins & Votes', faqType: 'POLL_TEMPLATE' },
  { type: 'EVENT', label: 'Événementiel & Billetterie', faqType: 'EVENT_TEMPLATE' },
  { type: 'DONATION', label: 'Dons & Cagnottes', faqType: 'DONATION_TEMPLATE' },
  { type: 'CROWDFUNDING', label: 'Crowdfunding', faqType: 'CF_TEMPLATE' },
  { type: 'SPONSORING', label: 'Sponsoring', faqType: null },
  { type: 'CONTEST', label: 'Jeux-Concours & Tombolas', faqType: 'CONTEST_TEMPLATE' },
];

/**
 * Retourne l'intégralité du catalogue de types d'événements (voir décision
 * produit ci-dessus — plus de filtre par version de plateforme).
 *
 * @returns {Array<{type: string, label: string, faqType: string|null}>}
 */
export function getAvailableEventTypes() {
  return EVENT_TYPES;
}
