-- =====================================================================
-- 06_donations_crowdfunding.sql
-- DC-05 — Donations & Crowdfunding (V2)
-- =====================================================================
-- Dépend de : 01 (visitors), 02 (users), 03 (campaigns)
-- Tables : fundraisers, donations, fundraiser_comments,
--          fundraiser_updates, cf_projects, tiers, tier_options,
--          cf_contributions, cf_team_members, cf_updates, cf_questions,
--          cf_comments
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- Fundraiser : campagne de don simple — miroir 1-1 dans campaigns
-- ---------------------------------------------------------------------
CREATE TABLE fundraisers (
    fundraiser_id           UUID PRIMARY KEY,
    user_id                 UUID NOT NULL REFERENCES users(user_id),
    slug                    TEXT NOT NULL UNIQUE,
    title                   TEXT NOT NULL,
    description             TEXT,
    cover_photo_url         TEXT,
    additional_photos_urls  TEXT[] NOT NULL DEFAULT '{}',
    videos_urls             TEXT[],
    goal_amount             NUMERIC(14,2),
    collected_amount        NUMERIC(14,2) NOT NULL DEFAULT 0,
    donors_count            INTEGER NOT NULL DEFAULT 0,
    close_at                TIMESTAMPTZ,
    status                  fundraiser_status NOT NULL DEFAULT 'DRAFT',
    suggested_amounts       NUMERIC(14,2)[],
    minimum_amount          NUMERIC(14,2) NOT NULL DEFAULT 0,
    show_donors             BOOLEAN NOT NULL DEFAULT TRUE,
    show_amounts            BOOLEAN NOT NULL DEFAULT TRUE,
    show_latest_donation    BOOLEAN NOT NULL DEFAULT TRUE,
    comments_enabled        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_fundraisers_campaign FOREIGN KEY (fundraiser_id)
        REFERENCES campaigns(campaign_id) ON DELETE CASCADE
);
COMMENT ON COLUMN fundraisers.goal_amount IS 'Optionnel : une campagne peut collecter sans objectif cible.';

-- ---------------------------------------------------------------------
-- Donation
-- ---------------------------------------------------------------------
CREATE TABLE donations (
    donation_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fundraiser_id    UUID NOT NULL REFERENCES fundraisers(fundraiser_id) ON DELETE CASCADE,
    visitor_id       UUID NOT NULL REFERENCES visitors(visitor_id),
    user_id          UUID REFERENCES users(user_id),
    transaction_id   UUID NOT NULL,        -- FK -> transactions, ajoutée en 12
    amount           NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    donor_name       TEXT NOT NULL,
    email            CITEXT,
    anonymous        BOOLEAN NOT NULL DEFAULT FALSE,
    support_message  TEXT,
    receipt_channel  delivery_channel,
    status           donation_status NOT NULL DEFAULT 'PENDING',
    short_id         VARCHAR(8) NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- FundraiserComment
-- ---------------------------------------------------------------------
CREATE TABLE fundraiser_comments (
    comment_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fundraiser_id  UUID NOT NULL REFERENCES fundraisers(fundraiser_id) ON DELETE CASCADE,
    name           TEXT NOT NULL,
    message        TEXT NOT NULL,
    status         comment_status NOT NULL DEFAULT 'VISIBLE',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE fundraiser_comments IS 'status enum (VISIBLE/HIDDEN/DELETED) au lieu d''un simple booléen "deleted" : préserve la piste d''audit, aucune donnée n''est jamais effacée physiquement.';

-- ---------------------------------------------------------------------
-- FundraiserUpdate
-- ---------------------------------------------------------------------
CREATE TABLE fundraiser_updates (
    update_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fundraiser_id  UUID NOT NULL REFERENCES fundraisers(fundraiser_id) ON DELETE CASCADE,
    title          TEXT NOT NULL,
    body           TEXT NOT NULL,
    photos_urls    TEXT[] NOT NULL DEFAULT '{}',
    videos_urls    TEXT[],
    published_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- CFProject : campagne crowdfunding avec paliers — miroir 1-1 campaigns
-- ---------------------------------------------------------------------
CREATE TABLE cf_projects (
    project_id              UUID PRIMARY KEY,
    user_id                 UUID NOT NULL REFERENCES users(user_id),
    slug                    TEXT NOT NULL UNIQUE,
    title                   TEXT NOT NULL,
    description             TEXT,
    cover_photo_url         TEXT,
    additional_photos_urls  TEXT[] NOT NULL DEFAULT '{}',
    videos_urls             TEXT[],
    goal_amount             NUMERIC(14,2) NOT NULL,
    raised_amount           NUMERIC(14,2) NOT NULL DEFAULT 0,
    backers_count           INTEGER NOT NULL DEFAULT 0,
    deadline                TIMESTAMPTZ NOT NULL,
    status                  cf_status NOT NULL DEFAULT 'DRAFT',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_cf_projects_campaign FOREIGN KEY (project_id)
        REFERENCES campaigns(campaign_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Tier : palier de récompense
-- ---------------------------------------------------------------------
CREATE TABLE tiers (
    tier_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id     UUID NOT NULL REFERENCES cf_projects(project_id) ON DELETE CASCADE,
    name           TEXT NOT NULL,
    min_amount     NUMERIC(14,2) NOT NULL,
    description    TEXT,
    quota_max      INTEGER,
    backers_count  INTEGER NOT NULL DEFAULT 0,
    active         BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_tiers_quota CHECK (quota_max IS NULL OR backers_count <= quota_max)
);

-- ---------------------------------------------------------------------
-- TierOption : variantes au sein d'un palier (taille, couleur...)
-- ---------------------------------------------------------------------
CREATE TABLE tier_options (
    option_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_id            UUID NOT NULL REFERENCES tiers(tier_id) ON DELETE CASCADE,
    label              TEXT NOT NULL,
    available_values   TEXT[] NOT NULL DEFAULT '{}'
);

-- ---------------------------------------------------------------------
-- CFContribution
-- ---------------------------------------------------------------------
CREATE TABLE cf_contributions (
    contribution_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id        UUID NOT NULL REFERENCES cf_projects(project_id) ON DELETE CASCADE,
    tier_id           UUID REFERENCES tiers(tier_id),
    visitor_id        UUID NOT NULL REFERENCES visitors(visitor_id),
    user_id           UUID REFERENCES users(user_id),
    transaction_id    UUID NOT NULL,      -- FK -> transactions, ajoutée en 12
    amount            NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    contributor_name  TEXT NOT NULL,
    email             CITEXT NOT NULL,
    country           TEXT NOT NULL,
    chosen_options    JSONB,
    message           TEXT,
    status            contrib_status NOT NULL DEFAULT 'PENDING',
    short_id          VARCHAR(8) NOT NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON COLUMN cf_contributions.tier_id IS 'Nullable : un contributeur peut donner librement sans choisir de palier.';

-- ---------------------------------------------------------------------
-- CFTeamMember
-- ---------------------------------------------------------------------
CREATE TABLE cf_team_members (
    member_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id         UUID NOT NULL REFERENCES cf_projects(project_id) ON DELETE CASCADE,
    name               TEXT NOT NULL,
    role               TEXT NOT NULL,
    bio                TEXT,
    photo_url          TEXT,
    other_photos_urls  TEXT[],
    social_links       JSONB
);

-- ---------------------------------------------------------------------
-- CFUpdate
-- ---------------------------------------------------------------------
CREATE TABLE cf_updates (
    update_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id       UUID NOT NULL REFERENCES cf_projects(project_id) ON DELETE CASCADE,
    title            TEXT NOT NULL,
    body             TEXT NOT NULL,
    photos_urls      TEXT[] NOT NULL DEFAULT '{}',
    videos_urls      TEXT[],
    notify_backers   BOOLEAN NOT NULL DEFAULT FALSE,
    published_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON COLUMN cf_updates.notify_backers IS 'TRUE = envoie email/WhatsApp à tous les contributeurs confirmés.';

-- ---------------------------------------------------------------------
-- CFQuestion : Q&A public
-- ---------------------------------------------------------------------
CREATE TABLE cf_questions (
    question_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id    UUID NOT NULL REFERENCES cf_projects(project_id) ON DELETE CASCADE,
    question      TEXT NOT NULL,
    answer        TEXT,
    answered_at   TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- CFComment
-- ---------------------------------------------------------------------
CREATE TABLE cf_comments (
    comment_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id   UUID NOT NULL REFERENCES cf_projects(project_id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    message      TEXT NOT NULL,
    status       comment_status NOT NULL DEFAULT 'VISIBLE',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMIT;
