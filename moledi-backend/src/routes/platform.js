import { Router } from "express";
import { getPlatformSettings } from "../controllers/platformController.js";

const router = Router();

router.get("/settings", getPlatformSettings);

export default router;
