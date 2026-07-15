// pages/Poll.jsx — Route publique : /vote/:slug
//
// Page D'ACCUEIL de la campagne — plus "toute la page qui scrolle à
// l'infini". Elle affiche uniquement : le grand Hero, un aperçu des
// candidats en vedette, un aperçu du classement, un aperçu des partenaires
// et quelques statistiques. Chaque rubrique complète (Candidats, Classement,
// Règles, FAQ, Actualités, Galerie, Partenaires, Contact, Résultats) vit
// désormais dans sa propre page dédiée, reliée par PollHeader.

import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Users2, Tag, ChevronRight, Trophy, Award, LayoutGrid, MoveHorizontal, Megaphone, X } from 'lucide-react';
import PollHeader from '../components/poll/PollHeader';
import PollFooter from '../components/poll/PollFooter';
import CandidateCard from '../components/poll/CandidateCard';
import SharePopup from '../components/poll/SharePopup';
import PollLoadingScreen from '../components/poll/PollLoadingScreen';
import PollBackdrop from '../components/poll/PollBackdrop';
import { SocialBadge } from '../components/SocialIcon';
import { useFetch, pollPhase, formatCountdown, fmtDate, fmtNumber, useAutoScroll, useMarqueeThreshold } from '../lib/pollApi';

// --- Hero ----------------------------------------------------------------

function Hero({ poll }) {
  const phase = pollPhase(poll);
  const countdown = phase?.key === 'upcoming' ? formatCountdown(poll.open_at) : phase?.key === 'open' ? formatCountdown(poll.close_at) : null;
  const socialLinks = poll.social_links || {};

  return (
    <section className="relative min-h-[86vh] sm:min-h-[92vh] flex items-end overflow-hidden bg-poll-dark bg-ink-900">
      {poll.cover_photo_url && (
        <motion.img
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.55 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          src={poll.cover_photo_url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {/* Dégradé vers le bas : le texte se lit directement sur la photo,
          sans bandeau séparé -- transition douce du sombre en haut (pour le
          header) au très sombre en bas (pour le bloc de texte). */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900/70 via-ink-900/30 to-ink-900" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-transparent" />

      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 pt-32">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } }}
        >
          {phase && (
            <motion.span
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
              className="btn !inline-flex !cursor-default !text-[11px] !py-1.5 !px-3.5 uppercase tracking-wider text-white mb-5"
              style={{ backgroundColor: phase.color, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.15), 0 10px 24px -10px rgba(0,0,0,0.4)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {phase.label}
              {countdown && <span className="font-normal normal-case opacity-90">· {countdown}</span>}
            </motion.span>
          )}

          <motion.h1
            variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
            className="text-white font-heading leading-[1.02] mb-4 break-words max-w-4xl text-[clamp(2.1rem,7vw,4.2rem)]"
          >
            {poll.title}
          </motion.h1>

          {poll.description && (
            <motion.p
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              className="text-white/75 normal-case max-w-2xl mb-6 leading-relaxed text-sm sm:text-base line-clamp-2"
            >
              {poll.description}
            </motion.p>
          )}

          {/* Message d'accueil -- configuré par l'organisateur (Personnalisation),
              distinct de la description : mis en avant visuellement plutôt que
              noyé dans le texte. */}
          {poll.welcome_message && (
            <motion.p
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              className="text-white normal-case max-w-2xl mb-6 leading-relaxed text-base sm:text-lg font-semibold border-l-2 pl-4"
              style={{ borderColor: poll.primary_color || '#FF6A00' }}
            >
              {poll.welcome_message}
            </motion.p>
          )}

          <motion.div
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/70 text-sm mb-8"
          >
            {poll.display_organizer_name && (
              <span className="flex items-center gap-1.5">
                <Users2 size={15} aria-hidden="true" />
                {poll.display_organizer_name}
              </span>
            )}
            {poll.category && (
              <span className="flex items-center gap-1.5">
                <Tag size={15} aria-hidden="true" />
                {poll.category}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar size={15} aria-hidden="true" />
              {phase?.key === 'upcoming'
                ? `Ouvre le ${fmtDate(poll.open_at)}`
                : phase?.key === 'closed'
                ? `Clôturé le ${fmtDate(poll.close_at)}`
                : `Jusqu'au ${fmtDate(poll.close_at)}`}
            </span>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }} className="flex flex-wrap items-center gap-3">
            {phase?.key === 'open' && (
              <a
                href={`/vote/${poll.slug}/candidats`}
                className="btn btn-primary !py-3 !px-6"
                style={poll.primary_color ? { backgroundColor: poll.primary_color, borderColor: poll.primary_color } : undefined}
              >
                Voter maintenant
              </a>
            )}
            {phase?.key === 'closed' && (
              <a
                href={`/vote/${poll.slug}/resultats`}
                className="btn btn-primary !py-3 !px-6"
                style={poll.primary_color ? { backgroundColor: poll.primary_color, borderColor: poll.primary_color } : undefined}
              >
                <Trophy size={16} aria-hidden="true" />
                Voir les résultats
              </a>
            )}
            <SharePopup title={poll.title} />
            {Object.entries(socialLinks).map(([key, url]) => (
              <SocialBadge key={key} name={key} href={url} size={44} />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// --- Bandeau de statistiques ----------------------------------------------

function StatsBand({ poll, candidates }) {
  const totalVotes = (candidates || []).reduce((sum, c) => sum + Number(c.score || 0), 0);
  const phase = pollPhase(poll);
  const daysLeft = phase?.key === 'open' ? Math.max(0, Math.ceil((new Date(poll.close_at).getTime() - Date.now()) / 86400000)) : null;

  const stats = [
    { label: 'Candidats', value: fmtNumber((candidates || []).length) },
    { label: 'Votes enregistrés', value: fmtNumber(totalVotes) },
    daysLeft !== null ? { label: 'Jours restants', value: fmtNumber(daysLeft) } : { label: 'Statut', value: phase?.label.split(' —')[0] || '—' },
  ];

  return (
    <section className="border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="text-center"
          >
            <p className="text-2xl sm:text-4xl font-heading normal-case text-white">{s.value}</p>
            <p className="text-[11px] sm:text-xs uppercase tracking-wider text-white/50 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// --- Aperçu candidats en vedette -------------------------------------------

function FeaturedCandidates({ slug, candidates }) {
  const desktopTrackRef = useRef(null);
  const mobileTrackRef = useRef(null);
  const threshold = useMarqueeThreshold();
  // PC : défilement auto dès qu'il y a assez de candidats (seuil).
  // Mobile : liste verticale PAR DÉFAUT (plus lisible au doigt), avec un
  // bouton pour basculer volontairement vers le défilement horizontal
  // automatique -- jamais l'inverse, la bascule ne se fait pas toute seule.
  const [mobileHorizontal, setMobileHorizontal] = useState(false);
  const enoughForMarquee = (candidates?.length || 0) >= threshold;
  useAutoScroll(desktopTrackRef, enoughForMarquee);
  useAutoScroll(mobileTrackRef, mobileHorizontal);

  if (!candidates) {
    return (
      <section className="py-16 flex justify-center">
        <span className="w-8 h-8 rounded-full border-2 border-white/20 border-t-primary animate-spin" aria-label="Chargement" />
      </section>
    );
  }
  if (candidates.length === 0) return null;

  const desktopTrack = enoughForMarquee ? [...candidates, ...candidates] : candidates.slice(0, 8);
  const mobileTrack = [...candidates, ...candidates];

  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-end justify-between mb-8 gap-3">
          <div>
            <p className="text-primary-300 font-semibold tracking-[0.2em] uppercase text-[10px] mb-2">En vedette</p>
            <h2 className="text-2xl sm:text-4xl text-white normal-case">Les candidats</h2>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {/* Bascule verticale/horizontale -- mobile uniquement, sans
                incidence sur le comportement PC (déjà géré par le seuil). */}
            <button
              type="button"
              onClick={() => setMobileHorizontal((v) => !v)}
              aria-label={mobileHorizontal ? 'Afficher en liste verticale' : 'Afficher en défilement horizontal'}
              className="sm:hidden inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white/10 text-white border border-white/15"
            >
              {mobileHorizontal ? <LayoutGrid size={14} aria-hidden="true" /> : <MoveHorizontal size={14} aria-hidden="true" />}
            </button>
            <a href={`/vote/${slug}/candidats`} className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white transition-colors">
              Voir tous les candidats
              <ChevronRight size={16} aria-hidden="true" />
            </a>
          </div>
        </motion.div>

        {/* Mobile : liste verticale par défaut, ou piste horizontale si le
            visiteur a basculé -- toujours masqué à partir de sm:. */}
        <div className="sm:hidden">
          {mobileHorizontal ? (
            <div ref={mobileTrackRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {mobileTrack.map((c, i) => (
                <div key={`${c.candidate_id}-m-${i}`} className="w-40 shrink-0">
                  <CandidateCard candidate={c} slug={slug} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {candidates.slice(0, 8).map((c, i) => (
                <motion.div key={c.candidate_id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10% 0px' }} transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}>
                  <CandidateCard candidate={c} slug={slug} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop/tablette : comportement inchangé, piloté par le seuil. */}
        <div className="hidden sm:block">
          {enoughForMarquee ? (
            <div ref={desktopTrackRef} className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide">
              {desktopTrack.map((c, i) => (
                <div key={`${c.candidate_id}-d-${i}`} className="w-48 shrink-0">
                  <CandidateCard candidate={c} slug={slug} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {desktopTrack.map((c, i) => (
                <motion.div key={c.candidate_id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10% 0px' }} transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}>
                  <CandidateCard candidate={c} slug={slug} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <a href={`/vote/${slug}/candidats`} className="sm:hidden mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-white/70">
          Voir tous les candidats <ChevronRight size={16} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

// --- Aperçu classement ------------------------------------------------------

function RankingPreview({ slug, candidates }) {
  if (!candidates || candidates.length === 0) return null;
  const top3 = [...candidates].sort((a, b) => b.score - a.score).slice(0, 3);
  const medalColor = ['#F5B93D', '#C7CDD9', '#C97B4A'];

  return (
    <section className="py-16 sm:py-24" style={{ background: 'linear-gradient(180deg, rgba(11,19,36,0) 0%, rgba(20,28,54,0.35) 100%)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-primary-300 font-semibold tracking-[0.2em] uppercase text-[10px] mb-2">Classement</p>
          <h2 className="text-2xl sm:text-4xl text-white normal-case mb-10">Ça se joue en ce moment</h2>
        </motion.div>

        <div className="flex items-end justify-center gap-3 sm:gap-6 mb-10">
          {[top3[1], top3[0], top3[2]].map((c, i) =>
            c ? (
              <motion.a
                key={c.candidate_id}
                href={`/vote/${slug}/candidat/${c.candidate_id}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className={`flex flex-col items-center ${i === 1 ? '-translate-y-4 sm:-translate-y-8' : ''}`}
              >
                <div className="relative mb-3">
                  {c.cover_photo_url ? (
                    <img
                      src={c.cover_photo_url}
                      alt=""
                      className="rounded-full object-cover border-4 shadow-xl"
                      style={{
                        borderColor: medalColor[i === 1 ? 0 : i === 0 ? 1 : 2],
                        width: i === 1 ? 96 : 76,
                        height: i === 1 ? 96 : 76,
                      }}
                    />
                  ) : (
                    <div
                      className="rounded-full bg-ink-700 border-4 flex items-center justify-center text-white font-heading"
                      style={{ borderColor: medalColor[i === 1 ? 0 : i === 0 ? 1 : 2], width: i === 1 ? 96 : 76, height: i === 1 ? 96 : 76 }}
                    >
                      {c.display_name?.[0]}
                    </div>
                  )}
                  <span
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow"
                    style={{ backgroundColor: medalColor[i === 1 ? 0 : i === 0 ? 1 : 2], color: '#0B1324' }}
                  >
                    {i === 1 ? 1 : i === 0 ? 2 : 3}
                  </span>
                </div>
                <p className="text-white text-sm font-semibold truncate max-w-[110px]">{c.display_name}</p>
                <p className="text-white/50 text-xs">{fmtNumber(c.score)} votes</p>
              </motion.a>
            ) : (
              <div key={`empty-${i}`} />
            )
          )}
        </div>

        <a href={`/vote/${slug}/classement`} className="btn !bg-ink-800 !border !border-white/15 !text-white hover:!bg-ink-700 !py-2.5 !px-6">
          <Award size={16} aria-hidden="true" />
          Voir le classement complet
        </a>
      </div>
    </section>
  );
}

// --- Aperçu partenaires ------------------------------------------------------

function PartnerLogo({ p }) {
  return (
    <div className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-6 py-4 hover:bg-white/10 transition-colors">
      {p.logo_url ? (
        <img src={p.logo_url} alt={p.name} className="h-9 object-contain" />
      ) : (
        <span className="text-sm font-semibold text-white/80 whitespace-nowrap">{p.name}</span>
      )}
    </div>
  );
}

function PartnersPreview({ slug }) {
  const trackRef = useRef(null);
  const threshold = useMarqueeThreshold();
  const { data } = useFetch(`/api/polls/${slug}/partners`, [slug]);
  const partners = data?.partners || [];
  const enoughForMarquee = partners.length >= threshold;
  useAutoScroll(trackRef, enoughForMarquee);

  if (data && partners.length === 0) return null;

  const track = enoughForMarquee ? [...partners, ...partners] : partners.slice(0, 8);

  return (
    <section className="py-14 sm:py-20 border-t border-white/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-primary-300 font-semibold tracking-[0.2em] uppercase text-[10px] mb-2">Ils soutiennent l'événement</p>
        <h2 className="text-2xl sm:text-3xl text-white normal-case mb-8">Nos partenaires</h2>

        {enoughForMarquee ? (
          <div ref={trackRef} className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {track.map((p, i) => (
              <PartnerLogo key={`${p.partner_id}-${i}`} p={p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-4">
            {track.map((p) => (
              <PartnerLogo key={p.partner_id} p={p} />
            ))}
          </div>
        )}

        <a href={`/vote/${slug}/partenaires`} className="inline-flex items-center gap-1.5 mt-6 text-sm font-semibold text-white/70 hover:text-white transition-colors">
          Voir tous les partenaires <ChevronRight size={16} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

// --- Annonces / Pop-ups (configurées par l'organisateur) --------------------
//
// ANNOUNCEMENT -> bandeau fixe sous le header, permanent tant que l'onglet
// reste ouvert (pas de fermeture, pour rester visible pendant toute la
// navigation). POPUP -> modale au chargement, fermable, ne réapparaît pas
// après fermeture dans le même onglet (sessionStorage).

function NoticesLayer({ slug }) {
  const { data } = useFetch(`/api/polls/${slug}/notices`, [slug]);
  const notices = data?.notices || [];
  const announcements = notices.filter((n) => n.type === 'ANNOUNCEMENT');
  const popups = notices.filter((n) => n.type === 'POPUP');

  const storageKey = `moledi_dismissed_popups_${slug}`;
  const [dismissed, setDismissed] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(storageKey) || '[]');
    } catch {
      return [];
    }
  });
  const activePopup = popups.find((p) => !dismissed.includes(p.notice_id));

  function dismissPopup(noticeId) {
    const next = [...dismissed, noticeId];
    setDismissed(next);
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // stockage indisponible (navigation privée stricte) -- tant pis, la
      // modale pourra réapparaître, non bloquant.
    }
  }

  return (
    <>
      {announcements.length > 0 && (
        <div className="fixed top-0 inset-x-0 z-[70] pt-[52px] sm:pt-[60px]">
          {announcements.map((n) => (
            <div key={n.notice_id} className="bg-primary text-white text-xs sm:text-sm font-semibold px-4 py-2.5 flex items-center justify-center gap-2 text-center">
              <Megaphone size={14} className="shrink-0" aria-hidden="true" />
              {n.message}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {activePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] bg-black/60 flex items-center justify-center p-4"
            onClick={() => dismissPopup(activePopup.notice_id)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-sm w-full rounded-2xl bg-ink-900 border border-white/10 p-6 text-center"
            >
              <button
                type="button"
                onClick={() => dismissPopup(activePopup.notice_id)}
                aria-label="Fermer"
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center"
              >
                <X size={15} aria-hidden="true" />
              </button>
              <Megaphone size={22} className="text-primary-300 mx-auto mb-3" aria-hidden="true" />
              <p className="text-white text-sm leading-relaxed">{activePopup.message}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// --- Page --------------------------------------------------------------------

export default function PollPage() {
  const { slug } = useParams();
  const { data: poll, error } = useFetch(`/api/polls/${slug}`, [slug]);
  const { data: candidatesData } = useFetch(poll ? `/api/polls/${slug}/candidates` : null, [slug, Boolean(poll)]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-ink-900">
        <p className="text-white/70 mb-4">Ce scrutin n'existe pas ou n'est plus disponible.</p>
        <a href="/evenements" className="btn btn-primary">Retour au catalogue</a>
      </div>
    );
  }

  if (!poll) {
    return <PollLoadingScreen />;
  }

  return (
    <div className="min-h-screen isolate">
      <PollBackdrop image={poll.cover_photo_url} />
      <PollHeader poll={poll} slug={slug} active="Accueil" />
      <NoticesLayer slug={slug} />
      <Hero poll={poll} />
      <StatsBand poll={poll} candidates={candidatesData?.candidates} />
      <FeaturedCandidates slug={slug} candidates={candidatesData?.candidates} />
      <RankingPreview slug={slug} candidates={candidatesData?.candidates} />
      <PartnersPreview slug={slug} />
      <PollFooter poll={poll} />
    </div>
  );
}
