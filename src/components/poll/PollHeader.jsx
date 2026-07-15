// components/poll/PollHeader.jsx — en-tête partagé de toute la section
// Scrutin & Vote (page d'accueil du scrutin + toutes les pages dédiées :
// candidats, classement, règles, FAQ, actualités, galerie, partenaires,
// contact, aide). Remplace le menu interne "une seule longue page" par une
// vraie navigation : sur PC un menu horizontal complet, sur mobile un
// hamburger correctement positionné (en haut à droite, jamais chevauché)
// qui ouvre un panneau plein écran avec le logo de la plateforme ET le
// visuel du scrutin.

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Search, Vote } from 'lucide-react';
import { media } from '../../config/media';
import { LanguageButton } from '../SiteHeader';

// section: présent uniquement sur les onglets que l'organisateur peut
// masquer depuis Personnalisation (poll.visible_sections) -- les autres
// (Accueil, Classement, Contact, Aide, Résultats) restent toujours affichés.
function navItems(slug, isClosed, visibleSections) {
  const items = [
    { href: `/vote/${slug}`, label: 'Accueil' },
    { href: `/vote/${slug}/candidats`, label: 'Candidats', section: 'candidats' },
    { href: `/vote/${slug}/classement`, label: 'Classement' },
    { href: `/vote/${slug}/regles`, label: 'Règles', section: 'regles' },
    { href: `/vote/${slug}/faq`, label: 'FAQ', section: 'faq' },
    { href: `/vote/${slug}/actualites`, label: 'Actualités', section: 'actualites' },
    { href: `/vote/${slug}/galerie`, label: 'Galerie', section: 'galerie' },
    { href: `/vote/${slug}/partenaires`, label: 'Partenaires', section: 'partenaires' },
    { href: `/vote/${slug}/contact`, label: 'Contact' },
    { href: `/vote/${slug}/aide`, label: 'Aide' },
  ];
  if (isClosed) items.push({ href: `/vote/${slug}/resultats`, label: 'Résultats' });

  // visible_sections NULL = comportement par défaut (tout affiché, aucune
  // campagne n'a encore explicitement personnalisé ses sections visibles).
  if (!Array.isArray(visibleSections)) return items;
  return items.filter((it) => !it.section || visibleSections.includes(it.section));
}

export default function PollHeader({ poll, slug, active, solid = false }) {
  const [scrolled, setScrolled] = useState(solid);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const isClosed = poll?.status === 'CLOSED' || (poll?.close_at && new Date(poll.close_at).getTime() < Date.now());
  const items = navItems(slug, isClosed, poll?.visible_sections);
  // Logo affiché à côté du logo Moledi : priorité au logo dédié de la
  // campagne (Contenu > Personnalisation), puis à la photo de profil de
  // l'organisateur (Mon profil), puis repli sur la photo de couverture du
  // scrutin (comportement précédent).
  const organizerLogo = poll?.brand_logo_url || poll?.organizer_logo_url || poll?.cover_photo_url;

  useEffect(() => {
    if (solid) return;
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [solid]);

  const showSolid = solid || scrolled;

  function submitSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    window.location.href = `/vote/${slug}/candidats?q=${encodeURIComponent(query.trim())}`;
  }

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-[80] transition-all duration-300 ${
          showSolid ? 'bg-ink-900/92 backdrop-blur-md border-b border-white/10 py-2.5' : 'bg-gradient-to-b from-ink-900/70 to-transparent py-4'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3">
          <a href="/" className="flex items-center shrink-0" aria-label="Moledi Event">
            <img src={media.logo} alt="Moledi Event" className="h-6 sm:h-7 w-auto object-contain" />
          </a>
          {/* Bande organisateur : photo de profil de l'organisateur si
              configurée (Mon profil), sinon repli sur la photo de couverture
              du scrutin -- repère visuel distinct du logo Moledi. */}
          {organizerLogo && (
            <img src={organizerLogo} alt="" className="hidden sm:block h-7 w-7 rounded-lg object-cover border border-white/20 shrink-0" />
          )}
          <span className="hidden sm:block w-px h-5 bg-white/20 shrink-0" />
          <a href={`/vote/${slug}`} className="hidden sm:flex items-center min-w-0 group shrink-0 max-w-[160px] xl:max-w-[220px]">
            <span className="text-white text-sm font-semibold truncate group-hover:text-primary-300 transition-colors">
              {poll?.title}
            </span>
          </a>

          {/* Nav desktop — horizontale, pas de hamburger sur PC. Tous les
              éléments doivent rester visibles sans défilement caché : texte
              compact, espacement serré plutôt qu'un sous-ensemble tronqué. */}
          <nav className="hidden lg:flex items-center ml-auto flex-wrap justify-end gap-x-0.5 gap-y-1">
            {items.map((it) => {
              const isActive = active === it.label;
              return (
                <a
                  key={it.href}
                  href={it.href}
                  className={`relative shrink-0 whitespace-nowrap px-2.5 py-2 text-[12px] font-semibold transition-colors ${
                    isActive ? 'text-white' : 'text-white/65 hover:text-white'
                  }`}
                >
                  {it.label}
                  {isActive && (
                    <motion.span
                      layoutId="poll-nav-underline"
                      className="absolute left-2.5 right-2.5 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-primary to-primary-300"
                    />
                  )}
                </a>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Rechercher"
              className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 text-white border border-white/15 hover:bg-white/20 transition-colors"
            >
              <Search size={15} aria-hidden="true" />
            </button>
            <LanguageButton />
            {/* Toujours affiché (plus conditionné au statut "ouvert") --
                mène vers la page candidats, qui gère elle-même l'affichage
                adapté si le scrutin n'est pas encore ouvert ou est clôturé. */}
            <a href={`/vote/${slug}/candidats`} className="btn btn-primary !py-2 !px-4 !text-xs">
              <Vote size={14} aria-hidden="true" />
              Voter
            </a>
          </div>

          {/* Mobile : recherche + langue + hamburger, bien à droite, jamais superposés */}
          <div className="flex lg:hidden items-center gap-2 ml-auto shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Rechercher"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-white border border-white/15"
            >
              <Search size={16} aria-hidden="true" />
            </button>
            <LanguageButton />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Ouvrir le menu"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-white border border-white/15"
            >
              <Menu size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-white/10 mt-2.5"
            >
              <form onSubmit={submitSearch} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5 border border-white/15">
                  <Search size={15} className="text-white/60 shrink-0" aria-hidden="true" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Rechercher un candidat, une catégorie, un partenaire, une actualité..."
                    className="flex-1 bg-transparent text-white text-sm placeholder-white/40 outline-none min-w-0"
                  />
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Panneau mobile plein écran */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(6px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              transition={{ duration: 0.35 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-[90] bg-black/60"
            />
            <motion.div
              initial={{ x: '100%', scale: 0.96, opacity: 0.6 }}
              animate={{ x: 0, scale: 1, opacity: 1 }}
              exit={{ x: '100%', scale: 0.96, opacity: 0.6 }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              className="fixed inset-y-0 right-0 z-[95] w-full max-w-sm bg-poll-dark bg-ink-900 flex flex-col shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.6)]"
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={media.logo} alt="Moledi Event" className="h-6 w-auto object-contain shrink-0" />
                  {organizerLogo && (
                    <img src={organizerLogo} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0 border border-white/20" />
                  )}
                </div>
                <motion.button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Fermer le menu"
                  whileHover={{ rotate: 90, scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 border border-white/15 text-white shadow-lg hover:bg-primary hover:border-primary transition-colors shrink-0"
                >
                  <X size={18} aria-hidden="true" />
                </motion.button>
              </div>
              <p className="px-5 pt-4 text-white/50 text-[11px] uppercase tracking-wider font-semibold truncate">{poll?.title}</p>
              {/* min-h-0 est indispensable ici : sans lui, un enfant flex
                  avec overflow-y-auto ne se contraint pas correctement dans
                  un parent flex-col (min-height:auto par défaut) -- la liste
                  s'étirait au-delà de l'écran sur mobile au lieu de défiler,
                  poussant le bouton "Voter" et le logo hors champ dès que le
                  scrutin avait beaucoup d'onglets (ex: Résultats ajouté). */}
              <ul className="flex-1 min-h-0 px-3 py-2 overflow-y-auto">
                {items.map((it, i) => (
                  <motion.li
                    key={it.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                  >
                    <a
                      href={it.href}
                      className={`flex items-center justify-between px-3 py-3.5 rounded-xl text-base font-semibold transition-colors ${
                        active === it.label ? 'text-white bg-white/10' : 'text-white/75 hover:text-white'
                      }`}
                    >
                      {it.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
              {/* Toujours visible, jamais dans la zone défilante (`ul` a son
                  propre overflow-y-auto juste au-dessus) -- reste ancré en
                  bas du panneau quel que soit le nombre d'éléments du menu. */}
              <div className="px-5 pt-5 border-t border-white/10">
                <a href={`/vote/${slug}/candidats`} className="btn btn-primary w-full !py-3">
                  <Vote size={16} aria-hidden="true" />
                  Voter maintenant
                </a>
              </div>
              {/* Bande logo -- referme le panneau sur l'identité de la
                  plateforme, bien visible en bas, sur toute la largeur. */}
              <div className="px-5 py-6 flex items-center justify-center">
                <img src={media.logo} alt="Moledi Event" className="h-8 w-auto object-contain opacity-90" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
