-- =====================================================================
-- 08_design_customization.sql
-- DC-07 — Design & Customization (V2)
-- =====================================================================
-- Dépend de : 02 (users), 03 (campaigns)
-- Tables : page_configs, blocks, brand_settings, custom_domains,
--          design_templates, ticket_designs, ia_credits, ia_generations,
--          ia_credit_packs
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- PageConfig : configuration visuelle d'une page de campagne
-- ---------------------------------------------------------------------
CREATE TABLE page_configs (
    config_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id    UUID NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    campaign_type  campaign_type NOT NULL,
    blocks         JSONB,
    version        INTEGER NOT NULL DEFAULT 1,
    published      BOOLEAN NOT NULL DEFAULT FALSE,
    saved_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at   TIMESTAMPTZ
);
COMMENT ON COLUMN page_configs.campaign_type IS 'Dénormalisé depuis campaigns.campaign_type (lecture rapide sans jointure). Cohérence vérifiée par trigger trg_check_campaign_type (voir 12_cross_fk_patch.sql).';
COMMENT ON COLUMN page_configs.version IS 'Incrémenté à chaque sauvegarde. published=true rend la version courante visible publiquement. Auto-save toutes les 30s côté client.';

-- ---------------------------------------------------------------------
-- Block : élément de mise en page au sein d'un PageConfig
-- ---------------------------------------------------------------------
CREATE TABLE blocks (
    block_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id         UUID NOT NULL REFERENCES page_configs(config_id) ON DELETE CASCADE,
    type              block_type NOT NULL,
    position          INTEGER NOT NULL DEFAULT 0,
    content           JSONB,
    style             JSONB,
    visible_mobile    BOOLEAN NOT NULL DEFAULT TRUE,
    visible_desktop   BOOLEAN NOT NULL DEFAULT TRUE
);
COMMENT ON COLUMN blocks.content IS 'Structure variable selon "type" : BANNER -> {image_url,title,subtitle}, VIDEO -> {url,autoplay,muted}, CTA_BUTTON -> {label,url,color}, etc.';

-- ---------------------------------------------------------------------
-- BrandSettings : identité visuelle (0..1 par campagne)
-- ---------------------------------------------------------------------
CREATE TABLE brand_settings (
    brand_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id       UUID NOT NULL UNIQUE REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    primary_color     TEXT NOT NULL,
    secondary_color   TEXT NOT NULL,
    accent_color      TEXT NOT NULL,
    logo_url          TEXT,
    heading_font      TEXT NOT NULL,
    body_font         TEXT NOT NULL,
    favicon_url       TEXT
);

-- ---------------------------------------------------------------------
-- CustomDomain : domaine personnalisé (0..1 par campagne)
-- ---------------------------------------------------------------------
CREATE TABLE custom_domains (
    domain_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id   UUID NOT NULL UNIQUE REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    domain_name   TEXT NOT NULL UNIQUE,
    cname_target  TEXT NOT NULL,
    dns_status    dns_status NOT NULL DEFAULT 'PENDING',
    ssl_active    BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at   TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE custom_domains IS 'Organisateur configure un CNAME sur son DNS. Vérification toutes les 30 min. SSL provisionné automatiquement après vérification DNS.';

-- ---------------------------------------------------------------------
-- DesignTemplate : modèle réutilisable (catalogue, pas lié à 1 campagne)
-- ---------------------------------------------------------------------
CREATE TABLE design_templates (
    template_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name           TEXT NOT NULL,
    campaign_type  campaign_type NOT NULL,
    preview_url    TEXT NOT NULL,
    config_json    JSONB NOT NULL,
    credit_cost    INTEGER NOT NULL DEFAULT 0,
    active         BOOLEAN NOT NULL DEFAULT TRUE
);

-- ---------------------------------------------------------------------
-- TicketDesign : mise en page du billet PDF (1 par Event)
-- ---------------------------------------------------------------------
CREATE TABLE ticket_designs (
    design_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id     UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    elements     JSONB NOT NULL,
    preview_url  TEXT,
    active       BOOLEAN NOT NULL DEFAULT TRUE
);
COMMENT ON COLUMN ticket_designs.elements IS 'Positions drag-and-drop pour : QR code, nom acheteur, titre événement, date, lieu, logo, image de fond.';

-- ---------------------------------------------------------------------
-- IACredit : solde de crédits IA d'un organisateur (1-1 avec User)
-- ---------------------------------------------------------------------
CREATE TABLE ia_credits (
    credit_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    balance               INTEGER NOT NULL DEFAULT 500,
    initial_free_credits  INTEGER NOT NULL DEFAULT 500,
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE ia_credits IS '500 crédits gratuits offerts à l''inscription. 1 génération IA standard = 1000 crédits.';

-- ---------------------------------------------------------------------
-- IAGeneration : historique des appels à l'IA (journal de consommation)
-- ---------------------------------------------------------------------
CREATE TABLE ia_generations (
    generation_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(user_id),
    campaign_id       UUID NOT NULL REFERENCES campaigns(campaign_id),
    prompt            TEXT NOT NULL,
    generated_config  JSONB,
    credits_used      INTEGER NOT NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- IACreditPack : pack de crédits achetable
-- ---------------------------------------------------------------------
CREATE TABLE ia_credit_packs (
    pack_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    nb_credits  INTEGER NOT NULL,
    price       NUMERIC(14,2) NOT NULL,
    active      BOOLEAN NOT NULL DEFAULT TRUE
);
COMMENT ON TABLE ia_credit_packs IS 'Crédits non utilisés n''expirent jamais. Achetés via le système de paiement standard.';

COMMIT;
