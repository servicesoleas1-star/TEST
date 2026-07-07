import { Router } from "express";
import { expirePendingTransactions } from "../store/paidVoteStore.js";

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

export default router;
