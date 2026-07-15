// config/aboutConfig.js
//
// Contenu éditorial de la page À propos : histoire, mission, vision, équipe.
//
// Cahier des charges (§4.A) : "Sections : Histoire, Équipe (optionnelle/
// masquable), Partenaires technologiques, Chiffres clés." + "Contenu
// gérable depuis le back-office sans redéploiement."
//
// TODO : comme pour howItWorksConfig.js (ticket LAN-08), aucune table de
// contenu éditorial dédiée n'apparaît dans le schéma UML fourni (DC-01 ->
// DC-10). Même point déjà signalé dans l'annexe technique du module,
// section C — à traiter en une seule fois avec le Lead pour toutes les
// pages concernées (Comment ça marche + À propos), plutôt que de le
// répéter ticket par ticket.
// Dès que la table existe, remplacer getAboutContent() par un appel :
//   GET /api/content/about

const ABOUT_CONTENT = {
  histoire: {
    title: 'Notre histoire',
    text:
      "Moledi Events est né d'un constat simple : organiser un scrutin, une " +
      "collecte ou un événement en Afrique reste souvent compliqué, coûteux " +
      "et peu transparent. Nous avons voulu construire une plateforme locale, " +
      'fiable, et pensée pour le Mobile Money.',
  },
  mission: {
    title: 'Notre mission',
    text:
      'Donner à chaque organisateur ou visiteur les moyens de créer et de ' +
      'participer à des campagnes (scrutins, événements, cagnottes...) en toute ' +
      'confiance, sans barrière technique ni besoin de compte bancaire classique.',
  },
  vision: {
    title: 'Notre vision',
    text:
      'Devenir la plateforme de référence pour l’organisation de campagnes ' +
      'participatives en Afrique francophone, en s’adaptant aux usages réels ' +
      '(Mobile Money, WhatsApp, multilinguisme).',
  },

  // "Équipe (optionnelle/masquable)" — l'admin peut choisir de ne pas
  // afficher cette section (ex. équipe encore trop réduite, ou par choix
  // de discrétion). showTeamSection contrôle exactement ça.
  // Décision produit (2026-07-09) : masquée pour l'instant — pas d'équipe
  // publique à présenter au lancement. Le tableau `team` reste vide plutôt
  // que rempli de placeholders inventés.
  showTeamSection: false,
  team: [],

  partenairesTechnologiques: [
    // Logos des partenaires techno (hébergeur, agrégateurs de paiement...).
    // Vide au MVP -> la section correspondante ne s'affiche pas
    // (voir gestion du cas vide dans AboutPage.jsx).
  ],
};

/**
 * Retourne tout le contenu éditorial de la page À propos.
 * @returns {typeof ABOUT_CONTENT}
 */
export function getAboutContent() {
  return ABOUT_CONTENT;
}
