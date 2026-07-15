import { pool } from "../db/pool.js";

const SORTS = {
  recent: "created_at DESC",
  popular: "votes_count DESC, created_at DESC",
  closing_soon: "ends_at ASC NULLS LAST, created_at DESC",
};

/**
 * Liste paginée du catalogue public de campagnes (page /evenements),
 * avec recherche plein texte, filtres et tri — voir 17_event_listings.sql
 * pour le contexte de cette table dédiée (catalogue vitrine, pas la
 * source de vérité métier).
 *
 * @param {{ search?: string, type?: string, status?: string, country?: string, sort?: string, offset?: number, limit?: number }} params
 */
export async function listEventListings({
  search = "",
  type = "",
  status = "",
  country = "",
  sort = "recent",
  offset = 0,
  limit = 12,
} = {}) {
  const conditions = [];
  const values = [];

  if (search.trim()) {
    values.push(search.trim());
    conditions.push(`to_tsvector('french', title || ' ' || description) @@ plainto_tsquery('french', $${values.length})`);
  }
  if (type) {
    values.push(type);
    conditions.push(`campaign_type = $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  if (country) {
    values.push(country);
    conditions.push(`country = $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderClause = SORTS[sort] || SORTS.recent;

  const { rows: countRows } = await pool.query(
    `SELECT count(*)::int AS total FROM event_listings ${whereClause}`,
    values
  );

  values.push(limit);
  values.push(offset);
  const { rows } = await pool.query(
    `SELECT listing_id, campaign_type, title, slug, description, image_url, country,
            status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url,
            votes_count, starts_at, ends_at, created_at
       FROM event_listings
       ${whereClause}
       ORDER BY ${orderClause}
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );

  return { items: rows, total: countRows[0]?.total ?? 0 };
}

const LISTING_COLUMNS = `listing_id, campaign_type, title, slug, description, image_url, country,
            status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url,
            votes_count, starts_at, ends_at, created_at`;

/**
 * Bande "À la une" : les campagnes épinglées par l'admin d'abord (triées
 * par plus récent), puis complétée jusqu'à `maxTotal` par les campagnes
 * les plus populaires (par votes_count) qui ne sont pas déjà épinglées --
 * jamais filtrée par recherche/statut, toujours visible en haut (masquée
 * côté frontend uniquement quand une recherche/un filtre est actif).
 */
export async function listPinnedEventListings(maxTotal = 8) {
  const { rows: pinned } = await pool.query(
    `SELECT ${LISTING_COLUMNS} FROM event_listings WHERE is_pinned = TRUE ORDER BY created_at DESC LIMIT $1`,
    [maxTotal]
  );

  const remaining = maxTotal - pinned.length;
  if (remaining <= 0) return pinned;

  const { rows: popular } = await pool.query(
    `SELECT ${LISTING_COLUMNS} FROM event_listings WHERE is_pinned = FALSE ORDER BY votes_count DESC, created_at DESC LIMIT $1`,
    [remaining]
  );

  return [...pinned, ...popular];
}

export async function getEventListingBySlug(slug) {
  const { rows } = await pool.query(
    `SELECT listing_id, campaign_type, title, slug, description, image_url, country,
            status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url,
            votes_count, starts_at, ends_at, created_at
       FROM event_listings
       WHERE slug = $1`,
    [slug]
  );
  return rows[0] || null;
}
