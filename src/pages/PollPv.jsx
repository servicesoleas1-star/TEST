// pages/PollPv.jsx — Route publique : /vote/:slug/pv
//
// Page PV de clôture — accessible uniquement si le scrutin est clôturé ET
// que le PV a été rendu public par l'admin.

import { useParams } from 'react-router-dom';
import { FileCheck, Download, ShieldCheck } from 'lucide-react';
import PollHeader from '../components/poll/PollHeader';
import PollFooter from '../components/poll/PollFooter';
import PollSubHero from '../components/poll/PollSubHero';
import PollLoadingScreen from '../components/poll/PollLoadingScreen';
import PollBackdrop from '../components/poll/PollBackdrop';
import { useFetch, fmtDate } from '../lib/pollApi';

export default function PollPvPage() {
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
        <p className="text-white/70 mb-4">Le procès-verbal de ce scrutin n'est pas (encore) disponible publiquement.</p>
        <a href={`/vote/${slug}`} className="btn btn-primary">Retour au scrutin</a>
      </div>
    );
  }

  const { report } = data;

  return (
    <div className="min-h-screen isolate">
      <PollBackdrop image={poll.cover_photo_url} />
      <PollHeader poll={poll} slug={slug} active="Résultats" solid />
      <PollSubHero poll={poll} slug={slug} icon={FileCheck} title="Procès-verbal de clôture" />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <FileCheck size={40} className="mx-auto mb-4 text-primary-300" aria-hidden="true" />
          <p className="text-white/70 normal-case mb-1">
            Version {report.version} — généré le {fmtDate(report.generated_at, { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <a href={`/api/polls/${slug}/pv/download`} className="btn btn-primary mt-6 !px-8">
            <Download size={16} aria-hidden="true" />
            Télécharger le PDF
          </a>

          <div className="mt-8 pt-6 border-t border-white/10 text-left">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">
              <ShieldCheck size={15} aria-hidden="true" />
              Hash d'intégrité (SHA-256)
            </p>
            <p className="font-mono text-[11px] text-white/40 break-all">{report.sha256_hash}</p>
            <p className="text-[11px] text-white/40 mt-2 normal-case">Ce hash permet de vérifier que le document PDF n'a pas été modifié après sa génération.</p>
          </div>
        </div>
      </main>
      <PollFooter poll={poll} />
    </div>
  );
}
