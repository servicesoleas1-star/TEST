import { listPaymentMethods } from "../store/paymentMethodsStore.js";

/**
 * GET /api/payment-methods
 * Renvoie la liste des méthodes de paiement actives. En cas d'erreur,
 * renvoie une liste vide plutôt qu'un statut d'erreur.
 */
export async function getPaymentMethods(req, res) {
  try {
    const methods = await listPaymentMethods();
    return res.status(200).json({ ok: true, methods });
  } catch (err) {
    console.error("Payment methods fetch error:", err.message);
    return res.status(200).json({ ok: true, methods: [] });
  }
}
