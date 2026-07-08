import {
  findPaidPollBySlug,
  findCandidate,
  pickMobileMoneyAggregator,
  findTransactionByIdempotencyKey,
  findTransactionById,
  createPendingTransaction,
  confirmTransactionFromWebhook,
  creditVotesForTransaction,
  getReceiptData,
  ensureVisitorExists,
} from "../store/paidVoteStore.js";

/**
 * POST /api/votes/paid/initiate
 * Body: { pollSlug, candidateId, quantity, amount, phoneNumber, idempotencyKey, visitorId }
 *
 * "Sélection quantité (packs/saisie nombre/montant libre)" : le client peut
 * fournir `quantity` (nombre de votes) OU `amount` (montant libre) — dans
 * les deux cas on recalcule un montant exact = quantity * price_per_vote
 * pour ne jamais stocker un montant incohérent avec le prix unitaire.
 */
export async function initiatePaidVote(req, res) {
  const { pollSlug, candidateId, quantity, amount, phoneNumber, idempotencyKey, visitorId } =
    req.body;

  if (!idempotencyKey) {
    return res.status(400).json({ error: "Clé d'idempotence manquante." });
  }
  if (!visitorId) {
    return res.status(400).json({ error: "Visiteur non identifié." });
  }
  if (!phoneNumber) {
    return res.status(400).json({ error: "Numéro Mobile Money requis." });
  }

  // --- Idempotence : si cette clé a déjà servi, on renvoie la transaction
  // existante telle quelle, sans jamais en recréer une seconde. ---
  const existing = await findTransactionByIdempotencyKey(idempotencyKey);
  if (existing) {
    return res.status(200).json({
      transaction_id: existing.transaction_id,
      status: existing.status,
      amount: existing.gross_amount,
      expires_at: existing.expires_at,
      replayed: true,
    });
  }

  const poll = await findPaidPollBySlug(pollSlug);
  if (!poll) {
    return res.status(404).json({ error: "Scrutin introuvable." });
  }
  if (poll.vote_type !== "PAID") {
    return res.status(400).json({ error: "Ce scrutin n'accepte pas les votes payants." });
  }

  const candidate = await findCandidate(poll.poll_id, candidateId);
  if (!candidate) {
    return res.status(404).json({ error: "Candidat introuvable." });
  }

  const pricePerVote = Number(poll.price_per_vote);
  if (!pricePerVote || pricePerVote <= 0) {
    return res.status(400).json({ error: "Prix du vote non configuré pour ce scrutin." });
  }

  // Quantité dérivée soit directement, soit à partir d'un montant libre.
  let finalQuantity;
  if (quantity && Number(quantity) > 0) {
    finalQuantity = Math.floor(Number(quantity));
  } else if (amount && Number(amount) > 0) {
    finalQuantity = Math.max(1, Math.floor(Number(amount) / pricePerVote));
  } else {
    return res.status(400).json({ error: "Veuillez indiquer une quantité ou un montant." });
  }

  const grossAmount = (finalQuantity * pricePerVote).toFixed(2);

  const aggregator = await pickMobileMoneyAggregator("CM");
  if (!aggregator) {
    return res.status(503).json({ error: "Aucun agrégateur Mobile Money disponible pour le moment." });
  }

  await ensureVisitorExists(visitorId);

  const transaction = await createPendingTransaction({
    campaignId: poll.poll_id,
    visitorId,
    grossAmount,
    idempotencyKey,
    aggregatorId: aggregator.aggregator_id,
    operator: "Orange",
    phoneNumber,
  });

  // On mémorise candidat + quantité pour créditer les votes exacts au
  // moment du webhook (le webhook ne connaît que la transaction).
  paidVoteContext.set(transaction.transaction_id, { candidateId, quantity: finalQuantity });

  return res.status(201).json({
    transaction_id: transaction.transaction_id,
    status: transaction.status,
    amount: transaction.gross_amount,
    expires_at: transaction.expires_at,
    replayed: false,
  });
}

// Contexte en mémoire candidat/quantité par transaction — à remplacer par
// une vraie colonne (ex: transactions.quantity + transactions.candidate_id,
// ou une table de jonction) lors du passage en production. Suffisant ici
// car la durée de vie (30 min max avant expiration) tient largement dans
// la durée de vie du process.
const paidVoteContext = new Map();

/**
 * POST /api/webhooks/orange-money
 * Simule le callback webhook du PSP (PAY-02). En production, cette route
 * serait appelée par Orange Money elle-même, authentifiée par signature.
 * Body: { external_tx_id, status: "SUCCESS" | "FAILED" }
 */
export async function orangeMoneyWebhook(req, res) {
  const { external_tx_id, status } = req.body;

  if (!external_tx_id || !["SUCCESS", "FAILED"].includes(status)) {
    return res.status(400).json({ error: "Payload webhook invalide." });
  }

  const result = await confirmTransactionFromWebhook(external_tx_id, status, req.body);

  if (!result.found) {
    return res.status(404).json({ error: "Transaction introuvable." });
  }

  if (result.alreadyProcessed) {
    // Webhook déjà traité — on répond 200 sans rien refaire (idempotence
    // côté serveur aussi, un PSP peut renvoyer le même événement plusieurs fois).
    return res.status(200).json({ success: true, already_processed: true });
  }

  if (result.transaction.status === "CONFIRMED") {
    const ctx = paidVoteContext.get(result.transaction.transaction_id);
    if (ctx) {
      await creditVotesForTransaction(
        result.transaction,
        ctx.candidateId,
        ctx.quantity,
        result.transaction.visitor_id
      );
      paidVoteContext.delete(result.transaction.transaction_id);
    }
  }

  return res.status(200).json({ success: true });
}

/**
 * GET /api/votes/paid/status/:transactionId
 * Le frontend interroge ce endpoint en polling en attendant la confirmation.
 */
export async function getStatus(req, res) {
  const tx = await findTransactionById(req.params.transactionId);
  if (!tx) {
    return res.status(404).json({ error: "Transaction introuvable." });
  }
  return res.status(200).json({
    status: tx.status,
    confirmed_at: tx.confirmed_at,
    expires_at: tx.expires_at,
  });
}

/**
 * GET /api/votes/paid/receipt/:transactionId
 * Reçu complet — uniquement disponible une fois la transaction CONFIRMED.
 */
export async function getReceipt(req, res) {
  const receipt = await getReceiptData(req.params.transactionId);
  if (!receipt) {
    return res.status(404).json({ error: "Transaction introuvable." });
  }
  if (receipt.status !== "CONFIRMED") {
    return res.status(409).json({ error: "Le paiement n'est pas encore confirmé." });
  }
  return res.status(200).json(receipt);
}
