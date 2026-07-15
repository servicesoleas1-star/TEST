import { pool } from "../db/pool.js";

// ---------------------------------------------------------------------------
// Gestion (organisateur) du contenu d'une campagne : annonces/pop-ups
// (poll_notices), FAQ (poll_faqs), galerie (poll_galleries), actualités
// (poll_news), partenaires (poll_partners). Toutes ces tables sont déjà
// exposées en LECTURE côté public (pollContentStore.js) mais n'avaient
// aucune écriture organisateur -- ce fichier ajoute le CRUD manquant.
// L'ownership (campagne appartient bien à l'utilisateur) est vérifiée par
// l'appelant (campaignContentController.js), pas ici.
// ---------------------------------------------------------------------------

// --- Annonces / Pop-ups -----------------------------------------------------

export async function listNotices(pollId) {
  const { rows } = await pool.query(
    `SELECT notice_id, message, type, permanent, expires_at, published_at
       FROM poll_notices
      WHERE poll_id = $1
      ORDER BY published_at DESC`,
    [pollId]
  );
  return rows;
}

export async function createNotice(pollId, { message, type, permanent, expiresAt }) {
  if (!message || !message.trim()) throw new Error("Le message est requis.");
  if (!["ANNOUNCEMENT", "POPUP"].includes(type)) throw new Error("Type d'annonce invalide.");

  const { rows } = await pool.query(
    `INSERT INTO poll_notices (poll_id, message, type, permanent, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING notice_id`,
    [pollId, message.trim(), type, Boolean(permanent), permanent ? null : expiresAt || null]
  );
  return rows[0];
}

export async function updateNotice(noticeId, { message, type, permanent, expiresAt }) {
  const updates = [];
  const params = [noticeId];
  let i = 2;
  if (message !== undefined) { updates.push(`message = $${i++}`); params.push(message); }
  if (type !== undefined) { updates.push(`type = $${i++}`); params.push(type); }
  if (permanent !== undefined) { updates.push(`permanent = $${i++}`); params.push(permanent); }
  if (expiresAt !== undefined) { updates.push(`expires_at = $${i++}`); params.push(expiresAt); }
  if (updates.length === 0) return null;

  const { rows } = await pool.query(
    `UPDATE poll_notices SET ${updates.join(", ")} WHERE notice_id = $1 RETURNING notice_id`,
    params
  );
  return rows[0] || null;
}

export async function deleteNotice(noticeId) {
  await pool.query(`DELETE FROM poll_notices WHERE notice_id = $1`, [noticeId]);
}

// --- FAQ ---------------------------------------------------------------------

export async function listFaqsForOwner(pollId) {
  const { rows } = await pool.query(
    `SELECT faq_id, question, answer, position FROM poll_faqs WHERE poll_id = $1 ORDER BY position, question`,
    [pollId]
  );
  return rows;
}

export async function createFaq(pollId, { question, answer, position }) {
  if (!question || !question.trim()) throw new Error("La question est requise.");
  if (!answer || !answer.trim()) throw new Error("La réponse est requise.");

  const { rows } = await pool.query(
    `INSERT INTO poll_faqs (poll_id, question, answer, position) VALUES ($1, $2, $3, $4) RETURNING faq_id`,
    [pollId, question.trim(), answer.trim(), Number.isFinite(position) ? position : 0]
  );
  return rows[0];
}

export async function updateFaq(faqId, { question, answer, position }) {
  const updates = [];
  const params = [faqId];
  let i = 2;
  if (question !== undefined) { updates.push(`question = $${i++}`); params.push(question); }
  if (answer !== undefined) { updates.push(`answer = $${i++}`); params.push(answer); }
  if (position !== undefined) { updates.push(`position = $${i++}`); params.push(position); }
  if (updates.length === 0) return null;

  const { rows } = await pool.query(
    `UPDATE poll_faqs SET ${updates.join(", ")} WHERE faq_id = $1 RETURNING faq_id`,
    params
  );
  return rows[0] || null;
}

export async function deleteFaq(faqId) {
  await pool.query(`DELETE FROM poll_faqs WHERE faq_id = $1`, [faqId]);
}

// --- Galerie -------------------------------------------------------------

export async function listGalleryForOwner(pollId) {
  const { rows } = await pool.query(
    `SELECT item_id, media_url, media_type, tag, uploaded_at
       FROM poll_galleries WHERE poll_id = $1 ORDER BY uploaded_at DESC`,
    [pollId]
  );
  return rows;
}

const VALID_MEDIA_TYPES = new Set(["PHOTO", "VIDEO"]);
const VALID_TAGS = new Set(["BEFORE", "DURING", "AFTER"]);

export async function addGalleryItem(pollId, { mediaUrl, mediaType, tag }) {
  if (!mediaUrl) throw new Error("Le média est requis.");
  if (!VALID_MEDIA_TYPES.has(mediaType)) throw new Error("Type de média invalide.");
  if (tag && !VALID_TAGS.has(tag)) throw new Error("Tag invalide (BEFORE, DURING ou AFTER).");

  const { rows } = await pool.query(
    `INSERT INTO poll_galleries (poll_id, media_url, media_type, tag) VALUES ($1, $2, $3, $4) RETURNING item_id`,
    [pollId, mediaUrl, mediaType, tag || "DURING"]
  );
  return rows[0];
}

export async function deleteGalleryItem(itemId) {
  await pool.query(`DELETE FROM poll_galleries WHERE item_id = $1`, [itemId]);
}

// --- Actualités ------------------------------------------------------------

export async function listNewsForOwner(pollId) {
  const { rows } = await pool.query(
    `SELECT news_id, title, body, photos_urls, videos_urls, published_at
       FROM poll_news WHERE poll_id = $1 ORDER BY published_at DESC`,
    [pollId]
  );
  return rows;
}

export async function createNews(pollId, { title, body, photosUrls, videosUrls }) {
  if (!title || !title.trim()) throw new Error("Le titre est requis.");
  if (!body || !body.trim()) throw new Error("Le texte est requis.");

  const { rows } = await pool.query(
    `INSERT INTO poll_news (poll_id, title, body, photos_urls, videos_urls)
     VALUES ($1, $2, $3, $4, $5) RETURNING news_id`,
    [pollId, title.trim(), body.trim(), Array.isArray(photosUrls) ? photosUrls : [], Array.isArray(videosUrls) ? videosUrls : []]
  );
  return rows[0];
}

export async function deleteNews(newsId) {
  await pool.query(`DELETE FROM poll_news WHERE news_id = $1`, [newsId]);
}

// --- Partenaires -------------------------------------------------------------

export async function listPartnersForOwner(pollId) {
  const { rows } = await pool.query(
    `SELECT partner_id, name, logo_url, website_url, level, validated
       FROM poll_partners WHERE poll_id = $1 ORDER BY level, name`,
    [pollId]
  );
  return rows;
}

export async function createPartner(pollId, { name, logoUrl, websiteUrl, level }) {
  if (!name || !name.trim()) throw new Error("Le nom du partenaire est requis.");

  // Un partenaire ajouté directement par l'organisateur (pas via une
  // candidature externe) est considéré validé d'office -- c'est l'action
  // même d'ajout depuis le dashboard qui vaut validation.
  const { rows } = await pool.query(
    `INSERT INTO poll_partners (poll_id, name, logo_url, website_url, level, validated)
     VALUES ($1, $2, $3, $4, $5, TRUE) RETURNING partner_id`,
    [pollId, name.trim(), logoUrl || null, websiteUrl || null, level || null]
  );
  return rows[0];
}

export async function updatePartner(partnerId, { name, logoUrl, websiteUrl, level, validated }) {
  const updates = [];
  const params = [partnerId];
  let i = 2;
  if (name !== undefined) { updates.push(`name = $${i++}`); params.push(name); }
  if (logoUrl !== undefined) { updates.push(`logo_url = $${i++}`); params.push(logoUrl); }
  if (websiteUrl !== undefined) { updates.push(`website_url = $${i++}`); params.push(websiteUrl); }
  if (level !== undefined) { updates.push(`level = $${i++}`); params.push(level); }
  if (validated !== undefined) { updates.push(`validated = $${i++}`); params.push(validated); }
  if (updates.length === 0) return null;

  const { rows } = await pool.query(
    `UPDATE poll_partners SET ${updates.join(", ")} WHERE partner_id = $1 RETURNING partner_id`,
    params
  );
  return rows[0] || null;
}

export async function deletePartner(partnerId) {
  await pool.query(`DELETE FROM poll_partners WHERE partner_id = $1`, [partnerId]);
}

// --- Personnalisation de base (brand_settings + polls.welcome_message/visible_sections) --

export async function getPersonalization(pollId) {
  const { rows: brandRows } = await pool.query(
    `SELECT primary_color, secondary_color, accent_color, logo_url, heading_font, body_font, favicon_url
       FROM brand_settings WHERE campaign_id = $1`,
    [pollId]
  );
  const { rows: pollRows } = await pool.query(
    `SELECT welcome_message, visible_sections FROM polls WHERE poll_id = $1`,
    [pollId]
  );
  return {
    brand: brandRows[0] || null,
    welcome_message: pollRows[0]?.welcome_message || "",
    visible_sections: pollRows[0]?.visible_sections || null,
  };
}

const DEFAULT_BRAND = {
  primaryColor: "#FF6A00",
  secondaryColor: "#2B6BFF",
  accentColor: "#1B7A3D",
  headingFont: "Inter",
  bodyFont: "Inter",
};

export async function upsertBrandSettings(pollId, data) {
  const primaryColor = data.primaryColor || DEFAULT_BRAND.primaryColor;
  const secondaryColor = data.secondaryColor || DEFAULT_BRAND.secondaryColor;
  const accentColor = data.accentColor || DEFAULT_BRAND.accentColor;
  const headingFont = data.headingFont || DEFAULT_BRAND.headingFont;
  const bodyFont = data.bodyFont || DEFAULT_BRAND.bodyFont;

  const { rows } = await pool.query(
    `INSERT INTO brand_settings (campaign_id, primary_color, secondary_color, accent_color, logo_url, heading_font, body_font, favicon_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (campaign_id) DO UPDATE SET
       primary_color = EXCLUDED.primary_color,
       secondary_color = EXCLUDED.secondary_color,
       accent_color = EXCLUDED.accent_color,
       logo_url = EXCLUDED.logo_url,
       heading_font = EXCLUDED.heading_font,
       body_font = EXCLUDED.body_font,
       favicon_url = EXCLUDED.favicon_url
     RETURNING *`,
    [pollId, primaryColor, secondaryColor, accentColor, data.logoUrl || null, headingFont, bodyFont, data.faviconUrl || null]
  );
  return rows[0];
}

export async function updatePollPersonalization(pollId, { welcomeMessage, visibleSections }) {
  const { rows } = await pool.query(
    `UPDATE polls SET
       welcome_message = COALESCE($2, welcome_message),
       visible_sections = COALESCE($3, visible_sections)
     WHERE poll_id = $1
     RETURNING welcome_message, visible_sections`,
    [pollId, welcomeMessage !== undefined ? welcomeMessage : null, visibleSections !== undefined ? JSON.stringify(visibleSections) : null]
  );
  return rows[0] || null;
}
