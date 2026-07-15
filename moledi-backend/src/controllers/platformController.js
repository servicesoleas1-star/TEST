import { pool } from "../db/pool.js";

// Repli si aucune ligne site_configs n'existe encore en base (avant le
// premier paramétrage back-office, ou avant l'exécution du seed) — mêmes
// valeurs que l'ancien mock côté frontend (components/PlatformConfig.js),
// pour ne jamais casser le bouton WhatsApp flottant faute de configuration.
const FALLBACK = {
  whatsapp_support: "237600000000",
  contact_email: "contact@moledievent.com",
  support_phone: null,
  social_links: null,
  response_time_label: null,
};

/**
 * GET /api/platform/settings
 * Paramètres globaux de la plateforme configurables depuis le back-office
 * (site_configs, singleton applicatif — voir 11_backoffice_config.sql).
 * Ne fait jamais échouer la page appelante : en cas d'erreur ou de table
 * vide, renvoie les valeurs de repli plutôt qu'un statut d'erreur.
 */
export async function getPlatformSettings(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT whatsapp_support, contact_email, support_phone, social_links, response_time_label
         FROM site_configs
         LIMIT 1`
    );
    return res.status(200).json({ ok: true, settings: rows[0] || FALLBACK });
  } catch (err) {
    console.error("Platform settings fetch error:", err.message);
    return res.status(200).json({ ok: true, settings: FALLBACK });
  }
}
