import { Router } from "express";
import { savePreferences } from "../controllers/profileController.js";

const router = Router();

router.post("/preferences", savePreferences);

export default router;
