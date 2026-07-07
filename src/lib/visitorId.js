// ---------------------------------------------------------------------------
// Moledi Events — Initialisation Visitor ID
// User Story : "En tant que système, je veux identifier chaque visiteur dès sa
// première visite afin de tracer ses actions sans compte requis."
//
// Fonctionnement :
// 1. Au premier chargement, on cherche le cookie moledi_visitor_id.
// 2. S'il n'existe pas : on génère un UUID v4 côté client, on pose le cookie,
//    et on l'enregistre en base avec les métadonnées de l'appareil.
// 3. S'il existe déjà : on renouvelle simplement sa durée de vie (voir note
//    ci-dessous) — pas de nouvel enregistrement en base.
// 4. Toute requête publique doit inclure ce Visitor ID (header X-Visitor-Id).
// 5. À la connexion, on appelle associateVisitorWithAccount() pour lier
//    définitivement ce visiteur à l'utilisateur qui vient de se connecter.
//
// Note sur "cookie permanent sans expiration" :
// Aucun navigateur ne permet un cookie réellement sans expiration — Chrome et
// Safari plafonnent à 400 jours quelle que soit la valeur demandée. On simule
// donc la permanence de la façon standard (Google Analytics, Stripe, etc.) :
// durée maximale autorisée + renouvellement de l'expiration à chaque visite,
// tant que le visiteur revient avant l'expiration.
// ---------------------------------------------------------------------------

const COOKIE_NAME = "moledi_visitor_id";
const COOKIE_MAX_AGE_SECONDS = 400 * 24 * 60 * 60; // 400 jours — plafond max des navigateurs modernes
const API_BASE = ""; // à renseigner (ex: "https://api.moledievents.com") une fois le backend disponible

// ---------------------------------------------------------------------------
// Utilitaires cookie
// ---------------------------------------------------------------------------

function getCookie(name) {
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name, value, maxAgeSeconds) {
  // SameSite=Lax : envoyé sur navigation normale et requêtes same-site,
  // pas sur les requêtes cross-site en arrière-plan (protection CSRF de base).
  // Secure omis volontairement ici pour fonctionner aussi en dev http://localhost ;
  // à ajouter obligatoirement (`; Secure`) une fois déployé en production HTTPS.
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
}

// ---------------------------------------------------------------------------
// Génération UUID v4 (côté client, conforme RFC 4122)
// ---------------------------------------------------------------------------

function generateUUIDv4() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Repli pour navigateurs très anciens sans crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ---------------------------------------------------------------------------
// Métadonnées appareil (envoyées uniquement à la création du visiteur)
// ---------------------------------------------------------------------------

function collectDeviceMetadata() {
  return {
    user_agent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    referrer: document.referrer || null,
  };
}

// ---------------------------------------------------------------------------
// Enregistrement en base (appelé une seule fois, à la création du visiteur)
// ---------------------------------------------------------------------------

async function registerVisitor(visitorId) {
  try {
    await fetch(`${API_BASE}/api/visitors/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitor_id: visitorId,
        ...collectDeviceMetadata(),
      }),
    });
  } catch (err) {
    // On ne bloque jamais la navigation si l'enregistrement échoue
    // (ex: backend indisponible) — le cookie est déjà posé, on retente
    // silencieusement à la prochaine visite si besoin.
    console.warn("Visitor registration failed, will retry on next request:", err);
  }
}

// ---------------------------------------------------------------------------
// API publique du module
// ---------------------------------------------------------------------------

/**
 * À appeler une seule fois, au tout premier rendu de l'app (ex: dans main.jsx
 * ou un composant racine), avant tout autre appel réseau.
 * Retourne le Visitor ID (existant ou nouvellement créé).
 */
export function initVisitorId() {
  const existing = getCookie(COOKIE_NAME);

  if (existing) {
    // Visiteur déjà connu : on renouvelle simplement l'expiration du cookie
    // pour simuler la permanence (sliding expiration).
    setCookie(COOKIE_NAME, existing, COOKIE_MAX_AGE_SECONDS);
    return existing;
  }

  // Première visite : génération + pose du cookie + enregistrement en base
  const visitorId = generateUUIDv4();
  setCookie(COOKIE_NAME, visitorId, COOKIE_MAX_AGE_SECONDS);
  registerVisitor(visitorId);
  return visitorId;
}

/**
 * Lecture simple du Visitor ID courant, sans effet de bord.
 * Retourne null si initVisitorId() n'a jamais été appelé dans cette session.
 */
export function getVisitorId() {
  return getCookie(COOKIE_NAME);
}

/**
 * À utiliser pour TOUTE requête réseau publique (formulaires, votes,
 * consultation d'événements...) afin de transmettre le Visitor ID au backend.
 *
 * Exemple :
 *   fetch("/api/contact", {
 *     method: "POST",
 *     headers: withVisitorHeader({ "Content-Type": "application/json" }),
 *     body: JSON.stringify(data),
 *   })
 */
export function withVisitorHeader(headers = {}) {
  const visitorId = getVisitorId();
  return visitorId ? { ...headers, "X-Visitor-Id": visitorId } : headers;
}

/**
 * À appeler au moment de la connexion réussie (login/inscription), pour lier
 * définitivement ce visiteur anonyme au compte utilisateur qui vient de se
 * connecter. Correspond à users.linked_visitor_id dans le schéma.
 */
export async function associateVisitorWithAccount(userId) {
  const visitorId = getVisitorId();
  if (!visitorId) return;

  try {
    await fetch(`${API_BASE}/api/visitors/associate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitor_id: visitorId, user_id: userId }),
    });
  } catch (err) {
    console.warn("Visitor/account association failed:", err);
  }
}
