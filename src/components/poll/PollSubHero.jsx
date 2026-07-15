// components/poll/PollSubHero.jsx — en-tête réduit, commun à toutes les
// pages dédiées d'une campagne (Candidats, Règles, FAQ, Actualités,
// Galerie, Partenaires, Contact...). Contrairement au grand Hero de la
// page d'accueil, celui-ci n'affiche que l'essentiel : la photo de
// couverture en arrière-plan, le titre de la page et un fil d'ariane vers
// le scrutin -- l'objectif est de laisser la place au contenu de la page.

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function PollSubHero({ poll, slug, title, subtitle, icon: Icon }) {
  return (
    <section className="relative pt-28 pb-12 sm:pb-16 overflow-hidden bg-poll-dark bg-ink-900">
      {poll?.cover_photo_url && <img src={poll.cover_photo_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900/40 via-ink-900/85 to-ink-900" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <a href={`/vote/${slug}`} className="inline-flex items-center gap-2 text-white/60 hover:text-white text-xs font-semibold mb-5 transition-colors">
          <ArrowLeft size={14} aria-hidden="true" />
          {poll?.title || 'Retour au scrutin'}
        </a>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="flex items-center gap-3">
          {Icon && (
            <span className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
              <Icon size={20} className="text-primary-300" aria-hidden="true" />
            </span>
          )}
          <div>
            <h1 className="text-white font-heading normal-case text-2xl sm:text-4xl leading-tight">{title}</h1>
            {subtitle && <p className="text-white/50 text-sm mt-1">{subtitle}</p>}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
