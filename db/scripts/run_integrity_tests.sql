-- =====================================================================
-- run_integrity_tests.sql
-- Suite de tests d'intégrité — vérifie que les contraintes et triggers
-- du schéma se comportent comme prévu par la conception.
-- =====================================================================
-- Exécution : psql -f scripts/run_integrity_tests.sql
-- Chaque test affiche PASS ou FAIL. Le script s'exécute dans une
-- transaction annulée à la fin (ROLLBACK) : aucune donnée de test ne
-- persiste, sauf le test sur audit_logs qui nécessite de désactiver
-- temporairement le trigger pour nettoyer (documenté en clair).
-- =====================================================================

\set ON_ERROR_STOP off
BEGIN;

DO $$
DECLARE
    test_count INTEGER := 0;
    pass_count INTEGER := 0;
    test_user_id UUID := gen_random_uuid();
    test_campaign_id UUID := gen_random_uuid();
    err_caught BOOLEAN;
BEGIN
    RAISE NOTICE '=== DEBUT DES TESTS D''INTEGRITE ===';

    -- Setup commun
    INSERT INTO users (user_id, role, full_name, email)
    VALUES (test_user_id, 'ORGANIZER', 'Test User', 'integrity-test@liboka.cm');

    -- -----------------------------------------------------------------
    -- TEST 1 : un Poll ne peut pas être créé sans ligne campaigns
    -- -----------------------------------------------------------------
    test_count := test_count + 1;
    err_caught := FALSE;
    BEGIN
        INSERT INTO polls (poll_id, user_id, slug, title, vote_type, open_at, close_at)
        VALUES (gen_random_uuid(), test_user_id, 'orphan-poll', 'Orphan', 'FREE_VISITOR_ID', now(), now() + interval '1 day');
    EXCEPTION WHEN OTHERS THEN
        err_caught := TRUE;
    END;
    IF err_caught THEN
        pass_count := pass_count + 1;
        RAISE NOTICE 'TEST 1 PASS : Poll orphelin (sans campaigns) correctement rejeté';
    ELSE
        RAISE WARNING 'TEST 1 FAIL : Poll orphelin accepté (ne devrait jamais arriver)';
    END IF;

    -- -----------------------------------------------------------------
    -- TEST 2 : workflow correct campaigns -> polls doit réussir
    -- -----------------------------------------------------------------
    test_count := test_count + 1;
    BEGIN
        INSERT INTO campaigns (campaign_id, campaign_type, owner_user_id)
        VALUES (test_campaign_id, 'POLL', test_user_id);
        INSERT INTO polls (poll_id, user_id, slug, title, vote_type, open_at, close_at)
        VALUES (test_campaign_id, test_user_id, 'valid-poll-test', 'Valid', 'FREE_VISITOR_ID', now(), now() + interval '1 day');
        pass_count := pass_count + 1;
        RAISE NOTICE 'TEST 2 PASS : workflow campaigns -> polls correct accepté';
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'TEST 2 FAIL : workflow correct a été rejeté (%)', SQLERRM;
    END;

    -- -----------------------------------------------------------------
    -- TEST 3 : close_at doit être après open_at (CHECK constraint)
    -- -----------------------------------------------------------------
    test_count := test_count + 1;
    err_caught := FALSE;
    BEGIN
        INSERT INTO campaigns (campaign_id, campaign_type, owner_user_id)
        VALUES (gen_random_uuid(), 'POLL', test_user_id) RETURNING campaign_id INTO test_campaign_id;
        INSERT INTO polls (poll_id, user_id, slug, title, vote_type, open_at, close_at)
        VALUES (test_campaign_id, test_user_id, 'bad-dates-poll', 'BadDates', 'FREE_VISITOR_ID', now(), now() - interval '1 day');
    EXCEPTION WHEN OTHERS THEN
        err_caught := TRUE;
    END;
    IF err_caught THEN
        pass_count := pass_count + 1;
        RAISE NOTICE 'TEST 3 PASS : close_at < open_at correctement rejeté';
    ELSE
        RAISE WARNING 'TEST 3 FAIL : dates incohérentes acceptées';
    END IF;

    -- -----------------------------------------------------------------
    -- TEST 4 : email unique sur users
    -- -----------------------------------------------------------------
    test_count := test_count + 1;
    err_caught := FALSE;
    BEGIN
        INSERT INTO users (user_id, role, full_name, email)
        VALUES (gen_random_uuid(), 'ORGANIZER', 'Duplicate', 'integrity-test@liboka.cm');
    EXCEPTION WHEN OTHERS THEN
        err_caught := TRUE;
    END;
    IF err_caught THEN
        pass_count := pass_count + 1;
        RAISE NOTICE 'TEST 4 PASS : email dupliqué correctement rejeté';
    ELSE
        RAISE WARNING 'TEST 4 FAIL : email dupliqué accepté';
    END IF;

    -- -----------------------------------------------------------------
    -- TEST 5 : email insensible à la casse (CITEXT) doit aussi bloquer
    -- -----------------------------------------------------------------
    test_count := test_count + 1;
    err_caught := FALSE;
    BEGIN
        INSERT INTO users (user_id, role, full_name, email)
        VALUES (gen_random_uuid(), 'ORGANIZER', 'CaseTest', 'INTEGRITY-TEST@liboka.cm');
    EXCEPTION WHEN OTHERS THEN
        err_caught := TRUE;
    END;
    IF err_caught THEN
        pass_count := pass_count + 1;
        RAISE NOTICE 'TEST 5 PASS : email avec casse différente correctement rejeté (CITEXT fonctionne)';
    ELSE
        RAISE WARNING 'TEST 5 FAIL : doublon avec casse différente accepté';
    END IF;

    -- -----------------------------------------------------------------
    -- TEST 6 : jury_weight_percent + public_weight_percent doit faire 100
    -- -----------------------------------------------------------------
    test_count := test_count + 1;
    err_caught := FALSE;
    DECLARE
        jury_poll_id UUID := gen_random_uuid();
        jury_token_id UUID;
    BEGIN
        INSERT INTO campaigns (campaign_id, campaign_type, owner_user_id) VALUES (jury_poll_id, 'POLL', test_user_id);
        INSERT INTO polls (poll_id, user_id, slug, title, vote_type, open_at, close_at)
        VALUES (jury_poll_id, test_user_id, 'jury-weight-poll', 'JuryW', 'JURY_WEIGHTED', now(), now() + interval '1 day');
        INSERT INTO tokens (token_id, user_id, value, type, expires_at)
        VALUES (gen_random_uuid(), test_user_id, 'tok-jury-test-1', 'JURY_INVITATION', now() + interval '7 days')
        RETURNING token_id INTO jury_token_id;
        BEGIN
            INSERT INTO jury_sessions (poll_id, juror_email, invitation_token_id, jury_weight_percent, public_weight_percent, score_range_min, score_range_max)
            VALUES (jury_poll_id, 'juror@test.cm', jury_token_id, 60, 50, 0, 10);  -- 60+50=110, doit échouer
        EXCEPTION WHEN OTHERS THEN
            err_caught := TRUE;
        END;
    END;
    IF err_caught THEN
        pass_count := pass_count + 1;
        RAISE NOTICE 'TEST 6 PASS : somme des poids jury/public != 100 correctement rejetée';
    ELSE
        RAISE WARNING 'TEST 6 FAIL : poids incohérents acceptés';
    END IF;

    -- -----------------------------------------------------------------
    -- TEST 7 : transactions.campaign_type doit correspondre à campaigns
    -- -----------------------------------------------------------------
    test_count := test_count + 1;
    err_caught := FALSE;
    DECLARE
        camp_id UUID := gen_random_uuid();
        visitor_test_id UUID;
        agg_id UUID;
    BEGIN
        INSERT INTO campaigns (campaign_id, campaign_type, owner_user_id) VALUES (camp_id, 'POLL', test_user_id);
        INSERT INTO visitors (visitor_id, ip_hashed) VALUES (gen_random_uuid(), 'hash123') RETURNING visitor_id INTO visitor_test_id;
        INSERT INTO aggregators (aggregator_id, name, api_endpoint, health_endpoint)
        VALUES (gen_random_uuid(), 'TestAgg', 'http://x', 'http://x/health') RETURNING aggregator_id INTO agg_id;
        BEGIN
            INSERT INTO transactions (campaign_id, campaign_type, type, visitor_id, gross_amount, idempotency_key, aggregator_id, country, payment_method, correlation_id)
            VALUES (camp_id, 'EVENT', 'VOTE', visitor_test_id, 100, 'idem-test-1', agg_id, 'CM', 'MOBILE_MONEY', 'corr-1');
            -- campaign_type='EVENT' alors que campaigns dit 'POLL' -> doit échouer
        EXCEPTION WHEN OTHERS THEN
            err_caught := TRUE;
        END;
    END;
    IF err_caught THEN
        pass_count := pass_count + 1;
        RAISE NOTICE 'TEST 7 PASS : campaign_type incohérent sur transactions correctement rejeté';
    ELSE
        RAISE WARNING 'TEST 7 FAIL : campaign_type incohérent accepté';
    END IF;

    -- -----------------------------------------------------------------
    -- TEST 8 : ticket_types stock (sold+reserved <= total) doit être respecté
    -- -----------------------------------------------------------------
    test_count := test_count + 1;
    err_caught := FALSE;
    DECLARE
        evt_id UUID := gen_random_uuid();
    BEGIN
        INSERT INTO campaigns (campaign_id, campaign_type, owner_user_id) VALUES (evt_id, 'EVENT', test_user_id);
        INSERT INTO events (event_id, user_id, slug, title, mode, start_at, end_at)
        VALUES (evt_id, test_user_id, 'stock-test-event', 'StockTest', 'TICKETING', now(), now() + interval '1 day');
        BEGIN
            INSERT INTO ticket_types (event_id, name, category, price, total_stock, sold_count, reserved_count)
            VALUES (evt_id, 'VIP', 'VIP', 50, 10, 8, 5);  -- 8+5=13 > 10 -> doit échouer
        EXCEPTION WHEN OTHERS THEN
            err_caught := TRUE;
        END;
    END;
    IF err_caught THEN
        pass_count := pass_count + 1;
        RAISE NOTICE 'TEST 8 PASS : survente de stock correctement rejetée';
    ELSE
        RAISE WARNING 'TEST 8 FAIL : survente de stock acceptée';
    END IF;

    RAISE NOTICE '=== RESULTAT : % / % TESTS PASSES ===', pass_count, test_count;
    IF pass_count <> test_count THEN
        RAISE EXCEPTION 'AU MOINS UN TEST A ECHOUE';
    END IF;
END;
$$;

ROLLBACK;

-- ---------------------------------------------------------------------
-- TEST 9 (hors transaction, car teste un trigger qui lève une exception
-- non capturée par un simple bloc try/catch applicatif standard) :
-- AuditLog immuable.
-- ---------------------------------------------------------------------
DO $$
DECLARE
    test_audit_id UUID;
    err_caught BOOLEAN := FALSE;
BEGIN
    INSERT INTO audit_logs (actor_id, actor_role, action_type, entity_type, entity_id, ip)
    VALUES (gen_random_uuid(), 'ADMIN', 'CREATE', 'test', gen_random_uuid(), '127.0.0.1')
    RETURNING audit_id INTO test_audit_id;

    BEGIN
        DELETE FROM audit_logs WHERE audit_id = test_audit_id;
    EXCEPTION WHEN OTHERS THEN
        err_caught := TRUE;
    END;

    IF err_caught THEN
        RAISE NOTICE 'TEST 9 PASS : audit_logs refuse bien le DELETE (immuabilité confirmée)';
    ELSE
        RAISE WARNING 'TEST 9 FAIL : audit_logs a accepté un DELETE (violation grave)';
    END IF;

    -- nettoyage de la ligne de test (désactivation ponctuelle du trigger,
    -- pratique réservée aux scripts de test, jamais en production)
    ALTER TABLE audit_logs DISABLE TRIGGER trg_audit_logs_no_delete;
    DELETE FROM audit_logs WHERE audit_id = test_audit_id;
    ALTER TABLE audit_logs ENABLE TRIGGER trg_audit_logs_no_delete;
END;
$$;

\echo 'Suite de tests terminée. Voir les NOTICE/WARNING ci-dessus pour le détail.'
