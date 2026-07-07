import { Router } from "express";
import {
  generateCodesHandler,
  importCodesHandler,
  listCodesHandler,
  cancelCodeHandler,
  exportCodesHandler,
} from "../controllers/uniqueCodesController.js";

const router = Router({ mergeParams: true });

// POST /api/dashboard/campaigns/:pollId/unique-codes/generate
router.post("/generate", generateCodesHandler);

// POST /api/dashboard/campaigns/:pollId/unique-codes/import
router.post("/import", importCodesHandler);

// GET /api/dashboard/campaigns/:pollId/unique-codes
router.get("/", listCodesHandler);

// DELETE /api/dashboard/campaigns/:pollId/unique-codes/:codeId
router.delete("/:codeId", cancelCodeHandler);

// GET /api/dashboard/campaigns/:pollId/unique-codes/export
router.get("/export", exportCodesHandler);

export default router;