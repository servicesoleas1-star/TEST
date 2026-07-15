// config/eventListingTypes.js
//
// Métadonnées d'affichage (libellé + couleur) par type de campagne, pour
// la page publique /evenements (liste + détail). Une couleur dédiée par
// type -- demandée explicitement, pour différencier les cartes au premier
// coup d'œil sans avoir à lire le texte. primary/secondary reprennent les
// couleurs de marque déjà utilisées ailleurs sur le site ; les autres
// types utilisent la palette Tailwind par défaut (aucune couleur de marque
// dédiée n'existe pour eux dans tailwind.config.js).

// `cta` : libellé par défaut du bouton d'action de chaque carte, utilisé
// uniquement si la campagne n'a pas son propre libellé configuré (aucune
// campagne de ce catalogue de démonstration n'en a — voir EventCard).
// `getDestination` : seul le type POLL a une vraie page publique pour
// l'instant (page /vote/:slug, en cours de construction) -- les autres
// types n'ont "pas encore de page bien spécifique" (chaque type aura la
// sienne plus tard). Tant qu'elle n'existe pas, la carte ne navigue nulle
// part plutôt que de pointer vers un lien cassé.
export const EVENT_TYPES = [
  { value: 'POLL', label: 'Votes & Scrutins', color: '#FF6A00', bgClass: 'bg-primary', textClass: 'text-primary', cta: 'Voter', getDestination: (item) => `/vote/${item.slug}` },
  { value: 'EVENT', label: 'Billetterie', color: '#2B6BFF', bgClass: 'bg-secondary', textClass: 'text-secondary', cta: 'Réserver ma place', getDestination: () => null },
  { value: 'FUNDRAISER', label: 'Dons & Cagnottes', color: '#EC4899', bgClass: 'bg-pink-500', textClass: 'text-pink-600', cta: 'Faire un don', getDestination: () => null },
  { value: 'CF_PROJECT', label: 'Crowdfunding', color: '#A855F7', bgClass: 'bg-purple-500', textClass: 'text-purple-600', cta: 'Contribuer', getDestination: () => null },
  { value: 'LOTTERY', label: 'Tombolas', color: '#F59E0B', bgClass: 'bg-amber-500', textClass: 'text-amber-600', cta: 'Participer', getDestination: () => null },
  { value: 'CONTEST', label: 'Concours', color: '#14B8A6', bgClass: 'bg-teal-500', textClass: 'text-teal-600', cta: 'Participer', getDestination: () => null },
  { value: 'SPONSOR_CALL', label: 'Sponsoring', color: '#6366F1', bgClass: 'bg-indigo-500', textClass: 'text-indigo-600', cta: 'Devenir partenaire', getDestination: () => null },
];

export function getEventTypeMeta(type) {
  return EVENT_TYPES.find((t) => t.value === type) || EVENT_TYPES[0];
}

export const EVENT_STATUSES = [
  { value: 'UPCOMING', label: 'À venir', color: '#2B6BFF' },
  { value: 'ONGOING', label: 'En cours', color: '#16A34A' },
  { value: 'ENDED', label: 'Terminé', color: '#6B6D80' },
  { value: 'SUSPENDED', label: 'Suspendu', color: '#DC2626' },
];

export function getStatusMeta(status) {
  return EVENT_STATUSES.find((s) => s.value === status) || EVENT_STATUSES[0];
}

export const SORT_OPTIONS = [
  { value: 'recent', label: 'Plus récent' },
  { value: 'popular', label: 'Plus populaire' },
  { value: 'closing_soon', label: 'Bientôt clôturé' },
];
