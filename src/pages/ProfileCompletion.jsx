import React, { useState, useEffect } from "react";

// ---------------------------------------------------------------------------
// Moledi Events — Complétion de profil (/inscription/profil)
// Affichée après vérification email, ET après une connexion Google réussie
// (même page, même endpoint — l'email de session est lu depuis sessionStorage,
// posé par EmailVerificationPage.jsx ou par le flux de connexion Google).
// ---------------------------------------------------------------------------

const API_BASE = "http://localhost:4000";

// Aligné sur l'enum campaign_type du schéma (db/migrations/00_extensions_and_enums.sql)
const EVENT_TYPE_OPTIONS = [
  { value: "POLL", label: "Scrutins / Votes" },
  { value: "EVENT", label: "Événements & Billetterie" },
  { value: "FUNDRAISER", label: "Dons & Cagnottes" },
  { value: "CF_PROJECT", label: "Financement participatif" },
  { value: "LOTTERY", label: "Tombolas" },
  { value: "CONTEST", label: "Jeux-concours" },
  { value: "SPONSOR_CALL", label: "Recherche de sponsors" },
];

const FREQUENCY_OPTIONS = [
  { value: "OCCASIONAL", label: "Occasionnellement (1-2 fois par an)" },
  { value: "MONTHLY", label: "Environ une fois par mois" },
  { value: "WEEKLY", label: "Régulièrement (chaque semaine)" },
];

const COUNTRY_OPTIONS = [
  "Cameroun",
  "Côte d'Ivoire",
  "Sénégal",
  "Gabon",
  "Congo",
  "République Démocratique du Congo",
  "Mali",
  "Bénin",
  "Togo",
  "Autre",
];

function getSessionEmail() {
  try {
    return sessionStorage.getItem("moledi_pending_email") || "";
  } catch {
    return "";
  }
}

export default function ProfileCompletionPage() {
  const [email, setEmail] = useState("");
  const [eventTypes, setEventTypes] = useState([]);
  const [frequency, setFrequency] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState("idle"); // idle | saving | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setEmail(getSessionEmail());
  }, []);

  const toggleEventType = (value) => {
    setEventTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const goToDashboard = () => {
    // Pas encore de vraie page dashboard — remplacer par la route réelle
    // une fois construite.
    window.location.href = "/dashboard";
  };

  const handleSkip = () => {
    goToDashboard();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("saving");
    setErrorMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/profile/preferences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, eventTypes, frequency, country }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error || "Une erreur est survenue.");
        return;
      }

      window.location.href = data.redirect_to || "/dashboard";
    } catch (err) {
      setStatus("error");
      setErrorMessage("Impossible de contacter le serveur. Réessayez dans un instant.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 bg-white">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm p-6 md:p-10 border border-ink-200">
        <p className="inline-block text-xs font-semibold tracking-widest uppercase mb-3 px-3 py-1 rounded-full bg-primary-50 text-primary">
          Dernière étape
        </p>
        <h1 className="text-2xl font-bold mb-2 text-ink-900">
          Parlez-nous de vos projets
        </h1>
        <p className="text-sm mb-8 text-ink-700">
          Ces informations nous aident à personnaliser votre expérience. Vous pourrez les modifier plus tard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Types d'événements */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-ink-900">
              Quels types de campagnes comptez-vous organiser ?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EVENT_TYPE_OPTIONS.map((opt) => {
                const checked = eventTypes.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleEventType(opt.value)}
                    className={`text-left px-4 py-2.5 rounded-xl border text-sm transition-colors ${
                      checked
                        ? "border-primary bg-primary-50 text-primary font-semibold"
                        : "border-ink-200 bg-white text-ink-900 font-normal"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fréquence */}
          <div>
            <label htmlFor="frequency" className="block text-sm font-semibold mb-2 text-ink-900">
              À quelle fréquence organisez-vous des événements ?
            </label>
            <select
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className={`w-full rounded-xl border border-ink-200 px-4 py-3 text-sm outline-none focus:ring-2 ${
                frequency ? "text-ink-900" : "text-ink-400"
              }`}
            >
              <option value="">Sélectionnez une fréquence</option>
              {FREQUENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Pays */}
          <div>
            <label htmlFor="country" className="block text-sm font-semibold mb-2 text-ink-900">
              Dans quel pays organisez-vous vos activités ?
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={`w-full rounded-xl border border-ink-200 px-4 py-3 text-sm outline-none focus:ring-2 ${
                country ? "text-ink-900" : "text-ink-400"
              }`}
            >
              <option value="">Sélectionnez un pays</option>
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {status === "error" && (
            <p className="text-sm rounded-xl p-3" style={{ backgroundColor: "#DC26260F", color: "#DC2626" }}>
              {errorMessage}
            </p>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleSkip}
              className="w-full sm:w-auto px-6 py-3 rounded-full font-semibold text-sm transition-colors text-ink-700 bg-transparent"
            >
              Passer cette étape
            </button>
            <button
              type="submit"
              disabled={status === "saving"}
              className="btn btn-primary w-full sm:flex-1 disabled:opacity-60"
            >
              {status === "saving" ? "Enregistrement..." : "Continuer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}