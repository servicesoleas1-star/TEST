-- =====================================================================
-- 05_events_ticketing.sql
-- DC-04 — Events & Ticketing (V1)
-- =====================================================================
-- Dépend de : 01 (visitors), 02 (users), 03 (campaigns)
-- Tables : events, event_venues, ticket_types, promo_codes,
--          ticket_purchases, temporary_reservations, entry_scans,
--          program_sessions, speakers, event_sponsors, merch_items,
--          merch_purchases, event_galleries, event_resources,
--          event_reports
--
-- Note FK différée : ticket_purchases.transaction_id, merch_purchases.
-- transaction_id référencent transactions (créée en migration 09).
-- Colonnes créées ici nullable=false mais SANS contrainte FK ; la
-- contrainte est ajoutée en 12_cross_fk_patch.sql.
-- event_reports.ticket_id référence support_tickets (migration 10) :
-- même traitement, colonne nullable sans FK ici.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- Event : entité campagne "événement" — miroir 1-1 dans campaigns
-- ---------------------------------------------------------------------
CREATE TABLE events (
    event_id                UUID PRIMARY KEY,
    user_id                 UUID NOT NULL REFERENCES users(user_id),
    slug                    TEXT NOT NULL UNIQUE,
    title                   TEXT NOT NULL,
    description             TEXT,
    cover_photo_url         TEXT,
    additional_photos_urls  TEXT[] NOT NULL DEFAULT '{}',
    videos_urls             TEXT[],
    category                TEXT,
    status                  event_status NOT NULL DEFAULT 'DRAFT',
    mode                    event_mode NOT NULL,
    start_at                TIMESTAMPTZ NOT NULL,
    end_at                  TIMESTAMPTZ NOT NULL,
    timezone                TEXT NOT NULL DEFAULT 'Africa/Douala',
    visible_tabs            TEXT[] NOT NULL DEFAULT '{}',
    custom_fields           JSONB,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_events_campaign FOREIGN KEY (event_id)
        REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    CONSTRAINT chk_events_dates CHECK (end_at > start_at)
);
COMMENT ON COLUMN events.mode IS 'REGISTRATION_FORM = événement gratuit, inscription sans paiement. is_free_registration sur TicketPurchase reflète ce mode.';

-- ---------------------------------------------------------------------
-- EventVenue : 1-1 avec Event
-- ---------------------------------------------------------------------
CREATE TABLE event_venues (
    venue_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id          UUID NOT NULL UNIQUE REFERENCES events(event_id) ON DELETE CASCADE,
    hall_name         TEXT NOT NULL,
    address           TEXT NOT NULL,
    city              TEXT NOT NULL,
    country           TEXT NOT NULL,
    google_maps_url   TEXT,
    floor_plan_url    TEXT,
    access_info       TEXT
);

-- ---------------------------------------------------------------------
-- TicketType
-- ---------------------------------------------------------------------
CREATE TABLE ticket_types (
    ticket_type_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id            UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    name                TEXT NOT NULL,
    category            ticket_category NOT NULL,
    price               NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_stock         INTEGER NOT NULL,
    sold_count          INTEGER NOT NULL DEFAULT 0,
    reserved_count      INTEGER NOT NULL DEFAULT 0,
    perks               TEXT,
    early_bird_ends_at  TIMESTAMPTZ,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_ticket_types_stock CHECK (sold_count + reserved_count <= total_stock)
);
COMMENT ON COLUMN ticket_types.total_stock IS 'available = total_stock - sold_count - reserved_count (calculé applicativement, pas stocké).';

-- ---------------------------------------------------------------------
-- PromoCode
-- ---------------------------------------------------------------------
CREATE TABLE promo_codes (
    promo_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id          UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    code              TEXT NOT NULL,
    discount_percent  INTEGER NOT NULL CHECK (discount_percent BETWEEN 0 AND 100),
    quota             INTEGER NOT NULL,
    used_count        INTEGER NOT NULL DEFAULT 0,
    valid_until       TIMESTAMPTZ,
    active            BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_promo_codes_event_code UNIQUE (event_id, code),
    CONSTRAINT chk_promo_codes_quota CHECK (used_count <= quota)
);

-- ---------------------------------------------------------------------
-- TicketPurchase
-- ---------------------------------------------------------------------
CREATE TABLE ticket_purchases (
    purchase_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id               UUID NOT NULL REFERENCES events(event_id),
    ticket_type_id         UUID NOT NULL REFERENCES ticket_types(ticket_type_id),
    visitor_id             UUID NOT NULL REFERENCES visitors(visitor_id),
    user_id                UUID REFERENCES users(user_id),
    transaction_id         UUID NOT NULL,     -- FK -> transactions, ajoutée en 12
    status                 ticket_status NOT NULL DEFAULT 'VALID',
    qr_code_content        TEXT NOT NULL UNIQUE,
    pdf_url                TEXT,
    delivery_channel       delivery_channel NOT NULL,
    buyer_name             TEXT NOT NULL,
    buyer_email            CITEXT NOT NULL,
    buyer_phone            TEXT,
    custom_fields_answers  JSONB,
    promo_code_id          UUID REFERENCES promo_codes(promo_id),
    short_id               VARCHAR(8) NOT NULL,
    is_free_registration   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- TemporaryReservation : verrou de stock pendant le checkout
-- ---------------------------------------------------------------------
CREATE TABLE temporary_reservations (
    reservation_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_type_id  UUID NOT NULL REFERENCES ticket_types(ticket_type_id) ON DELETE CASCADE,
    visitor_id      UUID NOT NULL REFERENCES visitors(visitor_id),
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE temporary_reservations IS 'Verrou de stock 15 min pendant le checkout. Libéré automatiquement si achat non complété (job cron).';

-- ---------------------------------------------------------------------
-- EntryScan : contrôle d'accès le jour J
-- ---------------------------------------------------------------------
CREATE TABLE entry_scans (
    scan_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id   UUID NOT NULL REFERENCES ticket_purchases(purchase_id),
    event_id      UUID NOT NULL REFERENCES events(event_id),
    scanned_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    operator_id   UUID NOT NULL REFERENCES users(user_id),
    method        scan_method NOT NULL,
    scan_result   scan_result NOT NULL,
    offline       BOOLEAN NOT NULL DEFAULT FALSE
);
COMMENT ON COLUMN entry_scans.offline IS 'TRUE = scanné sans connexion internet. Résultats synchronisés à la reconnexion.';

-- ---------------------------------------------------------------------
-- ProgramSession (planning / agenda)
-- ---------------------------------------------------------------------
CREATE TABLE program_sessions (
    session_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id      UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    description   TEXT,
    start_at      TIMESTAMPTZ NOT NULL,
    end_at        TIMESTAMPTZ NOT NULL,
    room          TEXT,
    speaker_id    UUID,    -- FK -> speakers, ajoutée plus bas (table créée juste après)
    day_number    INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT chk_program_sessions_dates CHECK (end_at > start_at)
);

-- ---------------------------------------------------------------------
-- Speaker
-- ---------------------------------------------------------------------
CREATE TABLE speakers (
    speaker_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id                UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    name                    TEXT NOT NULL,
    title                   TEXT,
    bio                     TEXT,
    photo_url               TEXT,
    additional_photos_urls  TEXT[],
    social_links            JSONB
);

-- Ajout différé de la FK program_sessions.speaker_id -> speakers, car
-- "speakers" est créée après "program_sessions" dans ce même fichier.
ALTER TABLE program_sessions
    ADD CONSTRAINT fk_program_sessions_speaker
    FOREIGN KEY (speaker_id) REFERENCES speakers(speaker_id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------
-- EventSponsor
-- ---------------------------------------------------------------------
CREATE TABLE event_sponsors (
    sponsor_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id            UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    name                TEXT NOT NULL,
    logo_url            TEXT,
    other_images_urls   TEXT[],
    level               sponsor_level NOT NULL,
    validated           BOOLEAN NOT NULL DEFAULT FALSE,
    validation_token    TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- MerchItem
-- ---------------------------------------------------------------------
CREATE TABLE merch_items (
    item_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id           UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    name               TEXT NOT NULL,
    description        TEXT,
    photo_url          TEXT,
    other_photos_urls  TEXT[],
    price              NUMERIC(14,2) NOT NULL,
    stock              INTEGER NOT NULL DEFAULT 0,
    active             BOOLEAN NOT NULL DEFAULT TRUE
);

-- ---------------------------------------------------------------------
-- MerchPurchase
-- ---------------------------------------------------------------------
CREATE TABLE merch_purchases (
    order_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id         UUID NOT NULL REFERENCES merch_items(item_id),
    event_id        UUID NOT NULL REFERENCES events(event_id),
    visitor_id      UUID NOT NULL REFERENCES visitors(visitor_id),
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    transaction_id  UUID NOT NULL,    -- FK -> transactions, ajoutée en 12
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- EventGallery
-- ---------------------------------------------------------------------
CREATE TABLE event_galleries (
    item_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id       UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    media_url      TEXT NOT NULL,
    media_type     media_type NOT NULL,
    tag            gallery_tag NOT NULL,
    edition        TEXT,
    edition_date   DATE
);

-- ---------------------------------------------------------------------
-- EventResource
-- ---------------------------------------------------------------------
CREATE TABLE event_resources (
    resource_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id     UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    title        TEXT NOT NULL,
    file_url     TEXT NOT NULL,
    access       resource_access NOT NULL DEFAULT 'FREE'
);

-- ---------------------------------------------------------------------
-- EventReport
-- ---------------------------------------------------------------------
CREATE TABLE event_reports (
    report_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id           UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    complaint_type     event_complaint_type NOT NULL,
    description        TEXT NOT NULL,
    attachments_urls   TEXT[] NOT NULL DEFAULT '{}',
    ticket_id          UUID,            -- FK -> support_tickets, ajoutée en 12
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMIT;
