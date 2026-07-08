import crypto from "node:crypto";

/**
 * Logger pour les opérations de paiement.
 * Génère un correlation_id unique pour chaque appel.
 */
export class PaymentLogger {
  static generateCorrelationId() {
    return `CID-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  }

  static log(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };
    console.log(JSON.stringify(logEntry));
  }

  static info(message, context = {}) {
    this.log("INFO", message, context);
  }

  static error(message, context = {}) {
    this.log("ERROR", message, context);
  }

  static warn(message, context = {}) {
    this.log("WARN", message, context);
  }

  static debug(message, context = {}) {
    if (process.env.DEBUG === "true") {
      this.log("DEBUG", message, context);
    }
  }
}