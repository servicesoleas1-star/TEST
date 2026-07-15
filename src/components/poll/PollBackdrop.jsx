// components/poll/PollBackdrop.jsx — fond sombre fixe, commun à toutes les
// pages de la section Scrutin & Vote : le même dégradé sombre (navy vers
// noir, `bg-poll-dark`) que la page d'accueil du scrutin, pour que rien ne
// tranche visuellement d'une page à l'autre. Le visuel net de la campagne
// (photo de couverture) reste l'affaire du hero de chaque page (Hero /
// PollSubHero, qui ont déjà leur propre dégradé image -> sombre) ; ce
// composant ne fait que garantir que tout ce qui suit EN DESSOUS continue
// sur exactement le même sombre, sans jamais retomber sur un gris flouté --
// une première version avec une photo floutée à faible opacité produisait
// justement cet effet "gris" indésirable, remplacée ici par un aplat de
// dégradé propre.

export default function PollBackdrop() {
  // z-index négatif + `isolate` sur le conteneur racine de la page (voir
  // chaque page appelante) : sans `isolate`, un `fixed` en z négatif se
  // compare à la pile RACINE du document (aucun ancêtre n'a de contexte
  // d'empilement propre), et se retrouvait peint derrière le fond blanc du
  // wrapper global de App.jsx (`min-h-screen bg-white`, commun à TOUTES les
  // pages du site) -- pas seulement derrière le contenu de cette page,
  // d'où le fond entièrement blanc observé par le passé. `isolate` sur le
  // conteneur de la page crée un nouveau contexte d'empilement qui contient
  // cette comparaison négative localement.
  return <div className="fixed inset-0 -z-10 bg-poll-dark" aria-hidden="true" />;
}

// Classe utilitaire partagée pour tous les blocs "verre dépoli" au-dessus
// du fond flouté : fond translucide + flou local (l'image de fond se
// devine à travers), une seule définition pour rester cohérent partout.
export const glassCard = 'rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl';
