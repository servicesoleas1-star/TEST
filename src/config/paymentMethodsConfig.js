// config/paymentMethodsConfig.js
//
// Liste préparée à l'avance de tous les moyens de paiement possibles sur la
// plateforme, avec leur vrai logo (CDN simpleicons.org, vérifié en ligne),
// pour la page /tarifs. Contrairement à /api/payment-methods (qui ne
// reflète que les agrégateurs déjà configurés en base pour tester un
// paiement réel), cette liste est statique et volontairement plus large :
// elle sert de catalogue visuel, indépendant du backend, chargé une seule
// fois et réutilisé partout où un logo de moyen de paiement est affiché.
//
// `integrated: true` = déjà utilisable sur la plateforme aujourd'hui
// (correspond aux agrégateurs réellement configurés dans la base de démo :
// Orange Money Cameroun, MTN Mobile Money). Les autres sont "Bientôt
// disponible" -- affichés pour montrer la direction, pas encore activables.
//
// Chaque logo vient de cdn.simpleicons.org/<slug> (icônes de marque
// officielles, couleur de marque appliquée automatiquement). Les moyens de
// paiement mobile money spécifiquement africains qui n'existent pas dans
// cette bibliothèque (Moov Money, Wave) n'ont pas de logo_url : le composant
// d'affichage bascule alors sur une icône générique par type, jamais une
// image cassée.

export const PAYMENT_METHODS = [
  { key: 'orange_money', operator: 'Orange Money', method: 'MOBILE_MONEY', method_label: 'Mobile Money', logo_url: 'https://cdn.simpleicons.org/orange/FF6600', integrated: true },
  // MTN a bien un slug sur simpleicons.org -- l'ancienne valeur `null`
  // faisait toujours tomber sur l'icône générique alors qu'un vrai logo est
  // disponible. OperatorLogo() a un fallback onError vers l'icône générique
  // si jamais ce slug venait à changer, donc aucun risque d'image cassée.
  { key: 'mtn_momo', operator: 'MTN Mobile Money', method: 'MOBILE_MONEY', method_label: 'Mobile Money', logo_url: 'https://cdn.simpleicons.org/mtn/FFCC00', integrated: true },
  { key: 'moov_money', operator: 'Moov Money', method: 'MOBILE_MONEY', method_label: 'Mobile Money', logo_url: 'https://cdn.simpleicons.org/moov/0A6EBD', integrated: false },
  { key: 'wave', operator: 'Wave', method: 'MOBILE_MONEY', method_label: 'Mobile Money', logo_url: null, integrated: false },
  { key: 'airtel_money', operator: 'Airtel Money', method: 'MOBILE_MONEY', method_label: 'Mobile Money', logo_url: 'https://cdn.simpleicons.org/airtel/E40000', integrated: false },
  { key: 'visa', operator: 'Visa', method: 'CARD', method_label: 'Carte bancaire', logo_url: 'https://cdn.simpleicons.org/visa/1A1F71', integrated: false },
  { key: 'mastercard', operator: 'Mastercard', method: 'CARD', method_label: 'Carte bancaire', logo_url: 'https://cdn.simpleicons.org/mastercard/EB001B', integrated: false },
  { key: 'paypal', operator: 'PayPal', method: 'PAYPAL', method_label: 'PayPal', logo_url: 'https://cdn.simpleicons.org/paypal/00457C', integrated: false },
  { key: 'apple_pay', operator: 'Apple Pay', method: 'CARD', method_label: 'Portefeuille mobile', logo_url: 'https://cdn.simpleicons.org/applepay/000000', integrated: false },
  { key: 'google_pay', operator: 'Google Pay', method: 'CARD', method_label: 'Portefeuille mobile', logo_url: 'https://cdn.simpleicons.org/googlepay/4285F4', integrated: false },
  { key: 'western_union', operator: 'Western Union', method: 'MOBILE_MONEY', method_label: 'Transfert d’argent', logo_url: 'https://cdn.simpleicons.org/westernunion/FFDD00', integrated: false },
];

export function getPaymentMethods() {
  return PAYMENT_METHODS;
}
