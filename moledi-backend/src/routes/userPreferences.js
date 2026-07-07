import { Router } from "express";
import {
  getPreferencesHandler,
  updatePreferencesHandler,
} from "../controllers/userPreferencesController.js";

const router = Router();

router.get("/", getPreferencesHandler);
router.post("/", updatePreferencesHandler);

export default router;