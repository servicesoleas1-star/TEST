import { Router } from "express";
import {
  getSummary,
  getCharts,
  listCampaigns,
  duplicateCampaignHandler,
  listActivity,
  getLeaderboardHandler,
  listNotifications,
  listLoginLogs,
  requestPayout,
  requestFinancialExport,
  downloadFinancialExport,
  deleteAccount,
} from "../controllers/dashboardController.js";

const router = Router();

router.get("/summary", getSummary);
router.get("/charts", getCharts);

router.get("/campaigns", listCampaigns);
router.post("/campaigns/:campaignId/duplicate", duplicateCampaignHandler);

router.get("/activity", listActivity);
router.get("/leaderboard", getLeaderboardHandler);

router.get("/notifications", listNotifications);
router.get("/login-logs", listLoginLogs);

router.post("/payout-requests", requestPayout);

router.get("/export/financial", requestFinancialExport);
router.get("/export/financial/download", downloadFinancialExport);

router.post("/account/delete", deleteAccount);

export default router;