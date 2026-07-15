import crypto from "node:crypto";
import { pool } from "../db/pool.js";
import { createCandidate } from "./candidatesStore.js";

// ---------------------------------------------------------------------------
// Création d'une campagne de type Scrutin & Vote (seul type disponible au
// MVP, voir Spec Fonctionnelle section D "Créer une campagne — Sélecteur").
// Statut initial PENDING_VALIDATION : toute nouvelle campagne attend une
// validation admin avant publication (comme les modifications sensibles
// d'une campagne existante, voir dashboardController.js).
// ---------------------------------------------------------------------------

const DIACRITIC_MARKS_RE = new RegExp("[̀-ͯ]", "g");

function slugify(title) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITIC_MARKS_RE, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function generateUniqueSlug(title) {
  const base = slugify(title) || "scrutin";
  let slug = base;
  let attempt = 0;

  while (true) {
    const { rows } = await pool.query(`SELECT 1 FROM polls WHERE slug = $1`, [slug]);
    if (rows.length === 0) return slug;
    attempt += 1;
    slug = `${base}-${attempt}`;
  }
}

/**
 * Crée une campagne Scrutin & Vote complète : ligne campaigns (CTI) + ligne
 * polls + candidats initiaux + politique de remboursement si vote payant.
 * Tout dans une transaction : soit tout est créé, soit rien ne l'est.
 */
export async function createPollCampaign(userId, data) {
  const {
    title,
    description,
    coverPhotoUrl,
    additionalPhotosUrls,
    videosUrls,
    category,
    displayOrganizerName,
    socialLinks,
    voteType,
    pricePerVote,
    votePacks,
    maxVotesPerVisitor,
    openAt,
    closeAt,
    timezone,
    resultsVisibility,
    candidates,
    refundPolicy,
  } = data;

  if (!title || !title.trim()) throw new Error("Le titre est requis.");
  if (!voteType) throw new Error("Le type de vote est requis.");
  if (!openAt || !closeAt) throw new Error("Les dates d'ouverture et de clôture sont requises.");
  if (new Date(closeAt) <= new Date(openAt)) throw new Error("La date de clôture doit être postérieure à la date d'ouverture.");

  const isPaid = voteType === "PAID";
  if (isPaid && (!pricePerVote || Number(pricePerVote) <= 0)) {
    throw new Error("Le prix par vote est requis pour un scrutin payant.");
  }
  if (isPaid && (!refundPolicy || typeof refundPolicy.refundable !== "boolean")) {
    throw new Error("Les conditions de remboursement sont obligatoires pour une campagne payante.");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const campaignId = crypto.randomUUID();
    const slug = await generateUniqueSlug(title);

    await client.query(
      `INSERT INTO campaigns (campaign_id, campaign_type, owner_user_id) VALUES ($1, 'POLL', $2)`,
      [campaignId, userId]
    );

    const { rows } = await client.query(
      `INSERT INTO polls
         (poll_id, user_id, slug, title, description, cover_photo_url,
          additional_photos_urls, videos_urls, category,
          display_organizer_name, social_links, status, vote_type, price_per_vote, vote_packs,
          max_votes_per_visitor, results_visibility, open_at, close_at, timezone)
       VALUES
         ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'PENDING_VALIDATION', $12, $13, $14, $15, $16, $17, $18, $19)
       RETURNING poll_id, slug, title, status`,
      [
        campaignId,
        userId,
        slug,
        title.trim(),
        description || null,
        coverPhotoUrl || null,
        Array.isArray(additionalPhotosUrls) ? additionalPhotosUrls : [],
        Array.isArray(videosUrls) ? videosUrls : [],
        category || null,
        displayOrganizerName || null,
        socialLinks ? JSON.stringify(socialLinks) : null,
        voteType,
        isPaid ? Number(pricePerVote) : null,
        votePacks ? JSON.stringify(votePacks) : null,
        maxVotesPerVisitor ? Number(maxVotesPerVisitor) : null,
        resultsVisibility || "PUBLIC",
        openAt,
        closeAt,
        timezone || "Africa/Douala",
      ]
    );
    const poll = rows[0];

    if (isPaid) {
      await client.query(
        `INSERT INTO refund_policies (campaign_id, campaign_type, refundable, delay_hours, percentage)
         VALUES ($1, 'POLL', $2, $3, $4)`,
        [campaignId, refundPolicy.refundable, refundPolicy.delayHours || null, refundPolicy.percentage || null]
      );
    }

    await client.query("COMMIT");

    // Les candidats sont créés APRÈS le commit de la campagne : chaque
    // insertion est indépendante (createCandidate gère sa propre requête),
    // une candidature invalide ne doit jamais faire échouer la création de
    // toute la campagne déjà validée.
    if (Array.isArray(candidates)) {
      for (const candidate of candidates) {
        if (candidate?.display_name) {
          try {
            await createCandidate(campaignId, candidate);
          } catch (err) {
            console.warn(`Candidat ignoré (${candidate.display_name}) :`, err.message);
          }
        }
      }
    }

    return poll;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
