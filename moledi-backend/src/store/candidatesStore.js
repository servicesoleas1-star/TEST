import { parse } from "csv-parse";
import { pool } from "../db/pool.js";

// ---------------------------------------------------------------------------
// Candidats — gestion manuelle et import CSV
//
// Alignement avec le schema reel (db/migrations/04_polls_votes.sql) :
//   - photo_url (API)   -> candidates.cover_photo_url
//   - description (API) -> candidates.biography
//   - mobile_money (API)-> candidates.payout_phone
//   - category (API)    -> candidate_categories.name, via category_id (FK) ;
//     resolue ou creee a la volee (pas de gestion de categories separee
//     encore construite cote frontend).
//   - "suppression" d'un candidat -> pas de colonne deleted_at sur cette
//     table : on utilise la colonne reelle `active` (le candidat reste en
//     base pour l'historique des votes deja lies, mais disparait des listes
//     publiques/organisateur).
//   - real_name est NOT NULL en base : si absent, on reprend display_name.
// ---------------------------------------------------------------------------

/**
 * Retrouve l'id d'une categorie par son nom pour ce scrutin, ou la cree si
 * elle n'existe pas encore. Retourne null si aucun nom n'est fourni.
 */
async function resolveCategoryId(pollId, categoryName) {
  const name = (categoryName || "").trim();
  if (!name) return null;

  const { rows: existing } = await pool.query(
    `SELECT category_id FROM candidate_categories WHERE poll_id = $1 AND name = $2`,
    [pollId, name]
  );
  if (existing[0]) return existing[0].category_id;

  const { rows: created } = await pool.query(
    `INSERT INTO candidate_categories (poll_id, name) VALUES ($1, $2) RETURNING category_id`,
    [pollId, name]
  );
  return created[0].category_id;
}

const SELECT_COLUMNS = `
  c.candidate_id,
  c.display_name,
  c.real_name,
  c.cover_photo_url AS photo_url,
  c.biography AS description,
  c.payout_phone AS mobile_money,
  c.phone,
  c.email,
  c.position,
  c.active,
  cat.name AS category
`;

/**
 * Crée un candidat manuellement. Seul display_name est obligatoire côté API
 * (real_name est repris de display_name si non fourni, car NOT NULL en base).
 */
export async function createCandidate(pollId, data) {
  const { display_name, real_name, photo_url, description, category, phone, email, mobile_money } = data;

  if (!display_name) {
    throw new Error("display_name est obligatoire.");
  }

  const categoryId = await resolveCategoryId(pollId, category);
  const finalRealName = real_name && real_name.trim() ? real_name.trim() : display_name;

  const { rows } = await pool.query(
    `INSERT INTO candidates
       (poll_id, category_id, display_name, real_name, cover_photo_url, biography, phone, email, payout_phone)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING candidate_id, display_name, position`,
    [pollId, categoryId, display_name, finalRealName, photo_url || null, description || null, phone || null, email || null, mobile_money || null]
  );
  return rows[0];
}

/**
 * Liste les candidats actifs d'un scrutin, triés par position.
 */
export async function listCandidates(pollId) {
  const { rows } = await pool.query(
    `SELECT ${SELECT_COLUMNS}
     FROM candidates c
     LEFT JOIN candidate_categories cat ON cat.category_id = c.category_id
     WHERE c.poll_id = $1 AND c.active = TRUE
     ORDER BY c.position ASC`,
    [pollId]
  );
  return rows;
}

/**
 * Met à jour un candidat (tous les champs optionnels).
 */
export async function updateCandidate(candidateId, data) {
  const { display_name, real_name, photo_url, description, category, phone, email, mobile_money } = data;

  const { rows: current } = await pool.query(
    `SELECT poll_id FROM candidates WHERE candidate_id = $1`,
    [candidateId]
  );
  if (!current[0]) return null;
  const pollId = current[0].poll_id;

  const updates = [];
  const params = [candidateId];
  let paramIndex = 2;

  if (display_name !== undefined) {
    updates.push(`display_name = $${paramIndex++}`);
    params.push(display_name);
  }
  if (real_name !== undefined) {
    updates.push(`real_name = $${paramIndex++}`);
    params.push(real_name && real_name.trim() ? real_name.trim() : display_name);
  }
  if (photo_url !== undefined) {
    updates.push(`cover_photo_url = $${paramIndex++}`);
    params.push(photo_url);
  }
  if (description !== undefined) {
    updates.push(`biography = $${paramIndex++}`);
    params.push(description);
  }
  if (category !== undefined) {
    const categoryId = await resolveCategoryId(pollId, category);
    updates.push(`category_id = $${paramIndex++}`);
    params.push(categoryId);
  }
  if (phone !== undefined) {
    updates.push(`phone = $${paramIndex++}`);
    params.push(phone);
  }
  if (email !== undefined) {
    updates.push(`email = $${paramIndex++}`);
    params.push(email);
  }
  if (mobile_money !== undefined) {
    updates.push(`payout_phone = $${paramIndex++}`);
    params.push(mobile_money);
  }

  if (updates.length === 0) return null;

  const { rows } = await pool.query(
    `UPDATE candidates SET ${updates.join(", ")} WHERE candidate_id = $1 RETURNING candidate_id, display_name`,
    params
  );
  return rows[0] || null;
}

/**
 * "Suppression" d'un candidat : pas de deleted_at sur cette table, on
 * désactive via la colonne réelle `active` (l'historique des votes déjà liés
 * à ce candidat reste intact).
 */
export async function deleteCandidate(candidateId) {
  await pool.query(`UPDATE candidates SET active = FALSE WHERE candidate_id = $1`, [candidateId]);
}

/**
 * Réordonne les candidats : reçoit un tableau [{ candidate_id, position }, ...]
 * et met à jour la position de chacun.
 */
export async function reorderCandidates(orderedList) {
  const promises = orderedList.map(({ candidate_id, position }) =>
    pool.query(`UPDATE candidates SET position = $1 WHERE candidate_id = $2`, [position, candidate_id])
  );
  await Promise.all(promises);
}

/**
 * Importe des candidats via CSV. Format attendu :
 *   display_name, real_name, photo_url, description, category, phone, email, mobile_money
 * Délimiteur : virgule
 * Encoding : UTF-8
 */
export async function importCandidatesFromCSV(pollId, csvContent) {
  return new Promise((resolve, reject) => {
    const candidates = [];
    const parser = parse({
      skip_empty_lines: true,
      trim: true,
      delimiter: ",",
      encoding: "utf8",
      relax_quotes: true,
    });

    parser.on("readable", function () {
      let record;
      while ((record = parser.read())) {
        const [display_name, real_name, photo_url, description, category, phone, email, mobile_money] = record;

        if (!display_name || display_name.trim() === "") {
          return reject(new Error("Colonne display_name (1ère) est obligatoire sur chaque ligne."));
        }

        candidates.push({
          display_name: display_name.trim(),
          real_name: real_name?.trim() || null,
          photo_url: photo_url?.trim() || null,
          description: description?.trim() || null,
          category: category?.trim() || null,
          phone: phone?.trim() || null,
          email: email?.trim() || null,
          mobile_money: mobile_money?.trim() || null,
        });
      }
    });

    parser.on("error", (err) => reject(err));
    parser.on("end", async () => {
      if (candidates.length === 0) {
        return reject(new Error("Aucun candidat valide trouvé dans le CSV."));
      }

      try {
        const inserted = [];
        for (const cand of candidates) {
          const categoryId = await resolveCategoryId(pollId, cand.category);
          const finalRealName = cand.real_name || cand.display_name;
          const { rows } = await pool.query(
            `INSERT INTO candidates
               (poll_id, category_id, display_name, real_name, cover_photo_url, biography, phone, email, payout_phone)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING candidate_id, display_name, position`,
            [pollId, categoryId, cand.display_name, finalRealName, cand.photo_url, cand.description, cand.phone, cand.email, cand.mobile_money]
          );
          inserted.push(rows[0]);
        }
        resolve(inserted);
      } catch (err) {
        reject(err);
      }
    });

    parser.write(csvContent);
    parser.end();
  });
}