// pages/PollCandidates.jsx — Route publique : /vote/:slug/candidats
//
// Grille complète des candidats (2 colonnes mobile, 3-4 desktop, comme
// prévu par la spec), avec filtre par catégorie, tri, et une recherche
// texte (reliée à la barre de recherche de l'en-tête, ?q=...).

import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import PollHeader from '../components/poll/PollHeader';
import PollFooter from '../components/poll/PollFooter';
import PollSubHero from '../components/poll/PollSubHero';
import PollLoadingScreen from '../components/poll/PollLoadingScreen';
import PollBackdrop from '../components/poll/PollBackdrop';
import CandidateCard from '../components/poll/CandidateCard';
import { useFetch } from '../lib/pollApi';
import { Users2, Search } from 'lucide-react';

const SORTS = [
  { key: 'score', label: 'Score' },
  { key: 'alpha', label: 'Alphabétique' },
  { key: 'category', label: 'Catégorie' },
];

export default function PollCandidatesPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { data: poll } = useFetch(`/api/polls/${slug}`, [slug]);
  const { data } = useFetch(`/api/polls/${slug}/candidates`, [slug]);
  const candidates = data?.candidates;

  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('score');
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const categories = useMemo(() => {
    if (!candidates) return [];
    return [...new Set(candidates.map((c) => c.category_name).filter(Boolean))];
  }, [candidates]);

  const filtered = useMemo(() => {
    if (!candidates) return [];
    let list = candidates;
    if (category !== 'all') list = list.filter((c) => c.category_name === category);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((c) => c.display_name?.toLowerCase().includes(q) || c.category_name?.toLowerCase().includes(q));
    }
    const sorted = [...list];
    if (sort === 'score') sorted.sort((a, b) => b.score - a.score);
    else if (sort === 'alpha') sorted.sort((a, b) => a.display_name.localeCompare(b.display_name));
    else if (sort === 'category') sorted.sort((a, b) => (a.category_name || '').localeCompare(b.category_name || ''));
    return sorted;
  }, [candidates, category, sort, query]);

  if (!poll) {
    return (
      <PollLoadingScreen />
    );
  }

  return (
    <div className="min-h-screen isolate">
      <PollBackdrop image={poll.cover_photo_url} />
      <PollHeader poll={poll} slug={slug} active="Candidats" solid />
      <PollSubHero poll={poll} slug={slug} icon={Users2} title="Les candidats" subtitle={`${candidates?.length || 0} candidat${(candidates?.length || 0) > 1 ? 's' : ''} au total`} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 flex-1">
            <Search size={15} className="text-white/40 shrink-0" aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un candidat..."
              className="bg-transparent text-white text-sm placeholder-white/30 outline-none flex-1 min-w-0"
            />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none">
            {SORTS.map((s) => (
              <option key={s.key} value={s.key} className="bg-ink-800">Trier : {s.label}</option>
            ))}
          </select>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              type="button"
              onClick={() => setCategory('all')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${category === 'all' ? 'bg-primary text-white' : 'bg-white/5 text-white/60 hover:text-white'}`}
            >
              Toutes catégories
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${category === c ? 'bg-primary text-white' : 'bg-white/5 text-white/60 hover:text-white'}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {!candidates ? (
          <div className="py-20 flex justify-center">
            <span className="w-8 h-8 rounded-full border-2 border-white/20 border-t-primary animate-spin" aria-label="Chargement" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-white/50 text-center py-16">Aucun candidat ne correspond à votre recherche.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filtered.map((c, i) => (
              <motion.div key={c.candidate_id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-5% 0px' }} transition={{ duration: 0.4, delay: (i % 8) * 0.05 }}>
                <CandidateCard candidate={c} slug={slug} rank={sort === 'score' ? i + 1 : c.rank} />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <PollFooter poll={poll} />
    </div>
  );
}
