import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { media, flag } from '../config/media';
import {
  applyLanguage,
  getCurrentDisplayedLanguage,
  loadGoogleTranslateScript,
} from '../services/googleTranslateService';

const navLinks = [
  { label: 'Accueil', href: '/' },
  { label: 'Événements', href: '/evenements' },
  { label: 'Comment ça marche', href: '/comment-ca-marche' },
  { label: 'Tarifs', href: '/tarifs' },
  { label: 'À propos', href: '/a-propos' },
  { label: 'Partenaires', href: '/partenaire' },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: -10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const LANGUAGE_OPTIONS = [
  { code: 'FR', country: 'fr', label: 'FR' },
  { code: 'EN', country: 'gb', label: 'EN' },
];

/**
 * Bouton drapeau + FR/EN qui ouvre un mini menu pour choisir la langue --
 * branché sur le vrai service de traduction (googleTranslateService.js) :
 * la préférence est mémorisée (localStorage + visitors.language) et la
 * page courante est retraduite en place, sans rechargement complet dans le
 * cas courant (voir applyLanguage()).
 */
export function LanguageButton() {
  const [lang, setLang] = useState('FR');
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const current = LANGUAGE_OPTIONS.find((o) => o.code === lang) || LANGUAGE_OPTIONS[0];

  useEffect(() => {
    // Le drapeau affiché doit toujours refléter ce qui est RÉELLEMENT
    // traduit à l'écran (cookie googtrans), pas une préférence mémorisée à
    // part qui peut se désynchroniser -- voir getCurrentDisplayedLanguage().
    setLang(getCurrentDisplayedLanguage());
    // Le widget doit être présent sur la page pour pouvoir traduire, qu'on
    // soit en FR (rien à traduire) ou déjà en EN au chargement.
    loadGoogleTranslateScript();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = () => setOpen(false);
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [open]);

  async function handleSelect(code) {
    setOpen(false);
    if (code === lang) return;
    setSwitching(true);
    setLang(code);
    try {
      await applyLanguage(code);
    } finally {
      setSwitching(false);
    }
  }

  return (
    // notranslate + translate="no" -- les VRAIS attributs que Google
    // Translate respecte (contrairement à l'ancien data-no-translate, qui
    // n'existe pas dans son API et ne faisait donc rien) : sans ça, Google
    // traduisait le mot "en" du bouton comme la préposition française et
    // affichait "IN" au lieu du code langue "EN" une fois la page traduite.
    // Les codes langue ne doivent JAMAIS être traduits, quelle que soit la
    // langue active.
    <div className="relative notranslate" translate="no" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Changer de langue"
        disabled={switching}
        className="relative w-9 h-9 rounded-full border border-ink-200 overflow-hidden flex items-center justify-center hover:border-primary transition-colors disabled:opacity-60"
      >
        <img src={flag(current.country, 40)} alt="" className="w-full h-full object-cover" />
        <span className="absolute inset-x-0 bottom-0 bg-ink-900/70 text-white text-[8px] font-bold tracking-wide text-center leading-tight py-[1px]">
          {current.label}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-32 rounded-xl border border-ink-200 bg-white shadow-xl overflow-hidden z-50"
          >
            {LANGUAGE_OPTIONS.map((o) => (
              <li key={o.code}>
                <button
                  type="button"
                  onClick={() => handleSelect(o.code)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-ink-100 transition-colors ${
                    o.code === lang ? 'font-semibold text-primary' : 'text-ink-900'
                  }`}
                >
                  <img src={flag(o.country, 40)} alt="" className="w-6 h-4 object-cover rounded shadow-sm" />
                  {o.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Header for interior pages (Tarifs, Confidentialité, ...) — light, solid
 * white bar with a subtle bottom border, matching the Contact page's design
 * language instead of the homepage's dark hero navbar.
 */
function SiteHeader({ activeHref }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => (document.body.style.overflow = '');
  }, [open]);

  return (
    <>
    <motion.header
      initial="hidden"
      animate="show"
      variants={container}
      data-no-translate
      className="fixed top-0 inset-x-0 z-[60] bg-white/95 backdrop-blur-xl border-b border-ink-200"
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
        <motion.div variants={item}>
          <a href="/" className="flex items-center shrink-0" aria-label="Moledi Event">
            <img src={media.logo} alt="Moledi Event" className="h-9 sm:h-10 w-auto object-contain" />
          </a>
        </motion.div>

        <motion.ul variants={container} className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const isActive = activeHref === link.href;
            return (
              <motion.li key={link.href} variants={item}>
                <a
                  href={link.href}
                  className={`relative px-3 py-2 text-[13px] font-semibold rounded-lg transition-colors group ${
                    isActive ? 'text-primary' : 'text-ink-700 hover:text-primary'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-primary origin-left transition-transform duration-300 ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </a>
              </motion.li>
            );
          })}
        </motion.ul>

        <div className="hidden lg:flex items-center gap-3">
          <motion.div variants={item}>
            <LanguageButton />
          </motion.div>
          <motion.a
            variants={item}
            href="/connexion"
            className="text-sm font-semibold px-4 py-2 rounded-lg text-ink-700 hover:text-primary transition-colors"
          >
            Connexion
          </motion.a>
          <motion.a variants={item} href="/inscription" whileTap={{ scale: 0.97 }} className="btn btn-primary">
            Créer un événement
          </motion.a>
        </div>

        <div className="flex lg:hidden items-center gap-1.5">
          <motion.div variants={item}>
            <LanguageButton />
          </motion.div>
          <motion.button
            variants={item}
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="hamburger-btn relative w-11 h-11 flex items-center justify-center rounded-lg text-ink-900 hover:bg-ink-100 transition-colors"
          >
            <span className="relative w-5 h-4 block">
              <motion.span
                className="absolute left-0 top-0 w-5 h-[2.5px] rounded-full bg-current"
                animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.span
                className="absolute left-0 top-[7px] w-5 h-[2.5px] rounded-full bg-current"
                animate={open ? { opacity: 0, x: -6 } : { opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="absolute left-0 bottom-0 w-5 h-[2.5px] rounded-full bg-current"
                animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              />
            </span>
          </motion.button>
        </div>
      </nav>
    </motion.header>
    <MobileMenu open={open} onClose={() => setOpen(false)} links={navLinks} activeHref={activeHref} />
    </>
  );
}

function MobileMenu({ open, onClose, links, activeHref }) {
  const panel = {
    hidden: { clipPath: 'circle(0% at calc(100% - 34px) 34px)' },
    show: {
      clipPath: 'circle(150% at calc(100% - 34px) 34px)',
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
      clipPath: 'circle(0% at calc(100% - 34px) 34px)',
      transition: { duration: 0.4, ease: [0.4, 0, 1, 1] },
    },
  };
  const overlay = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.25 } },
  };
  const list = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.25 } } };
  const li = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            variants={overlay}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 z-50 lg:hidden bg-ink-900/40 backdrop-blur-sm"
          />
          <motion.div
            variants={panel}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed inset-0 z-50 lg:hidden bg-white flex flex-col pt-16 sm:pt-20"
            data-no-translate
          >
            <motion.ul variants={list} initial="hidden" animate="show" className="flex-1 px-6 pt-6 overflow-y-auto">
              {links.map((l) => (
                <motion.li key={l.href} variants={li} className="border-b border-ink-200">
                  <a
                    href={l.href}
                    onClick={onClose}
                    className={`block py-3.5 text-[15px] font-semibold transition-colors ${
                      activeHref === l.href ? 'text-primary' : 'text-ink-900 hover:text-primary'
                    }`}
                  >
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </motion.ul>

            <div className="p-6 border-t border-ink-200 space-y-3">
              <a href="/inscription" onClick={onClose} className="btn btn-primary w-full py-3">
                Créer un événement
              </a>
              <a
                href="/connexion"
                onClick={onClose}
                className="block w-full py-3 rounded-xl font-semibold text-sm text-center text-ink-900 border border-ink-200 hover:bg-ink-100 transition-colors"
              >
                Connexion
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default SiteHeader;
