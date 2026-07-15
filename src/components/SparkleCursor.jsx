import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Desktop-only custom cursor: a small trail of star sparkles follows the
// pointer, kept subtle (brand orange/blue, low opacity, short-lived) rather
// than a loud/childish effect. Never active on touch devices. Rendered once,
// globally, in App.jsx so every page on the site gets it (not just Home).
function useIsFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    setFine(mq.matches);
    const handler = (e) => setFine(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return fine;
}

export default function SparkleCursor() {
  const fine = useIsFinePointer();
  const [sparkles, setSparkles] = useState([]);
  const idRef = useRef(0);
  const lastRef = useRef(0);

  // The pointer itself stays the normal, standard system cursor — only a
  // trail of sparkles rides along with it while scrolling/navigating.
  useEffect(() => {
    if (!fine) return;
    const onMove = (e) => {
      const now = performance.now();
      if (now - lastRef.current < 45) return;
      lastRef.current = now;
      const id = idRef.current++;
      setSparkles((s) => [
        ...s.slice(-18),
        { id, x: e.clientX, y: e.clientY, blue: Math.random() > 0.5 },
      ]);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [fine]);

  if (!fine) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[999] overflow-hidden">
      <AnimatePresence>
        {sparkles.map((s) => (
          <motion.span
            key={s.id}
            initial={{ opacity: 0.85, scale: 0.4 }}
            animate={{ opacity: 0, scale: 1, y: -16 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            onAnimationComplete={() => setSparkles((cur) => cur.filter((c) => c.id !== s.id))}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-xs select-none"
            style={{ left: s.x, top: s.y, color: s.blue ? '#5F8EFF' : '#FF8533' }}
          >
            ✦
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
