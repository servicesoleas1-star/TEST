import { listAcquisitionSources } from "../store/acquisitionSourcesStore.js";

/**
 * GET /api/acquisition-sources
 * Utilisé par le formulaire d'inscription ("Comment avez-vous connu Moledi
 * Events ?"). Ne fait jamais échouer la page appelante : en cas d'erreur,
 * renvoie une liste vide plutôt qu'un statut d'erreur.
 */
export async function getAcquisitionSources(req, res) {
  try {
    const sources = await listAcquisitionSources();
    return res.status(200).json({ ok: true, sources });
  } catch (err) {
    console.error("Acquisition sources fetch error:", err.message);
    return res.status(200).json({ ok: true, sources: [] });
  }
}
