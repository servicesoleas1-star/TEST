import React, { useState } from "react";

// ---------------------------------------------------------------------------
// Moledi Events — Réinitialisation du mot de passe (/reinitialiser-mot-de-passe)
// Route attendue : /reinitialiser-mot-de-passe?token=...
// ---------------------------------------------------------------------------

const API_BASE = "http://localhost:4000";

function getTokenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("token");
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle | saving | error
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (password.length < 8) {
      setErrorMessage("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Les deux mots de passe ne correspondent pas.");
      return;
    }

    const token = getTokenFromUrl();
    if (!token) {
      setErrorMessage("Lien de réinitialisation invalide.");
      return;
    }

    setStatus("saving");
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error || "Une erreur est survenue.");
        return;
      }

      window.location.href = data.redirect_to || "/mot-de-passe-modifie";
    } catch (err) {
      setStatus("error");
      setErrorMessage("Impossible de contacter le serveur. Réessayez dans un instant.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 md:p-10 border border-ink-200">
        <h1 className="text-xl font-bold mb-2 text-ink-900">
          Choisir un nouveau mot de passe
        </h1>
        <p className="text-sm mb-6 text-ink-700">
          Au moins 8 caractères.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nouveau mot de passe"
            className="w-full rounded-xl border border-ink-200 px-4 py-3 text-sm outline-none focus:ring-2"
          />
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmer le mot de passe"
            className="w-full rounded-xl border border-ink-200 px-4 py-3 text-sm outline-none focus:ring-2"
          />

          {errorMessage && (
            <p className="text-sm rounded-xl p-3" style={{ backgroundColor: "#DC26260F", color: "#DC2626" }}>
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "saving"}
            className="btn btn-primary w-full disabled:opacity-60"
          >
            {status === "saving" ? "Enregistrement..." : "Réinitialiser le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
}