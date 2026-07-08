import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { PaymentLogger } from "./logger.js";

let cachedConfig = null;
let lastLoadTime = 0;
const RELOAD_INTERVAL = 30000; // 30 secondes

/**
 * Gestionnaire de configuration YAML centralisée.
 * Rechargement à chaud supporté.
 */
export class AggregatorConfig {
  static getConfigPath() {
    return path.join(process.cwd(), "moledi-backend", "config", "aggregators.yaml");
  }

  static loadConfig() {
    const now = Date.now();

    // Cache pendant 30s pour éviter les rechargements trop fréquents
    if (cachedConfig && now - lastLoadTime < RELOAD_INTERVAL) {
      return cachedConfig;
    }

    try {
      const filePath = this.getConfigPath();
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const config = yaml.load(fileContent);

      cachedConfig = config;
      lastLoadTime = now;

      PaymentLogger.info("Configuration YAML rechargée", { filePath });
      return config;
    } catch (err) {
      PaymentLogger.error("Erreur lors du chargement de la config YAML", {
        error: err.message,
        correlation_id: PaymentLogger.generateCorrelationId(),
      });
      throw err;
    }
  }

  static getAggregator(name) {
    const config = this.loadConfig();
    return config.aggregators[name];
  }

  static getAllAggregators() {
    const config = this.loadConfig();
    return config.aggregators;
  }

  static getPrimaryAggregator() {
    const config = this.loadConfig();
    return config.primary || "orangeMoney";
  }
}