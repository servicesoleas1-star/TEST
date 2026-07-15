// pages/PollGallery.jsx — Route publique : /vote/:slug/galerie
//
// Galerie complète (table poll_galleries) avec filtre par tag (Avant /
// Pendant / Après) et vue lightbox au clic.

import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react';
import PollHeader from '../components/poll/PollHeader';
import PollFooter from '../components/poll/PollFooter';
import PollSubHero from '../components/poll/PollSubHero';
import PollLoadingScreen from '../components/poll/PollLoadingScreen';
import PollBackdrop, { glassCard } from '../components/poll/PollBackdrop';
import { useFetch } from '../lib/pollApi';

const TAG_LABEL = { BEFORE: 'Avant', DURING: 'Pendant', AFTER: 'Après' };

export default function PollGalleryPage() {
  const { slug } = useParams();
  const { data: poll } = useFetch(`/api/polls/${slug}`, [slug]);
  const { data } = useFetch(`/api/polls/${slug}/gallery`, [slug]);
  const gallery = data?.gallery || [];
  const [tag, setTag] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const tags = useMemo(() => [...new Set(gallery.map((g) => g.tag))], [gallery]);
  const filtered = tag === 'all' ? gallery : gallery.filter((g) => g.tag === tag);
  // Regroupée par section (Avant / Pendant / Après) quand aucun filtre
  // n'est actif -- plus parlant qu'une seule grille indifférenciée pour
  // "le style de données d'un événement".
  const groups = useMemo(() => {
    if (tag !== 'all') return { [TAG_LABEL[tag] || tag]: filtered };
    const g = {};
    for (const item of gallery) {
      const key = TAG_LABEL[item.tag] || 'Autres';
      (g[key] = g[key] || []).push(item);
    }
    return g;
  }, [gallery, filtered, tag]);

  if (!poll) {
    return (
      <PollLoadingScreen />
    );
  }

  return (
    <div className="min-h-screen isolate">
      <PollBackdrop image={poll.cover_photo_url} />
      <PollHeader poll={poll} slug={slug} active="Galerie" solid />
      <PollSubHero poll={poll} slug={slug} icon={ImageIcon} title="Galerie" subtitle={`${gallery.length} média${gallery.length > 1 ? 's' : ''} partagé${gallery.length > 1 ? 's' : ''}`} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {data && gallery.length === 0 && <p className="text-white/50 text-center py-16">Aucun média publié pour le moment.</p>}

        {tags.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button type="button" onClick={() => setTag('all')} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${tag === 'all' ? 'bg-primary text-white' : 'bg-white/10 backdrop-blur-md text-white/60 hover:text-white'}`}>
              Tout
            </button>
            {tags.map((t) => (
              <button key={t} type="button" onClick={() => setTag(t)} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${tag === t ? 'bg-primary text-white' : 'bg-white/10 backdrop-blur-md text-white/60 hover:text-white'}`}>
                {TAG_LABEL[t] || t}
              </button>
            ))}
          </div>
        )}

        {Object.entries(groups).map(([label, items]) => (
          <div key={label} className="mb-10">
            {tag === 'all' && tags.length > 1 && (
              <p className="text-primary-300 font-semibold tracking-[0.2em] uppercase text-[10px] mb-4">{label}</p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[140px] sm:auto-rows-[180px]">
              {items.map((item, i) => {
                const globalIndex = filtered.indexOf(item);
                const isFeatured = i % 7 === 0;
                return (
                  <motion.button
                    key={item.item_id}
                    type="button"
                    onClick={() => setLightboxIndex(globalIndex)}
                    initial={{ opacity: 0, scale: 0.92 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-10% 0px' }}
                    transition={{ duration: 0.4, delay: (i % 8) * 0.04 }}
                    className={`relative rounded-xl overflow-hidden border border-white/15 group ${isFeatured ? 'col-span-2 row-span-2' : ''}`}
                  >
                    {item.media_type === 'VIDEO' ? (
                      <>
                        <video src={item.media_url} className="absolute inset-0 w-full h-full object-cover" muted />
                        <PlayCircle size={isFeatured ? 40 : 28} className="absolute inset-0 m-auto text-white drop-shadow" aria-hidden="true" />
                      </>
                    ) : (
                      <img src={item.media_url} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.tag && <span className="absolute top-1.5 left-1.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-black/60 text-white">{TAG_LABEL[item.tag]}</span>}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </main>

      <AnimatePresence>
        {lightboxIndex !== null && filtered[lightboxIndex] && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/92 flex items-center justify-center p-4">
            <button type="button" onClick={() => setLightboxIndex(null)} aria-label="Fermer" className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center">
              <X size={20} aria-hidden="true" />
            </button>
            {lightboxIndex > 0 && (
              <button type="button" onClick={() => setLightboxIndex((i) => i - 1)} aria-label="Précédent" className="absolute left-4 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center">
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
            )}
            {lightboxIndex < filtered.length - 1 && (
              <button type="button" onClick={() => setLightboxIndex((i) => i + 1)} aria-label="Suivant" className="absolute right-4 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center">
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            )}
            {filtered[lightboxIndex].media_type === 'VIDEO' ? (
              <video src={filtered[lightboxIndex].media_url} controls autoPlay className="max-w-full max-h-full rounded-lg" />
            ) : (
              <motion.img initial={{ scale: 0.92 }} animate={{ scale: 1 }} src={filtered[lightboxIndex].media_url} alt="" className="max-w-full max-h-full rounded-lg object-contain" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <PollFooter poll={poll} />
    </div>
  );
}
