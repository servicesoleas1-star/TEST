// components/poll/PollFooter.jsx — footer minimaliste propre à une campagne
// de vote, utilisé sur TOUTES les pages de la section Scrutin & Vote à la
// place du Footer principal du site. Contient : la vidéo d'arrière-plan du
// site (même fichier que le footer principal, pour rester cohérent), le
// visuel + nom du scrutin, ses liens réseaux sociaux, son contact support,
// et un lien de retour vers la plateforme.

import { useEffect, useRef } from 'react';
import { Mail, MessageCircle } from 'lucide-react';
import { media } from '../../config/media';
import { useFetch } from '../../lib/pollApi';
import { SocialBadge } from '../SocialIcon';

export default function PollFooter({ poll }) {
  const videoRef = useRef(null);
  const { data: rules } = useFetch(poll?.slug ? `/api/polls/${poll.slug}/rules` : null, [poll?.slug]);
  const support = rules?.support_contact || {};
  const socialLinks = poll?.social_links || {};
  const entries = Object.entries(socialLinks).filter(([, url]) => url);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) v.play().catch(() => {});
      },
      { threshold: 0.1 }
    );
    observer.observe(v);
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="relative bg-ink-900 border-t border-white/10 overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-25"
        src={media.footerVideo}
      />
      <div className="absolute inset-0 bg-ink-900/85" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3 min-w-0">
            {poll?.cover_photo_url ? (
              <img src={poll.cover_photo_url} alt="" className="w-11 h-11 rounded-lg object-cover border border-white/15 shrink-0" />
            ) : (
              <div className="w-11 h-11 rounded-lg bg-white/10 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{poll?.title}</p>
              {poll?.display_organizer_name && <p className="text-white/50 text-xs truncate">Organisé par {poll.display_organizer_name}</p>}
            </div>
          </div>

          {entries.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              {entries.map(([key, url]) => (
                <SocialBadge key={key} name={key} href={url} size={36} />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-6 pb-8 border-t border-white/10">
          {support.whatsapp && (
            <a href={`https://wa.me/${support.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white transition-colors">
              <MessageCircle size={13} aria-hidden="true" />
              +{support.whatsapp}
            </a>
          )}
          {support.email && (
            <a href={`mailto:${support.email}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white transition-colors">
              <Mail size={13} aria-hidden="true" />
              {support.email}
            </a>
          )}
        </div>

        {/* CTA bien visible, centrée -- ramène vers la plateforme (page
            d'accueil du site, pas directement le formulaire d'inscription)
            pour tout visiteur intéressé à créer son propre événement. */}
        <div className="flex flex-col items-center gap-3 pb-2">
          <img src={media.logo} alt="Moledi Event" className="h-7 w-auto object-contain" />
          <a href="/" className="text-base sm:text-lg font-heading normal-case text-primary-300 hover:text-primary-200 transition-colors">
            Créer mon propre événement
          </a>
        </div>
      </div>
      <p className="relative text-center text-white/30 text-[11px] pb-6">© {new Date().getFullYear()} Moledi Event. Tous droits réservés.</p>
    </footer>
  );
}
