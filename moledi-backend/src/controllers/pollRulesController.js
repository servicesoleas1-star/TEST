import { getPollRules } from "../store/pollRulesStore.js";

/**
 * GET /api/polls/:slug/rules
 * Renvoie les règles publiques d'un scrutin (prix, max votes, méthode de
 * vérification, période, politique de visibilité, anti-doublon, contact
 * support). Ne contient JAMAIS de score/classement — voir critère
 * d'acceptation "scores masqués non inclus dans la réponse API".
 */
export async function getRules(req, res) {
  const { slug } = req.params;

  const rules = await getPollRules(slug);

  if (!rules) {
    return res.status(404).json({ error: "Scrutin introuvable." });
  }

  return res.status(200).json(rules);
}
