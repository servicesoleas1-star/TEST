import { pool } from "../db/pool.js";

/**
 * Toutes les entrées FAQ actives (tous types confondus), triées par type
 * puis position — table réelle global_faqs (db/migrations/11_backoffice_config.sql).
 */
export async function listActiveFAQ() {
  const { rows } = await pool.query(
    `SELECT faq_id, type, question, answer, position
       FROM global_faqs
       WHERE active = TRUE
       ORDER BY type, position`
  );
  return rows;
}
