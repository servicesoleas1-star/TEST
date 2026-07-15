// ---------------------------------------------------------------------------
// Session organisateur (espace /dashboard).
//
// sessionStorage.moledi_session_email reste la source rapide et synchrone
// utilisée par toutes les pages existantes (getOrganizerSessionEmail) — elle
// ne survit cependant pas à la fermeture de l'onglet/navigateur.
//
// Depuis l'ajout d'une vraie session serveur (cookies httpOnly moledi_session
// / moledi_refresh, voir moledi-backend/src/middleware/auth.js), une fenêtre
// glissante de 2h (rafraîchie jusqu'à 30 jours via le refresh token) est
// maintenue côté backend indépendamment de sessionStorage. hydrateOrganizerSession()
// fait le pont entre les deux : si sessionStorage est vide (nouvel onglet,
// navigateur rouvert) mais qu'un cookie de session valide existe encore,
// elle interroge /api/auth/me et repeuple sessionStorage — évitant de
// renvoyer l'utilisateur vers /connexion alors que sa session serveur est
// toujours active.
// ---------------------------------------------------------------------------

const SESSION_EMAIL_KEY = "moledi_session_email";

export function getOrganizerSessionEmail() {
  try {
    return sessionStorage.getItem(SESSION_EMAIL_KEY) || "";
  } catch {
    return "";
  }
}

/**
 * À appeler une fois, au montage des pages de l'espace organisateur (voir
 * OrganizerSessionGate). Retourne l'email courant (déjà en sessionStorage,
 * ou retrouvé via la session serveur).
 */
export async function hydrateOrganizerSession() {
  const cached = getOrganizerSessionEmail();
  if (cached) return cached;

  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (!res.ok) return "";
    const data = await res.json();
    if (data?.user?.email) {
      setOrganizerSessionEmail(data.user.email);
      return data.user.email;
    }
  } catch {
    // Backend injoignable : on laisse la page appelante gérer l'absence de session.
  }
  return "";
}

export function setOrganizerSessionEmail(email) {
  try {
    sessionStorage.setItem(SESSION_EMAIL_KEY, email || "");
  } catch {
    // sessionStorage indisponible
  }
}

export function clearOrganizerSession() {
  try {
    sessionStorage.removeItem(SESSION_EMAIL_KEY);
  } catch {
    // no-op
  }
  // Invalide aussi la session serveur (cookies httpOnly) — fire-and-forget,
  // la déconnexion locale ne doit jamais attendre/échouer sur ce réseau.
  fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
}