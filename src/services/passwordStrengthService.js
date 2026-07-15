// services/passwordStrengthService.js
//
// Calcule un score de robustesse pour le mot de passe saisi, utilisé par
// l'indicateur visuel du formulaire (critère d'acceptation "indicateur
// robustesse mot de passe").
//
// ⚠️ SÉCURITÉ -- lire avant de toucher à ce fichier ou au formulaire :
// Ce fichier ne fait QUE calculer un score d'affichage. Il ne doit JAMAIS
// être utilisé pour hacher, transformer ou stocker le mot de passe. Le
// mot de passe part en clair vers le serveur via HTTPS -- c'est le SERVEUR
// qui le hache avec bcrypt (coût >= 12), jamais le client. Un hachage fait
// côté client serait une fausse sécurité : le hash deviendrait alors le
// "vrai" mot de passe utilisable par quiconque l'intercepterait, et bcrypt
// a besoin du mot de passe en clair pour fonctionner correctement côté
// serveur (sel généré par bcrypt lui-même).

const MIN_LENGTH = 8;

/**
 * @param {string} password
 * @returns {{ score: 0|1|2|3|4, label: string, colorVar: string }}
 * score : 0 (vide/très faible) à 4 (excellent)
 */
export function getPasswordStrength(password) {
  if (!password) {
    return { score: 0, label: '', colorVar: 'var(--color-border, #E2E8F0)' };
  }

  let score = 0;
  if (password.length >= MIN_LENGTH) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  const LEVELS = [
    { label: 'Très faible', colorVar: '#DC2626' }, // rouge
    { label: 'Faible', colorVar: '#F97316' }, // orange vif
    { label: 'Moyen', colorVar: 'var(--color-primary, #FF6A00)' }, // orange charte
    { label: 'Fort', colorVar: '#16A34A' }, // vert
    { label: 'Excellent', colorVar: '#15803D' }, // vert foncé
  ];

  return { score, ...LEVELS[score] };
}

/**
 * Règle minimale acceptée pour soumettre le formulaire -- volontairement
 * plus permissive que le score visuel "Excellent", pour ne pas bloquer un
 * mot de passe raisonnable juste parce qu'il n'a pas de caractère spécial.
 * @param {string} password
 * @returns {boolean}
 */
export function isPasswordAcceptable(password) {
  return Boolean(password) && password.length >= MIN_LENGTH;
}
