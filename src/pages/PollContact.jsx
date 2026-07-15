// pages/PollContact.jsx — Route publique : /vote/:slug/contact
//
// Page Contact propre à la campagne : coordonnées du support (issues des
// mêmes règles que la page Règles), réseaux sociaux de l'événement, et un
// lien direct vers le formulaire de signalement structuré (/aide) pour
// toute demande qui nécessite un suivi (ticket de support).

import { useParams } from 'react-router-dom';
import { Mail, MessageCircle, Clock, LifeBuoy } from 'lucide-react';
import PollHeader from '../components/poll/PollHeader';
import PollFooter from '../components/poll/PollFooter';
import PollSubHero from '../components/poll/PollSubHero';
import PollLoadingScreen from '../components/poll/PollLoadingScreen';
import PollBackdrop from '../components/poll/PollBackdrop';
import { useFetch } from '../lib/pollApi';

export default function PollContactPage() {
  const { slug } = useParams();
  const { data: poll } = useFetch(`/api/polls/${slug}`, [slug]);
  const { data: rules } = useFetch(`/api/polls/${slug}/rules`, [slug]);
  const support = rules?.support_contact || {};
  const socialLinks = poll?.social_links || {};

  if (!poll) {
    return (
      <PollLoadingScreen />
    );
  }

  return (
    <div className="min-h-screen isolate">
      <PollBackdrop image={poll.cover_photo_url} />
      <PollHeader poll={poll} slug={slug} active="Contact" solid />
      <PollSubHero poll={poll} slug={slug} icon={Mail} title="Contact" subtitle="Une question sur ce scrutin ? Contactez l'organisateur" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-4">
        {support.whatsapp && (
          <a href={`https://wa.me/${support.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-primary/30 transition-colors">
            <span className="w-12 h-12 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center shrink-0">
              <MessageCircle size={20} className="text-[#25D366]" aria-hidden="true" />
            </span>
            <div>
              <p className="text-white font-semibold text-sm">WhatsApp</p>
              <p className="text-white/50 text-sm">+{support.whatsapp}</p>
            </div>
          </a>
        )}

        {support.email && (
          <a href={`mailto:${support.email}`} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-primary/30 transition-colors">
            <span className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
              <Mail size={20} className="text-primary-300" aria-hidden="true" />
            </span>
            <div>
              <p className="text-white font-semibold text-sm">Email</p>
              <p className="text-white/50 text-sm">{support.email}</p>
            </div>
          </a>
        )}

        {support.response_time_label && (
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <span className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Clock size={20} className="text-white/70" aria-hidden="true" />
            </span>
            <p className="text-white/70 text-sm">{support.response_time_label}</p>
          </div>
        )}

        {Object.entries(socialLinks).filter(([, url]) => url).length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-white font-semibold text-sm mb-4">Suivre l'événement</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(socialLinks).map(([key, url]) =>
                url ? (
                  <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-white/10 text-white text-xs font-semibold uppercase hover:bg-white/20 transition-colors">
                    {key}
                  </a>
                ) : null
              )}
            </div>
          </div>
        )}

        <a href={`/vote/${slug}/aide`} className="flex items-center gap-4 rounded-2xl border border-primary/30 bg-primary/10 p-6 hover:bg-primary/15 transition-colors">
          <span className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <LifeBuoy size={20} className="text-primary-300" aria-hidden="true" />
          </span>
          <div>
            <p className="text-white font-semibold text-sm">Signaler un problème</p>
            <p className="text-white/50 text-sm">Vote non comptabilisé, paiement sans vote, fraude... ouvrez un ticket de support.</p>
          </div>
        </a>
      </main>

      <PollFooter poll={poll} />
    </div>
  );
}
