-- =====================================================================
-- 04_polls_votes.sql
-- DC-03 — Polls & Votes (MVP)
-- =====================================================================
-- Dépend de : 01 (visitors), 02 (users), 03 (campaigns)
-- Tables : polls, candidate_categories, candidates, votes,
--          anti_duplicates, vote_otps, unique_codes, jury_sessions,
--          jury_scores, weighted_scores, closing_reports, poll_news,
--          poll_galleries, poll_partners, poll_faqs, poll_notices,
--          poll_reports
-- (refund_policies déplacée vers 09_finance_payments car partagée
--  avec events — voir note de conception dans ce fichier-là)
--
-- Note sur les FK différées (cycle) :
--   - votes.transaction_id référence transactions(transaction_id), mais
--     "transactions" est créée en migration 09 (finance), qui elle-même
--     dépend de "campaigns" (créée ici en amont, donc pas de cycle réel
--     côté campaigns). Le cycle est : polls -> campaigns (OK, déjà créé)
--     mais votes -> transactions (pas encore créée). On crée donc
--     votes.transaction_id SANS contrainte FK ici, ajoutée en 12.
--   - poll_reports.ticket_id référence support_tickets (créée en 10).
--     Même traitement : colonne nullable sans FK ici, FK ajoutée en 12.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- Poll : entité campagne "scrutin" — miroir 1-1 dans campaigns
-- ---------------------------------------------------------------------
CREATE TABLE polls (
    poll_id                 UUID PRIMARY KEY,
    user_id                 UUID NOT NULL REFERENCES users(user_id),
    slug                    TEXT NOT NULL UNIQUE,
    title                   TEXT NOT NULL,
    description             TEXT,
    cover_photo_url         TEXT,
    additional_photos_urls  TEXT[] NOT NULL DEFAULT '{}',
    videos_urls             TEXT[],
    category                TEXT,
    display_organizer_name  TEXT,
    social_links            JSONB,
    status                  poll_status NOT NULL DEFAULT 'DRAFT',
    vote_type               vote_type NOT NULL,
    price_per_vote          NUMERIC(14,2),
    vote_packs              JSONB,
    max_votes_per_visitor   INTEGER,
    otp_enabled             BOOLEAN NOT NULL DEFAULT FALSE,
    results_visibility      results_visibility NOT NULL DEFAULT 'PUBLIC',
    show_grid_directly      BOOLEAN NOT NULL DEFAULT TRUE,
    open_at                 TIMESTAMPTZ NOT NULL,
    close_at                TIMESTAMPTZ NOT NULL,
    timezone                TEXT NOT NULL DEFAULT 'Africa/Douala',
    rejection_reason        TEXT,
    published_version       INTEGER NOT NULL DEFAULT 0,
    custom_fields           JSONB,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_polls_campaign FOREIGN KEY (poll_id)
        REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    CONSTRAINT chk_polls_dates CHECK (close_at > open_at)
);
COMMENT ON COLUMN polls.vote_type IS 'PAID accepte toutes les méthodes de paiement (Mobile Money, Carte, PayPal) ; la méthode réelle utilisée est stockée sur la Transaction (DC-08).';
COMMENT ON COLUMN polls.custom_fields IS 'Permet à l''organisateur d''ajouter des questions personnalisées au formulaire de vote.';

-- ---------------------------------------------------------------------
-- CandidateCategory
-- ---------------------------------------------------------------------
CREATE TABLE candidate_categories (
    category_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id      UUID NOT NULL REFERENCES polls(poll_id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    position     INTEGER NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------
-- Candidate
-- ---------------------------------------------------------------------
CREATE TABLE candidates (
    candidate_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id                  UUID NOT NULL REFERENCES polls(poll_id) ON DELETE CASCADE,
    category_id              UUID REFERENCES candidate_categories(category_id) ON DELETE SET NULL,
    real_name                TEXT NOT NULL,
    display_name             TEXT NOT NULL,
    cover_photo_url           TEXT,
    additional_photos_urls   TEXT[] NOT NULL DEFAULT '{}',
    videos_urls              TEXT[],
    biography                TEXT,
    phone                    TEXT,            -- privé : non exposé publiquement par l'API
    email                    TEXT,            -- privé
    payout_phone             TEXT,
    score                    INTEGER NOT NULL DEFAULT 0,
    rank                     INTEGER,
    active                   BOOLEAN NOT NULL DEFAULT TRUE,
    position                 INTEGER NOT NULL DEFAULT 0,
    custom_fields_data       JSONB
);
COMMENT ON COLUMN candidates.phone IS 'Privé : ne doit jamais être exposé par l''API publique.';
COMMENT ON COLUMN candidates.email IS 'Privé : ne doit jamais être exposé par l''API publique.';

-- ---------------------------------------------------------------------
-- Vote
-- ---------------------------------------------------------------------
CREATE TABLE votes (
    vote_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id              UUID NOT NULL REFERENCES polls(poll_id) ON DELETE CASCADE,
    candidate_id         UUID NOT NULL REFERENCES candidates(candidate_id),
    visitor_id           UUID NOT NULL REFERENCES visitors(visitor_id),
    user_id              UUID REFERENCES users(user_id),
    vote_type            vote_type NOT NULL,
    status               vote_status NOT NULL DEFAULT 'NOT_COUNTED',
    verification_method  TEXT,
    short_id             VARCHAR(8) NOT NULL,
    ip_hashed            TEXT NOT NULL,
    transaction_id       UUID,                -- FK -> transactions, ajoutée en 12 (cycle)
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE votes IS 'Append-only en pratique : un vote annulé passe de COUNTED à CANCELLED mais reste en base pour piste d''audit (cf. UC-24).';

-- ---------------------------------------------------------------------
-- AntiDuplicate : empêche un même visiteur/contact de voter 2x
-- ---------------------------------------------------------------------
CREATE TABLE anti_duplicates (
    ad_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id        UUID NOT NULL REFERENCES polls(poll_id) ON DELETE CASCADE,
    method         anti_dup_method NOT NULL,
    value_hashed   TEXT NOT NULL,
    vote_id        UUID REFERENCES votes(vote_id),
    blocked_until  TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_anti_duplicate_poll_method_value UNIQUE (poll_id, method, value_hashed)
);
COMMENT ON TABLE anti_duplicates IS 'Même hash sur le même scrutin = vote en double rejeté.';

-- ---------------------------------------------------------------------
-- VoteOTP : codes OTP SMS/WhatsApp anti-doublon
-- ---------------------------------------------------------------------
CREATE TABLE vote_otps (
    otp_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id      UUID NOT NULL REFERENCES polls(poll_id) ON DELETE CASCADE,
    visitor_id   UUID NOT NULL REFERENCES visitors(visitor_id),
    code_hashed  TEXT NOT NULL,
    channel      otp_channel NOT NULL,
    expires_at   TIMESTAMPTZ NOT NULL,
    attempts     INTEGER NOT NULL DEFAULT 0,
    verified     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE vote_otps IS 'Règle métier : expiration 10 min, 3 tentatives max, blocage 5 min après échec (validé applicativement).';

-- ---------------------------------------------------------------------
-- UniqueCode : codes fournis par l'organisateur pour vote contrôlé
-- ---------------------------------------------------------------------
CREATE TABLE unique_codes (
    code_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id     UUID NOT NULL REFERENCES polls(poll_id) ON DELETE CASCADE,
    value       VARCHAR(8) NOT NULL,
    status      code_status NOT NULL DEFAULT 'UNUSED',
    vote_id     UUID REFERENCES votes(vote_id),
    used_at     TIMESTAMPTZ,
    CONSTRAINT uq_unique_codes_poll_value UNIQUE (poll_id, value)
);

-- ---------------------------------------------------------------------
-- JurySession : configuration du jury pour un scrutin pondéré
-- ---------------------------------------------------------------------
CREATE TABLE jury_sessions (
    jury_id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id                 UUID NOT NULL REFERENCES polls(poll_id) ON DELETE CASCADE,
    juror_email             CITEXT NOT NULL,
    invitation_token_id     UUID NOT NULL REFERENCES tokens(token_id),
    jury_weight_percent     INTEGER NOT NULL CHECK (jury_weight_percent BETWEEN 0 AND 100),
    public_weight_percent   INTEGER NOT NULL CHECK (public_weight_percent BETWEEN 0 AND 100),
    score_range_min         INTEGER NOT NULL,
    score_range_max         INTEGER NOT NULL,
    submitted               BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_jury_weights CHECK (jury_weight_percent + public_weight_percent = 100)
);

-- ---------------------------------------------------------------------
-- JuryScore : note donnée par un juré à un candidat
-- ---------------------------------------------------------------------
CREATE TABLE jury_scores (
    score_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jury_id       UUID NOT NULL REFERENCES jury_sessions(jury_id) ON DELETE CASCADE,
    candidate_id  UUID NOT NULL REFERENCES candidates(candidate_id),
    score         NUMERIC(6,2) NOT NULL,
    submitted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_jury_scores_jury_candidate UNIQUE (jury_id, candidate_id)
);

-- ---------------------------------------------------------------------
-- WeightedScore : score final calculé (public + jury normalisé)
-- ---------------------------------------------------------------------
CREATE TABLE weighted_scores (
    ws_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id          UUID NOT NULL REFERENCES polls(poll_id) ON DELETE CASCADE,
    candidate_id     UUID NOT NULL REFERENCES candidates(candidate_id),
    public_score     INTEGER NOT NULL DEFAULT 0,
    normalized_jury  NUMERIC(6,2),
    final_score      NUMERIC(8,2),
    calculated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_weighted_scores_poll_candidate UNIQUE (poll_id, candidate_id)
);
COMMENT ON TABLE weighted_scores IS 'final_score = (public_score x public_weight%) + (normalized_jury x jury_weight%). Recalculé à chaque soumission de jury.';

-- ---------------------------------------------------------------------
-- ClosingReport : PV de clôture, versionné
-- ---------------------------------------------------------------------
CREATE TABLE closing_reports (
    report_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id        UUID NOT NULL REFERENCES polls(poll_id) ON DELETE CASCADE,
    version        INTEGER NOT NULL,
    content_json   JSONB NOT NULL,
    sha256_hash    TEXT NOT NULL,
    pdf_url        TEXT NOT NULL,
    public         BOOLEAN NOT NULL DEFAULT FALSE,
    generated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    supervisor_id  UUID NOT NULL REFERENCES users(user_id),
    CONSTRAINT uq_closing_reports_poll_version UNIQUE (poll_id, version)
);
COMMENT ON COLUMN closing_reports.sha256_hash IS 'Prouve que le PDF n''a pas été altéré après génération.';

-- ---------------------------------------------------------------------
-- PollNews
-- ---------------------------------------------------------------------
CREATE TABLE poll_news (
    news_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id        UUID NOT NULL REFERENCES polls(poll_id) ON DELETE CASCADE,
    title          TEXT NOT NULL,
    body           TEXT NOT NULL,
    photos_urls    TEXT[] NOT NULL DEFAULT '{}',
    videos_urls    TEXT[],
    published_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- PollGallery
-- ---------------------------------------------------------------------
CREATE TABLE poll_galleries (
    item_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id      UUID NOT NULL REFERENCES polls(poll_id) ON DELETE CASCADE,
    media_url    TEXT NOT NULL,
    media_type   media_type NOT NULL,
    tag          gallery_tag NOT NULL,
    uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- PollPartner
-- ---------------------------------------------------------------------
CREATE TABLE poll_partners (
    partner_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id             UUID NOT NULL REFERENCES polls(poll_id) ON DELETE CASCADE,
    name                TEXT NOT NULL,
    logo_url            TEXT,
    other_images_urls   TEXT[],
    website_url         TEXT,
    level               TEXT,
    validated           BOOLEAN NOT NULL DEFAULT FALSE
);

-- ---------------------------------------------------------------------
-- PollFAQ
-- ---------------------------------------------------------------------
CREATE TABLE poll_faqs (
    faq_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id    UUID NOT NULL REFERENCES polls(poll_id) ON DELETE CASCADE,
    question   TEXT NOT NULL,
    answer     TEXT NOT NULL,
    position   INTEGER NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------
-- PollNotice : annonces / popups
-- ---------------------------------------------------------------------
CREATE TABLE poll_notices (
    notice_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id       UUID NOT NULL REFERENCES polls(poll_id) ON DELETE CASCADE,
    message       TEXT NOT NULL,
    type          notice_type NOT NULL,
    permanent     BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at    TIMESTAMPTZ,
    published_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- PollReport : signalement d'un problème par un visiteur
-- ---------------------------------------------------------------------
CREATE TABLE poll_reports (
    report_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id            UUID NOT NULL REFERENCES polls(poll_id) ON DELETE CASCADE,
    candidate_id       UUID REFERENCES candidates(candidate_id),
    reporter_name      TEXT NOT NULL,
    reporter_phone     TEXT NOT NULL,
    complaint_type     poll_complaint_type NOT NULL,
    description        TEXT NOT NULL,
    attachments_urls   TEXT[] NOT NULL DEFAULT '{}',
    ticket_id          UUID,                 -- FK -> support_tickets, ajoutée en 12 (cycle)
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMIT;
