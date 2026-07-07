-- =====================================================================
-- 01_identity_session.sql
-- DC-01 — Identity & Session (MVP)
-- =====================================================================
-- Dépend de : 00_extensions_and_enums.sql
-- Tables : visitors, public_sessions, public_actions, gdpr_consents,
--          rate_limits
-- =====================================================================
-- Note de conception : Visitor.account_id référence users(user_id),
-- mais la table users n'existe pas encore à ce stade (créée en 02).
-- On crée donc la colonne ici SANS contrainte FK, et on l'ajoute dans
-- 12_cross_fk_patch.sql une fois "users" disponible.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- Visitor : identité anonyme posée via cookie permanent dès la 1ère visite
-- ---------------------------------------------------------------------
CREATE TABLE visitors (
    visitor_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    browser            TEXT,
    os                 TEXT,
    language           TEXT,
    screen_resolution  TEXT,
    ip_hashed          TEXT NOT NULL,
    account_id         UUID,                       -- FK -> users(user_id), ajoutée plus tard
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE visitors IS 'Identité anonyme. account_id reste NULL jusqu''à authentification ; une fois lié, ne change plus (permet de retrouver l''historique des actions après création de compte).';

-- ---------------------------------------------------------------------
-- PublicSession : suivi technique d'une session de navigation
-- ---------------------------------------------------------------------
CREATE TABLE public_sessions (
    session_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id   UUID NOT NULL REFERENCES visitors(visitor_id) ON DELETE CASCADE,
    ip_hashed    TEXT NOT NULL,
    user_agent   TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- PublicAction : trace de toute action publique (vote, achat, don...)
-- ---------------------------------------------------------------------
CREATE TABLE public_actions (
    action_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id       UUID NOT NULL REFERENCES visitors(visitor_id) ON DELETE CASCADE,
    type             action_type NOT NULL,
    entity_id        UUID NOT NULL,
    entity_type      TEXT NOT NULL,
    status           action_status NOT NULL DEFAULT 'PENDING',
    idempotency_key  TEXT NOT NULL UNIQUE,
    short_id         VARCHAR(8) NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON COLUMN public_actions.idempotency_key IS 'Empêche tout double traitement sur double-clic ou retry réseau.';
COMMENT ON COLUMN public_actions.short_id IS 'Identifiant court (ex: X4K9P2QR) affiché sur les écrans de confirmation.';

-- ---------------------------------------------------------------------
-- GDPRConsent : consentement RGPD / loi camerounaise sur les données
-- ---------------------------------------------------------------------
CREATE TABLE gdpr_consents (
    consent_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id      UUID NOT NULL REFERENCES visitors(visitor_id) ON DELETE CASCADE,
    accepted        BOOLEAN NOT NULL,
    "timestamp"     TIMESTAMPTZ NOT NULL DEFAULT now(),
    policy_version  TEXT NOT NULL,
    ip_hashed       TEXT NOT NULL
);

-- ---------------------------------------------------------------------
-- RateLimit : limitation anti-abus, clé composite ip+visitor+type
-- ---------------------------------------------------------------------
CREATE TABLE rate_limits (
    ip_hashed     TEXT NOT NULL,
    visitor_id    UUID NOT NULL REFERENCES visitors(visitor_id) ON DELETE CASCADE,
    action_type   action_type NOT NULL,
    counter       INTEGER NOT NULL DEFAULT 0,
    window_start  TIMESTAMPTZ NOT NULL DEFAULT now(),
    blocked_until TIMESTAMPTZ,
    PRIMARY KEY (ip_hashed, visitor_id, action_type)
);
COMMENT ON TABLE rate_limits IS 'Seuils configurables par type d''action depuis le panneau admin. blocked_until est NULL quand non bloqué.';

COMMIT;
