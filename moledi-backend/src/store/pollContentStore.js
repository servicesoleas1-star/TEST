import { pool } from "../db/pool.js";

export async function listPollNews(pollId, limit = 20) {
  const { rows } = await pool.query(
    `SELECT news_id, title, body, photos_urls, videos_urls, published_at
       FROM poll_news
       WHERE poll_id = $1
       ORDER BY published_at DESC
       LIMIT $2`,
    [pollId, limit]
  );
  return rows;
}

/**
 * Seuls les partenaires validés par l'organisateur sont exposés
 * publiquement (poll_partners.validated) — un partenaire ajouté mais pas
 * encore validé ne doit jamais apparaître sur la page publique.
 */
export async function listPollPartners(pollId) {
  const { rows } = await pool.query(
    `SELECT partner_id, name, logo_url, website_url, level
       FROM poll_partners
       WHERE poll_id = $1 AND validated = TRUE
       ORDER BY level, name`,
    [pollId]
  );
  return rows;
}

export async function listPollFaqs(pollId) {
  const { rows } = await pool.query(
    `SELECT faq_id, question, answer, position
       FROM poll_faqs
       WHERE poll_id = $1
       ORDER BY position, question`,
    [pollId]
  );
  return rows;
}

/**
 * Galerie publique : entrées dédiées (poll_galleries) + photos/vidéos
 * additionnelles téléversées à la création/modification de la campagne
 * (polls.additional_photos_urls / polls.videos_urls). Ces dernières n'ont
 * pas de ligne poll_galleries propre -- on les matérialise ici en items
 * synthétiques (id préfixé "poll-media-") plutôt que de dupliquer les
 * fichiers dans poll_galleries à la création.
 */
export async function listPollGallery(pollId, limit = 60) {
  const { rows } = await pool.query(
    `SELECT item_id::text AS item_id, media_url, media_type, tag, uploaded_at
       FROM poll_galleries
       WHERE poll_id = $1
     UNION ALL
     SELECT 'poll-media-photo-' || gs::text AS item_id, additional_photos_urls[gs] AS media_url,
            'PHOTO'::media_type AS media_type, NULL::gallery_tag AS tag, created_at AS uploaded_at
       FROM polls, generate_subscripts(additional_photos_urls, 1) AS gs
       WHERE poll_id = $1
     UNION ALL
     SELECT 'poll-media-video-' || gs::text AS item_id, videos_urls[gs] AS media_url,
            'VIDEO'::media_type AS media_type, NULL::gallery_tag AS tag, created_at AS uploaded_at
       FROM polls, generate_subscripts(videos_urls, 1) AS gs
       WHERE poll_id = $1
     ORDER BY uploaded_at DESC
     LIMIT $2`,
    [pollId, limit]
  );
  return rows;
}

/**
 * Annonces / pop-ups actifs d'un scrutin -- une annonce non permanente et
 * expirée n'est plus renvoyée (filtrée côté SQL plutôt que côté client,
 * pour ne jamais exposer un message expiré même brièvement).
 */
export async function listActivePollNotices(pollId) {
  const { rows } = await pool.query(
    `SELECT notice_id, message, type, permanent, expires_at, published_at
       FROM poll_notices
      WHERE poll_id = $1
        AND (permanent = TRUE OR expires_at IS NULL OR expires_at > now())
      ORDER BY published_at DESC`,
    [pollId]
  );
  return rows;
}

/**
 * Résultats publics : uniquement si le scrutin est CLOSED et que le PV de
 * clôture le plus récent est marqué public (closing_reports.public) — ne
 * jamais exposer un classement avant la clôture officielle.
 */
export async function getPollResults(pollId) {
  const { rows: pollRows } = await pool.query(`SELECT status FROM polls WHERE poll_id = $1`, [pollId]);
  if (!pollRows[0] || pollRows[0].status !== "CLOSED") return null;

  const { rows: reportRows } = await pool.query(
    `SELECT report_id, version, pdf_url, sha256_hash, generated_at
       FROM closing_reports
       WHERE poll_id = $1 AND public = TRUE
       ORDER BY version DESC
       LIMIT 1`,
    [pollId]
  );
  if (!reportRows[0]) return null;

  const { rows: candidates } = await pool.query(
    `SELECT c.candidate_id, c.display_name, c.cover_photo_url, c.score, c.rank, cc.name AS category_name
       FROM candidates c
       LEFT JOIN candidate_categories cc ON cc.category_id = c.category_id
       WHERE c.poll_id = $1 AND c.active = TRUE
       ORDER BY COALESCE(c.rank, 999999), c.score DESC`,
    [pollId]
  );

  return { report: reportRows[0], candidates };
}
