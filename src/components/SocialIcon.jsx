// components/SocialIcon.jsx — vrais logos des réseaux sociaux (marques
// officielles, tracés SVG + couleur de marque), partagés par le footer
// principal, le footer de campagne, l'en-tête de scrutin et le pop-up de
// partage. Remplace les pastilles "première lettre" utilisées par endroits
// comme repli provisoire.

export const SOCIAL_ICONS_BY_KEY = {
  facebook: {
    name: 'Facebook',
    bg: '#1877F2',
    path: 'M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0022 12z',
  },
  instagram: {
    name: 'Instagram',
    bg: 'linear-gradient(45deg,#F58529,#DD2A7B,#8134AF,#515BD4)',
    path: 'M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.3 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .3-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.3-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.3 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.2A6.6 6.6 0 1012 18.6 6.6 6.6 0 0012 5.4zm0 10.9a4.3 4.3 0 110-8.6 4.3 4.3 0 010 8.6zm6.4-11.2a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z',
  },
  tiktok: {
    name: 'TikTok',
    bg: '#000000',
    path: 'M16.5 3c.3 2.1 1.5 3.9 3.5 4.4v2.6c-1.3.1-2.6-.3-3.7-1v5.9c0 3.3-2.7 5.6-5.7 5.1-2.4-.4-4.2-2.5-4.1-4.9.1-2.6 2.3-4.6 4.9-4.4v2.7c-.4-.1-.8-.1-1.2 0-1 .3-1.6 1.3-1.4 2.3.2 1 1.2 1.7 2.2 1.5 1-.2 1.6-1 1.6-2V3h3.6z',
  },
  x: {
    name: 'X',
    bg: '#000000',
    path: 'M18.9 3H22l-7.4 8.4L23 21h-6.8l-5.3-6.5L4.7 21H1.6l7.9-9L1 3h6.9l4.8 6 6.2-6zm-1.2 16h1.9L7.3 4.8H5.3L17.7 19z',
  },
  linkedin: {
    name: 'LinkedIn',
    bg: '#0A66C2',
    path: 'M20.4 3H3.6C3.3 3 3 3.3 3 3.6v16.8c0 .3.3.6.6.6h16.8c.3 0 .6-.3.6-.6V3.6c0-.3-.3-.6-.6-.6zM8.3 18.3H5.6V9.7h2.7v8.6zM7 8.5a1.6 1.6 0 110-3.1 1.6 1.6 0 010 3.1zm11.3 9.8h-2.7v-4.2c0-1 0-2.3-1.4-2.3s-1.6 1.1-1.6 2.2v4.3h-2.7V9.7h2.6v1.2h.1c.4-.7 1.3-1.4 2.6-1.4 2.7 0 3.2 1.8 3.2 4.1v4.7z',
  },
  whatsapp: {
    name: 'WhatsApp',
    bg: '#25D366',
    path: 'M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 013.8 12c0-4.5 3.7-8.2 8.2-8.2s8.2 3.7 8.2 8.2-3.7 8.2-8.2 8.2z',
  },
};

/**
 * @param {{ name: string, size?: number, className?: string }} props
 * `name` matches a key of SOCIAL_ICONS_BY_KEY (facebook, instagram, tiktok,
 * x, linkedin, whatsapp) — case-insensitive, falls back to nothing rendered
 * if unknown (never an invented icon).
 */
export default function SocialIcon({ name, size = 15, className = '' }) {
  const icon = SOCIAL_ICONS_BY_KEY[String(name || '').toLowerCase()];
  if (!icon) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d={icon.path} />
    </svg>
  );
}

/** Pastille carrée (fond couleur de marque) + logo blanc dedans — le format
 * utilisé partout où on affichait avant une simple lettre. */
export function SocialBadge({ name, href, size = 36 }) {
  const icon = SOCIAL_ICONS_BY_KEY[String(name || '').toLowerCase()];
  if (!icon || !href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={icon.name}
      style={icon.name === 'Instagram' ? { backgroundImage: icon.bg, width: size, height: size } : { backgroundColor: icon.bg, width: size, height: size }}
      className="flex items-center justify-center rounded-lg shadow-sm transition-transform hover:scale-110 hover:-translate-y-0.5 shrink-0"
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="white" aria-hidden="true">
        <path d={icon.path} />
      </svg>
    </a>
  );
}
