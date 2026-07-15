/**
 * Central media registry — swap placeholders for Supabase Storage URLs
 * production-side. Keeps the rest of the app decoupled from where files live.
 */

// Brand — un seul fichier logo, transparent PNG, utilisé partout sur le
// site (header, footer, pages d'auth, animations). Un seul nom, droppable
// dans /public/logo.png sans aucun changement de code.
export const media = {
  logo: '/logo.png',
  heroPoster: '/hero-poster.jpg',
  heroVideo: '/hero-video.mp4',
  // Separate URL from heroVideo on purpose — drop a different file at
  // /public/footer-video.mp4 (or update this path) to swap the footer's
  // background video independently from the header's.
  footerVideo: '/footer-video.mp4',
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
  // How it works — step 3 (share) confirmed fine, left as is. Step 1 and 2
  // moved off local icon-style assets to real web photos matching their
  // meaning (creating a page / configuring options); step 4 (cashout)
  // confirmed fine.
  create: u('1454165804606-c3d57bc86b40'),      // hands + laptop, building a page
  configure: '/configuration%20acceuil.jpg',    // photo réelle fournie par le client
  share: u('1611926653458-09294b3142bf'),       // phone share / messaging
  cashout: '/reception%20argent.jpg',           // photo réelle fournie par le client

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
