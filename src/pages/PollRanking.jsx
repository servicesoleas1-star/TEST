// pages/PollRanking.jsx — Route publique : /vote/:slug/classement
//
// Vue complète du classement, entièrement redessinée : podium des 3
// premiers avec médailles, liste classique avec barres de progression, et
// une troisième visualisation (graphique en anneau des parts de votes) --
// trois manières de lire le même classement.

import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { LayoutList, PieChart as PieIcon, Trophy, Rows3, BarChart3 } from 'lucide-react';
import PollHeader from '../components/poll/PollHeader';
import PollFooter from '../components/poll/PollFooter';
import PollSubHero from '../components/poll/PollSubHero';
import PollLoadingScreen from '../components/poll/PollLoadingScreen';
import PollBackdrop from '../components/poll/PollBackdrop';
import { useFetch, fmtNumber } from '../lib/pollApi';

const MEDAL = { 1: '#F5B93D', 2: '#C7CDD9', 3: '#C97B4A' };
const DONUT_COLORS = ['#FF6A00', '#2B6BFF', '#F5B93D', '#16A34A', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

function Podium({ candidates, slug }) {
  const top3 = candidates.slice(0, 3);
  if (top3.length === 0) return null;
  const order = [top3[1], top3[0], top3[2]];
  const heights = [140, 180, 110];

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-6 mb-16">
      {order.map((c, i) => {
        if (!c) return <div key={`empty-${i}`} className="w-24 sm:w-32" />;
        const rank = i === 1 ? 1 : i === 0 ? 2 : 3;
        return (
          <motion.a
            key={c.candidate_id}
            href={`/vote/${slug}/candidat/${c.candidate_id}`}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center w-24 sm:w-32"
          >
            <div className="relative mb-3">
              {c.cover_photo_url ? (
                <img
                  src={c.cover_photo_url}
                  alt=""
                  className="rounded-full object-cover border-4 shadow-2xl mx-auto"
                  style={{ borderColor: MEDAL[rank], width: rank === 1 ? 92 : 72, height: rank === 1 ? 92 : 72 }}
                />
              ) : (
                <div
                  className="rounded-full bg-ink-700 border-4 flex items-center justify-center text-white font-heading mx-auto"
                  style={{ borderColor: MEDAL[rank], width: rank === 1 ? 92 : 72, height: rank === 1 ? 92 : 72 }}
                >
                  {c.display_name?.[0]}
                </div>
              )}
              {rank === 1 && <Trophy size={22} className="absolute -top-3 left-1/2 -translate-x-1/2" style={{ color: MEDAL[1] }} aria-hidden="true" />}
            </div>
            <p className="text-white text-sm font-semibold text-center truncate max-w-full">{c.display_name}</p>
            <p className="text-white/50 text-xs mb-2">{fmtNumber(c.score)} votes</p>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: heights[i] }}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="w-full rounded-t-xl flex items-start justify-center pt-2"
              style={{ background: `linear-gradient(180deg, ${MEDAL[rank]}33, ${MEDAL[rank]}11)`, border: `1px solid ${MEDAL[rank]}44` }}
            >
              <span className="text-2xl font-heading" style={{ color: MEDAL[rank] }}>{rank}</span>
            </motion.div>
          </motion.a>
        );
      })}
    </div>
  );
}

function RankRow({ candidate, maxScore, index, slug }) {
  const percent = maxScore > 0 ? Math.round((candidate.score / maxScore) * 100) : 0;
  const medal = MEDAL[candidate.rank];

  return (
    <motion.a
      href={`/vote/${slug}/candidat/${candidate.candidate_id}`}
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.45, delay: Math.min(index, 8) * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center font-heading text-base shrink-0" style={{ backgroundColor: medal || 'rgba(255,255,255,0.08)', color: medal ? '#0B1324' : 'rgba(255,255,255,0.6)' }}>
        {candidate.rank || '—'}
      </div>
      {candidate.cover_photo_url ? (
        <img src={candidate.cover_photo_url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
      ) : (
        <div className="w-14 h-14 rounded-lg bg-white/5 shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-white truncate">{candidate.display_name}</p>
        {candidate.category_name && <p className="text-[11px] text-white/40 mb-1.5">{candidate.category_name}</p>}
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div initial={{ width: 0 }} whileInView={{ width: `${percent}%` }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="h-full rounded-full bg-primary" />
        </div>
      </div>
      <p className="text-sm font-bold text-white shrink-0">{fmtNumber(candidate.score)}</p>
    </motion.a>
  );
}

function CategoryView({ candidates, slug }) {
  const byCategory = useMemo(() => {
    const groups = {};
    for (const c of candidates) {
      const key = c.category_name || 'Général';
      (groups[key] = groups[key] || []).push(c);
    }
    return groups;
  }, [candidates]);

  return (
    <div className="space-y-10">
      {Object.entries(byCategory).map(([category, list]) => {
        const maxScore = Math.max(...list.map((c) => c.score), 1);
        return (
          <div key={category}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary-300 mb-3">{category}</p>
            <div className="space-y-2">
              {list.map((c, i) => (
                <RankRow key={c.candidate_id} candidate={c} maxScore={maxScore} index={i} slug={slug} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BarsView({ candidates }) {
  const top10 = candidates.slice(0, 10).map((c) => ({ name: c.display_name, votes: Number(c.score) || 0 }));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-8 h-[420px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={top10} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
          <XAxis type="number" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={110} stroke="rgba(255,255,255,0.6)" tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value) => [`${fmtNumber(value)} votes`, '']}
            contentStyle={{ background: '#0B1324', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff' }}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          />
          <Bar dataKey="votes" radius={[0, 6, 6, 0]}>
            {top10.map((_, i) => (
              <Cell key={i} fill={i === 0 ? '#F5B93D' : i === 1 ? '#C7CDD9' : i === 2 ? '#C97B4A' : '#FF6A00'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DonutView({ candidates }) {
  const top8 = candidates.slice(0, 8);
  const total = candidates.reduce((s, c) => s + Number(c.score || 0), 0);
  const data = top8.map((c) => ({ name: c.display_name, value: Number(c.score) || 0 }));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-10">
      <div className="grid sm:grid-cols-2 gap-8 items-center">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
                {data.map((_, i) => (
                  <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} stroke="#0B1324" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${fmtNumber(value)} votes`, '']}
                contentStyle={{ background: '#0B1324', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2.5">
          {data.map((d, i) => {
            const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0;
            return (
              <div key={d.name} className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                <span className="text-sm text-white/80 truncate flex-1">{d.name}</span>
                <span className="text-sm font-semibold text-white shrink-0">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PollRankingPage() {
  const { slug } = useParams();
  const { data: poll } = useFetch(`/api/polls/${slug}`, [slug]);
  const { data } = useFetch(`/api/polls/${slug}/candidates`, [slug]);
  const [view, setView] = useState('list'); // list | donut

  if (!poll || data === undefined) {
    return (
      <PollLoadingScreen />
    );
  }

  const candidates = [...(data.candidates || [])].sort((a, b) => b.score - a.score);
  const maxScore = Math.max(...candidates.map((c) => c.score), 1);
  const hasCategories = candidates.some((c) => c.category_name);

  const VIEWS = [
    { key: 'list', label: 'Liste complète', icon: LayoutList },
    ...(hasCategories ? [{ key: 'category', label: 'Par catégorie', icon: Rows3 }] : []),
    { key: 'donut', label: 'Répartition des votes', icon: PieIcon },
    { key: 'bars', label: 'Comparatif', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen isolate">
      <PollBackdrop image={poll.cover_photo_url} />
      <PollHeader poll={poll} slug={slug} active="Classement" solid />
      <PollSubHero poll={poll} slug={slug} icon={Trophy} title="Classement" subtitle={`${candidates.length} candidat${candidates.length > 1 ? 's' : ''} en compétition`} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <Podium candidates={candidates} slug={slug} />

        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setView(v.key)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${view === v.key ? 'bg-primary text-white' : 'bg-white/5 text-white/60 hover:text-white'}`}
            >
              <v.icon size={14} aria-hidden="true" />
              {v.label}
            </button>
          ))}
        </div>

        {view === 'list' && (
          <div className="space-y-3">
            {candidates.map((c, i) => (
              <RankRow key={c.candidate_id} candidate={c} maxScore={maxScore} index={i} slug={slug} />
            ))}
          </div>
        )}
        {view === 'category' && <CategoryView candidates={candidates} slug={slug} />}
        {view === 'donut' && <DonutView candidates={candidates} />}
        {view === 'bars' && <BarsView candidates={candidates} />}
      </main>

      <PollFooter poll={poll} />
    </div>
  );
}
