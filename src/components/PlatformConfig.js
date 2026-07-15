/**
 * Configuration plateforme récupérée depuis le back-office admin
 * (table site_configs, endpoint GET /api/platform/settings).
 *
 * getPlatformConfig() reste synchrone (utilisable en dehors de React, à
 * l'import d'un module) et renvoie toujours une valeur immédiatement : les
 * valeurs de repli ci-dessous tant que le fetch n'a pas encore résolu, puis
 * la vraie configuration une fois chargée. usePlatformConfig() est la
 * version réactive pour les composants qui doivent se re-rendre dès que la
 * vraie config arrive.
 */
import { useEffect, useState } from 'react';

const FALLBACK_CONFIG = {
  supportWhatsAppNumber: '237600000000', // format international, sans "+"
  contactEmail: 'contact@moledievent.com',
  socialLinks: null, // null tant que non chargé -> Footer n'affiche aucune icône plutôt que des liens génériques
};

let cachedConfig = FALLBACK_CONFIG;
let fetchStarted = false;
const listeners = new Set();

function applySettings(settings) {
  cachedConfig = {
    supportWhatsAppNumber: settings?.whatsapp_support || FALLBACK_CONFIG.supportWhatsAppNumber,
    contactEmail: settings?.contact_email || FALLBACK_CONFIG.contactEmail,
    socialLinks: settings?.social_links || null,
  };
  listeners.forEach((listener) => listener(cachedConfig));
}

function ensureFetchStarted() {
  if (fetchStarted) return;
  fetchStarted = true;
  fetch('/api/platform/settings')
    .then((r) => r.json())
    .then((data) => {
      if (data?.ok) applySettings(data.settings);
    })
    .catch(() => {
      // Repli silencieux sur FALLBACK_CONFIG — déjà la valeur courante.
    });
}

/**
 * Valeur synchrone courante (repli tant que le back-office n'a pas
 * répondu). Déclenche le fetch au premier appel si pas déjà en cours.
 */
export function getPlatformConfig() {
  ensureFetchStarted();
  return cachedConfig;
}

/**
 * Version réactive : re-render automatique dès que la vraie configuration
 * back-office est chargée.
 */
export function usePlatformConfig() {
  const [config, setConfig] = useState(cachedConfig);

  useEffect(() => {
    ensureFetchStarted();
    listeners.add(setConfig);
    setConfig(cachedConfig);
    return () => listeners.delete(setConfig);
  }, []);

  return config;
}
