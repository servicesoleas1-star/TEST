-- =====================================================================
-- 19_campaign_personalization.sql
-- Personnalisation de base d'une campagne (message d'accueil + sections
-- visibles sur la page publique). Complète brand_settings (déjà créée en
-- 08_design_customization.sql, réutilisée telle quelle pour couleurs/logo).
-- =====================================================================

BEGIN;

ALTER TABLE polls ADD COLUMN IF NOT EXISTS welcome_message TEXT;
ALTER TABLE polls ADD COLUMN IF NOT EXISTS visible_sections JSONB;

COMMENT ON COLUMN polls.welcome_message IS 'Message affiché en évidence sur la section Accueil du scrutin (optionnel, distinct de "description").';
COMMENT ON COLUMN polls.visible_sections IS 'Tableau JSON des clés de sections à afficher dans la nav publique (ex: ["candidats","regles","faq","actualites","partenaires","galerie"]). NULL = toutes affichées (comportement par défaut, rétrocompatible).';

COMMIT;
