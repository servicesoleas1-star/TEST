/**
 * Featured catalog — records shaped EXACTLY on the UML class diagrams
 * (Moledi_UML_Structure_Final.pdf). Every field below exists verbatim in the
 * corresponding UML table, so swapping this module for real Supabase queries
 * (`from('event')`, `from('poll')`, `from('fundraiser')`, `from('cf_project')`,
 * `from('lottery')`) requires zero shape changes in the UI.
 *
 *   DC-04 Event + EventVenue + TicketType
 *   DC-03 Poll        (vote_type, price_per_vote, open_at/close_at)
 *   DC-05 Fundraiser  (goal_amount, collected_amount, donors_count)
 *   DC-05 CFProject   (goal_amount, raised_amount, backers_count, deadline)
 *   DC-06 Lottery     (ticket_price, max_tickets, tickets_sold, draw_at)
 */

const img = (id, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

// DC-04 — Event (+ EventVenue city/country, + cheapest TicketType)
export const events = [
  {
    event_id: 'evt-001',
    slug: 'festival-de-la-musique',
    title: 'Festival de la Musique',
    category: 'Concert',
    cover_photo_url: img('1470229722913-7c0e2dbbafd3'),
    status: 'PUBLISHED',
    start_at: '2026-05-24T20:00:00Z',
    venue: { city: 'Dakar', country: 'SN' }, // EventVenue
    ticket_types: [{ name: 'Standard', category: 'STANDARD', price: 5000, total_stock: 2000, sold_count: 1240 }],
  },
  {
    event_id: 'evt-002',
    slug: 'nuit-de-l-humour',
    title: "Nuit de l'Humour",
    category: 'Spectacle',
    cover_photo_url: img('1555169062-013468b47731'),
    status: 'PUBLISHED',
    start_at: '2026-07-02T19:30:00Z',
    venue: { city: 'Abidjan', country: 'CI' },
    ticket_types: [{ name: 'Entrée', category: 'STANDARD', price: 3000, total_stock: 800, sold_count: 415 }],
  },
];

// DC-03 — Poll
export const polls = [
  {
    poll_id: 'poll-001',
    slug: 'miss-elegance-2026',
    title: 'Miss Élégance 2026',
    category: 'Concours',
    cover_photo_url: img('1492684223066-81342ee5ff30'),
    status: 'OPEN',
    vote_type: 'PAID',
    price_per_vote: 100,
    total_votes: 12580, // aggregate of Vote rows
    open_at: '2026-06-01T00:00:00Z',
    close_at: '2026-08-15T23:59:00Z',
  },
];

// DC-05 — Fundraiser
export const fundraisers = [
  {
    fundraiser_id: 'fund-001',
    slug: 'aide-medicale-fatou',
    title: 'Aide médicale pour Fatou',
    cover_photo_url: img('1532629345422-7515f3d16bb6'),
    status: 'OPEN',
    goal_amount: 5000000,
    collected_amount: 2300000,
    donors_count: 314,
  },
];

// DC-05 — CFProject
export const cfProjects = [
  {
    project_id: 'cf-001',
    slug: 'studio-creatif-communautaire',
    title: 'Studio créatif communautaire',
    cover_photo_url: img('1522202176988-66273c2fd55f'),
    status: 'FUNDING',
    goal_amount: 10000000,
    raised_amount: 8100000,
    backers_count: 96,
    deadline: '2026-09-30T23:59:00Z',
  },
];

// DC-06 — Lottery
export const lotteries = [
  {
    lottery_id: 'lot-001',
    slug: 'tombola-ramadan',
    title: 'Tombola Ramadan',
    cover_photo_url: img('1513151233558-d860c5398176'),
    status: 'OPEN',
    ticket_price: 1000,
    max_tickets: 5000,
    tickets_sold: 1730,
    draw_at: '2026-06-15T20:00:00Z',
  },
];

/* ------------------------------------------------------------------ */
/*  Normalisation for the featured cards — one shape for the carousel  */
/* ------------------------------------------------------------------ */

const fmtF = (n) => `${n.toLocaleString('fr-FR').replace(/ /g, ' ')} F`;
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

export function featuredCards() {
  return [
    ...events.map((e) => ({
      key: e.event_id,
      href: `/evenements/${e.slug}`,
      image: e.cover_photo_url,
      badge: e.category,
      tone: 'orange',
      title: e.title,
      meta: `${fmtDate(e.start_at)} • ${e.venue.city}`,
      stat: `Dès ${fmtF(Math.min(...e.ticket_types.map((t) => t.price)))} CFA`,
      progress: null,
    })),
    ...polls.map((p) => ({
      key: p.poll_id,
      href: `/evenements/${p.slug}`,
      image: p.cover_photo_url,
      badge: 'Votes',
      tone: 'blue',
      title: p.title,
      meta: `Clôture ${fmtDate(p.close_at)}`,
      stat: `${p.total_votes.toLocaleString('fr-FR')} votes`,
      progress: null,
      live: p.status === 'OPEN',
    })),
    ...fundraisers.map((f) => ({
      key: f.fundraiser_id,
      href: `/evenements/${f.slug}`,
      image: f.cover_photo_url,
      badge: 'Cagnotte',
      tone: 'orange',
      title: f.title,
      meta: `${f.donors_count} donateurs`,
      stat: `${fmtF(f.collected_amount)} CFA collectés`,
      progress: Math.round((f.collected_amount / f.goal_amount) * 100),
    })),
    ...cfProjects.map((c) => ({
      key: c.project_id,
      href: `/evenements/${c.slug}`,
      image: c.cover_photo_url,
      badge: 'Crowdfunding',
      tone: 'blue',
      title: c.title,
      meta: `${c.backers_count} contributeurs • fin ${fmtDate(c.deadline)}`,
      stat: `${fmtF(c.raised_amount)} CFA levés`,
      progress: Math.round((c.raised_amount / c.goal_amount) * 100),
    })),
    ...lotteries.map((l) => ({
      key: l.lottery_id,
      href: `/evenements/${l.slug}`,
      image: l.cover_photo_url,
      badge: 'Tombola',
      tone: 'orange',
      title: l.title,
      meta: `Tirage le ${fmtDate(l.draw_at)}`,
      stat: `${l.tickets_sold.toLocaleString('fr-FR')} / ${l.max_tickets.toLocaleString('fr-FR')} tickets`,
      progress: Math.round((l.tickets_sold / l.max_tickets) * 100),
    })),
  ];
}
