// pages/CandidateDetail.jsx — Route publique : /vote/:slug/candidat/:candidateId
//
// Fiche publique d'un candidat, entièrement redessinée : la photo partage
// un layoutId avec CandidateCard (Framer Motion anime la transition entre
// la grille et cette page -- effet "zoom à l'intérieur du bloc"), galerie
// de photos additionnelles, section vidéos, statistiques et bouton de vote.

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, PlayCircle } from 'lucide-react';
import PollHeader from '../components/poll/PollHeader';
import PollFooter from '../components/poll/PollFooter';
import SharePopup from '../components/poll/SharePopup';
import PollLoadingScreen from '../components/poll/PollLoadingScreen';
import PollBackdrop, { glassCard } from '../components/poll/PollBackdrop';
import PhotoCarousel from '../components/poll/PhotoCarousel';
import { fmtNumber } from '../lib/pollApi';

export default function CandidateDetailPage() {
  const { slug, candidateId } = useParams();
  const [candidate, setCandidate] = useState(undefined);
  const [poll, setPoll] = useState(undefined);

  useEffect(() => {
    fetch(`/api/polls/candidates/${candidateId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setCandidate)
      .catch(() => setCandidate(null));
    fetch(`/api/polls/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setPoll)
      .catch(() => setPoll(null));
  }, [slug, candidateId]);

  if (candidate === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-ink-900">
        <p className="text-white/70 mb-4">Ce candidat n'existe pas ou n'est plus disponible.</p>
        <a href={`/vote/${slug}`} className="btn btn-primary">Retour au scrutin</a>
      </div>
    );
  }

  if (!candidate || poll === undefined) {
    return (
      <PollLoadingScreen />
    );
  }

  const isPaid = poll?.vote_type === 'PAID';
  const voteHref = `/vote/${slug}/voter/${isPaid ? 'payer' : 'gratuit'}?candidate=${candidateId}`;
  const isClosed = poll?.close_at && new Date(poll.close_at).getTime() < Date.now();
  const isUpcoming = poll?.open_at && new Date(poll.open_at).getTime() > Date.now();
  const gallery = candidate.additional_photos_urls || [];
  const videos = candidate.videos_urls || [];

  return (
    <div className="min-h-screen isolate">
      <PollBackdrop image={candidate.cover_photo_url} />
      <PollHeader poll={poll} slug={slug} active="Candidats" solid />

      {/* Grand cadre en pleine largeur : la photo du candidat sert de
          couverture (comme le hero de la campagne), nette ici -- c'est
          seulement plus bas, sur le reste de la page, qu'elle réapparaît
          floutée en arrière-plan (voir PollBackdrop) derrière des blocs en
          verre dépoli. */}
      <section className="relative h-[56vh] sm:h-[64vh] min-h-[380px] overflow-hidden bg-ink-900">
        <motion.div layoutId={`candidate-photo-${candidate.candidate_id}`} className="absolute inset-0">
          {candidate.cover_photo_url ? (
            <img src={candidate.cover_photo_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-ink-700 flex items-center justify-center text-white/30 text-6xl font-heading">{candidate.display_name?.[0]}</div>
          )}
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/60 via-ink-900/20 to-ink-900" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-transparent" />

        <div className="absolute top-0 inset-x-0 pt-24 sm:pt-28 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
          <a href={`/vote/${slug}/candidats`} className="inline-flex items-center gap-2 text-white/70 hover:text-white text-xs font-semibold transition-colors">
            <ArrowLeft size={14} aria-hidden="true" />
            Tous les candidats
          </a>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-0 inset-x-0 px-4 sm:px-6 lg:px-8 pb-8 sm:pb-10 max-w-4xl mx-auto w-full"
        >
          {candidate.rank && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-primary text-white mb-3">
              <Trophy size={13} aria-hidden="true" />
              Rang #{candidate.rank}
            </span>
          )}
          <h1 className="text-white font-heading leading-[1.05] mb-1 text-[clamp(2rem,6vw,3.6rem)] break-words">{candidate.display_name}</h1>
          {candidate.real_name && candidate.real_name !== candidate.display_name && (
            <p className="text-white/50 text-sm mb-2 normal-case">De son vrai nom {candidate.real_name}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {candidate.category_name && <p className="text-white/60 text-sm">{candidate.category_name}</p>}
            <p className="text-primary-300 text-sm font-semibold">{fmtNumber(candidate.score)} votes</p>
          </div>
        </motion.div>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-6">
        {!isClosed && !isUpcoming && (
          <div className="flex flex-col sm:flex-row gap-3">
            <a href={voteHref} className="btn btn-primary flex-1 sm:flex-initial !py-3.5 !px-8">
              Voter pour {candidate.display_name}
            </a>
            <SharePopup title={`Votez pour ${candidate.display_name}`} />
          </div>
        )}

        {candidate.biography && (
          <div className={`${glassCard} p-6 sm:p-8`}>
            <h2 className="text-xl sm:text-2xl text-white mb-3 normal-case">Biographie</h2>
            <p className="text-white/75 leading-relaxed normal-case">{candidate.biography}</p>
          </div>
        )}

        {gallery.length > 0 && (
          <div className={`${glassCard} p-6 sm:p-8`}>
            <h2 className="text-xl sm:text-2xl text-white mb-4 normal-case">Galerie</h2>
            <PhotoCarousel photos={gallery} />
          </div>
        )}

        {videos.length > 0 && (
          <div className={`${glassCard} p-6 sm:p-8`}>
            <h2 className="text-xl sm:text-2xl text-white mb-4 normal-case flex items-center gap-2">
              <PlayCircle size={22} className="text-primary-300" aria-hidden="true" />
              Vidéos
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {videos.map((v, i) => (
                <video key={i} src={v} controls className="w-full rounded-xl border border-white/10 aspect-video object-cover" />
              ))}
            </div>
          </div>
        )}

        {/* Fiche d'informations -- regroupe tous les champs candidats
            disponibles en base (score, rang, catégorie, position d'affichage)
            qui n'ont pas déjà leur propre bloc dédié ci-dessus. */}
        <div className={`${glassCard} p-6 sm:p-8`}>
          <h2 className="text-xl sm:text-2xl text-white mb-4 normal-case">Informations</h2>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-white/40 mb-1">Score</dt>
              <dd className="text-white font-semibold">{fmtNumber(candidate.score)}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-white/40 mb-1">Rang</dt>
              <dd className="text-white font-semibold">{candidate.rank ? `#${candidate.rank}` : '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-white/40 mb-1">Catégorie</dt>
              <dd className="text-white font-semibold">{candidate.category_name || '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-white/40 mb-1">Photos</dt>
              <dd className="text-white font-semibold">{gallery.length + (candidate.cover_photo_url ? 1 : 0)}</dd>
            </div>
          </dl>

          {/* Champs personnalisés définis par l'organisateur à la création
              du scrutin (candidates.custom_fields_data) -- format libre
              (objet clé/valeur), affiché tel quel plutôt qu'ignoré. */}
          {candidate.custom_fields_data && Object.keys(candidate.custom_fields_data).length > 0 && (
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-white/10">
              {Object.entries(candidate.custom_fields_data).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-[11px] uppercase tracking-wide text-white/40 mb-1">{key}</dt>
                  <dd className="text-white font-semibold break-words">{String(value)}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </main>

      <PollFooter poll={poll} />
    </div>
  );
}
