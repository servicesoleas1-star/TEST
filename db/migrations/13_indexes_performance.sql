-- =====================================================================
-- 13_indexes_performance.sql
-- Index secondaires (au-delà des PK/UNIQUE déjà indexés automatiquement)
-- =====================================================================
-- Dépend de : toutes les migrations précédentes
--
-- Principe : on indexe les colonnes qui apparaissent dans des clauses
-- WHERE/JOIN/ORDER BY fréquentes d'après les parcours utilisateurs
-- documentés (UC-*) et le diagramme de composants (lookups répétés :
-- Cache Redis pour payment:health, mais côté SQL on couvre les
-- requêtes qui touchent la base primaire et la read replica analytics).
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- Identity & Session — recherche par visiteur, nettoyage des sessions expirées
-- ---------------------------------------------------------------------
CREATE INDEX idx_public_sessions_visitor ON public_sessions(visitor_id);
CREATE INDEX idx_public_actions_visitor ON public_actions(visitor_id);
CREATE INDEX idx_public_actions_entity ON public_actions(entity_type, entity_id);
CREATE INDEX idx_public_actions_status ON public_actions(status) WHERE status = 'PENDING';
CREATE INDEX idx_visitors_account ON visitors(account_id) WHERE account_id IS NOT NULL;

-- ---------------------------------------------------------------------
-- Auth & Users — login, sessions actives, tokens valides
-- ---------------------------------------------------------------------
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id) WHERE invalidated = FALSE;
CREATE INDEX idx_tokens_value_unused ON tokens(value) WHERE used = FALSE;
CREATE INDEX idx_tokens_user_type ON tokens(user_id, type);
CREATE INDEX idx_login_logs_user ON login_logs(user_id, created_at DESC);
CREATE INDEX idx_influencers_source ON influencers(source_id);

-- ---------------------------------------------------------------------
-- Campaigns (table-chapeau) — lookups fréquents par owner et type
-- ---------------------------------------------------------------------
-- (idx_campaigns_owner et idx_campaigns_type déjà créés en migration 03)

-- ---------------------------------------------------------------------
-- Polls & Votes — page publique, dashboard organisateur, anti-fraude
-- ---------------------------------------------------------------------
CREATE INDEX idx_polls_user ON polls(user_id);
CREATE INDEX idx_polls_status ON polls(status);
CREATE INDEX idx_polls_slug_trgm ON polls USING gin (slug gin_trgm_ops);
CREATE INDEX idx_polls_dates ON polls(open_at, close_at);
CREATE INDEX idx_candidates_poll ON candidates(poll_id) WHERE active = TRUE;
CREATE INDEX idx_candidates_category ON candidates(category_id);
CREATE INDEX idx_votes_poll ON votes(poll_id);
CREATE INDEX idx_votes_candidate ON votes(candidate_id);
CREATE INDEX idx_votes_visitor ON votes(visitor_id);
CREATE INDEX idx_votes_status ON votes(status);
CREATE INDEX idx_votes_poll_created ON votes(poll_id, created_at);  -- graphiques votes/heure
CREATE INDEX idx_anti_duplicates_poll_value ON anti_duplicates(poll_id, value_hashed);
CREATE INDEX idx_unique_codes_status ON unique_codes(poll_id, status);
CREATE INDEX idx_jury_scores_candidate ON jury_scores(candidate_id);
CREATE INDEX idx_poll_reports_poll ON poll_reports(poll_id);

-- ---------------------------------------------------------------------
-- Events & Ticketing — recherche événement, scan entrée, stock
-- ---------------------------------------------------------------------
CREATE INDEX idx_events_user ON events(user_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_slug_trgm ON events USING gin (slug gin_trgm_ops);
CREATE INDEX idx_events_start_at ON events(start_at);
CREATE INDEX idx_ticket_types_event ON ticket_types(event_id) WHERE active = TRUE;
CREATE INDEX idx_ticket_purchases_event ON ticket_purchases(event_id);
CREATE INDEX idx_ticket_purchases_visitor ON ticket_purchases(visitor_id);
CREATE INDEX idx_ticket_purchases_status ON ticket_purchases(status);
CREATE INDEX idx_temporary_reservations_expires ON temporary_reservations(expires_at);
CREATE INDEX idx_entry_scans_purchase ON entry_scans(purchase_id);
CREATE INDEX idx_entry_scans_event ON entry_scans(event_id, scanned_at);
CREATE INDEX idx_program_sessions_event ON program_sessions(event_id, day_number);

-- ---------------------------------------------------------------------
-- Donations & Crowdfunding
-- ---------------------------------------------------------------------
CREATE INDEX idx_fundraisers_user ON fundraisers(user_id);
CREATE INDEX idx_fundraisers_status ON fundraisers(status);
CREATE INDEX idx_donations_fundraiser ON donations(fundraiser_id);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_cf_projects_user ON cf_projects(user_id);
CREATE INDEX idx_cf_projects_status ON cf_projects(status);
CREATE INDEX idx_cf_contributions_project ON cf_contributions(project_id);
CREATE INDEX idx_cf_contributions_tier ON cf_contributions(tier_id);

-- ---------------------------------------------------------------------
-- Sponsorship, Lottery, Contest
-- ---------------------------------------------------------------------
CREATE INDEX idx_sponsor_applications_call ON sponsor_applications(call_id);
CREATE INDEX idx_sponsor_applications_status ON sponsor_applications(status);
CREATE INDEX idx_contests_user ON contests(user_id);
CREATE INDEX idx_contests_status ON contests(status);
CREATE INDEX idx_contest_participants_contest ON contest_participants(contest_id);
CREATE INDEX idx_bracket_matches_contest ON bracket_matches(contest_id, round);
CREATE INDEX idx_lotteries_user ON lotteries(user_id);
CREATE INDEX idx_lottery_tickets_lottery ON lottery_tickets(lottery_id);
CREATE INDEX idx_escrow_deposits_campaign ON escrow_deposits(campaign_id);

-- ---------------------------------------------------------------------
-- Design & Customization
-- ---------------------------------------------------------------------
CREATE INDEX idx_page_configs_campaign ON page_configs(campaign_id);
CREATE INDEX idx_blocks_config ON blocks(config_id, position);
CREATE INDEX idx_custom_domains_domain_name ON custom_domains(domain_name);
CREATE INDEX idx_ia_generations_user ON ia_generations(user_id, created_at DESC);

-- ---------------------------------------------------------------------
-- Finance & Payments — le groupe le plus consulté en lecture (dashboard
-- finances organisateur, vérification admin, jobs cron)
-- ---------------------------------------------------------------------
CREATE INDEX idx_transactions_campaign ON transactions(campaign_id);
CREATE INDEX idx_transactions_visitor ON transactions(visitor_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_status_expires ON transactions(status, expires_at)
    WHERE status IN ('INITIATED','PENDING');   -- job expire-pending (toutes les 10 min)
CREATE INDEX idx_transactions_aggregator ON transactions(aggregator_id);
CREATE INDEX idx_transactions_initiated_at ON transactions(initiated_at);
CREATE INDEX idx_transactions_country ON transactions(country);
CREATE INDEX idx_payout_requests_user ON payout_requests(user_id);
CREATE INDEX idx_payout_requests_status ON payout_requests(status);
CREATE INDEX idx_aggregator_health_logs_agg_checked ON aggregator_health_logs(aggregator_id, checked_at DESC);
CREATE INDEX idx_webhook_logs_transaction ON webhook_logs(transaction_id);
CREATE INDEX idx_webhook_logs_aggregator ON webhook_logs(aggregator_id, received_at DESC);
CREATE INDEX idx_user_commission_configs_user ON user_commission_configs(user_id, campaign_type) WHERE active = TRUE;
CREATE INDEX idx_payout_blocks_user_active ON payout_blocks(user_id) WHERE active = TRUE;

-- ---------------------------------------------------------------------
-- Support, Notifications & Audit
-- ---------------------------------------------------------------------
CREATE INDEX idx_support_tickets_visitor ON support_tickets(visitor_id);
CREATE INDEX idx_support_tickets_status_priority ON support_tickets(status, priority);
CREATE INDEX idx_support_tickets_assigned ON support_tickets(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id, created_at);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE read = FALSE;
CREATE INDEX idx_notification_logs_notif ON notification_logs(notif_id);
-- idx_audit_logs_* déjà créés en migration 10
CREATE INDEX idx_platform_alerts_unresolved ON platform_alerts(resolved) WHERE resolved = FALSE;
CREATE INDEX idx_anomaly_detections_status ON anomaly_detections(status) WHERE status != 'RESOLVED';

-- ---------------------------------------------------------------------
-- Back-office & Config
-- ---------------------------------------------------------------------
CREATE INDEX idx_feature_flags_name ON feature_flags(name);
CREATE INDEX idx_kpi_snapshots_type_period ON kpi_snapshots(type, period);

-- ---------------------------------------------------------------------
-- Index GIN sur les colonnes JSONB les plus interrogées
-- (utile si l'application filtre un jour sur des clés JSON spécifiques)
-- ---------------------------------------------------------------------
CREATE INDEX idx_polls_custom_fields_gin ON polls USING gin (custom_fields);
CREATE INDEX idx_transactions_webhook_payload_gin ON transactions USING gin (webhook_payload);

COMMIT;
