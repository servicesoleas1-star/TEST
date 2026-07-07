import { getUserPreferences, updateUserPreferences } from "../store/userPreferencesStore.js";
import { findUserByEmail } from "../store/dashboardStore.js";

async function resolveUser(req, res) {
  const email = req.body.email || req.query.email;
  if (!email) {
    res.status(400).json({ error: "Session invalide." });
    return null;
  }
  const user = await findUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: "Session invalide." });
    return null;
  }
  return user;
}

// ---------------------------------------------------------------------------
// GET /api/user/preferences?email=
// Récupérer les préférences de l'utilisateur
// ---------------------------------------------------------------------------
export async function getPreferencesHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  try {
    const prefs = await getUserPreferences(user.user_id);
    return res.status(200).json(prefs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// POST /api/user/preferences
// Mettre à jour les préférences de l'utilisateur
// Body: { email, language, notification_campaign_email, ... }
// ---------------------------------------------------------------------------
export async function updatePreferencesHandler(req, res) {
  const user = await resolveUser(req, res);
  if (!user) return;

  try {
    const updated = await updateUserPreferences(user.user_id, req.body);
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}