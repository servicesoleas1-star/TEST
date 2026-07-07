/**
 * Central media registry — swap placeholders for Supabase Storage URLs
 * production-side. Keeps the rest of the app decoupled from where files live.
 */

// Brand — exactly two logo files, both transparent PNGs (no baked-in
// background), droppable in /public/ with no code change:
//   - logo: the full wordmark, used everywhere the brand needs to be
//     prominent (main header, footer, hero panels).
//   - logoMark: the "M" symbol alone, used only where space is tight
//     (compact/secondary placements).
export const media = {
  logo: '/logo-principal.png',
  logoMark: '/logo-mark.png',
  heroPoster: '/hero-poster.jpg',
  heroVideo: '/hero-video.mp4',
};

// Flag CDN — free, MIT-licensed set. e.g. https://flagcdn.com/w160/sn.png
export const flag = (iso, size = 80) => `https://flagcdn.com/w${size}/${iso}.png`;

// Marketing illustrations — Unsplash for now; replace with real assets later.
// Kept keys stable so swapping to Supabase is a one-file change.
const u = (id, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const illustration = {
  // Hero + event families — replaced with images the client explicitly
  // asked for (fresh, contextual, not the previously repeated Unsplash IDs).
  ticketing: u('1501281668745-f7f57925c3b4'),   // concert crowd with lights
  votes: u('1541872703-74c5e44368f4'),           // ballot / voting hands
  donations: u('1488521787991-ed7bbaae773c'),   // hands holding coins
  crowdfunding: u('1521737604893-d14cc237f11d'),
  contests: u('1567019740-6a3e0f6c1c5c'),       // trophy on stage
  sponsoring: u('1552664730-d307ca884978'),
  // How it works — fresh set for each of the four steps.
  create: u('1499750310107-5fef28a66643'),      // laptop + hands creating
  configure: u('1521791136064-7986c2920216'),   // adjusting settings on screen
  share: u('1611262588024-d12430b98920'),       // phone share / messaging
  cashout: u('1580519542036-c47de6196ba5'),     // mobile money transaction
  // Pricing teaser — a stack of receipts / calculator, not a stock desk.
  pricing: u('1554224155-6726b3ff858f'),
  // Sub-cause imagery (Système de dons — Zoom-2 cards)
  health: u('1576091160399-112ba8d25d1d', 700),
  studies: u('1523240795612-9a054b0db644', 700),
  solidarity: u('1509099836639-18ba1795216d', 700),
  projects: u('1552664730-d307ca884978', 700),
  // Zoom-2 generic (Comment ça marche / Pour qui / Confiance)
  howGeneric: u('1519389950473-47ba0277781c', 700),
  audience: u('1523240795612-9a054b0db644', 700),
  trust: u('1450101499163-c8848c66ca85', 700),
};
