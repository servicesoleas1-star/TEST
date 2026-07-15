import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Coins, ShieldCheck, Fingerprint, CalendarClock, Eye, LifeBuoy } from "lucide-react";

// ---------------------------------------------------------------------------
// Moledi Events — Contenu détaillé de la page "Règles" d'un scrutin.
// Utilisé par pages/PollRules.jsx (route /vote/:slug/regles), toute une
// page dédiée -- pas un simple encart -- pour présenter le règlement de
// façon riche : icônes, encadrés, sections. Chemin d'API relatif (le bug
// précédent codait en dur http://localhost:4000, qui casse dès que le
// frontend n'est pas servi sur ce host exact).
// ---------------------------------------------------------------------------

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

function RuleCard({ icon: Icon, label, children, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.5, delay }}
      className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-6 hover:border-primary/30 hover:bg-white/[0.14] transition-colors"
    >
      <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/15 border border-primary/25 mb-4">
        <Icon size={20} className="text-primary-300" aria-hidden="true" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-white/40 mb-2">{label}</p>
      <div className="text-sm text-white/85 leading-relaxed normal-case">{children}</div>
    </motion.div>
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
        const res = await fetch(`/api/polls/${slug}/rules`);
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
    return <p className="text-sm text-white/50 py-10">Chargement des règles...</p>;
  }

  if (status === "error" || !rules) {
    return <p className="text-sm text-red-400 py-10">Impossible de charger les règles de ce scrutin pour le moment.</p>;
  }

  return (
    <div className="grid sm:grid-cols-2 gap-5">
      <RuleCard icon={Coins} label="Prix du vote" delay={0}>
        {rules.price.is_paid ? (
          <>
            {Number(rules.price.price_per_vote).toLocaleString("fr-FR")} FCFA par vote
            {rules.price.vote_packs && <span className="block mt-1 text-white/55">Des packs de votes à tarif dégressif sont également disponibles.</span>}
          </>
        ) : (
          "Vote gratuit"
        )}
      </RuleCard>

      <RuleCard icon={ShieldCheck} label="Nombre maximum de votes" delay={0.05}>
        {rules.max_votes_per_visitor
          ? `${rules.max_votes_per_visitor} vote${rules.max_votes_per_visitor > 1 ? "s" : ""} maximum par visiteur`
          : "Aucune limite de nombre de votes par visiteur"}
      </RuleCard>

      <RuleCard icon={Fingerprint} label="Méthode de vérification" delay={0.1}>
        {rules.verification_method}
      </RuleCard>

      <RuleCard icon={CalendarClock} label="Période de vote" delay={0.15}>
        Du {formatDateTime(rules.period.open_at, rules.period.timezone)} au {formatDateTime(rules.period.close_at, rules.period.timezone)}
        <span className="block mt-1 text-white/55">Fuseau horaire : {rules.period.timezone}</span>
      </RuleCard>

      <RuleCard icon={Eye} label="Visibilité des résultats" delay={0.2}>
        {rules.visibility_policy.label}
      </RuleCard>

      <RuleCard icon={ShieldCheck} label="Prévention des votes en double" delay={0.25}>
        {rules.anti_duplicate_method}
      </RuleCard>

      <RuleCard icon={LifeBuoy} label="Besoin d'aide ?" delay={0.3}>
        {rules.support_contact.whatsapp && (
          <a href={`https://wa.me/${rules.support_contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-primary-300 underline underline-offset-2">
            Contacter le support sur WhatsApp
          </a>
        )}
        {rules.support_contact.email && (
          <span className="block mt-1">
            Ou par email : <a href={`mailto:${rules.support_contact.email}`} className="text-primary-300 underline underline-offset-2">{rules.support_contact.email}</a>
          </span>
        )}
        {rules.support_contact.response_time_label && <span className="block mt-1 text-white/40">{rules.support_contact.response_time_label}</span>}
      </RuleCard>
    </div>
  );
}
