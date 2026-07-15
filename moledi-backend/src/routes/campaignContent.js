import { Router } from "express";
import {
  listNoticesHandler, createNoticeHandler, updateNoticeHandler, deleteNoticeHandler,
  listFaqsHandler, createFaqHandler, updateFaqHandler, deleteFaqHandler,
  listGalleryHandler, addGalleryItemHandler, deleteGalleryItemHandler,
  listNewsHandler, createNewsHandler, deleteNewsHandler,
  listPartnersHandler, createPartnerHandler, updatePartnerHandler, deletePartnerHandler,
  getPersonalizationHandler, updateBrandHandler, updatePersonalizationHandler,
} from "../controllers/campaignContentController.js";

const router = Router({ mergeParams: true });

// Montées sous /api/dashboard/campaigns/:pollId/content

router.get("/notices", listNoticesHandler);
router.post("/notices", createNoticeHandler);
router.patch("/notices/:noticeId", updateNoticeHandler);
router.delete("/notices/:noticeId", deleteNoticeHandler);

router.get("/faqs", listFaqsHandler);
router.post("/faqs", createFaqHandler);
router.patch("/faqs/:faqId", updateFaqHandler);
router.delete("/faqs/:faqId", deleteFaqHandler);

router.get("/gallery", listGalleryHandler);
router.post("/gallery", addGalleryItemHandler);
router.delete("/gallery/:itemId", deleteGalleryItemHandler);

router.get("/news", listNewsHandler);
router.post("/news", createNewsHandler);
router.delete("/news/:newsId", deleteNewsHandler);

router.get("/partners", listPartnersHandler);
router.post("/partners", createPartnerHandler);
router.patch("/partners/:partnerId", updatePartnerHandler);
router.delete("/partners/:partnerId", deletePartnerHandler);

router.get("/personalization", getPersonalizationHandler);
router.post("/personalization/brand", updateBrandHandler);
router.post("/personalization", updatePersonalizationHandler);

export default router;
