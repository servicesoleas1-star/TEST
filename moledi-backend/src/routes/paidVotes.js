import { Router } from "express";
import { initiatePaidVote, getStatus, getReceipt } from "../controllers/paidVoteController.js";

const router = Router();

router.post("/initiate", initiatePaidVote);
router.get("/status/:transactionId", getStatus);
router.get("/receipt/:transactionId", getReceipt);

export default router;
