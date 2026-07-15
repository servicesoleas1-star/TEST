// services/googleTranslateService.js
//
// Gère toute la mécanique du sélecteur de langue FR/EN :
//  1. Charge le script Google Translate une seule fois (idempotent)
//  2. Applique la langue choisie (cookie 'googtrans' lu par le widget Google)
//  3. Mémorise la préférence utilisateur (localStorage), indépendamment du
//     cookie Google -- pour resservir cette préférence même si le cookie
//     'googtrans' est bloqué/nettoyé par le navigateur.
//
// Cahier des charges (§4.A) : "Sélecteur de langue FR/EN : bascule Google
// Translate avec mise en cache, appliquée immédiatement à toutes les pages
// (publiques + dashboard), préférence mémorisée."
//
// Pourquoi un service séparé du composant d'affichage
// (components/LanguageSwitcher.jsx) : cette logique doit pouvoir être
// appelée depuis N'IMPORTE QUELLE page du site (publique OU dashboard, une
// fois qu'il existera), pas seulement depuis le composant du menu. La
// centraliser ici évite que le dashboard réimplémente sa propre version
// plus tard.

import { withVisitorHeader } from '../lib/visitorId.js';

const GOOGTRANS_COOKIE_NAME = 'googtrans';
const PREFERENCE_STORAGE_KEY = 'moledi_preferred_language';
const SOURCE_LANGUAGE = 'fr'; // langue d'origine du contenu du site

let scriptAlreadyLoading = false;

// --- Mémorisation de la préférence utilisateur ----------------------------
//
// TODO : si l'utilisateur est connecté, la préférence devrait aussi être
// sauvegardée sur UserPreferences.language (DC-02, champ "language" de type
// Language) pour suivre l'utilisateur d'un appareil à l'autre. Pour l'instant
// (visiteur anonyme ou pas encore branché), on se limite au localStorage
// local à cet appareil.

/**
 * @returns {string|null} le code langue mémorisé (ex. 'EN'), ou null si
 * aucune préférence n'a encore été choisie par le visiteur.
 */
export function getStoredLanguagePreference() {
  try {
    return window.localStorage.getItem(PREFERENCE_STORAGE_KEY);
  } catch {
    // localStorage peut être indisponible (navigation privée stricte,
    // politique navigateur...) -- on dégrade proprement plutôt que de planter.
    return null;
  }
}

function storeLanguagePreference(code) {
  try {
    window.localStorage.setItem(PREFERENCE_STORAGE_KEY, code);
  } catch {
    // Idem : on ignore silencieusement, ce n'est pas bloquant pour la
    // traduction elle-même (juste la mémorisation qui échoue).
  }
}

// --- Cookie Google Translate (mécanisme de cache/traduction) -------------
//
// Le widget Google Translate lit ce cookie au chargement de la page pour
// savoir dans quelle langue traduire. Le format attendu par Google est
// "/langue_source/langue_cible", ex. "/fr/en". C'est ce cookie qui fait
// aussi office de "mise en cache" côté navigateur : Google ne re-traduit
// pas depuis zéro à chaque page vue, il réutilise ce réglage.
function setGoogTransCookie(targetLangCode) {
  const value =
    targetLangCode.toLowerCase() === SOURCE_LANGUAGE
      ? '' // revenir à la langue source = effacer la traduction
      : `/${SOURCE_LANGUAGE}/${targetLangCode.toLowerCase()}`;

  // Cookie posé sur tout le site (path=/), sans date d'expiration courte,
  // pour que la préférence survive à la navigation entre pages.
  document.cookie = `${GOOGTRANS_COOKIE_NAME}=${value}; path=/`;
}

/**
 * Langue réellement affichée à l'écran, lue directement depuis le cookie
 * `googtrans` -- la seule vraie source de vérité pour ce que Google est en
 * train de traduire (le localStorage n'est qu'une préférence mémorisée en
 * plus, qui peut se désynchroniser du cookie -- ex. cookie posé/modifié
 * hors de applyLanguage()). Le bouton FR/EN de l'en-tête doit toujours
 * refléter CE cookie, jamais le localStorage seul, pour ne jamais afficher
 * un drapeau qui ne correspond pas à la traduction réellement visible.
 *
 * @returns {'FR'|'EN'}
 */
export function getCurrentDisplayedLanguage() {
  const match = document.cookie.match(/(?:^|; )googtrans=([^;]*)/);
  const value = match ? decodeURIComponent(match[1]) : '';
  // Format Google : "/fr/en" -> cible = dernier segment. Vide ou absent =
  // toujours la langue source (FR).
  const target = value.split('/').pop();
  return target && target.toLowerCase() === 'en' ? 'EN' : 'FR';
}

// --- Chargement du script Google Translate --------------------------------

/**
 * Injecte une feuille de style qui masque les éléments visuels imposés par
 * Google Translate (bannière en haut de page, icône du widget, halo bleu
 * sur le texte traduit...) et empêche le décalage du contenu vers le bas
 * que Google applique par défaut via un style inline sur <body>.
 *
 * Appelé une seule fois (idempotent, vérifie un flag sur window), quel que
 * soit le nombre de pages qui appellent loadGoogleTranslateScript().
 */
// La feuille de style qui masque la bannière/icône Google Translate est
// désormais inline dans index.html <head> (voir ce fichier) -- appliquée
// avant même le premier paint, donc AUCUN flash possible de la barre
// Google, quel que soit le moment où ce script se charge. Cette fonction ne
// sert plus qu'à poser le flag idempotent pour watchAndFixBodyVisibility().
function injectGoogleTranslateHidingStyles() {
  window.__moledi_gt_styles_injected = true;
}

/**
 * Filet de sécurité supplémentaire, en plus du CSS : Google peut parfois
 * réappliquer son style inline "display: none" sur <body> APRÈS le
 * chargement de notre feuille de style (notamment de façon asynchrone,
 * pendant l'initialisation du widget). Un MutationObserver surveille
 * l'attribut style de <body> et corrige immédiatement si jamais Google le
 * repasse à "none" -- sans ça, une page blanche pourrait apparaître
 * quelques centaines de millisecondes, voire rester bloquée si Google
 * n'a jamais fini son initialisation (ex. connexion lente à leur service).
 */
function watchAndFixBodyVisibility() {
  if (window.__moledi_gt_body_watcher_started) {
    return;
  }
  window.__moledi_gt_body_watcher_started = true;

  const fixIfHidden = () => {
    if (document.body && document.body.style.display === 'none') {
      document.body.style.display = 'block';
    }
    if (document.documentElement && document.documentElement.style.display === 'none') {
      document.documentElement.style.display = 'block';
    }
  };

  // 1. Vérification immédiate.
  fixIfHidden();

  // 2. Surveillance continue des changements sur l'attribut style du body
  //    (attrape les cas où Google le change via JS après coup).
  const observer = new MutationObserver(fixIfHidden);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['style'],
    subtree: true,
  });

  // 3. Filet de sécurité brutal mais efficace : on revérifie toutes les
  //    200ms pendant les 6 premières secondes après le chargement (le temps
  //    que Google finisse complètement son initialisation, qui peut être
  //    asynchrone et échapper au MutationObserver dans de rares cas selon
  //    les navigateurs). Après 6 secondes, on arrête pour ne pas tourner
  //    inutilement en arrière-plan pour toujours.
  let elapsed = 0;
  const intervalId = setInterval(() => {
    fixIfHidden();
    elapsed += 200;
    if (elapsed >= 6000) {
      clearInterval(intervalId);
    }
  }, 200);
}

/**
 * Injecte le script Google Translate dans la page, une seule fois même si
 * appelé plusieurs fois (plusieurs composants pourraient l'appeler sur
 * plusieurs pages différentes du site).
 */
export function loadGoogleTranslateScript() {
  injectGoogleTranslateHidingStyles();
  watchAndFixBodyVisibility();

  if (scriptAlreadyLoading || window.google?.translate) {
    return;
  }
  scriptAlreadyLoading = true;

  // Callback attendu par le script Google (nom imposé par leur API).
  window.googleTranslateElementInit = function googleTranslateElementInit() {
    // eslint-disable-next-line no-undef
    new window.google.translate.TranslateElement(
      { pageLanguage: SOURCE_LANGUAGE, autoDisplay: false },
      'google_translate_element'
    );
  };

  const script = document.createElement('script');
  script.src =
    'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  script.async = true;
  document.body.appendChild(script);
}

/**
 * Persiste la langue choisie sur visitors.language (DC-01) pour qu'elle
 * suive le visiteur dans toute sa navigation, y compris le futur dashboard
 * -- fire-and-forget, ne bloque jamais la bascule si le backend est
 * indisponible (même logique que l'enregistrement du visiteur lui-même).
 */
function persistLanguageOnVisitor(code) {
  fetch('/api/visitors/language', {
    method: 'POST',
    headers: withVisitorHeader({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ language: code.toUpperCase() }),
  }).catch(() => {
    /* non bloquant */
  });
}

// --- Point d'entrée public --------------------------------------------------
//
// Note technique (pour la prochaine personne tentée de "juste piloter le
// <select> caché sans reload") : testé et confirmé non fiable -- les
// versions récentes du widget Google Translate n'appliquent pas la
// traduction sur un évènement "change" synthétique (probablement une
// vérification `event.isTrusted` côté Google). Le rechargement reste donc
// la méthode fiable. Toute la navigation publique du site se fait déjà par
// de vrais liens <a href> (pas de <Link> React Router), donc chaque page
// visitée est de toute façon un chargement complet : le cookie googtrans +
// initLanguageOnLoad() suffisent à garder la traduction active sur toute la
// navigation sans logique supplémentaire.

/**
 * Applique une langue : mémorise la préférence, pose le cookie Google
 * Translate, puis recharge la page pour que la traduction s'applique
 * immédiatement sur tout le contenu déjà rendu. Le flash de la bannière
 * Google est déjà exclu par le CSS inline de index.html (voir en tête de
 * fichier) : ce rechargement ne montre jamais l'UI de Google, seulement le
 * résultat traduit.
 *
 * @param {string} code - 'FR' ou 'EN'
 */
export function applyLanguage(code) {
  storeLanguagePreference(code);
  setGoogTransCookie(code);
  persistLanguageOnVisitor(code);
  window.location.reload();
}

/**
 * À appeler au chargement de l'app (une seule fois, ex. dans le layout
 * public) : charge le script Google Translate si une préférence différente
 * de la langue source a déjà été mémorisée, pour que la traduction soit
 * active dès l'arrivée sur le site.
 */
export function initLanguageOnLoad() {
  const stored = getStoredLanguagePreference();
  if (stored && stored.toLowerCase() !== SOURCE_LANGUAGE) {
    loadGoogleTranslateScript();
  }
}
