-- =====================================================================
-- 17_event_listings.sql
-- Catalogue public des campagnes (page /evenements de la landing page).
-- =====================================================================
-- Absente du schema UML fourni (DC-01 -> DC-10) : le schema reel modelise
-- chaque type de campagne (polls, events, fundraisers, cf_projects,
-- lotteries, contests, sponsor_calls) dans sa PROPRE table, chacune avec
-- son propre statut (poll_status, event_status, fundraiser_status...),
-- sans vue/catalogue unifie permettant de lister "toutes les campagnes"
-- en une seule requete simple avec recherche/filtre/tri.
--
-- Construire cette page en joignant les 7 tables + leur JSONB page_configs
-- (08_design_customization.sql) pour en extraire un titre/image/statut
-- normalise serait disproportionne pour une page vitrine publique. Cette
-- table est un catalogue DENORMALISE dedie a la decouverte publique
-- (recherche, filtres, tri, epingles/premium/live) -- pas une source de
-- verite metier. Chaque ligne represente la vitrine publique d'une
-- campagne ; campaign_id reste la reference vers la vraie table
-- specifique au type le jour ou la page de detail devra lire des donnees
-- metier reelles (billets restants, montant collecte, etc.).
-- =====================================================================

BEGIN;

CREATE TYPE listing_status AS ENUM ('UPCOMING', 'ONGOING', 'ENDED', 'SUSPENDED');

CREATE TABLE event_listings (
    listing_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_type        campaign_type NOT NULL,
    title                TEXT NOT NULL,
    slug                 TEXT NOT NULL UNIQUE,
    description          TEXT NOT NULL,
    image_url            TEXT NOT NULL,
    country              TEXT NOT NULL,
    status               listing_status NOT NULL DEFAULT 'UPCOMING',
    is_pinned            BOOLEAN NOT NULL DEFAULT FALSE,
    is_premium           BOOLEAN NOT NULL DEFAULT FALSE,
    is_live              BOOLEAN NOT NULL DEFAULT FALSE,
    organizer_name       TEXT NOT NULL,
    organizer_logo_url   TEXT,
    votes_count          INTEGER NOT NULL DEFAULT 0,
    starts_at            TIMESTAMPTZ,
    ends_at              TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_listings_status ON event_listings(status);
CREATE INDEX idx_event_listings_type ON event_listings(campaign_type);
CREATE INDEX idx_event_listings_country ON event_listings(country);
CREATE INDEX idx_event_listings_pinned ON event_listings(is_pinned);
CREATE INDEX idx_event_listings_search ON event_listings USING gin (to_tsvector('french', title || ' ' || description));

COMMIT;
