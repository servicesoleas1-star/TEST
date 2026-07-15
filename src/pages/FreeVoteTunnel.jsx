import React, { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { getVisitorId } from "../lib/visitorId.js";

// ---------------------------------------------------------------------------
// Moledi Events — Tunnel de vote gratuit public (vote_type = FREE_VISITOR_ID)
// Présenté en pop-up premium sur fond sombre, cohérent avec le tunnel payant.
// ---------------------------------------------------------------------------

export default function FreeVoteTunnel() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get("candidate");

  const [status, setStatus] = useState("idle");
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
      const res = await fetch(`/api/votes/free/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollSlug: slug, candidateId, visitorId: getVisitorId() }),
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
    } catch {
      setStatus("error");
      setErrorMessage("Impossible de contacter le serveur. Réessayez dans un instant.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-ink-900 bg-poll-dark relative overflow-hidden">
      <a href={`/vote/${slug}`} className="absolute top-6 left-6 inline-flex items-center gap-2 text-white/50 hover:text-white text-sm font-semibold transition-colors z-10">
        <ArrowLeft size={16} aria-hidden="true" />
        Annuler
      </a>

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-ink-800/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 text-center border border-white/10"
      >
        {status === "idle" && (
          <>
            <h1 className="text-xl font-bold mb-2 text-white">Confirmer votre vote gratuit</h1>
            <p className="text-sm mb-8 text-white/55">Votre vote sera comptabilisé immédiatement, sans paiement ni création de compte.</p>
            <button onClick={handleVote} className="btn btn-primary w-full">Voter gratuitement</button>
          </>
        )}

        {status === "sending" && (
          <div className="py-6">
            <svg className="animate-spin w-10 h-10 mx-auto mb-5" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" className="stroke-secondary" strokeWidth="3" opacity="0.2" />
              <path d="M22 12a10 10 0 00-10-10" className="stroke-secondary" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <p className="text-sm text-white/55">Enregistrement de votre vote...</p>
          </div>
        )}

        {status === "success" && result && (
          <>
            <div className="mx-auto mb-5 flex items-center justify-center w-14 h-14 rounded-full bg-primary/15">
              <svg viewBox="0 0 24 24" className="w-7 h-7 stroke-primary" fill="none" strokeWidth="2.5">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-lg font-bold mb-2 text-white">Vote comptabilisé !</h1>
            <p className="text-sm mb-4 text-white/60">Merci pour votre soutien à <strong className="text-white">{result.candidate_name}</strong>.</p>
            {result.max_votes && (
              <p className="text-xs rounded-xl p-3 bg-white/5 text-white/60 border border-white/10">
                Vous avez utilisé {result.votes_used} sur {result.max_votes} votes gratuits disponibles sur ce scrutin.
              </p>
            )}
            <a href={`/vote/${slug}/classement`} className="btn btn-primary w-full mt-6">Voir le classement</a>
          </>
        )}

        {status === "limit_reached" && result && (
          <>
            <div className="mx-auto mb-5 flex items-center justify-center w-14 h-14 rounded-full bg-red-500/15">
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="#F87171" strokeWidth="2.5">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-lg font-bold mb-2 text-white">Limite de votes atteinte</h1>
            <p className="text-sm text-white/60">
              Vous avez déjà utilisé vos {result.max_votes} vote{result.max_votes > 1 ? "s" : ""} gratuit{result.max_votes > 1 ? "s" : ""} sur ce scrutin.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-5 flex items-center justify-center w-14 h-14 rounded-full bg-red-500/15">
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="#F87171" strokeWidth="2.5">
                <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-lg font-bold mb-2 text-white">Vote non enregistré</h1>
            <p className="text-sm mb-6 text-white/60">{errorMessage}</p>
            <button onClick={() => setStatus("idle")} className="btn btn-primary">Réessayer</button>
          </>
        )}
      </motion.div>
    </div>
  );
}
