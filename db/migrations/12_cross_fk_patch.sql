-- =====================================================================
-- 12_cross_fk_patch.sql
-- Ajout des FK différées (résolution des cycles de dépendances) +
-- triggers de garde-fou
-- =====================================================================
-- Dépend de : TOUTES les migrations précédentes (00 -> 11)
--
-- Pourquoi ce fichier existe :
-- Plusieurs tables se référencent mutuellement (ex: Vote a besoin de
-- Transaction, mais Transaction référence campaigns qui contient les
-- polls qui contiennent les votes). Il est impossible de créer ces
-- deux tables avec leurs FK complètes en une seule passe sans casser
-- l'ordre de création. La solution : créer les colonnes sans
-- contrainte dans leur migration d'origine, puis ajouter la contrainte
-- ici, une fois que toutes les tables existent.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1) FK vers transactions (table créée en migration 09)
-- ---------------------------------------------------------------------
ALTER TABLE votes
    ADD CONSTRAINT fk_votes_transaction
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id);

ALTER TABLE ticket_purchases
    ADD CONSTRAINT fk_ticket_purchases_transaction
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id);

ALTER TABLE merch_purchases
    ADD CONSTRAINT fk_merch_purchases_transaction
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id);

ALTER TABLE donations
    ADD CONSTRAINT fk_donations_transaction
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id);

ALTER TABLE cf_contributions
    ADD CONSTRAINT fk_cf_contributions_transaction
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id);

ALTER TABLE sponsor_applications
    ADD CONSTRAINT fk_sponsor_applications_transaction
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id);

ALTER TABLE contest_participants
    ADD CONSTRAINT fk_contest_participants_entry_fee_tx
    FOREIGN KEY (entry_fee_transaction_id) REFERENCES transactions(transaction_id);

ALTER TABLE escrow_deposits
    ADD CONSTRAINT fk_escrow_deposits_deposit_tx
    FOREIGN KEY (deposit_tx_id) REFERENCES transactions(transaction_id);

ALTER TABLE prize_payments
    ADD CONSTRAINT fk_prize_payments_payout_tx
    FOREIGN KEY (payout_tx_id) REFERENCES transactions(transaction_id);

ALTER TABLE lottery_tickets
    ADD CONSTRAINT fk_lottery_tickets_transaction
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id);

-- ---------------------------------------------------------------------
-- 2) FK vers support_tickets (table créée en migration 10)
-- ---------------------------------------------------------------------
ALTER TABLE poll_reports
    ADD CONSTRAINT fk_poll_reports_ticket
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(ticket_id);

ALTER TABLE event_reports
    ADD CONSTRAINT fk_event_reports_ticket
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(ticket_id);

-- ---------------------------------------------------------------------
-- 3) FK vers users (table créée en migration 02) — visitors.account_id
-- ---------------------------------------------------------------------
ALTER TABLE visitors
    ADD CONSTRAINT fk_visitors_account
    FOREIGN KEY (account_id) REFERENCES users(user_id) ON DELETE SET NULL;

-- =====================================================================
-- TRIGGERS DE GARDE-FOU
-- =====================================================================

-- ---------------------------------------------------------------------
-- A) AuditLog : table strictement append-only (INSERT seul autorisé)
-- ---------------------------------------------------------------------
-- On révoque UPDATE/DELETE pour le rôle applicatif standard. Le rôle
-- "liboka" utilisé ici est superuser en dev ; en production, créer un
-- rôle applicatif dédié (ex: "liboka_app") et exécuter ce REVOKE sur ce
-- rôle précis, pas sur le superuser de migration.
CREATE OR REPLACE FUNCTION trg_audit_log_immutable()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'audit_logs est immuable : UPDATE et DELETE sont interdits (tentative sur audit_id=%)', OLD.audit_id;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_logs_no_update
    BEFORE UPDATE ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION trg_audit_log_immutable();

CREATE TRIGGER trg_audit_logs_no_delete
    BEFORE DELETE ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION trg_audit_log_immutable();

COMMENT ON FUNCTION trg_audit_log_immutable IS 'Garde-fou applicatif : bloque toute tentative d''UPDATE/DELETE sur audit_logs, même par erreur de code. À compléter en prod par un REVOKE UPDATE, DELETE ON audit_logs FROM liboka_app;';

-- ---------------------------------------------------------------------
-- B) Cohérence campaign_type dénormalisé vs campaigns.campaign_type
-- ---------------------------------------------------------------------
-- transactions.campaign_type, page_configs.campaign_type et
-- refund_policies.campaign_type sont des colonnes dénormalisées (pour
-- lecture rapide sans jointure). Ce trigger garantit qu'elles
-- correspondent toujours à la vraie valeur dans "campaigns", pour
-- éviter toute désynchronisation silencieuse.
CREATE OR REPLACE FUNCTION trg_check_campaign_type()
RETURNS TRIGGER AS $$
DECLARE
    real_type campaign_type;
BEGIN
    SELECT campaign_type INTO real_type FROM campaigns WHERE campaign_id = NEW.campaign_id;
    IF real_type IS NULL THEN
        RAISE EXCEPTION 'campaign_id % introuvable dans campaigns', NEW.campaign_id;
    END IF;
    IF real_type <> NEW.campaign_type THEN
        RAISE EXCEPTION 'campaign_type incohérent : % fourni mais campaigns indique % pour campaign_id %',
            NEW.campaign_type, real_type, NEW.campaign_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_transactions_check_campaign_type
    BEFORE INSERT OR UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION trg_check_campaign_type();

CREATE TRIGGER trg_page_configs_check_campaign_type
    BEFORE INSERT OR UPDATE ON page_configs
    FOR EACH ROW EXECUTE FUNCTION trg_check_campaign_type();

CREATE TRIGGER trg_refund_policies_check_campaign_type
    BEFORE INSERT OR UPDATE ON refund_policies
    FOR EACH ROW EXECUTE FUNCTION trg_check_campaign_type();

-- ---------------------------------------------------------------------
-- C) Cohérence 1-1 des tables "campagne" avec leur ligne campaigns
-- ---------------------------------------------------------------------
-- Quand on crée un Poll/Event/Fundraiser/CFProject/Lottery/Contest/
-- SponsorCall, son PK doit correspondre à une ligne déjà existante dans
-- "campaigns" avec le bon campaign_type. Ce trigger générique le
-- vérifie pour chaque table fille via un paramètre passé au trigger.
CREATE OR REPLACE FUNCTION trg_check_campaign_subtype()
RETURNS TRIGGER AS $$
DECLARE
    expected_type campaign_type;
    real_type campaign_type;
    pk_value UUID;
BEGIN
    expected_type := TG_ARGV[0]::campaign_type;
    EXECUTE format('SELECT ($1).%I', TG_ARGV[1]) INTO pk_value USING NEW;
    SELECT campaign_type INTO real_type FROM campaigns WHERE campaign_id = pk_value;
    IF real_type IS NULL THEN
        RAISE EXCEPTION '% : campaign_id % doit exister dans campaigns avant insertion', TG_TABLE_NAME, pk_value;
    END IF;
    IF real_type <> expected_type THEN
        RAISE EXCEPTION '% : campaigns.campaign_type=% mais attendu %', TG_TABLE_NAME, real_type, expected_type;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_polls_check_subtype
    BEFORE INSERT ON polls FOR EACH ROW
    EXECUTE FUNCTION trg_check_campaign_subtype('POLL', 'poll_id');

CREATE TRIGGER trg_events_check_subtype
    BEFORE INSERT ON events FOR EACH ROW
    EXECUTE FUNCTION trg_check_campaign_subtype('EVENT', 'event_id');

CREATE TRIGGER trg_fundraisers_check_subtype
    BEFORE INSERT ON fundraisers FOR EACH ROW
    EXECUTE FUNCTION trg_check_campaign_subtype('FUNDRAISER', 'fundraiser_id');

CREATE TRIGGER trg_cf_projects_check_subtype
    BEFORE INSERT ON cf_projects FOR EACH ROW
    EXECUTE FUNCTION trg_check_campaign_subtype('CF_PROJECT', 'project_id');

CREATE TRIGGER trg_lotteries_check_subtype
    BEFORE INSERT ON lotteries FOR EACH ROW
    EXECUTE FUNCTION trg_check_campaign_subtype('LOTTERY', 'lottery_id');

CREATE TRIGGER trg_contests_check_subtype
    BEFORE INSERT ON contests FOR EACH ROW
    EXECUTE FUNCTION trg_check_campaign_subtype('CONTEST', 'contest_id');

CREATE TRIGGER trg_sponsor_calls_check_subtype
    BEFORE INSERT ON sponsor_calls FOR EACH ROW
    EXECUTE FUNCTION trg_check_campaign_subtype('SPONSOR_CALL', 'call_id');

COMMIT;
