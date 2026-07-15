// pages/PollPartners.jsx — Route publique : /vote/:slug/partenaires
//
// Page complète des partenaires/sponsors validés par l'organisateur
// (poll_partners.validated = TRUE), groupés par niveau (Or/Argent/Bronze...).

import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Handshake } from 'lucide-react';
import PollHeader from '../components/poll/PollHeader';
import PollFooter from '../components/poll/PollFooter';
import PollSubHero from '../components/poll/PollSubHero';
import PollLoadingScreen from '../components/poll/PollLoadingScreen';
import PollBackdrop from '../components/poll/PollBackdrop';
import { useFetch } from '../lib/pollApi';

function groupByLevel(partners) {
  const groups = {};
  for (const p of partners) {
    const key = p.level || 'Partenaire';
    (groups[key] = groups[key] || []).push(p);
  }
  return groups;
}

export default function PollPartnersPage() {
  const { slug } = useParams();
  const { data: poll } = useFetch(`/api/polls/${slug}`, [slug]);
  const { data } = useFetch(`/api/polls/${slug}/partners`, [slug]);
  const partners = data?.partners || [];
  const groups = groupByLevel(partners);

  if (!poll) {
    return (
      <PollLoadingScreen />
    );
  }

  return (
    <div className="min-h-screen isolate">
      <PollBackdrop image={poll.cover_photo_url} />
      <PollHeader poll={poll} slug={slug} active="Partenaires" solid />
      <PollSubHero poll={poll} slug={slug} icon={Handshake} title="Partenaires & sponsors" subtitle="Ils rendent cet événement possible" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {data && partners.length === 0 && <p className="text-white/50 text-center py-16">Aucun partenaire pour le moment.</p>}

        {Object.entries(groups).map(([level, list], gi) => (
          <div key={level} className="mb-10">
            <p className="text-primary-300 font-semibold tracking-[0.2em] uppercase text-[10px] mb-4">{level}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {list.map((p, i) => (
                <motion.a
                  key={p.partner_id}
                  href={p.website_url || undefined}
                  target={p.website_url ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10% 0px' }}
                  transition={{ duration: 0.4, delay: (gi * 4 + i) * 0.04 }}
                  className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-primary/30 hover:bg-white/[0.06] transition-colors text-center"
                >
                  {p.logo_url ? (
                    <img src={p.logo_url} alt={p.name} className="h-12 object-contain" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-white font-heading text-lg">{p.name?.[0]}</div>
                  )}
                  <p className="text-white text-sm font-semibold">{p.name}</p>
                </motion.a>
              ))}
            </div>
          </div>
        ))}
      </main>

      <PollFooter poll={poll} />
    </div>
  );
}
