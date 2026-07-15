import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { attachAuthUser } from "./middleware/auth.js";
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
import campaignContentRoutes from "./routes/campaignContent.js";
import userPreferencesRoutes from "./routes/userPreferences.js";
import supportTicketsRoutes from "./routes/supportTickets.js";
import ticketMessagesRoutes from "./routes/ticketMessages.js";
import adminPaymentRoutes from "./routes/admin/payment.js";
import countriesRoutes from "./routes/countries.js";
import paymentMethodsRoutes from "./routes/paymentMethods.js";
import visitorsRoutes from "./routes/visitors.js";
import platformRoutes from "./routes/platform.js";
import acquisitionSourcesRoutes from "./routes/acquisitionSources.js";
import partnerApplicationsRoutes from "./routes/partnerApplications.js";
import faqRoutes from "./routes/faq.js";
import eventsRoutes from "./routes/events.js";
import uploadsRoutes from "./routes/uploads.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
// Fichiers générés par le backend (PV de clôture PDF, voir
// services/closingReportService.js) -- stockage disque local pour
// l'instant, à remplacer par un vrai bucket (S3/Supabase Storage) en
// production.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Peuple req.authUser depuis le cookie de session httpOnly (voir
// middleware/auth.js) sur TOUTES les routes, sans jamais bloquer une
// requête qui ne l'utilise pas encore (routes historiques identifiant
// l'utilisateur par email en paramètre, toujours fonctionnelles).
app.use(attachAuthUser);

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
app.use("/api/dashboard/campaigns/:pollId/content", campaignContentRoutes);
app.use("/api/user/preferences", userPreferencesRoutes);
app.use("/api/support/tickets", supportTicketsRoutes);
app.use("/api/support/tickets/:ticketId", ticketMessagesRoutes);
app.use("/api/admin/payment", adminPaymentRoutes);
app.use("/api/countries", countriesRoutes);
app.use("/api/payment-methods", paymentMethodsRoutes);
app.use("/api/visitors", visitorsRoutes);
app.use("/api/platform", platformRoutes);
app.use("/api/acquisition-sources", acquisitionSourcesRoutes);
app.use("/api/partner-applications", partnerApplicationsRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/uploads", uploadsRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

export default app;