// ---------------------------------------------------------------------------
// Store en mémoire — UNIQUEMENT pour faire tourner ce squelette sans base
// connectée. À remplacer par de vraies requêtes PostgreSQL vers les tables
// du schéma déjà livré dans db/migrations/ (users, et une table de tokens
// à ajouter si elle n'existe pas encore — voir note en bas de fichier).
//
// Toutes les fonctions ci-dessous sont async pour que le remplacement par de
// vraies requêtes SQL (pg) ne change pas la signature des appelants.
// ---------------------------------------------------------------------------

const users = new Map(); // email -> { id, email, password_hash, email_verified, ... }
const verificationTokens = new Map(); // token -> { email, expiresAt, used }
const lastResendAt = new Map(); // email -> timestamp ms
const loginAttempts = new Map(); // email -> { count, lockedUntil }

// --- Seed de démonstration : un compte non vérifié pour tester le flux ------
users.set("demo@moledievents.com", {
  id: "demo-user-1",
  email: "demo@moledievents.com",
  password_hash: null, // renseigné après inscription réelle
  email_verified: false,
});

export async function findUserByEmail(email) {
  return users.get(email) || null;
}

export async function createUser({ email, passwordHash }) {
  const user = {
    id: `user-${Date.now()}`,
    email,
    password_hash: passwordHash,
    email_verified: false,
  };
  users.set(email, user);
  return user;
}

export async function markEmailVerified(email) {
  const user = users.get(email);
  if (!user) return null;
  user.email_verified = true;
  return user;
}

export async function saveVerificationToken(token, email, ttlHours) {
  verificationTokens.set(token, {
    email,
    expiresAt: Date.now() + ttlHours * 60 * 60 * 1000,
    used: false,
  });
}

export async function getVerificationToken(token) {
  return verificationTokens.get(token) || null;
}

export async function markTokenUsed(token) {
  const entry = verificationTokens.get(token);
  if (entry) entry.used = true;
}

export async function invalidateTokensForEmail(email) {
  for (const [token, entry] of verificationTokens.entries()) {
    if (entry.email === email && !entry.used) {
      verificationTokens.delete(token);
    }
  }
}

export async function getLastResendAt(email) {
  return lastResendAt.get(email) || 0;
}

export async function setLastResendAt(email, timestamp) {
  lastResendAt.set(email, timestamp);
}

export async function getLoginAttempts(email) {
  return loginAttempts.get(email) || { count: 0, lockedUntil: 0 };
}

export async function registerFailedLogin(email, maxAttempts, lockoutMinutes) {
  const current = loginAttempts.get(email) || { count: 0, lockedUntil: 0 };
  current.count += 1;
  if (current.count >= maxAttempts) {
    current.lockedUntil = Date.now() + lockoutMinutes * 60 * 1000;
    current.count = 0; // on repart de zéro après verrouillage
  }
  loginAttempts.set(email, current);
  return current;
}

export async function resetLoginAttempts(email) {
  loginAttempts.delete(email);
}

// ---------------------------------------------------------------------------
// NOTE POUR L'INTÉGRATION POSTGRESQL RÉELLE :
// Ajouter une table `email_verification_tokens` si elle n'existe pas déjà
// dans db/migrations/01_identity_session.sql ou 02_auth_users.sql :
//
//   CREATE TABLE email_verification_tokens (
//     token         TEXT PRIMARY KEY,
//     user_id       UUID NOT NULL REFERENCES users(user_id),
//     expires_at    TIMESTAMPTZ NOT NULL,
//     used          BOOLEAN NOT NULL DEFAULT FALSE,
//     created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
//   );
//
// Et un compteur de tentatives de connexion sur users (déjà des candidats
// naturels : failed_login_attempts INT, locked_until TIMESTAMPTZ).
// ---------------------------------------------------------------------------
