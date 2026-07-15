// components/poll/PhotoCarousel.jsx — carrousel de photos avec défilement
// automatique de gauche à droite + flèches précédent/suivant, utilisé sur
// la fiche candidat pour ses photos additionnelles (candidates.additional_
// photos_urls, plusieurs images possibles côté base).

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAutoScroll } from '../../lib/pollApi';

export default function PhotoCarousel({ photos }) {
  const trackRef = useRef(null);
  useAutoScroll(trackRef, photos.length > 3);

  function scrollBy(dir) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: 'smooth' });
  }

  return (
    <div className="relative group/carousel">
      <div ref={trackRef} className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide scroll-smooth">
        {photos.map((url, i) => (
          <img
            key={i}
            src={url}
            alt=""
            loading="lazy"
            className="h-56 sm:h-72 w-auto shrink-0 rounded-xl object-cover border border-white/15 hover:scale-[1.02] transition-transform duration-300"
          />
        ))}
      </div>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Photo précédente"
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg items-center justify-center bg-ink-900/70 backdrop-blur-sm text-white border border-white/15 opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Photo suivante"
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg items-center justify-center bg-ink-900/70 backdrop-blur-sm text-white border border-white/15 opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
}
