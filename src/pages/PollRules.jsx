// pages/PollRules.jsx — Route publique : /vote/:slug/regles
//
// Page dédiée aux règles du scrutin (déplacée hors de la page d'accueil,
// comme demandé) : bien plus de place pour expliquer chaque règle avec
// icônes et encadrés, plus un lien direct vers le signalement.

import { useParams } from 'react-router-dom';
import { ScrollText, LifeBuoy } from 'lucide-react';
import PollHeader from '../components/poll/PollHeader';
import PollFooter from '../components/poll/PollFooter';
import PollSubHero from '../components/poll/PollSubHero';
import PollLoadingScreen from '../components/poll/PollLoadingScreen';
import PollBackdrop, { glassCard } from '../components/poll/PollBackdrop';
import PollRulesSection from '../components/PollRulesSection';
import { useFetch } from '../lib/pollApi';

export default function PollRulesPage() {
  const { slug } = useParams();
  const { data: poll } = useFetch(`/api/polls/${slug}`, [slug]);

  if (!poll) {
    return (
      <PollLoadingScreen />
    );
  }

  return (
    <div className="min-h-screen isolate">
      <PollBackdrop image={poll.cover_photo_url} />
      <PollHeader poll={poll} slug={slug} active="Règles" solid />
      <PollSubHero poll={poll} slug={slug} icon={ScrollText} title="Règlement du scrutin" subtitle="Comprenez comment votre vote sera compté avant de participer" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <PollRulesSection slug={slug} />

        <div className={`mt-10 ${glassCard} p-6 flex items-center justify-between flex-wrap gap-4`}>
          <div>
            <p className="text-white font-semibold text-sm mb-1">Un problème avec ce scrutin ?</p>
            <p className="text-white/50 text-sm">Signalez-le à l'organisateur, notre équipe traitera votre demande.</p>
          </div>
          <a href={`/vote/${slug}/aide`} className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-white/10 text-white border border-white/15 hover:bg-white/20 transition-colors shrink-0">
            <LifeBuoy size={16} aria-hidden="true" />
            Signaler un problème
          </a>
        </div>
      </main>

      <PollFooter poll={poll} />
    </div>
  );
}
