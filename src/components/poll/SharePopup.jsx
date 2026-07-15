// components/poll/SharePopup.jsx — vrai grand pop-up de partage, centré au
// milieu de l'écran (pas un petit menu ancré sous le bouton qui pouvait se
// retrouver hors champ/coupé si le bouton était près du bas de la page) :
// lien copiable dans son propre champ, options WhatsApp / X / Instagram
// avec leurs vrais logos en couleur.

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Share2, Link2, Check, X } from 'lucide-react';
import { SOCIAL_ICONS_BY_KEY } from '../SocialIcon';

function BrandTile({ social, label, onClick, href }) {
  const icon = SOCIAL_ICONS_BY_KEY[social];
  const content = (
    <>
      <span
        style={icon.name === 'Instagram' ? { backgroundImage: icon.bg } : { backgroundColor: icon.bg }}
        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <path d={icon.path} />
        </svg>
      </span>
      <span className="text-xs font-semibold text-white/85">{label}</span>
    </>
  );
  const cls = 'flex flex-col items-center gap-2.5 hover:-translate-y-1 transition-transform';
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={cls}>
      {content}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {content}
    </button>
  );
}

export default function SharePopup({ title, url }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API indisponible (contexte non sécurisé) — le champ reste
      // sélectionnable manuellement, aucune autre action de repli possible.
    }
  }

  const tiles = [
    { key: 'whatsapp', social: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${title} — ${shareUrl}`)}` },
    { key: 'x', social: 'x', label: 'X', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}` },
    { key: 'facebook', social: 'facebook', label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { key: 'instagram', social: 'instagram', label: 'Instagram', onClick: copyLink },
  ];

  const modal = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="pointer-events-auto w-full max-w-md rounded-3xl border border-white/15 bg-ink-800 shadow-2xl p-6 sm:p-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="min-w-0 pr-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary-300 mb-1.5">Partager</p>
                  <h2 className="text-white text-lg font-semibold leading-snug truncate">{title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer"
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 border border-white/15 text-white hover:bg-white/20 transition-colors shrink-0"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-7">
                {tiles.map((t) => (
                  <BrandTile key={t.key} social={t.social} label={t.label} href={t.href} onClick={t.onClick} />
                ))}
              </div>

              <p className="text-xs font-semibold text-white/50 mb-2">Ou copiez le lien</p>
              <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 p-1.5">
                <input
                  readOnly
                  value={shareUrl}
                  onFocus={(e) => e.target.select()}
                  className="flex-1 min-w-0 bg-transparent text-sm text-white/80 px-3 py-2 outline-none"
                />
                <button
                  type="button"
                  onClick={copyLink}
                  className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2.5 rounded-lg transition-colors ${
                    copied ? 'bg-primary text-white' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {copied ? <Check size={14} aria-hidden="true" /> : <Link2 size={14} aria-hidden="true" />}
                  {copied ? 'Copié' : 'Copier'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Partager"
        className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-3 rounded-xl bg-white/10 backdrop-blur-sm text-white border border-white/15 hover:bg-white/20 transition-colors"
      >
        <Share2 size={16} aria-hidden="true" />
        Partager
      </button>
      {typeof document !== 'undefined' ? createPortal(modal, document.body) : null}
    </>
  );
}
