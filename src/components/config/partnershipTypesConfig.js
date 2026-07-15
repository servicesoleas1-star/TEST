// config/partnershipTypesConfig.js
//
// Rôle : liste des types de partenariat proposés sur la page "Devenir
// partenaire", affichés en présentation avant le formulaire.
//
// Cahier des charges (§4.A, page Devenir partenaire) :
// "Présentation des types de partenariat (média, technologique, commercial,
// sponsoring)."
//
// TODO : comme pour aboutConfig.js et howItWorksConfig.js, aucune table de
// contenu éditorial dédiée n'apparaît dans le schéma UML fourni pour CE
// contenu de présentation (différent du formulaire de candidature lui-même,
// voir services/partnerApplicationService.js pour ce point précis).
// Remplacer par un appel GET /api/content/partnership-types le jour venu.

const PARTNERSHIP_TYPES = [
  {
    value: 'MEDIA',
    label: 'Partenariat média',
    description:
      'Couverture, visibilité croisée et relais de communication autour ' +
      'des campagnes Moledi Events.',
  },
  {
    value: 'TECHNOLOGIQUE',
    label: 'Partenariat technologique',
    description:
      'Intégration technique (paiement, hébergement, outils tiers) au ' +
      'service de la plateforme.',
  },
  {
    value: 'COMMERCIAL',
    label: 'Partenariat commercial',
    description:
      'Distribution, apport d’organisateurs ou d’audience, accords ' +
      'commerciaux réciproques.',
  },
  {
    value: 'SPONSORING',
    label: 'Sponsoring',
    description:
      'Soutien financier ou en nature à des campagnes ou à la plateforme ' +
      'en échange de visibilité.',
  },
];

/**
 * @returns {Array<{value: string, label: string, description: string}>}
 */
export function getPartnershipTypes() {
  return PARTNERSHIP_TYPES;
}
