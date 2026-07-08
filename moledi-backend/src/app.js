import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import pollsRoutes from "./routes/polls.js";
import paidVotesRoutes from "./routes/paidVotes.js";
import freeVotesRoutes from "./routes/freeVotes.js";
import webhooksRoutes from "./routes/webhooks.js";
import internalCronRoutes from "./routes/internalCron.js";
import dashboardRoutes from "./routes/dashboard.js";
import candidatesRoutes from "./routes/candidates.js";
import uniqueCodesRoutes from "./routes/uniqueCodes.js";
import campaignAnalyticsRoutes from "./routes/campaignAnalytics.js";
import userPreferencesRoutes from "./routes/userPreferences.js";
import supportTicketsRoutes from "./routes/supportTickets.js";
import ticketMessagesRoutes from "./routes/ticketMessages.js";
import adminPaymentRoutes from "./routes/admin/payment.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/polls", pollsRoutes);
app.use("/api/votes/paid", paidVotesRoutes);
app.use("/api/votes/free", freeVotesRoutes);
app.use("/api/webhooks", webhooksRoutes);
app.use("/api/internal/cron", internalCronRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/dashboard/campaigns/:pollId/candidates", candidatesRoutes);
app.use("/api/dashboard/campaigns/:pollId/unique-codes", uniqueCodesRoutes);
app.use("/api/dashboard/campaigns/:pollId/analytics", campaignAnalyticsRoutes);
app.use("/api/user/preferences", userPreferencesRoutes);
app.use("/api/support/tickets", supportTicketsRoutes);
app.use("/api/support/tickets/:ticketId", ticketMessagesRoutes);
app.use("/api/admin/payment", adminPaymentRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

export default app;