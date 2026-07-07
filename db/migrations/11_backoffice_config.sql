-- =====================================================================
-- 11_backoffice_config.sql
-- DC-10 — Back-office & Global Config (MVP)
-- =====================================================================
-- Dépend de : 02 (users)
-- Tables : site_configs, global_faqs, feature_flags, maintenance_modes,
--          kpi_snapshots, canned_replies, system_email_templates,
--          legal_pages, language_configs
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- SiteConfig : paramètres globaux du site (singleton applicatif)
-- ---------------------------------------------------------------------
CREATE TABLE site_configs (
    config_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_email         CITEXT NOT NULL,
    admin_email           CITEXT NOT NULL,
    support_phone         TEXT NOT NULL,
    whatsapp_support      TEXT NOT NULL,
    social_links          JSONB,
    response_time_label   TEXT,
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE site_configs IS 'Singleton applicatif : une seule ligne attendue en pratique (non forcé par contrainte SQL, contrôlé côté application).';

-- ---------------------------------------------------------------------
-- GlobalFAQ
-- ---------------------------------------------------------------------
CREATE TABLE global_faqs (
    faq_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type      faq_type NOT NULL,
    question  TEXT NOT NULL,
    answer    TEXT NOT NULL,
    position  INTEGER NOT NULL DEFAULT 0,
    active    BOOLEAN NOT NULL DEFAULT TRUE
);

-- ---------------------------------------------------------------------
-- FeatureFlag : activation de fonctionnalités sans déploiement
-- ---------------------------------------------------------------------
CREATE TABLE feature_flags (
    flag_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT NOT NULL UNIQUE,
    description  TEXT,
    active       BOOLEAN NOT NULL DEFAULT FALSE,
    modified_by  UUID NOT NULL REFERENCES users(user_id),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE feature_flags IS 'Exemples : enable_crowdfunding (rollout V2), maintenance_mode (urgence), enable_ai_generation (bêta V4). Seul le Super Admin peut basculer un flag.';

-- ---------------------------------------------------------------------
-- MaintenanceMode : mode maintenance global
-- ---------------------------------------------------------------------
CREATE TABLE maintenance_modes (
    mode_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    active         BOOLEAN NOT NULL DEFAULT FALSE,
    message        TEXT,
    eta_return     TIMESTAMPTZ,
    activated_by   UUID NOT NULL REFERENCES users(user_id),
    activated_at   TIMESTAMPTZ
);
COMMENT ON TABLE maintenance_modes IS 'active=true redirige TOUTES les pages publiques vers un écran de maintenance affichant eta_return. Basculé par Super Admin uniquement.';

-- ---------------------------------------------------------------------
-- KPISnapshot : métriques calculées périodiquement (pas en temps réel)
-- ---------------------------------------------------------------------
CREATE TABLE kpi_snapshots (
    kpi_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type          kpi_type NOT NULL,
    value         NUMERIC(18,4) NOT NULL,
    period        TEXT NOT NULL,
    computed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE kpi_snapshots IS 'Le dashboard analytics admin lit ces snapshots au lieu d''exécuter des requêtes coûteuses sur la base primaire. Calculé via la Read Replica.';

-- ---------------------------------------------------------------------
-- CannedReply : réponse pré-rédigée pour le support
-- ---------------------------------------------------------------------
CREATE TABLE canned_replies (
    reply_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject    ticket_subject NOT NULL,
    title      TEXT NOT NULL,
    content    TEXT NOT NULL,
    active     BOOLEAN NOT NULL DEFAULT TRUE
);

-- ---------------------------------------------------------------------
-- SystemEmailTemplate
-- ---------------------------------------------------------------------
CREATE TABLE system_email_templates (
    template_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type         TEXT NOT NULL UNIQUE,
    subject      TEXT NOT NULL,
    body_html    TEXT NOT NULL,
    variables    TEXT[] NOT NULL DEFAULT '{}',
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON COLUMN system_email_templates.type IS 'Exemples : email_verification, payment_confirmed, payout_completed, ticket_received, jury_invitation, admin_message.';
COMMENT ON COLUMN system_email_templates.variables IS 'Liste de placeholders {{nom}} disponibles dans le template, éditables depuis le panneau admin.';

-- ---------------------------------------------------------------------
-- LegalPage
-- ---------------------------------------------------------------------
CREATE TABLE legal_pages (
    page_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type        legal_type NOT NULL UNIQUE,
    content     TEXT NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by  UUID NOT NULL REFERENCES users(user_id)
);
COMMENT ON COLUMN legal_pages.type IS 'TERMS -> /terms, SALES_TERMS -> /cgv, LEGAL_NOTICE -> /mentions-legales, COOKIES -> /cookies, PRIVACY -> /privacy.';

-- ---------------------------------------------------------------------
-- LanguageConfig
-- ---------------------------------------------------------------------
CREATE TABLE language_configs (
    language_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code         language_code NOT NULL UNIQUE,
    active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_default   BOOLEAN NOT NULL DEFAULT FALSE
);

COMMIT;
