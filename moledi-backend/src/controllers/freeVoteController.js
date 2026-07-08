import {
  findFreePollBySlug,
  findCandidate,
  countVisitorVotesOnPoll,
  ensureVisitorExists,
  createFreeVote,
} from "../store/freeVoteStore.js";

/**
 * POST /api/votes/free/submit
 * Body: { pollSlug, candidateId, visitorId }
 *
 * Vote gratuit, sans compte requis (vote_type = FREE_VISITOR_ID). Aucune
 * étape de paiement : le vote est comptabilisé immédiatement. L'anti-doublon
 * repose sur max_votes_per_visitor (configuré par l'organisateur) et le
 * Visitor ID permanent — voir critère "méthode anti-doublon configurable".
 */
export async function submitFreeVote(req, res) {
  const { pollSlug, candidateId, visitorId } = req.body;

  if (!visitorId) {
    return res.status(400).json({ error: "Visiteur non identifié." });
  }
  if (!candidateId) {
    return res.status(400).json({ error: "Aucun candidat sélectionné." });
  }

  const poll = await findFreePollBySlug(pollSlug);
  if (!poll) {
    return res.status(404).json({ error: "Scrutin introuvable." });
  }
  if (poll.vote_type !== "FREE_VISITOR_ID") {
    return res.status(400).json({ error: "Ce scrutin ne propose pas de vote gratuit direct." });
  }

  const candidate = await findCandidate(poll.poll_id, candidateId);
  if (!candidate) {
    return res.status(404).json({ error: "Candidat introuvable." });
  }

  // --- Anti-doublon : vérifie la limite AVANT d'insérer, de façon
  // atomique autant que possible (fenêtre de course résiduelle traitée
  // en V1 par une contrainte SQL dédiée si le produit l'exige). ---
  const currentCount = await countVisitorVotesOnPoll(poll.poll_id, visitorId);
  const maxVotes = poll.max_votes_per_visitor;

  if (maxVotes && currentCount >= maxVotes) {
    return res.status(429).json({
      error: `Vous avez déjà utilisé vos ${maxVotes} vote${maxVotes > 1 ? "s" : ""} gratuit${maxVotes > 1 ? "s" : ""} sur ce scrutin.`,
      votes_used: currentCount,
      max_votes: maxVotes,
    });
  }

  await ensureVisitorExists(visitorId);

  const vote = await createFreeVote(poll.poll_id, candidateId, visitorId, null);

  return res.status(201).json({
    success: true,
    vote_id: vote.vote_id,
    candidate_name: candidate.display_name,
    votes_used: currentCount + 1,
    max_votes: maxVotes,
    votes_remaining: maxVotes ? maxVotes - (currentCount + 1) : null,
  });
}
