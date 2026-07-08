import { PaymentLogger } from "./logger.js";

/**
 * Validateur de configuration YAML des agrégateurs.
 */
export class ConfigValidator {
  static validate(config) {
    const correlationId = PaymentLogger.generateCorrelationId();

    try {
      if (!config) {
        throw new Error("Configuration vide");
      }

      // Vérifier structure générale
      if (!config.aggregators || typeof config.aggregators !== "object") {
        throw new Error("'aggregators' manquant ou invalide");
      }

      if (!config.defaultAggregator) {
        throw new Error("'defaultAggregator' manquant");
      }

      // Vérifier que l'agrégateur par défaut existe
      if (!config.aggregators[config.defaultAggregator]) {
        throw new Error(
          `defaultAggregator '${config.defaultAggregator}' n'existe pas dans aggregators`
        );
      }

      // Valider chaque agrégateur
      for (const [key, aggregator] of Object.entries(config.aggregators)) {
        this.validateAggregator(key, aggregator);
      }

      PaymentLogger.info("Configuration YAML validée avec succès", {
        correlation_id: correlationId,
        aggregatorCount: Object.keys(config.aggregators).length,
      });

      return { valid: true, errors: [] };
    } catch (err) {
      PaymentLogger.error("Erreur de validation config", {
        correlation_id: correlationId,
        error: err.message,
      });
      return { valid: false, errors: [err.message] };
    }
  }

  static validateAggregator(name, aggregator) {
    const requiredFields = ["name", "country", "priority", "endpoint", "timeout"];

    for (const field of requiredFields) {
      if (!aggregator[field]) {
        throw new Error(`Agrégateur '${name}': champ '${field}' manquant`);
      }
    }

    // Vérifier les types
    if (typeof aggregator.priority !== "number" || aggregator.priority < 0) {
      throw new Error(`Agrégateur '${name}': 'priority' doit être un nombre positif`);
    }

    if (typeof aggregator.timeout !== "number" || aggregator.timeout < 1000) {
      throw new Error(`Agrégateur '${name}': 'timeout' doit être >= 1000 ms`);
    }

    if (!Array.isArray(aggregator.methods) || aggregator.methods.length === 0) {
      throw new Error(`Agrégateur '${name}': 'methods' doit être un tableau non-vide`);
    }

    // Vérifier les variables d'env si actif
    if (aggregator.active || aggregator.enabled) {
      if (!aggregator.apiKeyEnv || !aggregator.apiSecretEnv) {
        throw new Error(
          `Agrégateur '${name}' actif : 'apiKeyEnv' et 'apiSecretEnv' requis`
        );
      }

      const apiKey = process.env[aggregator.apiKeyEnv];
      const apiSecret = process.env[aggregator.apiSecretEnv];

      if (!apiKey || !apiSecret) {
        throw new Error(
          `Agrégateur '${name}' : variables d'env manquantes (${aggregator.apiKeyEnv}, ${aggregator.apiSecretEnv})`
        );
      }
    }
  }
}