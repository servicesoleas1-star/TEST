-- =====================================================================
-- seed_full_demo.sql
-- Jeu de données de démonstration COMPLET pour développement local
-- =====================================================================
-- Ne pas exécuter en production. Conçu pour peupler une base fraîchement
-- migrée (00_extensions_and_enums.sql -> 15_backend_fixes.sql déjà
-- exécutées, aucune donnée existante) avec :
--   - 3 pays actifs, moyens de paiement variés (pour tester les drapeaux
--     et logos de paiement sur les pages Accueil / Tarifs)
--   - 2 agrégateurs de paiement
--   - la configuration plateforme (site_configs -> numéro WhatsApp,
--     contact, réseaux sociaux)
--   - 1 super admin + 3 organisateurs, tous connectables avec le mot de
--     passe  Demo1234!
--   - une campagne de CHAQUE type (POLL, EVENT, FUNDRAISER, CF_PROJECT,
--     SPONSOR_CALL, CONTEST, LOTTERY), avec des transactions PAYÉES pour
--     voir les moyens de paiement fonctionner de bout en bout
--   - la table `visitors` est VOLONTAIREMENT laissée vide : elle doit se
--     peupler toute seule via le vrai parcours (initVisitorId() côté
--     frontend + POST /api/visitors/init côté backend) pendant vos tests
--     manuels, pas être pré-remplie ici.
--
-- Pour l'exécuter dans pgAdmin : ouvrez ce fichier dans le Query Tool sur
-- la base moledievents, puis "Execute" (F5).
-- =====================================================================

BEGIN;

-- =====================================================================
-- 1. PAYS & MOYENS DE PAIEMENT
-- =====================================================================
INSERT INTO country_configs (country_code, country_name, currency, methods_available) VALUES
    ('CM', 'Cameroun',       'XAF', ARRAY['MOBILE_MONEY','CARD']::payment_method[]),
    ('CI', 'Côte d''Ivoire', 'XOF', ARRAY['MOBILE_MONEY']::payment_method[]),
    ('SN', 'Sénégal',        'XOF', ARRAY['MOBILE_MONEY','CARD']::payment_method[])
ON CONFLICT (country_code) DO NOTHING;

INSERT INTO aggregators (aggregator_id, name, countries, payment_methods, priority, api_endpoint, health_endpoint) VALUES
    ('10000000-0000-0000-0000-0000000a0001', 'Orange Money Cameroun', ARRAY['CM'], ARRAY['MOBILE_MONEY']::payment_method[], 10, 'https://demo-orange.example.com/api', 'https://demo-orange.example.com/health'),
    ('10000000-0000-0000-0000-0000000a0002', 'DemoPSP Carte Bancaire', ARRAY['CM','SN'], ARRAY['CARD']::payment_method[], 20, 'https://demo-card-psp.example.com/api', 'https://demo-card-psp.example.com/health'),
    ('10000000-0000-0000-0000-0000000a0003', 'MTN Mobile Money', ARRAY['CI','SN'], ARRAY['MOBILE_MONEY']::payment_method[], 15, 'https://demo-mtn.example.com/api', 'https://demo-mtn.example.com/health');

-- =====================================================================
-- 2. CONFIGURATION PLATEFORME (bouton WhatsApp flottant, contact...)
-- =====================================================================
INSERT INTO site_configs (contact_email, admin_email, support_phone, whatsapp_support, social_links, response_time_label)
VALUES (
    'contact@moledievent.com',
    'admin@moledievent.com',
    '+237600000000',
    '237600000000',
    '{"facebook":"https://facebook.com/moledievents","instagram":"https://instagram.com/moledievents","x":"https://x.com/moledievents"}'::jsonb,
    'Réponse sous 24h ouvrées'
);

-- =====================================================================
-- 2bis. SOURCES D'ACQUISITION (formulaire d'inscription : "Comment
-- avez-vous connu Moledi Events ?")
-- =====================================================================
INSERT INTO acquisition_sources (source_id, name, type, active) VALUES
    ('10000000-0000-0000-0000-0000000b0001', 'Facebook', 'SOCIAL_NETWORK', TRUE),
    ('10000000-0000-0000-0000-0000000b0002', 'WhatsApp', 'SOCIAL_NETWORK', TRUE),
    ('10000000-0000-0000-0000-0000000b0003', 'TikTok', 'SOCIAL_NETWORK', TRUE),
    ('10000000-0000-0000-0000-0000000b0004', 'Recommandation (bouche à oreille)', 'OTHER', TRUE),
    ('10000000-0000-0000-0000-0000000b0005', 'Influenceur / Créateur de contenu', 'INFLUENCER', TRUE),
    ('10000000-0000-0000-0000-0000000b0006', 'Lors d''un événement', 'EVENT', TRUE),
    ('10000000-0000-0000-0000-0000000b0007', 'Publicité en ligne', 'ADVERTISING', TRUE),
    ('10000000-0000-0000-0000-0000000b0008', 'Autre', 'OTHER', TRUE);

-- =====================================================================
-- 3. COMPTES DE DÉMONSTRATION (mot de passe pour tous : Demo1234!)
-- =====================================================================
-- Hash bcrypt (coût 12) de "Demo1234!" — généré avec la même lib
-- (bcryptjs) et le même coût que utils/password.js, garanti compatible
-- avec la page de connexion réelle.
-- password_hash : $2a$12$/8SS.NmszJEklI2wOcVxweSnV.Eya6I2nMu7NkfcJpSpoJlOQQ4la

INSERT INTO users (user_id, role, full_name, email, password_hash, email_verified, status) VALUES
    ('10000000-0000-0000-0000-000000000001', 'SUPER_ADMIN', 'Nelza Admin',   'admin@moledi-demo.cm',      '$2a$12$/8SS.NmszJEklI2wOcVxweSnV.Eya6I2nMu7NkfcJpSpoJlOQQ4la', TRUE, 'ACTIVE'),
    ('10000000-0000-0000-0000-000000000002', 'ORGANIZER',   'Awa Mballa',    'awa.organizer@moledi-demo.cm', '$2a$12$/8SS.NmszJEklI2wOcVxweSnV.Eya6I2nMu7NkfcJpSpoJlOQQ4la', TRUE, 'ACTIVE'),
    ('10000000-0000-0000-0000-000000000003', 'ORGANIZER',   'Junior Fotso',  'junior.organizer@moledi-demo.cm', '$2a$12$/8SS.NmszJEklI2wOcVxweSnV.Eya6I2nMu7NkfcJpSpoJlOQQ4la', TRUE, 'ACTIVE'),
    ('10000000-0000-0000-0000-000000000004', 'ORGANIZER',   'Sarah Diop',    'sarah.organizer@moledi-demo.cm', '$2a$12$/8SS.NmszJEklI2wOcVxweSnV.Eya6I2nMu7NkfcJpSpoJlOQQ4la', TRUE, 'ACTIVE');

INSERT INTO user_preferences (user_id, language) VALUES
    ('10000000-0000-0000-0000-000000000001', 'FR'),
    ('10000000-0000-0000-0000-000000000002', 'FR'),
    ('10000000-0000-0000-0000-000000000003', 'FR'),
    ('10000000-0000-0000-0000-000000000004', 'EN');

INSERT INTO organizer_balances (user_id, available_amount, reserved_amount) VALUES
    ('10000000-0000-0000-0000-000000000002', 0, 0),
    ('10000000-0000-0000-0000-000000000003', 0, 0),
    ('10000000-0000-0000-0000-000000000004', 0, 0);

INSERT INTO admin_permissions (
    user_id, view_events, edit_events, view_users, manage_users,
    view_finances, manage_finances, view_tickets, reply_tickets,
    mass_communication, manage_pricing, manage_aggregators,
    feature_flags, global_payout_block, configure_payment_countries
)
VALUES ('10000000-0000-0000-0000-000000000001', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE);

-- =====================================================================
-- 3bis. COMMISSIONS GLOBALES — 10% pour tous les types de campagne, sans
-- exception (page /tarifs), configurées par le super admin de démo.
-- =====================================================================
INSERT INTO commission_configs (type, rate, modified_by) VALUES
    ('VOTE', 0.10, '10000000-0000-0000-0000-000000000001'),
    ('TICKET', 0.10, '10000000-0000-0000-0000-000000000001'),
    ('DONATION', 0.10, '10000000-0000-0000-0000-000000000001'),
    ('CF', 0.10, '10000000-0000-0000-0000-000000000001'),
    ('CONTEST', 0.10, '10000000-0000-0000-0000-000000000001'),
    ('LOTTERY', 0.10, '10000000-0000-0000-0000-000000000001');

-- =====================================================================
-- 4. SCRUTIN (POLL) — "Miss Demo 2026", avec un vote gratuit + un vote payé
-- =====================================================================
INSERT INTO campaigns (campaign_id, campaign_type, owner_user_id)
VALUES ('10000000-0000-0000-0000-0000000c0001', 'POLL', '10000000-0000-0000-0000-000000000002');

INSERT INTO polls (poll_id, user_id, slug, title, description, category, status, vote_type, price_per_vote, open_at, close_at, results_visibility)
VALUES (
    '10000000-0000-0000-0000-0000000c0001',
    '10000000-0000-0000-0000-000000000002',
    'scrutin-demo-talents-2026',
    'Miss Demo 2026',
    'Scrutin de démonstration : concours de talents avec vote gratuit et vote payant.',
    'Beauté',
    'OPEN',
    'PAID',
    500,
    now() - interval '2 days',
    now() + interval '28 days',
    'PUBLIC'
);

INSERT INTO candidate_categories (category_id, poll_id, name, position)
VALUES ('10000000-0000-0000-0000-0000000cc001', '10000000-0000-0000-0000-0000000c0001', 'Région Centre', 1);

INSERT INTO candidates (candidate_id, poll_id, category_id, real_name, display_name, score, position) VALUES
    ('10000000-0000-0000-0000-0000000cd001', '10000000-0000-0000-0000-0000000c0001', '10000000-0000-0000-0000-0000000cc001', 'Marie Ngo', 'Marie N.', 0, 1),
    ('10000000-0000-0000-0000-0000000cd002', '10000000-0000-0000-0000-0000000c0001', '10000000-0000-0000-0000-0000000cc001', 'Fatou Bello', 'Fatou B.', 0, 2);

-- Visiteur du vote payé + sa transaction (500 XAF, Mobile Money, Cameroun)
INSERT INTO visitors (visitor_id, browser, os, language, ip_hashed)
VALUES ('10000000-0000-0000-0000-000000005001', 'Chrome', 'Android', 'FR', 'demo-hash-0001');

INSERT INTO transactions (transaction_id, campaign_id, campaign_type, type, visitor_id, gross_amount, moledi_commission, psp_fee, net_organizer, status, idempotency_key, aggregator_id, country, payment_method, operator, correlation_id, confirmed_at)
VALUES ('10000000-0000-0000-0000-0000000f0001', '10000000-0000-0000-0000-0000000c0001', 'POLL', 'VOTE', '10000000-0000-0000-0000-000000005001', 500, 50, 5, 445, 'CONFIRMED', 'demo-idem-vote-0001', '10000000-0000-0000-0000-0000000a0001', 'CM', 'MOBILE_MONEY', 'Orange', 'demo-corr-vote-0001', now());

INSERT INTO votes (vote_id, poll_id, candidate_id, visitor_id, vote_type, status, verification_method, short_id, ip_hashed, transaction_id)
VALUES (gen_random_uuid(), '10000000-0000-0000-0000-0000000c0001', '10000000-0000-0000-0000-0000000cd001', '10000000-0000-0000-0000-000000005001', 'PAID', 'COUNTED', 'psp_confirmed', 'X4K9P2QR', 'demo-hash-0001', '10000000-0000-0000-0000-0000000f0001');

-- Vote gratuit d'un second visiteur
INSERT INTO visitors (visitor_id, browser, os, language, ip_hashed)
VALUES ('10000000-0000-0000-0000-000000005002', 'Safari', 'iOS', 'FR', 'demo-hash-0002');

INSERT INTO votes (vote_id, poll_id, candidate_id, visitor_id, vote_type, status, verification_method, short_id, ip_hashed)
VALUES (gen_random_uuid(), '10000000-0000-0000-0000-0000000c0001', '10000000-0000-0000-0000-0000000cd002', '10000000-0000-0000-0000-000000005002', 'FREE_VISITOR_ID', 'COUNTED', 'visitor_id_silent_check', 'Y7M2N4PQ', 'demo-hash-0002');

UPDATE candidates SET score = 1 WHERE candidate_id IN ('10000000-0000-0000-0000-0000000cd001', '10000000-0000-0000-0000-0000000cd002');

-- =====================================================================
-- 5. ÉVÉNEMENT (EVENT) — concert avec billetterie payée
-- =====================================================================
INSERT INTO campaigns (campaign_id, campaign_type, owner_user_id)
VALUES ('10000000-0000-0000-0000-0000000c0002', 'EVENT', '10000000-0000-0000-0000-000000000003');

INSERT INTO events (event_id, user_id, slug, title, description, category, status, mode, start_at, end_at)
VALUES (
    '10000000-0000-0000-0000-0000000c0002',
    '10000000-0000-0000-0000-000000000003',
    'concert-demo-douala-2026',
    'Concert Démo — Douala Live 2026',
    'Grande soirée concert de démonstration, avec billetterie Mobile Money.',
    'Concert',
    'PUBLISHED',
    'TICKETING',
    now() + interval '20 days',
    now() + interval '20 days' + interval '5 hours'
);

INSERT INTO event_venues (event_id, hall_name, address, city, country)
VALUES ('10000000-0000-0000-0000-0000000c0002', 'Palais des Congrès', 'Boulevard de la Liberté', 'Douala', 'Cameroun');

INSERT INTO ticket_types (ticket_type_id, event_id, name, category, price, total_stock, sold_count)
VALUES ('10000000-0000-0000-0000-00000000ee01', '10000000-0000-0000-0000-0000000c0002', 'Standard', 'STANDARD', 5000, 200, 1);

INSERT INTO visitors (visitor_id, browser, os, language, ip_hashed)
VALUES ('10000000-0000-0000-0000-000000005003', 'Chrome', 'Windows', 'FR', 'demo-hash-0003');

INSERT INTO transactions (transaction_id, campaign_id, campaign_type, type, visitor_id, gross_amount, moledi_commission, psp_fee, net_organizer, status, idempotency_key, aggregator_id, country, payment_method, operator, correlation_id, confirmed_at)
VALUES ('10000000-0000-0000-0000-0000000f0002', '10000000-0000-0000-0000-0000000c0002', 'EVENT', 'TICKET', '10000000-0000-0000-0000-000000005003', 5000, 350, 25, 4625, 'CONFIRMED', 'demo-idem-ticket-0001', '10000000-0000-0000-0000-0000000a0001', 'CM', 'MOBILE_MONEY', 'Orange', 'demo-corr-ticket-0001', now());

INSERT INTO ticket_purchases (event_id, ticket_type_id, visitor_id, transaction_id, qr_code_content, delivery_channel, buyer_name, buyer_email, short_id)
VALUES ('10000000-0000-0000-0000-0000000c0002', '10000000-0000-0000-0000-00000000ee01', '10000000-0000-0000-0000-000000005003', '10000000-0000-0000-0000-0000000f0002', 'demo-qr-ticket-0001', 'WHATSAPP', 'Client Démo', 'client.demo@example.com', 'T1K2E3T4');

-- =====================================================================
-- 6. CAGNOTTE (FUNDRAISER) — don avec transaction payée
-- =====================================================================
INSERT INTO campaigns (campaign_id, campaign_type, owner_user_id)
VALUES ('10000000-0000-0000-0000-0000000c0003', 'FUNDRAISER', '10000000-0000-0000-0000-000000000004');

INSERT INTO fundraisers (fundraiser_id, user_id, slug, title, description, goal_amount, collected_amount, donors_count, status)
VALUES (
    '10000000-0000-0000-0000-0000000c0003',
    '10000000-0000-0000-0000-000000000004',
    'cagnotte-demo-urgence-medicale',
    'Cagnotte Démo — Urgence médicale',
    'Cagnotte de démonstration pour une urgence médicale.',
    2000000,
    50000,
    1,
    'ACTIVE'
);

INSERT INTO visitors (visitor_id, browser, os, language, ip_hashed)
VALUES ('10000000-0000-0000-0000-000000005004', 'Chrome', 'Android', 'FR', 'demo-hash-0004');

INSERT INTO transactions (transaction_id, campaign_id, campaign_type, type, visitor_id, gross_amount, moledi_commission, psp_fee, net_organizer, status, idempotency_key, aggregator_id, country, payment_method, operator, correlation_id, confirmed_at)
VALUES ('10000000-0000-0000-0000-0000000f0003', '10000000-0000-0000-0000-0000000c0003', 'FUNDRAISER', 'DONATION', '10000000-0000-0000-0000-000000005004', 50000, 3500, 250, 46250, 'CONFIRMED', 'demo-idem-don-0001', '10000000-0000-0000-0000-0000000a0003', 'SN', 'MOBILE_MONEY', 'MTN', 'demo-corr-don-0001', now());

INSERT INTO donations (fundraiser_id, visitor_id, transaction_id, amount, donor_name, status, short_id)
VALUES ('10000000-0000-0000-0000-0000000c0003', '10000000-0000-0000-0000-000000005004', '10000000-0000-0000-0000-0000000f0003', 50000, 'Donateur Démo', 'CONFIRMED', 'D1O2N3A4');

-- =====================================================================
-- 7. CROWDFUNDING (CF_PROJECT) — projet avec contribution payée
-- =====================================================================
INSERT INTO campaigns (campaign_id, campaign_type, owner_user_id)
VALUES ('10000000-0000-0000-0000-0000000c0004', 'CF_PROJECT', '10000000-0000-0000-0000-000000000002');

INSERT INTO cf_projects (project_id, user_id, slug, title, description, goal_amount, raised_amount, backers_count, deadline, status)
VALUES (
    '10000000-0000-0000-0000-0000000c0004',
    '10000000-0000-0000-0000-000000000002',
    'projet-demo-application-mobile',
    'Projet Démo — Application mobile locale',
    'Projet de crowdfunding de démonstration.',
    5000000,
    75000,
    1,
    now() + interval '45 days',
    'ACTIVE'
);

INSERT INTO visitors (visitor_id, browser, os, language, ip_hashed)
VALUES ('10000000-0000-0000-0000-000000005005', 'Firefox', 'Linux', 'FR', 'demo-hash-0005');

INSERT INTO transactions (transaction_id, campaign_id, campaign_type, type, visitor_id, gross_amount, moledi_commission, psp_fee, net_organizer, status, idempotency_key, aggregator_id, country, payment_method, operator, correlation_id, confirmed_at)
VALUES ('10000000-0000-0000-0000-0000000f0004', '10000000-0000-0000-0000-0000000c0004', 'CF_PROJECT', 'CF_CONTRIBUTION', '10000000-0000-0000-0000-000000005005', 75000, 5250, 375, 69375, 'CONFIRMED', 'demo-idem-cf-0001', '10000000-0000-0000-0000-0000000a0002', 'CM', 'CARD', NULL, 'demo-corr-cf-0001', now());

INSERT INTO cf_contributions (project_id, visitor_id, transaction_id, amount, contributor_name, email, country, status, short_id)
VALUES ('10000000-0000-0000-0000-0000000c0004', '10000000-0000-0000-0000-000000005005', '10000000-0000-0000-0000-0000000f0004', 75000, 'Contributeur Démo', 'contributeur.demo@example.com', 'Cameroun', 'CONFIRMED', 'C1F2P3R4');

-- =====================================================================
-- 8. APPEL AU SPONSORING (SPONSOR_CALL)
-- =====================================================================
INSERT INTO campaigns (campaign_id, campaign_type, owner_user_id)
VALUES ('10000000-0000-0000-0000-0000000c0005', 'SPONSOR_CALL', '10000000-0000-0000-0000-000000000003');

INSERT INTO sponsor_calls (call_id, user_id, slug, title, event_description, expected_audience, deadline, status)
VALUES (
    '10000000-0000-0000-0000-0000000c0005',
    '10000000-0000-0000-0000-000000000003',
    'appel-sponsors-demo-festival',
    'Appel Démo — Festival culturel',
    'Recherche de sponsors pour un festival culturel de démonstration.',
    '5000 visiteurs attendus sur 3 jours',
    now() + interval '30 days',
    'ACTIVE'
);

INSERT INTO sponsorship_levels (level_id, call_id, name, min_amount, perks)
VALUES ('10000000-0000-0000-0000-00000000bb01', '10000000-0000-0000-0000-0000000c0005', 'GOLD', 500000, 'Logo sur toute la communication + stand dédié');

INSERT INTO visitors (visitor_id, browser, os, language, ip_hashed)
VALUES ('10000000-0000-0000-0000-000000005006', 'Chrome', 'macOS', 'FR', 'demo-hash-0006');

INSERT INTO transactions (transaction_id, campaign_id, campaign_type, type, visitor_id, gross_amount, moledi_commission, psp_fee, net_organizer, status, idempotency_key, aggregator_id, country, payment_method, operator, correlation_id, confirmed_at)
VALUES ('10000000-0000-0000-0000-0000000f0005', '10000000-0000-0000-0000-0000000c0005', 'SPONSOR_CALL', 'SPONSORSHIP', '10000000-0000-0000-0000-000000005006', 0, 0, 0, 0, 'CONFIRMED', 'demo-idem-sponsor-0001', '10000000-0000-0000-0000-0000000a0001', 'CM', 'MOBILE_MONEY', 'Orange', 'demo-corr-sponsor-0001', now());

INSERT INTO sponsor_applications (call_id, company_name, email, phone, sector, level_id, description, transaction_id, status)
VALUES ('10000000-0000-0000-0000-0000000c0005', 'Entreprise Démo SARL', 'contact@entreprise-demo.cm', '+237690000000', 'Télécommunications', '10000000-0000-0000-0000-00000000bb01', 'Candidature de démonstration.', '10000000-0000-0000-0000-0000000f0005', 'PENDING');

-- =====================================================================
-- 9. JEU-CONCOURS (CONTEST) — avec frais d'inscription payés
-- =====================================================================
INSERT INTO campaigns (campaign_id, campaign_type, owner_user_id)
VALUES ('10000000-0000-0000-0000-0000000c0006', 'CONTEST', '10000000-0000-0000-0000-000000000004');

INSERT INTO contests (contest_id, user_id, slug, title, description, format, entry_fee, max_participants, registration_opens_at, registration_closes_at, finals_at, status)
VALUES (
    '10000000-0000-0000-0000-0000000c0006',
    '10000000-0000-0000-0000-000000000004',
    'concours-demo-talents-2026',
    'Concours Démo — Talents 2026',
    'Jeu-concours de démonstration avec frais d’inscription.',
    'SUBMISSION',
    1000,
    100,
    now() - interval '5 days',
    now() + interval '10 days',
    now() + interval '15 days',
    'ACTIVE'
);

INSERT INTO visitors (visitor_id, browser, os, language, ip_hashed)
VALUES ('10000000-0000-0000-0000-000000005007', 'Chrome', 'Android', 'FR', 'demo-hash-0007');

INSERT INTO transactions (transaction_id, campaign_id, campaign_type, type, visitor_id, gross_amount, moledi_commission, psp_fee, net_organizer, status, idempotency_key, aggregator_id, country, payment_method, operator, correlation_id, confirmed_at)
VALUES ('10000000-0000-0000-0000-0000000f0006', '10000000-0000-0000-0000-0000000c0006', 'CONTEST', 'CONTEST_ENTRY', '10000000-0000-0000-0000-000000005007', 1000, 100, 10, 890, 'CONFIRMED', 'demo-idem-contest-0001', '10000000-0000-0000-0000-0000000a0003', 'CI', 'MOBILE_MONEY', 'MTN', 'demo-corr-contest-0001', now());

INSERT INTO contest_participants (contest_id, visitor_id, name, email, entry_fee_transaction_id, status)
VALUES ('10000000-0000-0000-0000-0000000c0006', '10000000-0000-0000-0000-000000005007', 'Participant Démo', 'participant.demo@example.com', '10000000-0000-0000-0000-0000000f0006', 'REGISTERED');

-- =====================================================================
-- 10. TOMBOLA (LOTTERY) — avec ticket payé
-- =====================================================================
INSERT INTO campaigns (campaign_id, campaign_type, owner_user_id)
VALUES ('10000000-0000-0000-0000-0000000c0007', 'LOTTERY', '10000000-0000-0000-0000-000000000002');

INSERT INTO lotteries (lottery_id, user_id, slug, title, description, ticket_price, max_tickets, tickets_sold, draw_at, status)
VALUES (
    '10000000-0000-0000-0000-0000000c0007',
    '10000000-0000-0000-0000-000000000002',
    'tombola-demo-2026',
    'Tombola Démo 2026',
    'Tombola de démonstration, tirage automatique.',
    2000,
    500,
    1,
    now() + interval '25 days',
    'ACTIVE'
);

INSERT INTO visitors (visitor_id, browser, os, language, ip_hashed)
VALUES ('10000000-0000-0000-0000-000000005008', 'Chrome', 'Windows', 'FR', 'demo-hash-0008');

INSERT INTO transactions (transaction_id, campaign_id, campaign_type, type, visitor_id, gross_amount, moledi_commission, psp_fee, net_organizer, status, idempotency_key, aggregator_id, country, payment_method, operator, correlation_id, confirmed_at)
VALUES ('10000000-0000-0000-0000-0000000f0007', '10000000-0000-0000-0000-0000000c0007', 'LOTTERY', 'LOTTERY_TICKET', '10000000-0000-0000-0000-000000005008', 2000, 200, 20, 1780, 'CONFIRMED', 'demo-idem-lottery-0001', '10000000-0000-0000-0000-0000000a0001', 'CM', 'MOBILE_MONEY', 'Orange', 'demo-corr-lottery-0001', now());

INSERT INTO lottery_tickets (lottery_id, unique_number, buyer_name, buyer_email, buyer_phone, visitor_id, transaction_id)
VALUES ('10000000-0000-0000-0000-0000000c0007', 'TOMB-000001', 'Joueur Démo', 'joueur.demo@example.com', '+237690000001', '10000000-0000-0000-0000-000000005008', '10000000-0000-0000-0000-0000000f0007');

-- =====================================================================
-- 11. FEATURE FLAGS
-- =====================================================================
INSERT INTO feature_flags (name, description, active, modified_by) VALUES
    ('enable_crowdfunding', 'Active le module crowdfunding (V2)', TRUE, '10000000-0000-0000-0000-000000000001'),
    ('enable_ai_generation', 'Active la génération de page par IA (V4 bêta)', FALSE, '10000000-0000-0000-0000-000000000001'),
    ('maintenance_mode', 'Bascule le mode maintenance global', FALSE, '10000000-0000-0000-0000-000000000001')
ON CONFLICT (name) DO NOTHING;

-- =====================================================================
-- 12. FAQ GLOBALE (page "Comment ça marche", modifiable depuis l'admin)
-- =====================================================================
INSERT INTO global_faqs (faq_id, type, question, answer, position, active) VALUES
('10000000-0000-0000-0000-0000000c0001', 'HOW_IT_WORKS', 'Ai-je besoin d''un compte pour voter, donner ou acheter un billet ?', 'Non. En tant que visiteur, vous pouvez voter, faire un don ou acheter un billet directement, sans créer de compte. Un identifiant de session (Visitor ID) suffit.', 1, TRUE),
('10000000-0000-0000-0000-0000000c0002', 'HOW_IT_WORKS', 'Qui doit créer un compte ?', 'Seuls les organisateurs (créateurs de scrutins, événements, cagnottes...) ont besoin d''un compte pour gérer leurs campagnes et leurs finances.', 2, TRUE),
('10000000-0000-0000-0000-0000000c0003', 'HOW_IT_WORKS', 'Combien de temps faut-il pour recevoir mes fonds ?', 'C''est instantané. Dès qu''un paiement Mobile Money ou carte est confirmé par l''opérateur, le montant (net de la commission) est immédiatement disponible dans votre solde organisateur, visible en temps réel depuis votre tableau de bord. Vous pouvez ensuite demander un retrait vers votre numéro Mobile Money à tout moment.', 3, TRUE),
('10000000-0000-0000-0000-0000000c0004', 'HOW_IT_WORKS', 'Quels moyens de paiement sont acceptés ?', 'Le Mobile Money (Orange Money, MTN Mobile Money...) selon les opérateurs actifs dans votre pays, ainsi que le paiement par carte bancaire là où il est disponible. La liste exacte des moyens de paiement par pays est visible sur la page Tarifs.', 4, TRUE),
('10000000-0000-0000-0000-0000000c0005', 'HOW_IT_WORKS', 'Dans quels pays Moledi Event est-il disponible ?', 'La couverture s''étend progressivement à travers l''Afrique francophone et anglophone. La liste des pays actifs, avec leurs moyens de paiement respectifs, est visible en temps réel sur la page d''accueil et sur la page Tarifs.', 5, TRUE),
('10000000-0000-0000-0000-0000000c0006', 'HOW_IT_WORKS', 'Le site est-il disponible en anglais ?', 'Oui. Un sélecteur de langue FR/EN est disponible en permanence dans l''en-tête du site, sur toutes les pages. Votre préférence est mémorisée et vous suit durant toute votre navigation.', 6, TRUE),
('10000000-0000-0000-0000-0000000c0007', 'HOW_IT_WORKS', 'Mes données personnelles sont-elles en sécurité ?', 'Oui. Vos mots de passe sont hachés (jamais stockés en clair), vos données de paiement ne transitent jamais par nos serveurs (traitées directement par l''agrégateur de paiement), et le détail complet du traitement de vos données est disponible dans notre politique de confidentialité.', 7, TRUE),
('10000000-0000-0000-0000-0000000c0008', 'HOW_IT_WORKS', 'Puis-je annuler une campagne après sa création ?', 'Oui, depuis votre tableau de bord. Selon le type de campagne et si des paiements ont déjà été reçus, une politique de remboursement peut alors s''appliquer — elle est toujours affichée clairement sur la page de la campagne avant tout paiement.', 8, TRUE),
('10000000-0000-0000-0000-0000000c0009', 'HOW_IT_WORKS', 'Comment contacter le support en cas de problème ?', 'Via le bouton WhatsApp flottant présent sur toutes les pages, via la page Contact, ou en ouvrant un ticket depuis votre tableau de bord organisateur une fois connecté.', 9, TRUE),
('10000000-0000-0000-0000-0000000c0010', 'POLL_TEMPLATE', 'Comment sont vérifiés les votes en double ?', 'Selon la méthode choisie à la création du scrutin : Visitor ID, email, numéro de téléphone, code SMS ou WhatsApp.', 1, TRUE),
('10000000-0000-0000-0000-0000000c0011', 'POLL_TEMPLATE', 'Le procès-verbal de clôture est-il fiable ?', 'Oui, il inclut un hash SHA-256 permettant de vérifier son intégrité, et il est signé par un superviseur.', 2, TRUE),
('10000000-0000-0000-0000-0000000c0012', 'EVENT_TEMPLATE', 'Comment mes participants reçoivent-ils leur billet ?', 'Immédiatement après paiement, par email et/ou WhatsApp selon le canal choisi, avec un QR code unique. Ce billet ne peut être scanné qu''une seule fois à l''entrée.', 1, TRUE),
('10000000-0000-0000-0000-0000000c0013', 'EVENT_TEMPLATE', 'Que se passe-t-il si mon événement est annulé ?', 'Vous pouvez déclencher le remboursement de tous les billets déjà vendus depuis votre tableau de bord, selon la politique de remboursement définie à la création de l''événement.', 2, TRUE),
('10000000-0000-0000-0000-0000000c0014', 'DONATION_TEMPLATE', 'Les donateurs peuvent-ils rester anonymes ?', 'Oui, une option "don anonyme" est disponible à la contribution : le nom du donateur n''est alors visible ni sur la page publique, ni dans les exports.', 1, TRUE),
('10000000-0000-0000-0000-0000000c0015', 'DONATION_TEMPLATE', 'Un reçu est-il délivré pour chaque don ?', 'Oui, un reçu numérique est généré automatiquement et envoyé au donateur dès confirmation du paiement.', 2, TRUE),
('10000000-0000-0000-0000-0000000c0016', 'CF_TEMPLATE', 'Que se passe-t-il si mon objectif de financement n''est pas atteint ?', 'Selon la politique choisie à la création du projet : soit vous conservez les fonds déjà collectés (financement flexible), soit les contributeurs sont automatiquement remboursés si le seuil promis n''est pas atteint (tout ou rien).', 1, TRUE),
('10000000-0000-0000-0000-0000000c0017', 'CF_TEMPLATE', 'Puis-je proposer des contreparties à mes contributeurs ?', 'Oui, vous pouvez définir plusieurs paliers de contribution, chacun avec sa propre contrepartie (accès anticipé, produit, remerciement personnalisé...).', 2, TRUE),
('10000000-0000-0000-0000-0000000c0018', 'CONTEST_TEMPLATE', 'Comment le tirage au sort est-il certifié ?', 'L''algorithme de tirage est vérifiable et un procès-verbal est généré automatiquement à la désignation du ou des gagnants — personne, pas même l''organisateur, ne peut influencer le résultat après la clôture des inscriptions.', 1, TRUE),
('10000000-0000-0000-0000-0000000c0019', 'CONTEST_TEMPLATE', 'Puis-je limiter le nombre de participations par personne ?', 'Oui, la limite se configure à la création du jeu-concours ou de la tombola, avec la même méthode anti-doublon que pour les scrutins.', 2, TRUE)
ON CONFLICT (faq_id) DO NOTHING;

COMMIT;

\echo '======================================================================='
\echo 'Seed complet inséré avec succès :'
\echo '  - 3 pays (CM, CI, SN), 3 agrégateurs, config plateforme (WhatsApp...)'
\echo '  - 4 comptes (1 super admin + 3 organisateurs) — mot de passe : Demo1234!'
\echo '      admin@moledi-demo.cm / awa.organizer@moledi-demo.cm /'
\echo '      junior.organizer@moledi-demo.cm / sarah.organizer@moledi-demo.cm'
\echo '  - 7 campagnes (une de chaque type) avec transactions payées'
\echo '  - table visitors : 8 lignes techniques liées aux transactions ci-dessus'
\echo '    (le vrai compteur de visiteurs anonymes, lui, reste à 0 tant que'
\echo '    vous n''avez pas navigué sur le site en local pour le peupler)'
\echo '======================================================================='
