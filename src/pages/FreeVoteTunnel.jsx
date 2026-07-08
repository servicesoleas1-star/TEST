import React, { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getVisitorId } from "../lib/visitorId.js";

// ---------------------------------------------------------------------------
// Moledi Events — Tunnel de vote gratuit public (vote_type = FREE_VISITOR_ID)
// Route : /vote/:slug/voter/gratuit?candidate=CANDIDATE_ID
// Aucun paiement, aucune vérification OTP — anti-doublon via Visitor ID +
// limite max_votes_per_visitor configurée par l'organisateur.
// ---------------------------------------------------------------------------

const API_BASE = "http://localhost:4000";

export default function FreeVoteTunnel() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get("candidate");

  const [status, setStatus] = useState("idle"); // idle | sending | success | limit_reached | error
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState(null);

  const handleVote = async () => {
    if (!candidateId) {
      setStatus("error");
      setErrorMessage("Aucun candidat sélectionné.");
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/votes/free/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pollSlug: slug,
          candidateId,
          visitorId: getVisitorId(),
        }),
      });
      const data = await res.json();

      if (res.status === 429) {
        setStatus("limit_reached");
        setResult(data);
        return;
      }

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error || "Une erreur est survenue.");
        return;
      }

      setResult(data);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage("Impossible de contacter le serveur. Réessayez dans un instant.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 bg-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6 md:p-8 text-center border border-ink-200">
        {status === "idle" && (
          <>
            <h1 className="text-xl font-bold mb-2 text-ink-900">
              Confirmer votre vote gratuit
            </h1>
            <p className="text-sm mb-8 text-ink-700">
              Votre vote sera comptabilisé immédiatement, sans paiement ni création de compte.
            </p>
            <button onClick={handleVote} className="btn btn-primary w-full">
              Voter gratuitement
            </button>
          </>
        )}

        {status === "sending" && (
          <div className="py-6">
            <svg className="animate-spin w-10 h-10 mx-auto mb-5" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" className="stroke-secondary" strokeWidth="3" opacity="0.2" />
              <path d="M22 12a10 10 0 00-10-10" className="stroke-secondary" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <p className="text-sm text-ink-700">
              Enregistrement de votre vote...
            </p>
          </div>
        )}

        {status === "success" && result && (
          <>
            <div className="mx-auto mb-5 flex items-center justify-center w-14 h-14 rounded-full bg-primary-50">
              <svg viewBox="0 0 24 24" className="w-7 h-7 stroke-primary" fill="none" strokeWidth="2.5">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-lg font-bold mb-2 text-ink-900">
              Vote comptabilisé !
            </h1>
            <p className="text-sm mb-4 text-ink-700">
              Merci pour votre soutien à <strong>{result.candidate_name}</strong>.
            </p>
            {result.max_votes && (
              <p className="text-xs rounded-xl p-3 bg-secondary-50 text-ink-700">
                Vous avez utilisé {result.votes_used} sur {result.max_votes} votes gratuits disponibles sur ce
                scrutin.
              </p>
            )}
          </>
        )}

        {status === "limit_reached" && result && (
          <>
            <div
              className="mx-auto mb-5 flex items-center justify-center w-14 h-14 rounded-full"
              style={{ backgroundColor: "#DC26261A" }}
            >
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="#DC2626" strokeWidth="2.5">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-lg font-bold mb-2 text-ink-900">
              Limite de votes atteinte
            </h1>
            <p className="text-sm text-ink-700">
              Vous avez déjà utilisé vos {result.max_votes} vote{result.max_votes > 1 ? "s" : ""} gratuit
              {result.max_votes > 1 ? "s" : ""} sur ce scrutin.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div
              className="mx-auto mb-5 flex items-center justify-center w-14 h-14 rounded-full"
              style={{ backgroundColor: "#DC26261A" }}
            >
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="#DC2626" strokeWidth="2.5">
                <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-lg font-bold mb-2 text-ink-900">
              Vote non enregistré
            </h1>
            <p className="text-sm mb-6 text-ink-700">
              {errorMessage}
            </p>
            <button onClick={() => setStatus("idle")} className="btn btn-primary">
              Réessayer
            </button>
          </>
        )}
      </div>
    </div>
  );
}