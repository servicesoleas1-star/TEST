/**
 * Valide que redirect_to est un chemin interne relatif (ex: "/dashboard"),
 * jamais une URL absolue vers un autre domaine (protection open-redirect).
 *
 * Accepté  : "/dashboard", "/inscription/profil", "/evenements/paris-2026"
 * Refusé   : "https://evil.com", "//evil.com", "http:evil.com", "javascript:..."
 */
export function isValidInternalRedirect(redirectTo) {
  if (!redirectTo || typeof redirectTo !== "string") return false;

  // Doit commencer par un seul "/" (pas "//" qui est une URL protocol-relative
  // vers un autre domaine), et ne contenir aucun schéma (http:, javascript:...)
  if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(redirectTo)) return false;

  return true;
}

/**
 * Retourne une redirection sûre : celle demandée si valide, sinon une
 * destination par défaut. Ne jamais rediriger vers l'entrée brute sans
 * être passé par cette validation.
 */
export function safeRedirect(redirectTo, fallback = "/dashboard") {
  return isValidInternalRedirect(redirectTo) ? redirectTo : fallback;
}
