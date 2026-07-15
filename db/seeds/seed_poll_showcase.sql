-- =====================================================================
-- seed_poll_showcase.sql
-- Jeu de données de démonstration COMPLET pour la section "Scrutin & Vote"
-- =====================================================================
-- À exécuter APRÈS seed_full_demo.sql (réutilise les organisateurs et
-- l'admin déjà créés là-bas : 10000000-0000-0000-0000-000000000001/2/3/4).
--
-- Crée TROIS campagnes de scrutin pour couvrir tous les cas d'affichage
-- demandés :
--   1. Une campagne À VENIR   (open_at dans le futur)
--   2. Une campagne EN COURS  (ouverte, votes actifs)
--   3. Une campagne CLÔTURÉE  (résultats + PV publics)
-- Chacune avec : plusieurs catégories, 10 candidats, une galerie, des
-- partenaires validés, une FAQ propre au scrutin, et des actualités.
--
-- Pour l'exécuter dans pgAdmin : ouvrez ce fichier dans le Query Tool sur
-- la base moledievents (après seed_full_demo.sql), puis "Execute" (F5).
-- =====================================================================

BEGIN;

-- =====================================================================
-- CAMPAGNE 1 — À VENIR : "Élection Miss Culture Douala 2027"
-- =====================================================================
INSERT INTO campaigns (campaign_id, campaign_type, owner_user_id)
VALUES ('20000000-0000-0000-0000-0000000c0001', 'POLL', '10000000-0000-0000-0000-000000000002');

INSERT INTO polls (
    poll_id, user_id, slug, title, description, cover_photo_url, category,
    display_organizer_name, social_links, status, vote_type, price_per_vote,
    vote_packs, max_votes_per_visitor, results_visibility, show_grid_directly,
    open_at, close_at
) VALUES (
    '20000000-0000-0000-0000-0000000c0001',
    '10000000-0000-0000-0000-000000000002',
    'miss-culture-douala-2027',
    'Élection Miss Culture Douala 2027',
    'Grande élection célébrant la richesse culturelle du littoral camerounais. 12 candidates représentant chacune un arrondissement défilent pour le titre de Miss Culture Douala 2027. Ouverture des votes très bientôt !',
    'https://picsum.photos/seed/miss-culture-2027/1600/900',
    'Beauté & Culture',
    'Fondation Sawa Événements',
    '{"facebook":"https://facebook.com/demo-miss-culture","instagram":"https://instagram.com/demo-miss-culture","whatsapp":"https://wa.me/237600000010"}'::jsonb,
    'PUBLISHED', 'PAID', 250,
    '[{"name":"Pack Découverte","votes":10,"price":2000},{"name":"Pack Fan","votes":50,"price":9000},{"name":"Pack VIP","votes":150,"price":25000}]'::jsonb,
    NULL, 'PUBLIC', TRUE,
    now() + interval '18 days', now() + interval '48 days'
);

INSERT INTO candidate_categories (category_id, poll_id, name, position) VALUES
    ('20000000-0000-0000-0000-0000000cc101', '20000000-0000-0000-0000-0000000c0001', 'Zone Akwa', 1),
    ('20000000-0000-0000-0000-0000000cc102', '20000000-0000-0000-0000-0000000c0001', 'Zone Bonanjo', 2),
    ('20000000-0000-0000-0000-0000000cc103', '20000000-0000-0000-0000-0000000c0001', 'Zone Bonabéri', 3);

INSERT INTO candidates (poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, biography, score, rank, position) VALUES
    ('20000000-0000-0000-0000-0000000c0001', '20000000-0000-0000-0000-0000000cc101', 'Chantal Ekwalla', 'Chantal E.', 'https://picsum.photos/seed/mc27-c1/600/800', ARRAY['https://picsum.photos/seed/mc27-c1b/600/800','https://picsum.photos/seed/mc27-c1c/600/800'], 'Étudiante en droit, passionnée de danse traditionnelle bassa.', 0, NULL, 1),
    ('20000000-0000-0000-0000-0000000c0001', '20000000-0000-0000-0000-0000000cc101', 'Solange Mbarga', 'Solange M.', 'https://picsum.photos/seed/mc27-c2/600/800', ARRAY['https://picsum.photos/seed/mc27-c2b/600/800'], 'Créatrice de mode, ambassadrice du pagne wax local.', 0, NULL, 2),
    ('20000000-0000-0000-0000-0000000c0001', '20000000-0000-0000-0000-0000000cc101', 'Rebecca Doualla', 'Rebecca D.', 'https://picsum.photos/seed/mc27-c3/600/800', ARRAY['https://picsum.photos/seed/mc27-c3b/600/800'], 'Chanteuse lyrique, finaliste d''un télé-crochet national.', 0, NULL, 3),
    ('20000000-0000-0000-0000-0000000c0001', '20000000-0000-0000-0000-0000000cc101', 'Aicha Njoya', 'Aicha N.', 'https://picsum.photos/seed/mc27-c4/600/800', ARRAY['https://picsum.photos/seed/mc27-c4b/600/800'], 'Entrepreneuse sociale, fondatrice d''une coopérative de couturières.', 0, NULL, 4),
    ('20000000-0000-0000-0000-0000000c0001', '20000000-0000-0000-0000-0000000cc102', 'Pauline Essomba', 'Pauline E.', 'https://picsum.photos/seed/mc27-c5/600/800', ARRAY['https://picsum.photos/seed/mc27-c5b/600/800'], 'Journaliste culturelle, passionnée de patrimoine sawa.', 0, NULL, 1),
    ('20000000-0000-0000-0000-0000000c0001', '20000000-0000-0000-0000-0000000cc102', 'Grace Tabi', 'Grace T.', 'https://picsum.photos/seed/mc27-c6/600/800', ARRAY['https://picsum.photos/seed/mc27-c6b/600/800'], 'Danseuse professionnelle et professeure de zumba.', 0, NULL, 2),
    ('20000000-0000-0000-0000-0000000c0001', '20000000-0000-0000-0000-0000000cc102', 'Nadège Owona', 'Nadège O.', 'https://picsum.photos/seed/mc27-c7/600/800', ARRAY['https://picsum.photos/seed/mc27-c7b/600/800'], 'Étudiante en médecine, engagée dans le bénévolat hospitalier.', 0, NULL, 3),
    ('20000000-0000-0000-0000-0000000c0001', '20000000-0000-0000-0000-0000000cc103', 'Vanessa Ekotto', 'Vanessa E.', 'https://picsum.photos/seed/mc27-c8/600/800', ARRAY['https://picsum.photos/seed/mc27-c8b/600/800'], 'Photographe, met en lumière les artisans locaux.', 0, NULL, 1),
    ('20000000-0000-0000-0000-0000000c0001', '20000000-0000-0000-0000-0000000cc103', 'Larissa Bilé', 'Larissa B.', 'https://picsum.photos/seed/mc27-c9/600/800', ARRAY['https://picsum.photos/seed/mc27-c9b/600/800'], 'Chef cuisinière, ambassadrice de la gastronomie sawa.', 0, NULL, 2),
    ('20000000-0000-0000-0000-0000000c0001', '20000000-0000-0000-0000-0000000cc103', 'Fabiola Nnomo', 'Fabiola N.', 'https://picsum.photos/seed/mc27-c10/600/800', ARRAY['https://picsum.photos/seed/mc27-c10b/600/800'], 'Athlète, championne régionale d''athlétisme.', 0, NULL, 3);

INSERT INTO poll_partners (poll_id, name, logo_url, website_url, level, validated) VALUES
    ('20000000-0000-0000-0000-0000000c0001', 'Sawa Telecom', 'https://picsum.photos/seed/mc27-p1/300/150', 'https://example.com', 'Or', TRUE),
    ('20000000-0000-0000-0000-0000000c0001', 'Douala Mode Distribution', 'https://picsum.photos/seed/mc27-p2/300/150', 'https://example.com', 'Argent', TRUE),
    ('20000000-0000-0000-0000-0000000c0001', 'Littoral Radio', 'https://picsum.photos/seed/mc27-p3/300/150', NULL, 'Bronze', TRUE);

INSERT INTO poll_faqs (poll_id, question, answer, position) VALUES
    ('20000000-0000-0000-0000-0000000c0001', 'Quand les votes ouvrent-ils exactement ?', 'Les votes ouvriront dans 18 jours, dès 00h00. Une notification sera publiée dans la section Actualités.', 1),
    ('20000000-0000-0000-0000-0000000c0001', 'Puis-je déjà partager la page d''une candidate ?', 'Oui, la fiche de chaque candidate est déjà consultable et partageable — seul le bouton de vote reste inactif jusqu''à l''ouverture.', 2);

INSERT INTO poll_news (poll_id, title, body, photos_urls, published_at) VALUES
    ('20000000-0000-0000-0000-0000000c0001', 'Découvrez les 10 candidates de cette édition', 'Après plus de 200 candidatures reçues, le jury a sélectionné 10 candidates représentant 3 zones de Douala. Rendez-vous dans 18 jours pour l''ouverture officielle des votes !', ARRAY['https://picsum.photos/seed/mc27-news1/900/500'], now() - interval '3 days'),
    ('20000000-0000-0000-0000-0000000c0001', 'Nos partenaires se dévoilent', 'Sawa Telecom rejoint l''édition 2027 en tant que partenaire Or. Merci à tous nos partenaires pour leur confiance renouvelée.', ARRAY['https://picsum.photos/seed/mc27-news2/900/500'], now() - interval '1 days');

INSERT INTO poll_galleries (poll_id, media_url, media_type, tag) VALUES
    ('20000000-0000-0000-0000-0000000c0001', 'https://picsum.photos/seed/mc27-g1/800/800', 'PHOTO', 'BEFORE'),
    ('20000000-0000-0000-0000-0000000c0001', 'https://picsum.photos/seed/mc27-g2/800/800', 'PHOTO', 'BEFORE'),
    ('20000000-0000-0000-0000-0000000c0001', 'https://picsum.photos/seed/mc27-g3/800/800', 'PHOTO', 'BEFORE'),
    ('20000000-0000-0000-0000-0000000c0001', 'https://picsum.photos/seed/mc27-g4/800/800', 'PHOTO', 'BEFORE'),
    ('20000000-0000-0000-0000-0000000c0001', 'https://picsum.photos/seed/mc27-g5/800/800', 'PHOTO', 'BEFORE'),
    ('20000000-0000-0000-0000-0000000c0001', 'https://picsum.photos/seed/mc27-g6/800/800', 'PHOTO', 'BEFORE');

INSERT INTO refund_policies (campaign_id, campaign_type, refundable, delay_hours, percentage)
VALUES ('20000000-0000-0000-0000-0000000c0001', 'POLL', TRUE, 24, 100);

-- =====================================================================
-- CAMPAGNE 2 — EN COURS : "Scrutin Talents Digitaux Afrique 2026"
-- =====================================================================
INSERT INTO campaigns (campaign_id, campaign_type, owner_user_id)
VALUES ('20000000-0000-0000-0000-0000000c0002', 'POLL', '10000000-0000-0000-0000-000000000003');

INSERT INTO polls (
    poll_id, user_id, slug, title, description, cover_photo_url, category,
    display_organizer_name, social_links, status, vote_type, price_per_vote,
    vote_packs, max_votes_per_visitor, otp_enabled, results_visibility, show_grid_directly,
    open_at, close_at
) VALUES (
    '20000000-0000-0000-0000-0000000c0002',
    '10000000-0000-0000-0000-000000000003',
    'talents-digitaux-afrique-2026',
    'Talents Digitaux Afrique 2026',
    'Le plus grand concours de créateurs de contenu digital d''Afrique francophone. 3 catégories, 12 finalistes, un seul objectif : représenter l''innovation africaine sur la scène internationale. Votez pour votre créateur préféré !',
    'https://picsum.photos/seed/talents-digitaux-2026/1600/900',
    'Concours numérique',
    'Digital Africa Network',
    '{"facebook":"https://facebook.com/demo-talents-digitaux","instagram":"https://instagram.com/demo-talents-digitaux","x":"https://x.com/demo-talents","whatsapp":"https://wa.me/237600000020"}'::jsonb,
    'OPEN', 'PAID', 200,
    '[{"name":"Starter","votes":20,"price":3000},{"name":"Booster","votes":100,"price":13000},{"name":"Champion","votes":300,"price":35000}]'::jsonb,
    NULL, FALSE, 'PUBLIC', TRUE,
    now() - interval '9 days', now() + interval '21 days'
);

INSERT INTO candidate_categories (category_id, poll_id, name, position) VALUES
    ('20000000-0000-0000-0000-0000000cc201', '20000000-0000-0000-0000-0000000c0002', 'Créateur Vidéo', 1),
    ('20000000-0000-0000-0000-0000000cc202', '20000000-0000-0000-0000-0000000c0002', 'Créateur Musique', 2),
    ('20000000-0000-0000-0000-0000000cc203', '20000000-0000-0000-0000-0000000c0002', 'Créateur Mode & Art', 3);

INSERT INTO candidates (poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, biography, score, rank, position) VALUES
    ('20000000-0000-0000-0000-0000000c0002', '20000000-0000-0000-0000-0000000cc201', 'Yannick Fotso', 'Yann F.', 'https://picsum.photos/seed/tda26-c1/600/800', ARRAY['https://picsum.photos/seed/tda26-c1b/600/800','https://picsum.photos/seed/tda26-c1c/600/800'], 'Créateur de contenu comédie, 800K abonnés cumulés.', 4820, 1, 1),
    ('20000000-0000-0000-0000-0000000c0002', '20000000-0000-0000-0000-0000000cc201', 'Marc-Aurèle Ngo', 'MarcA N.', 'https://picsum.photos/seed/tda26-c2/600/800', ARRAY['https://picsum.photos/seed/tda26-c2b/600/800'], 'Réalisateur de mini-séries virales sur la vie estudiantine.', 3610, 4, 2),
    ('20000000-0000-0000-0000-0000000c0002', '20000000-0000-0000-0000-0000000cc201', 'Ingrid Bella', 'Ingrid B.', 'https://picsum.photos/seed/tda26-c3/600/800', ARRAY['https://picsum.photos/seed/tda26-c3b/600/800'], 'Vulgarisatrice tech, explique l''IA en langues locales.', 2980, 6, 3),
    ('20000000-0000-0000-0000-0000000c0002', '20000000-0000-0000-0000-0000000cc201', 'Steve Manga', 'Steve M.', 'https://picsum.photos/seed/tda26-c4/600/800', ARRAY['https://picsum.photos/seed/tda26-c4b/600/800'], 'Monteur vidéo autodidacte devenu formateur en ligne.', 1540, 10, 4),
    ('20000000-0000-0000-0000-0000000c0002', '20000000-0000-0000-0000-0000000cc202', 'Diane Kamga', 'Diane K.', 'https://picsum.photos/seed/tda26-c5/600/800', ARRAY['https://picsum.photos/seed/tda26-c5b/600/800'], 'Auteure-compositrice afrobeat, primée au niveau régional.', 4310, 2, 1),
    ('20000000-0000-0000-0000-0000000c0002', '20000000-0000-0000-0000-0000000cc202', 'Bruce Ateba', 'Bruce A.', 'https://picsum.photos/seed/tda26-c6/600/800', ARRAY['https://picsum.photos/seed/tda26-c6b/600/800'], 'Producteur de beats, collabore avec des artistes émergents.', 2410, 7, 2),
    ('20000000-0000-0000-0000-0000000c0002', '20000000-0000-0000-0000-0000000cc202', 'Sandra Eyenga', 'Sandra E.', 'https://picsum.photos/seed/tda26-c7/600/800', ARRAY['https://picsum.photos/seed/tda26-c7b/600/800'], 'Chanteuse folk revisitant les rythmes traditionnels.', 3120, 5, 3),
    ('20000000-0000-0000-0000-0000000c0002', '20000000-0000-0000-0000-0000000cc202', 'Hervé Zang', 'Hervé Z.', 'https://picsum.photos/seed/tda26-c8/600/800', ARRAY['https://picsum.photos/seed/tda26-c8b/600/800'], 'DJ et animateur radio, figure montante de la scène urbaine.', 980, 12, 4),
    ('20000000-0000-0000-0000-0000000c0002', '20000000-0000-0000-0000-0000000cc203', 'Carole Mvondo', 'Carole M.', 'https://picsum.photos/seed/tda26-c9/600/800', ARRAY['https://picsum.photos/seed/tda26-c9b/600/800'], 'Styliste digitale, ses looks inspirent 300K followers.', 4055, 3, 1),
    ('20000000-0000-0000-0000-0000000c0002', '20000000-0000-0000-0000-0000000cc203', 'Patrick Onana', 'Patrick O.', 'https://picsum.photos/seed/tda26-c10/600/800', ARRAY['https://picsum.photos/seed/tda26-c10b/600/800'], 'Illustrateur numérique, fusionne art traditionnel et digital.', 1870, 9, 2),
    ('20000000-0000-0000-0000-0000000c0002', '20000000-0000-0000-0000-0000000cc203', 'Élodie Fouda', 'Élodie F.', 'https://picsum.photos/seed/tda26-c11/600/800', ARRAY['https://picsum.photos/seed/tda26-c11b/600/800'], 'Photographe de mode urbaine, exposée à Dakar et Abidjan.', 2205, 8, 3),
    ('20000000-0000-0000-0000-0000000c0002', '20000000-0000-0000-0000-0000000cc203', 'Junior Talla', 'Junior T.', 'https://picsum.photos/seed/tda26-c12/600/800', ARRAY['https://picsum.photos/seed/tda26-c12b/600/800'], 'Designer 3D, crée des filtres réalité augmentée viraux.', 1330, 11, 4);

INSERT INTO poll_partners (poll_id, name, logo_url, website_url, level, validated) VALUES
    ('20000000-0000-0000-0000-0000000c0002', 'Afri Mobile Money', 'https://picsum.photos/seed/tda26-p1/300/150', 'https://example.com', 'Or', TRUE),
    ('20000000-0000-0000-0000-0000000c0002', 'CréaStudio', 'https://picsum.photos/seed/tda26-p2/300/150', 'https://example.com', 'Argent', TRUE),
    ('20000000-0000-0000-0000-0000000c0002', 'NetPlus ISP', 'https://picsum.photos/seed/tda26-p3/300/150', NULL, 'Bronze', TRUE),
    ('20000000-0000-0000-0000-0000000c0002', 'Studio Non Validé', NULL, NULL, 'Bronze', FALSE);

INSERT INTO poll_faqs (poll_id, question, answer, position) VALUES
    ('20000000-0000-0000-0000-0000000c0002', 'Puis-je voter dans plusieurs catégories ?', 'Oui, vous pouvez voter pour un ou plusieurs candidats, dans une ou plusieurs catégories, sans limite de catégories.', 1),
    ('20000000-0000-0000-0000-0000000c0002', 'Les votes gratuits existent-ils sur ce scrutin ?', 'Non, ce scrutin fonctionne uniquement par vote payant (Mobile Money) — le prix unitaire et les packs sont visibles sur la page Règles.', 2),
    ('20000000-0000-0000-0000-0000000c0002', 'Le classement est-il mis à jour en temps réel ?', 'Oui, les scores affichés sont recalculés en continu, avec une mise en cache de 30 secondes maximum.', 3);

INSERT INTO poll_news (poll_id, title, body, photos_urls, published_at) VALUES
    ('20000000-0000-0000-0000-0000000c0002', 'Ouverture officielle des votes !', 'C''est parti pour 30 jours de compétition entre nos 12 finalistes. Merci à tous pour votre engagement dès les premières heures.', ARRAY['https://picsum.photos/seed/tda26-news1/900/500'], now() - interval '9 days'),
    ('20000000-0000-0000-0000-0000000c0002', 'Yann F. prend la tête du classement général', 'Après une semaine de votes, Yann F. (Créateur Vidéo) prend la première place toutes catégories confondues, suivi de près par Diane K.', ARRAY['https://picsum.photos/seed/tda26-news2/900/500'], now() - interval '3 days'),
    ('20000000-0000-0000-0000-0000000c0002', 'Nouveau partenaire : Afri Mobile Money', 'Afri Mobile Money rejoint l''édition 2026 en tant que partenaire Or, facilitant les paiements pour tous les votants.', ARRAY['https://picsum.photos/seed/tda26-news3/900/500'], now() - interval '1 days');

INSERT INTO poll_galleries (poll_id, media_url, media_type, tag) VALUES
    ('20000000-0000-0000-0000-0000000c0002', 'https://picsum.photos/seed/tda26-g1/800/800', 'PHOTO', 'BEFORE'),
    ('20000000-0000-0000-0000-0000000c0002', 'https://picsum.photos/seed/tda26-g2/800/800', 'PHOTO', 'DURING'),
    ('20000000-0000-0000-0000-0000000c0002', 'https://picsum.photos/seed/tda26-g3/800/800', 'PHOTO', 'DURING'),
    ('20000000-0000-0000-0000-0000000c0002', 'https://picsum.photos/seed/tda26-g4/800/800', 'PHOTO', 'DURING'),
    ('20000000-0000-0000-0000-0000000c0002', 'https://picsum.photos/seed/tda26-g5/800/800', 'PHOTO', 'DURING'),
    ('20000000-0000-0000-0000-0000000c0002', 'https://picsum.photos/seed/tda26-g6/800/800', 'PHOTO', 'DURING'),
    ('20000000-0000-0000-0000-0000000c0002', 'https://picsum.photos/seed/tda26-g7/800/800', 'PHOTO', 'DURING'),
    ('20000000-0000-0000-0000-0000000c0002', 'https://picsum.photos/seed/tda26-g8/800/800', 'PHOTO', 'DURING');

INSERT INTO refund_policies (campaign_id, campaign_type, refundable, delay_hours, percentage)
VALUES ('20000000-0000-0000-0000-0000000c0002', 'POLL', TRUE, 12, 50);

-- =====================================================================
-- CAMPAGNE 3 — CLÔTURÉE : "Prix de l'Innovation Étudiante 2025"
-- =====================================================================
INSERT INTO campaigns (campaign_id, campaign_type, owner_user_id)
VALUES ('20000000-0000-0000-0000-0000000c0003', 'POLL', '10000000-0000-0000-0000-000000000004');

INSERT INTO polls (
    poll_id, user_id, slug, title, description, cover_photo_url, category,
    display_organizer_name, social_links, status, vote_type, price_per_vote,
    max_votes_per_visitor, results_visibility, show_grid_directly,
    open_at, close_at
) VALUES (
    '20000000-0000-0000-0000-0000000c0003',
    '10000000-0000-0000-0000-000000000004',
    'prix-innovation-etudiante-2025',
    'Prix de l''Innovation Étudiante 2025',
    'Le concours qui récompense les projets étudiants les plus innovants d''Afrique de l''Ouest. Édition 2025 clôturée — retrouvez le palmarès complet et le procès-verbal officiel ci-dessous.',
    'https://picsum.photos/seed/innovation-2025/1600/900',
    'Concours étudiant',
    'Réseau Universitaire Ouest-Africain',
    '{"facebook":"https://facebook.com/demo-innovation-2025","instagram":"https://instagram.com/demo-innovation-2025"}'::jsonb,
    'CLOSED', 'FREE_VISITOR_ID', NULL,
    5, 'PUBLIC', TRUE,
    now() - interval '75 days', now() - interval '15 days'
);

INSERT INTO candidate_categories (category_id, poll_id, name, position) VALUES
    ('20000000-0000-0000-0000-0000000cc301', '20000000-0000-0000-0000-0000000c0003', 'Technologie & IA', 1),
    ('20000000-0000-0000-0000-0000000cc302', '20000000-0000-0000-0000-0000000c0003', 'Impact Social', 2);

INSERT INTO candidates (poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, biography, score, rank, position) VALUES
    ('20000000-0000-0000-0000-0000000c0003', '20000000-0000-0000-0000-0000000cc301', 'Équipe AgriSense', 'AgriSense', 'https://picsum.photos/seed/inno25-c1/600/800', ARRAY['https://picsum.photos/seed/inno25-c1b/600/800'], 'Capteurs IoT low-cost pour l''irrigation intelligente des petites exploitations.', 1284, 1, 1),
    ('20000000-0000-0000-0000-0000000c0003', '20000000-0000-0000-0000-0000000cc301', 'Équipe MediScan', 'MediScan', 'https://picsum.photos/seed/inno25-c2/600/800', ARRAY['https://picsum.photos/seed/inno25-c2b/600/800'], 'Diagnostic assisté par IA pour les zones sans accès à la radiologie.', 1109, 2, 2),
    ('20000000-0000-0000-0000-0000000c0003', '20000000-0000-0000-0000-0000000cc301', 'Équipe SolarGrid', 'SolarGrid', 'https://picsum.photos/seed/inno25-c3/600/800', ARRAY['https://picsum.photos/seed/inno25-c3b/600/800'], 'Micro-réseaux solaires partagés pour quartiers non électrifiés.', 845, 4, 3),
    ('20000000-0000-0000-0000-0000000c0003', '20000000-0000-0000-0000-0000000cc301', 'Équipe CodeLocal', 'CodeLocal', 'https://picsum.photos/seed/inno25-c4/600/800', ARRAY['https://picsum.photos/seed/inno25-c4b/600/800'], 'Plateforme d''apprentissage du code en langues nationales.', 612, 6, 4),
    ('20000000-0000-0000-0000-0000000c0003', '20000000-0000-0000-0000-0000000cc301', 'Équipe AquaPure', 'AquaPure', 'https://picsum.photos/seed/inno25-c5/600/800', ARRAY['https://picsum.photos/seed/inno25-c5b/600/800'], 'Filtration d''eau low-tech à base de matériaux locaux.', 498, 8, 5),
    ('20000000-0000-0000-0000-0000000c0003', '20000000-0000-0000-0000-0000000cc302', 'Équipe EcoRecycle', 'EcoRecycle', 'https://picsum.photos/seed/inno25-c6/600/800', ARRAY['https://picsum.photos/seed/inno25-c6b/600/800'], 'Collecte et valorisation des déchets plastiques en matériaux de construction.', 1052, 3, 1),
    ('20000000-0000-0000-0000-0000000c0003', '20000000-0000-0000-0000-0000000cc302', 'Équipe FemTech', 'FemTech', 'https://picsum.photos/seed/inno25-c7/600/800', ARRAY['https://picsum.photos/seed/inno25-c7b/600/800'], 'Application de santé menstruelle et reproductive pour zones rurales.', 733, 5, 2),
    ('20000000-0000-0000-0000-0000000c0003', '20000000-0000-0000-0000-0000000cc302', 'Équipe MicroCredit+', 'MicroCredit+', 'https://picsum.photos/seed/inno25-c8/600/800', ARRAY['https://picsum.photos/seed/inno25-c8b/600/800'], 'Scoring de microcrédit basé sur les données Mobile Money.', 567, 7, 3),
    ('20000000-0000-0000-0000-0000000c0003', '20000000-0000-0000-0000-0000000cc302', 'Équipe TransportEase', 'TransportEase', 'https://picsum.photos/seed/inno25-c9/600/800', ARRAY['https://picsum.photos/seed/inno25-c9b/600/800'], 'Optimisation des trajets de transport informel urbain.', 401, 9, 4),
    ('20000000-0000-0000-0000-0000000c0003', '20000000-0000-0000-0000-0000000cc302', 'Équipe SafeStreet', 'SafeStreet', 'https://picsum.photos/seed/inno25-c10/600/800', ARRAY['https://picsum.photos/seed/inno25-c10b/600/800'], 'Signalement communautaire de zones à risque via SMS.', 298, 10, 5);

INSERT INTO poll_partners (poll_id, name, logo_url, website_url, level, validated) VALUES
    ('20000000-0000-0000-0000-0000000c0003', 'Banque Régionale d''Investissement', 'https://picsum.photos/seed/inno25-p1/300/150', 'https://example.com', 'Or', TRUE),
    ('20000000-0000-0000-0000-0000000c0003', 'TechHub Incubateur', 'https://picsum.photos/seed/inno25-p2/300/150', 'https://example.com', 'Argent', TRUE);

INSERT INTO poll_faqs (poll_id, question, answer, position) VALUES
    ('20000000-0000-0000-0000-0000000c0003', 'Les résultats sont-ils définitifs ?', 'Oui, les résultats ci-dessus sont définitifs et certifiés par le procès-verbal de clôture téléchargeable en PDF.', 1),
    ('20000000-0000-0000-0000-0000000c0003', 'Puis-je encore consulter les profils des équipes ?', 'Oui, toutes les fiches équipes restent consultables indéfiniment, seul le vote est désormais fermé.', 2);

INSERT INTO poll_news (poll_id, title, body, photos_urls, published_at) VALUES
    ('20000000-0000-0000-0000-0000000c0003', 'Clôture officielle et remise des prix', 'Le concours 2025 est officiellement clôturé. Félicitations à AgriSense, grand vainqueur toutes catégories, et à toutes les équipes finalistes pour leur créativité.', ARRAY['https://picsum.photos/seed/inno25-news1/900/500'], now() - interval '15 days');

INSERT INTO poll_galleries (poll_id, media_url, media_type, tag) VALUES
    ('20000000-0000-0000-0000-0000000c0003', 'https://picsum.photos/seed/inno25-g1/800/800', 'PHOTO', 'DURING'),
    ('20000000-0000-0000-0000-0000000c0003', 'https://picsum.photos/seed/inno25-g2/800/800', 'PHOTO', 'DURING'),
    ('20000000-0000-0000-0000-0000000c0003', 'https://picsum.photos/seed/inno25-g3/800/800', 'PHOTO', 'AFTER'),
    ('20000000-0000-0000-0000-0000000c0003', 'https://picsum.photos/seed/inno25-g4/800/800', 'PHOTO', 'AFTER'),
    ('20000000-0000-0000-0000-0000000c0003', 'https://picsum.photos/seed/inno25-g5/800/800', 'PHOTO', 'AFTER');

INSERT INTO refund_policies (campaign_id, campaign_type, refundable, delay_hours, percentage)
VALUES ('20000000-0000-0000-0000-0000000c0003', 'POLL', FALSE, NULL, NULL);

-- Procès-verbal de clôture, public — rend GET /api/polls/:slug/results et
-- /api/polls/:slug/pv disponibles pour cette campagne.
INSERT INTO closing_reports (poll_id, version, content_json, sha256_hash, pdf_url, public, supervisor_id)
VALUES (
    '20000000-0000-0000-0000-0000000c0003',
    1,
    '{"summary":"Palmarès officiel — Prix de l''Innovation Étudiante 2025","winner":"AgriSense"}'::jsonb,
    'a3f5c8e21b9d4f6072e1c4a8b5d9f3e7c2a6b4d8f1e5c9a3b7d2f6e0c4a8b5d9',
    'https://example.com/demo/pv-innovation-2025.pdf',
    TRUE,
    '10000000-0000-0000-0000-000000000001'
);

COMMIT;

\echo '======================================================================='
\echo 'Seed "Scrutin & Vote" inséré avec succès :'
\echo '  - Campagne À VENIR   : /vote/miss-culture-douala-2027'
\echo '  - Campagne EN COURS  : /vote/talents-digitaux-afrique-2026'
\echo '  - Campagne CLÔTURÉE  : /vote/prix-innovation-etudiante-2025'
\echo '  - 10 candidats, galerie, partenaires, FAQ et actualités par campagne'
\echo '======================================================================='
