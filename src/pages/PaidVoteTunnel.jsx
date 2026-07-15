import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { getVisitorId } from "../lib/visitorId.js";
import { flag } from "../config/media.js";

// ---------------------------------------------------------------------------
// Moledi Events — Tunnel de vote payant, présenté en pop-up premium sur fond
// sombre flouté (au-dessus de la photo du scrutin), avec une vraie sélection
// de pays (table country_configs, /api/countries) au lieu du Cameroun codé
// en dur -- architecture prête pour l'ajout d'autres moyens de paiement /
// agrégateurs par pays, sans rien changer côté UI.
// ---------------------------------------------------------------------------

const QUANTITY_PRESETS = [1, 5, 10, 20];
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 35 * 60 * 1000;

function generateIdempotencyKey() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `idem-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function useCountries() {
  const [countries, setCountries] = useState([]);
  useEffect(() => {
    fetch("/api/countries")
      .then((r) => r.json())
      .then((d) => setCountries(d.ok ? d.countries.filter((c) => c.active) : []))
      .catch(() => setCountries([]));
  }, []);
  return countries;
}

function CountryPicker({ countries, value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = countries.find((c) => c.country_code === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 h-13 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-left hover:border-primary/40 transition-colors"
      >
        {selected ? (
          <>
            <img src={flag(selected.country_code.toLowerCase(), 40)} alt="" className="w-6 h-4.5 object-cover rounded shadow-sm" />
            <span className="text-white text-sm font-semibold">{selected.country_name}</span>
          </>
        ) : (
          <span className="text-white/40 text-sm">Sélectionnez votre pays</span>
        )}
        <ChevronDown size={15} className={`ml-auto text-white/50 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <ul className="absolute z-20 mt-2 w-full max-h-52 overflow-y-auto rounded-xl border border-white/15 bg-ink-800 shadow-2xl">
          {countries.map((c) => (
            <li key={c.country_code}>
              <button
                type="button"
                onClick={() => { onChange(c.country_code); setOpen(false); }}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors ${value === c.country_code ? "text-primary-300 font-semibold" : "text-white/85"}`}
              >
                <img src={flag(c.country_code.toLowerCase(), 40)} alt="" className="w-6 h-4.5 object-cover rounded shadow-sm" />
                {c.country_name}
              </button>
            </li>
          ))}
          {countries.length === 0 && <li className="px-4 py-3 text-sm text-white/40">Aucun pays disponible.</li>}
        </ul>
      )}
    </div>
  );
}

export default function PaidVoteTunnel() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get("candidate");
  const countries = useCountries();

  const [quantity, setQuantity] = useState(1);
  const [customQuantity, setCustomQuantity] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [receipt, setReceipt] = useState(null);

  const idempotencyKeyRef = useRef(generateIdempotencyKey());
  const pollTimerRef = useRef(null);
  const pollStartRef = useRef(null);

  useEffect(() => {
    if (!countryCode && countries[0]) setCountryCode(countries[0].country_code);
  }, [countries, countryCode]);

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

    if (!candidateId) return setErrorMessage("Aucun candidat sélectionné.");
    if (!effectiveQuantity || effectiveQuantity <= 0) return setErrorMessage("Veuillez choisir un nombre de votes valide.");
    if (!countryCode) return setErrorMessage("Veuillez sélectionner un pays.");
    if (!phoneNumber || phoneNumber.trim().length < 9) return setErrorMessage("Numéro Mobile Money invalide.");

    setStep("pending");

    try {
      const res = await fetch(`/api/votes/paid/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pollSlug: slug,
          candidateId,
          quantity: effectiveQuantity,
          phoneNumber,
          countryCode,
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

      if (data.status === "CONFIRMED") {
        await fetchReceipt(data.transaction_id);
        return;
      }

      startPolling(data.transaction_id);
    } catch {
      setStep("error");
      setErrorMessage("Impossible de contacter le serveur. Réessayez dans un instant.");
    }
  };

  const fetchReceipt = async (txId) => {
    try {
      const res = await fetch(`/api/votes/paid/receipt/${txId}`);
      const data = await res.json();
      if (res.ok) {
        setReceipt(data);
        setStep("confirmed");
      }
    } catch {
      // le statut reste "confirmed" côté serveur même si le reçu échoue à charger ici
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
        const res = await fetch(`/api/votes/paid/status/${txId}`);
        const data = await res.json();
        if (data.status === "CONFIRMED") {
          stopPolling();
          await fetchReceipt(txId);
        } else if (data.status === "FAILED" || data.status === "EXPIRED") {
          stopPolling();
          setStep("failed");
          setErrorMessage(data.status === "EXPIRED" ? "Le délai de paiement a expiré (30 min). Aucun montant n'a été débité." : "Le paiement a échoué. Aucun vote n'a été comptabilisé.");
        }
      } catch {
        // erreur réseau transitoire pendant le polling — on retente au prochain intervalle
      }
    }, POLL_INTERVAL_MS);
  };

  const handleRetry = () => {
    idempotencyKeyRef.current = generateIdempotencyKey();
    setStep("form");
    setErrorMessage("");
    setReceipt(null);
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
        className="w-full max-w-md bg-ink-800/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 border border-white/10"
      >
        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h1 className="text-xl font-bold mb-1 text-white">Voter avec Mobile Money</h1>
              <p className="text-sm text-white/50">Paiement sécurisé, comptabilisé après confirmation.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-white/90">Nombre de votes</label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {QUANTITY_PRESETS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => { setQuantity(q); setCustomQuantity(""); }}
                    className={`py-2.5 rounded-xl border text-sm font-semibold transition-colors ${!customQuantity && quantity === q ? "border-primary bg-primary/15 text-primary-300" : "border-white/15 bg-white/5 text-white/80"}`}
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
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-white/90">Pays</label>
              <CountryPicker countries={countries} value={countryCode} onChange={setCountryCode} />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold mb-2 text-white/90">Numéro Mobile Money</label>
              <input
                id="phone"
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+237 6XX XXX XXX"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {errorMessage && <p className="text-sm rounded-xl p-3 bg-red-500/10 text-red-300">{errorMessage}</p>}

            <button type="submit" className="btn btn-primary w-full">
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
            <h1 className="text-lg font-bold mb-2 text-white">En attente de confirmation</h1>
            <p className="text-sm text-white/60">Validez la demande de paiement reçue sur votre téléphone.</p>
          </div>
        )}

        {step === "confirmed" && receipt && (
          <div className="text-center">
            <div className="mx-auto mb-5 flex items-center justify-center w-14 h-14 rounded-full bg-primary/15">
              <svg viewBox="0 0 24 24" className="w-7 h-7 stroke-primary" fill="none" strokeWidth="2.5">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-lg font-bold mb-4 text-white">Paiement confirmé</h1>
            <div className="text-left text-sm rounded-xl p-4 space-y-2 bg-white/5 border border-white/10">
              <div className="flex justify-between"><span className="text-white/50">Scrutin</span><span className="text-white">{receipt.poll_title}</span></div>
              <div className="flex justify-between"><span className="text-white/50">Votes</span><span className="text-white">{receipt.vote_count}</span></div>
              <div className="flex justify-between"><span className="text-white/50">Montant</span><span className="text-white">{Number(receipt.amount).toLocaleString("fr-FR")} FCFA</span></div>
              <div className="flex justify-between"><span className="text-white/50">Référence</span><span className="text-white font-mono text-xs">{receipt.reference}</span></div>
            </div>
            <a href={`/vote/${slug}/classement`} className="btn btn-primary w-full mt-6">Voir le classement</a>
          </div>
        )}

        {(step === "failed" || step === "error") && (
          <div className="text-center">
            <div className="mx-auto mb-5 flex items-center justify-center w-14 h-14 rounded-full bg-red-500/15">
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="#F87171" strokeWidth="2.5">
                <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-lg font-bold mb-2 text-white">Paiement non abouti</h1>
            <p className="text-sm mb-6 text-white/60">{errorMessage}</p>
            <button onClick={handleRetry} className="btn btn-primary">Réessayer</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
