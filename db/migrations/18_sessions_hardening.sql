-- =====================================================================
-- 18_sessions_hardening.sql
-- Durcissement du système de session utilisateur (voir DC-02) :
--   - login_logs.device_name : nom d'appareil déduit du User-Agent,
--     affiché dans le journal de connexion (paramètres du compte).
--   - Index uniques sur user_sessions.access_token / refresh_token :
--     ces colonnes sont désormais utilisées comme clé de recherche à
--     chaque requête authentifiée (cf. middleware requireAuth côté
--     backend) — un lookup sans index dégraderait toutes les routes
--     protégées au fur et à mesure que la table grossit.
-- =====================================================================
-- Dépend de : 02_auth_users.sql
-- =====================================================================

BEGIN;

ALTER TABLE login_logs
    ADD COLUMN device_name TEXT;

COMMENT ON COLUMN login_logs.device_name IS 'Nom d''appareil lisible déduit du User-Agent (ex: "Chrome sur Windows", "Safari sur iPhone").';

CREATE UNIQUE INDEX idx_user_sessions_access_token ON user_sessions(access_token);
CREATE UNIQUE INDEX idx_user_sessions_refresh_token ON user_sessions(refresh_token);

COMMIT;
