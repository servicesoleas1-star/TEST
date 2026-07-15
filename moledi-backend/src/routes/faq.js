import { Router } from "express";
import { getFAQ } from "../controllers/faqController.js";

const router = Router();

router.get("/", getFAQ);

export default router;
