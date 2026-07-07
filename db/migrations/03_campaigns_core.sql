-- =====================================================================
-- 03_campaigns_core.sql
-- Table-chapeau "campaigns" — Class Table Inheritance (CTI)
-- =====================================================================
-- Dépend de : 02_auth_users.sql (users)
--
-- POURQUOI CETTE TABLE EXISTE (elle n'est dans aucun diagramme UML) :
-- Plusieurs diagrammes utilisent un couple "campaign_id (UUID) +
-- campaign_type (String)" pour référencer indifféremment un Poll, un
-- Event, un Fundraiser, un CFProject, une Lottery, un Contest ou un
-- SponsorCall (ex: Transaction, SupportTicket, PageConfig, EscrowDeposit,
-- RefundPolicy, MassEmailCampaign...).
--
-- En SQL pur, une colonne ne peut pas être une FK vers "plusieurs tables
-- possibles selon la valeur d'une autre colonne" : PostgreSQL n'a pas de
-- mécanisme de FK conditionnelle. Sans solution, ces colonnes resteraient
-- de simples UUID sans aucune garantie d'intégrité (une transaction
-- pourrait pointer vers un poll_id qui n'existe pas, silencieusement).
--
-- La solution : chaque table "campagne" (polls, events, fundraisers,
-- cf_projects, lotteries, contests, sponsor_calls) a son PK qui est
-- AUSSI une FK vers campaigns.campaign_id (relation 1-1, même valeur
-- UUID des deux côtés). Ainsi, "campaigns" devient une vraie table que
-- Transaction, SupportTicket etc. peuvent référencer avec une FK
-- standard. C'est le pattern "Class Table Inheritance".
-- =====================================================================

BEGIN;

CREATE TABLE campaigns (
    campaign_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_type  campaign_type NOT NULL,
    owner_user_id  UUID NOT NULL REFERENCES users(user_id),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE campaigns IS
    'Table technique (Class Table Inheritance) non présente dans les diagrammes UML. '
    'Permet des FK réelles depuis Transaction/SupportTicket/PageConfig/etc. vers '
    'n''importe quel type de campagne (Poll, Event, Fundraiser, CFProject, Lottery, '
    'Contest, SponsorCall). Chaque table métier "campagne" a son PK = FK vers cette '
    'table (relation 1-1 stricte, vérifiée par trigger de cohérence en 12_cross_fk_patch).';

CREATE INDEX idx_campaigns_owner ON campaigns(owner_user_id);
CREATE INDEX idx_campaigns_type ON campaigns(campaign_type);

COMMIT;
