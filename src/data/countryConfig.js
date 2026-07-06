/**
 * Country coverage — records shaped EXACTLY on the UML DC-08 `CountryConfig`
 * table (country_code PK, country_name, active, currency, methods_available:
 * PaymentMethod[] = MOBILE_MONEY | CARD | PAYPAL). The aggregator module
 * (Aggregator.countries / payment_methods) feeds this in production; this
 * module is the local stand-in with the same shape, so swapping to a real
 * `from('country_config')` query changes nothing in the UI.
 */

export const countryConfigs = [
  { country_code: 'SN', country_name: 'Sénégal', active: true, currency: 'XOF', methods_available: ['MOBILE_MONEY', 'CARD', 'PAYPAL'] },
  { country_code: 'CI', country_name: "Côte d'Ivoire", active: true, currency: 'XOF', methods_available: ['MOBILE_MONEY', 'CARD', 'PAYPAL'] },
  { country_code: 'CM', country_name: 'Cameroun', active: true, currency: 'XAF', methods_available: ['MOBILE_MONEY', 'CARD'] },
  { country_code: 'ML', country_name: 'Mali', active: true, currency: 'XOF', methods_available: ['MOBILE_MONEY', 'CARD'] },
  { country_code: 'BJ', country_name: 'Bénin', active: true, currency: 'XOF', methods_available: ['MOBILE_MONEY', 'CARD'] },
  { country_code: 'TG', country_name: 'Togo', active: true, currency: 'XOF', methods_available: ['MOBILE_MONEY', 'CARD'] },
  { country_code: 'BF', country_name: 'Burkina Faso', active: true, currency: 'XOF', methods_available: ['MOBILE_MONEY'] },
  { country_code: 'NE', country_name: 'Niger', active: true, currency: 'XOF', methods_available: ['MOBILE_MONEY'] },
  { country_code: 'GN', country_name: 'Guinée', active: true, currency: 'GNF', methods_available: ['MOBILE_MONEY', 'CARD'] },
  { country_code: 'GA', country_name: 'Gabon', active: true, currency: 'XAF', methods_available: ['MOBILE_MONEY', 'CARD'] },
  { country_code: 'CG', country_name: 'Congo', active: true, currency: 'XAF', methods_available: ['MOBILE_MONEY'] },
  { country_code: 'CD', country_name: 'RD Congo', active: true, currency: 'CDF', methods_available: ['MOBILE_MONEY', 'CARD'] },
  { country_code: 'TD', country_name: 'Tchad', active: true, currency: 'XAF', methods_available: ['MOBILE_MONEY'] },
  { country_code: 'MG', country_name: 'Madagascar', active: true, currency: 'MGA', methods_available: ['MOBILE_MONEY', 'CARD'] },
  { country_code: 'RW', country_name: 'Rwanda', active: true, currency: 'RWF', methods_available: ['MOBILE_MONEY', 'CARD'] },
  { country_code: 'MR', country_name: 'Mauritanie', active: true, currency: 'MRU', methods_available: ['MOBILE_MONEY'] },
  { country_code: 'DJ', country_name: 'Djibouti', active: true, currency: 'DJF', methods_available: ['MOBILE_MONEY'] },
  { country_code: 'KM', country_name: 'Comores', active: true, currency: 'KMF', methods_available: ['MOBILE_MONEY'] },
];

// Currency display metadata — symbol + charter-friendly tone for the badge
// "logo" rendered next to each currency code.
export const currencies = {
  XOF: { symbol: 'FCFA', name: 'Franc CFA (UEMOA)', tone: 'orange' },
  XAF: { symbol: 'FCFA', name: 'Franc CFA (CEMAC)', tone: 'blue' },
  CDF: { symbol: 'FC', name: 'Franc congolais', tone: 'orange' },
  GNF: { symbol: 'FG', name: 'Franc guinéen', tone: 'blue' },
  MGA: { symbol: 'Ar', name: 'Ariary malgache', tone: 'orange' },
  RWF: { symbol: 'FRw', name: 'Franc rwandais', tone: 'blue' },
  MRU: { symbol: 'UM', name: 'Ouguiya', tone: 'orange' },
  DJF: { symbol: 'Fdj', name: 'Franc de Djibouti', tone: 'blue' },
  KMF: { symbol: 'CF', name: 'Franc comorien', tone: 'orange' },
};

// UML PaymentMethod enum → human label + short mark for compact chips.
export const paymentMethodMeta = {
  MOBILE_MONEY: { label: 'Mobile Money', short: 'MM' },
  CARD: { label: 'Carte bancaire', short: 'CB' },
  PAYPAL: { label: 'PayPal', short: 'PP' },
};
