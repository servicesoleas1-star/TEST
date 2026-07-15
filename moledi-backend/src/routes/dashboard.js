import { Router } from "express";
import {
  getSummary,
  getCharts,
  listCampaigns,
  createCampaignHandler,
  duplicateCampaignHandler,
  listActivity,
  listMyVotes,
  getLeaderboardHandler,
  listNotifications,
  markAllNotificationsReadHandler,
  listLoginLogs,
  listTransactions,
  listPayouts,
  requestPayout,
  requestFinancialExport,
  downloadFinancialExport,
  deleteAccount,
  getProfile,
  updateProfileHandler,
  updatePayoutPhoneHandler,
} from "../controllers/dashboardController.js";

const router = Router();

router.get("/summary", getSummary);
router.get("/charts", getCharts);

router.get("/campaigns", listCampaigns);
router.post("/campaigns", createCampaignHandler);
router.post("/campaigns/:campaignId/duplicate", duplicateCampaignHandler);

router.get("/activity", listActivity);
router.get("/my-votes", listMyVotes);
router.get("/leaderboard", getLeaderboardHandler);

router.get("/notifications", listNotifications);
router.post("/notifications/mark-all-read", markAllNotificationsReadHandler);
router.get("/login-logs", listLoginLogs);

router.get("/transactions", listTransactions);
router.get("/payouts", listPayouts);
router.post("/payout-requests", requestPayout);

router.get("/export/financial", requestFinancialExport);
router.get("/export/financial/download", downloadFinancialExport);

router.get("/profile", getProfile);
router.post("/profile", updateProfileHandler);
router.post("/profile/payout-phone", updatePayoutPhoneHandler);

router.post("/account/delete", deleteAccount);

export default router;