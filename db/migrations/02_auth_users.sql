-- =====================================================================
-- 02_auth_users.sql
-- DC-02 — Authentication & Users (MVP)
-- =====================================================================
-- Dépend de : 00_extensions_and_enums.sql, 01_identity_session.sql
-- Tables : users, user_preferences, user_sessions, tokens, two_fa,
--          login_logs, admin_permissions, acquisition_sources, influencers
-- =====================================================================
-- Note : User joue à la fois le rôle d'Organisateur, Admin et Super Admin
-- (pas de table séparée — distinction via la colonne "role").
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- AcquisitionSource : d'où vient l'utilisateur (créée avant User car
-- User.acquisition_source_id la référence)
-- ---------------------------------------------------------------------
CREATE TABLE acquisition_sources (
    source_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    type        source_type NOT NULL,
    url         TEXT,
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- User : entité centrale — Organisateur, Admin ou Super Admin
-- ---------------------------------------------------------------------
CREATE TABLE users (
    user_id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role                  user_role NOT NULL,
    full_name             TEXT NOT NULL,
    email                 CITEXT NOT NULL UNIQUE,
    email_verified        BOOLEAN NOT NULL DEFAULT FALSE,
    phone                 TEXT,
    phone_country_code    TEXT,
    password_hash         TEXT,
    avatar_url            TEXT,
    status                user_status NOT NULL DEFAULT 'ACTIVE',
    acquisition_source_id UUID REFERENCES acquisition_sources(source_id),
    linked_visitor_id     UUID REFERENCES visitors(visitor_id),
    payout_phone          TEXT,
    payout_operator       TEXT,
    payout_phone_history  TEXT[] NOT NULL DEFAULT '{}',
    pseudonymised         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at            TIMESTAMPTZ
);
COMMENT ON TABLE users IS 'role=ORGANIZER -> peut créer des campagnes. role=ADMIN -> accès back-office. role=SUPER_ADMIN -> contrôle total. Pas de table Organizer séparée.';
COMMENT ON COLUMN users.payout_phone_history IS 'Conserve les anciens numéros de paiement pour piste d''audit anti-fraude.';
COMMENT ON COLUMN users.pseudonymised IS 'Passe à TRUE après suppression de compte (anonymisation RGPD au lieu d''effacement physique).';

-- Index unique partiel : l'email doit être unique uniquement parmi les comptes
-- non supprimés, pour permettre la ré-inscription après pseudonymisation.
-- (l'UNIQUE ci-dessus reste la garde-fou général ; affiné en migration 13 si besoin)

-- ---------------------------------------------------------------------
-- UserPreferences : 1-1 avec User
-- ---------------------------------------------------------------------
CREATE TABLE user_preferences (
    user_id                     UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    preferred_event_types       TEXT[] NOT NULL DEFAULT '{}',
    organization_frequency      TEXT,
    activity_country            TEXT,
    language                    language_code NOT NULL DEFAULT 'FR',
    notif_email_validation      BOOLEAN NOT NULL DEFAULT TRUE,
    notif_email_rejection       BOOLEAN NOT NULL DEFAULT TRUE,
    notif_email_payment         BOOLEAN NOT NULL DEFAULT TRUE,
    notif_email_payout          BOOLEAN NOT NULL DEFAULT TRUE,
    notif_email_ticket          BOOLEAN NOT NULL DEFAULT TRUE,
    notif_whatsapp_validation   BOOLEAN NOT NULL DEFAULT FALSE,
    notif_whatsapp_payment      BOOLEAN NOT NULL DEFAULT FALSE,
    notif_whatsapp_payout       BOOLEAN NOT NULL DEFAULT FALSE,
    newsletter_frequency        newsletter_freq NOT NULL DEFAULT 'WEEKLY'
);

-- ---------------------------------------------------------------------
-- UserSession : sessions JWT actives
-- ---------------------------------------------------------------------
CREATE TABLE user_sessions (
    session_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    access_token   TEXT NOT NULL,
    refresh_token  TEXT NOT NULL,
    ip             TEXT,
    browser        TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at     TIMESTAMPTZ NOT NULL,
    invalidated    BOOLEAN NOT NULL DEFAULT FALSE
);

-- ---------------------------------------------------------------------
-- Token : table unique pour tous les liens/tokens à usage unique
-- ---------------------------------------------------------------------
CREATE TABLE tokens (
    token_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    value       TEXT NOT NULL UNIQUE,
    type        token_type NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    used        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE tokens IS 'Table unique pour tous les liens à usage unique : vérif email (24h), reset mdp (1h), invitation jury, invitation admin, OTP 2FA.';

-- ---------------------------------------------------------------------
-- TwoFA : 1-1 avec User (optionnel)
-- ---------------------------------------------------------------------
CREATE TABLE two_fa (
    user_id        UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    type           two_fa_type NOT NULL,
    totp_secret    TEXT,                       -- chiffré applicativement avant stockage
    active         BOOLEAN NOT NULL DEFAULT FALSE,
    activated_at   TIMESTAMPTZ
);

-- ---------------------------------------------------------------------
-- LoginLog : historique des tentatives de connexion
-- ---------------------------------------------------------------------
CREATE TABLE login_logs (
    log_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    ip               TEXT,
    browser          TEXT,
    success          BOOLEAN NOT NULL,
    failed_attempts  INTEGER NOT NULL DEFAULT 0,
    blocked_until    TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- AdminPermission : 1-1 avec User, uniquement pour ADMIN / SUPER_ADMIN
-- ---------------------------------------------------------------------
CREATE TABLE admin_permissions (
    user_id                     UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    view_events                 BOOLEAN NOT NULL DEFAULT FALSE,
    edit_events                 BOOLEAN NOT NULL DEFAULT FALSE,
    view_users                  BOOLEAN NOT NULL DEFAULT FALSE,
    manage_users                BOOLEAN NOT NULL DEFAULT FALSE,
    view_finances               BOOLEAN NOT NULL DEFAULT FALSE,
    manage_finances             BOOLEAN NOT NULL DEFAULT FALSE,
    view_tickets                BOOLEAN NOT NULL DEFAULT FALSE,
    reply_tickets               BOOLEAN NOT NULL DEFAULT FALSE,
    mass_communication          BOOLEAN NOT NULL DEFAULT FALSE,
    manage_pricing              BOOLEAN NOT NULL DEFAULT FALSE,
    manage_aggregators          BOOLEAN NOT NULL DEFAULT FALSE,
    feature_flags               BOOLEAN NOT NULL DEFAULT FALSE,
    global_payout_block         BOOLEAN NOT NULL DEFAULT FALSE,
    configure_payment_countries BOOLEAN NOT NULL DEFAULT FALSE
);
COMMENT ON TABLE admin_permissions IS 'Réservé aux users avec role ADMIN ou SUPER_ADMIN. feature_flags, global_payout_block et configure_payment_countries sont normalement réservés au SUPER_ADMIN au niveau applicatif.';

-- ---------------------------------------------------------------------
-- Influencer : sous-type d'AcquisitionSource (type = INFLUENCER)
-- ---------------------------------------------------------------------
CREATE TABLE influencers (
    influencer_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id          UUID NOT NULL REFERENCES acquisition_sources(source_id) ON DELETE CASCADE,
    name               TEXT NOT NULL,
    photo_url          TEXT,
    platform           TEXT NOT NULL,
    followers_count    INTEGER,
    notes              TEXT,
    active             BOOLEAN NOT NULL DEFAULT TRUE,
    users_referred     INTEGER NOT NULL DEFAULT 0,
    revenue_generated  NUMERIC(14,2) NOT NULL DEFAULT 0
);
COMMENT ON TABLE influencers IS 'Permet à l''admin de suivre les parrainages par personne, même si la source d''acquisition est partagée.';

COMMIT;
