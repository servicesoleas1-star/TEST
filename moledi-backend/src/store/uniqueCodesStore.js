import { pool } from "../db/pool.js";

// ---------------------------------------------------------------------------
// Codes uniques — génération, import, gestion
//
// Alignement avec le schema reel (unique_codes) :
//   - la colonne s'appelle `value`, pas `code` (alias en SELECT pour garder
//     la meme forme de reponse JSON qu'avant).
//   - pas de colonne created_at a l'origine : ajoutee en migration 15.
//   - le lien vers le vote est deja stocke sur unique_codes.vote_id (FK) —
//     cancelUniqueCode lisait a tort `votes.unique_code`, colonne qui n'a
//     jamais existe sur la table votes.
// ---------------------------------------------------------------------------

/**
 * Génère N codes uniques aléatoires (8 chars alphanumériques).
 * Format : [A-Z0-9]{8} (majuscules + chiffres)
 */
function generateRandomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Génère un lot de N codes uniques et les insère dans la BD.
 * Retourne la liste insérée.
 */
export async function generateUniqueCodes(pollId, count) {
  if (!Number.isInteger(count) || count <= 0 || count > 10000) {
    throw new Error("count doit être entre 1 et 10000.");
  }

  const codes = new Set();
  while (codes.size < count) {
    codes.add(generateRandomCode());
  }

  const inserted = [];
  for (const code of codes) {
    const { rows } = await pool.query(
      `INSERT INTO unique_codes (poll_id, value, status)
       VALUES ($1, $2, 'UNUSED')
       RETURNING code_id, value AS code, status, used_at`,
      [pollId, code]
    );
    inserted.push(rows[0]);
  }

  return inserted;
}

/**
 * Importe des codes via CSV. Format attendu :
 *   code
 * Délimiteur : virgule
 * Encoding : UTF-8
 */
export async function importUniqueCodesFromCSV(pollId, csvContent) {
  const lines = csvContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && line !== "code");

  if (lines.length === 0) {
    throw new Error("Aucun code valide trouvé dans le CSV.");
  }

  const inserted = [];
  for (const line of lines) {
    const code = line.split(",")[0]?.trim().toUpperCase();
    if (!code || code.length !== 8 || !/^[A-Z0-9]{8}$/.test(code)) {
      throw new Error(`Code invalide : "${line}". Doit être 8 caractères alphanumériques.`);
    }

    try {
      const { rows } = await pool.query(
        `INSERT INTO unique_codes (poll_id, value, status)
         VALUES ($1, $2, 'UNUSED')
         RETURNING code_id, value AS code, status, used_at`,
        [pollId, code]
      );
      inserted.push(rows[0]);
    } catch (err) {
      if (err.code === "23505") {
        throw new Error(`Code dupliqué : "${code}".`);
      }
      throw err;
    }
  }

  return inserted;
}

/**
 * Liste les codes d'un scrutin avec pagination.
 */
export async function listUniqueCodes(pollId, page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;
  const { rows } = await pool.query(
    `SELECT code_id, value AS code, status, used_at, created_at
     FROM unique_codes
     WHERE poll_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [pollId, pageSize, offset]
  );
  const { rows: countRows } = await pool.query(
    `SELECT count(*)::int AS total FROM unique_codes WHERE poll_id = $1`,
    [pollId]
  );
  return { items: rows, total: countRows[0].total, page, pageSize };
}

/**
 * Annule un code : le marque comme CANCELLED et invalide le vote associé
 * (le lien est déjà stocké sur unique_codes.vote_id, pas besoin de
 * requêter la table votes pour le retrouver).
 */
export async function cancelUniqueCode(codeId) {
  const { rows: codeRows } = await pool.query(
    `SELECT code_id, vote_id FROM unique_codes WHERE code_id = $1`,
    [codeId]
  );
  const codeRecord = codeRows[0];
  if (!codeRecord) {
    throw new Error("Code non trouvé.");
  }

  await pool.query(
    `UPDATE unique_codes SET status = 'CANCELLED', used_at = now() WHERE code_id = $1`,
    [codeId]
  );

  if (codeRecord.vote_id) {
    await pool.query(`UPDATE votes SET status = 'CANCELLED' WHERE vote_id = $1`, [codeRecord.vote_id]);
  }
}

/**
 * Exporte tous les codes d'un scrutin en CSV.
 */
export async function exportUniqueCodesAsCSV(pollId) {
  const { rows } = await pool.query(
    `SELECT value AS code, status, used_at
     FROM unique_codes
     WHERE poll_id = $1
     ORDER BY created_at DESC`,
    [pollId]
  );

  const header = "code,status,used_at";
  const lines = rows.map((r) =>
    [r.code, r.status, r.used_at ? new Date(r.used_at).toISOString() : ""].join(",")
  );

  return [header, ...lines].join("\n");
}

/**
 * Marque un code comme USED lors du vote, et enregistre le vote_id associé.
 */
export async function markCodeAsUsed(pollId, code, voteId = null) {
  const { rows } = await pool.query(
    `UPDATE unique_codes
     SET status = 'USED', used_at = now(), vote_id = COALESCE($3, vote_id)
     WHERE poll_id = $1 AND value = $2 AND status = 'UNUSED'
     RETURNING code_id`,
    [pollId, code, voteId]
  );

  if (rows.length === 0) {
    throw new Error("Code invalide ou déjà utilisé.");
  }

  return rows[0];
}