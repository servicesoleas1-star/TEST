import { Router } from "express";
import { getRules } from "../controllers/pollRulesController.js";
import { getHome, getCandidates, getCandidate } from "../controllers/pollPublicController.js";
import { getNews, getPartners, getGallery, getFaq, getNotices, getResults, postReport, postGeneratePv, downloadPv } from "../controllers/pollContentController.js";

const router = Router();

router.get("/:slug/rules", getRules);
router.get("/:slug/candidates", getCandidates);
router.get("/:slug/news", getNews);
router.get("/:slug/partners", getPartners);
router.get("/:slug/gallery", getGallery);
router.get("/:slug/faq", getFaq);
router.get("/:slug/notices", getNotices);
router.get("/:slug/results", getResults);
router.post("/:slug/report", postReport);
router.post("/:slug/pv/generate", postGeneratePv);
router.get("/:slug/pv/download", downloadPv);
router.get("/candidates/:candidateId", getCandidate);
router.get("/:slug", getHome);

export default router;
