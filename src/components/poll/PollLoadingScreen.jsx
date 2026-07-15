// components/poll/PollLoadingScreen.jsx — écran de chargement de toutes les
// pages de la section Scrutin & Vote. Remplace l'ancien simple cercle qui
// tourne par quelque chose qui porte la marque : le logo qui respire avec
// un halo, et trois points qui rebondissent en cascade en dessous.

import { motion } from 'framer-motion';
import { media } from '../../config/media';

export default function PollLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-poll-dark bg-ink-900">
      <div className="flex flex-col items-center">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="relative mb-6"
        >
          <div className="absolute inset-[-24px] rounded-full bg-primary/20 blur-2xl animate-pulse" />
          <img src={media.logo} alt="" className="relative h-12 w-auto object-contain" aria-hidden="true" />
        </motion.div>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
            />
          ))}
        </div>
        <span className="sr-only">Chargement</span>
      </div>
    </div>
  );
}
