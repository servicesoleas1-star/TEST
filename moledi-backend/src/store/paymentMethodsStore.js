import { pool } from "../db/pool.js";
import { parsePgEnumArray } from "../utils/pgArray.js";

// Couleurs de marque pour les opérateurs reconnus (repli neutre sinon) --
// utilisées par OperatorLogo/PaymentLogoChip côté frontend quand aucune
// image de logo n'est configurée : un badge coloré avec les initiales de
// l'opérateur plutôt qu'un logo générique. Le schéma actuel (aggregators)
// n'a pas de colonne logo_url ; ce mapping reste donc la source de vérité
// des couleurs tant qu'elle n'existe pas.
const OPERATOR_BRAND = [
  { match: "Orange Money", bg: "#FF6600", fg: "#FFFFFF" },
  { match: "MTN Mobile Money", bg: "#FFCC00", fg: "#0B1324" },
  { match: "MTN", bg: "#FFCC00", fg: "#0B1324" },
  { match: "Moov", bg: "#0A6EBD", fg: "#FFFFFF" },
  { match: "Wave", bg: "#1DC8CD", fg: "#0B1324" },
  { match: "Carte", bg: "#2B6BFF", fg: "#FFFFFF" },
];

function brandFor(operatorName) {
  const found = OPERATOR_BRAND.find((b) => operatorName.includes(b.match));
  return found ? { bg: found.bg, fg: found.fg } : { bg: "#F2F2F2", fg: "#0B1324" };
}

const METHOD_LABELS = { MOBILE_MONEY: "Mobile Money", CARD: "Carte bancaire", PAYPAL: "PayPal" };

/**
 * Liste des opérateurs de paiement (Aggregator table) avec leur nom réel
 * (ex. "Orange Money Cameroun"), pas seulement le type générique
 * (MOBILE_MONEY/CARD) -- c'est ce nom qui s'affiche sur les pages Accueil
 * et Tarifs. `active` sur l'agrégateur pilote le badge "déjà disponible"
 * vs. "prochainement" côté frontend (champ `integrated`).
 */
export async function listPaymentMethods() {
  const { rows } = await pool.query(
    `SELECT name, countries, payment_methods, active
       FROM aggregators
       ORDER BY priority`
  );

  return rows.map((row) => {
    const methods = parsePgEnumArray(row.payment_methods);
    const brand = brandFor(row.name);
    return {
      operator: row.name,
      integrated: row.active,
      countries: row.countries || [],
      method: methods[0] || null,
      method_label: methods.map((m) => METHOD_LABELS[m] || m).join(" / "),
      logo_url: null, // pas de logo image configuré -> repli sur badge coloré (bg/fg)
      bg: brand.bg,
      fg: brand.fg,
    };
  });
}
