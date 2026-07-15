import crypto from "node:crypto";

const SALT = process.env.IP_HASH_SALT || "moledi-events-dev-salt";

/**
 * Hache l'IP du visiteur avant stockage (jamais en clair en base, cf.
 * colonnes ip_hashed sur visitors/gdpr_consents/rate_limits/votes...).
 */
export function hashIp(ip) {
  if (!ip) return "unknown";
  return crypto.createHash("sha256").update(SALT + ip).digest("hex");
}

/**
 * Récupère l'IP réelle du visiteur, en tenant compte d'un proxy éventuel
 * (X-Forwarded-For) devant l'API en production.
 */
export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || req.ip || "unknown";
}
