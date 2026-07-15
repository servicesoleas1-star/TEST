import { pool } from "../db/pool.js";

/**
 * Liste des sources d'acquisition actives ("Comment avez-vous connu Moledi
 * Events ?" sur le formulaire d'inscription) — table réelle acquisition_sources
 * (db/migrations/02_auth_users.sql), référencée par users.acquisition_source_id.
 */
export async function listAcquisitionSources() {
  const { rows } = await pool.query(
    `SELECT source_id, name, type
       FROM acquisition_sources
       WHERE active = TRUE
       ORDER BY name`
  );
  return rows;
}
