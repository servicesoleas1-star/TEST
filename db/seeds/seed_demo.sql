-- =====================================================================
-- seed_demo.sql
-- Jeu de données minimal de démonstration / développement local
-- =====================================================================
-- Ne pas exécuter en production. Conçu pour vérifier rapidement que
-- l'API peut lire un parcours complet : un organisateur, un scrutin
-- publié avec 2 candidats, un visiteur qui vote gratuitement.
-- =====================================================================

BEGIN;

-- Pays et agrégateur de paiement
INSERT INTO country_configs (country_code, country_name, currency, methods_available)
VALUES ('CM', 'Cameroun', 'XAF', ARRAY['MOBILE_MONEY','CARD']::payment_method[]);

INSERT INTO aggregators (aggregator_id, name, countries, payment_methods, priority, api_endpoint, health_endpoint)
VALUES (
    '00000000-0000-0000-0000-000000000a01',
    'DemoPSP',
    ARRAY['CM'],
    ARRAY['MOBILE_MONEY']::payment_method[],
    10,
    'https://demo-psp.example.com/api',
    'https://demo-psp.example.com/health'
);

-- Organisateur de démonstration
INSERT INTO users (user_id, role, full_name, email, email_verified, status)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'ORGANIZER',
    'Awa Mballa',
    'awa.organizer@liboka-demo.cm',
    TRUE,
    'ACTIVE'
);

INSERT INTO user_preferences (user_id, language)
VALUES ('00000000-0000-0000-0000-000000000001', 'FR');

INSERT INTO organizer_balances (user_id, available_amount, reserved_amount)
VALUES ('00000000-0000-0000-0000-000000000001', 0, 0);

-- Admin de démonstration
INSERT INTO users (user_id, role, full_name, email, email_verified, status)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'SUPER_ADMIN',
    'Nelza Admin',
    'nelza.admin@liboka-demo.cm',
    TRUE,
    'ACTIVE'
);

INSERT INTO admin_permissions (
    user_id, view_events, edit_events, view_users, manage_users,
    view_finances, manage_finances, view_tickets, reply_tickets,
    mass_communication, manage_pricing, manage_aggregators,
    feature_flags, global_payout_block, configure_payment_countries
)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE
);

-- Campagne "scrutin" + Poll
INSERT INTO campaigns (campaign_id, campaign_type, owner_user_id)
VALUES ('00000000-0000-0000-0000-0000000c0001', 'POLL', '00000000-0000-0000-0000-000000000001');

INSERT INTO polls (
    poll_id, user_id, slug, title, description, category,
    status, vote_type, open_at, close_at, results_visibility
)
VALUES (
    '00000000-0000-0000-0000-0000000c0001',
    '00000000-0000-0000-0000-000000000001',
    'miss-demo-2026',
    'Miss Demo 2026',
    'Scrutin de démonstration pour validation du schéma.',
    'Beauté',
    'OPEN',
    'FREE_VISITOR_ID',
    now() - interval '1 day',
    now() + interval '29 days',
    'PUBLIC'
);

INSERT INTO candidate_categories (category_id, poll_id, name, position)
VALUES ('00000000-0000-0000-0000-0000000cc001', '00000000-0000-0000-0000-0000000c0001', 'Région Centre', 1);

INSERT INTO candidates (candidate_id, poll_id, category_id, real_name, display_name, score, position)
VALUES
    ('00000000-0000-0000-0000-0000000cd001', '00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000cc001', 'Marie Ngo', 'Marie N.', 0, 1),
    ('00000000-0000-0000-0000-0000000cd002', '00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000cc001', 'Fatou Bello', 'Fatou B.', 0, 2);

-- Visiteur de démonstration + vote gratuit
INSERT INTO visitors (visitor_id, browser, os, ip_hashed)
VALUES ('00000000-0000-0000-0000-000000005001', 'Chrome', 'Android', 'demo-hash-0001');

INSERT INTO votes (vote_id, poll_id, candidate_id, visitor_id, vote_type, status, verification_method, short_id, ip_hashed)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-0000000c0001',
    '00000000-0000-0000-0000-0000000cd001',
    '00000000-0000-0000-0000-000000005001',
    'FREE_VISITOR_ID',
    'COUNTED',
    'visitor_id_silent_check',
    'X4K9P2QR',
    'demo-hash-0001'
);

UPDATE candidates SET score = 1 WHERE candidate_id = '00000000-0000-0000-0000-0000000cd001';

-- Feature flags de base
INSERT INTO feature_flags (name, description, active, modified_by)
VALUES
    ('enable_crowdfunding', 'Active le module crowdfunding (V2)', FALSE, '00000000-0000-0000-0000-000000000002'),
    ('enable_ai_generation', 'Active la génération de page par IA (V4 bêta)', FALSE, '00000000-0000-0000-0000-000000000002'),
    ('maintenance_mode', 'Bascule le mode maintenance global', FALSE, '00000000-0000-0000-0000-000000000002');

COMMIT;

\echo 'Seed de démonstration inséré : 1 organisateur, 1 admin, 1 scrutin ouvert avec 2 candidats, 1 vote.'
