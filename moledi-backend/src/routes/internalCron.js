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
async function handleExpirePending(req, res) {
  const expired = await expirePendingTransactions();
  res.status(200).json({ expired_count: expired.length, expired });
}

router.post("/expire-pending", handleExpirePending);
// Also GET: Vercel Cron Jobs trigger their target route with GET, and
// there's no process-level setInterval in serverless to run this on a
// schedule otherwise (see vercel.json's `crons`).
router.get("/expire-pending", handleExpirePending);

export default router;
