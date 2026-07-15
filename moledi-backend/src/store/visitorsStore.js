import { pool } from "../db/pool.js";

/**
 * Crée le visiteur s'il n'existe pas encore (première visite). Si le
 * visitor_id existe déjà (cookie relu, ou déjà créé en amont par un vote —
 * voir freeVoteStore.ensureVisitorExists), on ne fait rien : la ligne
 * initiale ne doit jamais être écrasée par un appel /init tardif.
 */
export async function upsertVisitor({
  visitorId,
  browser,
  os,
  language,
  screenResolution,
  ipHashed,
}) {
  const { rows } = await pool.query(
    `INSERT INTO visitors (visitor_id, browser, os, language, screen_resolution, ip_hashed)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (visitor_id) DO NOTHING
     RETURNING visitor_id`,
    [visitorId, browser || null, os || null, language || null, screenResolution || null, ipHashed || "unknown"]
  );
  return rows[0] || null;
}

/**
 * Lie définitivement un visiteur anonyme à un compte utilisateur, à la
 * connexion/inscription. Ne change plus une fois posé (cf. commentaire sur
 * visitors.account_id dans 01_identity_session.sql) : un visiteur déjà lié
 * à un autre compte n'est jamais réassigné.
 */
export async function associateVisitor(visitorId, userId) {
  const { rows } = await pool.query(
    `UPDATE visitors SET account_id = $2
     WHERE visitor_id = $1 AND account_id IS NULL
     RETURNING visitor_id, account_id, language`,
    [visitorId, userId]
  );
  return rows[0] || null;
}

/**
 * Met à jour la langue préférée du visiteur — appelé à chaque bascule du
 * sélecteur de langue, pour que la préférence suive le visiteur dans toute
 * la navigation (et plus tard, dans son dashboard une fois connecté).
 */
export async function updateVisitorLanguage(visitorId, language) {
  await pool.query(`UPDATE visitors SET language = $2 WHERE visitor_id = $1`, [visitorId, language]);
}

/**
 * Enregistre le consentement RGPD / loi camerounaise sur les données
 * personnelles (bandeau cookies). Une ligne par consentement exprimé — pas
 * d'UPSERT : l'historique des consentements successifs est conservé.
 */
export async function recordConsent({ visitorId, accepted, policyVersion, ipHashed }) {
  // Le bandeau cookies peut s'afficher avant que /api/visitors/init n'ait
  // fini d'enregistrer le visiteur (appel fire-and-forget côté client) —
  // on garantit la ligne visitors ici aussi pour ne jamais violer la FK,
  // même pattern que freeVoteStore.ensureVisitorExists.
  await pool.query(
    `INSERT INTO visitors (visitor_id, ip_hashed) VALUES ($1, $2)
     ON CONFLICT (visitor_id) DO NOTHING`,
    [visitorId, ipHashed || "unknown"]
  );

  const { rows } = await pool.query(
    `INSERT INTO gdpr_consents (visitor_id, accepted, policy_version, ip_hashed)
     VALUES ($1, $2, $3, $4)
     RETURNING consent_id, "timestamp"`,
    [visitorId, accepted, policyVersion, ipHashed || "unknown"]
  );
  return rows[0];
}
