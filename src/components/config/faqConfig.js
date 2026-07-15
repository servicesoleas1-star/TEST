// config/faqConfig.js
//
// Charge la FAQ globale depuis le backend (table réelle global_faqs,
// db/migrations/11_backoffice_config.sql) — modifiable depuis le
// back-office (GET /api/faq), plus un mock local.
//
// Sur la page "Comment ça marche" :
// - type = HOW_IT_WORKS  -> la FAQ générale (critère d'acceptation
//   "FAQ générale modifiable depuis l'admin")
// - type = {X}_TEMPLATE  -> la FAQ spécifique à chaque bloc de type
//   d'événement (critère "chaque type d'événement a sa propre section FAQ")

/**
 * Récupère toutes les entrées FAQ actives (tous types confondus) en un seul
 * appel — les pages appelantes filtrent ensuite par type localement avec
 * getGlobalFAQ(), pour éviter une requête HTTP par bloc de type d'événement.
 *
 * @returns {Promise<Array<{faq_id: string, type: string, question: string, answer: string, position: number}>>}
 */
export async function fetchAllFAQ() {
  try {
    const res = await fetch('/api/faq');
    if (!res.ok) return [];
    const data = await res.json();
    return data.faqs || [];
  } catch {
    return [];
  }
}

/**
 * Filtre une liste déjà chargée (voir fetchAllFAQ) pour un type donné, triée
 * par position.
 *
 * @param {Array} allFaqs - résultat de fetchAllFAQ()
 * @param {string} type - ex. 'HOW_IT_WORKS', 'POLL_TEMPLATE'
 * @returns {Array<{faq_id: string, question: string, answer: string}>}
 */
export function getGlobalFAQ(allFaqs, type) {
  return allFaqs.filter((faq) => faq.type === type).sort((a, b) => a.position - b.position);
}
