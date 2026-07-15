-- ============================================================
-- SEED_DONNEES_TEST_ACTUELLES.sql
-- Export complet des données actuellement présentes dans la base
-- de développement locale (moledievents), généré via pg_dump
-- --data-only le 2026-07-12 18:45 pour peupler la base VPS
-- (actuellement vierge, migrations 00 a 19 deja appliquees).
--
-- PRE-REQUIS AVANT EXECUTION SUR LE VPS :
--   1. Les migrations db/migrations/00_*.sql a 19_*.sql doivent
--      deja etre appliquees (schema complet, tables vides).
--   2. La base cible doit etre VIDE de donnees (sinon conflits de
--      cles primaires sur les UUID fixes ci-dessous).
--   3. Comptes organisateurs de demo, mot de passe pour TOUS :
--      Demo1234!  (voir db/seeds/seed_full_demo.sql pour le detail
--      des emails). Ce sont des comptes de test, a supprimer ou
--      changer avant toute mise en production reelle.
--
-- Execution :
--   psql "$DATABASE_URL" -f Doc/SEED_DONNEES_TEST_ACTUELLES.sql
-- ============================================================

BEGIN;

--
-- PostgreSQL database dump
--

\restrict OisJEoMDXIAh4tZlJv01T4gPHzK3rppzUybh8P66n6Qbw0tpgANjQQyeexNRSQv

-- Dumped from database version 15.18
-- Dumped by pg_dump version 15.18

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: acquisition_sources; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.acquisition_sources (source_id, name, type, url, active, created_at) VALUES ('10000000-0000-0000-0000-0000000b0001', 'Facebook', 'SOCIAL_NETWORK', NULL, true, '2026-07-09 21:12:24.020342+01');
INSERT INTO public.acquisition_sources (source_id, name, type, url, active, created_at) VALUES ('10000000-0000-0000-0000-0000000b0002', 'WhatsApp', 'SOCIAL_NETWORK', NULL, true, '2026-07-09 21:12:24.020342+01');
INSERT INTO public.acquisition_sources (source_id, name, type, url, active, created_at) VALUES ('10000000-0000-0000-0000-0000000b0003', 'TikTok', 'SOCIAL_NETWORK', NULL, true, '2026-07-09 21:12:24.020342+01');
INSERT INTO public.acquisition_sources (source_id, name, type, url, active, created_at) VALUES ('10000000-0000-0000-0000-0000000b0008', 'Autre', 'OTHER', NULL, true, '2026-07-09 21:12:24.020342+01');
INSERT INTO public.acquisition_sources (source_id, name, type, url, active, created_at) VALUES ('10000000-0000-0000-0000-0000000b0004', 'Recommandation (bouche à oreille)', 'OTHER', NULL, true, '2026-07-09 21:12:24.020342+01');
INSERT INTO public.acquisition_sources (source_id, name, type, url, active, created_at) VALUES ('10000000-0000-0000-0000-0000000b0005', 'Influenceur / Créateur de contenu', 'INFLUENCER', NULL, true, '2026-07-09 21:12:24.020342+01');
INSERT INTO public.acquisition_sources (source_id, name, type, url, active, created_at) VALUES ('10000000-0000-0000-0000-0000000b0006', 'Lors d''un événement', 'EVENT', NULL, true, '2026-07-09 21:12:24.020342+01');
INSERT INTO public.acquisition_sources (source_id, name, type, url, active, created_at) VALUES ('10000000-0000-0000-0000-0000000b0007', 'Publicité en ligne', 'ADVERTISING', NULL, true, '2026-07-09 21:12:24.020342+01');


--
-- Data for Name: visitors; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.visitors (visitor_id, browser, os, language, screen_resolution, ip_hashed, account_id, created_at) VALUES ('00000000-0000-0000-0000-000000005001', 'Chrome', 'Android', NULL, NULL, 'demo-hash-0001', NULL, '2026-07-08 23:54:21.812003+01');
INSERT INTO public.visitors (visitor_id, browser, os, language, screen_resolution, ip_hashed, account_id, created_at) VALUES ('11111111-1111-4111-8111-111111111111', 'test', NULL, 'fr', '1000x800', '7b00e4898681887f3ec94f4e9e75f01c25a5e5baed5db8b98ba7c0c5b5385da7', NULL, '2026-07-09 13:52:54.49177+01');
INSERT INTO public.visitors (visitor_id, browser, os, language, screen_resolution, ip_hashed, account_id, created_at) VALUES ('2c2c044e-17a0-49b7-9ae2-2033fbca9770', 'test', NULL, 'fr', '1000x800', '7b00e4898681887f3ec94f4e9e75f01c25a5e5baed5db8b98ba7c0c5b5385da7', NULL, '2026-07-09 13:53:24.46721+01');
INSERT INTO public.visitors (visitor_id, browser, os, language, screen_resolution, ip_hashed, account_id, created_at) VALUES ('10000000-0000-0000-0000-000000005001', 'Chrome', 'Android', 'FR', NULL, 'demo-hash-0001', NULL, '2026-07-09 17:23:33.439491+01');
INSERT INTO public.visitors (visitor_id, browser, os, language, screen_resolution, ip_hashed, account_id, created_at) VALUES ('10000000-0000-0000-0000-000000005002', 'Safari', 'iOS', 'FR', NULL, 'demo-hash-0002', NULL, '2026-07-09 17:23:33.439491+01');
INSERT INTO public.visitors (visitor_id, browser, os, language, screen_resolution, ip_hashed, account_id, created_at) VALUES ('10000000-0000-0000-0000-000000005003', 'Chrome', 'Windows', 'FR', NULL, 'demo-hash-0003', NULL, '2026-07-09 17:23:33.439491+01');
INSERT INTO public.visitors (visitor_id, browser, os, language, screen_resolution, ip_hashed, account_id, created_at) VALUES ('10000000-0000-0000-0000-000000005004', 'Chrome', 'Android', 'FR', NULL, 'demo-hash-0004', NULL, '2026-07-09 17:23:33.439491+01');
INSERT INTO public.visitors (visitor_id, browser, os, language, screen_resolution, ip_hashed, account_id, created_at) VALUES ('10000000-0000-0000-0000-000000005005', 'Firefox', 'Linux', 'FR', NULL, 'demo-hash-0005', NULL, '2026-07-09 17:23:33.439491+01');
INSERT INTO public.visitors (visitor_id, browser, os, language, screen_resolution, ip_hashed, account_id, created_at) VALUES ('10000000-0000-0000-0000-000000005006', 'Chrome', 'macOS', 'FR', NULL, 'demo-hash-0006', NULL, '2026-07-09 17:23:33.439491+01');
INSERT INTO public.visitors (visitor_id, browser, os, language, screen_resolution, ip_hashed, account_id, created_at) VALUES ('10000000-0000-0000-0000-000000005007', 'Chrome', 'Android', 'FR', NULL, 'demo-hash-0007', NULL, '2026-07-09 17:23:33.439491+01');
INSERT INTO public.visitors (visitor_id, browser, os, language, screen_resolution, ip_hashed, account_id, created_at) VALUES ('10000000-0000-0000-0000-000000005008', 'Chrome', 'Windows', 'FR', NULL, 'demo-hash-0008', NULL, '2026-07-09 17:23:33.439491+01');
INSERT INTO public.visitors (visitor_id, browser, os, language, screen_resolution, ip_hashed, account_id, created_at) VALUES ('02d8d589-71ba-46e3-836d-31fa6acbcef5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Claude/1.19367.0 Chrome/148.0.7778.271 Electron/42.5.1 Safari/537.36 MSIX', NULL, 'EN', '1536x864', '7b00e4898681887f3ec94f4e9e75f01c25a5e5baed5db8b98ba7c0c5b5385da7', NULL, '2026-07-09 16:04:47.259418+01');
INSERT INTO public.visitors (visitor_id, browser, os, language, screen_resolution, ip_hashed, account_id, created_at) VALUES ('43518029-b22a-42f2-9658-b1261b584178', NULL, NULL, NULL, NULL, '7b00e4898681887f3ec94f4e9e75f01c25a5e5baed5db8b98ba7c0c5b5385da7', NULL, '2026-07-10 16:55:24.549979+01');
INSERT INTO public.visitors (visitor_id, browser, os, language, screen_resolution, ip_hashed, account_id, created_at) VALUES ('93ce2831-e6e0-4477-a0cc-47f3b9b41301', NULL, NULL, NULL, NULL, '''unknown''', NULL, '2026-07-11 01:42:45.275868+01');
INSERT INTO public.visitors (visitor_id, browser, os, language, screen_resolution, ip_hashed, account_id, created_at) VALUES ('0fe5b432-40bd-429a-89c5-19ea267942bc', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Claude/1.20186.1 Chrome/148.0.7778.271 Electron/42.5.1 Safari/537.36 MSIX', NULL, 'FR', '1536x864', '7b00e4898681887f3ec94f4e9e75f01c25a5e5baed5db8b98ba7c0c5b5385da7', '10000000-0000-0000-0000-000000000002', '2026-07-12 00:41:01.391341+01');
INSERT INTO public.visitors (visitor_id, browser, os, language, screen_resolution, ip_hashed, account_id, created_at) VALUES ('e9fa42bb-6456-4375-971d-d1ba43db41ab', NULL, NULL, 'FR', NULL, '7b00e4898681887f3ec94f4e9e75f01c25a5e5baed5db8b98ba7c0c5b5385da7', '10000000-0000-0000-0000-000000000002', '2026-07-09 17:34:38.503393+01');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.users (user_id, role, full_name, email, email_verified, phone, phone_country_code, password_hash, avatar_url, status, acquisition_source_id, linked_visitor_id, payout_phone, payout_operator, payout_phone_history, pseudonymised, created_at, deleted_at, failed_login_attempts, locked_until, last_verification_sent_at) VALUES ('00000000-0000-0000-0000-000000000002', 'SUPER_ADMIN', 'Nelza Admin', 'nelza.admin@liboka-demo.cm', true, NULL, NULL, '$2a$12$dHk.FYnN8Kxl9pPw8NJhiOxMtc86rwZEW8fGmtSgtdKf1PYBcgsw2', NULL, 'ACTIVE', NULL, NULL, NULL, NULL, '{}', false, '2026-07-08 23:54:21.812003+01', NULL, 0, NULL, NULL);
INSERT INTO public.users (user_id, role, full_name, email, email_verified, phone, phone_country_code, password_hash, avatar_url, status, acquisition_source_id, linked_visitor_id, payout_phone, payout_operator, payout_phone_history, pseudonymised, created_at, deleted_at, failed_login_attempts, locked_until, last_verification_sent_at) VALUES ('c295d4fb-fe4e-43f8-8b96-cd1c1c2fa6e5', 'ORGANIZER', 'Ggg', 'donman237x@gmail.com', false, NULL, NULL, '$2a$12$YIr5.eb//LcSd4zdDhv.6uD0A/HX9PIUe4YVYK5ygz7Oop55RCh5y', NULL, 'ACTIVE', NULL, NULL, NULL, NULL, '{}', false, '2026-07-09 21:10:07.648+01', NULL, 0, NULL, '2026-07-09 21:10:09.961+01');
INSERT INTO public.users (user_id, role, full_name, email, email_verified, phone, phone_country_code, password_hash, avatar_url, status, acquisition_source_id, linked_visitor_id, payout_phone, payout_operator, payout_phone_history, pseudonymised, created_at, deleted_at, failed_login_attempts, locked_until, last_verification_sent_at) VALUES ('a366789f-7677-4bfa-a7a2-69e9efbf2146', 'ORGANIZER', 'Test User', 'verif-test-1783611948386@example.com', false, NULL, NULL, '$2a$12$7kBrKfzoaNMtJwJxfa09dezaXkFVHVBXg60nEca.5MQ9a3cH3somK', NULL, 'ACTIVE', NULL, NULL, NULL, NULL, '{}', false, '2026-07-09 16:45:49.526745+01', NULL, 0, NULL, '2026-07-09 16:45:52.859+01');
INSERT INTO public.users (user_id, role, full_name, email, email_verified, phone, phone_country_code, password_hash, avatar_url, status, acquisition_source_id, linked_visitor_id, payout_phone, payout_operator, payout_phone_history, pseudonymised, created_at, deleted_at, failed_login_attempts, locked_until, last_verification_sent_at) VALUES ('10000000-0000-0000-0000-000000000001', 'SUPER_ADMIN', 'Nelza Admin', 'admin@moledi-demo.cm', true, NULL, NULL, '$2a$12$/8SS.NmszJEklI2wOcVxweSnV.Eya6I2nMu7NkfcJpSpoJlOQQ4la', NULL, 'ACTIVE', NULL, NULL, NULL, NULL, '{}', false, '2026-07-09 17:23:33.439491+01', NULL, 0, NULL, NULL);
INSERT INTO public.users (user_id, role, full_name, email, email_verified, phone, phone_country_code, password_hash, avatar_url, status, acquisition_source_id, linked_visitor_id, payout_phone, payout_operator, payout_phone_history, pseudonymised, created_at, deleted_at, failed_login_attempts, locked_until, last_verification_sent_at) VALUES ('10000000-0000-0000-0000-000000000003', 'ORGANIZER', 'Junior Fotso', 'junior.organizer@moledi-demo.cm', true, NULL, NULL, '$2a$12$/8SS.NmszJEklI2wOcVxweSnV.Eya6I2nMu7NkfcJpSpoJlOQQ4la', NULL, 'ACTIVE', NULL, NULL, NULL, NULL, '{}', false, '2026-07-09 17:23:33.439491+01', NULL, 0, NULL, NULL);
INSERT INTO public.users (user_id, role, full_name, email, email_verified, phone, phone_country_code, password_hash, avatar_url, status, acquisition_source_id, linked_visitor_id, payout_phone, payout_operator, payout_phone_history, pseudonymised, created_at, deleted_at, failed_login_attempts, locked_until, last_verification_sent_at) VALUES ('10000000-0000-0000-0000-000000000004', 'ORGANIZER', 'Sarah Diop', 'sarah.organizer@moledi-demo.cm', true, NULL, NULL, '$2a$12$/8SS.NmszJEklI2wOcVxweSnV.Eya6I2nMu7NkfcJpSpoJlOQQ4la', NULL, 'ACTIVE', NULL, NULL, NULL, NULL, '{}', false, '2026-07-09 17:23:33.439491+01', NULL, 0, NULL, NULL);
INSERT INTO public.users (user_id, role, full_name, email, email_verified, phone, phone_country_code, password_hash, avatar_url, status, acquisition_source_id, linked_visitor_id, payout_phone, payout_operator, payout_phone_history, pseudonymised, created_at, deleted_at, failed_login_attempts, locked_until, last_verification_sent_at) VALUES ('00000000-0000-0000-0000-000000000001', 'ORGANIZER', 'Awa Mballa', 'awa.organizer@liboka-demo.cm', true, NULL, NULL, '$2a$12$CzlZ5EpkYcZimItgzsvlWOwojKflM1Q5UpQsMwCEuz4l76j4t2M52', NULL, 'ACTIVE', NULL, NULL, NULL, NULL, '{}', false, '2026-07-08 23:54:21.812003+01', NULL, 0, NULL, NULL);
INSERT INTO public.users (user_id, role, full_name, email, email_verified, phone, phone_country_code, password_hash, avatar_url, status, acquisition_source_id, linked_visitor_id, payout_phone, payout_operator, payout_phone_history, pseudonymised, created_at, deleted_at, failed_login_attempts, locked_until, last_verification_sent_at) VALUES ('10000000-0000-0000-0000-000000000002', 'ORGANIZER', 'Awa Mballa', 'awa.organizer@moledi-demo.cm', true, NULL, NULL, '$2a$12$/8SS.NmszJEklI2wOcVxweSnV.Eya6I2nMu7NkfcJpSpoJlOQQ4la', NULL, 'ACTIVE', NULL, NULL, '237655123456', 'Orange Money', '{}', false, '2026-07-09 17:23:33.439491+01', NULL, 0, NULL, NULL);


--
-- Data for Name: admin_permissions; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.admin_permissions (user_id, view_events, edit_events, view_users, manage_users, view_finances, manage_finances, view_tickets, reply_tickets, mass_communication, manage_pricing, manage_aggregators, feature_flags, global_payout_block, configure_payment_countries) VALUES ('00000000-0000-0000-0000-000000000002', true, true, true, true, true, true, true, true, true, true, true, true, true, true);
INSERT INTO public.admin_permissions (user_id, view_events, edit_events, view_users, manage_users, view_finances, manage_finances, view_tickets, reply_tickets, mass_communication, manage_pricing, manage_aggregators, feature_flags, global_payout_block, configure_payment_countries) VALUES ('10000000-0000-0000-0000-000000000001', true, true, true, true, true, true, true, true, true, true, true, true, true, true);


--
-- Data for Name: aggregators; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.aggregators (aggregator_id, name, countries, payment_methods, priority, active, api_endpoint, health_endpoint, timeout_seconds, operational_status, success_rate, avg_latency_ms) VALUES ('00000000-0000-0000-0000-000000000a01', 'DemoPSP', '{CM}', '{MOBILE_MONEY}', 10, true, 'https://demo-psp.example.com/api', 'https://demo-psp.example.com/health', 10, 'OPERATIONAL', 100.00, 0);
INSERT INTO public.aggregators (aggregator_id, name, countries, payment_methods, priority, active, api_endpoint, health_endpoint, timeout_seconds, operational_status, success_rate, avg_latency_ms) VALUES ('10000000-0000-0000-0000-0000000a0001', 'Orange Money Cameroun', '{CM}', '{MOBILE_MONEY}', 10, true, 'https://demo-orange.example.com/api', 'https://demo-orange.example.com/health', 10, 'OPERATIONAL', 100.00, 0);
INSERT INTO public.aggregators (aggregator_id, name, countries, payment_methods, priority, active, api_endpoint, health_endpoint, timeout_seconds, operational_status, success_rate, avg_latency_ms) VALUES ('10000000-0000-0000-0000-0000000a0002', 'DemoPSP Carte Bancaire', '{CM,SN}', '{CARD}', 20, true, 'https://demo-card-psp.example.com/api', 'https://demo-card-psp.example.com/health', 10, 'OPERATIONAL', 100.00, 0);
INSERT INTO public.aggregators (aggregator_id, name, countries, payment_methods, priority, active, api_endpoint, health_endpoint, timeout_seconds, operational_status, success_rate, avg_latency_ms) VALUES ('10000000-0000-0000-0000-0000000a0003', 'MTN Mobile Money', '{CI,SN}', '{MOBILE_MONEY}', 15, true, 'https://demo-mtn.example.com/api', 'https://demo-mtn.example.com/health', 10, 'OPERATIONAL', 100.00, 0);


--
-- Data for Name: aggregator_health_logs; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: campaigns; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.campaigns (campaign_id, campaign_type, owner_user_id, created_at) VALUES ('00000000-0000-0000-0000-0000000c0001', 'POLL', '00000000-0000-0000-0000-000000000001', '2026-07-08 23:54:21.812003+01');
INSERT INTO public.campaigns (campaign_id, campaign_type, owner_user_id, created_at) VALUES ('10000000-0000-0000-0000-0000000c0001', 'POLL', '10000000-0000-0000-0000-000000000002', '2026-07-09 17:23:33.439491+01');
INSERT INTO public.campaigns (campaign_id, campaign_type, owner_user_id, created_at) VALUES ('10000000-0000-0000-0000-0000000c0002', 'EVENT', '10000000-0000-0000-0000-000000000003', '2026-07-09 17:23:33.439491+01');
INSERT INTO public.campaigns (campaign_id, campaign_type, owner_user_id, created_at) VALUES ('10000000-0000-0000-0000-0000000c0003', 'FUNDRAISER', '10000000-0000-0000-0000-000000000004', '2026-07-09 17:23:33.439491+01');
INSERT INTO public.campaigns (campaign_id, campaign_type, owner_user_id, created_at) VALUES ('10000000-0000-0000-0000-0000000c0004', 'CF_PROJECT', '10000000-0000-0000-0000-000000000002', '2026-07-09 17:23:33.439491+01');
INSERT INTO public.campaigns (campaign_id, campaign_type, owner_user_id, created_at) VALUES ('10000000-0000-0000-0000-0000000c0005', 'SPONSOR_CALL', '10000000-0000-0000-0000-000000000003', '2026-07-09 17:23:33.439491+01');
INSERT INTO public.campaigns (campaign_id, campaign_type, owner_user_id, created_at) VALUES ('10000000-0000-0000-0000-0000000c0006', 'CONTEST', '10000000-0000-0000-0000-000000000004', '2026-07-09 17:23:33.439491+01');
INSERT INTO public.campaigns (campaign_id, campaign_type, owner_user_id, created_at) VALUES ('10000000-0000-0000-0000-0000000c0007', 'LOTTERY', '10000000-0000-0000-0000-000000000002', '2026-07-09 17:23:33.439491+01');
INSERT INTO public.campaigns (campaign_id, campaign_type, owner_user_id, created_at) VALUES ('10000000-0000-0000-0000-0000000c0011', 'POLL', '10000000-0000-0000-0000-000000000003', '2026-07-10 18:18:15.636215+01');
INSERT INTO public.campaigns (campaign_id, campaign_type, owner_user_id, created_at) VALUES ('10000000-0000-0000-0000-0000000c0012', 'POLL', '10000000-0000-0000-0000-000000000002', '2026-07-10 18:18:15.636215+01');
INSERT INTO public.campaigns (campaign_id, campaign_type, owner_user_id, created_at) VALUES ('10000000-0000-0000-0000-0000000c0013', 'POLL', '10000000-0000-0000-0000-000000000004', '2026-07-10 18:18:15.636215+01');
INSERT INTO public.campaigns (campaign_id, campaign_type, owner_user_id, created_at) VALUES ('10000000-0000-0000-0000-0000000c0014', 'POLL', '10000000-0000-0000-0000-000000000003', '2026-07-10 18:18:15.636215+01');
INSERT INTO public.campaigns (campaign_id, campaign_type, owner_user_id, created_at) VALUES ('10000000-0000-0000-0000-0000000c0015', 'POLL', '10000000-0000-0000-0000-000000000004', '2026-07-10 18:18:15.636215+01');
INSERT INTO public.campaigns (campaign_id, campaign_type, owner_user_id, created_at) VALUES ('20000000-0000-0000-0000-0000000c0001', 'POLL', '10000000-0000-0000-0000-000000000002', '2026-07-11 01:28:52.011504+01');
INSERT INTO public.campaigns (campaign_id, campaign_type, owner_user_id, created_at) VALUES ('20000000-0000-0000-0000-0000000c0002', 'POLL', '10000000-0000-0000-0000-000000000003', '2026-07-11 01:28:52.011504+01');
INSERT INTO public.campaigns (campaign_id, campaign_type, owner_user_id, created_at) VALUES ('20000000-0000-0000-0000-0000000c0003', 'POLL', '10000000-0000-0000-0000-000000000004', '2026-07-11 01:28:52.011504+01');
INSERT INTO public.campaigns (campaign_id, campaign_type, owner_user_id, created_at) VALUES ('0f5f4825-9cc3-4290-b81e-ebf0f8083d76', 'POLL', '10000000-0000-0000-0000-000000000002', '2026-07-12 12:57:52.692122+01');
INSERT INTO public.campaigns (campaign_id, campaign_type, owner_user_id, created_at) VALUES ('6ff2af24-1736-4df4-88ff-b3f4f4715e5d', 'POLL', '10000000-0000-0000-0000-000000000002', '2026-07-12 15:23:30.180205+01');
INSERT INTO public.campaigns (campaign_id, campaign_type, owner_user_id, created_at) VALUES ('fbe9170e-ebf0-43d2-a9f8-1fdbaaf5597b', 'POLL', '00000000-0000-0000-0000-000000000001', '2026-07-12 15:36:49.958806+01');


--
-- Data for Name: polls; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.polls (poll_id, user_id, slug, title, description, cover_photo_url, additional_photos_urls, videos_urls, category, display_organizer_name, social_links, status, vote_type, price_per_vote, vote_packs, max_votes_per_visitor, otp_enabled, results_visibility, show_grid_directly, open_at, close_at, timezone, rejection_reason, published_version, custom_fields, created_at, welcome_message, visible_sections) VALUES ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-000000000001', 'miss-demo-2026', 'Miss Demo 2026', 'Scrutin de démonstration pour validation du schéma.', NULL, '{}', NULL, 'Beauté', NULL, NULL, 'OPEN', 'FREE_VISITOR_ID', NULL, NULL, NULL, false, 'PUBLIC', true, '2026-07-07 23:54:21.812003+01', '2026-08-06 23:54:21.812003+01', 'Africa/Douala', NULL, 0, NULL, '2026-07-08 23:54:21.812003+01', NULL, NULL);
INSERT INTO public.polls (poll_id, user_id, slug, title, description, cover_photo_url, additional_photos_urls, videos_urls, category, display_organizer_name, social_links, status, vote_type, price_per_vote, vote_packs, max_votes_per_visitor, otp_enabled, results_visibility, show_grid_directly, open_at, close_at, timezone, rejection_reason, published_version, custom_fields, created_at, welcome_message, visible_sections) VALUES ('10000000-0000-0000-0000-0000000c0001', '10000000-0000-0000-0000-000000000002', 'scrutin-demo-talents-2026', 'Élection Miss Cameroun 2026', 'Le grand concours annuel qui célèbre la beauté, le talent et l''engagement des jeunes camerounaises. Votez pour votre candidate préférée et suivez le classement en temps réel jusqu''à la grande finale.', '/miss-crown.jpg', '{}', NULL, 'Beauté', 'Comité Miss Cameroun', '{"facebook": "https://facebook.com/missdemo", "instagram": "https://instagram.com/missdemo"}', 'OPEN', 'PAID', 500.00, NULL, NULL, false, 'PUBLIC', true, '2026-07-07 17:23:33.439491+01', '2026-08-06 17:23:33.439491+01', 'Africa/Douala', NULL, 0, NULL, '2026-07-09 17:23:33.439491+01', NULL, NULL);
INSERT INTO public.polls (poll_id, user_id, slug, title, description, cover_photo_url, additional_photos_urls, videos_urls, category, display_organizer_name, social_links, status, vote_type, price_per_vote, vote_packs, max_votes_per_visitor, otp_enabled, results_visibility, show_grid_directly, open_at, close_at, timezone, rejection_reason, published_version, custom_fields, created_at, welcome_message, visible_sections) VALUES ('10000000-0000-0000-0000-0000000c0012', '10000000-0000-0000-0000-000000000002', 'concours-meilleur-createur-contenu', 'Concours du meilleur créateur de contenu', 'Nomination et vote du public pour récompenser les créateurs de contenu sénégalais les plus impactants.', '/vote-icon-laptop.jpg', '{}', NULL, 'Digital', 'Dakar Digital Awards', NULL, 'PUBLISHED', 'FREE_VISITOR_ID', NULL, NULL, 1, false, 'AFTER_CLOSE', true, '2026-07-16 18:18:15.636215+01', '2026-07-30 18:18:15.636215+01', 'Africa/Douala', NULL, 0, NULL, '2026-07-10 18:18:15.636215+01', NULL, NULL);
INSERT INTO public.polls (poll_id, user_id, slug, title, description, cover_photo_url, additional_photos_urls, videos_urls, category, display_organizer_name, social_links, status, vote_type, price_per_vote, vote_packs, max_votes_per_visitor, otp_enabled, results_visibility, show_grid_directly, open_at, close_at, timezone, rejection_reason, published_version, custom_fields, created_at, welcome_message, visible_sections) VALUES ('10000000-0000-0000-0000-0000000c0013', '10000000-0000-0000-0000-000000000004', 'election-bureau-associatif-adec', 'Élection du bureau associatif ADEC', 'Scrutin annuel pour élire le nouveau bureau de l''association ADEC.', '/vote-icon-button.jpg', '{}', NULL, 'Associatif', 'Association ADEC', NULL, 'CLOSED', 'FREE_VISITOR_ID', NULL, NULL, NULL, false, 'PUBLIC', true, '2026-05-31 18:18:15.636215+01', '2026-06-15 18:18:15.636215+01', 'Africa/Douala', NULL, 0, NULL, '2026-07-10 18:18:15.636215+01', NULL, NULL);
INSERT INTO public.polls (poll_id, user_id, slug, title, description, cover_photo_url, additional_photos_urls, videos_urls, category, display_organizer_name, social_links, status, vote_type, price_per_vote, vote_packs, max_votes_per_visitor, otp_enabled, results_visibility, show_grid_directly, open_at, close_at, timezone, rejection_reason, published_version, custom_fields, created_at, welcome_message, visible_sections) VALUES ('10000000-0000-0000-0000-0000000c0014', '10000000-0000-0000-0000-000000000003', 'prix-meilleur-enseignant-2026', 'Prix du meilleur enseignant 2026', 'Les élèves et parents votent pour désigner l''enseignant de l''année au Gabon.', '/election-vote.jpg', '{}', NULL, 'Éducation', 'Ministère de l''Éducation', NULL, 'OPEN', 'FREE_VISITOR_ID', NULL, NULL, NULL, false, 'PUBLIC', true, '2026-07-07 18:18:15.636215+01', '2026-07-18 18:18:15.636215+01', 'Africa/Douala', NULL, 0, NULL, '2026-07-10 18:18:15.636215+01', NULL, NULL);
INSERT INTO public.polls (poll_id, user_id, slug, title, description, cover_photo_url, additional_photos_urls, videos_urls, category, display_organizer_name, social_links, status, vote_type, price_per_vote, vote_packs, max_votes_per_visitor, otp_enabled, results_visibility, show_grid_directly, open_at, close_at, timezone, rejection_reason, published_version, custom_fields, created_at, welcome_message, visible_sections) VALUES ('10000000-0000-0000-0000-0000000c0015', '10000000-0000-0000-0000-000000000004', 'miss-elegance-abidjan', 'Miss Élégance Abidjan', 'Le grand concours annuel de beauté et d''élégance de la ville d''Abidjan revient pour une nouvelle édition.', '/miss-mister-pageant.jpg', '{}', NULL, 'Beauté', 'Abidjan Events', NULL, 'PUBLISHED', 'PAID', 250.00, NULL, NULL, false, 'PUBLIC', true, '2026-07-25 18:18:15.636215+01', '2026-08-09 18:18:15.636215+01', 'Africa/Douala', NULL, 0, NULL, '2026-07-10 18:18:15.636215+01', NULL, NULL);
INSERT INTO public.polls (poll_id, user_id, slug, title, description, cover_photo_url, additional_photos_urls, videos_urls, category, display_organizer_name, social_links, status, vote_type, price_per_vote, vote_packs, max_votes_per_visitor, otp_enabled, results_visibility, show_grid_directly, open_at, close_at, timezone, rejection_reason, published_version, custom_fields, created_at, welcome_message, visible_sections) VALUES ('20000000-0000-0000-0000-0000000c0001', '10000000-0000-0000-0000-000000000002', 'miss-culture-douala-2027', 'Élection Miss Culture Douala 2027', 'Grande élection célébrant la richesse culturelle du littoral camerounais. 12 candidates représentant chacune un arrondissement défilent pour le titre de Miss Culture Douala 2027. Ouverture des votes très bientôt !', 'https://picsum.photos/seed/miss-culture-2027/1600/900', '{}', NULL, 'Beauté & Culture', 'Fondation Sawa Événements', '{"facebook": "https://facebook.com/demo-miss-culture", "whatsapp": "https://wa.me/237600000010", "instagram": "https://instagram.com/demo-miss-culture"}', 'PUBLISHED', 'PAID', 250.00, '[{"name": "Pack Découverte", "price": 2000, "votes": 10}, {"name": "Pack Fan", "price": 9000, "votes": 50}, {"name": "Pack VIP", "price": 25000, "votes": 150}]', NULL, false, 'PUBLIC', true, '2026-07-29 01:28:52.011504+01', '2026-08-28 01:28:52.011504+01', 'Africa/Douala', NULL, 0, NULL, '2026-07-11 01:28:52.011504+01', NULL, NULL);
INSERT INTO public.polls (poll_id, user_id, slug, title, description, cover_photo_url, additional_photos_urls, videos_urls, category, display_organizer_name, social_links, status, vote_type, price_per_vote, vote_packs, max_votes_per_visitor, otp_enabled, results_visibility, show_grid_directly, open_at, close_at, timezone, rejection_reason, published_version, custom_fields, created_at, welcome_message, visible_sections) VALUES ('20000000-0000-0000-0000-0000000c0002', '10000000-0000-0000-0000-000000000003', 'talents-digitaux-afrique-2026', 'Talents Digitaux Afrique 2026', 'Le plus grand concours de créateurs de contenu digital d''Afrique francophone. 3 catégories, 12 finalistes, un seul objectif : représenter l''innovation africaine sur la scène internationale. Votez pour votre créateur préféré !', 'https://picsum.photos/seed/talents-digitaux-2026/1600/900', '{}', NULL, 'Concours numérique', 'Digital Africa Network', '{"x": "https://x.com/demo-talents", "facebook": "https://facebook.com/demo-talents-digitaux", "whatsapp": "https://wa.me/237600000020", "instagram": "https://instagram.com/demo-talents-digitaux"}', 'OPEN', 'PAID', 200.00, '[{"name": "Starter", "price": 3000, "votes": 20}, {"name": "Booster", "price": 13000, "votes": 100}, {"name": "Champion", "price": 35000, "votes": 300}]', NULL, false, 'PUBLIC', true, '2026-07-02 01:28:52.011504+01', '2026-08-01 01:28:52.011504+01', 'Africa/Douala', NULL, 0, NULL, '2026-07-11 01:28:52.011504+01', NULL, NULL);
INSERT INTO public.polls (poll_id, user_id, slug, title, description, cover_photo_url, additional_photos_urls, videos_urls, category, display_organizer_name, social_links, status, vote_type, price_per_vote, vote_packs, max_votes_per_visitor, otp_enabled, results_visibility, show_grid_directly, open_at, close_at, timezone, rejection_reason, published_version, custom_fields, created_at, welcome_message, visible_sections) VALUES ('20000000-0000-0000-0000-0000000c0003', '10000000-0000-0000-0000-000000000004', 'prix-innovation-etudiante-2025', 'Prix de l''Innovation Étudiante 2025', 'Le concours qui récompense les projets étudiants les plus innovants d''Afrique de l''Ouest. Édition 2025 clôturée — retrouvez le palmarès complet et le procès-verbal officiel ci-dessous.', 'https://picsum.photos/seed/innovation-2025/1600/900', '{}', NULL, 'Concours étudiant', 'Réseau Universitaire Ouest-Africain', '{"facebook": "https://facebook.com/demo-innovation-2025", "instagram": "https://instagram.com/demo-innovation-2025"}', 'CLOSED', 'FREE_VISITOR_ID', NULL, NULL, 5, false, 'PUBLIC', true, '2026-04-27 01:28:52.011504+01', '2026-06-26 01:28:52.011504+01', 'Africa/Douala', NULL, 0, NULL, '2026-07-11 01:28:52.011504+01', NULL, NULL);
INSERT INTO public.polls (poll_id, user_id, slug, title, description, cover_photo_url, additional_photos_urls, videos_urls, category, display_organizer_name, social_links, status, vote_type, price_per_vote, vote_packs, max_votes_per_visitor, otp_enabled, results_visibility, show_grid_directly, open_at, close_at, timezone, rejection_reason, published_version, custom_fields, created_at, welcome_message, visible_sections) VALUES ('10000000-0000-0000-0000-0000000c0011', '10000000-0000-0000-0000-000000000003', 'meilleur-artiste-urbain-annee', 'Meilleur artiste urbain de l''année', 'La communauté choisit l''artiste urbain qui a le plus marqué l''année en Côte d''Ivoire.', '/miss-universe.jpg', '{}', NULL, 'Musique', 'Ivoire Music Awards', NULL, 'OPEN', 'PAID', 300.00, NULL, NULL, false, 'PUBLIC', true, '2026-06-28 18:18:15.636215+01', '2026-07-14 18:18:15.636215+01', 'Africa/Douala', NULL, 0, NULL, '2026-07-10 18:18:15.636215+01', NULL, NULL);
INSERT INTO public.polls (poll_id, user_id, slug, title, description, cover_photo_url, additional_photos_urls, videos_urls, category, display_organizer_name, social_links, status, vote_type, price_per_vote, vote_packs, max_votes_per_visitor, otp_enabled, results_visibility, show_grid_directly, open_at, close_at, timezone, rejection_reason, published_version, custom_fields, created_at, welcome_message, visible_sections) VALUES ('0f5f4825-9cc3-4290-b81e-ebf0f8083d76', '10000000-0000-0000-0000-000000000002', 'jjjj', 'JJJJ', 'JJJJJ', '/uploads/images/4bdd481a-9f7c-4cd3-84e1-974f3a9b28c6.jpeg', '{}', NULL, 'IIIOO', 'JKIIJ', NULL, 'PENDING_VALIDATION', 'PAID', 100.00, NULL, NULL, false, 'PUBLIC', true, '2026-07-12 12:57:00+01', '2026-07-23 12:57:00+01', 'Africa/Douala', NULL, 0, NULL, '2026-07-12 12:57:52.692122+01', NULL, NULL);
INSERT INTO public.polls (poll_id, user_id, slug, title, description, cover_photo_url, additional_photos_urls, videos_urls, category, display_organizer_name, social_links, status, vote_type, price_per_vote, vote_packs, max_votes_per_visitor, otp_enabled, results_visibility, show_grid_directly, open_at, close_at, timezone, rejection_reason, published_version, custom_fields, created_at, welcome_message, visible_sections) VALUES ('fbe9170e-ebf0-43d2-a9f8-1fdbaaf5597b', '00000000-0000-0000-0000-000000000001', 'cvvv', 'Cvvv', 'Tgghhhj', '/uploads/images/6bac832d-3bce-4c69-a071-0a0382708a76.png', '{}', '{}', 'Meilleur humoriste', 'Vvbnm', '{}', 'PENDING_VALIDATION', 'FREE_PHONE', NULL, NULL, NULL, false, 'PUBLIC', true, '2026-07-30 15:36:00+01', '2026-07-31 15:36:00+01', 'Africa/Douala', NULL, 0, NULL, '2026-07-12 15:36:49.958806+01', NULL, NULL);
INSERT INTO public.polls (poll_id, user_id, slug, title, description, cover_photo_url, additional_photos_urls, videos_urls, category, display_organizer_name, social_links, status, vote_type, price_per_vote, vote_packs, max_votes_per_visitor, otp_enabled, results_visibility, show_grid_directly, open_at, close_at, timezone, rejection_reason, published_version, custom_fields, created_at, welcome_message, visible_sections) VALUES ('6ff2af24-1736-4df4-88ff-b3f4f4715e5d', '10000000-0000-0000-0000-000000000002', 'miss-cameroun-2026', 'Miss Cameroun 2026', NULL, NULL, '{}', '{}', NULL, NULL, '{}', 'PENDING_VALIDATION', 'FREE_VISITOR_ID', NULL, NULL, NULL, false, 'PUBLIC', true, '2026-07-13 14:22:00+01', '2026-08-11 14:22:00+01', 'Africa/Douala', NULL, 0, NULL, '2026-07-12 15:23:30.180205+01', 'Bienvenue au grand concours Miss Cameroun 2026 !', '["candidats", "regles", "faq", "partenaires", "galerie"]');


--
-- Data for Name: anomaly_detections; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: candidate_categories; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.candidate_categories (category_id, poll_id, name, "position") VALUES ('00000000-0000-0000-0000-0000000cc001', '00000000-0000-0000-0000-0000000c0001', 'Région Centre', 1);
INSERT INTO public.candidate_categories (category_id, poll_id, name, "position") VALUES ('10000000-0000-0000-0000-0000000cc001', '10000000-0000-0000-0000-0000000c0001', 'Région Centre', 1);
INSERT INTO public.candidate_categories (category_id, poll_id, name, "position") VALUES ('10000000-0000-0000-0000-0000000cc002', '10000000-0000-0000-0000-0000000c0001', 'Région Littoral', 2);
INSERT INTO public.candidate_categories (category_id, poll_id, name, "position") VALUES ('10000000-0000-0000-0000-0000000cc011', '10000000-0000-0000-0000-0000000c0011', 'Artistes', 1);
INSERT INTO public.candidate_categories (category_id, poll_id, name, "position") VALUES ('10000000-0000-0000-0000-0000000cc012', '10000000-0000-0000-0000-0000000c0012', 'Créateurs', 1);
INSERT INTO public.candidate_categories (category_id, poll_id, name, "position") VALUES ('10000000-0000-0000-0000-0000000cc013', '10000000-0000-0000-0000-0000000c0013', 'Bureau', 1);
INSERT INTO public.candidate_categories (category_id, poll_id, name, "position") VALUES ('10000000-0000-0000-0000-0000000cc014', '10000000-0000-0000-0000-0000000c0014', 'Enseignants', 1);
INSERT INTO public.candidate_categories (category_id, poll_id, name, "position") VALUES ('10000000-0000-0000-0000-0000000cc015', '10000000-0000-0000-0000-0000000c0015', 'Finalistes', 1);
INSERT INTO public.candidate_categories (category_id, poll_id, name, "position") VALUES ('20000000-0000-0000-0000-0000000cc101', '20000000-0000-0000-0000-0000000c0001', 'Zone Akwa', 1);
INSERT INTO public.candidate_categories (category_id, poll_id, name, "position") VALUES ('20000000-0000-0000-0000-0000000cc102', '20000000-0000-0000-0000-0000000c0001', 'Zone Bonanjo', 2);
INSERT INTO public.candidate_categories (category_id, poll_id, name, "position") VALUES ('20000000-0000-0000-0000-0000000cc103', '20000000-0000-0000-0000-0000000c0001', 'Zone Bonabéri', 3);
INSERT INTO public.candidate_categories (category_id, poll_id, name, "position") VALUES ('20000000-0000-0000-0000-0000000cc201', '20000000-0000-0000-0000-0000000c0002', 'Créateur Vidéo', 1);
INSERT INTO public.candidate_categories (category_id, poll_id, name, "position") VALUES ('20000000-0000-0000-0000-0000000cc202', '20000000-0000-0000-0000-0000000c0002', 'Créateur Musique', 2);
INSERT INTO public.candidate_categories (category_id, poll_id, name, "position") VALUES ('20000000-0000-0000-0000-0000000cc203', '20000000-0000-0000-0000-0000000c0002', 'Créateur Mode & Art', 3);
INSERT INTO public.candidate_categories (category_id, poll_id, name, "position") VALUES ('20000000-0000-0000-0000-0000000cc301', '20000000-0000-0000-0000-0000000c0003', 'Technologie & IA', 1);
INSERT INTO public.candidate_categories (category_id, poll_id, name, "position") VALUES ('20000000-0000-0000-0000-0000000cc302', '20000000-0000-0000-0000-0000000c0003', 'Impact Social', 2);


--
-- Data for Name: candidates; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('00000000-0000-0000-0000-0000000cd002', '00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000cc001', 'Fatou Bello', 'Fatou B.', NULL, '{}', NULL, NULL, NULL, NULL, NULL, 0, NULL, true, 2, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('10000000-0000-0000-0000-0000000cd001', '10000000-0000-0000-0000-0000000c0001', '10000000-0000-0000-0000-0000000cc001', 'Marie Ngo', 'Marie N.', NULL, '{}', NULL, NULL, NULL, NULL, NULL, 1240, 1, true, 1, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('10000000-0000-0000-0000-0000000cd002', '10000000-0000-0000-0000-0000000c0001', '10000000-0000-0000-0000-0000000cc001', 'Fatou Bello', 'Fatou B.', NULL, '{}', NULL, NULL, NULL, NULL, NULL, 980, 2, true, 2, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('10000000-0000-0000-0000-0000000cd003', '10000000-0000-0000-0000-0000000c0001', '10000000-0000-0000-0000-0000000cc002', 'Solange Mbarga', 'Solange M.', '/miss-universe.jpg', '{}', NULL, 'Étudiante en droit, passionnée de danse traditionnelle et engagée dans des actions caritatives pour l''éducation des jeunes filles.', NULL, NULL, NULL, 875, 3, true, 3, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('10000000-0000-0000-0000-0000000cd004', '10000000-0000-0000-0000-0000000c0001', '10000000-0000-0000-0000-0000000cc001', 'Grace Etoundi', 'Grace E.', '/miss-mister-pageant.jpg', '{}', NULL, 'Chanteuse et créatrice de contenu, ambassadrice d''une association de protection de l''environnement.', NULL, NULL, NULL, 640, 4, true, 4, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('10000000-0000-0000-0000-0000000cd005', '10000000-0000-0000-0000-0000000c0001', '10000000-0000-0000-0000-0000000cc002', 'Aicha Moussa', 'Aicha M.', '/miss-crown.jpg', '{}', NULL, 'Styliste de mode originaire de Douala, elle promeut les tissus et créateurs locaux à travers ses créations.', NULL, NULL, NULL, 512, 5, true, 5, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('10000000-0000-0000-0000-0000000cd006', '10000000-0000-0000-0000-0000000c0001', '10000000-0000-0000-0000-0000000cc001', 'Brenda Talla', 'Brenda T.', '/miss-universe.jpg', '{}', NULL, 'Athlète et étudiante en communication, elle milite pour l''accès au sport pour les jeunes filles en zone rurale.', NULL, NULL, NULL, 300, 6, true, 6, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('10000000-0000-0000-0000-0000000cd007', '10000000-0000-0000-0000-0000000c0011', '10000000-0000-0000-0000-0000000cc011', 'Yann Kouassi', 'Yann K.', '/concert-singer.jpg', '{}', NULL, 'Rappeur ivoirien, révélation de l''année avec son dernier album.', NULL, NULL, NULL, 3120, 1, true, 1, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('10000000-0000-0000-0000-0000000cd008', '10000000-0000-0000-0000-0000000c0011', '10000000-0000-0000-0000-0000000cc011', 'Aya Bamba', 'Aya B.', '/concert-jazz.jpg', '{}', NULL, 'Chanteuse afrobeat, connue pour ses collaborations internationales.', NULL, NULL, NULL, 2540, 2, true, 2, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('10000000-0000-0000-0000-0000000cd009', '10000000-0000-0000-0000-0000000c0011', '10000000-0000-0000-0000-0000000cc011', 'DJ Mory', 'DJ Mory', '/concert-outdoor.jpg', '{}', NULL, 'DJ et producteur, tête d''affiche des plus grands festivals du pays.', NULL, NULL, NULL, 1890, 3, true, 3, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('10000000-0000-0000-0000-0000000cd010', '10000000-0000-0000-0000-0000000c0012', '10000000-0000-0000-0000-0000000cc012', 'Khadija Sarr', 'Khadija S.', '/events-collage-tech.jpg', '{}', NULL, 'Créatrice de contenu lifestyle, plus de 200k abonnés.', NULL, NULL, NULL, 0, NULL, true, 1, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('10000000-0000-0000-0000-0000000cd011', '10000000-0000-0000-0000-0000000c0012', '10000000-0000-0000-0000-0000000cc012', 'Omar Diagne', 'Omar D.', '/events-collage-light.jpg', '{}', NULL, 'Vidéaste humoriste, connu pour ses sketchs sur le quotidien sénégalais.', NULL, NULL, NULL, 0, NULL, true, 2, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('10000000-0000-0000-0000-0000000cd012', '10000000-0000-0000-0000-0000000c0013', '10000000-0000-0000-0000-0000000cc013', 'Paul Ateba', 'Paul A.', '/africa-network.jpg', '{}', NULL, 'Membre fondateur de l''association, candidat à la présidence.', NULL, NULL, NULL, 342, 1, true, 1, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('10000000-0000-0000-0000-0000000cd013', '10000000-0000-0000-0000-0000000c0013', '10000000-0000-0000-0000-0000000cc013', 'Chantal Ndoye', 'Chantal N.', '/community-heart.jpg', '{}', NULL, 'Trésorière sortante, candidate à sa réélection.', NULL, NULL, NULL, 200, 2, true, 2, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('10000000-0000-0000-0000-0000000cd014', '10000000-0000-0000-0000-0000000c0014', '10000000-0000-0000-0000-0000000cc014', 'Marcel Owono', 'M. Owono', '/choir-performance.jpg', '{}', NULL, 'Professeur de mathématiques, 15 ans d''expérience.', NULL, NULL, NULL, 1120, 1, true, 1, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('10000000-0000-0000-0000-0000000cd015', '10000000-0000-0000-0000-0000000c0014', '10000000-0000-0000-0000-0000000cc014', 'Sylvie Nze', 'Mme Nze', '/gala-performance.jpg', '{}', NULL, 'Institutrice engagée dans l''alphabétisation rurale.', NULL, NULL, NULL, 980, 2, true, 2, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('10000000-0000-0000-0000-0000000cd016', '10000000-0000-0000-0000-0000000c0015', '10000000-0000-0000-0000-0000000cc015', 'Estelle Kacou', 'Estelle K.', '/miss-crown.jpg', '{}', NULL, 'Étudiante en gestion, passionnée de mode africaine.', NULL, NULL, NULL, 0, NULL, true, 1, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('10000000-0000-0000-0000-0000000cd017', '10000000-0000-0000-0000-0000000c0015', '10000000-0000-0000-0000-0000000cc015', 'Nadège Yao', 'Nadège Y.', '/miss-universe.jpg', '{}', NULL, 'Danseuse et ambassadrice de plusieurs marques locales.', NULL, NULL, NULL, 0, NULL, true, 2, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('b329021f-6d3b-4132-b60b-063615b8dd35', '20000000-0000-0000-0000-0000000c0001', '20000000-0000-0000-0000-0000000cc101', 'Chantal Ekwalla', 'Chantal E.', 'https://picsum.photos/seed/mc27-c1/600/800', '{https://picsum.photos/seed/mc27-c1b/600/800,https://picsum.photos/seed/mc27-c1c/600/800}', NULL, 'Étudiante en droit, passionnée de danse traditionnelle bassa.', NULL, NULL, NULL, 0, NULL, true, 0, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('7a028a77-2c26-4cac-aeac-087c2ae3f6d1', '20000000-0000-0000-0000-0000000c0001', '20000000-0000-0000-0000-0000000cc101', 'Solange Mbarga', 'Solange M.', 'https://picsum.photos/seed/mc27-c2/600/800', '{https://picsum.photos/seed/mc27-c2b/600/800}', NULL, 'Créatrice de mode, ambassadrice du pagne wax local.', NULL, NULL, NULL, 0, NULL, true, 5, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('e9b5b9f6-b76f-44fc-a754-d29951af2d22', '20000000-0000-0000-0000-0000000c0001', '20000000-0000-0000-0000-0000000cc101', 'Rebecca Doualla', 'Rebecca D.', 'https://picsum.photos/seed/mc27-c3/600/800', '{https://picsum.photos/seed/mc27-c3b/600/800}', NULL, 'Chanteuse lyrique, finaliste d''un télé-crochet national.', NULL, NULL, NULL, 0, NULL, true, 8, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('e2907b65-ffa0-48f8-9aa4-8538d7b3230f', '20000000-0000-0000-0000-0000000c0001', '20000000-0000-0000-0000-0000000cc101', 'Aicha Njoya', 'Aicha N.', 'https://picsum.photos/seed/mc27-c4/600/800', '{https://picsum.photos/seed/mc27-c4b/600/800}', NULL, 'Entrepreneuse sociale, fondatrice d''une coopérative de couturières.', NULL, NULL, NULL, 0, NULL, true, 9, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('00000000-0000-0000-0000-0000000cd001', '00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000cc001', 'Marie Ngo', 'Marie N.', NULL, '{}', '{}', NULL, NULL, 'awa.organizer@liboka-demo.cm', NULL, 1, NULL, true, 1, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('e3dcb42a-23d0-4480-9c92-d53026c5920a', '20000000-0000-0000-0000-0000000c0002', '20000000-0000-0000-0000-0000000cc201', 'Marc-Aurèle Ngo', 'MarcA N.', 'https://picsum.photos/seed/tda26-c2/600/800', '{https://picsum.photos/seed/tda26-c2b/600/800}', NULL, 'Réalisateur de mini-séries virales sur la vie estudiantine.', NULL, NULL, NULL, 3610, 4, true, 2, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('64533800-c793-4c36-9b5e-64dc45c14a36', '20000000-0000-0000-0000-0000000c0002', '20000000-0000-0000-0000-0000000cc201', 'Ingrid Bella', 'Ingrid B.', 'https://picsum.photos/seed/tda26-c3/600/800', '{https://picsum.photos/seed/tda26-c3b/600/800}', NULL, 'Vulgarisatrice tech, explique l''IA en langues locales.', NULL, NULL, NULL, 2980, 6, true, 3, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('5d043b1e-9ea9-420f-aa04-e4bd18416412', '20000000-0000-0000-0000-0000000c0002', '20000000-0000-0000-0000-0000000cc201', 'Steve Manga', 'Steve M.', 'https://picsum.photos/seed/tda26-c4/600/800', '{https://picsum.photos/seed/tda26-c4b/600/800}', NULL, 'Monteur vidéo autodidacte devenu formateur en ligne.', NULL, NULL, NULL, 1540, 10, true, 4, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('acc610e4-c4c1-4185-bad1-cf0f0cede274', '20000000-0000-0000-0000-0000000c0002', '20000000-0000-0000-0000-0000000cc202', 'Bruce Ateba', 'Bruce A.', 'https://picsum.photos/seed/tda26-c6/600/800', '{https://picsum.photos/seed/tda26-c6b/600/800}', NULL, 'Producteur de beats, collabore avec des artistes émergents.', NULL, NULL, NULL, 2410, 7, true, 2, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('455a82c1-e84b-4ea4-83b5-c5b9144d8e44', '20000000-0000-0000-0000-0000000c0002', '20000000-0000-0000-0000-0000000cc202', 'Sandra Eyenga', 'Sandra E.', 'https://picsum.photos/seed/tda26-c7/600/800', '{https://picsum.photos/seed/tda26-c7b/600/800}', NULL, 'Chanteuse folk revisitant les rythmes traditionnels.', NULL, NULL, NULL, 3120, 5, true, 3, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('99456df1-c807-43f1-98bf-fada55c0671b', '20000000-0000-0000-0000-0000000c0002', '20000000-0000-0000-0000-0000000cc202', 'Hervé Zang', 'Hervé Z.', 'https://picsum.photos/seed/tda26-c8/600/800', '{https://picsum.photos/seed/tda26-c8b/600/800}', NULL, 'DJ et animateur radio, figure montante de la scène urbaine.', NULL, NULL, NULL, 980, 12, true, 4, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('48bd70a2-ecaa-41fb-85a4-01b16ea113d3', '20000000-0000-0000-0000-0000000c0002', '20000000-0000-0000-0000-0000000cc203', 'Patrick Onana', 'Patrick O.', 'https://picsum.photos/seed/tda26-c10/600/800', '{https://picsum.photos/seed/tda26-c10b/600/800}', NULL, 'Illustrateur numérique, fusionne art traditionnel et digital.', NULL, NULL, NULL, 1870, 9, true, 2, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('f3663e8c-25f7-44d7-8849-66306e63c59b', '20000000-0000-0000-0000-0000000c0002', '20000000-0000-0000-0000-0000000cc203', 'Élodie Fouda', 'Élodie F.', 'https://picsum.photos/seed/tda26-c11/600/800', '{https://picsum.photos/seed/tda26-c11b/600/800}', NULL, 'Photographe de mode urbaine, exposée à Dakar et Abidjan.', NULL, NULL, NULL, 2205, 8, true, 3, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('ab44e70f-e197-42c2-84cf-7e379f383f94', '20000000-0000-0000-0000-0000000c0002', '20000000-0000-0000-0000-0000000cc203', 'Junior Talla', 'Junior T.', 'https://picsum.photos/seed/tda26-c12/600/800', '{https://picsum.photos/seed/tda26-c12b/600/800}', NULL, 'Designer 3D, crée des filtres réalité augmentée viraux.', NULL, NULL, NULL, 1330, 11, true, 4, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('fe99229b-fd9c-466f-b0b0-ce523e589034', '20000000-0000-0000-0000-0000000c0003', '20000000-0000-0000-0000-0000000cc301', 'Équipe AgriSense', 'AgriSense', 'https://picsum.photos/seed/inno25-c1/600/800', '{https://picsum.photos/seed/inno25-c1b/600/800}', NULL, 'Capteurs IoT low-cost pour l''irrigation intelligente des petites exploitations.', NULL, NULL, NULL, 1284, 1, true, 1, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('6f964091-b8e9-42e2-bc31-5dfcbec27bdc', '20000000-0000-0000-0000-0000000c0003', '20000000-0000-0000-0000-0000000cc301', 'Équipe MediScan', 'MediScan', 'https://picsum.photos/seed/inno25-c2/600/800', '{https://picsum.photos/seed/inno25-c2b/600/800}', NULL, 'Diagnostic assisté par IA pour les zones sans accès à la radiologie.', NULL, NULL, NULL, 1109, 2, true, 2, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('e9c3f449-86f5-47ed-9e85-b331aafe656d', '20000000-0000-0000-0000-0000000c0003', '20000000-0000-0000-0000-0000000cc301', 'Équipe SolarGrid', 'SolarGrid', 'https://picsum.photos/seed/inno25-c3/600/800', '{https://picsum.photos/seed/inno25-c3b/600/800}', NULL, 'Micro-réseaux solaires partagés pour quartiers non électrifiés.', NULL, NULL, NULL, 845, 4, true, 3, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('fbecf352-7d18-438e-9eea-8d3358badacb', '20000000-0000-0000-0000-0000000c0003', '20000000-0000-0000-0000-0000000cc301', 'Équipe CodeLocal', 'CodeLocal', 'https://picsum.photos/seed/inno25-c4/600/800', '{https://picsum.photos/seed/inno25-c4b/600/800}', NULL, 'Plateforme d''apprentissage du code en langues nationales.', NULL, NULL, NULL, 612, 6, true, 4, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('26ecb7c8-e002-4594-bb1b-1d5196ad33e9', '20000000-0000-0000-0000-0000000c0003', '20000000-0000-0000-0000-0000000cc301', 'Équipe AquaPure', 'AquaPure', 'https://picsum.photos/seed/inno25-c5/600/800', '{https://picsum.photos/seed/inno25-c5b/600/800}', NULL, 'Filtration d''eau low-tech à base de matériaux locaux.', NULL, NULL, NULL, 498, 8, true, 5, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('66baea26-7454-4260-95d2-a24f4dfa7a34', '20000000-0000-0000-0000-0000000c0003', '20000000-0000-0000-0000-0000000cc302', 'Équipe EcoRecycle', 'EcoRecycle', 'https://picsum.photos/seed/inno25-c6/600/800', '{https://picsum.photos/seed/inno25-c6b/600/800}', NULL, 'Collecte et valorisation des déchets plastiques en matériaux de construction.', NULL, NULL, NULL, 1052, 3, true, 1, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('eba6b473-f118-4d77-99b9-3a75d3a07956', '20000000-0000-0000-0000-0000000c0003', '20000000-0000-0000-0000-0000000cc302', 'Équipe FemTech', 'FemTech', 'https://picsum.photos/seed/inno25-c7/600/800', '{https://picsum.photos/seed/inno25-c7b/600/800}', NULL, 'Application de santé menstruelle et reproductive pour zones rurales.', NULL, NULL, NULL, 733, 5, true, 2, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('04a8330b-ce04-45b3-941e-d75b4ada3d63', '20000000-0000-0000-0000-0000000c0003', '20000000-0000-0000-0000-0000000cc302', 'Équipe MicroCredit+', 'MicroCredit+', 'https://picsum.photos/seed/inno25-c8/600/800', '{https://picsum.photos/seed/inno25-c8b/600/800}', NULL, 'Scoring de microcrédit basé sur les données Mobile Money.', NULL, NULL, NULL, 567, 7, true, 3, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('a44f530a-935b-4785-8aec-ae078e2b2c4e', '20000000-0000-0000-0000-0000000c0001', '20000000-0000-0000-0000-0000000cc102', 'Pauline Essomba', 'Pauline E.', 'https://picsum.photos/seed/mc27-c5/600/800', '{https://picsum.photos/seed/mc27-c5b/600/800}', NULL, 'Journaliste culturelle, passionnée de patrimoine sawa.', NULL, NULL, NULL, 0, NULL, true, 1, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('7321460a-60d6-47fe-a086-c9347c6f76e9', '20000000-0000-0000-0000-0000000c0001', '20000000-0000-0000-0000-0000000cc103', 'Vanessa Ekotto', 'Vanessa E.', 'https://picsum.photos/seed/mc27-c8/600/800', '{https://picsum.photos/seed/mc27-c8b/600/800}', NULL, 'Photographe, met en lumière les artisans locaux.', NULL, NULL, NULL, 0, NULL, true, 2, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('350dede6-59d1-48a0-9941-bf564cafc201', '20000000-0000-0000-0000-0000000c0001', '20000000-0000-0000-0000-0000000cc102', 'Grace Tabi', 'Grace T.', 'https://picsum.photos/seed/mc27-c6/600/800', '{https://picsum.photos/seed/mc27-c6b/600/800}', NULL, 'Danseuse professionnelle et professeure de zumba.', NULL, NULL, NULL, 0, NULL, true, 3, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('43504409-9b5f-41a6-b0cb-574f2a9718f5', '20000000-0000-0000-0000-0000000c0001', '20000000-0000-0000-0000-0000000cc103', 'Larissa Bilé', 'Larissa B.', 'https://picsum.photos/seed/mc27-c9/600/800', '{https://picsum.photos/seed/mc27-c9b/600/800}', NULL, 'Chef cuisinière, ambassadrice de la gastronomie sawa.', NULL, NULL, NULL, 0, NULL, true, 6, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('bfab0d94-829a-4eee-a8c3-84d291e940e0', '20000000-0000-0000-0000-0000000c0003', '20000000-0000-0000-0000-0000000cc302', 'Équipe TransportEase', 'TransportEase', 'https://picsum.photos/seed/inno25-c9/600/800', '{https://picsum.photos/seed/inno25-c9b/600/800}', NULL, 'Optimisation des trajets de transport informel urbain.', NULL, NULL, NULL, 401, 9, true, 4, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('be61206e-1f42-47f8-8649-e256fc671c2a', '20000000-0000-0000-0000-0000000c0003', '20000000-0000-0000-0000-0000000cc302', 'Équipe SafeStreet', 'SafeStreet', 'https://picsum.photos/seed/inno25-c10/600/800', '{https://picsum.photos/seed/inno25-c10b/600/800}', NULL, 'Signalement communautaire de zones à risque via SMS.', NULL, NULL, NULL, 298, 10, true, 5, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('665964a8-1230-44b1-aae7-27bb0ff15a1c', '20000000-0000-0000-0000-0000000c0002', '20000000-0000-0000-0000-0000000cc201', 'Yannick Fotso', 'Yann F.', 'https://picsum.photos/seed/tda26-c1/600/800', '{https://picsum.photos/seed/tda26-c1b/600/800,https://picsum.photos/seed/tda26-c1c/600/800}', '{/footer-video.mp4}', 'Créateur de contenu comédie, 800K abonnés cumulés.', NULL, NULL, NULL, 4820, 1, true, 1, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('424ff260-b077-40f5-87af-fbc5a85d6d7f', '20000000-0000-0000-0000-0000000c0002', '20000000-0000-0000-0000-0000000cc202', 'Diane Kamga', 'Diane K.', 'https://picsum.photos/seed/tda26-c5/600/800', '{https://picsum.photos/seed/tda26-c5b/600/800}', '{/footer-video.mp4}', 'Auteure-compositrice afrobeat, primée au niveau régional.', NULL, NULL, NULL, 4310, 2, true, 1, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('20f6e4ad-7aa2-4f09-a749-6c8b6757e726', '20000000-0000-0000-0000-0000000c0002', '20000000-0000-0000-0000-0000000cc203', 'Carole Mvondo', 'Carole M.', 'https://picsum.photos/seed/tda26-c9/600/800', '{https://picsum.photos/seed/tda26-c9b/600/800}', '{/footer-video.mp4}', 'Styliste digitale, ses looks inspirent 300K followers.', NULL, NULL, NULL, 4055, 3, true, 1, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('7ce63d72-0211-4f83-b5dd-4df15df6a5c3', '20000000-0000-0000-0000-0000000c0001', '20000000-0000-0000-0000-0000000cc102', 'Nadège Owona', 'Nadège O.', 'https://picsum.photos/seed/mc27-c7/600/800', '{https://picsum.photos/seed/mc27-c7b/600/800}', NULL, 'Étudiante en médecine, engagée dans le bénévolat hospitalier.', NULL, NULL, NULL, 0, NULL, true, 4, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('b6c138f4-f759-4982-a502-70d21d99752f', '20000000-0000-0000-0000-0000000c0001', '20000000-0000-0000-0000-0000000cc103', 'Fabiola Nnomo', 'Fabiola N.', 'https://picsum.photos/seed/mc27-c10/600/800', '{https://picsum.photos/seed/mc27-c10b/600/800}', NULL, 'Athlète, championne régionale d''athlétisme.', NULL, NULL, NULL, 0, NULL, true, 7, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('73f9d919-7777-43d2-8302-7cc83a511cb9', '0f5f4825-9cc3-4290-b81e-ebf0f8083d76', NULL, 'HJKII', 'HJKII', NULL, '{}', NULL, NULL, NULL, NULL, NULL, 0, NULL, true, 0, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('6749c2d2-754b-470b-b777-471830c5633b', '0f5f4825-9cc3-4290-b81e-ebf0f8083d76', NULL, 'IIIII', 'IIIII', NULL, '{}', NULL, NULL, NULL, NULL, NULL, 0, NULL, true, 0, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('7e9196d0-879a-48e3-a24a-db0bf94b8ae8', '6ff2af24-1736-4df4-88ff-b3f4f4715e5d', NULL, 'Aïcha Ngono', 'Aïcha Ngono', NULL, '{}', '{}', NULL, NULL, NULL, NULL, 0, NULL, true, 0, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('f2a04280-4293-4186-8c71-991ffed1b030', 'fbe9170e-ebf0-43d2-a9f8-1fdbaaf5597b', NULL, 'Ghghhhv', 'Ghghhhv', NULL, '{}', '{}', NULL, NULL, NULL, NULL, 0, NULL, true, 0, NULL);
INSERT INTO public.candidates (candidate_id, poll_id, category_id, real_name, display_name, cover_photo_url, additional_photos_urls, videos_urls, biography, phone, email, payout_phone, score, rank, active, "position", custom_fields_data) VALUES ('7a2521f1-dff5-429c-b63d-762266511272', 'fbe9170e-ebf0-43d2-a9f8-1fdbaaf5597b', NULL, 'Cvbnbh', 'Cvbnbh', NULL, '{}', '{}', NULL, NULL, NULL, NULL, 0, NULL, true, 0, NULL);


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.transactions (transaction_id, campaign_id, campaign_type, type, visitor_id, user_id, gross_amount, moledi_commission, psp_fee, net_organizer, status, idempotency_key, aggregator_id, external_tx_id, country, payment_method, operator, webhook_payload, correlation_id, applied_commission_config_id, initiated_at, confirmed_at, expires_at) VALUES ('10000000-0000-0000-0000-0000000f0001', '10000000-0000-0000-0000-0000000c0001', 'POLL', 'VOTE', '10000000-0000-0000-0000-000000005001', NULL, 500.00, 50.00, 5.00, 445.00, 'CONFIRMED', 'demo-idem-vote-0001', '10000000-0000-0000-0000-0000000a0001', NULL, 'CM', 'MOBILE_MONEY', 'Orange', NULL, 'demo-corr-vote-0001', NULL, '2026-07-09 17:23:33.439491+01', '2026-07-09 17:23:33.439491+01', NULL);
INSERT INTO public.transactions (transaction_id, campaign_id, campaign_type, type, visitor_id, user_id, gross_amount, moledi_commission, psp_fee, net_organizer, status, idempotency_key, aggregator_id, external_tx_id, country, payment_method, operator, webhook_payload, correlation_id, applied_commission_config_id, initiated_at, confirmed_at, expires_at) VALUES ('10000000-0000-0000-0000-0000000f0002', '10000000-0000-0000-0000-0000000c0002', 'EVENT', 'TICKET', '10000000-0000-0000-0000-000000005003', NULL, 5000.00, 350.00, 25.00, 4625.00, 'CONFIRMED', 'demo-idem-ticket-0001', '10000000-0000-0000-0000-0000000a0001', NULL, 'CM', 'MOBILE_MONEY', 'Orange', NULL, 'demo-corr-ticket-0001', NULL, '2026-07-09 17:23:33.439491+01', '2026-07-09 17:23:33.439491+01', NULL);
INSERT INTO public.transactions (transaction_id, campaign_id, campaign_type, type, visitor_id, user_id, gross_amount, moledi_commission, psp_fee, net_organizer, status, idempotency_key, aggregator_id, external_tx_id, country, payment_method, operator, webhook_payload, correlation_id, applied_commission_config_id, initiated_at, confirmed_at, expires_at) VALUES ('10000000-0000-0000-0000-0000000f0003', '10000000-0000-0000-0000-0000000c0003', 'FUNDRAISER', 'DONATION', '10000000-0000-0000-0000-000000005004', NULL, 50000.00, 3500.00, 250.00, 46250.00, 'CONFIRMED', 'demo-idem-don-0001', '10000000-0000-0000-0000-0000000a0003', NULL, 'SN', 'MOBILE_MONEY', 'MTN', NULL, 'demo-corr-don-0001', NULL, '2026-07-09 17:23:33.439491+01', '2026-07-09 17:23:33.439491+01', NULL);
INSERT INTO public.transactions (transaction_id, campaign_id, campaign_type, type, visitor_id, user_id, gross_amount, moledi_commission, psp_fee, net_organizer, status, idempotency_key, aggregator_id, external_tx_id, country, payment_method, operator, webhook_payload, correlation_id, applied_commission_config_id, initiated_at, confirmed_at, expires_at) VALUES ('10000000-0000-0000-0000-0000000f0004', '10000000-0000-0000-0000-0000000c0004', 'CF_PROJECT', 'CF_CONTRIBUTION', '10000000-0000-0000-0000-000000005005', NULL, 75000.00, 5250.00, 375.00, 69375.00, 'CONFIRMED', 'demo-idem-cf-0001', '10000000-0000-0000-0000-0000000a0002', NULL, 'CM', 'CARD', NULL, NULL, 'demo-corr-cf-0001', NULL, '2026-07-09 17:23:33.439491+01', '2026-07-09 17:23:33.439491+01', NULL);
INSERT INTO public.transactions (transaction_id, campaign_id, campaign_type, type, visitor_id, user_id, gross_amount, moledi_commission, psp_fee, net_organizer, status, idempotency_key, aggregator_id, external_tx_id, country, payment_method, operator, webhook_payload, correlation_id, applied_commission_config_id, initiated_at, confirmed_at, expires_at) VALUES ('10000000-0000-0000-0000-0000000f0005', '10000000-0000-0000-0000-0000000c0005', 'SPONSOR_CALL', 'SPONSORSHIP', '10000000-0000-0000-0000-000000005006', NULL, 0.00, 0.00, 0.00, 0.00, 'CONFIRMED', 'demo-idem-sponsor-0001', '10000000-0000-0000-0000-0000000a0001', NULL, 'CM', 'MOBILE_MONEY', 'Orange', NULL, 'demo-corr-sponsor-0001', NULL, '2026-07-09 17:23:33.439491+01', '2026-07-09 17:23:33.439491+01', NULL);
INSERT INTO public.transactions (transaction_id, campaign_id, campaign_type, type, visitor_id, user_id, gross_amount, moledi_commission, psp_fee, net_organizer, status, idempotency_key, aggregator_id, external_tx_id, country, payment_method, operator, webhook_payload, correlation_id, applied_commission_config_id, initiated_at, confirmed_at, expires_at) VALUES ('10000000-0000-0000-0000-0000000f0006', '10000000-0000-0000-0000-0000000c0006', 'CONTEST', 'CONTEST_ENTRY', '10000000-0000-0000-0000-000000005007', NULL, 1000.00, 100.00, 10.00, 890.00, 'CONFIRMED', 'demo-idem-contest-0001', '10000000-0000-0000-0000-0000000a0003', NULL, 'CI', 'MOBILE_MONEY', 'MTN', NULL, 'demo-corr-contest-0001', NULL, '2026-07-09 17:23:33.439491+01', '2026-07-09 17:23:33.439491+01', NULL);
INSERT INTO public.transactions (transaction_id, campaign_id, campaign_type, type, visitor_id, user_id, gross_amount, moledi_commission, psp_fee, net_organizer, status, idempotency_key, aggregator_id, external_tx_id, country, payment_method, operator, webhook_payload, correlation_id, applied_commission_config_id, initiated_at, confirmed_at, expires_at) VALUES ('10000000-0000-0000-0000-0000000f0007', '10000000-0000-0000-0000-0000000c0007', 'LOTTERY', 'LOTTERY_TICKET', '10000000-0000-0000-0000-000000005008', NULL, 2000.00, 200.00, 20.00, 1780.00, 'CONFIRMED', 'demo-idem-lottery-0001', '10000000-0000-0000-0000-0000000a0001', NULL, 'CM', 'MOBILE_MONEY', 'Orange', NULL, 'demo-corr-lottery-0001', NULL, '2026-07-09 17:23:33.439491+01', '2026-07-09 17:23:33.439491+01', NULL);
INSERT INTO public.transactions (transaction_id, campaign_id, campaign_type, type, visitor_id, user_id, gross_amount, moledi_commission, psp_fee, net_organizer, status, idempotency_key, aggregator_id, external_tx_id, country, payment_method, operator, webhook_payload, correlation_id, applied_commission_config_id, initiated_at, confirmed_at, expires_at) VALUES ('fbb0eba3-2b83-4f84-892f-c48105fbe120', '10000000-0000-0000-0000-0000000c0015', 'POLL', 'VOTE', 'e9fa42bb-6456-4375-971d-d1ba43db41ab', NULL, 5000.00, 0.00, 0.00, 0.00, 'EXPIRED', '1f8f4de5-7977-4e8d-a3be-59e2614727f2', '00000000-0000-0000-0000-000000000a01', 'ORMO-b270e11d177d18ee', 'CM', 'MOBILE_MONEY', 'Orange', NULL, '739581f8-9ae5-4d88-9847-8c3d571a9836', NULL, '2026-07-10 19:47:04.35063+01', NULL, '2026-07-10 20:17:04.35063+01');
INSERT INTO public.transactions (transaction_id, campaign_id, campaign_type, type, visitor_id, user_id, gross_amount, moledi_commission, psp_fee, net_organizer, status, idempotency_key, aggregator_id, external_tx_id, country, payment_method, operator, webhook_payload, correlation_id, applied_commission_config_id, initiated_at, confirmed_at, expires_at) VALUES ('698d6225-0d69-47ae-bd70-a629f79c065d', '20000000-0000-0000-0000-0000000c0002', 'POLL', 'VOTE', '93ce2831-e6e0-4477-a0cc-47f3b9b41301', NULL, 200.00, 20.00, 0.00, 180.00, 'EXPIRED', 'e3854ca8-b6aa-4650-adf0-7920ae439bdf', '10000000-0000-0000-0000-0000000a0003', 'ORMO-8ff43231b8dd7b03', 'CI', 'MOBILE_MONEY', 'MTN Mobile Money', NULL, 'f455664d-fa05-4258-a45a-8e1d294d9136', NULL, '2026-07-11 01:42:45.946727+01', NULL, '2026-07-11 02:12:45.946727+01');


--
-- Data for Name: votes; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.votes (vote_id, poll_id, candidate_id, visitor_id, user_id, vote_type, status, verification_method, short_id, ip_hashed, transaction_id, created_at) VALUES ('5a7f9fe0-37cc-49d5-aca7-5358d4b44693', '00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000cd001', '00000000-0000-0000-0000-000000005001', NULL, 'FREE_VISITOR_ID', 'COUNTED', 'visitor_id_silent_check', 'X4K9P2QR', 'demo-hash-0001', NULL, '2026-07-08 23:54:21.812003+01');
INSERT INTO public.votes (vote_id, poll_id, candidate_id, visitor_id, user_id, vote_type, status, verification_method, short_id, ip_hashed, transaction_id, created_at) VALUES ('51ad63ce-3988-486d-b741-f5aaff2822ab', '10000000-0000-0000-0000-0000000c0001', '10000000-0000-0000-0000-0000000cd001', '10000000-0000-0000-0000-000000005001', NULL, 'PAID', 'COUNTED', 'psp_confirmed', 'X4K9P2QR', 'demo-hash-0001', '10000000-0000-0000-0000-0000000f0001', '2026-07-09 17:23:33.439491+01');
INSERT INTO public.votes (vote_id, poll_id, candidate_id, visitor_id, user_id, vote_type, status, verification_method, short_id, ip_hashed, transaction_id, created_at) VALUES ('d56439ea-7f86-4821-b871-bdda4bab783b', '10000000-0000-0000-0000-0000000c0001', '10000000-0000-0000-0000-0000000cd002', '10000000-0000-0000-0000-000000005002', NULL, 'FREE_VISITOR_ID', 'COUNTED', 'visitor_id_silent_check', 'Y7M2N4PQ', 'demo-hash-0002', NULL, '2026-07-09 17:23:33.439491+01');


--
-- Data for Name: anti_duplicates; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: page_configs; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: blocks; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: escrow_deposits; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: contests; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.contests (contest_id, user_id, slug, title, description, rules, cover_photo_url, additional_photos_urls, videos_urls, format, entry_fee, max_participants, registration_opens_at, registration_closes_at, finals_at, status, registration_mode, cash_prize, escrow_id, custom_fields, created_at) VALUES ('10000000-0000-0000-0000-0000000c0006', '10000000-0000-0000-0000-000000000004', 'concours-demo-talents-2026', 'Concours Démo — Talents 2026', 'Jeu-concours de démonstration avec frais d’inscription.', NULL, NULL, '{}', NULL, 'SUBMISSION', 1000.00, 100, '2026-07-04 17:23:33.439491+01', '2026-07-19 17:23:33.439491+01', '2026-07-24 17:23:33.439491+01', 'ACTIVE', 'AUTO', NULL, NULL, NULL, '2026-07-09 17:23:33.439491+01');


--
-- Data for Name: contest_participants; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.contest_participants (participant_id, contest_id, visitor_id, user_id, name, email, photos_urls, videos_urls, team, category, score, rank, status, entry_fee_transaction_id, custom_fields_data, created_at) VALUES ('de0ed837-cc76-4c3c-9675-87c09b85430a', '10000000-0000-0000-0000-0000000c0006', '10000000-0000-0000-0000-000000005007', NULL, 'Participant Démo', 'participant.demo@example.com', NULL, NULL, NULL, NULL, 0.00, NULL, 'REGISTERED', '10000000-0000-0000-0000-0000000f0006', NULL, '2026-07-09 17:23:33.439491+01');


--
-- Data for Name: bracket_matches; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: brand_settings; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.brand_settings (brand_id, campaign_id, primary_color, secondary_color, accent_color, logo_url, heading_font, body_font, favicon_url) VALUES ('dafe5195-9937-45df-a176-d6d09d65caa7', '6ff2af24-1736-4df4-88ff-b3f4f4715e5d', '#FF6A00', '#2B6BFF', '#1B7A3D', NULL, 'Inter', 'Inter', NULL);


--
-- Data for Name: canned_replies; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: cf_projects; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.cf_projects (project_id, user_id, slug, title, description, cover_photo_url, additional_photos_urls, videos_urls, goal_amount, raised_amount, backers_count, deadline, status, created_at) VALUES ('10000000-0000-0000-0000-0000000c0004', '10000000-0000-0000-0000-000000000002', 'projet-demo-application-mobile', 'Projet Démo — Application mobile locale', 'Projet de crowdfunding de démonstration.', NULL, '{}', NULL, 5000000.00, 75000.00, 1, '2026-08-23 17:23:33.439491+01', 'ACTIVE', '2026-07-09 17:23:33.439491+01');


--
-- Data for Name: cf_comments; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: tiers; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: cf_contributions; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.cf_contributions (contribution_id, project_id, tier_id, visitor_id, user_id, transaction_id, amount, contributor_name, email, country, chosen_options, message, status, short_id, created_at) VALUES ('2b0a8919-1030-4b7c-bc02-16ceb921af4a', '10000000-0000-0000-0000-0000000c0004', NULL, '10000000-0000-0000-0000-000000005005', NULL, '10000000-0000-0000-0000-0000000f0004', 75000.00, 'Contributeur Démo', 'contributeur.demo@example.com', 'Cameroun', NULL, NULL, 'CONFIRMED', 'C1F2P3R4', '2026-07-09 17:23:33.439491+01');


--
-- Data for Name: cf_questions; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: cf_team_members; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: cf_updates; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: closing_reports; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.closing_reports (report_id, poll_id, version, content_json, sha256_hash, pdf_url, public, generated_at, supervisor_id) VALUES ('1d377a00-cef5-47f4-bea7-bcb72dc5633b', '10000000-0000-0000-0000-0000000c0013', 1, '{"closed_at": "2026-06-15", "poll_title": "Élection du bureau associatif ADEC", "total_votes": 542}', 'a3f5c9e21b7d4f68091c2e5a7b3d9f1e4c6a8b2d5f7e9c1a3b5d7f9e1c3a5b7d', '/pv/election-bureau-associatif-adec-v1.pdf', true, '2026-06-15 18:34:07.395957+01', '10000000-0000-0000-0000-000000000001');
INSERT INTO public.closing_reports (report_id, poll_id, version, content_json, sha256_hash, pdf_url, public, generated_at, supervisor_id) VALUES ('34c70f97-61ec-4a15-b37d-1dfdcde0736b', '20000000-0000-0000-0000-0000000c0003', 1, '{"winner": "AgriSense", "summary": "Palmarès officiel — Prix de l''Innovation Étudiante 2025"}', 'a3f5c8e21b9d4f6072e1c4a8b5d9f3e7c2a6b4d8f1e5c9a3b7d2f6e0c4a8b5d9', 'https://example.com/demo/pv-innovation-2025.pdf', true, '2026-07-11 01:28:52.011504+01', '10000000-0000-0000-0000-000000000001');
INSERT INTO public.closing_reports (report_id, poll_id, version, content_json, sha256_hash, pdf_url, public, generated_at, supervisor_id) VALUES ('fa9852eb-c9c8-418e-a337-4a75ca817ea6', '20000000-0000-0000-0000-0000000c0003', 2, '{"closed_at": "2026-06-26T00:28:52.011Z", "organizer": "Réseau Universitaire Ouest-Africain", "candidates": [{"name": "AgriSense", "rank": 1, "score": 1284, "category": "Technologie & IA"}, {"name": "MediScan", "rank": 2, "score": 1109, "category": "Technologie & IA"}, {"name": "EcoRecycle", "rank": 3, "score": 1052, "category": "Impact Social"}, {"name": "SolarGrid", "rank": 4, "score": 845, "category": "Technologie & IA"}, {"name": "FemTech", "rank": 5, "score": 733, "category": "Impact Social"}, {"name": "CodeLocal", "rank": 6, "score": 612, "category": "Technologie & IA"}, {"name": "MicroCredit+", "rank": 7, "score": 567, "category": "Impact Social"}, {"name": "AquaPure", "rank": 8, "score": 498, "category": "Technologie & IA"}, {"name": "TransportEase", "rank": 9, "score": 401, "category": "Impact Social"}, {"name": "SafeStreet", "rank": 10, "score": 298, "category": "Impact Social"}], "poll_title": "Prix de l''Innovation Étudiante 2025"}', '7b0d85e1d2e34cf7728aa963ff29bbab8391ebf5562005b3e2858971a7c2fcf4', '/uploads/pv/prix-innovation-etudiante-2025-v2.pdf', true, '2026-07-11 13:25:41.809+01', '10000000-0000-0000-0000-000000000001');
INSERT INTO public.closing_reports (report_id, poll_id, version, content_json, sha256_hash, pdf_url, public, generated_at, supervisor_id) VALUES ('c14bfd7f-a1b6-4bce-a201-a2df3de676cb', '10000000-0000-0000-0000-0000000c0013', 2, '{"closed_at": "2026-06-15T17:18:15.636Z", "organizer": "Association ADEC", "candidates": [{"name": "Paul A.", "rank": 1, "score": 342, "category": "Bureau"}, {"name": "Chantal N.", "rank": 2, "score": 200, "category": "Bureau"}], "poll_title": "Élection du bureau associatif ADEC"}', 'd35545541409c63ae3cff5126d54e5a1ecfbef4e336edfcc2d2e779719d3dec8', '/uploads/pv/election-bureau-associatif-adec-v2.pdf', true, '2026-07-11 16:42:20.089+01', '10000000-0000-0000-0000-000000000001');


--
-- Data for Name: commission_configs; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.commission_configs (config_id, type, rate, floor_amount, active_from, modified_by) VALUES ('f8ac9cea-8a4d-4d09-bdc2-b2805969fa3a', 'VOTE', 0.1000, NULL, '2026-07-11 01:28:28.16852+01', '10000000-0000-0000-0000-000000000001');
INSERT INTO public.commission_configs (config_id, type, rate, floor_amount, active_from, modified_by) VALUES ('1f599460-8b6e-4c26-8bca-6eb1f49beaf7', 'TICKET', 0.1000, NULL, '2026-07-11 01:28:28.16852+01', '10000000-0000-0000-0000-000000000001');
INSERT INTO public.commission_configs (config_id, type, rate, floor_amount, active_from, modified_by) VALUES ('09a17e6a-57b2-4f5f-a813-9a4503b4d364', 'DONATION', 0.1000, NULL, '2026-07-11 01:28:28.16852+01', '10000000-0000-0000-0000-000000000001');
INSERT INTO public.commission_configs (config_id, type, rate, floor_amount, active_from, modified_by) VALUES ('b6d64906-a6bb-4ba6-b23f-2a64b56ad7d1', 'CF', 0.1000, NULL, '2026-07-11 01:28:28.16852+01', '10000000-0000-0000-0000-000000000001');
INSERT INTO public.commission_configs (config_id, type, rate, floor_amount, active_from, modified_by) VALUES ('9c2c2420-51f5-4a38-80de-4dbb5215ce69', 'CONTEST', 0.1000, NULL, '2026-07-11 01:28:28.16852+01', '10000000-0000-0000-0000-000000000001');
INSERT INTO public.commission_configs (config_id, type, rate, floor_amount, active_from, modified_by) VALUES ('63a46d08-4d7a-457f-b25e-503372cefd3e', 'LOTTERY', 0.1000, NULL, '2026-07-11 01:28:28.16852+01', '10000000-0000-0000-0000-000000000001');


--
-- Data for Name: country_configs; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.country_configs (country_code, country_name, active, currency, aggregator_ids, methods_available, updated_at) VALUES ('CM', 'Cameroun', true, 'XAF', '{}', '{MOBILE_MONEY,CARD}', '2026-07-08 23:54:21.812003+01');
INSERT INTO public.country_configs (country_code, country_name, active, currency, aggregator_ids, methods_available, updated_at) VALUES ('CI', 'Côte d''Ivoire', true, 'XOF', '{}', '{MOBILE_MONEY}', '2026-07-09 17:23:33.439491+01');
INSERT INTO public.country_configs (country_code, country_name, active, currency, aggregator_ids, methods_available, updated_at) VALUES ('SN', 'Sénégal', true, 'XOF', '{}', '{MOBILE_MONEY,CARD}', '2026-07-09 17:23:33.439491+01');


--
-- Data for Name: custom_domains; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: design_templates; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: fundraisers; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.fundraisers (fundraiser_id, user_id, slug, title, description, cover_photo_url, additional_photos_urls, videos_urls, goal_amount, collected_amount, donors_count, close_at, status, suggested_amounts, minimum_amount, show_donors, show_amounts, show_latest_donation, comments_enabled, created_at) VALUES ('10000000-0000-0000-0000-0000000c0003', '10000000-0000-0000-0000-000000000004', 'cagnotte-demo-urgence-medicale', 'Cagnotte Démo — Urgence médicale', 'Cagnotte de démonstration pour une urgence médicale.', NULL, '{}', NULL, 2000000.00, 50000.00, 1, NULL, 'ACTIVE', NULL, 0.00, true, true, true, true, '2026-07-09 17:23:33.439491+01');


--
-- Data for Name: donations; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.donations (donation_id, fundraiser_id, visitor_id, user_id, transaction_id, amount, donor_name, email, anonymous, support_message, receipt_channel, status, short_id, created_at) VALUES ('d5df757d-a49e-467e-a8e7-24c8746267fb', '10000000-0000-0000-0000-0000000c0003', '10000000-0000-0000-0000-000000005004', NULL, '10000000-0000-0000-0000-0000000f0003', 50000.00, 'Donateur Démo', NULL, false, NULL, NULL, 'CONFIRMED', 'D1O2N3A4', '2026-07-09 17:23:33.439491+01');


--
-- Data for Name: email_verification_tokens; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.email_verification_tokens (token, user_id, expires_at, used, created_at) VALUES ('c098990d47879679623f7d314a07f895cb625265b3469c6f5320f7a1dc3e714e', 'a366789f-7677-4bfa-a7a2-69e9efbf2146', '2026-07-10 16:45:52.397107+01', false, '2026-07-09 16:45:52.397107+01');
INSERT INTO public.email_verification_tokens (token, user_id, expires_at, used, created_at) VALUES ('2aa3fc299d79455072caabced459c1b7bf01355a748f5cfeefd9951a362b4b76', 'c295d4fb-fe4e-43f8-8b96-cd1c1c2fa6e5', '2026-07-10 21:10:09.050819+01', false, '2026-07-09 21:10:09.050819+01');


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.events (event_id, user_id, slug, title, description, cover_photo_url, additional_photos_urls, videos_urls, category, status, mode, start_at, end_at, timezone, visible_tabs, custom_fields, created_at) VALUES ('10000000-0000-0000-0000-0000000c0002', '10000000-0000-0000-0000-000000000003', 'concert-demo-douala-2026', 'Concert Démo — Douala Live 2026', 'Grande soirée concert de démonstration, avec billetterie Mobile Money.', NULL, '{}', NULL, 'Concert', 'PUBLISHED', 'TICKETING', '2026-07-29 17:23:33.439491+01', '2026-07-29 22:23:33.439491+01', 'Africa/Douala', '{}', NULL, '2026-07-09 17:23:33.439491+01');


--
-- Data for Name: promo_codes; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: ticket_types; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.ticket_types (ticket_type_id, event_id, name, category, price, total_stock, sold_count, reserved_count, perks, early_bird_ends_at, active) VALUES ('10000000-0000-0000-0000-00000000ee01', '10000000-0000-0000-0000-0000000c0002', 'Standard', 'STANDARD', 5000.00, 200, 1, 0, NULL, NULL, true);


--
-- Data for Name: ticket_purchases; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.ticket_purchases (purchase_id, event_id, ticket_type_id, visitor_id, user_id, transaction_id, status, qr_code_content, pdf_url, delivery_channel, buyer_name, buyer_email, buyer_phone, custom_fields_answers, promo_code_id, short_id, is_free_registration, created_at) VALUES ('d2dc2e2d-26ca-4b57-9561-fae69a8d6014', '10000000-0000-0000-0000-0000000c0002', '10000000-0000-0000-0000-00000000ee01', '10000000-0000-0000-0000-000000005003', NULL, '10000000-0000-0000-0000-0000000f0002', 'VALID', 'demo-qr-ticket-0001', NULL, 'WHATSAPP', 'Client Démo', 'client.demo@example.com', NULL, NULL, NULL, 'T1K2E3T4', false, '2026-07-09 17:23:33.439491+01');


--
-- Data for Name: entry_scans; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: event_galleries; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: event_listings; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('0256661c-73ec-4033-9bdc-38db241d1bb9', 'POLL', 'Meilleur artiste urbain de l''année', 'meilleur-artiste-urbain-annee', 'La communauté choisit l''artiste urbain qui a le plus marqué l''année en Côte d''Ivoire.', '/miss-universe.jpg', 'Côte d''Ivoire', 'ONGOING', false, true, false, 'Ivoire Music Awards', NULL, 8930, '2026-06-28 00:31:48.48383+01', '2026-07-14 00:31:48.48383+01', '2026-06-25 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('eea047fc-d76b-4d70-b0c4-0d7d686e005d', 'POLL', 'Concours du meilleur créateur de contenu', 'concours-meilleur-createur-contenu', 'Nomination et vote du public pour récompenser les créateurs de contenu sénégalais les plus impactants.', '/vote-icon-laptop.jpg', 'Sénégal', 'UPCOMING', false, false, false, 'Dakar Digital Awards', NULL, 0, '2026-07-16 00:31:48.48383+01', '2026-07-30 00:31:48.48383+01', '2026-07-08 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('11f83f63-3360-4374-9f83-2ddee57a4337', 'POLL', 'Élection du bureau associatif ADEC', 'election-bureau-associatif-adec', 'Scrutin annuel pour élire le nouveau bureau de l''association ADEC.', '/vote-icon-button.jpg', 'Cameroun', 'ENDED', false, false, false, 'Association ADEC', NULL, 542, '2026-05-31 00:31:48.48383+01', '2026-06-15 00:31:48.48383+01', '2026-05-26 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('34b34f6f-6186-425d-8ee7-2e1a334a8ee6', 'POLL', 'Prix du meilleur enseignant 2026', 'prix-meilleur-enseignant-2026', 'Les élèves et parents votent pour désigner l''enseignant de l''année au Gabon.', '/election-vote.jpg', 'Gabon', 'ONGOING', false, false, false, 'Ministère de l''Éducation', NULL, 2310, '2026-07-07 00:31:48.48383+01', '2026-07-18 00:31:48.48383+01', '2026-06-30 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('75583a2b-acef-42e1-b256-fa90fefed26c', 'POLL', 'Miss Élégance Abidjan', 'miss-elegance-abidjan', 'Le grand concours annuel de beauté et d''élégance de la ville d''Abidjan revient pour une nouvelle édition.', '/miss-mister-pageant.jpg', 'Côte d''Ivoire', 'UPCOMING', true, false, false, 'Abidjan Events', NULL, 0, '2026-07-25 00:31:48.48383+01', '2026-08-09 00:31:48.48383+01', '2026-07-09 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('5591fe1b-29e9-46fe-b968-ebbdf5219492', 'EVENT', 'Festival Amani Live', 'festival-amani-live', 'Trois jours de concerts en plein air avec les plus grands artistes de la région, billetterie en ligne avec QR code.', '/concert-stadium.jpg', 'Cameroun', 'ONGOING', true, false, true, 'Amani Productions', NULL, 0, '2026-07-09 00:31:48.48383+01', '2026-07-12 00:31:48.48383+01', '2026-06-10 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('8e0200a3-a017-4840-a29b-3f52d0408c93', 'EVENT', 'Nuit du Jazz de Dakar', 'nuit-du-jazz-dakar', 'Une soirée intimiste dédiée au jazz avec des musiciens sénégalais et internationaux.', '/concert-jazz.jpg', 'Sénégal', 'UPCOMING', false, true, false, 'Dakar Jazz Club', NULL, 0, '2026-07-22 00:31:48.48383+01', '2026-07-22 00:31:48.48383+01', '2026-07-05 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('cd634d08-4007-40fa-b680-ffc86d7fab7d', 'EVENT', 'Conférence Tech Afrique 2026', 'conference-tech-afrique-2026', 'Rassemblement des acteurs de la tech ouest-africaine : conférences, ateliers et networking.', '/event-venue.jpg', 'Côte d''Ivoire', 'UPCOMING', false, false, false, 'Tech Afrique Hub', NULL, 0, '2026-08-04 00:31:48.48383+01', '2026-08-06 00:31:48.48383+01', '2026-07-02 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('0697019a-ebc7-4205-a5ab-ff07990eff9d', 'EVENT', 'Concert Plein Air Douala', 'concert-plein-air-douala', 'Concert gratuit en plein air au cœur de Douala, diffusion en direct pour les absents.', '/concert-outdoor.jpg', 'Cameroun', 'ONGOING', false, false, true, 'Ville de Douala', NULL, 0, '2026-07-09 22:31:48.48383+01', '2026-07-10 03:31:48.48383+01', '2026-06-30 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('12518abd-5ee6-4095-9a2c-14a19e13b28d', 'EVENT', 'Soirée Gala Solidarité', 'soiree-gala-solidarite', 'Dîner de gala au profit des œuvres sociales, avec spectacle et enchères caritatives.', '/gala-performance.jpg', 'Sénégal', 'ENDED', false, false, false, 'Fondation Teranga', NULL, 0, '2026-06-05 00:31:48.48383+01', '2026-06-05 00:31:48.48383+01', '2026-05-21 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('d877daf2-99d1-47ee-bbed-f1d91097bbc0', 'EVENT', 'Chorale Nationale — Concert de Noël', 'chorale-nationale-concert-noel', 'Concert de fin d''année de la chorale nationale, ouvert à tous.', '/choir-performance.jpg', 'Gabon', 'UPCOMING', false, false, false, 'Chorale Nationale du Gabon', NULL, 0, '2026-07-30 00:31:48.48383+01', '2026-07-30 00:31:48.48383+01', '2026-07-07 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('74329112-3208-4ad0-b735-f1f7f1b6020a', 'EVENT', 'Grand Concert Urbain d''Abidjan', 'grand-concert-urbain-abidjan', 'Le rendez-vous incontournable de la scène urbaine ivoirienne, têtes d''affiche à confirmer.', '/concert-singer.jpg', 'Côte d''Ivoire', 'ONGOING', false, true, false, 'Urban Prod CI', NULL, 0, '2026-07-06 00:31:48.48383+01', '2026-07-16 00:31:48.48383+01', '2026-06-22 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('7a043cfa-f4ec-4c6e-8aa9-8aad3b773912', 'FUNDRAISER', 'Cagnotte pour l''hôpital pédiatrique', 'cagnotte-hopital-pediatrique', 'Aidez-nous à financer du matériel médical pour le service pédiatrique de l''hôpital central.', '/donation-coins.jpg', 'Cameroun', 'ONGOING', true, false, false, 'Fondation Espoir Santé', NULL, 0, '2026-06-30 00:31:48.48383+01', '2026-07-30 00:31:48.48383+01', '2026-06-28 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('3c8fa5c3-6b08-4bfc-b3ab-e966fd6e298a', 'FUNDRAISER', 'Soutien aux familles sinistrées', 'soutien-familles-sinistrees', 'Collecte d''urgence pour venir en aide aux familles touchées par les récentes inondations.', '/community-hands.jpg', 'Côte d''Ivoire', 'ONGOING', false, false, true, 'Croix-Rouge Côte d''Ivoire', NULL, 0, '2026-07-09 00:31:48.48383+01', '2026-07-19 00:31:48.48383+01', '2026-07-07 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('109425d2-acf5-451d-b37b-51318285f26b', 'FUNDRAISER', 'Ensemble pour l''éducation des filles', 'ensemble-education-filles', 'Financement de bourses scolaires pour les jeunes filles issues de familles vulnérables.', '/community-heart.jpg', 'Sénégal', 'UPCOMING', false, false, false, 'Association Sen''Avenir', NULL, 0, '2026-07-15 00:31:48.48383+01', '2026-08-14 00:31:48.48383+01', '2026-07-09 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('528b4fae-b25e-4993-b525-d4f00f309dbd', 'FUNDRAISER', 'Réseau Solidarité Afrique', 'reseau-solidarite-afrique', 'Campagne de collecte panafricaine pour soutenir les initiatives locales de développement.', '/africa-network.jpg', 'Bénin', 'ENDED', false, false, false, 'Réseau Solidarité Afrique', NULL, 0, '2026-05-11 00:31:48.48383+01', '2026-06-10 00:31:48.48383+01', '2026-05-06 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('9cfb656d-66e9-4cc5-a713-b2d62f7f7caa', 'CF_PROJECT', 'Financement studio d''enregistrement communautaire', 'financement-studio-enregistrement', 'Un studio ouvert aux jeunes artistes du quartier, pour enregistrer et se former gratuitement.', '/events-collage-tech.jpg', 'Cameroun', 'ONGOING', false, true, false, 'Collectif Beat Makers', NULL, 0, '2026-07-02 00:31:48.48383+01', '2026-08-01 00:31:48.48383+01', '2026-06-30 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('6fea86d5-7770-479b-97d0-dc4cdea3a723', 'CF_PROJECT', 'Lancement d''une application locale de covoiturage', 'lancement-application-covoiturage', 'Aidez à financer le développement d''une application de covoiturage adaptée aux villes ivoiriennes.', '/events-collage-light.jpg', 'Côte d''Ivoire', 'UPCOMING', false, false, false, 'MoveTogether CI', NULL, 0, '2026-07-20 00:31:48.48383+01', '2026-08-19 00:31:48.48383+01', '2026-07-06 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('1ada7b6d-7594-48fa-822b-e7d02203a1e3', 'CF_PROJECT', 'Atelier de couture pour femmes entrepreneures', 'atelier-couture-femmes-entrepreneures', 'Financement de machines à coudre et de formations pour un collectif de femmes entrepreneures.', '/community-hands.jpg', 'Sénégal', 'ONGOING', false, false, false, 'Collectif Elles Cousent', NULL, 0, '2026-07-04 00:31:48.48383+01', '2026-07-25 00:31:48.48383+01', '2026-07-01 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('8918592f-8326-4182-8940-669adeb0f04d', 'CF_PROJECT', 'Bibliothèque mobile pour zones rurales', 'bibliotheque-mobile-zones-rurales', 'Un bus aménagé en bibliothèque itinérante pour desservir les villages sans accès aux livres.', '/africa-network.jpg', 'Mali', 'UPCOMING', false, false, false, 'Lire Ensemble Mali', NULL, 0, '2026-07-28 00:31:48.48383+01', '2026-08-27 00:31:48.48383+01', '2026-07-08 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('970fd4b9-a944-4ecb-be36-ff9e5f62fadc', 'LOTTERY', 'Grande Tombola de Fin d''Année', 'grande-tombola-fin-annee', 'Tentez de gagner une voiture, des smartphones et de nombreux autres lots. Tirage certifié et public.', '/contest-trophy.jpg', 'Cameroun', 'ONGOING', true, false, true, 'Moledi Events', NULL, 0, '2026-06-25 00:31:48.48383+01', '2026-07-15 00:31:48.48383+01', '2026-06-20 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('b695f5e1-e642-4c2f-95b9-f326656bb41a', 'LOTTERY', 'Tombola Caritative Croix-Rouge', 'tombola-caritative-croix-rouge', 'Chaque ticket acheté finance directement les actions humanitaires locales.', '/award-winner.jpg', 'Côte d''Ivoire', 'UPCOMING', false, false, false, 'Croix-Rouge Côte d''Ivoire', NULL, 0, '2026-07-17 00:31:48.48383+01', '2026-07-31 00:31:48.48383+01', '2026-07-07 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('72aea617-0cee-4db2-b640-c6b013fbac54', 'LOTTERY', 'Tirage au Sort Spécial Ramadan', 'tirage-sort-special-ramadan', 'Une tombola solidaire organisée pendant la période du Ramadan, lots distribués aux familles nécessiteuses.', '/dance-contest.jpg', 'Sénégal', 'ENDED', false, false, false, 'Association Nour', NULL, 0, '2026-04-11 00:31:48.48383+01', '2026-04-26 00:31:48.48383+01', '2026-04-06 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('22586f74-c24e-4ba3-a3ac-620a2380ce82', 'CONTEST', 'Concours de Danse Urbaine', 'concours-danse-urbaine', 'Battles de danse urbaine entre les meilleurs crews de la sous-région, qualifications puis finale live.', '/dance-contest.jpg', 'Côte d''Ivoire', 'ONGOING', false, true, true, 'Urban Dance CI', NULL, 0, '2026-07-07 00:31:48.48383+01', '2026-07-17 00:31:48.48383+01', '2026-06-26 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('6d109111-e59a-4404-94d7-285c1097894e', 'CONTEST', 'Jeu-Concours Culture Générale', 'jeu-concours-culture-generale', 'Répondez aux quiz hebdomadaires et tentez de remporter le grand prix final.', '/contest-trophy.jpg', 'Cameroun', 'UPCOMING', false, false, false, 'QuizMasters CM', NULL, 0, '2026-07-14 00:31:48.48383+01', '2026-08-13 00:31:48.48383+01', '2026-07-09 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('2ac53210-4059-4c11-8ac1-4b50aecfeb1d', 'CONTEST', 'Trophée du Meilleur Jeune Entrepreneur', 'trophee-meilleur-jeune-entrepreneur', 'Un concours qui récompense les projets entrepreneuriaux les plus prometteurs portés par des jeunes.', '/awards-gala.jpg', 'Gabon', 'ONGOING', false, false, false, 'Gabon Startup Club', NULL, 0, '2026-07-01 00:31:48.48383+01', '2026-07-21 00:31:48.48383+01', '2026-06-24 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('dff19d25-3ed8-47a4-ad6f-9f4854efea36', 'CONTEST', 'Grand Prix Photographie Afrique', 'grand-prix-photographie-afrique', 'Un concours photo panafricain sur le thème "Racines et Modernité", exposition des œuvres finalistes.', '/award-winner.jpg', 'Sénégal', 'SUSPENDED', false, false, false, 'African Lens Collective', NULL, 0, '2026-06-20 00:31:48.48383+01', NULL, '2026-06-15 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('71d7d14a-5cef-4575-902e-e85bd3344022', 'SPONSOR_CALL', 'Recherche sponsors — Festival des Arts', 'recherche-sponsors-festival-arts', 'Le Festival des Arts recherche des partenaires pour sa prochaine édition : visibilité garantie auprès de milliers de participants.', '/event-venue.jpg', 'Cameroun', 'UPCOMING', false, false, false, 'Festival des Arts du Cameroun', NULL, 0, '2026-08-09 00:31:48.48383+01', '2026-08-12 00:31:48.48383+01', '2026-07-05 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('bfd9e21a-4b6e-4c16-9b46-423d7f9fafc4', 'SPONSOR_CALL', 'Appel à partenaires — Salon Tech Dakar', 'appel-partenaires-salon-tech-dakar', 'Le plus grand salon tech du Sénégal ouvre son appel à sponsors pour l''édition 2026.', '/africa-network.jpg', 'Sénégal', 'ONGOING', false, true, false, 'Dakar Digital Hub', NULL, 0, '2026-07-05 00:31:48.48383+01', '2026-08-04 00:31:48.48383+01', '2026-07-03 00:31:48.48383+01');
INSERT INTO public.event_listings (listing_id, campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, organizer_logo_url, votes_count, starts_at, ends_at, created_at) VALUES ('4b5aa174-1539-4e56-aa11-b053b6f3a225', 'POLL', 'Élection Miss Cameroun 2026', 'scrutin-demo-talents-2026', 'Votez pour la candidate qui représentera le Cameroun sur la scène internationale. Vote gratuit et vote premium disponibles.', '/miss-crown.jpg', 'Cameroun', 'ONGOING', true, false, true, 'Comité Miss Cameroun', NULL, 15420, '2026-07-05 00:31:48.48383+01', '2026-07-20 00:31:48.48383+01', '2026-06-20 00:31:48.48383+01');


--
-- Data for Name: support_tickets; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.support_tickets (ticket_id, number, visitor_id, user_id, campaign_id, subject, description, status, priority, assigned_to, created_at, updated_at) VALUES ('387c196b-3f4b-475f-990a-0b23614dda41', 'TK-MRGLF0G2', NULL, '10000000-0000-0000-0000-000000000002', NULL, 'VOTE', 'Mon vote na pas ete comptabilise alors que le paiement a bien ete debite de mon compte.', 'OPEN', 'NORMAL', NULL, '2026-07-11 17:42:44.356454+01', '2026-07-11 17:42:44.356454+01');
INSERT INTO public.support_tickets (ticket_id, number, visitor_id, user_id, campaign_id, subject, description, status, priority, assigned_to, created_at, updated_at) VALUES ('39ce6141-0080-48fc-96b1-62481075e224', 'TK-MRGLF9RD', NULL, '10000000-0000-0000-0000-000000000002', NULL, 'VOTE', 'Mon vote n''a pas été comptabilisé alors que le paiement a bien été débité de mon compte.', 'OPEN', 'NORMAL', NULL, '2026-07-11 17:42:56.426672+01', '2026-07-11 17:42:56.426672+01');
INSERT INTO public.support_tickets (ticket_id, number, visitor_id, user_id, campaign_id, subject, description, status, priority, assigned_to, created_at, updated_at) VALUES ('56f70fbc-51d1-4962-904c-4650d2cc2add', 'TK-MRGXUPM4', NULL, '00000000-0000-0000-0000-000000000001', NULL, 'FRAUD', 'Hhhhhhhjnggvvvbbbb ccccccxcvbbn', 'OPEN', 'NORMAL', NULL, '2026-07-11 23:30:52.208159+01', '2026-07-11 23:30:52.208159+01');


--
-- Data for Name: event_reports; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: event_resources; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: event_sponsors; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: event_venues; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.event_venues (venue_id, event_id, hall_name, address, city, country, google_maps_url, floor_plan_url, access_info) VALUES ('8ec3c689-b46c-4796-b894-901f5e14425c', '10000000-0000-0000-0000-0000000c0002', 'Palais des Congrès', 'Boulevard de la Liberté', 'Douala', 'Cameroun', NULL, NULL, NULL);


--
-- Data for Name: failover_logs; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: feature_flags; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.feature_flags (flag_id, name, description, active, modified_by, updated_at) VALUES ('fa76f8de-2500-43e0-b0c3-d4b54495e5c5', 'enable_crowdfunding', 'Active le module crowdfunding (V2)', false, '00000000-0000-0000-0000-000000000002', '2026-07-08 23:54:21.812003+01');
INSERT INTO public.feature_flags (flag_id, name, description, active, modified_by, updated_at) VALUES ('0772b5a7-0866-4ab5-8aa6-826b67d7b149', 'enable_ai_generation', 'Active la génération de page par IA (V4 bêta)', false, '00000000-0000-0000-0000-000000000002', '2026-07-08 23:54:21.812003+01');
INSERT INTO public.feature_flags (flag_id, name, description, active, modified_by, updated_at) VALUES ('6828737b-a0fc-426b-9266-2013da32563b', 'maintenance_mode', 'Bascule le mode maintenance global', false, '00000000-0000-0000-0000-000000000002', '2026-07-08 23:54:21.812003+01');


--
-- Data for Name: fundraiser_comments; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: fundraiser_updates; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: gdpr_consents; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.gdpr_consents (consent_id, visitor_id, accepted, "timestamp", policy_version, ip_hashed) VALUES ('02021005-83fb-4647-b7bb-7eaafaa145bd', 'e9fa42bb-6456-4375-971d-d1ba43db41ab', true, '2026-07-09 17:34:38.506597+01', '2026-07-09', '7b00e4898681887f3ec94f4e9e75f01c25a5e5baed5db8b98ba7c0c5b5385da7');
INSERT INTO public.gdpr_consents (consent_id, visitor_id, accepted, "timestamp", policy_version, ip_hashed) VALUES ('36139727-cee9-4b5c-97bd-3161ec4cb72b', '02d8d589-71ba-46e3-836d-31fa6acbcef5', true, '2026-07-09 21:42:55.081254+01', '2026-07-09', '7b00e4898681887f3ec94f4e9e75f01c25a5e5baed5db8b98ba7c0c5b5385da7');
INSERT INTO public.gdpr_consents (consent_id, visitor_id, accepted, "timestamp", policy_version, ip_hashed) VALUES ('50175eef-d3ee-4e45-9fb7-2fa0df59e245', '43518029-b22a-42f2-9658-b1261b584178', true, '2026-07-10 16:55:24.572619+01', '2026-07-09', '7b00e4898681887f3ec94f4e9e75f01c25a5e5baed5db8b98ba7c0c5b5385da7');


--
-- Data for Name: global_faqs; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.global_faqs (faq_id, type, question, answer, "position", active) VALUES ('10000000-0000-0000-0000-0000000c0001', 'HOW_IT_WORKS', 'Ai-je besoin d''un compte pour voter, donner ou acheter un billet ?', 'Non. En tant que visiteur, vous pouvez voter, faire un don ou acheter un billet directement, sans créer de compte. Un identifiant de session (Visitor ID) suffit.', 1, true);
INSERT INTO public.global_faqs (faq_id, type, question, answer, "position", active) VALUES ('10000000-0000-0000-0000-0000000c0002', 'HOW_IT_WORKS', 'Qui doit créer un compte ?', 'Seuls les organisateurs (créateurs de scrutins, événements, cagnottes...) ont besoin d''un compte pour gérer leurs campagnes et leurs finances.', 2, true);
INSERT INTO public.global_faqs (faq_id, type, question, answer, "position", active) VALUES ('10000000-0000-0000-0000-0000000c0003', 'HOW_IT_WORKS', 'Combien de temps faut-il pour recevoir mes fonds ?', 'C''est instantané. Dès qu''un paiement Mobile Money ou carte est confirmé par l''opérateur, le montant (net de la commission) est immédiatement disponible dans votre solde organisateur, visible en temps réel depuis votre tableau de bord. Vous pouvez ensuite demander un retrait vers votre numéro Mobile Money à tout moment.', 3, true);
INSERT INTO public.global_faqs (faq_id, type, question, answer, "position", active) VALUES ('10000000-0000-0000-0000-0000000c0004', 'HOW_IT_WORKS', 'Quels moyens de paiement sont acceptés ?', 'Le Mobile Money (Orange Money, MTN Mobile Money...) selon les opérateurs actifs dans votre pays, ainsi que le paiement par carte bancaire là où il est disponible. La liste exacte des moyens de paiement par pays est visible sur la page Tarifs.', 4, true);
INSERT INTO public.global_faqs (faq_id, type, question, answer, "position", active) VALUES ('10000000-0000-0000-0000-0000000c0005', 'HOW_IT_WORKS', 'Dans quels pays Moledi Event est-il disponible ?', 'La couverture s''étend progressivement à travers l''Afrique francophone et anglophone. La liste des pays actifs, avec leurs moyens de paiement respectifs, est visible en temps réel sur la page d''accueil et sur la page Tarifs.', 5, true);
INSERT INTO public.global_faqs (faq_id, type, question, answer, "position", active) VALUES ('10000000-0000-0000-0000-0000000c0006', 'HOW_IT_WORKS', 'Le site est-il disponible en anglais ?', 'Oui. Un sélecteur de langue FR/EN est disponible en permanence dans l''en-tête du site, sur toutes les pages. Votre préférence est mémorisée et vous suit durant toute votre navigation.', 6, true);
INSERT INTO public.global_faqs (faq_id, type, question, answer, "position", active) VALUES ('10000000-0000-0000-0000-0000000c0007', 'HOW_IT_WORKS', 'Mes données personnelles sont-elles en sécurité ?', 'Oui. Vos mots de passe sont hachés (jamais stockés en clair), vos données de paiement ne transitent jamais par nos serveurs (traitées directement par l''agrégateur de paiement), et le détail complet du traitement de vos données est disponible dans notre politique de confidentialité.', 7, true);
INSERT INTO public.global_faqs (faq_id, type, question, answer, "position", active) VALUES ('10000000-0000-0000-0000-0000000c0008', 'HOW_IT_WORKS', 'Puis-je annuler une campagne après sa création ?', 'Oui, depuis votre tableau de bord. Selon le type de campagne et si des paiements ont déjà été reçus, une politique de remboursement peut alors s''appliquer — elle est toujours affichée clairement sur la page de la campagne avant tout paiement.', 8, true);
INSERT INTO public.global_faqs (faq_id, type, question, answer, "position", active) VALUES ('10000000-0000-0000-0000-0000000c0009', 'HOW_IT_WORKS', 'Comment contacter le support en cas de problème ?', 'Via le bouton WhatsApp flottant présent sur toutes les pages, via la page Contact, ou en ouvrant un ticket depuis votre tableau de bord organisateur une fois connecté.', 9, true);
INSERT INTO public.global_faqs (faq_id, type, question, answer, "position", active) VALUES ('10000000-0000-0000-0000-0000000c0010', 'POLL_TEMPLATE', 'Comment sont vérifiés les votes en double ?', 'Selon la méthode choisie à la création du scrutin : Visitor ID, email, numéro de téléphone, code SMS ou WhatsApp.', 1, true);
INSERT INTO public.global_faqs (faq_id, type, question, answer, "position", active) VALUES ('10000000-0000-0000-0000-0000000c0011', 'POLL_TEMPLATE', 'Le procès-verbal de clôture est-il fiable ?', 'Oui, il inclut un hash SHA-256 permettant de vérifier son intégrité, et il est signé par un superviseur.', 2, true);
INSERT INTO public.global_faqs (faq_id, type, question, answer, "position", active) VALUES ('10000000-0000-0000-0000-0000000c0012', 'EVENT_TEMPLATE', 'Comment mes participants reçoivent-ils leur billet ?', 'Immédiatement après paiement, par email et/ou WhatsApp selon le canal choisi, avec un QR code unique. Ce billet ne peut être scanné qu''une seule fois à l''entrée.', 1, true);
INSERT INTO public.global_faqs (faq_id, type, question, answer, "position", active) VALUES ('10000000-0000-0000-0000-0000000c0013', 'EVENT_TEMPLATE', 'Que se passe-t-il si mon événement est annulé ?', 'Vous pouvez déclencher le remboursement de tous les billets déjà vendus depuis votre tableau de bord, selon la politique de remboursement définie à la création de l''événement.', 2, true);
INSERT INTO public.global_faqs (faq_id, type, question, answer, "position", active) VALUES ('10000000-0000-0000-0000-0000000c0014', 'DONATION_TEMPLATE', 'Les donateurs peuvent-ils rester anonymes ?', 'Oui, une option "don anonyme" est disponible à la contribution : le nom du donateur n''est alors visible ni sur la page publique, ni dans les exports.', 1, true);
INSERT INTO public.global_faqs (faq_id, type, question, answer, "position", active) VALUES ('10000000-0000-0000-0000-0000000c0015', 'DONATION_TEMPLATE', 'Un reçu est-il délivré pour chaque don ?', 'Oui, un reçu numérique est généré automatiquement et envoyé au donateur dès confirmation du paiement.', 2, true);
INSERT INTO public.global_faqs (faq_id, type, question, answer, "position", active) VALUES ('10000000-0000-0000-0000-0000000c0016', 'CF_TEMPLATE', 'Que se passe-t-il si mon objectif de financement n''est pas atteint ?', 'Selon la politique choisie à la création du projet : soit vous conservez les fonds déjà collectés (financement flexible), soit les contributeurs sont automatiquement remboursés si le seuil promis n''est pas atteint (tout ou rien).', 1, true);
INSERT INTO public.global_faqs (faq_id, type, question, answer, "position", active) VALUES ('10000000-0000-0000-0000-0000000c0017', 'CF_TEMPLATE', 'Puis-je proposer des contreparties à mes contributeurs ?', 'Oui, vous pouvez définir plusieurs paliers de contribution, chacun avec sa propre contrepartie (accès anticipé, produit, remerciement personnalisé...).', 2, true);
INSERT INTO public.global_faqs (faq_id, type, question, answer, "position", active) VALUES ('10000000-0000-0000-0000-0000000c0018', 'CONTEST_TEMPLATE', 'Comment le tirage au sort est-il certifié ?', 'L''algorithme de tirage est vérifiable et un procès-verbal est généré automatiquement à la désignation du ou des gagnants — personne, pas même l''organisateur, ne peut influencer le résultat après la clôture des inscriptions.', 1, true);
INSERT INTO public.global_faqs (faq_id, type, question, answer, "position", active) VALUES ('10000000-0000-0000-0000-0000000c0019', 'CONTEST_TEMPLATE', 'Puis-je limiter le nombre de participations par personne ?', 'Oui, la limite se configure à la création du jeu-concours ou de la tombola, avec la même méthode anti-doublon que pour les scrutins.', 2, true);


--
-- Data for Name: ia_credit_packs; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: ia_credits; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: ia_generations; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: influencers; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: tokens; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: jury_sessions; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: jury_scores; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: kpi_snapshots; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: language_configs; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: legal_pages; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: login_logs; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.login_logs (log_id, user_id, ip, browser, success, failed_attempts, blocked_until, created_at, device_name) VALUES ('9c077f86-d15b-4297-b41e-fbd309100261', '10000000-0000-0000-0000-000000000002', '::1', 'curl/8.21.0', true, 0, NULL, '2026-07-11 16:31:35.762313+01', 'Appareil inconnu');
INSERT INTO public.login_logs (log_id, user_id, ip, browser, success, failed_attempts, blocked_until, created_at, device_name) VALUES ('eccb8851-24c5-4c07-b93c-a2f422ffc443', '10000000-0000-0000-0000-000000000002', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Claude/1.20186.1 Chrome/148.0.7778.271 Electron/42.5.1 Safari/537.36 MSIX', true, 0, NULL, '2026-07-11 16:48:57.313239+01', 'Chrome sur Windows');
INSERT INTO public.login_logs (log_id, user_id, ip, browser, success, failed_attempts, blocked_until, created_at, device_name) VALUES ('8fbbdf4b-e45b-448f-998a-99659515d0da', '10000000-0000-0000-0000-000000000002', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', true, 0, NULL, '2026-07-11 18:01:49.56573+01', 'Edge sur Windows');
INSERT INTO public.login_logs (log_id, user_id, ip, browser, success, failed_attempts, blocked_until, created_at, device_name) VALUES ('b79bb65c-8a67-4f67-85a3-2057ed1d3b0b', '00000000-0000-0000-0000-000000000001', '38.109.228.74', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1', true, 0, NULL, '2026-07-11 23:10:35.03083+01', 'Safari sur iPhone');
INSERT INTO public.login_logs (log_id, user_id, ip, browser, success, failed_attempts, blocked_until, created_at, device_name) VALUES ('fdc768c1-57de-4214-8618-988b23a78984', '00000000-0000-0000-0000-000000000001', '38.109.228.74', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1', true, 0, NULL, '2026-07-11 23:15:36.486622+01', 'Safari sur iPhone');
INSERT INTO public.login_logs (log_id, user_id, ip, browser, success, failed_attempts, blocked_until, created_at, device_name) VALUES ('95e39293-f54b-4a20-9ff7-ff54818d179e', '10000000-0000-0000-0000-000000000002', '::1', 'curl/8.21.0', true, 0, NULL, '2026-07-12 00:48:57.38146+01', 'Appareil inconnu');
INSERT INTO public.login_logs (log_id, user_id, ip, browser, success, failed_attempts, blocked_until, created_at, device_name) VALUES ('fe6277c1-fcbd-4ca5-86db-d03ec5f775ab', '10000000-0000-0000-0000-000000000002', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Claude/1.20186.1 Chrome/148.0.7778.271 Electron/42.5.1 Safari/537.36 MSIX', true, 0, NULL, '2026-07-12 00:54:10.121148+01', 'Chrome sur Windows');
INSERT INTO public.login_logs (log_id, user_id, ip, browser, success, failed_attempts, blocked_until, created_at, device_name) VALUES ('74b69229-f67a-460c-8eca-b028854c12ce', '10000000-0000-0000-0000-000000000002', '::1', 'curl/8.21.0', true, 0, NULL, '2026-07-12 12:53:08.192568+01', 'Appareil inconnu');
INSERT INTO public.login_logs (log_id, user_id, ip, browser, success, failed_attempts, blocked_until, created_at, device_name) VALUES ('5d93243d-c1db-4c36-8259-69fc11267760', '10000000-0000-0000-0000-000000000002', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Claude/1.20186.1 Chrome/148.0.7778.271 Electron/42.5.1 Safari/537.36 MSIX', true, 0, NULL, '2026-07-12 12:53:28.395048+01', 'Chrome sur Windows');
INSERT INTO public.login_logs (log_id, user_id, ip, browser, success, failed_attempts, blocked_until, created_at, device_name) VALUES ('0c39208d-1741-4be5-b1ac-dd06d170c42d', '10000000-0000-0000-0000-000000000002', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', true, 0, NULL, '2026-07-12 12:55:15.834336+01', 'Edge sur Windows');
INSERT INTO public.login_logs (log_id, user_id, ip, browser, success, failed_attempts, blocked_until, created_at, device_name) VALUES ('174c4d90-a888-43e6-8112-b4cbf591c0ea', '00000000-0000-0000-0000-000000000001', '38.109.228.74', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1', true, 0, NULL, '2026-07-12 13:31:07.244471+01', 'Safari sur iPhone');
INSERT INTO public.login_logs (log_id, user_id, ip, browser, success, failed_attempts, blocked_until, created_at, device_name) VALUES ('64255a35-82e4-4ed2-b9ba-48df098df9c8', '10000000-0000-0000-0000-000000000002', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Claude/1.20186.1 Chrome/148.0.7778.271 Electron/42.5.1 Safari/537.36 MSIX', true, 0, NULL, '2026-07-12 15:07:33.727114+01', 'Chrome sur Windows');


--
-- Data for Name: lotteries; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.lotteries (lottery_id, user_id, event_id, slug, title, description, cover_photo_url, additional_photos_urls, videos_urls, ticket_price, max_tickets, tickets_sold, draw_at, draw_mode, status, draw_completed, created_at) VALUES ('10000000-0000-0000-0000-0000000c0007', '10000000-0000-0000-0000-000000000002', NULL, 'tombola-demo-2026', 'Tombola Démo 2026', 'Tombola de démonstration, tirage automatique.', NULL, '{}', NULL, 2000.00, 500, 1, '2026-08-03 17:23:33.439491+01', 'AUTO', 'ACTIVE', false, '2026-07-09 17:23:33.439491+01');


--
-- Data for Name: lottery_draws; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: lottery_tickets; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.lottery_tickets (ticket_id, lottery_id, unique_number, buyer_name, buyer_email, buyer_phone, visitor_id, transaction_id, status, created_at) VALUES ('e98b46b5-04da-4bdf-ab0e-6269bd726614', '10000000-0000-0000-0000-0000000c0007', 'TOMB-000001', 'Joueur Démo', 'joueur.demo@example.com', '+237690000001', '10000000-0000-0000-0000-000000005008', '10000000-0000-0000-0000-0000000f0007', 'PENDING_DRAW', '2026-07-09 17:23:33.439491+01');


--
-- Data for Name: maintenance_modes; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: mass_email_campaigns; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: mass_whatsapp_campaigns; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: merch_items; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: merch_purchases; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: minimum_payout_configs; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: notification_logs; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: organizer_balances; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.organizer_balances (balance_id, user_id, available_amount, reserved_amount, updated_at) VALUES ('5d5b8f32-6173-489b-be3a-695409573286', '00000000-0000-0000-0000-000000000001', 0.00, 0.00, '2026-07-08 23:54:21.812003+01');
INSERT INTO public.organizer_balances (balance_id, user_id, available_amount, reserved_amount, updated_at) VALUES ('8df28638-0312-4e6e-8c29-8d47761738fe', '10000000-0000-0000-0000-000000000002', 0.00, 0.00, '2026-07-09 17:23:33.439491+01');
INSERT INTO public.organizer_balances (balance_id, user_id, available_amount, reserved_amount, updated_at) VALUES ('0e176412-49ef-4a41-a142-f15bfb96aae6', '10000000-0000-0000-0000-000000000003', 0.00, 0.00, '2026-07-09 17:23:33.439491+01');
INSERT INTO public.organizer_balances (balance_id, user_id, available_amount, reserved_amount, updated_at) VALUES ('0929a3cf-b41c-4f15-8204-83e92ef13ee8', '10000000-0000-0000-0000-000000000004', 0.00, 0.00, '2026-07-09 17:23:33.439491+01');


--
-- Data for Name: partner_applications; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: payout_blocks; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: payout_requests; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: platform_alerts; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: poll_faqs; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.poll_faqs (faq_id, poll_id, question, answer, "position") VALUES ('03e162e5-85a1-46fd-af07-3b1a34146884', '20000000-0000-0000-0000-0000000c0001', 'Quand les votes ouvrent-ils exactement ?', 'Les votes ouvriront dans 18 jours, dès 00h00. Une notification sera publiée dans la section Actualités.', 1);
INSERT INTO public.poll_faqs (faq_id, poll_id, question, answer, "position") VALUES ('5d7e424d-3032-40d4-a69b-321abaa0a4cd', '20000000-0000-0000-0000-0000000c0001', 'Puis-je déjà partager la page d''une candidate ?', 'Oui, la fiche de chaque candidate est déjà consultable et partageable — seul le bouton de vote reste inactif jusqu''à l''ouverture.', 2);
INSERT INTO public.poll_faqs (faq_id, poll_id, question, answer, "position") VALUES ('18b271f1-c911-4741-a365-06a61ed9a355', '20000000-0000-0000-0000-0000000c0002', 'Puis-je voter dans plusieurs catégories ?', 'Oui, vous pouvez voter pour un ou plusieurs candidats, dans une ou plusieurs catégories, sans limite de catégories.', 1);
INSERT INTO public.poll_faqs (faq_id, poll_id, question, answer, "position") VALUES ('c0dca474-7d63-4112-97e0-394e0c9cd23c', '20000000-0000-0000-0000-0000000c0002', 'Les votes gratuits existent-ils sur ce scrutin ?', 'Non, ce scrutin fonctionne uniquement par vote payant (Mobile Money) — le prix unitaire et les packs sont visibles sur la page Règles.', 2);
INSERT INTO public.poll_faqs (faq_id, poll_id, question, answer, "position") VALUES ('ef414c5e-14a3-42ca-aac9-157f4ea622af', '20000000-0000-0000-0000-0000000c0002', 'Le classement est-il mis à jour en temps réel ?', 'Oui, les scores affichés sont recalculés en continu, avec une mise en cache de 30 secondes maximum.', 3);
INSERT INTO public.poll_faqs (faq_id, poll_id, question, answer, "position") VALUES ('d3a646a3-3d81-497d-9f93-fc42e7f31881', '20000000-0000-0000-0000-0000000c0003', 'Les résultats sont-ils définitifs ?', 'Oui, les résultats ci-dessus sont définitifs et certifiés par le procès-verbal de clôture téléchargeable en PDF.', 1);
INSERT INTO public.poll_faqs (faq_id, poll_id, question, answer, "position") VALUES ('c0d0861f-55a1-41fd-8ec3-2b66a7b91c01', '20000000-0000-0000-0000-0000000c0003', 'Puis-je encore consulter les profils des équipes ?', 'Oui, toutes les fiches équipes restent consultables indéfiniment, seul le vote est désormais fermé.', 2);
INSERT INTO public.poll_faqs (faq_id, poll_id, question, answer, "position") VALUES ('484fa604-f220-4989-89e5-425a8dbc3428', '6ff2af24-1736-4df4-88ff-b3f4f4715e5d', 'Comment voter ?', 'Rendez-vous sur la page candidats.', 0);


--
-- Data for Name: poll_galleries; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.poll_galleries (item_id, poll_id, media_url, media_type, tag, uploaded_at) VALUES ('ba239b51-9517-4bec-beb7-34fd31cbeede', '10000000-0000-0000-0000-0000000c0001', '/miss-crown.jpg', 'PHOTO', 'BEFORE', '2026-07-10 16:42:48.051462+01');
INSERT INTO public.poll_galleries (item_id, poll_id, media_url, media_type, tag, uploaded_at) VALUES ('d1201080-332f-4944-8dfe-4f4ac5d5d154', '10000000-0000-0000-0000-0000000c0001', '/miss-universe.jpg', 'PHOTO', 'DURING', '2026-07-10 16:42:48.051462+01');
INSERT INTO public.poll_galleries (item_id, poll_id, media_url, media_type, tag, uploaded_at) VALUES ('5850f54e-4585-4e7f-adb6-68e48b22bee4', '10000000-0000-0000-0000-0000000c0001', '/miss-mister-pageant.jpg', 'PHOTO', 'DURING', '2026-07-10 16:42:48.051462+01');
INSERT INTO public.poll_galleries (item_id, poll_id, media_url, media_type, tag, uploaded_at) VALUES ('e20254b7-b81a-4551-9992-80a53d4aa73c', '10000000-0000-0000-0000-0000000c0001', '/gala-performance.jpg', 'PHOTO', 'DURING', '2026-07-10 16:42:48.051462+01');
INSERT INTO public.poll_galleries (item_id, poll_id, media_url, media_type, tag, uploaded_at) VALUES ('947847f9-a176-4ca0-aab6-f5a8f84fbac5', '10000000-0000-0000-0000-0000000c0001', '/awards-gala.jpg', 'PHOTO', 'AFTER', '2026-07-10 16:42:48.051462+01');
INSERT INTO public.poll_galleries (item_id, poll_id, media_url, media_type, tag, uploaded_at) VALUES ('d2d84ccc-5cee-482c-a584-f85e8c1c4b7d', '20000000-0000-0000-0000-0000000c0001', 'https://picsum.photos/seed/mc27-g1/800/800', 'PHOTO', 'BEFORE', '2026-07-11 01:28:52.011504+01');
INSERT INTO public.poll_galleries (item_id, poll_id, media_url, media_type, tag, uploaded_at) VALUES ('8ef18f9c-e2d4-4020-9102-02aeeac4581d', '20000000-0000-0000-0000-0000000c0001', 'https://picsum.photos/seed/mc27-g2/800/800', 'PHOTO', 'BEFORE', '2026-07-11 01:28:52.011504+01');
INSERT INTO public.poll_galleries (item_id, poll_id, media_url, media_type, tag, uploaded_at) VALUES ('363ababf-2e18-47e8-9b4e-9713244e524a', '20000000-0000-0000-0000-0000000c0001', 'https://picsum.photos/seed/mc27-g3/800/800', 'PHOTO', 'BEFORE', '2026-07-11 01:28:52.011504+01');
INSERT INTO public.poll_galleries (item_id, poll_id, media_url, media_type, tag, uploaded_at) VALUES ('51391f3f-43b1-4333-b2dc-4d3bb9a29d7c', '20000000-0000-0000-0000-0000000c0001', 'https://picsum.photos/seed/mc27-g4/800/800', 'PHOTO', 'BEFORE', '2026-07-11 01:28:52.011504+01');
INSERT INTO public.poll_galleries (item_id, poll_id, media_url, media_type, tag, uploaded_at) VALUES ('186b5de6-3da3-4ca2-a246-d6327d02d793', '20000000-0000-0000-0000-0000000c0001', 'https://picsum.photos/seed/mc27-g5/800/800', 'PHOTO', 'BEFORE', '2026-07-11 01:28:52.011504+01');
INSERT INTO public.poll_galleries (item_id, poll_id, media_url, media_type, tag, uploaded_at) VALUES ('06220600-c930-4519-abed-f05f63c6bf9b', '20000000-0000-0000-0000-0000000c0001', 'https://picsum.photos/seed/mc27-g6/800/800', 'PHOTO', 'BEFORE', '2026-07-11 01:28:52.011504+01');
INSERT INTO public.poll_galleries (item_id, poll_id, media_url, media_type, tag, uploaded_at) VALUES ('d6db45a1-3ce1-47b9-809b-6803c50337d1', '20000000-0000-0000-0000-0000000c0002', 'https://picsum.photos/seed/tda26-g1/800/800', 'PHOTO', 'BEFORE', '2026-07-11 01:28:52.011504+01');
INSERT INTO public.poll_galleries (item_id, poll_id, media_url, media_type, tag, uploaded_at) VALUES ('f74622c8-b6fc-47b7-8a9b-09951009ba04', '20000000-0000-0000-0000-0000000c0002', 'https://picsum.photos/seed/tda26-g2/800/800', 'PHOTO', 'DURING', '2026-07-11 01:28:52.011504+01');
INSERT INTO public.poll_galleries (item_id, poll_id, media_url, media_type, tag, uploaded_at) VALUES ('15d02df8-71f4-468a-af78-1b634e52c373', '20000000-0000-0000-0000-0000000c0002', 'https://picsum.photos/seed/tda26-g3/800/800', 'PHOTO', 'DURING', '2026-07-11 01:28:52.011504+01');
INSERT INTO public.poll_galleries (item_id, poll_id, media_url, media_type, tag, uploaded_at) VALUES ('d87aa84d-076b-4f19-b48e-c90abee3505b', '20000000-0000-0000-0000-0000000c0002', 'https://picsum.photos/seed/tda26-g4/800/800', 'PHOTO', 'DURING', '2026-07-11 01:28:52.011504+01');
INSERT INTO public.poll_galleries (item_id, poll_id, media_url, media_type, tag, uploaded_at) VALUES ('b3f79905-542c-4e56-adb2-15acccc62b8e', '20000000-0000-0000-0000-0000000c0002', 'https://picsum.photos/seed/tda26-g5/800/800', 'PHOTO', 'DURING', '2026-07-11 01:28:52.011504+01');
INSERT INTO public.poll_galleries (item_id, poll_id, media_url, media_type, tag, uploaded_at) VALUES ('4e1c543c-beae-4667-8cff-cd5aea9b3e05', '20000000-0000-0000-0000-0000000c0002', 'https://picsum.photos/seed/tda26-g6/800/800', 'PHOTO', 'DURING', '2026-07-11 01:28:52.011504+01');
INSERT INTO public.poll_galleries (item_id, poll_id, media_url, media_type, tag, uploaded_at) VALUES ('db8d6b32-96b3-4608-8799-ac75118c4090', '20000000-0000-0000-0000-0000000c0002', 'https://picsum.photos/seed/tda26-g7/800/800', 'PHOTO', 'DURING', '2026-07-11 01:28:52.011504+01');
INSERT INTO public.poll_galleries (item_id, poll_id, media_url, media_type, tag, uploaded_at) VALUES ('d88ce6b4-39cc-4f4c-81e0-31b7747a1095', '20000000-0000-0000-0000-0000000c0002', 'https://picsum.photos/seed/tda26-g8/800/800', 'PHOTO', 'DURING', '2026-07-11 01:28:52.011504+01');
INSERT INTO public.poll_galleries (item_id, poll_id, media_url, media_type, tag, uploaded_at) VALUES ('1928d33a-6875-402d-ab71-f9590a29493c', '20000000-0000-0000-0000-0000000c0003', 'https://picsum.photos/seed/inno25-g1/800/800', 'PHOTO', 'DURING', '2026-07-11 01:28:52.011504+01');
INSERT INTO public.poll_galleries (item_id, poll_id, media_url, media_type, tag, uploaded_at) VALUES ('c36e6383-feff-461a-9a23-f9782b9ebd46', '20000000-0000-0000-0000-0000000c0003', 'https://picsum.photos/seed/inno25-g2/800/800', 'PHOTO', 'DURING', '2026-07-11 01:28:52.011504+01');
INSERT INTO public.poll_galleries (item_id, poll_id, media_url, media_type, tag, uploaded_at) VALUES ('08027938-39e8-4214-bb4a-b7698eb4f262', '20000000-0000-0000-0000-0000000c0003', 'https://picsum.photos/seed/inno25-g3/800/800', 'PHOTO', 'AFTER', '2026-07-11 01:28:52.011504+01');
INSERT INTO public.poll_galleries (item_id, poll_id, media_url, media_type, tag, uploaded_at) VALUES ('50158e3e-d432-4124-b2e8-ead7fa81ce98', '20000000-0000-0000-0000-0000000c0003', 'https://picsum.photos/seed/inno25-g4/800/800', 'PHOTO', 'AFTER', '2026-07-11 01:28:52.011504+01');
INSERT INTO public.poll_galleries (item_id, poll_id, media_url, media_type, tag, uploaded_at) VALUES ('8a21efd6-e8f3-4f4b-af0a-8087d54e75de', '20000000-0000-0000-0000-0000000c0003', 'https://picsum.photos/seed/inno25-g5/800/800', 'PHOTO', 'AFTER', '2026-07-11 01:28:52.011504+01');


--
-- Data for Name: poll_news; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.poll_news (news_id, poll_id, title, body, photos_urls, videos_urls, published_at) VALUES ('8e031ca5-4777-4dc7-b0d5-a58a2e89a193', '10000000-0000-0000-0000-0000000c0001', 'Ouverture officielle des votes', 'Les votes sont désormais ouverts ! Soutenez votre candidate préférée et suivez le classement en temps réel sur cette page.', '{/miss-crown.jpg}', NULL, '2026-07-08 16:42:48.051462+01');
INSERT INTO public.poll_news (news_id, poll_id, title, body, photos_urls, videos_urls, published_at) VALUES ('38bbd485-f098-47cc-b092-144247b7cb42', '10000000-0000-0000-0000-0000000c0001', 'Présentation des 6 finalistes', 'Découvrez le portrait complet de chacune de nos 6 finalistes dans l''onglet Candidats.', '{/miss-mister-pageant.jpg}', NULL, '2026-07-05 16:42:48.051462+01');
INSERT INTO public.poll_news (news_id, poll_id, title, body, photos_urls, videos_urls, published_at) VALUES ('0b2c695c-c878-4c9a-9cf4-574f02efa3c1', '10000000-0000-0000-0000-0000000c0001', 'Annonce de la date de la grande finale', 'La soirée de clôture et l''annonce des résultats se tiendront à Yaoundé. Plus d''informations à venir.', '{}', NULL, '2026-07-02 16:42:48.051462+01');
INSERT INTO public.poll_news (news_id, poll_id, title, body, photos_urls, videos_urls, published_at) VALUES ('1e7f9c26-4ef2-437f-a928-812edefdb370', '20000000-0000-0000-0000-0000000c0001', 'Découvrez les 10 candidates de cette édition', 'Après plus de 200 candidatures reçues, le jury a sélectionné 10 candidates représentant 3 zones de Douala. Rendez-vous dans 18 jours pour l''ouverture officielle des votes !', '{https://picsum.photos/seed/mc27-news1/900/500}', NULL, '2026-07-08 01:28:52.011504+01');
INSERT INTO public.poll_news (news_id, poll_id, title, body, photos_urls, videos_urls, published_at) VALUES ('c97ff976-43a8-4ae9-902b-5539f39fc205', '20000000-0000-0000-0000-0000000c0001', 'Nos partenaires se dévoilent', 'Sawa Telecom rejoint l''édition 2027 en tant que partenaire Or. Merci à tous nos partenaires pour leur confiance renouvelée.', '{https://picsum.photos/seed/mc27-news2/900/500}', NULL, '2026-07-10 01:28:52.011504+01');
INSERT INTO public.poll_news (news_id, poll_id, title, body, photos_urls, videos_urls, published_at) VALUES ('5f18d324-bc68-4901-a22d-19f901e3cead', '20000000-0000-0000-0000-0000000c0002', 'Ouverture officielle des votes !', 'C''est parti pour 30 jours de compétition entre nos 12 finalistes. Merci à tous pour votre engagement dès les premières heures.', '{https://picsum.photos/seed/tda26-news1/900/500}', NULL, '2026-07-02 01:28:52.011504+01');
INSERT INTO public.poll_news (news_id, poll_id, title, body, photos_urls, videos_urls, published_at) VALUES ('692d7fef-d1d0-4aac-aeb3-2344cded8895', '20000000-0000-0000-0000-0000000c0002', 'Yann F. prend la tête du classement général', 'Après une semaine de votes, Yann F. (Créateur Vidéo) prend la première place toutes catégories confondues, suivi de près par Diane K.', '{https://picsum.photos/seed/tda26-news2/900/500}', NULL, '2026-07-08 01:28:52.011504+01');
INSERT INTO public.poll_news (news_id, poll_id, title, body, photos_urls, videos_urls, published_at) VALUES ('1a165b4b-4f41-4517-9c13-d89a6c9f5d38', '20000000-0000-0000-0000-0000000c0002', 'Nouveau partenaire : Afri Mobile Money', 'Afri Mobile Money rejoint l''édition 2026 en tant que partenaire Or, facilitant les paiements pour tous les votants.', '{https://picsum.photos/seed/tda26-news3/900/500}', NULL, '2026-07-10 01:28:52.011504+01');
INSERT INTO public.poll_news (news_id, poll_id, title, body, photos_urls, videos_urls, published_at) VALUES ('0166f476-a93b-4513-9809-8f2d48e34c4b', '20000000-0000-0000-0000-0000000c0003', 'Clôture officielle et remise des prix', 'Le concours 2025 est officiellement clôturé. Félicitations à AgriSense, grand vainqueur toutes catégories, et à toutes les équipes finalistes pour leur créativité.', '{https://picsum.photos/seed/inno25-news1/900/500}', NULL, '2026-06-26 01:28:52.011504+01');


--
-- Data for Name: poll_notices; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.poll_notices (notice_id, poll_id, message, type, permanent, expires_at, published_at) VALUES ('a05105a2-a526-4649-9997-8b4bbed872bf', '6ff2af24-1736-4df4-88ff-b3f4f4715e5d', 'Le vote ouvre demain !', 'ANNOUNCEMENT', true, NULL, '2026-07-12 15:40:22.990241+01');


--
-- Data for Name: poll_partners; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.poll_partners (partner_id, poll_id, name, logo_url, other_images_urls, website_url, level, validated) VALUES ('d822dff9-ab35-4bc1-bca1-8ad50e2e377c', '10000000-0000-0000-0000-0000000c0001', 'Radio Cameroun FM', NULL, NULL, NULL, 'GOLD', true);
INSERT INTO public.poll_partners (partner_id, poll_id, name, logo_url, other_images_urls, website_url, level, validated) VALUES ('6c0ffc23-6010-4c11-b35b-b24741d7681a', '10000000-0000-0000-0000-0000000c0001', 'Canal Événements', NULL, NULL, NULL, 'SILVER', true);
INSERT INTO public.poll_partners (partner_id, poll_id, name, logo_url, other_images_urls, website_url, level, validated) VALUES ('91f0040e-215c-4c9e-8678-9f34d79c432a', '10000000-0000-0000-0000-0000000c0001', 'Beauté Locale Cosmétiques', NULL, NULL, NULL, 'BRONZE', true);
INSERT INTO public.poll_partners (partner_id, poll_id, name, logo_url, other_images_urls, website_url, level, validated) VALUES ('a9bc9c41-22a8-46d6-8b97-652d681b1082', '20000000-0000-0000-0000-0000000c0001', 'Sawa Telecom', 'https://picsum.photos/seed/mc27-p1/300/150', NULL, 'https://example.com', 'Or', true);
INSERT INTO public.poll_partners (partner_id, poll_id, name, logo_url, other_images_urls, website_url, level, validated) VALUES ('ed0a93c1-4a0d-4f16-ab3a-2dcfdc62d3fc', '20000000-0000-0000-0000-0000000c0001', 'Douala Mode Distribution', 'https://picsum.photos/seed/mc27-p2/300/150', NULL, 'https://example.com', 'Argent', true);
INSERT INTO public.poll_partners (partner_id, poll_id, name, logo_url, other_images_urls, website_url, level, validated) VALUES ('c7b273be-2ad1-4f8f-8e0c-d37675af3093', '20000000-0000-0000-0000-0000000c0001', 'Littoral Radio', 'https://picsum.photos/seed/mc27-p3/300/150', NULL, NULL, 'Bronze', true);
INSERT INTO public.poll_partners (partner_id, poll_id, name, logo_url, other_images_urls, website_url, level, validated) VALUES ('197711b5-c5ba-4153-b964-4e162cdf8b3b', '20000000-0000-0000-0000-0000000c0002', 'Afri Mobile Money', 'https://picsum.photos/seed/tda26-p1/300/150', NULL, 'https://example.com', 'Or', true);
INSERT INTO public.poll_partners (partner_id, poll_id, name, logo_url, other_images_urls, website_url, level, validated) VALUES ('17692c2a-5e9e-479f-8b09-05811ceead76', '20000000-0000-0000-0000-0000000c0002', 'CréaStudio', 'https://picsum.photos/seed/tda26-p2/300/150', NULL, 'https://example.com', 'Argent', true);
INSERT INTO public.poll_partners (partner_id, poll_id, name, logo_url, other_images_urls, website_url, level, validated) VALUES ('11a0deb9-a3e6-47f2-a096-363be1e28777', '20000000-0000-0000-0000-0000000c0002', 'NetPlus ISP', 'https://picsum.photos/seed/tda26-p3/300/150', NULL, NULL, 'Bronze', true);
INSERT INTO public.poll_partners (partner_id, poll_id, name, logo_url, other_images_urls, website_url, level, validated) VALUES ('1395147e-4593-497e-9fb0-56cc6b5fadf5', '20000000-0000-0000-0000-0000000c0002', 'Studio Non Validé', NULL, NULL, NULL, 'Bronze', false);
INSERT INTO public.poll_partners (partner_id, poll_id, name, logo_url, other_images_urls, website_url, level, validated) VALUES ('b8c51ac5-40a7-478a-92f5-06a879e44f45', '20000000-0000-0000-0000-0000000c0003', 'Banque Régionale d''Investissement', 'https://picsum.photos/seed/inno25-p1/300/150', NULL, 'https://example.com', 'Or', true);
INSERT INTO public.poll_partners (partner_id, poll_id, name, logo_url, other_images_urls, website_url, level, validated) VALUES ('433cefa3-de54-4b8f-b5db-94eea442bde2', '20000000-0000-0000-0000-0000000c0003', 'TechHub Incubateur', 'https://picsum.photos/seed/inno25-p2/300/150', NULL, 'https://example.com', 'Argent', true);


--
-- Data for Name: poll_reports; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: prize_payments; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: prizes; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: speakers; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: program_sessions; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: psp_reconciliations; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: public_actions; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: public_sessions; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: rate_limits; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: refund_policies; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.refund_policies (policy_id, campaign_id, campaign_type, refundable, delay_hours, percentage) VALUES ('9f038570-fe1e-4ef7-9bcb-9c19e9fd3113', '20000000-0000-0000-0000-0000000c0001', 'POLL', true, 24, 100);
INSERT INTO public.refund_policies (policy_id, campaign_id, campaign_type, refundable, delay_hours, percentage) VALUES ('7a4b1971-86d9-4155-912c-c35e4374739c', '20000000-0000-0000-0000-0000000c0002', 'POLL', true, 12, 50);
INSERT INTO public.refund_policies (policy_id, campaign_id, campaign_type, refundable, delay_hours, percentage) VALUES ('5ba1f85c-2f3b-4dd8-afb3-cfc43bb5a21d', '20000000-0000-0000-0000-0000000c0003', 'POLL', false, NULL, NULL);
INSERT INTO public.refund_policies (policy_id, campaign_id, campaign_type, refundable, delay_hours, percentage) VALUES ('67a8a072-5827-438a-b15e-da9b1c1d8df2', '0f5f4825-9cc3-4290-b81e-ebf0f8083d76', 'POLL', false, 48, 100);


--
-- Data for Name: site_configs; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.site_configs (config_id, contact_email, admin_email, support_phone, whatsapp_support, social_links, response_time_label, updated_at) VALUES ('557ff8da-0cbf-4361-9769-f9cd3cfda775', 'contact@moledievent.com', 'admin@moledievent.com', '+237600000000', '237600000000', '{"x": "https://x.com/moledievents", "facebook": "https://facebook.com/moledievents", "instagram": "https://instagram.com/moledievents"}', 'Réponse sous 24h ouvrées', '2026-07-09 17:23:33.439491+01');


--
-- Data for Name: sponsor_calls; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.sponsor_calls (call_id, user_id, slug, title, event_description, expected_audience, photos_urls, videos_urls, deadline, status) VALUES ('10000000-0000-0000-0000-0000000c0005', '10000000-0000-0000-0000-000000000003', 'appel-sponsors-demo-festival', 'Appel Démo — Festival culturel', 'Recherche de sponsors pour un festival culturel de démonstration.', '5000 visiteurs attendus sur 3 jours', '{}', NULL, '2026-08-08 17:23:33.439491+01', 'ACTIVE');


--
-- Data for Name: sponsorship_levels; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.sponsorship_levels (level_id, call_id, name, min_amount, perks, available) VALUES ('10000000-0000-0000-0000-00000000bb01', '10000000-0000-0000-0000-0000000c0005', 'GOLD', 500000.00, 'Logo sur toute la communication + stand dédié', true);


--
-- Data for Name: sponsor_applications; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.sponsor_applications (application_id, call_id, company_name, email, phone, sector, level_id, description, logo_url, other_images_urls, documents_urls, transaction_id, status, decided_at, created_at) VALUES ('58e9a0a9-35ee-4cd4-8a32-db7283bd2bbc', '10000000-0000-0000-0000-0000000c0005', 'Entreprise Démo SARL', 'contact@entreprise-demo.cm', '+237690000000', 'Télécommunications', '10000000-0000-0000-0000-00000000bb01', 'Candidature de démonstration.', NULL, NULL, '{}', '10000000-0000-0000-0000-0000000f0005', 'PENDING', NULL, '2026-07-09 17:23:33.439491+01');


--
-- Data for Name: submissions; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: system_email_templates; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: temporary_reservations; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: ticket_designs; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: ticket_messages; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.ticket_messages (message_id, ticket_id, author_id, author_role, content, attachments_urls, created_at) VALUES ('cd889081-941f-4bad-a7fe-927f4da81e2a', '387c196b-3f4b-475f-990a-0b23614dda41', '10000000-0000-0000-0000-000000000002', 'user', 'Mon vote na pas ete comptabilise alors que le paiement a bien ete debite de mon compte.', '{}', '2026-07-11 17:42:44.356454+01');
INSERT INTO public.ticket_messages (message_id, ticket_id, author_id, author_role, content, attachments_urls, created_at) VALUES ('a3a6eac7-39ae-425f-9acb-ba63cc69d086', '39ce6141-0080-48fc-96b1-62481075e224', '10000000-0000-0000-0000-000000000002', 'user', 'Mon vote n''a pas été comptabilisé alors que le paiement a bien été débité de mon compte.', '{}', '2026-07-11 17:42:56.426672+01');
INSERT INTO public.ticket_messages (message_id, ticket_id, author_id, author_role, content, attachments_urls, created_at) VALUES ('1034bd08-f79a-42cb-84dd-f3f323f1d933', '39ce6141-0080-48fc-96b1-62481075e224', '10000000-0000-0000-0000-000000000002', 'user', 'Une précision : c''était pour le scrutin Miss Cameroun 2026.', '{}', '2026-07-11 17:45:35.83822+01');
INSERT INTO public.ticket_messages (message_id, ticket_id, author_id, author_role, content, attachments_urls, created_at) VALUES ('13dbb81d-9d2f-4587-b037-4c73c9e802da', '56f70fbc-51d1-4962-904c-4650d2cc2add', '00000000-0000-0000-0000-000000000001', 'user', 'Hhhhhhhjnggvvvbbbb ccccccxcvbbn', '{}', '2026-07-11 23:30:52.208159+01');


--
-- Data for Name: tier_options; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: two_fa; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: unique_codes; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: user_commission_configs; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: user_preferences; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.user_preferences (user_id, preferred_event_types, organization_frequency, activity_country, language, notif_email_validation, notif_email_rejection, notif_email_payment, notif_email_payout, notif_email_ticket, notif_whatsapp_validation, notif_whatsapp_payment, notif_whatsapp_payout, newsletter_frequency) VALUES ('10000000-0000-0000-0000-000000000001', '{}', NULL, NULL, 'FR', true, true, true, true, true, false, false, false, 'WEEKLY');
INSERT INTO public.user_preferences (user_id, preferred_event_types, organization_frequency, activity_country, language, notif_email_validation, notif_email_rejection, notif_email_payment, notif_email_payout, notif_email_ticket, notif_whatsapp_validation, notif_whatsapp_payment, notif_whatsapp_payout, newsletter_frequency) VALUES ('10000000-0000-0000-0000-000000000003', '{}', NULL, NULL, 'FR', true, true, true, true, true, false, false, false, 'WEEKLY');
INSERT INTO public.user_preferences (user_id, preferred_event_types, organization_frequency, activity_country, language, notif_email_validation, notif_email_rejection, notif_email_payment, notif_email_payout, notif_email_ticket, notif_whatsapp_validation, notif_whatsapp_payment, notif_whatsapp_payout, newsletter_frequency) VALUES ('10000000-0000-0000-0000-000000000004', '{}', NULL, NULL, 'EN', true, true, true, true, true, false, false, false, 'WEEKLY');
INSERT INTO public.user_preferences (user_id, preferred_event_types, organization_frequency, activity_country, language, notif_email_validation, notif_email_rejection, notif_email_payment, notif_email_payout, notif_email_ticket, notif_whatsapp_validation, notif_whatsapp_payment, notif_whatsapp_payout, newsletter_frequency) VALUES ('10000000-0000-0000-0000-000000000002', '{}', NULL, NULL, 'FR', true, true, true, true, true, false, false, false, 'WEEKLY');
INSERT INTO public.user_preferences (user_id, preferred_event_types, organization_frequency, activity_country, language, notif_email_validation, notif_email_rejection, notif_email_payment, notif_email_payout, notif_email_ticket, notif_whatsapp_validation, notif_whatsapp_payment, notif_whatsapp_payout, newsletter_frequency) VALUES ('00000000-0000-0000-0000-000000000001', '{}', NULL, NULL, 'FR', true, true, true, true, true, false, false, false, 'WEEKLY');


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: liboka
--

INSERT INTO public.user_sessions (session_id, user_id, access_token, refresh_token, ip, browser, created_at, expires_at, invalidated) VALUES ('f0fcbb70-4599-46c7-9bee-c5c77979a008', '10000000-0000-0000-0000-000000000002', 'd07e634016d08ae6ee94c14a43069bfc3d89e02b17eef4dd2b7f74beb0185baf', '290bbb3e8326b65f7b06a9d4ace7ce79c45353234c67f6a6e98176a0220d42a8', '::1', 'curl/8.21.0', '2026-07-11 16:31:36.379021+01', '2026-07-11 18:32:12.834264+01', true);
INSERT INTO public.user_sessions (session_id, user_id, access_token, refresh_token, ip, browser, created_at, expires_at, invalidated) VALUES ('4a21446b-460d-41a6-9200-a7eaea796d5d', '10000000-0000-0000-0000-000000000002', '4d2ef7daf9b12c6bc8bcbf9cf225acc63d6b62e44882a7ffc48e753f0154a4cc', 'e80c0d3cfefeb4859fa565ec23bf0cd4265f2559ac8b14e37c2ba0a825cc6571', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Claude/1.20186.1 Chrome/148.0.7778.271 Electron/42.5.1 Safari/537.36 MSIX', '2026-07-11 16:48:57.375466+01', '2026-07-12 02:42:26.638346+01', true);
INSERT INTO public.user_sessions (session_id, user_id, access_token, refresh_token, ip, browser, created_at, expires_at, invalidated) VALUES ('fada3c69-92b3-4cfc-a05a-d49dc8548c3a', '00000000-0000-0000-0000-000000000001', 'c9cc5ffa94eabea64c6dda991882f78a5b07b8b25ba6b148fc5791a5142e54b1', '812c9dfe9a5aa55c2b9fb78b63610e57106cc5a2eaebad3879c946868e0f546d', '38.109.228.74', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1', '2026-07-11 23:15:36.663331+01', '2026-07-12 15:31:06.52652+01', true);
INSERT INTO public.user_sessions (session_id, user_id, access_token, refresh_token, ip, browser, created_at, expires_at, invalidated) VALUES ('a4eaf787-3e5a-49c3-a11f-85efcb803304', '00000000-0000-0000-0000-000000000001', '24879c0e0aa9cbd96c4cf050b0ec3a4e624cfa092af1276607f849a490565efb', 'a06989528cab72da78cf00c35ee78d04774e0a98c7c3a24371e668232024cf5e', '38.109.228.74', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1', '2026-07-12 13:31:07.332724+01', '2026-07-12 15:39:03.063475+01', true);
INSERT INTO public.user_sessions (session_id, user_id, access_token, refresh_token, ip, browser, created_at, expires_at, invalidated) VALUES ('0fd2f0aa-c009-444a-b392-d0dbe5e6298e', '00000000-0000-0000-0000-000000000001', 'ddd316e468265bfd5d8a5dbb6df7f9eb2f7e7c72ffb28b924694caa3a6ac4f2c', '4bfba2c37a6f753a40b272492fdeb626fac858e7b9e32691868d50e98391d44f', '38.109.228.74', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1', '2026-07-11 23:10:35.551336+01', '2026-07-12 01:11:16.956085+01', true);
INSERT INTO public.user_sessions (session_id, user_id, access_token, refresh_token, ip, browser, created_at, expires_at, invalidated) VALUES ('5d29d728-6393-48cb-96dc-76e48c65e9bb', '10000000-0000-0000-0000-000000000002', '401b102c0fc832d78cf547414a58e0b69d28b558901cda93b6da9321b26e234c', 'd205d3089aee89a026eebd32c87ee51f53bf4a9d5f4735e3642642a63438ebf9', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Claude/1.20186.1 Chrome/148.0.7778.271 Electron/42.5.1 Safari/537.36 MSIX', '2026-07-12 12:53:28.402942+01', '2026-07-13 03:07:32.910437+01', false);
INSERT INTO public.user_sessions (session_id, user_id, access_token, refresh_token, ip, browser, created_at, expires_at, invalidated) VALUES ('cf74499e-a875-430f-8f95-ffafb63adff7', '10000000-0000-0000-0000-000000000002', '025e90da89f6b11f3e00090edbc3720bb4edcd46f24f993439a3a9c8bf17fc51', 'f5d5b4bd06bd78d819e2370a866a8299b1dd33c51f06f5a7a16cab198b5b76df', '::1', 'curl/8.21.0', '2026-07-12 00:48:57.633421+01', '2026-07-12 02:48:57.633421+01', false);
INSERT INTO public.user_sessions (session_id, user_id, access_token, refresh_token, ip, browser, created_at, expires_at, invalidated) VALUES ('40d1067b-21b9-45d7-8259-e81a26583cab', '10000000-0000-0000-0000-000000000002', '0604e5520534c5c6c00e7485f9cb8f24ac193b6e65b6ec8455ac8e9783440b1e', '12286134c6e99370ae7e3489be1d2da50e003c599103ced29df06bdf060226ab', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Claude/1.20186.1 Chrome/148.0.7778.271 Electron/42.5.1 Safari/537.36 MSIX', '2026-07-12 00:54:10.123869+01', '2026-07-12 04:05:45.783081+01', false);
INSERT INTO public.user_sessions (session_id, user_id, access_token, refresh_token, ip, browser, created_at, expires_at, invalidated) VALUES ('c5aff773-a9c2-4f46-9370-aeedbcc9dafc', '10000000-0000-0000-0000-000000000002', '1a272f879c15aaf971cbe38ad56491f83ed77053bf37c9b7e4a8a4df57514fef', 'db2c5c900f9b66e425d52e1122e90e360c1e7251fd8881186aa5b39ef7304b12', '::1', 'curl/8.21.0', '2026-07-12 12:53:08.762004+01', '2026-07-12 14:53:08.762004+01', false);
INSERT INTO public.user_sessions (session_id, user_id, access_token, refresh_token, ip, browser, created_at, expires_at, invalidated) VALUES ('ee72eeca-0a59-4ba7-9217-cb2f7e037f13', '10000000-0000-0000-0000-000000000002', 'a7a75b12acc5fbcbae31e97a238c438f37494b85fe986b6806925cccd15ae6a4', '6c28d95093155e90f504a527f08c9d00e65372765730ee4f0f69bf1114684007', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-11 18:01:49.607689+01', '2026-07-12 14:55:15.303128+01', false);
INSERT INTO public.user_sessions (session_id, user_id, access_token, refresh_token, ip, browser, created_at, expires_at, invalidated) VALUES ('8977dfe5-f628-43bb-b12a-916efd0f89dd', '10000000-0000-0000-0000-000000000002', '87367d57dd1689669ef123ece5bfaac415e70b9398041b4baed837ac2c1403c7', 'cc4719856b9a386403ccf0c209aa0a391d20f4d69c9d708097e30650e04b4857', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-12 12:55:15.836542+01', '2026-07-12 16:05:42.22661+01', false);
INSERT INTO public.user_sessions (session_id, user_id, access_token, refresh_token, ip, browser, created_at, expires_at, invalidated) VALUES ('f87991d2-2542-44bd-87ed-e6dae777366f', '10000000-0000-0000-0000-000000000002', 'a11b09c04e5baaf5e6105378eacb0d335b231a82ee0a0754c6fc31b7b73f20ee', 'a5c229b9d9f8cc765348e330092857f430e6a1982a5ba9205c900742fad6da7e', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Claude/1.20186.1 Chrome/148.0.7778.271 Electron/42.5.1 Safari/537.36 MSIX', '2026-07-12 15:07:36.489148+01', '2026-07-13 03:53:45.190745+01', false);


--
-- Data for Name: vote_otps; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: webhook_logs; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- Data for Name: weighted_scores; Type: TABLE DATA; Schema: public; Owner: liboka
--



--
-- PostgreSQL database dump complete
--

\unrestrict OisJEoMDXIAh4tZlJv01T4gPHzK3rppzUybh8P66n6Qbw0tpgANjQQyeexNRSQv


COMMIT;
