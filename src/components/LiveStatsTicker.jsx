// components/LiveStatsTicker.jsx
//
// Élément signature de la page Inscription : anime un compteur de 0 jusqu'à
// la vraie valeur des chiffres clés de la plateforme (réutilise
// getKeyNumbers() du ticket LAN-10, page À propos -- même source de
// données, pas une copie codée en dur). Choix délibéré plutôt qu'un
// panneau de bienvenue générique : sur une plateforme de vote, un compteur
// qui "tourne" évoque directement le produit (compter des votes, des
// participations) -- pas une image de stock déconnectée du sujet.

import { useEffect, useRef, useState } from 'react';
import { getKeyNumbers } from './config/kpiConfig';

function parseNumericValue(displayValue) {
  // Les valeurs formatées ressemblent à "1 240+" -- on extrait la partie
  // numérique pour piloter l'animation, et on ré-affiche le "+" à la fin.
  const digitsOnly = displayValue.replace(/[^\d]/g, '');
  return parseInt(digitsOnly, 10) || 0;
}

function useCountUp(targetValue, durationMs = 1400) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef(null);

  useEffect(() => {
    let frameId;

    function step(timestamp) {
      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / durationMs, 1);
      // ease-out : progression rapide au début, ralentie à la fin --
      // rend l'animation plus naturelle qu'une simple interpolation linéaire.
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(eased * targetValue));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    }

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [targetValue, durationMs]);

  return displayValue;
}

function StatItem({ item }) {
  const target = parseNumericValue(item.value);
  const hasPlus = item.value.includes('+');
  const current = useCountUp(target);

  return (
    <div>
      <p
        className="text-4xl font-bold text-white sm:text-5xl"
        style={{ fontFamily: 'Anton, sans-serif' }}
      >
        {new Intl.NumberFormat('fr-FR').format(current)}
        {hasPlus ? '+' : ''}
      </p>
      <p className="text-sm text-white/70">{item.label}</p>
    </div>
  );
}

export default function LiveStatsTicker() {
  const { items } = getKeyNumbers();

  return (
    <div className="flex gap-10">
      {items.map((item) => (
        <StatItem key={item.id} item={item} />
      ))}
    </div>
  );
}
