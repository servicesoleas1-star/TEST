import React, { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Moledi Events — Section "Règles" de la page publique d'un scrutin
// Ancre attendue sur la page : #regles (route /vote/:slug)
// ---------------------------------------------------------------------------

const NAVY = "#1E3A8A";
const ORANGE = "#E8651A";
const INK = "#1A1A2E";
const LINE = "#E4E2DC";
const API_BASE = "http://localhost:4000";

function formatDateTime(isoString, timezone) {
  if (!isoString) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: timezone || "UTC",
    }).format(new Date(isoString));
  } catch {
    return new Date(isoString).toLocaleString("fr-FR");
  }
}

function RuleRow({ icon, label, children }) {
  return (
    <div className="flex items-start gap-4 py-4" style={{ borderBottom: `1px solid ${LINE}` }}>
      <div
        className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
        style={{ backgroundColor: `${NAVY}0F` }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: `${INK}66` }}>
          {label}
        </p>
        <div className="text-sm" style={{ color: INK }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function Icon({ path }) {
  return (
    <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" width="18" height="18" fill="none" stroke={NAVY} strokeWidth="1.8">
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PollRulesSection({ slug }) {
  const [rules, setRules] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const res = await fetch(`${API_BASE}/api/polls/${slug}/rules`);
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setStatus("error");
          return;
        }
        setRules(data);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    if (slug) load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (status === "loading") {
    return (
      <section id="regles" className="py-10 text-sm" style={{ color: `${INK}66` }}>
        Chargement des règles...
      </section>
    );
  }

  if (status === "error" || !rules) {
    return (
      <section id="regles" className="py-10 text-sm" style={{ color: "#DC2626" }}>
        Impossible de charger les règles de ce scrutin pour le moment.
      </section>
    );
  }

  return (
    <section id="regles" className="py-10">
      <h2 className="text-2xl font-bold mb-1" style={{ color: INK }}>
        Règles du scrutin
      </h2>
      <p className="text-sm mb-6" style={{ color: `${INK}66` }}>
        Comprenez comment votre vote sera compté avant de participer.
      </p>

      <div className="bg-white rounded-2xl p-6 md:p-8" style={{ border: `1px solid ${LINE}` }}>
        <RuleRow label="Prix du vote" icon={<Icon path="M12 8c-1.66 0-3 .9-3 2s1.34 2 3 2 3 .9 3 2-1.34 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}>
          {rules.price.is_paid ? (
            <>
              {Number(rules.price.price_per_vote).toLocaleString("fr-FR")} FCFA par vote
              {rules.price.vote_packs && (
                <span className="block mt-1" style={{ color: `${INK}80` }}>
                  Des packs de votes à tarif dégressif sont également disponibles.
                </span>
              )}
            </>
          ) : (
            "Vote gratuit"
          )}
        </RuleRow>

        <RuleRow
          label="Nombre maximum de votes"
          icon={<Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
        >
          {rules.max_votes_per_visitor
            ? `${rules.max_votes_per_visitor} vote${rules.max_votes_per_visitor > 1 ? "s" : ""} maximum par visiteur`
            : "Aucune limite de nombre de votes par visiteur"}
        </RuleRow>

        <RuleRow
          label="Méthode de vérification"
          icon={<Icon path="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />}
        >
          {rules.verification_method}
        </RuleRow>

        <RuleRow
          label="Période de vote"
          icon={<Icon path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
        >
          Du {formatDateTime(rules.period.open_at, rules.period.timezone)} au{" "}
          {formatDateTime(rules.period.close_at, rules.period.timezone)}
          <span className="block mt-1" style={{ color: `${INK}80` }}>
            Fuseau horaire : {rules.period.timezone}
          </span>
        </RuleRow>

        <RuleRow
          label="Visibilité des résultats"
          icon={<Icon path="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />}
        >
          {rules.visibility_policy.label}
        </RuleRow>

        <RuleRow
          label="Prévention des votes en double"
          icon={<Icon path="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />}
        >
          {rules.anti_duplicate_method}
        </RuleRow>

        <RuleRow
          label="Besoin d'aide ?"
          icon={<Icon path="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" />}
        >
          {rules.support_contact.whatsapp && (
            <a
              href={`https://wa.me/${rules.support_contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: NAVY }}
            >
              Contacter le support sur WhatsApp
            </a>
          )}
          {rules.support_contact.email && (
            <span className="block mt-1">
              Ou par email :{" "}
              <a href={`mailto:${rules.support_contact.email}`} className="underline" style={{ color: NAVY }}>
                {rules.support_contact.email}
              </a>
            </span>
          )}
          {rules.support_contact.response_time_label && (
            <span className="block mt-1" style={{ color: `${INK}66` }}>
              {rules.support_contact.response_time_label}
            </span>
          )}
        </RuleRow>
      </div>
    </section>
  );
}
