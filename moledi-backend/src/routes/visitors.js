import { Router } from "express";
import {
  initVisitor,
  associateVisitorWithAccount,
  setVisitorLanguage,
  recordVisitorConsent,
} from "../controllers/visitorsController.js";

const router = Router();

router.post("/init", initVisitor);
router.post("/associate", associateVisitorWithAccount);
router.post("/language", setVisitorLanguage);
router.post("/consent", recordVisitorConsent);

export default router;
