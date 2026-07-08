import { upsertPreferences } from "../store/pgStore.js";

/**
 * POST /api/profile/preferences
 * Body: { email, eventTypes: string[], frequency: string, country: string }
 *
 * Accessible aussi bien après vérification email que juste après une
 * connexion Google (même page, même endpoint — voir critère "présentée
 * aussi après connexion Google").
 *
 * Le bouton "Passer cette étape" ne doit PAS appeler cet endpoint : il
 * redirige directement sans enregistrer de préférences (voir frontend).
 */
export async function savePreferences(req, res) {
  const { email, eventTypes, frequency, country } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Session invalide, veuillez vous reconnecter." });
  }

  const result = await upsertPreferences(email, { eventTypes, frequency, country });

  if (!result) {
    return res.status(400).json({ error: "Session invalide, veuillez vous reconnecter." });
  }

  return res.status(200).json({ success: true, redirect_to: "/dashboard" });
}
