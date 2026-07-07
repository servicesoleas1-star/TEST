import { Router } from "express";
import {
  reloadConfigHandler,
  getHealthHandler,
  getConfigHandler,
} from "../../controllers/admin/paymentController.js";

const router = Router();

router.post("/reload-config", reloadConfigHandler);
router.get("/health", getHealthHandler);
router.get("/config", getConfigHandler);

export default router;