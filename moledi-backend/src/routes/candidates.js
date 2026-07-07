import { Router } from "express";
import {
  createCandidateHandler,
  listCandidatesHandler,
  updateCandidateHandler,
  deleteCandidateHandler,
  reorderCandidatesHandler,
  importCandidatesHandler,
} from "../controllers/candidatesController.js";

const router = Router({ mergeParams: true });

// POST /api/dashboard/campaigns/:pollId/candidates
router.post("/", createCandidateHandler);

// GET /api/dashboard/campaigns/:pollId/candidates
router.get("/", listCandidatesHandler);

// PATCH /api/dashboard/campaigns/:pollId/candidates/:candidateId
router.patch("/:candidateId", updateCandidateHandler);

// DELETE /api/dashboard/campaigns/:pollId/candidates/:candidateId
router.delete("/:candidateId", deleteCandidateHandler);

// PUT /api/dashboard/campaigns/:pollId/candidates/reorder
router.put("/reorder", reorderCandidatesHandler);

// POST /api/dashboard/campaigns/:pollId/candidates/import
router.post("/import", importCandidatesHandler);

export default router;