import { illustration } from '../config/media';

/**
 * The 6 Moledi Events universes, ordered as validated by the user.
 * Content for each level:
 *   - level-1 (overview): image + short definition (the "block" seen from far)
 *   - level-2 (zoom 2)  : 3 nested cards → Comment ça marche · Pour qui · Confiance
 */

const u = (id, w = 700) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const universes = [
  {
    id: 'votes',
    label: 'Votes & Scrutins',
    image: illustration.votes,
    definition:
      "Organisez un vote fiable et transparent, du concours de talents à l'élection interne.",
    nested: {
      how: {
        title: 'Comment ça marche',
        text:
          "Création des candidats ou options → les votants paient ou votent gratuitement selon la formule → résultats calculés en direct.",
        image: u('1494172961521-33799ddd43a5'),
      },
      who: {
        title: 'Pour qui',
        text:
          'Concours de beauté / talent, élections associatives, votes communautaires, awards.',
        image: u('1523580494863-6f3031224c94'),
      },
      trust: {
        title: 'Confiance',
        text:
          "Procès-verbal certifié en fin de scrutin, résultats infalsifiables, historique conservé. Chaque vote est horodaté et traçable, pour un résultat que personne ne peut contester.",
        image: u('1450101499163-c8848c66ca85'),
      },
    },
  },
  {
    id: 'billetterie',
    label: 'Billetterie & Événementiel',
    image: illustration.ticketing,
    definition:
      "Vendez vos billets en ligne et gérez tout l'accès à votre événement, du concert à la conférence.",
    nested: {
      how: {
        title: 'Comment ça marche',
        text:
          'Création de la page événement → choix des catégories de billets (prix, quota) → paiement Mobile Money → billet QR envoyé automatiquement.',
        image: u('1501281668745-f7f57925c3b4'),
      },
      who: {
        title: 'Pour qui',
        text: 'Concerts, conférences, ateliers, soirées, spectacles.',
        image: u('1470229722913-7c0e2dbbafd3'),
      },
      trust: {
        title: 'Confiance',
        text:
          "Contrôle d'accès par QR code à l'entrée, suivi des ventes en temps réel, aucun risque de fraude sur les billets. Chaque billet est unique et ne peut être scanné qu'une seule fois.",
        image: u('1533174072545-7a4b6ad7a6c3'),
      },
    },
  },
  {
    id: 'dons',
    label: 'Système de Dons & Cagnottes',
    image: illustration.donations,
    definition:
      "Recevez des dons ou lancez une cagnotte pour une cause, une personne ou un événement personnel.",
    nested: {
      how: {
        title: 'Comment ça marche',
        text:
          "Page de don ou cagnotte avec présentation de la cause → montant libre ou suggéré → contribution Mobile Money en un clic.",
        image: u('1593113630400-ea4288922497'),
      },
      who: {
        title: 'Pour qui',
        text:
          "ONG, associations, causes humanitaires, mariages, funérailles, urgences médicales, cadeaux collectifs.",
        image: u('1509099836639-18ba1795216d'),
      },
      trust: {
        title: 'Confiance',
        text:
          "Reçu automatique, montant collecté visible en temps réel, reversement sécurisé à l'organisateur. Chaque don est enregistré et consultable à tout moment par les donateurs.",
        image: u('1450101499163-c8848c66ca85'),
      },
    },
  },
  {
    id: 'crowdfunding',
    label: 'Crowdfunding',
    image: illustration.crowdfunding,
    definition:
      'Financez votre projet en mobilisant une communauté autour d’un objectif commun.',
    nested: {
      how: {
        title: 'Comment ça marche',
        text:
          "Présentation du projet et de l'objectif financier → contributions des soutiens → suivi de la progression en pourcentage.",
        image: u('1521737604893-d14cc237f11d'),
      },
      who: {
        title: 'Pour qui',
        text: 'Projets entrepreneuriaux, causes sociales, projets créatifs, innovations.',
        image: u('1522202176988-66273c2fd55f'),
      },
      trust: {
        title: 'Confiance',
        text:
          'Transparence sur le montant collecté, mises à jour du porteur de projet, traçabilité des contributions. Les fonds ne sont reversés que si l’objectif ou les paliers annoncés sont respectés.',
        image: u('1454165804606-c3d57bc86b40'),
      },
    },
  },
  {
    id: 'sponsoring',
    label: 'Sponsoring',
    image: illustration.sponsoring,
    definition:
      "Mettez en relation votre événement avec des marques prêtes à investir en visibilité.",
    nested: {
      how: {
        title: 'Comment ça marche',
        text:
          'Dépôt d’un dossier (audience, budget recherché) → mise en avant auprès des marques partenaires → mise en relation directe.',
        image: u('1552664730-d307ca884978'),
      },
      who: {
        title: 'Pour qui',
        text:
          'Organisateurs cherchant des financements, marques cherchant de la visibilité événementielle.',
        image: u('1556742049-0cfed4f6a45d'),
      },
      trust: {
        title: 'Confiance',
        text:
          'Dossiers vérifiés, statistiques d’audience fiables, mise en relation encadrée par la plateforme. Aucun engagement financier n’est pris sans validation des deux parties.',
        image: u('1450101499163-c8848c66ca85'),
      },
    },
  },
  {
    id: 'tombolas',
    label: 'Jeux-Concours & Tombolas',
    image: illustration.contests,
    definition:
      'Organisez un tirage au sort ou un jeu-concours certifié, sans contestation possible.',
    nested: {
      how: {
        title: 'Comment ça marche',
        text:
          'Définition des lots et conditions de participation → inscription ou achat de tickets → tirage automatique et certifié.',
        image: u('1513151233558-d860c5398176'),
      },
      who: {
        title: 'Pour qui',
        text:
          "Promotions commerciales, animations d'événements, levées de fonds ludiques.",
        image: u('1513151233558-d860c5398176'),
      },
      trust: {
        title: 'Confiance',
        text:
          'Algorithme de tirage vérifiable, procès-verbal de tirage, aucune manipulation possible. Le gagnant est désigné publiquement, à l’abri de toute contestation.',
        image: u('1450101499163-c8848c66ca85'),
      },
    },
  },
];
