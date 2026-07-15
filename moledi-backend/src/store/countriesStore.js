import { pool } from "../db/pool.js";
import { parsePgEnumArray } from "../utils/pgArray.js";

/**
 * Liste des pays actifs avec leur configuration (devise, agrégateurs de
 * paiement, méthodes disponibles) — utilisée par les sections "couverture
 * pays" des pages publiques (accueil, tarifs).
 */
export async function listCountries() {
  const { rows } = await pool.query(
    `SELECT country_code, country_name, active, currency, aggregator_ids,
            methods_available, updated_at
       FROM country_configs
       WHERE active = TRUE
       ORDER BY country_name`
  );
  return rows.map((row) => ({ ...row, methods_available: parsePgEnumArray(row.methods_available) }));
}
