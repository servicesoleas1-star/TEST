# Liboka Vote / Moledi Events — Plan de conception du schéma

## 1. Stratégie générale

- **SGBD** : PostgreSQL 15+
- **Migrations** : SQL brut, numérotées, regroupées par domaine logique
- **Polymorphisme** : table-chapeau `campaigns` (Class Table Inheritance — CTI)
  - Toute entité "campagne" (Poll, Event, Fundraiser, CFProject, Lottery, Contest,
    SponsorCall) possède une ligne miroir dans `campaigns(campaign_id, campaign_type, owner_user_id, created_at)`.
  - Son PK propre (`poll_id`, `event_id`, ...) est ALSO une FK 1-1 vers `campaigns.campaign_id`
    (même valeur UUID, `PRIMARY KEY` + `FOREIGN KEY ... REFERENCES campaigns`).
  - Toute table qui avait `campaign_id UUID + campaign_type VARCHAR` (Transaction, PageConfig,
    BrandSettings, CustomDomain, EscrowDeposit, RefundPolicy, SupportTicket,
    MassEmailCampaign, MassWhatsAppCampaign) pointe désormais avec une vraie FK
    `campaign_id REFERENCES campaigns(campaign_id)`. `campaign_type` est conservé en
    colonne dénormalisée (lecture rapide sans jointure) mais vérifié par trigger
    contre `campaigns.campaign_type` pour éviter toute désynchronisation.
- **Enums** : PostgreSQL `CREATE TYPE ... AS ENUM`, un type par enum métier.
- **Clés primaires** : `UUID DEFAULT gen_random_uuid()` (extension `pgcrypto`).
- **Horodatage** : `TIMESTAMPTZ` partout (pas de `TIMESTAMP` naïf), pour gérer le fuseau
  des événements (`timezone` stocké séparément quand affichage local nécessaire).
- **Soft delete** : respecté où le diagramme le prévoit (`User.deleted_at`,
  `Candidate.active`, etc.) — pas de pattern générique imposé hors diagramme.
- **AuditLog** : table en lecture/écriture seule — INSERT autorisé, UPDATE/DELETE
  révoqués via `REVOKE` + trigger de garde-fou.
- **Argent** : `NUMERIC(14,2)` pour tous les montants (Decimal du diagramme),
  jamais de float.
- **Tableaux** : `TEXT[]` / `UUID[]` natifs PostgreSQL pour les champs `String[]`.
- **JSON** : `JSONB` pour tous les champs `JSON` du diagramme (indexable, performant).

## 2. Ordre des migrations (groupes logiques, respecte les dépendances FK)

| # | Groupe | Contenu (DC source) | Dépend de |
|---|--------|---------------------|-----------|
| 00 | extensions & enums | Extensions pgcrypto/citext, tous les CREATE TYPE ENUM | — |
| 01 | identity_session | DC-01 Visitor, PublicSession, PublicAction, GDPRConsent, RateLimit | 00 |
| 02 | auth_users | DC-02 User, UserPreferences, UserSession, Token, TwoFA, LoginLog, AdminPermission, AcquisitionSource, Influencer | 01 (Visitor) |
| 03 | campaigns_core | Table-chapeau `campaigns` (CTI) | 02 (User owner) |
| 04 | polls_votes | DC-03 Poll + 16 tables filles | 01,02,03 |
| 05 | events_ticketing | DC-04 Event + 14 tables filles | 01,02,03 |
| 06 | donations_crowdfunding | DC-05 Fundraiser + CFProject + filles | 01,02,03 |
| 07 | sponsorship_lottery_contest | DC-06 SponsorCall, Contest, Lottery + filles | 01,02,03,05(Event) |
| 08 | design_customization | DC-07 PageConfig, Block, BrandSettings, CustomDomain, DesignTemplate, TicketDesign, IACredit* | 02,03,05 |
| 09 | finance_payments | DC-08 Transaction, Aggregator, Commission*, Payout*, Webhook/Failover/Reconciliation, CountryConfig | 01,02,03 |
| 10 | support_notifications_audit | DC-09 SupportTicket, Notification*, MassCampaigns, AuditLog, PlatformAlert, AnomalyDetection | 01,02,03 |
| 11 | backoffice_config | DC-10 SiteConfig, FAQ, FeatureFlag, Maintenance, KPI, CannedReply, EmailTemplate, LegalPage, LanguageConfig | 02 |
| 12 | cross_fk_patch | FKs différées qui créent des dépendances circulaires (ex: Vote.transaction_id ↔ Transaction.campaign_id, RefundPolicy ↔ Poll/Event, EscrowDeposit ↔ Contest/Lottery, EventReport.ticket_id ↔ SupportTicket) | tout ce qui précède |
| 13 | indexes_performance | Index secondaires non couverts par PK/UNIQUE (recherche, FK fréquentes, JSONB GIN) | tout |
| 14 | views_helpers (optionnel) | Vues pratiques (ex: solde organisateur, santé agrégateur) | tout |

> Note sur les dépendances circulaires : plusieurs entités se référencent mutuellement
> (Vote ↔ Transaction, Candidate ↔ CandidateCategory, ContestParticipant ↔ BracketMatch).
> Stratégie : créer la table avec la colonne FK nullable mais SANS la contrainte
> `REFERENCES` inline quand cela créerait un cycle au moment de la création ; ajouter
> la contrainte dans la migration `12_cross_fk_patch` via `ALTER TABLE ... ADD CONSTRAINT`.

## 3. Liste exhaustive des tables par groupe (vérification de complétude — 110 classes)

### 01 identity_session (5)
visitors, public_sessions, public_actions, gdpr_consents, rate_limits

### 02 auth_users (9)
users, user_preferences, user_sessions, tokens, two_fa, login_logs,
admin_permissions, acquisition_sources, influencers

### 03 campaigns_core (1 nouvelle table technique)
campaigns

### 04 polls_votes (17)
polls, candidates, candidate_categories, votes, anti_duplicates, vote_otps,
unique_codes, jury_sessions, jury_scores, weighted_scores, closing_reports,
poll_news, poll_galleries, poll_partners, poll_faqs, poll_notices, poll_reports
(+ refund_policies est partagé avec events → mis dans finance ou son propre groupe, voir §4)

### 05 events_ticketing (15)
events, event_venues, ticket_types, promo_codes, ticket_purchases,
temporary_reservations, entry_scans, program_sessions, speakers,
event_sponsors, merch_items, merch_purchases, event_galleries,
event_resources, event_reports

### 06 donations_crowdfunding (12)
fundraisers, donations, fundraiser_comments, fundraiser_updates,
cf_projects, tiers, tier_options, cf_contributions, cf_team_members,
cf_updates, cf_questions, cf_comments

### 07 sponsorship_lottery_contest (12)
sponsor_calls, sponsorship_levels, sponsor_applications, contests, prizes,
contest_participants, submissions, bracket_matches, escrow_deposits,
prize_payments, lotteries, lottery_tickets, lottery_draws
(13 en réalité — DC-06 dit 12 mais liste 13 classes ; vérifié ligne par ligne)

### 08 design_customization (9)
page_configs, blocks, brand_settings, custom_domains, design_templates,
ticket_designs, ia_credits, ia_generations, ia_credit_packs

### 09 finance_payments (13 + refund_policy)
transactions, user_commission_configs, commission_configs, payout_requests,
organizer_balances, aggregators, aggregator_health_logs, failover_logs,
webhook_logs, psp_reconciliations, country_configs, minimum_payout_configs,
payout_blocks, refund_policies

### 10 support_notifications_audit (9)
support_tickets, ticket_messages, notifications, notification_logs,
mass_email_campaigns, mass_whatsapp_campaigns, audit_logs, platform_alerts,
anomaly_detections

### 11 backoffice_config (9)
site_configs, global_faqs, feature_flags, maintenance_modes, kpi_snapshots,
canned_replies, system_email_templates, legal_pages, language_configs

**Total métier : 110 classes du diagramme + 1 table technique (campaigns) = 111 tables.**

## 4. Décisions de modélisation à noter (écarts mineurs vs diagramme brut)

1. `refund_policies` référencée par Poll (1→1) et Event (1→1) dans les diagrammes —
   devient enfant de `campaigns` (campaign_id) plutôt que dupliquée : une seule table,
   FK vers campaigns, contrainte UNIQUE(campaign_id).
2. `AntiDuplicate.value_hashed`, `Visitor.ip_hashed`, `RateLimit.ip_hashed` etc. —
   colonnes `TEXT` (hash SHA-256 hex = 64 chars, mais TEXT pour flexibilité d'algo).
3. Tables d'enums "lookup" explicites au lieu d'ENUM Postgres uniquement pour
   `CountryConfig` (déjà une vraie table) — pas de changement, c'est déjà relationnel.
4. `Influencer` est modélisé comme sous-type de `AcquisitionSource` (FK 1→*,
   pas héritage table — le diagramme le précise via note explicite).
5. Champs `String[]` type "URLs de photos" → `TEXT[]`, pas de table séparée
   (cohérent avec le diagramme qui les garde en colonnes array, pas en tables enfants).
6. `JurySession.invitation_token_id` → FK vers `tokens(token_id)` (TokenType.JURY_INVITATION).
7. `EscrowDeposit.campaign_id/campaign_type` → migré vers FK `campaigns` (Contest ou Lottery).
8. `SupportTicket.campaign_id/campaign_type` → idem, nullable (un ticket peut ne pas
   être lié à une campagne).

## 5. Prochaines étapes

1. Valider ce plan avec l'utilisateur (compte de tables, écarts notés).
2. Écrire les ENUM (groupe 00).
3. Écrire les migrations groupe par groupe dans l'ordre.
4. Écrire les index de performance (groupe 13).
5. Écrire le script de seed minimal de test.
6. Écrire le README d'installation (reproductibilité locale).
7. Générer un ERD (diagramme) à partir du schéma final pour validation visuelle.
8. Écrire des tests d'intégrité (contraintes, cascades, triggers AuditLog).
