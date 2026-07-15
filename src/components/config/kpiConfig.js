// config/kpiConfig.js
//
// Rôle : simuler la table KPISnapshot (DC-10, Moledi_UML_Structure_Final.pdf)
// pour les "chiffres clés" affichés sur la page À propos.
//
// Champs réels de la table (à respecter côté API plus tard) :
//   kpi_id      UUID PK
//   type        KPIType (MAU | ORGANIZER_RETENTION | CONVERSION_RATE |
//                MEDIAN_VOTE_TIME | MONTHLY_PAID_VOTE | ...)
//   value       Decimal
//   period      String
//   computed_at DateTime
//
// Critère d'acceptation du ticket : "chiffres clés dynamiques avec fallback
// statique" -> si la donnée dynamique est indisponible (API en panne, table
// vide...), on affiche une valeur de secours plutôt qu'une section cassée
// ou vide (cf. annexe technique, ticket À propos : "le mécanisme de
// fallback doit être testé").
//
// TODO : remplacer getKeyNumbers() par un vrai appel, par exemple :
//   GET /api/kpi/snapshot?types=EVENTS_CREATED,VOTES_PROCESSED
// Le cache doit avoir un TTL court (ex. 5 min, voir annexe technique) —
// à gérer côté endpoint ou côté React Query / SWR le jour où ce sera branché,
// pas dans ce fichier.

// Valeurs de secours, affichées UNIQUEMENT si la donnée dynamique est
// indisponible. Toujours codées en dur ici par design (ce sont des valeurs
// de repli, pas la source de vérité) — ne jamais les utiliser comme
// source principale.
const FALLBACK_KEY_NUMBERS = [
  { id: 'events_created', label: 'Événements créés', value: '1 000+' },
  { id: 'votes_processed', label: 'Votes traités', value: '50 000+' },
];

// Mock de la table KPISnapshot. Mettre MOCK_API_UNAVAILABLE à true permet
// de tester manuellement le fallback (voir critère d'acceptation) sans
// devoir couper un vrai serveur.
const MOCK_API_UNAVAILABLE = false;

const MOCK_KPI_TABLE = [
  { kpi_id: 'kpi-01', type: 'EVENTS_CREATED', value: 1240, period: 'all_time', computed_at: '2026-07-01T00:00:00Z' },
  { kpi_id: 'kpi-02', type: 'VOTES_PROCESSED', value: 58230, period: 'all_time', computed_at: '2026-07-01T00:00:00Z' },
];

const LABELS_BY_TYPE = {
  EVENTS_CREATED: 'Événements créés',
  VOTES_PROCESSED: 'Votes traités',
};

function formatValue(rawValue) {
  // Formatage simple en "1 240" plutôt que "1240" -- lisibilité seulement,
  // aucune logique métier ici.
  return new Intl.NumberFormat('fr-FR').format(rawValue) + '+';
}

/**
 * Retourne les chiffres clés à afficher. Si la source dynamique est
 * indisponible ou vide, retourne le fallback statique à la place — jamais
 * un tableau vide (ce qui casserait visuellement la section).
 *
 * @returns {{ items: Array<{id: string, label: string, value: string}>, isFallback: boolean }}
 */
export function getKeyNumbers() {
  if (MOCK_API_UNAVAILABLE || MOCK_KPI_TABLE.length === 0) {
    return { items: FALLBACK_KEY_NUMBERS, isFallback: true };
  }

  const items = MOCK_KPI_TABLE.map((kpi) => ({
    id: kpi.kpi_id,
    label: LABELS_BY_TYPE[kpi.type] ?? kpi.type,
    value: formatValue(kpi.value),
  }));

  return { items, isFallback: false };
}
