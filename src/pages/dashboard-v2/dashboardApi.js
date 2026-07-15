// ---------------------------------------------------------------------------
// Dashboard V2 — helpers d'appel API partagés par toutes les pages.
// URLs relatives (proxyfiées par Vite en dev, par nginx en prod — voir
// vite.config.js), cohérent avec lib/session.js plutôt qu'un API_BASE
// absolu codé en dur (pattern historique de OrganizerDashboard.jsx / V1).
// ---------------------------------------------------------------------------

// Si une réponse API dashboard revient 401 (session organisateur expirée),
// on ne laisse pas la page afficher un état cassé/une erreur inline : on
// renvoie directement vers /connexion, comme au premier chargement
// (OrganizerSessionGate), avec un redirect_to pour revenir ici après
// reconnexion.
function redirectToLogin() {
  const redirectTo = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.href = `/connexion?redirect_to=${redirectTo}`;
}

export async function apiGet(path) {
  const res = await fetch(path, { credentials: "include" });
  if (res.status === 401) {
    redirectToLogin();
    return new Promise(() => {}); // navigation en cours, ne pas résoudre
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Erreur de chargement.");
  return data;
}

export async function apiPost(path, body) {
  const res = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  if (res.status === 401) {
    redirectToLogin();
    return new Promise(() => {});
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");
  return data;
}

export async function apiPatch(path, body) {
  const res = await fetch(path, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  if (res.status === 401) {
    redirectToLogin();
    return new Promise(() => {});
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");
  return data;
}

export async function apiDelete(path) {
  const res = await fetch(path, { method: "DELETE", credentials: "include" });
  if (res.status === 401) {
    redirectToLogin();
    return new Promise(() => {});
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");
  return data;
}

export function formatAmount(n) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(n || 0));
}

export function formatDate(d, opts) {
  return new Date(d).toLocaleDateString("fr-FR", opts);
}

export function formatDateTime(d) {
  return new Date(d).toLocaleString("fr-FR");
}
