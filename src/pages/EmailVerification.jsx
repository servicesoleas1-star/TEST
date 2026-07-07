import React, { useEffect, useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Moledi Events — Vérification email post-inscription
// Route prévue : /inscription/verification?token=...
//
// Comportement :
// - Au chargement, si un token est présent dans l'URL, on l'envoie
//   immédiatement au backend (POST /api/auth/verify-email) : "activé au clic"
//   du lien reçu par email, sans action supplémentaire de l'utilisateur.
// - En cas de succès : redirection automatique vers /inscription/profil.
// - En cas d'échec (expiré, déjà utilisé, invalide) : proposition de renvoi,
//   avec cooldown de 60s (le backend applique aussi ce cooldown côté serveur).
// ---------------------------------------------------------------------------

const API_BASE = "http://localhost:4000"; // à renseigner une fois le backend déployé

const RESEND_COOLDOWN_SECONDS = 60;

function getTokenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("token");
}

function Spinner() {
  return (
    <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" className="stroke-secondary" strokeWidth="3" opacity="0.2" />
      <path d="M22 12a10 10 0 00-10-10" className="stroke-secondary" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function StatusIcon({ variant }) {
  if (variant === "success") {
    return (
      <div className="mx-auto mb-5 flex items-center justify-center w-16 h-16 rounded-full bg-primary-50">
        <svg viewBox="0 0 24 24" className="w-8 h-8 stroke-primary" fill="none" strokeWidth="2.5">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  return (
    <div
      className="mx-auto mb-5 flex items-center justify-center w-16 h-16 rounded-full"
      style={{ backgroundColor: "#DC26261A" }}
    >
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="#DC2626" strokeWidth="2.5">
        <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function EmailVerificationPage() {
  // status : "verifying" | "success" | "error"
  const [status, setStatus] = useState("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendStatus, setResendStatus] = useState("idle"); // idle | sending | sent

  const verifyToken = useCallback(async (token) => {
    setStatus("verifying");
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error || "Une erreur est survenue.");
        return;
      }

      setStatus("success");
      try {
        sessionStorage.setItem("moledi_pending_email", data.email || "");
      } catch {}
      // Redirection automatique vers l'étape suivante de l'inscription.
      setTimeout(() => {
        window.location.href = data.redirect_to || "/inscription/profil";
      }, 1800);
    } catch (err) {
      setStatus("error");
      setErrorMessage("Impossible de contacter le serveur. Réessayez dans un instant.");
    }
  }, []);

  useEffect(() => {
    const token = getTokenFromUrl();
    if (!token) {
      setStatus("error");
      setErrorMessage("Aucun lien de vérification trouvé dans l'URL.");
      return;
    }
    verifyToken(token);
  }, [verifyToken]);

  // Décompte du cooldown de renvoi
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email.trim() || resendCooldown > 0) return;

    setResendStatus("sending");
    try {
      const res = await fetch(`${API_BASE}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.status === 429) {
        setResendCooldown(data.retry_after_seconds || RESEND_COOLDOWN_SECONDS);
        setResendStatus("idle");
        return;
      }

      setResendStatus("sent");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setResendStatus("idle");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 md:p-10 text-center border border-ink-200">
        {status === "verifying" && (
          <>
            <div className="flex justify-center mb-5">
              <Spinner />
            </div>
            <h1 className="text-xl font-bold mb-2 text-ink-900">
              Vérification en cours...
            </h1>
            <p className="text-sm text-ink-700">
              Merci de patienter quelques secondes.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <StatusIcon variant="success" />
            <h1 className="text-xl font-bold mb-2 text-ink-900">
              Email vérifié avec succès
            </h1>
            <p className="text-sm text-ink-700">
              Redirection vers la suite de votre inscription...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <StatusIcon variant="error" />
            <h1 className="text-xl font-bold mb-2 text-ink-900">
              Lien invalide ou expiré
            </h1>
            <p className="text-sm mb-6 text-ink-700">
              {errorMessage}
            </p>

            {resendStatus === "sent" ? (
              <p className="text-sm rounded-xl p-4 bg-primary-50 text-ink-900">
                Si un compte existe avec cet email, un nouveau lien vient d'être envoyé.
                {resendCooldown > 0 && (
                  <span className="block mt-1 text-ink-700">
                    Vous pourrez en redemander un dans {resendCooldown}s.
                  </span>
                )}
              </p>
            ) : (
              <form onSubmit={handleResend} className="space-y-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="w-full rounded-xl border border-ink-200 px-4 py-3 text-sm outline-none focus:ring-2"
                />
                <button
                  type="submit"
                  disabled={resendStatus === "sending" || resendCooldown > 0}
                  className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0
                    ? `Renvoyer le lien (${resendCooldown}s)`
                    : resendStatus === "sending"
                    ? "Envoi en cours..."
                    : "Renvoyer le lien de vérification"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}