// config/legalPagesConfig.js
//
// Rôle : simuler la table LegalPage (DC-10, Moledi_UML_Structure_Final.pdf).
// Champs réels : page_id UUID PK, type LegalType (TERMS | SALES_TERMS |
// LEGAL_NOTICE | COOKIES | PRIVACY), content Text, updated_at DateTime,
// updated_by UUID FK.
//
// Une seule table, un enregistrement par type -- PAS 4 tables séparées.
// C'est le champ "type" qui distingue CGU / CGV / Mentions légales /
// Cookies (et Confidentialité, ticket séparé LAN-13, type PRIVACY, non
// couvert ici).
//
// TODO : remplacer getLegalPage(type) par un vrai appel, par exemple :
//   GET /api/legal-pages/{type}
// Garder le même contrat de retour (content + updatedAt) pour ne rien
// casser côté composant.

const MOCK_LEGAL_PAGES = {
  TERMS: {
    title: "Conditions Générales d'Utilisation",
    content:
      "Les présentes Conditions Générales d'Utilisation (« CGU ») régissent l'accès et " +
      "l'utilisation de la plateforme Moledi Events (le « Site »), accessible notamment à " +
      "l'adresse moledievents.com, éditée par Moledi Events. Toute création de compte ou " +
      "utilisation du Site implique l'acceptation pleine et entière des présentes CGU. Si vous " +
      "n'acceptez pas ces termes, vous devez cesser d'utiliser le Site.\n\n" +

      "1. Objet\nMoledi Events est une plateforme permettant à des organisateurs de créer et " +
      "gérer des campagnes participatives — scrutins et votes, billetterie d'événements, dons et " +
      "cagnottes, projets de crowdfunding, appels au sponsoring, jeux-concours et tombolas — et " +
      "à des visiteurs d'y participer (voter, faire un don, acheter un billet, contribuer, " +
      "s'inscrire à un jeu), avec ou sans création de compte selon la fonctionnalité concernée.\n\n" +

      "2. Accès au Site et identification des visiteurs\nL'accès au Site est libre et gratuit " +
      "pour toute personne disposant d'un accès à Internet. À votre première visite, un " +
      "identifiant visiteur anonyme (cookie technique) est déposé afin de fluidifier votre " +
      "navigation et d'associer vos actions (vote, don, achat) à votre appareil sans exiger de " +
      "compte. Les frais d'accès et de connexion au réseau Internet restent à votre charge.\n\n" +

      "3. Compte organisateur\nSeule la création ou la gestion d'une campagne (scrutin, " +
      "événement, cagnotte, projet, appel au sponsoring, jeu-concours) nécessite la création " +
      "d'un compte organisateur. Vous vous engagez à fournir des informations exactes, à jour, " +
      "et à préserver la confidentialité de vos identifiants de connexion. Vous êtes responsable " +
      "de toute activité réalisée depuis votre compte, sauf usage frauduleux dûment signalé à " +
      "notre support dans les meilleurs délais. Un compte peut être suspendu ou supprimé en cas " +
      "de fausse déclaration, de fraude avérée ou de non-respect des présentes CGU.\n\n" +

      "4. Obligations de l'organisateur\nL'organisateur d'une campagne est seul responsable : " +
      "du contenu qu'il publie (textes, images, règlement, candidats, lots) ; de sa conformité " +
      "aux lois applicables (droit d'auteur, droit à l'image, protection des mineurs, " +
      "réglementation des jeux et loteries le cas échéant) ; de l'exactitude des informations " +
      "communiquées aux participants ; et du respect des engagements pris envers ses participants " +
      "(remise des lots, tenue des promesses de contrepartie en crowdfunding, etc.). Moledi " +
      "Events se réserve le droit de suspendre, sans préavis, toute campagne manifestement " +
      "illicite, frauduleuse ou contraire à l'ordre public, et d'en informer les autorités " +
      "compétentes si la loi l'exige.\n\n" +

      "5. Obligations du visiteur et du participant\nEn participant à une campagne (vote, don, " +
      "achat de billet, contribution, participation à un jeu), vous vous engagez à fournir des " +
      "informations exactes et à ne pas contourner les mécanismes anti-fraude de la plateforme " +
      "(identifiant visiteur, vérification par email/téléphone/code unique selon la campagne). " +
      "Toute tentative de fraude, de vote multiple non autorisé ou de manipulation des résultats " +
      "peut entraîner l'annulation des actions concernées et, le cas échéant, un signalement aux " +
      "autorités compétentes.\n\n" +

      "6. Propriété intellectuelle\nLa structure générale du Site, ses textes, logos, graphismes, " +
      "et plus généralement tous les éléments composant le Site sont la propriété exclusive de " +
      "Moledi Events ou de ses partenaires, et sont protégés par le droit d'auteur et le droit " +
      "des marques. Toute reproduction, représentation, modification ou exploitation, totale ou " +
      "partielle, sans autorisation écrite préalable est interdite. Le contenu publié par les " +
      "organisateurs (images, textes de campagne) reste leur propriété ; ils garantissent " +
      "disposer des droits nécessaires à sa publication et concèdent à Moledi Events un droit " +
      "d'affichage sur le Site le temps de la campagne.\n\n" +

      "7. Disponibilité et responsabilité\nMoledi Events met tout en œuvre pour assurer " +
      "l'accessibilité du Site 24h/24, sauf cas de force majeure, opération de maintenance " +
      "planifiée ou panne indépendante de sa volonté (notamment des agrégateurs de paiement Mobile " +
      "Money tiers). Moledi Events ne saurait être tenue responsable des dommages indirects " +
      "résultant de l'utilisation du Site, ni des litiges entre un organisateur et ses " +
      "participants, la plateforme n'étant qu'un intermédiaire technique.\n\n" +

      "8. Suspension et résiliation\nMoledi Events peut suspendre ou clôturer un compte, avec ou " +
      "sans préavis selon la gravité des faits reprochés, en cas de violation des présentes CGU, " +
      "de fraude, ou sur décision d'une autorité compétente. L'utilisateur peut demander la " +
      "clôture de son compte à tout moment via la page Contact, sous réserve de l'apurement des " +
      "campagnes en cours.\n\n" +

      "9. Modification des CGU\nMoledi Events peut modifier les présentes CGU à tout moment, " +
      "notamment pour refléter une évolution légale, réglementaire ou fonctionnelle. La version " +
      "en vigueur est celle publiée sur cette page, avec sa date de mise à jour. Les utilisateurs " +
      "sont invités à la consulter régulièrement.\n\n" +

      "10. Droit applicable et litiges\nLes présentes CGU sont soumises au droit camerounais. " +
      "En cas de litige, une solution amiable sera recherchée en priorité via la page Contact. À " +
      "défaut d'accord amiable, les tribunaux compétents de Douala, Cameroun, seront seuls " +
      "compétents, sauf disposition légale impérative contraire.",
    updated_at: '2026-07-09T10:00:00Z',
  },
  SALES_TERMS: {
    title: 'Conditions Générales de Vente',
    content:
      "Les présentes Conditions Générales de Vente (« CGV ») s'appliquent à tout achat, don ou " +
      "contribution payante effectué sur la plateforme Moledi Events : vote payant, billet " +
      "d'événement, don ou cagnotte, contribution de crowdfunding, ticket de jeu-concours ou de " +
      "tombolas. Elles complètent les Conditions Générales d'Utilisation et prévalent pour toute " +
      "question relative aux paiements.\n\n" +

      "1. Prix\nLes prix affichés sur chaque campagne sont exprimés dans la devise locale " +
      "applicable au pays de l'organisateur, toutes taxes comprises lorsque la réglementation " +
      "locale l'exige. Une commission de plateforme, dont le taux est précisé sur la page Tarifs, " +
      "peut être ajoutée au montant fixé par l'organisateur ou prélevée sur celui-ci selon le " +
      "type de campagne — le détail exact est toujours visible avant validation du paiement.\n\n" +

      "2. Moyens de paiement\nLes paiements sont traités via les opérateurs de Mobile Money " +
      "disponibles dans votre pays (Orange Money, MTN Mobile Money, etc.) ainsi que, selon " +
      "disponibilité, par carte bancaire. Moledi Events ne stocke jamais vos identifiants de " +
      "paiement : chaque transaction est traitée directement par l'agrégateur de paiement " +
      "partenaire, dans le respect des standards de sécurité en vigueur.\n\n" +

      "3. Confirmation de la commande\nToute transaction (vote, achat, don, contribution) fait " +
      "l'objet d'une confirmation immédiate dès validation du paiement par l'agrégateur, avec " +
      "génération d'un identifiant de transaction unique. En cas d'échec ou de paiement resté " +
      "sans confirmation au-delà d'un délai raisonnable, la transaction est automatiquement " +
      "annulée et aucun montant n'est prélevé, ou fait l'objet d'un remboursement automatique si " +
      "le prélèvement a néanmoins eu lieu.\n\n" +

      "4. Livraison / accès à la prestation\nSelon le type de campagne : un billet électronique " +
      "(avec QR code) est envoyé immédiatement après paiement pour la billetterie ; un vote est " +
      "comptabilisé en temps réel pour les scrutins ; un reçu de don ou de contribution est " +
      "délivré instantanément pour les cagnottes et le crowdfunding ; un ticket de participation " +
      "est confirmé immédiatement pour les jeux-concours et tombolas.\n\n" +

      "5. Droit de rétractation\nConformément à la nature des prestations vendues (participation " +
      "immédiate à un événement daté, vote comptabilisé en temps réel, don à fonds perdu), le " +
      "droit de rétractation ne s'applique pas une fois la transaction confirmée, sauf disposition " +
      "légale impérative contraire ou politique de remboursement plus favorable précisée sur la " +
      "page de la campagne concernée.\n\n" +

      "6. Remboursement et annulation\nLa politique de remboursement (annulation d'un événement " +
      "par l'organisateur, litige sur un vote, échec technique avéré) dépend du type de campagne " +
      "et des règles définies par l'organisateur, affichées sur chaque page de campagne avant " +
      "paiement. En cas d'annulation d'un événement par son organisateur, les billets déjà " +
      "achetés sont remboursés selon les modalités précisées sur la page de l'événement, ou à " +
      "défaut selon la politique par défaut de la plateforme.\n\n" +

      "7. Réclamations\nToute réclamation relative à un paiement non abouti, un vote non " +
      "comptabilisé ou un billet non reçu doit être adressée via la page Contact ou l'espace " +
      "support du site, dans un délai de 30 jours suivant la transaction, en précisant " +
      "l'identifiant de transaction concerné.\n\n" +

      "8. Commissions et reversements aux organisateurs\nLe taux de commission prélevé par " +
      "Moledi Events sur chaque transaction est indiqué de façon transparente sur la page Tarifs " +
      "avant la création de toute campagne. Les fonds collectés par un organisateur sont reversés " +
      "selon le calendrier de reversement configuré dans son tableau de bord, déduction faite de " +
      "cette commission.\n\n" +

      "9. Droit applicable\nLes présentes CGV sont soumises au droit camerounais et complètent " +
      "les Conditions Générales d'Utilisation du Site.",
    updated_at: '2026-07-09T10:00:00Z',
  },
  LEGAL_NOTICE: {
    title: 'Mentions légales',
    content:
      "Conformément à la législation applicable en matière de commerce électronique, les " +
      "présentes mentions légales informent les utilisateurs de la plateforme Moledi Events de " +
      "l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi.\n\n" +

      "1. Éditeur du site\nLe site Moledi Events (moledievents.com) est édité par Moledi Events " +
      "(Liboka Advisory), dont le siège social est situé à Douala, Cameroun.\n" +
      "Numéro RCCM : à compléter par l'équipe juridique.\n" +
      "Numéro de contribuable (NIU) : à compléter par l'équipe juridique.\n" +
      "Directeur de la publication : à compléter par l'équipe juridique.\n" +
      "Contact : voir la page Contact du site.\n\n" +

      "2. Hébergement\nLe site est hébergé par un prestataire d'hébergement dont le nom, " +
      "l'adresse et les coordonnées seront précisés ici dès la mise en production définitive de " +
      "l'infrastructure (à compléter par l'équipe technique une fois l'hébergeur de production " +
      "choisi).\n\n" +

      "3. Propriété intellectuelle\nL'ensemble des éléments constituant le site Moledi Events " +
      "(structure, textes, logos, chartes graphiques, éléments visuels et sonores) est protégé " +
      "par le droit d'auteur et le droit des marques. Toute reproduction ou représentation, " +
      "totale ou partielle, sans autorisation préalable, est interdite et constitutive de " +
      "contrefaçon.\n\n" +

      "4. Données personnelles\nLe traitement des données personnelles collectées sur le site " +
      "est décrit en détail dans la Politique de confidentialité, accessible depuis le pied de " +
      "page de chaque page du site.\n\n" +

      "5. Cookies\nL'utilisation de cookies et traceurs sur le site est décrite dans la Politique " +
      "de cookies, accessible depuis le pied de page de chaque page du site.\n\n" +

      "6. Limitation de responsabilité\nMoledi Events s'efforce d'assurer l'exactitude et la " +
      "mise à jour des informations diffusées sur le site, dont elle se réserve le droit de " +
      "corriger le contenu à tout moment sans préavis. Moledi Events décline toute responsabilité " +
      "en cas d'interruption du site pour des raisons de maintenance, de force majeure ou de " +
      "défaillance d'un prestataire technique tiers (hébergeur, agrégateur de paiement).\n\n" +

      "7. Droit applicable\nLes présentes mentions légales sont soumises au droit camerounais. " +
      "Tout litige relatif à leur interprétation ou leur exécution relève de la compétence " +
      "exclusive des tribunaux de Douala, Cameroun.\n\n" +

      "8. Crédits\nConception et développement : équipe Moledi Events.",
    updated_at: '2026-07-09T10:00:00Z',
  },
  COOKIES: {
    title: 'Politique de cookies',
    content:
      "Cette politique explique ce qu'est un cookie, quels traceurs sont utilisés sur le site " +
      "Moledi Events, pourquoi, combien de temps ils sont conservés, et comment vous pouvez les " +
      "gérer. Elle complète la Politique de confidentialité.\n\n" +

      "1. Qu'est-ce qu'un cookie ?\nUn cookie est un petit fichier texte déposé sur votre " +
      "appareil (ordinateur, mobile, tablette) lors de votre navigation sur un site internet. Il " +
      "permet au site de reconnaître votre appareil lors de vos visites suivantes, de mémoriser " +
      "vos préférences, ou de mesurer l'audience du site.\n\n" +

      "2. Les traceurs utilisés sur Moledi Events\n" +
      "• Identifiant visiteur (moledi_visitor_id) — cookie strictement nécessaire, posé dès la " +
      "première visite pour associer vos actions (vote, don, achat) à votre appareil sans " +
      "exiger de compte. Durée de conservation : 400 jours (durée maximale technique des " +
      "navigateurs), renouvelée à chaque visite.\n" +
      "• Préférence de langue (googtrans + moledi_preferred_language) — cookie fonctionnel, " +
      "mémorise votre choix entre le français et l'anglais pour vous éviter de le refaire à " +
      "chaque page. Durée de conservation : session de navigation, ou jusqu'à modification de " +
      "votre choix.\n" +
      "• Consentement cookies (moledi_cookie_consent) — cookie strictement nécessaire, mémorise " +
      "votre réponse au bandeau de consentement pour ne pas vous le présenter à chaque visite. " +
      "Durée de conservation : 12 mois, ou jusqu'à changement de version de la présente " +
      "politique.\n" +
      "• Widget Google Translate — cookies déposés par le service tiers Google Translate lors " +
      "de l'utilisation du sélecteur de langue, selon la politique de confidentialité propre à " +
      "Google.\n\n" +

      "3. Cookies strictement nécessaires\nCertains cookies sont indispensables au " +
      "fonctionnement du site (identification visiteur, mémorisation de votre consentement) et " +
      "ne peuvent pas être désactivés sans altérer gravement votre expérience (impossibilité de " +
      "voter, de suivre une commande en cours, etc.). Leur dépôt ne nécessite pas votre " +
      "consentement préalable, conformément aux pratiques standard en matière de cookies " +
      "techniques.\n\n" +

      "4. Cookies soumis à consentement\nLes cookies fonctionnels (préférence de langue, widget " +
      "de traduction) ne sont activés qu'après votre consentement exprimé via le bandeau affiché " +
      "à votre première visite. Vous pouvez à tout moment revenir sur votre choix.\n\n" +

      "5. Comment gérer vos cookies\nVous pouvez à tout moment : accepter ou refuser les " +
      "cookies non essentiels via le bandeau de consentement affiché sur le site ; supprimer les " +
      "cookies déjà déposés depuis les réglages de votre navigateur ; configurer votre navigateur " +
      "pour refuser systématiquement les cookies (ce qui peut altérer certaines fonctionnalités " +
      "du site, notamment le vote et le suivi de vos participations).\n\n" +

      "6. Mise à jour de cette politique\nCette politique peut être mise à jour pour refléter " +
      "une évolution des traceurs utilisés sur le site. La date de dernière mise à jour est " +
      "indiquée en haut de cette page ; toute modification substantielle vous sera à nouveau " +
      "présentée via le bandeau de consentement.",
    updated_at: '2026-07-09T10:00:00Z',
  },
};

const DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/**
 * @param {'TERMS'|'SALES_TERMS'|'LEGAL_NOTICE'|'COOKIES'} type
 * @returns {{ title: string, content: string, updatedAtLabel: string } | null}
 */
export function getLegalPage(type) {
  const page = MOCK_LEGAL_PAGES[type];
  if (!page) return null;

  return {
    title: page.title,
    content: page.content,
    updatedAtLabel: DATE_FORMATTER.format(new Date(page.updated_at)),
  };
}
