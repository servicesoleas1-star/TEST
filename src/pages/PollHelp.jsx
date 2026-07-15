// pages/PollHelp.jsx — Route publique : /vote/:slug/aide
//
// Page Aide / Signalement du scrutin : formulaire qui crée un signalement
// (poll_reports) + un ticket de support lié dans le back-office.

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, LifeBuoy } from 'lucide-react';
import PollHeader from '../components/poll/PollHeader';
import PollFooter from '../components/poll/PollFooter';
import PollSubHero from '../components/poll/PollSubHero';
import PollLoadingScreen from '../components/poll/PollLoadingScreen';
import PollBackdrop from '../components/poll/PollBackdrop';
import { getVisitorId } from '../lib/visitorId.js';
import { useFetch } from '../lib/pollApi';

const COMPLAINT_TYPES = [
  { value: 'VOTE_NOT_COUNTED', label: 'Vote non comptabilisé' },
  { value: 'PAYMENT_WITHOUT_VOTE', label: 'Paiement sans vote' },
  { value: 'DUPLICATE_VOTE', label: 'Vote en double' },
  { value: 'TECHNICAL', label: 'Problème technique' },
  { value: 'WRONG_INFO', label: 'Information incorrecte sur un candidat' },
  { value: 'SUSPECTED_FRAUD', label: 'Fraude suspectée' },
  { value: 'MISSING_CANDIDATE', label: 'Candidat manquant' },
  { value: 'WRONG_SCORE', label: "Problème d'affichage du score" },
  { value: 'OTHER', label: 'Autre' },
];

const inputClass = (hasError) =>
  `w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-primary transition-colors ${hasError ? 'border-red-400' : 'border-white/15'}`;

export default function PollHelpPage() {
  const { slug } = useParams();
  const { data: poll } = useFetch(`/api/polls/${slug}`, [slug]);
  const [candidates, setCandidates] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', complaintType: '', candidateId: '', description: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetch(`/api/polls/${slug}/candidates`).then((r) => r.json()).then((d) => setCandidates(d.candidates || [])).catch(() => setCandidates([]));
  }, [slug]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Le nom est requis.';
    if (!form.phone.trim() || form.phone.trim().length < 8) errs.phone = 'Numéro de téléphone invalide.';
    if (!form.complaintType) errs.complaintType = 'Merci de choisir un type de signalement.';
    if (!form.description.trim() || form.description.trim().length < 10) errs.description = 'Merci de décrire le problème (10 caractères minimum).';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setStatus('submitting');
    setErrorMessage('');
    try {
      const res = await fetch(`/api/polls/${slug}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Visitor-Id': getVisitorId() },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          complaintType: form.complaintType,
          candidateId: form.candidateId || null,
          description: form.description,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMessage(data.error || 'Une erreur est survenue.');
        setStatus('error');
        return;
      }
      setStatus('success');
    } catch {
      setErrorMessage('Impossible de contacter le serveur. Réessayez dans un instant.');
      setStatus('error');
    }
  }

  if (!poll) {
    return (
      <PollLoadingScreen />
    );
  }

  return (
    <div className="min-h-screen isolate">
      <PollBackdrop image={poll.cover_photo_url} />
      <PollHeader poll={poll} slug={slug} active="Aide" solid />
      <PollSubHero poll={poll} slug={slug} icon={LifeBuoy} title="Aide & Signalement" subtitle="Un problème avec ce scrutin ? Décrivez-le, notre équipe vous répondra rapidement" />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {status === 'success' ? (
          <div role="status" className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <CheckCircle2 size={40} className="mx-auto mb-4 text-primary-300" aria-hidden="true" />
            <p className="text-lg font-semibold text-white mb-2">Signalement envoyé</p>
            <p className="text-white/60 normal-case">Nous avons bien reçu votre signalement et créé un ticket de support. Notre équipe reviendra vers vous rapidement.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            {status === 'error' && errorMessage && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{errorMessage}</p>}

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-1.5">Nom complet</label>
              <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass(errors.name)} />
              {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-1.5">Téléphone</label>
              <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className={inputClass(errors.phone)} />
              {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-1.5">Type de signalement</label>
              <select value={form.complaintType} onChange={(e) => update('complaintType', e.target.value)} className={inputClass(errors.complaintType)}>
                <option value="" className="bg-ink-800">-- Choisir --</option>
                {COMPLAINT_TYPES.map((c) => (
                  <option key={c.value} value={c.value} className="bg-ink-800">{c.label}</option>
                ))}
              </select>
              {errors.complaintType && <p className="mt-1 text-sm text-red-400">{errors.complaintType}</p>}
            </div>

            {candidates.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-1.5">Candidat concerné (optionnel)</label>
                <select value={form.candidateId} onChange={(e) => update('candidateId', e.target.value)} className={inputClass(false)}>
                  <option value="" className="bg-ink-800">-- Aucun candidat en particulier --</option>
                  {candidates.map((c) => (
                    <option key={c.candidate_id} value={c.candidate_id} className="bg-ink-800">{c.display_name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-1.5">Description détaillée</label>
              <textarea rows={5} value={form.description} onChange={(e) => update('description', e.target.value)} className={inputClass(errors.description)} />
              {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description}</p>}
            </div>

            <button type="submit" disabled={status === 'submitting'} className="btn btn-primary w-full !py-3 disabled:opacity-60">
              {status === 'submitting' ? 'Envoi en cours...' : 'Envoyer le signalement'}
            </button>
          </form>
        )}
      </main>
      <PollFooter poll={poll} />
    </div>
  );
}
