export const eventTypes = [
  {
    id: 'billetterie',
    label: 'Billetterie',
    icon: '🎟️',
    description: "Vendez des billets pour vos concerts, conférences et spectacles.",
    available: true,
  },
  {
    id: 'scrutin',
    label: 'Scrutin / Vote',
    icon: '🗳️',
    description: 'Organisez des concours de votes transparents et sécurisés.',
    available: true,
  },
  {
    id: 'don',
    label: 'Don / Cagnotte',
    icon: '💝',
    description: 'Collectez des fonds pour une cause ou un projet personnel.',
    available: true,
  },
  {
    id: 'crowdfunding',
    label: 'Crowdfunding',
    icon: '🚀',
    description: 'Financez vos projets par paliers avec votre communauté.',
    available: true,
  },
  {
    id: 'concours',
    label: 'Concours / Tombola',
    icon: '🎁',
    description: 'Lancez des tirages au sort et concours avec tirage automatique.',
    available: true,
  },
  {
    id: 'abonnement',
    label: 'Abonnements',
    icon: '⭐',
    description: 'Proposez des offres récurrentes à votre communauté.',
    available: false,
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: '🛍️',
    description: 'Vendez des produits liés à vos événements.',
    available: false,
  },
];

export const featuredEvents = [
  {
    id: 1,
    type: 'billetterie',
    badge: 'Épinglé',
    title: 'Festival de la Musique',
    image:
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80',
    date: '24 Mai 2026',
    location: 'Dakar',
    price: 'À partir de 5 000 FCFA',
    status: 'Ouvert',
  },
  {
    id: 2,
    type: 'scrutin',
    badge: 'En Live',
    title: 'Miss Élégance 2026',
    image:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    votes: '12 580 votes',
    topCandidate: 'Aminata M.',
    status: 'En cours',
  },
  {
    id: 3,
    type: 'don',
    badge: 'Urgent',
    title: 'Aide médicale pour Fatou',
    image:
      'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=800&q=80',
    raised: '2 300 000 FCFA',
    goal: '5 000 000 FCFA',
    percentage: 46,
    status: 'Ouvert',
  },
  {
    id: 4,
    type: 'crowdfunding',
    badge: 'Premium',
    title: 'Studio créatif communautaire',
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
    raised: '8 100 000 FCFA',
    goal: '10 000 000 FCFA',
    percentage: 81,
    status: 'Ouvert',
  },
  {
    id: 5,
    type: 'concours',
    badge: 'Nouveau',
    title: 'Tombola Ramadan',
    image:
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
    prize: 'Un voyage à Dubaï',
    drawDate: 'Tirage le 15 Juin 2026',
    status: 'À venir',
  },
  {
    id: 6,
    type: 'billetterie',
    title: "Nuit de l'Humour",
    image:
      'https://images.unsplash.com/photo-1555169062-013468b47731?auto=format&fit=crop&w=800&q=80',
    date: '2 Juillet 2026',
    location: 'Abidjan',
    price: 'À partir de 3 000 FCFA',
    status: 'Ouvert',
  },
];

export const testimonials = [
  {
    id: 1,
    name: 'Aminata Mbaye',
    role: 'Organisatrice, Festival de la Musique',
    quote:
      "Moledi Event nous a permis de vendre plus de 1 200 billets en une semaine, sans stress technique.",
  },
  {
    id: 2,
    name: 'Ibrahima Fall',
    role: 'Fondateur, Studio créatif communautaire',
    quote:
      'La campagne de crowdfunding a dépassé notre objectif en 3 semaines grâce à la visibilité offerte par la plateforme.',
  },
  {
    id: 3,
    name: 'Khady Diop',
    role: 'Organisatrice, Miss Élégance',
    quote:
      'Le système de vote est fiable et transparent, nos participants ont adoré suivre les résultats en direct.',
  },
];

export const partners = [
  { id: 1, name: 'Orange Money' },
  { id: 2, name: 'Wave' },
  { id: 3, name: 'Free Money' },
  { id: 4, name: 'Visa' },
  { id: 5, name: 'Mastercard' },
];

export const coverage = {
  countries: ['Sénégal', "Côte d'Ivoire", 'Mali', 'Bénin', 'Togo', 'Burkina Faso'],
  paymentMethods: ['Orange Money', 'Wave', 'Free Money', 'Carte bancaire'],
};
