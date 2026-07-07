import crypto from "node:crypto";

/**
 * Génère un token cryptographiquement sûr (256 bits), encodé en hex.
 * Utilisé pour la vérification email et la réinitialisation de mot de passe.
 * Toujours généré côté serveur — jamais dérivé de données prévisibles
 * (email, timestamp, id utilisateur...).
 */
export function generateSecureToken() {
  return crypto.randomBytes(32).toString("hex");
}
