import { getPollHome, listPollCandidates, getCandidateById } from "../store/pollPublicStore.js";

/**
 * GET /api/polls/:slug
 * Données publiques de la page d'accueil du scrutin.
 */
export async function getHome(req, res) {
  const poll = await getPollHome(req.params.slug);
  if (!poll) {
    return res.status(404).json({ error: "Scrutin introuvable." });
  }
  return res.status(200).json(poll);
}

/**
 * GET /api/polls/:slug/candidates
 * Liste classée des candidats -- résout d'abord le poll_id depuis le slug
 * (les candidats sont indexés par poll_id, pas par slug).
 */
export async function getCandidates(req, res) {
  const poll = await getPollHome(req.params.slug);
  if (!poll) {
    return res.status(404).json({ error: "Scrutin introuvable." });
  }
  const candidates = await listPollCandidates(poll.poll_id);
  return res.status(200).json({ candidates });
}

/**
 * GET /api/candidates/:candidateId
 */
export async function getCandidate(req, res) {
  const candidate = await getCandidateById(req.params.candidateId);
  if (!candidate) {
    return res.status(404).json({ error: "Candidat introuvable." });
  }
  return res.status(200).json(candidate);
}
