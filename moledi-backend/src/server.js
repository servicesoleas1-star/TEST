import "dotenv/config";
import app from "./app.js";
import { expirePendingTransactions } from "./store/paidVoteStore.js";
import { closeElapsedPolls } from "./services/closingReportService.js";
import { ConfigManager } from "../lib/payment/configManager.js";
import { PaymentLogger } from "../lib/payment/logger.js";

const PORT = process.env.PORT || 4000;

// ---------------------------------------------------------------------------
// Initialiser la configuration des paiements au démarrage
// ---------------------------------------------------------------------------
try {
  ConfigManager.loadConfigAtStartup();
  PaymentLogger.info("Système de paiement initialisé avec succès", {
    correlation_id: PaymentLogger.generateCorrelationId(),
  });
} catch (err) {
  PaymentLogger.error("Impossible de démarrer - config paiement invalide", {
    correlation_id: PaymentLogger.generateCorrelationId(),
    error: err.message,
  });
  console.error("❌ ERREUR CRITIQUE : Configuration paiement invalide");
  console.error(err.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Démarrer le serveur
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`✅ Moledi backend running on http://localhost:${PORT}`);
});

// ---------------------------------------------------------------------------
// PAY-04 — Expiration automatique des transactions en attente > 30 min.
// En production, remplacer par un vrai job cron/worker (ex: node-cron,
// BullMQ, ou tâche planifiée côté infra) plutôt qu'un setInterval lié au
// cycle de vie du process. Toutes les 5 min ici, comme documenté dans le
// composant diagram d'origine ("expire-pending").
// ---------------------------------------------------------------------------
setInterval(async () => {
  try {
    const expired = await expirePendingTransactions();
    if (expired.length > 0) {
      console.log(`[CRON expire-pending] ${expired.length} transaction(s) expirée(s).`);
    }
  } catch (err) {
    console.error("[CRON expire-pending] Erreur :", err);
  }
}, 5 * 60 * 1000);

// ---------------------------------------------------------------------------
// Clôture automatique des scrutins échus + génération du PV de clôture
// (voir services/closingReportService.js -> closeElapsedPolls). Avant cet
// ajout, aucun scrutin ne passait jamais en CLOSED automatiquement : la page
// résultats et le PV restaient indisponibles indéfiniment après l'échéance.
// Même fréquence que le cron d'expiration des paiements ci-dessus.
// ---------------------------------------------------------------------------
setInterval(async () => {
  try {
    const results = await closeElapsedPolls();
    if (results.length > 0) {
      console.log(`[CRON close-polls] ${results.length} scrutin(s) clôturé(s).`);
    }
  } catch (err) {
    console.error("[CRON close-polls] Erreur :", err);
  }
}, 5 * 60 * 1000);

// Un premier passage immédiat au démarrage évite d'attendre 5 min après un
// redémarrage du serveur pour clôturer un scrutin déjà échu.
closeElapsedPolls().catch((err) => console.error("[CRON close-polls] Erreur au démarrage :", err));