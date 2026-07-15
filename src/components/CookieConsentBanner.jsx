import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { withVisitorHeader } from '../lib/visitorId';

// Version de la politique de confidentialité au moment du consentement —
// à incrémenter si le texte légal change substantiellement, pour pouvoir
// redemander le consentement (voir gdpr_consents.policy_version en base).
const POLICY_VERSION = '2026-07-09';
const CONSENT_STORAGE_KEY = 'moledi_cookie_consent';

function recordConsent(accepted) {
  fetch('/api/visitors/consent', {
    method: 'POST',
    headers: withVisitorHeader({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ accepted, policy_version: POLICY_VERSION }),
  }).catch(() => {
    /* non bloquant — le choix reste valable localement même si l'API est indisponible */
  });
}

/**
 * Bandeau de consentement cookies/RGPD — affiché une seule fois, à la
 * première visite (ou si la politique a changé de version depuis le
 * dernier consentement). N'interfère jamais avec le cookie moledi_visitor_id
 * (posé indépendamment dès le chargement de l'app, voir lib/visitorId.js) :
 * ce bandeau ne fait qu'enregistrer le CHOIX du visiteur, il ne pose ni ne
 * lit ce cookie technique lui-même.
 */
export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let stored = null;
    try {
      stored = JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY) || 'null');
    } catch {
      stored = null;
    }
    if (!stored || stored.policyVersion !== POLICY_VERSION) {
      setVisible(true);
    }
  }, []);

  function respond(accepted) {
    try {
      localStorage.setItem(
        CONSENT_STORAGE_KEY,
        JSON.stringify({ accepted, policyVersion: POLICY_VERSION, at: Date.now() })
      );
    } catch {
      /* localStorage indisponible — le consentement reste enregistré côté serveur */
    }
    recordConsent(accepted);
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-label="Consentement aux cookies"
          data-no-translate
          className="fixed inset-x-0 bottom-0 z-[70] p-4 sm:p-5"
        >
          <div className="max-w-4xl mx-auto rounded-2xl border border-ink-200 bg-white shadow-2xl px-5 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="text-sm text-ink-700 normal-case flex-1">
              Nous utilisons des cookies et un identifiant visiteur pour faire fonctionner le site, mesurer son
              audience et améliorer votre expérience. En continuant, vous acceptez notre{' '}
              <a href="/cookies" className="text-primary font-semibold hover:underline">
                politique cookies
              </a>{' '}
              et notre{' '}
              <a href="/confidentialite" className="text-primary font-semibold hover:underline">
                politique de confidentialité
              </a>
              .
            </p>
            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => respond(false)}
                className="flex-1 sm:flex-initial text-sm font-semibold px-4 py-2.5 rounded-xl text-ink-700 border border-ink-200 hover:bg-ink-100 transition-colors"
              >
                Refuser
              </button>
              <button
                type="button"
                onClick={() => respond(true)}
                className="flex-1 sm:flex-initial btn btn-primary !py-2.5"
              >
                J'accepte
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
