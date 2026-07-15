// components/poll/CandidateCard.jsx — carte candidat premium, partagée par
// la page d'accueil du scrutin, la page Candidats et la page Classement.
// `layoutId` partagé avec la photo de CandidateDetail.jsx pour obtenir un
// vrai effet de zoom "on entre à l'intérieur du bloc" au clic (Framer
// Motion anime la transition entre les deux pages via le layoutId commun).

import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { fmtNumber } from '../../lib/pollApi';

export default function CandidateCard({ candidate, slug, rank, size = 'md' }) {
  const displayRank = rank ?? candidate.rank;
  const isTop3 = displayRank && displayRank <= 3;
  const medalColor = { 1: '#F5B93D', 2: '#C7CDD9', 3: '#C97B4A' }[displayRank];

  return (
    <motion.a
      href={`/vote/${slug}/candidat/${candidate.candidate_id}`}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={`group relative shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-ink-800 shadow-lg hover:shadow-2xl hover:border-primary/40 transition-colors duration-300 ${
        size === 'sm' ? 'w-40' : 'w-full'
      }`}
    >
      <motion.div layoutId={`candidate-photo-${candidate.candidate_id}`} className="relative w-full aspect-[3/4] overflow-hidden">
        {candidate.cover_photo_url ? (
          <img
            src={candidate.cover_photo_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-ink-700 flex items-center justify-center text-white/30 text-3xl font-heading">
            {candidate.display_name?.[0]}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/10 to-transparent opacity-90" />

        {displayRank && (
          <div
            className="absolute top-2.5 left-2.5 min-w-[28px] h-7 px-1.5 rounded-full flex items-center justify-center gap-1 text-[11px] font-bold shadow-md"
            style={{ backgroundColor: medalColor || 'rgba(11,19,36,0.85)', color: isTop3 ? '#0B1324' : '#fff' }}
          >
            {isTop3 && <Trophy size={11} aria-hidden="true" />}
            {displayRank}
          </div>
        )}
        {candidate.category_name && (
          <span className="absolute top-2.5 right-2.5 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-md bg-white/15 backdrop-blur-sm text-white">
            {candidate.category_name}
          </span>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white font-semibold text-sm truncate">{candidate.display_name}</p>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-[11px] text-white/70">{fmtNumber(candidate.score)} votes</span>
            <span className="text-[11px] font-semibold text-primary-300 group-hover:translate-x-0.5 transition-transform">Voir →</span>
          </div>
        </div>
      </motion.div>
    </motion.a>
  );
}
