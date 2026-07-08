-- =====================================================================
-- 14_auth_security.sql
-- Ajouts pour [AUTH] Vérification email post-inscription
-- =====================================================================
-- Dépend de : 02_auth_users.sql
-- Ajoute :
--   - users.failed_login_attempts, users.locked_until (verrouillage login)
--   - users.last_verification_sent_at (cooldown renvoi 60s)
--   - table email_verification_tokens (token unique, usage unique, 24h)
-- =====================================================================

BEGIN;

ALTER TABLE users
    ADD COLUMN failed_login_attempts     INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN locked_until              TIMESTAMPTZ,
    ADD COLUMN last_verification_sent_at TIMESTAMPTZ;

COMMENT ON COLUMN users.failed_login_attempts IS 'Remis à 0 après connexion réussie ou après déverrouillage.';
COMMENT ON COLUMN users.locked_until IS 'NULL = non verrouillé. Verrouillage posé après 5 échecs consécutifs.';

CREATE TABLE email_verification_tokens (
    token       TEXT PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    expires_at  TIMESTAMPTZ NOT NULL,
    used        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_verification_tokens_user ON email_verification_tokens(user_id);

COMMENT ON TABLE email_verification_tokens IS 'Un token = une utilisation. Tout token non utilisé est invalidé (supprimé) quand un nouveau est émis pour le même utilisateur.';

COMMIT;
