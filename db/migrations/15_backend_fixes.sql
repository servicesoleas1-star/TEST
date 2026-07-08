-- =====================================================================
-- 15_backend_fixes.sql
-- Deux ajustements mineurs necessaires suite a l'audit du backend :
--   - support_tickets.visitor_id : les tickets crees par un organisateur
--     connecte n'ont pas de visitor_id anonyme associe. Rendu nullable.
--   - unique_codes.created_at : necessaire pour le tri chronologique dans
--     la liste et l'export CSV (les stores l'utilisaient deja a tort).
-- =====================================================================

BEGIN;

ALTER TABLE support_tickets ALTER COLUMN visitor_id DROP NOT NULL;

ALTER TABLE unique_codes
    ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();

COMMIT;