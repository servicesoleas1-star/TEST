import React, { useState } from "react";

// ---------------------------------------------------------------------------
// Moledi Events — Mot de passe oublié (/mot-de-passe-oublie)
// Réponse strictement identique que le compte existe ou non (anti-énumération).
// ---------------------------------------------------------------------------

const API_BASE = "http://localhost:4000";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");

    try {
      await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      // Même en cas d'erreur réseau, on affiche le message générique —
      // ne jamais laisser transparaître un état différent selon le résultat.
    }

    setStatus("sent");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 md:p-10 border border-ink-200">
        <h1 className="text-xl font-bold mb-2 text-ink-900">
          Mot de passe oublié
        </h1>

        {status === "sent" ? (
          <p className="text-sm rounded-xl p-4 mt-4 bg-primary-50 text-ink-900">
            Si un compte existe avec l'adresse <strong>{email}</strong>, un lien de
            réinitialisation vient d'être envoyé. Vérifiez votre boîte mail (et vos spams).
          </p>
        ) : (
          <>
            <p className="text-sm mb-6 text-ink-700">
              Indiquez votre adresse email, nous vous enverrons un lien pour choisir un nouveau
              mot de passe.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                disabled={status === "sending"}
                className="btn btn-primary w-full disabled:opacity-60"
              >
                {status === "sending" ? "Envoi en cours..." : "Envoyer le lien"}
              </button>
            </form>
          </>
        )}

        <p className="text-sm mt-6 text-center">
          <a href="/connexion" className="text-secondary hover:underline">
            Retour à la connexion
          </a>
        </p>
      </div>
    </div>
  );
}