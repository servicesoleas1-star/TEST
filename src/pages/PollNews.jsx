// pages/PollNews.jsx — Route publique : /vote/:slug/actualites
//
// Page dédiée aux publications de l'organisateur (table poll_news) :
// image, titre, contenu, date -- ordre chronologique inversé.

import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Newspaper } from 'lucide-react';
import PollHeader from '../components/poll/PollHeader';
import PollFooter from '../components/poll/PollFooter';
import PollSubHero from '../components/poll/PollSubHero';
import PollLoadingScreen from '../components/poll/PollLoadingScreen';
import PollBackdrop from '../components/poll/PollBackdrop';
import { useFetch, fmtDate } from '../lib/pollApi';

export default function PollNewsPage() {
  const { slug } = useParams();
  const { data: poll } = useFetch(`/api/polls/${slug}`, [slug]);
  const { data } = useFetch(`/api/polls/${slug}/news`, [slug]);
  const news = data?.news || [];

  if (!poll) {
    return (
      <PollLoadingScreen />
    );
  }

  return (
    <div className="min-h-screen isolate">
      <PollBackdrop image={poll.cover_photo_url} />
      <PollHeader poll={poll} slug={slug} active="Actualités" solid />
      <PollSubHero poll={poll} slug={slug} icon={Newspaper} title="Actualités" subtitle="Les dernières publications de l'organisateur" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {data && news.length === 0 && <p className="text-white/50 text-center py-16">Aucune actualité publiée pour le moment.</p>}

        <div className="space-y-6">
          {news.map((n, i) => (
            <motion.article
              key={n.news_id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.06 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden flex flex-col sm:flex-row hover:border-primary/30 transition-colors"
            >
              {n.photos_urls?.[0] && <img src={n.photos_urls[0]} alt="" className="w-full sm:w-52 h-48 sm:h-auto object-cover shrink-0" />}
              <div className="p-6">
                <p className="text-[11px] text-primary-300 uppercase tracking-wide mb-1.5 font-semibold">{fmtDate(n.published_at, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <h2 className="text-lg text-white mb-2 normal-case font-semibold">{n.title}</h2>
                <p className="text-sm text-white/65 normal-case leading-relaxed">{n.body}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </main>

      <PollFooter poll={poll} />
    </div>
  );
}
