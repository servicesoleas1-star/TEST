import { Router } from "express";
import { getRules } from "../controllers/pollRulesController.js";

const router = Router();

router.get("/:slug/rules", getRules);

export default router;
