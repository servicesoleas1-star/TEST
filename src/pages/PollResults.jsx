// pages/PollResults.jsx — Route publique : /vote/:slug/resultats
//
// Page dédiée aux résultats (visible uniquement si le scrutin est clôturé
// ET la configuration de visibilité le permet -- règle déjà appliquée
// côté serveur par GET /api/polls/:slug/results). N'apparaît dans le menu
// que lorsque la campagne est clôturée (voir PollHeader.jsx).

import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, FileCheck } from 'lucide-react';
import PollHeader from '../components/poll/PollHeader';
import PollFooter from '../components/poll/PollFooter';
import PollSubHero from '../components/poll/PollSubHero';
import PollLoadingScreen from '../components/poll/PollLoadingScreen';
import PollBackdrop from '../components/poll/PollBackdrop';
import { useFetch, fmtNumber } from '../lib/pollApi';

export default function PollResultsPage() {
  const { slug } = useParams();
  const { data: poll } = useFetch(`/api/polls/${slug}`, [slug]);
  const { data } = useFetch(`/api/polls/${slug}/results`, [slug]);

  if (!poll || data === undefined) {
    return (
      <PollLoadingScreen />
    );
  }

  if (!data.available) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-ink-900">
        <p className="text-white/70 mb-4">Les résultats de ce scrutin ne sont pas (encore) disponibles publiquement.</p>
        <a href={`/vote/${slug}`} className="btn btn-primary">Retour au scrutin</a>
      </div>
    );
  }

  const { report, candidates } = data;
  const byCategory = candidates.reduce((acc, c) => {
    const key = c.category_name || 'Général';
    (acc[key] = acc[key] || []).push(c);
    return acc;
  }, {});

  return (
    <div className="min-h-screen isolate">
      <PollBackdrop image={poll.cover_photo_url} />
      <PollHeader poll={poll} slug={slug} active="Résultats" solid />
      <PollSubHero poll={poll} slug={slug} icon={Trophy} title="Résultats officiels" subtitle={`${candidates.length} candidat${candidates.length > 1 ? 's' : ''} au total`} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {Object.entries(byCategory).map(([category, list], ci) => (
          <div key={category} className="mb-10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary-300 mb-3">{category}</p>
            <div className="space-y-2">
              {list.map((c, i) => (
                <motion.div
                  key={c.candidate_id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-10% 0px' }}
                  transition={{ duration: 0.4, delay: (ci * 4 + i) * 0.04 }}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <span className="w-8 h-8 rounded-full bg-white/10 text-white text-sm font-bold flex items-center justify-center shrink-0">{c.rank || '—'}</span>
                  {c.cover_photo_url ? (
                    <img src={c.cover_photo_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-white/10 shrink-0" />
                  )}
                  <span className="flex-1 text-white text-sm font-semibold truncate">{c.display_name}</span>
                  <span className="text-white/70 text-sm font-bold shrink-0">{fmtNumber(c.score)}</span>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {report && (
          <a href={`/vote/${slug}/pv`} className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-white/10 text-white border border-white/15 hover:bg-white/20 transition-colors">
            <FileCheck size={16} aria-hidden="true" />
            Voir le procès-verbal de clôture
          </a>
        )}
      </main>

      <PollFooter poll={poll} />
    </div>
  );
}
