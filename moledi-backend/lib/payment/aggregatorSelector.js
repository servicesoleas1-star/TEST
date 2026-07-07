import { PaymentLogger } from "./logger.js";

/**
 * Sélecteur dynamique d'agrégateur.
 * Stratégie : basée sur la priorité (priority) + état (active/degraded).
 */
export class AggregatorSelector {
  static degradedAggregators = new Map(); // { name -> degradedUntil }

  /**
   * Sélectionne le meilleur agrégateur pour un pays et une méthode.
   */
  static selectAggregator(aggregators, country, method) {
    const correlationId = PaymentLogger.generateCorrelationId();

    // Filtrer les agrégateurs pour le pays et la méthode
    const candidates = Object.entries(aggregators)
      .filter(([name, agg]) => {
        const isActive = agg.active && agg.enabled;
        const isDegraded = this.isDegraded(name);
        const isCountryMatch = agg.country === country;
        const isMethodMatch = agg.methods && agg.methods.includes(method);

        return isActive && !isDegraded && isCountryMatch && isMethodMatch;
      })
      .sort(([, a], [, b]) => a.priority - b.priority); // Trier par priorité (ascending)

    if (candidates.length === 0) {
      PaymentLogger.warn("Aucun agrégateur disponible", {
        correlation_id: correlationId,
        country,
        method,
      });
      return null;
    }

    const [selectedName, selectedAgg] = candidates[0];

    PaymentLogger.info("Agrégateur sélectionné", {
      correlation_id: correlationId,
      selected: selectedName,
      country,
      method,
      priority: selectedAgg.priority,
    });

    return { name: selectedName, config: selectedAgg };
  }

  /**
   * Marque un agrégateur comme dégradé pendant 5 min.
   */
  static markDegraded(aggregatorName, durationMs = 300000) {
    const degradedUntil = Date.now() + durationMs;
    this.degradedAggregators.set(aggregatorName, degradedUntil);

    PaymentLogger.warn("Agrégateur marqué comme dégradé", {
      correlation_id: PaymentLogger.generateCorrelationId(),
      aggregator: aggregatorName,
      degradedUntil: new Date(degradedUntil).toISOString(),
    });
  }

  /**
   * Vérifie si un agrégateur est actuellement dégradé.
   */
  static isDegraded(aggregatorName) {
    if (!this.degradedAggregators.has(aggregatorName)) {
      return false;
    }

    const degradedUntil = this.degradedAggregators.get(aggregatorName);
    const isStillDegraded = Date.now() < degradedUntil;

    if (!isStillDegraded) {
      this.degradedAggregators.delete(aggregatorName);
    }

    return isStillDegraded;
  }

  /**
   * Récupère l'état de tous les agrégateurs.
   */
  static getHealthStatus(aggregators) {
    const status = {};

    for (const [name, config] of Object.entries(aggregators)) {
      const isDegraded = this.isDegraded(name);
      const degradedUntil = this.degradedAggregators.get(name);

      status[name] = {
        name: config.name,
        country: config.country,
        active: config.active && config.enabled,
        degraded: isDegraded,
        degradedUntil: isDegraded ? new Date(degradedUntil).toISOString() : null,
        priority: config.priority,
      };
    }

    return status;
  }
}