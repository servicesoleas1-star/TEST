import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getVisitorId } from "../lib/visitorId.js";

// ---------------------------------------------------------------------------
// Moledi Events — Tunnel de vote payant Mobile Money (Orange Money, MVP)
// Route : /vote/:slug/voter/payer?candidate=CANDIDATE_ID
// ---------------------------------------------------------------------------

const API_BASE = "http://localhost:4000";

const QUANTITY_PRESETS = [1, 5, 10, 20];
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 35 * 60 * 1000; // légèrement > 30 min, laisse le temps au cron d'expirer proprement

function generateIdempotencyKey() {
  // Une seule clé par intention de paiement — régénérée uniquement si
  // l'utilisateur recommence un NOUVEAU paiement, jamais en cas de simple
  // re-soumission/perte de connexion sur la même tentative.
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `idem-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function PaidVoteTunnel() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get("candidate");

  const [quantity, setQuantity] = useState(1);
  const [customQuantity, setCustomQuantity] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState("form"); // form | pending | confirmed | failed | error
  const [errorMessage, setErrorMessage] = useState("");
  const [transactionId, setTransactionId] = useState(null);
  const [receipt, setReceipt] = useState(null);

  const idempotencyKeyRef = useRef(generateIdempotencyKey());
  const pollTimerRef = useRef(null);
  const pollStartRef = useRef(null);

  const effectiveQuantity = customQuantity ? Number(customQuantity) : quantity;

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!candidateId) {
      setErrorMessage("Aucun candidat sélectionné.");
      return;
    }
    if (!effectiveQuantity || effectiveQuantity <= 0) {
      setErrorMessage("Veuillez choisir un nombre de votes valide.");
      return;
    }
    if (!phoneNumber || phoneNumber.trim().length < 9) {
      setErrorMessage("Numéro Mobile Money invalide.");
      return;
    }

    setStep("pending");

    try {
      const res = await fetch(`${API_BASE}/api/votes/paid/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pollSlug: slug,
          candidateId,
          quantity: effectiveQuantity,
          phoneNumber,
          idempotencyKey: idempotencyKeyRef.current,
          visitorId: getVisitorId(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStep("error");
        setErrorMessage(data.error || "Une erreur est survenue.");
        return;
      }

      setTransactionId(data.transaction_id);

      if (data.status === "CONFIRMED") {
        await fetchReceipt(data.transaction_id);
        return;
      }

      startPolling(data.transaction_id);
    } catch (err) {
      setStep("error");
      setErrorMessage("Impossible de contacter le serveur. Réessayez dans un instant.");
    }
  };

  const fetchReceipt = async (txId) => {
    try {
      const res = await fetch(`${API_BASE}/api/votes/paid/receipt/${txId}`);
      const data = await res.json();
      if (res.ok) {
        setReceipt(data);
        setStep("confirmed");
      }
    } catch {
      // Le statut reste "confirmed" côté serveur même si le reçu échoue à charger ici.
    }
  };

  const startPolling = (txId) => {
    pollStartRef.current = Date.now();
    pollTimerRef.current = setInterval(async () => {
      if (Date.now() - pollStartRef.current > POLL_TIMEOUT_MS) {
        stopPolling();
        setStep("failed");
        setErrorMessage("Le délai d'attente a été dépassé.");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/votes/paid/status/${txId}`);
        const data = await res.json();

        if (data.status === "CONFIRMED") {
          stopPolling();
          await fetchReceipt(txId);
        } else if (data.status === "FAILED" || data.status === "EXPIRED") {
          stopPolling();
          setStep("failed");
          setErrorMessage(
            data.status === "EXPIRED"
              ? "Le délai de paiement a expiré (30 min). Aucun montant n'a été débité."
              : "Le paiement a échoué. Aucun vote n'a été comptabilisé."
          );
        }
        // sinon toujours PENDING : on continue le polling
      } catch {
        // Erreur réseau transitoire pendant le polling — on retente au prochain intervalle.
      }
    }, POLL_INTERVAL_MS);
  };

  const handleRetry = () => {
    idempotencyKeyRef.current = generateIdempotencyKey(); // nouvelle tentative = nouvelle clé
    setStep("form");
    setErrorMessage("");
    setTransactionId(null);
    setReceipt(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 bg-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-ink-200">
        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h1 className="text-xl font-bold mb-1 text-ink-900">
                Voter avec Mobile Money
              </h1>
              <p className="text-sm text-ink-700">
                Paiement sécurisé via Orange Money.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-ink-900">
                Nombre de votes
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {QUANTITY_PRESETS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setQuantity(q);
                      setCustomQuantity("");
                    }}
                    className={`py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                      !customQuantity && quantity === q
                        ? "border-primary bg-primary-50 text-primary"
                        : "border-ink-200 bg-white text-ink-900"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                value={customQuantity}
                onChange={(e) => setCustomQuantity(e.target.value)}
                placeholder="Ou saisissez un nombre personnalisé"
                className="w-full rounded-xl border border-ink-200 px-4 py-3 text-sm outline-none focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold mb-2 text-ink-900">
                Numéro Mobile Money (Orange)
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+237 6XX XXX XXX"
                className="w-full rounded-xl border border-ink-200 px-4 py-3 text-sm outline-none focus:ring-2"
              />
            </div>

            {errorMessage && (
              <p className="text-sm rounded-xl p-3" style={{ backgroundColor: "#DC26260F", color: "#DC2626" }}>
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
            >
              Payer {effectiveQuantity || 0} vote{effectiveQuantity > 1 ? "s" : ""}
            </button>
          </form>
        )}

        {step === "pending" && (
          <div className="text-center py-6">
            <svg className="animate-spin w-10 h-10 mx-auto mb-5" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" className="stroke-secondary" strokeWidth="3" opacity="0.2" />
              <path d="M22 12a10 10 0 00-10-10" className="stroke-secondary" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <h1 className="text-lg font-bold mb-2 text-ink-900">
              En attente de confirmation
            </h1>
            <p className="text-sm text-ink-700">
              Validez la demande de paiement reçue sur votre téléphone via le code USSD Orange Money.
            </p>
          </div>
        )}

        {step === "confirmed" && receipt && (
          <div className="text-center">
            <div className="mx-auto mb-5 flex items-center justify-center w-14 h-14 rounded-full bg-primary-50">
              <svg viewBox="0 0 24 24" className="w-7 h-7 stroke-primary" fill="none" strokeWidth="2.5">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-lg font-bold mb-4 text-ink-900">
              Paiement confirmé
            </h1>
            <div className="text-left text-sm rounded-xl p-4 space-y-2 bg-secondary-50">
              <div className="flex justify-between">
                <span className="text-ink-700">Scrutin</span>
                <span className="text-ink-900">{receipt.poll_title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-700">Votes</span>
                <span className="text-ink-900">{receipt.vote_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-700">Montant</span>
                <span className="text-ink-900">{Number(receipt.amount).toLocaleString("fr-FR")} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-700">Référence</span>
                <span className="text-ink-900 font-mono text-xs">
                  {receipt.reference}
                </span>
              </div>
            </div>
          </div>
        )}

        {(step === "failed" || step === "error") && (
          <div className="text-center">
            <div
              className="mx-auto mb-5 flex items-center justify-center w-14 h-14 rounded-full"
              style={{ backgroundColor: "#DC26261A" }}
            >
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="#DC2626" strokeWidth="2.5">
                <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-lg font-bold mb-2 text-ink-900">
              Paiement non abouti
            </h1>
            <p className="text-sm mb-6 text-ink-700">
              {errorMessage}
            </p>
            <button onClick={handleRetry} className="btn btn-primary">
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}