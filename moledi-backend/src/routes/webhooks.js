import { Router } from "express";
import { orangeMoneyWebhook } from "../controllers/paidVoteController.js";

const router = Router();

router.post("/orange-money", orangeMoneyWebhook);

export default router;
