import { pool } from "../db/pool.js";
import { findUserByEmail } from "../store/dashboardStore.js";
import {
  listNotices, createNotice, updateNotice, deleteNotice,
  listFaqsForOwner, createFaq, updateFaq, deleteFaq,
  listGalleryForOwner, addGalleryItem, deleteGalleryItem,
  listNewsForOwner, createNews, deleteNews,
  listPartnersForOwner, createPartner, updatePartner, deletePartner,
  getPersonalization, upsertBrandSettings, updatePollPersonalization,
} from "../store/campaignContentStore.js";

async function resolveUser(req, res) {
  const email = req.body.email || req.query.email;
  if (!email) {
    res.status(400).json({ error: "Session invalide." });
    return null;
  }
  const user = await findUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: "Session invalide." });
    return null;
  }
  return user;
}

async function verifyCampaignOwnership(pollId, userId) {
  const { rows } = await pool.query(
    `SELECT campaign_id FROM campaigns c
     JOIN polls p ON p.poll_id = c.campaign_id
     WHERE p.poll_id = $1 AND c.owner_user_id = $2`,
    [pollId, userId]
  );
  return rows.length > 0;
}

// Toutes les routes de ce contrôleur sont montées sous
// /api/dashboard/campaigns/:pollId/... -- ce wrapper factorise la
// vérification session + ownership commune à chaque handler.
function withOwnedCampaign(handler) {
  return async (req, res) => {
    const user = await resolveUser(req, res);
    if (!user) return;
    const { pollId } = req.params;
    const isOwner = await verifyCampaignOwnership(pollId, user.user_id);
    if (!isOwner) {
      return res.status(403).json({ error: "Vous n'êtes pas propriétaire de cette campagne." });
    }
    try {
      await handler(req, res, pollId);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  };
}

// --- Annonces / Pop-ups -----------------------------------------------------

export const listNoticesHandler = withOwnedCampaign(async (req, res, pollId) => {
  const items = await listNotices(pollId);
  res.status(200).json({ items });
});

export const createNoticeHandler = withOwnedCampaign(async (req, res, pollId) => {
  const notice = await createNotice(pollId, req.body);
  res.status(201).json(notice);
});

export const updateNoticeHandler = withOwnedCampaign(async (req, res, pollId) => {
  const notice = await updateNotice(req.params.noticeId, req.body);
  if (!notice) return res.status(404).json({ error: "Annonce non trouvée." });
  res.status(200).json(notice);
});

export const deleteNoticeHandler = withOwnedCampaign(async (req, res) => {
  await deleteNotice(req.params.noticeId);
  res.status(200).json({ success: true });
});

// --- FAQ ---------------------------------------------------------------------

export const listFaqsHandler = withOwnedCampaign(async (req, res, pollId) => {
  const items = await listFaqsForOwner(pollId);
  res.status(200).json({ items });
});

export const createFaqHandler = withOwnedCampaign(async (req, res, pollId) => {
  const faq = await createFaq(pollId, req.body);
  res.status(201).json(faq);
});

export const updateFaqHandler = withOwnedCampaign(async (req, res) => {
  const faq = await updateFaq(req.params.faqId, req.body);
  if (!faq) return res.status(404).json({ error: "Question non trouvée." });
  res.status(200).json(faq);
});

export const deleteFaqHandler = withOwnedCampaign(async (req, res) => {
  await deleteFaq(req.params.faqId);
  res.status(200).json({ success: true });
});

// --- Galerie -------------------------------------------------------------

export const listGalleryHandler = withOwnedCampaign(async (req, res, pollId) => {
  const items = await listGalleryForOwner(pollId);
  res.status(200).json({ items });
});

export const addGalleryItemHandler = withOwnedCampaign(async (req, res, pollId) => {
  const item = await addGalleryItem(pollId, req.body);
  res.status(201).json(item);
});

export const deleteGalleryItemHandler = withOwnedCampaign(async (req, res) => {
  await deleteGalleryItem(req.params.itemId);
  res.status(200).json({ success: true });
});

// --- Actualités ------------------------------------------------------------

export const listNewsHandler = withOwnedCampaign(async (req, res, pollId) => {
  const items = await listNewsForOwner(pollId);
  res.status(200).json({ items });
});

export const createNewsHandler = withOwnedCampaign(async (req, res, pollId) => {
  const news = await createNews(pollId, req.body);
  res.status(201).json(news);
});

export const deleteNewsHandler = withOwnedCampaign(async (req, res) => {
  await deleteNews(req.params.newsId);
  res.status(200).json({ success: true });
});

// --- Partenaires -------------------------------------------------------------

export const listPartnersHandler = withOwnedCampaign(async (req, res, pollId) => {
  const items = await listPartnersForOwner(pollId);
  res.status(200).json({ items });
});

export const createPartnerHandler = withOwnedCampaign(async (req, res, pollId) => {
  const partner = await createPartner(pollId, req.body);
  res.status(201).json(partner);
});

export const updatePartnerHandler = withOwnedCampaign(async (req, res) => {
  const partner = await updatePartner(req.params.partnerId, req.body);
  if (!partner) return res.status(404).json({ error: "Partenaire non trouvé." });
  res.status(200).json(partner);
});

export const deletePartnerHandler = withOwnedCampaign(async (req, res) => {
  await deletePartner(req.params.partnerId);
  res.status(200).json({ success: true });
});

// --- Personnalisation de base --------------------------------------------

export const getPersonalizationHandler = withOwnedCampaign(async (req, res, pollId) => {
  const data = await getPersonalization(pollId);
  res.status(200).json(data);
});

export const updateBrandHandler = withOwnedCampaign(async (req, res, pollId) => {
  const brand = await upsertBrandSettings(pollId, req.body);
  res.status(200).json(brand);
});

export const updatePersonalizationHandler = withOwnedCampaign(async (req, res, pollId) => {
  const updated = await updatePollPersonalization(pollId, req.body);
  res.status(200).json(updated);
});
