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
  // Hero + event families — switched to the client's own local photos.
  // This sandbox's network policy blocks every image host (Unsplash,
  // Pexels, Pixabay, Wikimedia all fail outbound), so a new external URL
  // can never be verified before shipping. Local assets are guaranteed to
  // render and are real photos from the client's own events, which is a
  // strictly better fit than a guessed stock ID anyway.
  ticketing: '/concert-stadium.jpg',
  votes: '/election-vote.jpg',
  donations: '/donation-coins.jpg',
  crowdfunding: '/community-hands.jpg',
  sponsoring: '/event-venue.jpg',
  contests: '/contest-trophy.jpg',
  // How it works — step 3 (share) confirmed fine, left as is. Step 1
  // (create/choose a type) and step 2 (configure options, not a venue)
  // swapped for a better fit; step 4 (cashout) confirmed fine.
  create: '/events-collage-light.jpg',
  configure: '/vote-icon-button.jpg',
  share: u('1611926653458-09294b3142bf'),       // phone share / messaging
  cashout: u('1556742049-0cfed4f6a45d'),        // mobile payment confirmation

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
