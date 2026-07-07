import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { PaymentLogger } from "./logger.js";
import { ConfigValidator } from "./configValidator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedConfig = null;
let lastLoadTime = 0;
const RELOAD_INTERVAL = 30000; // 30 secondes

/**
 * Gestionnaire de configuration YAML centralisée.
 * Rechargement à chaud supporté.
 */
export class ConfigManager {
  static getConfigPath() {
    return path.join(__dirname, "../../config/payment/aggregators.yaml");
  }

  /**
   * Charge la configuration au démarrage.
   * Lance une exception si invalide.
   */
  static loadConfigAtStartup() {
    const correlationId = PaymentLogger.generateCorrelationId();

    try {
      const config = this.loadConfigFromDisk();

      // Valider strictement au démarrage
      const validation = ConfigValidator.validate(config);
      if (!validation.valid) {
        throw new Error(`Validation échouée : ${validation.errors.join(", ")}`);
      }

      cachedConfig = config;
      lastLoadTime = Date.now();

      PaymentLogger.info("Configuration chargée au démarrage", {
        correlation_id: correlationId,
        aggregators: Object.keys(config.aggregators),
      });

      return config;
    } catch (err) {
      PaymentLogger.error("Erreur critique au démarrage", {
        correlation_id: correlationId,
        error: err.message,
      });
      throw err; // Bloquer le démarrage si config invalide
    }
  }

  /**
   * Charge la config avec cache (rechargement à chaud).
   */
  static loadConfig() {
    const now = Date.now();

    // Cache pendant 30s
    if (cachedConfig && now - lastLoadTime < RELOAD_INTERVAL) {
      return cachedConfig;
    }

    try {
      const config = this.loadConfigFromDisk();
      cachedConfig = config;
      lastLoadTime = now;

      PaymentLogger.debug("Configuration YAML rechargée depuis le disque", {
        correlation_id: PaymentLogger.generateCorrelationId(),
      });

      return config;
    } catch (err) {
      PaymentLogger.error("Erreur lors du chargement de la config YAML", {
        correlation_id: PaymentLogger.generateCorrelationId(),
        error: err.message,
      });
      // Retourner la dernière config valide en cas d'erreur
      return cachedConfig;
    }
  }

  /**
   * Charge la config depuis le disque.
   */
  static loadConfigFromDisk() {
    const filePath = this.getConfigPath();
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return yaml.load(fileContent);
  }

  /**
   * Recharge la config manuellement et valide.
   */
  static reloadConfig() {
    const correlationId = PaymentLogger.generateCorrelationId();

    try {
      const config = this.loadConfigFromDisk();

      // Valider avant de mettre en cache
      const validation = ConfigValidator.validate(config);
      if (!validation.valid) {
        throw new Error(`Validation échouée : ${validation.errors.join(", ")}`);
      }

      cachedConfig = config;
      lastLoadTime = Date.now();

      PaymentLogger.info("Configuration rechargée manuellement", {
        correlation_id: correlationId,
        aggregators: Object.keys(config.aggregators),
      });

      return { success: true, config };
    } catch (err) {
      PaymentLogger.error("Erreur lors du rechargement manuel", {
        correlation_id: correlationId,
        error: err.message,
      });
      throw err;
    }
  }

  /**
   * Récupère un agrégateur par nom.
   */
  static getAggregator(name) {
    const config = this.loadConfig();
    return config.aggregators[name];
  }

  /**
   * Récupère tous les agrégateurs.
   */
  static getAllAggregators() {
    const config = this.loadConfig();
    return config.aggregators;
  }

  /**
   * Récupère l'agrégateur par défaut.
   */
  static getDefaultAggregator() {
    const config = this.loadConfig();
    const defaultName = config.defaultAggregator;
    return {
      name: defaultName,
      config: config.aggregators[defaultName],
    };
  }

  /**
   * Récupère la config complète.
   */
  static getFullConfig() {
    return this.loadConfig();
  }
}