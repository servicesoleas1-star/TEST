import { Router } from "express";
import {
  getSummaryHandler,
  getVotesByDayHandler,
  getRevenueByDayHandler,
  getVotesByHourHandler,
  getVoteBreakdownHandler,
  getTopCandidatesHandler,
  getPaymentFailuresHandler,
} from "../controllers/campaignAnalyticsController.js";

const router = Router({ mergeParams: true });

router.get("/summary", getSummaryHandler);
router.get("/votes-by-day", getVotesByDayHandler);
router.get("/revenue-by-day", getRevenueByDayHandler);
router.get("/votes-by-hour", getVotesByHourHandler);
router.get("/vote-breakdown", getVoteBreakdownHandler);
router.get("/top-candidates", getTopCandidatesHandler);
router.get("/payment-failures", getPaymentFailuresHandler);

export default router;