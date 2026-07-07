-- =====================================================================
-- 07_sponsorship_lottery_contest.sql
-- DC-06 — Sponsorship, Lotteries & Contests (V3)
-- =====================================================================
-- Dépend de : 01 (visitors), 02 (users), 03 (campaigns), 05 (events,
--             pour Lottery.event_id optionnel)
-- Tables : sponsor_calls, sponsorship_levels, sponsor_applications,
--          contests, prizes, contest_participants, submissions,
--          bracket_matches, escrow_deposits, prize_payments,
--          lotteries, lottery_tickets, lottery_draws
--
-- Note : le diagramme DC-06 annonce "12 classes" en résumé mais en
-- liste 13 en détail. On suit le détail (13), la source la plus fiable.
--
-- Note FK différée : sponsor_applications.transaction_id, escrow_deposits.
-- deposit_tx_id, prize_payments.payout_tx_id référencent transactions
-- (migration 09) -> colonnes créées ici sans contrainte FK, ajoutée en 12.
-- Idem contest_participants.entry_fee_transaction_id (nullable) et
-- lottery_tickets.transaction_id.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- SponsorCall : appel à sponsoring — miroir 1-1 dans campaigns
-- ---------------------------------------------------------------------
CREATE TABLE sponsor_calls (
    call_id              UUID PRIMARY KEY,
    user_id              UUID NOT NULL REFERENCES users(user_id),
    slug                 TEXT NOT NULL,
    title                TEXT NOT NULL,
    event_description    TEXT,
    expected_audience    TEXT,
    photos_urls          TEXT[] NOT NULL DEFAULT '{}',
    videos_urls          TEXT[],
    deadline             TIMESTAMPTZ NOT NULL,
    status               call_status NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_sponsor_calls_campaign FOREIGN KEY (call_id)
        REFERENCES campaigns(campaign_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- SponsorshipLevel
-- ---------------------------------------------------------------------
CREATE TABLE sponsorship_levels (
    level_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id      UUID NOT NULL REFERENCES sponsor_calls(call_id) ON DELETE CASCADE,
    name         level_name NOT NULL,
    min_amount   NUMERIC(14,2) NOT NULL,
    perks        TEXT,
    available    BOOLEAN NOT NULL DEFAULT TRUE
);

-- ---------------------------------------------------------------------
-- SponsorApplication
-- ---------------------------------------------------------------------
CREATE TABLE sponsor_applications (
    application_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id            UUID NOT NULL REFERENCES sponsor_calls(call_id) ON DELETE CASCADE,
    company_name       TEXT NOT NULL,
    email              CITEXT NOT NULL,
    phone              TEXT NOT NULL,
    sector             TEXT,
    level_id           UUID NOT NULL REFERENCES sponsorship_levels(level_id),
    description        TEXT,
    logo_url           TEXT,
    other_images_urls  TEXT[],
    documents_urls     TEXT[] NOT NULL DEFAULT '{}',
    transaction_id     UUID NOT NULL,     -- FK -> transactions, ajoutée en 12
    status             app_status NOT NULL DEFAULT 'PENDING',
    decided_at         TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE sponsor_applications IS 'Organisateur valide ou rejette directement. Moledi n''interfère pas dans le choix du sponsor. Fonds détenus en escrow jusqu''à validation.';

-- ---------------------------------------------------------------------
-- Contest : concours — miroir 1-1 dans campaigns
-- ---------------------------------------------------------------------
CREATE TABLE contests (
    contest_id              UUID PRIMARY KEY,
    user_id                 UUID NOT NULL REFERENCES users(user_id),
    slug                    TEXT NOT NULL,
    title                   TEXT NOT NULL,
    description             TEXT,
    rules                   TEXT,
    cover_photo_url         TEXT,
    additional_photos_urls  TEXT[] NOT NULL DEFAULT '{}',
    videos_urls             TEXT[],
    format                  contest_format NOT NULL,
    entry_fee               NUMERIC(14,2),
    max_participants        INTEGER,
    registration_opens_at   TIMESTAMPTZ NOT NULL,
    registration_closes_at  TIMESTAMPTZ NOT NULL,
    finals_at               TIMESTAMPTZ NOT NULL,
    status                  contest_status NOT NULL DEFAULT 'DRAFT',
    registration_mode       registration_mode NOT NULL DEFAULT 'AUTO',
    cash_prize               NUMERIC(14,2),
    escrow_id               UUID,        -- FK -> escrow_deposits, ajoutée plus bas (cycle intra-fichier)
    custom_fields           JSONB,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_contests_campaign FOREIGN KEY (contest_id)
        REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    CONSTRAINT chk_contests_dates CHECK (registration_closes_at > registration_opens_at
                                          AND finals_at >= registration_closes_at)
);
COMMENT ON COLUMN contests.cash_prize IS 'Verrouillé dans EscrowDeposit AVANT le début du concours. Libéré au gagnant via PrizePayment après désignation par l''organisateur.';

-- ---------------------------------------------------------------------
-- Prize : récompense, liée à un Contest OU une Lottery
-- ---------------------------------------------------------------------
CREATE TABLE prizes (
    prize_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id    UUID REFERENCES contests(contest_id) ON DELETE CASCADE,
    lottery_id    UUID,     -- FK -> lotteries, ajoutée plus bas (table créée après)
    title         TEXT NOT NULL,
    description   TEXT,
    cash_value    NUMERIC(14,2),
    photos_urls   TEXT[],
    CONSTRAINT chk_prizes_one_parent CHECK (
        (contest_id IS NOT NULL AND lottery_id IS NULL) OR
        (contest_id IS NULL AND lottery_id IS NOT NULL)
    )
);
COMMENT ON CONSTRAINT chk_prizes_one_parent ON prizes IS 'Un prix appartient soit à un concours, soit à une loterie, jamais les deux (cf. cardinalité 0..1/0..1 du diagramme).';

-- ---------------------------------------------------------------------
-- ContestParticipant
-- ---------------------------------------------------------------------
CREATE TABLE contest_participants (
    participant_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id                UUID NOT NULL REFERENCES contests(contest_id) ON DELETE CASCADE,
    visitor_id                UUID NOT NULL REFERENCES visitors(visitor_id),
    user_id                   UUID REFERENCES users(user_id),
    name                      TEXT NOT NULL,
    email                     CITEXT NOT NULL,
    photos_urls               TEXT[],
    videos_urls               TEXT[],
    team                      TEXT,
    category                  TEXT,
    score                     NUMERIC(8,2) NOT NULL DEFAULT 0,
    rank                      INTEGER,
    status                    participant_status NOT NULL DEFAULT 'REGISTERED',
    entry_fee_transaction_id  UUID,     -- FK -> transactions, ajoutée en 12 (nullable : concours gratuit)
    custom_fields_data        JSONB,
    created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- Submission : soumission d'un participant
-- ---------------------------------------------------------------------
CREATE TABLE submissions (
    submission_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id  UUID NOT NULL REFERENCES contest_participants(participant_id) ON DELETE CASCADE,
    contest_id      UUID NOT NULL REFERENCES contests(contest_id),
    files_urls      TEXT[] NOT NULL DEFAULT '{}',
    photos_urls     TEXT[],
    videos_urls     TEXT[],
    text_content    TEXT,
    quiz_answers    JSONB,
    auto_score      NUMERIC(8,2),
    manual_score    NUMERIC(8,2),
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE submissions IS 'Format SUBMISSION -> files_urls+photos+videos. Format QUIZ -> quiz_answers (JSON). Format BRACKET -> géré par bracket_matches. auto_score calculé automatiquement, manual_score saisi par l''organisateur.';

-- ---------------------------------------------------------------------
-- BracketMatch : tournoi à élimination directe
-- ---------------------------------------------------------------------
CREATE TABLE bracket_matches (
    match_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id       UUID NOT NULL REFERENCES contests(contest_id) ON DELETE CASCADE,
    round            INTEGER NOT NULL,
    participant_a_id UUID NOT NULL REFERENCES contest_participants(participant_id),
    participant_b_id UUID NOT NULL REFERENCES contest_participants(participant_id),
    winner_id        UUID REFERENCES contest_participants(participant_id),
    score_a          NUMERIC(8,2),
    score_b          NUMERIC(8,2),
    completed        BOOLEAN NOT NULL DEFAULT FALSE
);

-- ---------------------------------------------------------------------
-- EscrowDeposit : fonds bloqués (sponsoring ou cash_prize de concours)
-- ---------------------------------------------------------------------
CREATE TABLE escrow_deposits (
    escrow_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id   UUID NOT NULL REFERENCES campaigns(campaign_id),
    user_id       UUID NOT NULL REFERENCES users(user_id),
    amount        NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    deposit_tx_id UUID NOT NULL,        -- FK -> transactions, ajoutée en 12
    status        escrow_status NOT NULL DEFAULT 'LOCKED',
    winner_id     UUID,                 -- référence libre (peut être un User ou un Candidate selon contexte) — pas de FK stricte, validé applicativement
    released_at   TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON COLUMN escrow_deposits.campaign_id IS 'Référence campaigns (Contest ou Lottery) via la table-chapeau CTI, remplace le couple campaign_id/campaign_type du diagramme original.';
COMMENT ON COLUMN escrow_deposits.winner_id IS 'Identifiant libre du gagnant désigné (organisateur), résolu applicativement selon le type de campagne. Pas de FK stricte car peut référencer différentes entités.';

-- Ajout différé de Contest.escrow_id -> escrow_deposits (créée juste après contests)
ALTER TABLE contests
    ADD CONSTRAINT fk_contests_escrow
    FOREIGN KEY (escrow_id) REFERENCES escrow_deposits(escrow_id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------
-- PrizePayment : virement du prix gagné
-- ---------------------------------------------------------------------
CREATE TABLE prize_payments (
    payment_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escrow_id       UUID NOT NULL REFERENCES escrow_deposits(escrow_id),
    winner_id       UUID NOT NULL,
    payout_phone    TEXT NOT NULL,
    payout_tx_id    UUID NOT NULL,       -- FK -> transactions, ajoutée en 12
    status          payout_status NOT NULL DEFAULT 'PENDING',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- Lottery : loterie — miroir 1-1 dans campaigns
-- ---------------------------------------------------------------------
CREATE TABLE lotteries (
    lottery_id              UUID PRIMARY KEY,
    user_id                 UUID NOT NULL REFERENCES users(user_id),
    event_id                UUID REFERENCES events(event_id),
    slug                    TEXT NOT NULL,
    title                   TEXT NOT NULL,
    description             TEXT,
    cover_photo_url         TEXT,
    additional_photos_urls  TEXT[] NOT NULL DEFAULT '{}',
    videos_urls             TEXT[],
    ticket_price            NUMERIC(14,2) NOT NULL,
    max_tickets             INTEGER NOT NULL,
    tickets_sold            INTEGER NOT NULL DEFAULT 0,
    draw_at                 TIMESTAMPTZ NOT NULL,
    draw_mode               draw_mode NOT NULL DEFAULT 'AUTO',
    status                  lottery_status NOT NULL DEFAULT 'ACTIVE',
    draw_completed          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_lotteries_campaign FOREIGN KEY (lottery_id)
        REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    CONSTRAINT chk_lotteries_tickets CHECK (tickets_sold <= max_tickets)
);

-- Ajout différé de prizes.lottery_id -> lotteries (créée après prizes)
ALTER TABLE prizes
    ADD CONSTRAINT fk_prizes_lottery
    FOREIGN KEY (lottery_id) REFERENCES lotteries(lottery_id) ON DELETE CASCADE;

-- ---------------------------------------------------------------------
-- LotteryTicket
-- ---------------------------------------------------------------------
CREATE TABLE lottery_tickets (
    ticket_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lottery_id      UUID NOT NULL REFERENCES lotteries(lottery_id) ON DELETE CASCADE,
    unique_number   TEXT NOT NULL,
    buyer_name      TEXT NOT NULL,
    buyer_email     CITEXT NOT NULL,
    buyer_phone     TEXT NOT NULL,
    visitor_id      UUID NOT NULL REFERENCES visitors(visitor_id),
    transaction_id  UUID NOT NULL,       -- FK -> transactions, ajoutée en 12
    status          lottery_ticket_status NOT NULL DEFAULT 'PENDING_DRAW',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_lottery_tickets_lottery_number UNIQUE (lottery_id, unique_number)
);

-- ---------------------------------------------------------------------
-- LotteryDraw : résultat officiel du tirage
-- ---------------------------------------------------------------------
CREATE TABLE lottery_draws (
    draw_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lottery_id       UUID NOT NULL REFERENCES lotteries(lottery_id) ON DELETE CASCADE,
    winning_numbers  TEXT[] NOT NULL,
    drawn_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    triggered_by     UUID NOT NULL
);
COMMENT ON COLUMN lottery_draws.triggered_by IS 'UUID d''un user (tirage manuel) ou valeur sentinelle "SYSTEM" représentée par le nil UUID (tirage automatique à l''heure prévue). Pas de FK stricte vers users pour permettre cette valeur système.';

COMMIT;
