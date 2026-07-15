import { listActiveFAQ } from "../store/faqStore.js";

/**
 * GET /api/faq
 * Toutes les entrées FAQ actives, tous types confondus (voir HowItWorksPage
 * côté frontend qui filtre ensuite par type). Ne fait jamais échouer la
 * page appelante : en cas d'erreur, renvoie une liste vide.
 */
export async function getFAQ(req, res) {
  try {
    const faqs = await listActiveFAQ();
    return res.status(200).json({ ok: true, faqs });
  } catch (err) {
    console.error("FAQ fetch error:", err.message);
    return res.status(200).json({ ok: true, faqs: [] });
  }
}
