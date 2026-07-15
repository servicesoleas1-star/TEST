-- =====================================================================
-- 16_partner_applications.sql
-- Table pour le formulaire public "Devenir partenaire" (page Partenaires).
-- Absente du schema UML fourni (DC-01 -> DC-10) -- a ne pas confondre avec
-- SponsorApplication (DC-06), qui repond a un SponsorCall lie a UN
-- evenement precis. Ici il s'agit d'une candidature generale, independante
-- de tout evenement, jusqu'ici simulee cote frontend uniquement.
-- =====================================================================

BEGIN;

CREATE TABLE partner_applications (
    application_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_name TEXT NOT NULL,
    email              TEXT NOT NULL,
    phone              TEXT NOT NULL,
    partnership_type   TEXT NOT NULL,
    description        TEXT NOT NULL,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMIT;
