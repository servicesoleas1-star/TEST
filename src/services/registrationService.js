// services/registrationService.js
//
// Validation des champs + vérification d'unicité de l'email + soumission
// de l'inscription. Toute la logique métier vit ici, séparée du
// composant de formulaire (même principe que sur les tickets Landing
// Pages précédents : la logique est testable indépendamment d'un rendu
// React).
//
// ⚠️ SÉCURITÉ -- points non négociables de ce ticket :
// - Le mot de passe part TOUJOURS en clair vers le serveur (via HTTPS).
//   Le hachage bcrypt (coût >= 12) est fait côté serveur, jamais ici.
// - Le token de vérification email est généré et stocké côté serveur
//   (table Token, type EMAIL_VERIFICATION, champ `used` à false). Ce
//   fichier ne fait que déclencher son envoi, jamais le générer lui-même.
// - Aucune donnée sensible (mot de passe en clair) n'est jamais loguée
//   dans la console, y compris dans les mocks ci-dessous.

import { withVisitorHeader } from '../lib/visitorId';
import { isPasswordAcceptable } from './passwordStrengthService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_FULL_NAME_LENGTH = 3;
const MIN_PHONE_LENGTH = 8;

// --- Validation ------------------------------------------------------------

/**
 * Validation synchrone (tout sauf l'unicité de l'email, qui est asynchrone
 * -- voir checkEmailAvailability ci-dessous).
 *
 * @param {{ fullName: string, email: string, phoneCountryCode: string, phone: string, password: string, acquisitionSourceId: string, cguAccepted: boolean }} data
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validateRegistration(data) {
  const errors = {};

  if (!data.fullName || data.fullName.trim().length < MIN_FULL_NAME_LENGTH) {
    errors.fullName = `Le nom complet doit contenir au moins ${MIN_FULL_NAME_LENGTH} caractères.`;
  }

  if (!data.email || !EMAIL_REGEX.test(data.email)) {
    errors.email = 'Adresse email invalide.';
  }

  if (!data.phone || data.phone.trim().length < MIN_PHONE_LENGTH) {
    errors.phone = 'Numéro de téléphone invalide.';
  }

  if (!isPasswordAcceptable(data.password)) {
    errors.password = 'Le mot de passe doit contenir au moins 8 caractères.';
  }

  if (!data.acquisitionSourceId) {
    errors.acquisitionSourceId = 'Merci de préciser comment vous nous avez connus.';
  }

  if (!data.cguAccepted) {
    errors.cguAccepted = "Vous devez accepter les CGU pour créer un compte.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// --- Vérification d'unicité de l'email (temps réel) ------------------------
//
// Cahier des charges : "email unique validé dynamiquement" -- vérifié
// pendant la saisie (avec un debounce côté composant, pas ici), pas
// seulement à la soumission finale.
//
// Note importante sur la sécurité : contrairement à un formulaire de
// CONNEXION (où on ne doit jamais révéler si un email existe, pour éviter
// l'énumération de comptes), il est normal et attendu, sur un formulaire
// D'INSCRIPTION, de dire explicitement "cet email est déjà utilisé" --
// c'est une exigence UX standard partout, et le critère de ce ticket la
// demande explicitement. Le principe "message d'erreur générique" mentionné
// dans le contexte du module s'applique à la page de CONNEXION, pas ici
// (voir traçabilité en fin de documentation pour la justification détaillée).

/**
 * @param {string} email
 * @returns {Promise<{ available: boolean }>}
 */
export async function checkEmailAvailability(email) {
  try {
    const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
    if (!res.ok) return { available: true }; // ne bloque jamais la saisie sur une erreur réseau
    const data = await res.json();
    return { available: Boolean(data.available) };
  } catch {
    return { available: true };
  }
}

// --- Soumission --------------------------------------------------------------

/**
 * @param {{ fullName: string, email: string, phoneCountryCode: string, phone: string, password: string, acquisitionSourceId: string, cguAccepted: boolean }} data
 * @returns {Promise<{ success: boolean, redirectTo?: string }>}
 */
export async function submitRegistration(data) {
  const { valid, errors } = validateRegistration(data);
  if (!valid) {
    throw new Error('INVALID_REGISTRATION: ' + JSON.stringify(errors));
  }

  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: withVisitorHeader({ 'Content-Type': 'application/json' }),
    // Le mot de passe part en clair vers le serveur (via HTTPS) : c'est lui
    // qui le hache avec bcrypt avant stockage, jamais ce client.
    body: JSON.stringify({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      phone: data.phone,
      phoneCountryCode: data.phoneCountryCode,
      acquisitionSourceId: data.acquisitionSourceId,
    }),
  });

  const responseData = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 409) {
      throw new Error('EMAIL_ALREADY_USED');
    }
    throw new Error(responseData.error || 'REGISTRATION_FAILED');
  }

  return { success: true, redirectTo: responseData.redirect_to };
}
