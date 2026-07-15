/**
 * node-postgres ne parse automatiquement que les tableaux de types intégrés
 * (text[], int[]...) — un tableau d'un type ENUM personnalisé (ex.
 * payment_method[]) revient tel quel, en texte brut au format Postgres
 * ("{MOBILE_MONEY,CARD}"), et non comme un vrai tableau JS. Sans ce
 * parsing, tout `.map()`/`.length` côté frontend plante dès qu'une vraie
 * ligne arrive (voir bug LAN-08 : la page Tarifs apparaissait puis
 * disparaissait). "{}" -> [].
 *
 * Utilisé par countriesStore.js (country_configs.methods_available) et
 * paymentMethodsStore.js (aggregators.payment_methods) — toute nouvelle
 * requête qui expose un tableau d'ENUM au frontend doit passer par ici.
 */
export function parsePgEnumArray(raw) {
  if (Array.isArray(raw)) return raw; // déjà parsé (type intégré, ou driver reconfiguré)
  if (typeof raw !== "string") return [];
  const trimmed = raw.trim();
  if (trimmed === "{}" || trimmed === "") return [];
  return trimmed.replace(/^\{/, "").replace(/\}$/, "").split(",").map((v) => v.trim());
}
