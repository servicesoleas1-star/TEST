// config/howItWorksConfig.js
//
// Rôle : fournir le contenu explicatif (fonctionnement, frais, reversements)
// affiché pour chaque type d'événement sur la page "Comment ça marche".
//
// Cahier des charges (§4.A, page Comment ça marche) :
// "Blocs explicatifs par type d'événement disponible dans la version
// actuelle : fonctionnement des votes, frais, reversements."
// "Contenu essentiellement statique, gérable depuis le back-office via une
// table de contenu éditorial."
//
// TODO : ce fichier mocke une table de contenu éditorial qui n'existe pas
// encore telle quelle dans le schéma UML fourni (DC-01 → DC-10). À signaler
// en refinement comme les 3 autres points déjà notés dans l'annexe
// technique (section C) : il manque une table dédiée au contenu éditorial
// des pages type "Comment ça marche" / "À propos".
// Dès qu'elle existe, remplacer getHowItWorksContent(type) par un appel :
//   GET /api/content/how-it-works?type={type}

const CONTENT_BY_TYPE = {
  POLL: {
    title: 'Scrutins & Votes',
    description:
      "Créez un scrutin, ajoutez vos candidats, choisissez un mode de vote " +
      '(gratuit, payant, avec jury) et partagez le lien. Chaque vote est ' +
      'comptabilisé en temps réel et un procès-verbal certifié est généré à la clôture.',
    fees:
      'Une commission Moledi Events est prélevée sur chaque vote payant. ' +
      'Le taux exact est visible sur la page Tarifs.',
    payout:
      'Les fonds collectés sont reversés sur votre numéro Mobile Money selon ' +
      'le calendrier de reversement configuré dans votre tableau de bord.',
  },
  EVENT: {
    title: 'Événementiel & Billetterie',
    description:
      'Créez votre événement, configurez vos types de billets et publiez ' +
      'votre page publique avec programme, lieu et intervenants.',
    fees: 'Une commission est prélevée sur chaque billet vendu.',
    payout: 'Les recettes sont reversées selon la politique de remboursement définie.',
  },
  DONATION: {
    title: 'Dons & Cagnottes',
    description:
      'Lancez une cagnotte, définissez un objectif (optionnel) et laissez ' +
      'la communauté contribuer, avec ou sans compte.',
    fees: 'Une commission est prélevée sur chaque don.',
    payout: 'Les dons collectés sont reversés selon votre calendrier de retrait.',
  },
  CROWDFUNDING: {
    title: 'Crowdfunding',
    description:
      'Présentez votre projet, définissez des paliers de contribution avec ' +
      'contreparties, et suivez votre financement en temps réel.',
    fees: 'Une commission est prélevée sur chaque contribution confirmée.',
    payout: 'Les fonds sont reversés selon votre calendrier de retrait.',
  },
  SPONSORING: {
    title: 'Sponsoring',
    description:
      'Déposez un dossier (audience, budget recherché, contreparties) et ' +
      'mettez votre événement en avant auprès de marques prêtes à investir en visibilité.',
    fees: 'Aucune commission prélevée sur la mise en relation elle-même.',
    payout: "Les modalités financières sont négociées directement entre l'organisateur et la marque.",
  },
  CONTEST: {
    title: 'Jeux-Concours & Tombolas',
    description:
      'Définissez les lots et les conditions de participation, laissez vos ' +
      'participants s’inscrire ou acheter des tickets, puis lancez un tirage automatique et certifié.',
    fees: 'Une commission est prélevée sur chaque ticket ou participation payante.',
    payout: 'Les lots et gains sont reversés selon le calendrier défini à la création du jeu.',
  },
};

/**
 * Retourne le contenu explicatif pour un type d'événement donné.
 * Retourne null si aucun contenu n'est défini pour ce type (le composant
 * appelant doit gérer ce cas sans planter — voir HowItWorksBlock.jsx).
 *
 * @param {string} type - une des valeurs retournées par getAvailableEventTypes()
 * @returns {{title: string, description: string, fees: string, payout: string} | null}
 */
export function getHowItWorksContent(type) {
  return CONTENT_BY_TYPE[type] ?? null;
}
