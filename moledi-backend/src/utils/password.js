import bcrypt from "bcryptjs";

const BCRYPT_COST = parseInt(process.env.BCRYPT_COST || "12", 10);

/**
 * Hache un mot de passe en clair. Jamais stocker le mot de passe en clair,
 * même temporairement en mémoire au-delà du traitement de la requête.
 */
export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, BCRYPT_COST);
}

/**
 * Compare un mot de passe en clair à son hash stocké.
 * Retourne true/false — ne jamais faire de comparaison manuelle (===).
 */
export async function verifyPassword(plainPassword, passwordHash) {
  if (!passwordHash) return false;
  return bcrypt.compare(plainPassword, passwordHash);
}
