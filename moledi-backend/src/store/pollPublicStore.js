import { pool } from "../db/pool.js";

/**
 * Données publiques de la page d'accueil d'un scrutin (/vote/:slug).
 * Ne renvoie jamais de champ privé de candidat (phone/email) -- ceux-ci ne
 * sont de toute façon pas sélectionnés ici.
 */
export async function getPollHome(slug) {
  const { rows } = await pool.query(
    `SELECT p.poll_id, p.slug, p.title, p.description, p.cover_photo_url, p.additional_photos_urls,
            p.videos_urls, p.category, p.display_organizer_name, p.social_links, p.status,
            p.vote_type, p.price_per_vote, p.show_grid_directly, p.open_at, p.close_at, p.timezone,
            p.results_visibility, p.welcome_message, p.visible_sections,
            u.avatar_url AS organizer_logo_url,
            b.primary_color, b.secondary_color, b.accent_color, b.logo_url AS brand_logo_url
       FROM polls p
       JOIN users u ON u.user_id = p.user_id
       LEFT JOIN brand_settings b ON b.campaign_id = p.poll_id
       WHERE p.slug = $1`,
    [slug]
  );
  return rows[0] || null;
}

/**
 * Liste des candidats d'un scrutin, triée par rang (puis score décroissant
 * pour les candidats pas encore classés) -- utilisée par le carrousel
 * "Candidats" et par la page "Classement" complète.
 */
export async function listPollCandidates(pollId) {
  const { rows } = await pool.query(
    `SELECT c.candidate_id, c.display_name, c.cover_photo_url, c.biography, c.score, c.rank,
            c.position, cc.name AS category_name
       FROM candidates c
       LEFT JOIN candidate_categories cc ON cc.category_id = c.category_id
       WHERE c.poll_id = $1 AND c.active = TRUE
       ORDER BY COALESCE(c.rank, 999999), c.score DESC, c.position`,
    [pollId]
  );
  return rows;
}

// real_name et custom_fields_data sont publics par conception (contrairement
// à phone/email, jamais sélectionnés ici) -- la spec fonctionnelle prévoit
// explicitement "Nom réel et nom de candidat, biographie complète" sur la
// fiche publique d'un candidat.
export async function getCandidateById(candidateId) {
  const { rows } = await pool.query(
    `SELECT c.candidate_id, c.poll_id, c.real_name, c.display_name, c.cover_photo_url, c.additional_photos_urls,
            c.videos_urls, c.biography, c.score, c.rank, c.position, c.custom_fields_data,
            cc.name AS category_name, p.slug AS poll_slug
       FROM candidates c
       LEFT JOIN candidate_categories cc ON cc.category_id = c.category_id
       JOIN polls p ON p.poll_id = c.poll_id
       WHERE c.candidate_id = $1 AND c.active = TRUE`,
    [candidateId]
  );
  return rows[0] || null;
}
