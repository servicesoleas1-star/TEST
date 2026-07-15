// components/AnimatedSection.jsx
//
// Enveloppe générique qui applique une animation "fade + slide up" à son
// contenu quand la section entre dans l'écran, via useScrollReveal().
//
// Réutilisable pour n'importe quelle section de storytelling, pas seulement
// la page À propos — ne pas recréer une version équivalente ailleurs.

import { useScrollReveal } from '../hooks/useScrollReveal';

/**
 * @param {{ children: React.ReactNode, className?: string }} props
 */
export default function AnimatedSection({ children, className = '' }) {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.15 });

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
}
