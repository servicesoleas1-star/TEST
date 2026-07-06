import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { media } from '../config/media';

const navLinks = [
  { label: 'Événements', href: '/evenements' },
  { label: 'Comment ça marche', href: '/comment-ca-marche' },
  { label: 'Tarifs', href: '/tarifs' },
  { label: 'À propos', href: '/a-propos' },
  { label: 'Partenaires', href: '/partenaire' },
];

// The logo is a transparent PNG — no wordmark text is added around it, and
// no light/dark variant swap is needed since it has no baked-in background.
function Logo({ className = 'h-10' }) {
  return (
    <a href="/" className="flex items-center shrink-0" aria-label="Moledi Event">
      <img src={media.logo} alt="Moledi Event" className={`${className} w-auto object-contain`} />
    </a>
  );
}

// Staggered arrival — a single deliberate wave (logo, then links, then
// actions) instead of every element popping in on its own timer.
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};
const item = {
  hidden: { opacity: 0, y: -10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => (document.body.style.overflow = '');
  }, [open]);

  // Text/icons stay white over the transparent (video) header and switch
  // to the ink tone the moment the bar gets its solid background.
  const tone = scrolled ? 'text-ink-900' : 'text-white';

  return (
    <motion.header
      initial="hidden"
      animate="show"
      variants={container}
      data-no-translate
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-15px_rgba(11,19,36,0.15)]'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
        <motion.div variants={item}>
          <Logo className="h-10 sm:h-11" />
        </motion.div>

        {/* Desktop nav */}
        <motion.ul
          variants={container}
          className="hidden lg:flex items-center gap-1 xl:gap-2"
        >
          {navLinks.map((link) => (
            <motion.li key={link.href} variants={item}>
              <a
                href={link.href}
                className={`relative px-3 py-2 text-[13px] font-semibold rounded-lg transition-colors group ${tone} hover:text-primary-300`}
              >
                {link.label}
                <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-primary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
              </a>
            </motion.li>
          ))}
        </motion.ul>

        {/* Desktop actions */}
        <div className="hidden lg:flex items-center gap-3">
          <motion.a
            variants={item}
            href="/connexion"
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${tone} hover:text-primary-300`}
          >
            Connexion
          </motion.a>
          <motion.a
            variants={item}
            href="/inscription"
            whileTap={{ scale: 0.97 }}
            className="btn btn-primary"
          >
            Créer un événement
          </motion.a>
        </div>

        {/* Mobile actions */}
        <div className="flex lg:hidden items-center gap-1.5">
          <motion.button
            variants={item}
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            className={`w-11 h-11 flex items-center justify-center rounded-lg transition-colors ${tone} ${scrolled ? 'hover:bg-ink-100' : 'hover:bg-white/10'}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h10" />
            </svg>
          </motion.button>
        </div>
      </nav>

      <MobileMenu open={open} onClose={() => setOpen(false)} links={navLinks} />
    </motion.header>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile menu — a sober, full-screen panel. Simple fade + gentle rise, */
/*  no spring bounce, no gradients or emojis: the same light world as    */
/*  the desktop nav, just stacked full-bleed.                            */
/* ------------------------------------------------------------------ */

function MobileMenu({ open, onClose, links }) {
  const panel = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } },
  };
  const list = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05, delayChildren: 0.12 } },
  };
  const li = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={panel}
          initial="hidden"
          animate="show"
          exit="exit"
          className="fixed inset-0 z-50 lg:hidden bg-white flex flex-col"
          data-no-translate
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-ink-200">
            <img src={media.logo} alt="Moledi Event" className="h-9 w-auto object-contain" />
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="w-10 h-10 rounded-lg bg-ink-100 flex items-center justify-center hover:bg-ink-200 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <motion.ul
            variants={list}
            initial="hidden"
            animate="show"
            className="flex-1 px-5 pt-3 overflow-y-auto"
          >
            {links.map((l) => (
              <motion.li key={l.href} variants={li} className="border-b border-ink-100">
                <a
                  href={l.href}
                  onClick={onClose}
                  className="block py-4 font-heading text-ink-900 text-lg normal-case tracking-wide hover:text-primary-600 transition-colors"
                >
                  {l.label}
                </a>
              </motion.li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.4 } }}
            className="p-5 border-t border-ink-200 space-y-3"
          >
            <div className="flex flex-row gap-3">
              <a
                href="/inscription"
                onClick={onClose}
                className="btn btn-primary flex-1 py-3.5"
              >
                Créer un événement
              </a>
              <a
                href="/connexion"
                onClick={onClose}
                className="btn btn-ghost flex-1 py-3.5"
              >
                Connexion
              </a>
            </div>
            <p className="text-center text-[11px] text-ink-700">
              Moledi Event — de l'idée à l'événement, en un clic.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Navbar;
