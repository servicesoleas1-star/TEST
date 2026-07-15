import {
  listEventListings,
  listPinnedEventListings,
  getEventListingBySlug,
} from "../store/eventListingsStore.js";

const VALID_TYPES = ["POLL", "EVENT", "FUNDRAISER", "CF_PROJECT", "LOTTERY", "CONTEST", "SPONSOR_CALL"];
const VALID_STATUSES = ["UPCOMING", "ONGOING", "ENDED", "SUSPENDED"];
const VALID_SORTS = ["recent", "popular", "closing_soon"];
const MAX_LIMIT = 24;

/**
 * GET /api/events?q=&type=&status=&country=&sort=&offset=&limit=
 * Catalogue public paginé, avec la bande "épinglés" incluse uniquement à
 * la première page (offset=0) pour ne jamais la répéter en scroll infini.
 */
export async function getEventListings(req, res) {
  try {
    const search = typeof req.query.q === "string" ? req.query.q.slice(0, 200) : "";
    const type = VALID_TYPES.includes(req.query.type) ? req.query.type : "";
    const status = VALID_STATUSES.includes(req.query.status) ? req.query.status : "";
    const country = typeof req.query.country === "string" ? req.query.country.slice(0, 100) : "";
    const sort = VALID_SORTS.includes(req.query.sort) ? req.query.sort : "recent";
    const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || 12));

    const [{ items, total }, pinned] = await Promise.all([
      listEventListings({ search, type, status, country, sort, offset, limit }),
      offset === 0 ? listPinnedEventListings() : Promise.resolve([]),
    ]);

    return res.status(200).json({ ok: true, items, total, pinned, hasMore: offset + items.length < total });
  } catch (err) {
    console.error("Event listings fetch error:", err.message);
    return res.status(200).json({ ok: true, items: [], total: 0, pinned: [], hasMore: false });
  }
}

/**
 * GET /api/events/:slug
 */
export async function getEventListingDetail(req, res) {
  try {
    const listing = await getEventListingBySlug(req.params.slug);
    if (!listing) {
      return res.status(404).json({ error: "Événement introuvable." });
    }
    return res.status(200).json({ ok: true, listing });
  } catch (err) {
    console.error("Event listing detail fetch error:", err.message);
    return res.status(500).json({ error: "Une erreur est survenue." });
  }
}
