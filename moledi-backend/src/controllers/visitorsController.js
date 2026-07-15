import { upsertVisitor, associateVisitor, updateVisitorLanguage, recordConsent } from "../store/visitorsStore.js";
import { hashIp, getClientIp } from "../utils/hashIp.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Le visitor_id peut arriver soit dans le body (appels directs, ex. /init),
// soit dans le header X-Visitor-Id (appels via withVisitorHeader() côté
// client, ex. /language, /consent) — on accepte les deux pour rester
// tolérant à l'appelant.
function resolveVisitorId(req) {
  return req.body?.visitor_id || req.headers["x-visitor-id"] || null;
}

/**
 * POST /api/visitors/init
 * Body: { visitor_id, user_agent, language, platform, screen_width,
 *         screen_height, ... } — voir collectDeviceMetadata() côté client
 * (src/lib/visitorId.js). Appelé une fois par visiteur, à la toute première
 * visite : ne bloque jamais la navigation en cas d'échec (le frontend
 * ignore déjà les erreurs réseau ici).
 */
export async function initVisitor(req, res) {
  const { visitor_id, user_agent, language, screen_width, screen_height } = req.body;

  if (!visitor_id || !UUID_RE.test(visitor_id)) {
    return res.status(400).json({ error: "visitor_id invalide." });
  }

  try {
    const ipHashed = hashIp(getClientIp(req));
    const screenResolution = screen_width && screen_height ? `${screen_width}x${screen_height}` : null;

    await upsertVisitor({
      visitorId: visitor_id,
      browser: typeof user_agent === "string" ? user_agent.slice(0, 500) : null,
      os: null,
      language: typeof language === "string" ? language.slice(0, 10) : null,
      screenResolution,
      ipHashed,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Visitor init error:", err.message);
    // Ne jamais bloquer le visiteur pour un souci d'enregistrement analytique.
    return res.status(200).json({ success: false });
  }
}

/**
 * POST /api/visitors/associate
 * Body: { visitor_id, user_id }
 * Appelé à la connexion/inscription réussie pour lier le visiteur anonyme
 * au compte qui vient de se créer/connecter.
 */
export async function associateVisitorWithAccount(req, res) {
  const { visitor_id, user_id } = req.body;

  if (!visitor_id || !UUID_RE.test(visitor_id) || !user_id) {
    return res.status(400).json({ error: "visitor_id et user_id requis." });
  }

  try {
    const result = await associateVisitor(visitor_id, user_id);
    return res.status(200).json({ success: true, linked: Boolean(result) });
  } catch (err) {
    console.error("Visitor association error:", err.message);
    return res.status(200).json({ success: false });
  }
}

/**
 * POST /api/visitors/language
 * Body: { visitor_id, language } — 'FR' ou 'EN'. Appelé à chaque bascule du
 * sélecteur de langue pour que la préférence suive le visiteur dans toute
 * la navigation.
 */
export async function setVisitorLanguage(req, res) {
  const visitor_id = resolveVisitorId(req);
  const { language } = req.body;

  if (!visitor_id || !UUID_RE.test(visitor_id) || !["FR", "EN"].includes(language)) {
    return res.status(400).json({ error: "visitor_id et language ('FR'|'EN') requis." });
  }

  try {
    await updateVisitorLanguage(visitor_id, language);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Visitor language update error:", err.message);
    return res.status(200).json({ success: false });
  }
}

/**
 * POST /api/visitors/consent
 * Body: { visitor_id, accepted, policy_version }
 * Enregistre le consentement exprimé sur le bandeau cookies.
 */
export async function recordVisitorConsent(req, res) {
  const visitor_id = resolveVisitorId(req);
  const { accepted, policy_version } = req.body;

  if (!visitor_id || !UUID_RE.test(visitor_id) || typeof accepted !== "boolean" || !policy_version) {
    return res.status(400).json({ error: "visitor_id, accepted et policy_version requis." });
  }

  try {
    const ipHashed = hashIp(getClientIp(req));
    await recordConsent({ visitorId: visitor_id, accepted, policyVersion: policy_version, ipHashed });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Visitor consent error:", err.message);
    return res.status(200).json({ success: false });
  }
}
