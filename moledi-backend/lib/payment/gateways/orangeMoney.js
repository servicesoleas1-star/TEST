import crypto from "node:crypto";
import { PaymentLogger } from "../logger.js";
import { AggregatorConfig } from "../config.js";

/**
 * Gateway Orange Money Cameroun.
 * Fonctions : initiatePayment, checkStatus, refund.
 * Timeout : 10s
 * Signature : HMAC-SHA256
 */
export class OrangeMoneyGateway {
  static API_BASE_URL = "https://api.orange.cameroun.com/payment"; // À adapter
  static TIMEOUT_MS = 10000; // 10 secondes

  static getApiKey() {
    const key = process.env.ORANGE_MONEY_API_KEY;
    if (!key) {
      throw new Error("ORANGE_MONEY_API_KEY non défini dans .env");
    }
    return key;
  }

  static getApiSecret() {
    const secret = process.env.ORANGE_MONEY_API_SECRET;
    if (!secret) {
      throw new Error("ORANGE_MONEY_API_SECRET non défini dans .env");
    }
    return secret;
  }

  /**
   * Signe la requête avec HMAC-SHA256.
   */
  static sign(payload, secret) {
    const message = JSON.stringify(payload);
    return crypto.createHmac("sha256", secret).update(message).digest("hex");
  }

  /**
   * Lance un paiement.
   * Retourne : { externalId, status }
   */
  static async initiatePayment(params) {
    const correlationId = PaymentLogger.generateCorrelationId();

    try {
      const { amount, phone, orderId, description } = params;

      if (!amount || !phone || !orderId) {
        throw new Error("Paramètres manquants : amount, phone, orderId");
      }

      const payload = {
        merchant_id: this.getApiKey(),
        amount: Math.round(amount * 100), // En centimes
        phone: phone.replace(/\D/g, ""), // Nettoyer les caractères non-numériques
        order_id: orderId,
        description: description || "Paiement Moledi Events",
        callback_url: `${process.env.BACKEND_URL}/api/webhooks/payment/orange-money`,
        timestamp: Math.floor(Date.now() / 1000),
      };

      const signature = this.sign(payload, this.getApiSecret());
      payload.signature = signature;

      PaymentLogger.info("Initiation paiement Orange Money", {
        correlation_id: correlationId,
        amount,
        phone: phone.slice(-4),
        orderId,
      });

      const response = await this.makeRequest("POST", "/initiate", payload, correlationId);

      if (!response.success || !response.external_id) {
        throw new Error(response.message || "Échec de l'initiation");
      }

      PaymentLogger.info("Paiement initié avec succès", {
        correlation_id: correlationId,
        external_id: response.external_id,
      });

      return {
        externalId: response.external_id,
        status: "PENDING",
      };
    } catch (err) {
      PaymentLogger.error("Erreur lors de l'initiation paiement", {
        correlation_id: correlationId,
        error: err.message,
      });
      throw err;
    }
  }

  /**
   * Vérifie le statut d'un paiement.
   * Retourne : { status, amount }
   */
  static async checkStatus(externalId) {
    const correlationId = PaymentLogger.generateCorrelationId();

    try {
      if (!externalId) {
        throw new Error("externalId manquant");
      }

      const payload = {
        merchant_id: this.getApiKey(),
        external_id: externalId,
        timestamp: Math.floor(Date.now() / 1000),
      };

      const signature = this.sign(payload, this.getApiSecret());
      payload.signature = signature;

      PaymentLogger.info("Vérification statut paiement", {
        correlation_id: correlationId,
        external_id: externalId,
      });

      const response = await this.makeRequest(
        "POST",
        "/check-status",
        payload,
        correlationId
      );

      const statusMap = {
        COMPLETED: "CONFIRMED",
        PENDING: "PENDING",
        FAILED: "FAILED",
        CANCELLED: "CANCELLED",
      };

      const mappedStatus = statusMap[response.status] || response.status;

      PaymentLogger.info("Statut récupéré", {
        correlation_id: correlationId,
        status: mappedStatus,
      });

      return {
        status: mappedStatus,
        amount: response.amount ? response.amount / 100 : null,
      };
    } catch (err) {
      PaymentLogger.error("Erreur lors de la vérification du statut", {
        correlation_id: correlationId,
        error: err.message,
      });
      throw err;
    }
  }

  /**
   * Déclenche un remboursement.
   * Retourne : { refundId, status }
   */
  static async refund(externalId, amount) {
    const correlationId = PaymentLogger.generateCorrelationId();

    try {
      if (!externalId || !amount) {
        throw new Error("externalId et amount requis");
      }

      const payload = {
        merchant_id: this.getApiKey(),
        external_id: externalId,
        amount: Math.round(amount * 100), // En centimes
        timestamp: Math.floor(Date.now() / 1000),
      };

      const signature = this.sign(payload, this.getApiSecret());
      payload.signature = signature;

      PaymentLogger.info("Remboursement initié", {
        correlation_id: correlationId,
        external_id: externalId,
        amount,
      });

      const response = await this.makeRequest("POST", "/refund", payload, correlationId);

      if (!response.success || !response.refund_id) {
        throw new Error(response.message || "Échec du remboursement");
      }

      PaymentLogger.info("Remboursement confirmé", {
        correlation_id: correlationId,
        refund_id: response.refund_id,
      });

      return {
        refundId: response.refund_id,
        status: "PENDING",
      };
    } catch (err) {
      PaymentLogger.error("Erreur lors du remboursement", {
        correlation_id: correlationId,
        error: err.message,
      });
      throw err;
    }
  }

  /**
   * Requête HTTP avec timeout et gestion d'erreur.
   */
  static async makeRequest(method, endpoint, payload, correlationId) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

      const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-Correlation-ID": correlationId,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      PaymentLogger.error("Erreur HTTP gateway", {
        correlation_id: correlationId,
        error: err.message,
        endpoint,
      });
      throw err;
    }
  }
}