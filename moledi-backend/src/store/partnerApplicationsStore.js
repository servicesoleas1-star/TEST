import { pool } from "../db/pool.js";

export async function createPartnerApplication({ organizationName, email, phone, partnershipType, description }) {
  const { rows } = await pool.query(
    `INSERT INTO partner_applications (organization_name, email, phone, partnership_type, description)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING application_id, created_at`,
    [organizationName, email, phone, partnershipType, description]
  );
  return rows[0];
}

/**
 * Email de l'admin à notifier des nouvelles candidatures — vient de la
 * config plateforme (site_configs.admin_email), jamais codé en dur, jamais
 * exposé via l'API publique (voir platformController.js qui ne sélectionne
 * délibérément pas cette colonne).
 */
export async function getAdminNotificationEmail() {
  const { rows } = await pool.query(`SELECT admin_email FROM site_configs LIMIT 1`);
  return rows[0]?.admin_email || null;
}
