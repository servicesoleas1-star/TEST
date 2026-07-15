import { listCountries } from "../store/countriesStore.js";

/**
 * GET /api/countries
 * Renvoie la liste des pays actifs pour les sections de couverture
 * publiques. Ne fait jamais échouer la page appelante : en cas d'erreur,
 * renvoie une liste vide plutôt qu'un statut d'erreur.
 */
export async function getCountries(req, res) {
  try {
    const countries = await listCountries();
    return res.status(200).json({ ok: true, countries });
  } catch (err) {
    console.error("Countries fetch error:", err.message);
    return res.status(200).json({ ok: true, countries: [] });
  }
}
