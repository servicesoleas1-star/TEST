import { pool } from "../db/pool.js";

const RESULTS_VISIBILITY_LABELS = {
  PUBLIC: "Les résultats sont visibles publiquement pendant le scrutin.",
  HIDDEN: "Les résultats restent masqués tout au long du scrutin.",
  AFTER_CLOSE: "Les résultats ne sont dévoilés qu'à la clôture du scrutin.",
};

/**
 * Décrit la méthode anti-doublon en langage clair pour l'électeur.
 * Le schéma n'a pas de colonne dédiée "anti_duplicate_method" — cette
 * information est dérivée des colonnes réellement existantes
 * (max_votes_per_visitor, otp_enabled), qui sont ce qui applique
 * concrètement la limite en base (voir votes.visitor_id / ip_hashed).
 */
function describeAntiDuplicate(poll) {
  const parts = [];
  if (poll.max_votes_per_visitor) {
    parts.push(
      `Limité à ${poll.max_votes_per_visitor} vote${poll.max_votes_per_visitor > 1 ? "s" : ""} par visiteur`
    );
  } else {
    parts.push("Aucune limite de nombre de votes par visiteur");
  }
  parts.push("suivi via un identifiant unique de visite et l'adresse IP");
  if (poll.otp_enabled) {
    parts.push("avec vérification par code envoyé par SMS/email");
  }
  return parts.join(", ") + ".";
}

function describeVerificationMethod(poll) {
  return poll.otp_enabled
    ? "Vérification par code à usage unique (OTP) envoyé par SMS ou email avant la prise en compte du vote."
    : "Aucune vérification supplémentaire requise au-delà de l'identification du visiteur.";
}

/**
 * Récupère toutes les données nécessaires à la section "Règles" d'un
 * scrutin public, à partir de son slug. Ne renvoie AUCUNE donnée de
 * résultat/score — uniquement les règles configurées par l'organisateur.
 */
export async function getPollRules(slug) {
  const { rows } = await pool.query(
    `SELECT
       p.poll_id, p.title, p.vote_type, p.price_per_vote, p.vote_packs,
       p.max_votes_per_visitor, p.otp_enabled, p.results_visibility,
       p.open_at, p.close_at, p.timezone,
       s.whatsapp_support, s.contact_email, s.response_time_label
     FROM polls p
     LEFT JOIN site_configs s ON TRUE
     WHERE p.slug = $1
     LIMIT 1`,
    [slug]
  );

  const poll = rows[0];
  if (!poll) return null;

  return {
    title: poll.title,
    vote_type: poll.vote_type,
    price: {
      is_paid: poll.vote_type !== "FREE",
      price_per_vote: poll.price_per_vote,
      vote_packs: poll.vote_packs,
    },
    max_votes_per_visitor: poll.max_votes_per_visitor,
    verification_method: describeVerificationMethod(poll),
    period: {
      open_at: poll.open_at,
      close_at: poll.close_at,
      timezone: poll.timezone,
    },
    visibility_policy: {
      code: poll.results_visibility,
      label: RESULTS_VISIBILITY_LABELS[poll.results_visibility] || poll.results_visibility,
    },
    anti_duplicate_method: describeAntiDuplicate(poll),
    support_contact: {
      whatsapp: poll.whatsapp_support || null,
      email: poll.contact_email || null,
      response_time_label: poll.response_time_label || null,
    },
  };
}
