// hooks/useScrollReveal.js
//
// Hook générique : détecte quand un élément entre dans la zone visible de
// l'écran, pour déclencher une animation d'apparition (fade/slide) SEULEMENT
// à ce moment-là — pas au chargement de la page.
//
// Cahier des charges (§4.A, page À propos) : "Storytelling avec animations
// au scroll" + annexe technique du module : "Utiliser IntersectionObserver
// pour les animations au scroll — ne pas utiliser un listener de scroll
// classique, moins performant."
//
// Pourquoi un hook séparé plutôt que de coder l'animation directement dans
// AboutPage.jsx : ce composant est le premier de la plateforme à avoir
// besoin d'animations au scroll, mais ce ne sera sûrement pas le dernier
// (pages Événements, Tarifs... pourraient vouloir le même effet plus tard).
// En le sortant ici, n'importe quel autre ticket peut réutiliser
// useScrollReveal() sans dupliquer la logique IntersectionObserver.
//
// Usage :
//   const [ref, isVisible] = useScrollReveal();
//   <div ref={ref} className={isVisible ? 'opacity-100' : 'opacity-0'}>...</div>

import { useEffect, useRef, useState } from 'react';

/**
 * @param {{ threshold?: number, triggerOnce?: boolean }} options
 *   threshold    : pourcentage de l'élément visible avant de déclencher (0 à 1)
 *   triggerOnce  : si true (par défaut), l'animation ne se joue qu'une fois ;
 *                  si false, l'état repasse à false quand l'élément ressort
 *                  de l'écran (utile pour rejouer l'animation en remontant)
 * @returns {[React.RefObject, boolean]} [ref à poser sur l'élément, isVisible]
 */
export function useScrollReveal({ threshold = 0.2, triggerOnce = true } = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Sécurité navigateurs très anciens : si IntersectionObserver n'existe
    // pas, on affiche directement le contenu plutôt que de le laisser
    // invisible pour toujours (dégradation propre, pas de contenu bloqué).
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(node);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(node);

    // Nettoyage obligatoire : on arrête d'observer si le composant est
    // démonté avant que l'animation ne se déclenche (évite une fuite mémoire).
    return () => observer.disconnect();
  }, [threshold, triggerOnce]);

  return [ref, isVisible];
}
