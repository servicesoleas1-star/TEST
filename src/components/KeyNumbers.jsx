// components/KeyNumbers.jsx
//
// Affiche les chiffres clés retournés par getKeyNumbers() (config/kpiConfig.js).
// N'a aucune idée de si c'est la vraie donnée ou le fallback -- il affiche
// juste ce qu'on lui donne. C'est kpiConfig.js qui décide, pas ce composant
// (séparation claire : la donnée décide, l'affichage se contente d'afficher).

/**
 * @param {{ items: Array<{id: string, label: string, value: string}> }} props
 */
export default function KeyNumbers({ items }) {
  if (!items || items.length === 0) {
    // Filet de sécurité supplémentaire : même le fallback ne devrait jamais
    // être vide (voir kpiConfig.js), mais si jamais ça arrivait, on
    // n'affiche rien plutôt qu'une grille cassée.
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.id} className="text-center">
          <p
            className="text-3xl font-bold text-[color:var(--color-primary,#FF6A00)] sm:text-4xl"
            style={{ fontFamily: 'Anton, sans-serif' }}
          >
            {item.value}
          </p>
          <p className="text-sm text-[color:var(--color-slate,#475569)]">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
