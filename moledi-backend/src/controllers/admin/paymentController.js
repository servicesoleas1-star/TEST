import { ConfigManager } from "../../../lib/payment/configManager.js";
import { AggregatorSelector } from "../../../lib/payment/aggregatorSelector.js";
import { PaymentLogger } from "../../../lib/payment/logger.js";

/**
 * Contrôleur admin pour la gestion des paiements.
 */

// ---------------------------------------------------------------------------
// POST /api/admin/payment/reload-config
// Recharger la configuration YAML (super-admin seulement)
// ---------------------------------------------------------------------------
export async function reloadConfigHandler(req, res) {
  const correlationId = PaymentLogger.generateCorrelationId();

  try {
    // TODO: Vérifier que l'utilisateur est super-admin
    // const user = await resolveUser(req, res);
    // if (!user.is_super_admin) {
    //   return res.status(403).json({ error: "Accès refusé." });
    // }

    const result = ConfigManager.reloadConfig();

    PaymentLogger.info("Configuration rechargée via API", {
      correlation_id: correlationId,
      aggregators: Object.keys(result.config.aggregators),
    });

    return res.status(200).json({
      success: true,
      message: "Configuration rechargée avec succès",
      aggregators: Object.keys(result.config.aggregators),
    });
  } catch (err) {
    PaymentLogger.error("Erreur rechargement config", {
      correlation_id: correlationId,
      error: err.message,
    });

    return res.status(400).json({
      error: `Erreur rechargement : ${err.message}`,
      correlation_id: correlationId,
    });
  }
}

// ---------------------------------------------------------------------------
// GET /api/admin/payment/health
// État de santé de tous les agrégateurs
// ---------------------------------------------------------------------------
export async function getHealthHandler(req, res) {
  const correlationId = PaymentLogger.generateCorrelationId();

  try {
    const aggregators = ConfigManager.getAllAggregators();
    const status = AggregatorSelector.getHealthStatus(aggregators);

    return res.status(200).json({
      correlation_id: correlationId,
      timestamp: new Date().toISOString(),
      status,
    });
  } catch (err) {
    PaymentLogger.error("Erreur récupération santé", {
      correlation_id: correlationId,
      error: err.message,
    });

    return res.status(500).json({
      error: "Erreur lors de la récupération de la santé",
      correlation_id: correlationId,
    });
  }
}

// ---------------------------------------------------------------------------
// GET /api/admin/payment/config
// Récupérer la configuration actuelle (sans les clés API)
// ---------------------------------------------------------------------------
export async function getConfigHandler(req, res) {
  const correlationId = PaymentLogger.generateCorrelationId();

  try {
    const fullConfig = ConfigManager.getFullConfig();

    // Nettoyer les clés sensibles
    const safeConfig = JSON.parse(JSON.stringify(fullConfig));
    for (const agg of Object.values(safeConfig.aggregators)) {
      delete agg.apiKeyEnv;
      delete agg.apiSecretEnv;
    }

    return res.status(200).json({
      correlation_id: correlationId,
      config: safeConfig,
    });
  } catch (err) {
    PaymentLogger.error("Erreur récupération config", {
      correlation_id: correlationId,
      error: err.message,
    });

    return res.status(500).json({
      error: "Erreur lors de la récupération de la config",
      correlation_id: correlationId,
    });
  }
}