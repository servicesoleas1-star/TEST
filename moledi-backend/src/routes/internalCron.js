import { Router } from "express";
import { expirePendingTransactions } from "../store/paidVoteStore.js";
import { closeElapsedPolls } from "../services/closingReportService.js";

const router = Router();

/**
 * POST /api/internal/cron/expire-pending
 * Déclenche manuellement l'expiration des transactions en attente depuis
 * plus de 30 min (PAY-04). En production, ce job tourne automatiquement
 * toutes les 5-10 min (voir setInterval dans server.js) — cette route sert
 * uniquement à le déclencher à la demande pour les tests/démos.
 */
router.post("/expire-pending", async (req, res) => {
  const expired = await expirePendingTransactions();
  res.status(200).json({ expired_count: expired.length, expired });
});

/**
 * POST /api/internal/cron/close-polls
 * Déclenche manuellement la clôture des scrutins échus + génération du PV
 * (voir services/closingReportService.js). Tourne automatiquement toutes
 * les 5 min en production — route utile pour les tests/démos.
 */
router.post("/close-polls", async (req, res) => {
  const results = await closeElapsedPolls();
  res.status(200).json({ closed_count: results.length, results });
});

export default router;
