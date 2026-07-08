import { Router } from "express";
import { submitFreeVote } from "../controllers/freeVoteController.js";

const router = Router();

router.post("/submit", submitFreeVote);

export default router;
