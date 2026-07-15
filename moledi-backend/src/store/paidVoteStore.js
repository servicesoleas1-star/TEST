import crypto from "node:crypto";
import { pool } from "../db/pool.js";

const EXPIRATION_MINUTES = 30; // critère : "expiration 30 min + remboursement auto (PAY-05)"

/**
 * Garantit qu'''un visiteur existe en base avant toute opération qui le
 * référence par FK (transactions.visitor_id, votes.visitor_id). Le cookie
 * Visitor ID est créé côté client (voir src/lib/visitorId.js) mais son
 * enregistrement réel en base (POST /api/visitors/init) reste un TODO
 * distinct — cette fonction comble le trou pour ne pas bloquer le tunnel
 * de paiement en attendant cet endpoint dédié.
 */
export async function ensureVisitorExists(visitorId) {
  await pool.query(
    `INSERT INTO visitors (visitor_id, ip_hashed) VALUES ($1, '''unknown''')
     ON CONFLICT (visitor_id) DO NOTHING`,
    [visitorId]
  );
}

// ---------------------------------------------------------------------------
// Lecture du scrutin + candidat (validation avant paiement)
// ---------------------------------------------------------------------------

export async function findPaidPollBySlug(slug) {
  const { rows } = await pool.query(
    `SELECT poll_id, title, vote_type, price_per_vote, vote_packs, status
     FROM polls WHERE slug = $1`,
    [slug]
  );
  return rows[0] || null;
}

export async function findCandidate(pollId, candidateId) {
  const { rows } = await pool.query(
    `SELECT candidate_id, display_name FROM candidates WHERE poll_id = $1 AND candidate_id = $2`,
    [pollId, candidateId]
  );
  return rows[0] || null;
}

/**
 * Sélectionne le PSP (aggregator) actif prioritaire pour Mobile Money au
 * Cameroun — simule PAY-01 (sélection dynamique d'agrégateur).
 */
export async function pickMobileMoneyAggregator(country = "CM") {
  const { rows } = await pool.query(
    `SELECT aggregator_id, name, api_endpoint
     FROM aggregators
     WHERE active = TRUE
       AND $1 = ANY(countries)
       AND 'MOBILE_MONEY' = ANY(payment_methods)
     ORDER BY priority ASC
     LIMIT 1`,
    [country]
  );
  return rows[0] || null;
}

// ---------------------------------------------------------------------------
// Idempotence — critère : "la clé d'idempotence côté client empêche tout
// double crédit en cas de double-clic ou de perte de connexion"
// ---------------------------------------------------------------------------

export async function findTransactionByIdempotencyKey(key) {
  const { rows } = await pool.query(`SELECT * FROM transactions WHERE idempotency_key = $1`, [
    key,
  ]);
  return rows[0] || null;
}

export async function findTransactionById(id) {
  const { rows } = await pool.query(`SELECT * FROM transactions WHERE transaction_id = $1`, [id]);
  return rows[0] || null;
}

export async function findTransactionByExternalId(externalTxId) {
  const { rows } = await pool.query(`SELECT * FROM transactions WHERE external_tx_id = $1`, [
    externalTxId,
  ]);
  return rows[0] || null;
}

/**
 * Crée la transaction en base à l'INITIATION du paiement. Le vote n'existe
 * PAS encore à ce stade — voir creditVotesForTransaction(), appelée
 * uniquement depuis le webhook PSP confirmé.
 */
// Taux de commission Moledi Events unifié à 10% pour tous les types de
// campagne (cf. page /tarifs) — appliqué dès l'initiation du paiement pour
// que le reçu affiche des montants cohérents dès la confirmation, sans
// attendre une résolution CommissionConfig complète (hors scope MVP).
const COMMISSION_RATE = 0.10;

export async function createPendingTransaction({
  campaignId,
  visitorId,
  grossAmount,
  idempotencyKey,
  aggregatorId,
  operator,
  phoneNumber,
  countryCode = "CM",
}) {
  const externalTxId = `ORMO-${crypto.randomBytes(8).toString("hex")}`;
  const correlationId = crypto.randomUUID();
  const moledi_commission = (Number(grossAmount) * COMMISSION_RATE).toFixed(2);
  const net_organizer = (Number(grossAmount) - Number(moledi_commission)).toFixed(2);

  const { rows } = await pool.query(
    `INSERT INTO transactions
       (campaign_id, campaign_type, type, visitor_id, gross_amount,
        moledi_commission, net_organizer, status,
        idempotency_key, aggregator_id, external_tx_id, country, payment_method,
        operator, correlation_id, expires_at)
     VALUES
       ($1, 'POLL', 'VOTE', $2, $3,
        $4, $5, 'PENDING',
        $6, $7, $8, $9, 'MOBILE_MONEY',
        $10, $11, now() + interval '${EXPIRATION_MINUTES} minutes')
     RETURNING *`,
    [campaignId, visitorId, grossAmount, moledi_commission, net_organizer, idempotencyKey, aggregatorId, externalTxId, countryCode, operator, correlationId]
  );

  // TODO: remplacer par un vrai appel HTTP à l'API Orange Money (PAY-01),
  // avec phoneNumber comme destinataire de la demande de paiement (USSD push).
  console.log(
    `[ORANGE MONEY] Demande de paiement envoyée à ${phoneNumber} — ${grossAmount} FCFA — ref ${externalTxId}`
  );

  return rows[0];
}

/**
 * Traite le callback webhook du PSP (PAY-02). Idempotent : si la transaction
 * n'est plus PENDING (déjà traitée), ne fait rien et retourne son état actuel
 * — un PSP peut renvoyer le même webhook plusieurs fois.
 */
export async function confirmTransactionFromWebhook(externalTxId, pspStatus, webhookPayload) {
  const tx = await findTransactionByExternalId(externalTxId);
  if (!tx) return { found: false };

  if (tx.status !== "PENDING") {
    // Déjà traité (CONFIRMED/FAILED/EXPIRED) — on ignore silencieusement.
    return { found: true, alreadyProcessed: true, transaction: tx };
  }

  const newStatus = pspStatus === "SUCCESS" ? "CONFIRMED" : "FAILED";
  const confirmedAt = newStatus === "CONFIRMED" ? new Date() : null;

  const { rows } = await pool.query(
    `UPDATE transactions
     SET status = $1::tx_status,
         confirmed_at = COALESCE($2::timestamptz, confirmed_at),
         webhook_payload = $3
     WHERE transaction_id = $4
     RETURNING *`,
    [newStatus, confirmedAt, JSON.stringify(webhookPayload), tx.transaction_id]
  );

  return { found: true, alreadyProcessed: false, transaction: rows[0] };
}

/**
 * Crédite les votes — appelée UNIQUEMENT après confirmation PSP (jamais à
 * l'initiation). Un vote payant peut représenter plusieurs unités de vote
 * (quantity) : on insère une ligne par unité, comme le prévoit le schéma
 * (1 ligne votes = 1 vote unitaire).
 */
export async function creditVotesForTransaction(transaction, candidateId, quantity, visitorId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (let i = 0; i < quantity; i++) {
      const shortId = crypto.randomBytes(4).toString("hex");
      await client.query(
        `INSERT INTO votes
           (poll_id, candidate_id, visitor_id, vote_type, status,
            verification_method, short_id, ip_hashed, transaction_id)
         VALUES
           ($1, $2, $3, 'PAID', 'COUNTED',
            'PSP_CONFIRMED', $4, $5, $6)`,
        [transaction.campaign_id, candidateId, visitorId, shortId, "n/a", transaction.transaction_id]
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function countVotesForTransaction(transactionId) {
  const { rows } = await pool.query(
    `SELECT count(*)::int AS count FROM votes WHERE transaction_id = $1`,
    [transactionId]
  );
  return rows[0].count;
}

// ---------------------------------------------------------------------------
// Expiration automatique — simule le cron PAY-04
// ---------------------------------------------------------------------------

/**
 * Expire toute transaction PENDING dont expires_at est dépassé. Aucun vote
 * n'a jamais été crédité pour ces transactions (voir confirmTransactionFromWebhook),
 * donc "l'annulation" ne nécessite aucun remboursement de vote — seul le
 * statut de la transaction change. Un vrai remboursement financier PSP (si
 * des fonds avaient déjà été prélevés côté opérateur) serait déclenché ici.
 */
export async function expirePendingTransactions() {
  const { rows } = await pool.query(
    `UPDATE transactions
     SET status = 'EXPIRED'
     WHERE status = 'PENDING' AND expires_at < now()
     RETURNING transaction_id, external_tx_id`
  );
  return rows;
}

// ---------------------------------------------------------------------------
// Reçu complet
// ---------------------------------------------------------------------------

export async function getReceiptData(transactionId) {
  const { rows } = await pool.query(
    `SELECT
       t.transaction_id, t.external_tx_id, t.gross_amount, t.moledi_commission,
       t.psp_fee, t.net_organizer, t.status, t.payment_method, t.operator,
       t.initiated_at, t.confirmed_at,
       p.title AS poll_title
     FROM transactions t
     JOIN polls p ON p.poll_id = t.campaign_id
     WHERE t.transaction_id = $1`,
    [transactionId]
  );
  const tx = rows[0];
  if (!tx) return null;

  const voteCount = await countVotesForTransaction(transactionId);

  return {
    transaction_id: tx.transaction_id,
    reference: tx.external_tx_id,
    poll_title: tx.poll_title,
    vote_count: voteCount,
    amount: tx.gross_amount,
    payment_method: tx.payment_method,
    operator: tx.operator,
    status: tx.status,
    initiated_at: tx.initiated_at,
    confirmed_at: tx.confirmed_at,
  };
}
