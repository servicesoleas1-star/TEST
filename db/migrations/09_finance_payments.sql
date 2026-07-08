-- =====================================================================
-- 09_finance_payments.sql
-- DC-08 — Finance & Payments (MVP + commission patch)
-- =====================================================================
-- Dépend de : 01 (visitors), 02 (users), 03 (campaigns)
-- Tables : aggregators, transactions, user_commission_configs,
--          commission_configs, payout_requests, organizer_balances,
--          aggregator_health_logs, failover_logs, webhook_logs,
--          psp_reconciliations, country_configs, minimum_payout_configs,
--          payout_blocks, refund_policies
--
-- Note de conception (refund_policies) : le diagramme montre
-- "Poll 1 -> 1 RefundPolicy" et "Event 1 -> 1 RefundPolicy" comme deux
-- relations séparées avec la même structure de table. On fusionne en
-- UNE table refund_policies rattachée à "campaigns" (donc valable pour
-- Poll, Event, ou toute campagne future) plutôt que de la dupliquer.
-- Cela évite la redondance et reste extensible (Fundraiser, CFProject
-- pourront aussi avoir une politique de remboursement sans migration
-- supplémentaire).
--
-- Note FK différée : transactions.aggregator_id référence aggregators,
-- créée plus haut dans CE MÊME fichier (pas de cycle inter-fichiers ici).
-- En revanche, transactions est référencée par de nombreuses tables
-- créées dans des migrations précédentes (votes, ticket_purchases,
-- donations, cf_contributions, sponsor_applications, escrow_deposits,
-- prize_payments, lottery_tickets, merch_purchases) : ces FK sont
-- ajoutées rétroactivement dans 12_cross_fk_patch.sql.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- Aggregator : passerelle de paiement (PSP)
-- ---------------------------------------------------------------------
CREATE TABLE aggregators (
    aggregator_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                TEXT NOT NULL,
    countries           TEXT[] NOT NULL DEFAULT '{}',
    payment_methods     payment_method[] NOT NULL DEFAULT '{}',
    priority            INTEGER NOT NULL DEFAULT 100,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    api_endpoint        TEXT NOT NULL,
    health_endpoint     TEXT NOT NULL,
    timeout_seconds     INTEGER NOT NULL DEFAULT 10,
    operational_status  agg_status NOT NULL DEFAULT 'OPERATIONAL',
    success_rate        NUMERIC(5,2) NOT NULL DEFAULT 100,
    avg_latency_ms      INTEGER NOT NULL DEFAULT 0
);
COMMENT ON TABLE aggregators IS 'Aucun nom d''agrégateur en dur dans le code : tout est configuré via aggregators.yaml. priority : nombre plus bas = essayé en premier. success_rate = moyenne glissante des 100 derniers health-checks.';

-- ---------------------------------------------------------------------
-- Transaction : cœur financier — toute opération monétaire passe ici
-- ---------------------------------------------------------------------
CREATE TABLE transactions (
    transaction_id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id                   UUID NOT NULL REFERENCES campaigns(campaign_id),
    campaign_type                 campaign_type NOT NULL,
    type                           tx_type NOT NULL,
    visitor_id                    UUID NOT NULL REFERENCES visitors(visitor_id),
    user_id                        UUID REFERENCES users(user_id),
    gross_amount                   NUMERIC(14,2) NOT NULL CHECK (gross_amount >= 0),
    moledi_commission               NUMERIC(14,2) NOT NULL DEFAULT 0,
    psp_fee                        NUMERIC(14,2) NOT NULL DEFAULT 0,
    net_organizer                  NUMERIC(14,2) NOT NULL DEFAULT 0,
    status                         tx_status NOT NULL DEFAULT 'INITIATED',
    idempotency_key                TEXT NOT NULL UNIQUE,
    aggregator_id                  UUID NOT NULL REFERENCES aggregators(aggregator_id),
    external_tx_id                 TEXT,
    country                        TEXT NOT NULL,
    payment_method                 payment_method NOT NULL,
    operator                       TEXT,
    webhook_payload                JSONB,
    correlation_id                 TEXT NOT NULL,
    applied_commission_config_id   UUID,    -- FK -> user_commission_configs OU commission_configs, résolue applicativement (voir commentaire)
    initiated_at                   TIMESTAMPTZ NOT NULL DEFAULT now(),
    confirmed_at                   TIMESTAMPTZ,
    expires_at                     TIMESTAMPTZ
);
COMMENT ON TABLE transactions IS 'Ordre de recherche de la commission au moment du paiement : 1) UserCommissionConfig où user_id+campaign_type correspondent, 2) UserCommissionConfig où user_id correspond et campaign_type IS NULL, 3) aucune ligne -> CommissionConfig global. applied_commission_config_id trace quelle ligne a été utilisée (piste d''audit complète).';
COMMENT ON COLUMN transactions.applied_commission_config_id IS 'NULL = le CommissionConfig global a été utilisé. Référence soit user_commission_configs.config_id soit commission_configs.config_id : pas de FK stricte unique possible (deux tables sources), vérifié applicativement. Ces deux tables sont créées juste après.';
COMMENT ON COLUMN transactions.operator IS 'Nom de l''opérateur mobile (ex: MTN, Orange) si payment_method = MOBILE_MONEY.';
COMMENT ON COLUMN transactions.expires_at IS 'Fixé à 30 min après initiation. Job cron expire-pending vérifie toutes les 10 min et déclenche un remboursement auto si dépassé.';

-- ---------------------------------------------------------------------
-- UserCommissionConfig : taux personnalisé par organisateur
-- ---------------------------------------------------------------------
CREATE TABLE user_commission_configs (
    config_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID REFERENCES users(user_id),
    campaign_type  campaign_type,
    vote_rate      NUMERIC(5,4),
    standard_rate  NUMERIC(5,4),
    active         BOOLEAN NOT NULL DEFAULT TRUE,
    note           TEXT,
    configured_by  UUID NOT NULL REFERENCES users(user_id),
    valid_from     TIMESTAMPTZ NOT NULL DEFAULT now(),
    valid_until    TIMESTAMPTZ,
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE user_commission_configs IS 'Permet à l''admin de fixer 5% pour un client VIP ou 20% pour un type de campagne premium. campaign_type NULL = s''applique à toutes les campagnes de cet utilisateur.';

-- ---------------------------------------------------------------------
-- CommissionConfig : taux global par défaut
-- ---------------------------------------------------------------------
CREATE TABLE commission_configs (
    config_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type          commission_type NOT NULL,
    rate          NUMERIC(5,4) NOT NULL,
    floor_amount  NUMERIC(14,2),
    active_from   TIMESTAMPTZ NOT NULL DEFAULT now(),
    modified_by   UUID NOT NULL REFERENCES users(user_id)
);

-- Maintenant que les deux tables sources existent, on documente (sans
-- contrainte FK stricte unique) la relation déjà créée plus haut.
-- (PostgreSQL ne supporte pas de FK "vers l'une ou l'autre table" —
-- l'intégrité de applied_commission_config_id est garantie par trigger,
-- voir 12_cross_fk_patch.sql)

-- ---------------------------------------------------------------------
-- PayoutRequest : demande de retrait d'un organisateur
-- ---------------------------------------------------------------------
CREATE TABLE payout_requests (
    payout_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(user_id),
    requested_amount    NUMERIC(14,2) NOT NULL CHECK (requested_amount > 0),
    payout_fee          NUMERIC(14,2) NOT NULL DEFAULT 0,
    net_amount          NUMERIC(14,2) NOT NULL,
    payout_phone        TEXT NOT NULL,
    aggregator_id        UUID NOT NULL REFERENCES aggregators(aggregator_id),
    status              payout_status NOT NULL DEFAULT 'PENDING',
    tracking_ref        TEXT,
    proof_url           TEXT,
    requested_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    executed_at         TIMESTAMPTZ,
    failure_reason      TEXT
);

-- ---------------------------------------------------------------------
-- OrganizerBalance : solde courant (1-1 avec User)
-- ---------------------------------------------------------------------
CREATE TABLE organizer_balances (
    balance_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    available_amount  NUMERIC(14,2) NOT NULL DEFAULT 0,
    reserved_amount   NUMERIC(14,2) NOT NULL DEFAULT 0,
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_organizer_balances_nonneg CHECK (available_amount >= 0 AND reserved_amount >= 0)
);

-- ---------------------------------------------------------------------
-- AggregatorHealthLog : historique des pings de santé (job toutes les 2 min)
-- ---------------------------------------------------------------------
CREATE TABLE aggregator_health_logs (
    log_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregator_id  UUID NOT NULL REFERENCES aggregators(aggregator_id) ON DELETE CASCADE,
    success        BOOLEAN NOT NULL,
    latency_ms     INTEGER NOT NULL,
    checked_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- FailoverLog : bascule automatique d'un agrégateur vers un autre
-- ---------------------------------------------------------------------
CREATE TABLE failover_logs (
    failover_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id  UUID NOT NULL REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    source_agg_id   UUID NOT NULL REFERENCES aggregators(aggregator_id),
    target_agg_id   UUID NOT NULL REFERENCES aggregators(aggregator_id),
    reason          TEXT NOT NULL,
    logged_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- WebhookLog : tous les callbacks PSP reçus (signés HMAC)
-- ---------------------------------------------------------------------
CREATE TABLE webhook_logs (
    webhook_log_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregator_id       UUID NOT NULL REFERENCES aggregators(aggregator_id),
    transaction_id       UUID REFERENCES transactions(transaction_id),
    raw_payload          JSONB NOT NULL,
    signature_valid      BOOLEAN NOT NULL,
    processing_status    TEXT NOT NULL,
    received_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE webhook_logs IS 'Chaque PSP signe ses callbacks en HMAC. Signature invalide -> HTTP 401 + log ici sans traitement métier. Signature valide -> met à jour la Transaction et déclenche l''action métier de façon atomique.';

-- ---------------------------------------------------------------------
-- PSPReconciliation : comparaison quotidienne DB vs relevé PSP
-- ---------------------------------------------------------------------
CREATE TABLE psp_reconciliations (
    recon_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregator_id          UUID NOT NULL REFERENCES aggregators(aggregator_id),
    reconciled_date         DATE NOT NULL,
    transactions_checked     INTEGER NOT NULL DEFAULT 0,
    discrepancies_count      INTEGER NOT NULL DEFAULT 0,
    discrepancy_amount       NUMERIC(14,2) NOT NULL DEFAULT 0,
    report_json              JSONB,
    generated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    alert_sent                BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_psp_reconciliations_agg_date UNIQUE (aggregator_id, reconciled_date)
);

-- ---------------------------------------------------------------------
-- CountryConfig : pays activés et leurs moyens de paiement
-- ---------------------------------------------------------------------
CREATE TABLE country_configs (
    country_code      VARCHAR(2) PRIMARY KEY,
    country_name      TEXT NOT NULL,
    active            BOOLEAN NOT NULL DEFAULT TRUE,
    currency          VARCHAR(3) NOT NULL,
    aggregator_ids    UUID[] NOT NULL DEFAULT '{}',
    methods_available payment_method[] NOT NULL DEFAULT '{}',
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- MinimumPayoutConfig : montant minimum de retrait (global ou par user)
-- ---------------------------------------------------------------------
CREATE TABLE minimum_payout_configs (
    config_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(user_id),
    min_amount  NUMERIC(14,2) NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON COLUMN minimum_payout_configs.user_id IS 'NULL = minimum global appliqué à tous les organisateurs.';

-- ---------------------------------------------------------------------
-- PayoutBlock : blocage de retrait (global ou individuel)
-- ---------------------------------------------------------------------
CREATE TABLE payout_blocks (
    block_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES users(user_id),
    active        BOOLEAN NOT NULL DEFAULT TRUE,
    reason        TEXT NOT NULL,
    blocked_by    UUID NOT NULL REFERENCES users(user_id),
    blocked_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    unblocked_at  TIMESTAMPTZ,
    unblocked_by  UUID REFERENCES users(user_id)
);
COMMENT ON COLUMN payout_blocks.user_id IS 'NULL = blocage global (tous les organisateurs). Seul le Super Admin peut poser un blocage global ; un Admin peut bloquer un organisateur individuel.';

-- ---------------------------------------------------------------------
-- RefundPolicy : politique de remboursement, rattachée à une campagne
-- ---------------------------------------------------------------------
CREATE TABLE refund_policies (
    policy_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id    UUID NOT NULL UNIQUE REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    campaign_type  campaign_type NOT NULL,
    refundable     BOOLEAN NOT NULL DEFAULT TRUE,
    delay_hours    INTEGER,
    percentage     INTEGER CHECK (percentage IS NULL OR percentage BETWEEN 0 AND 100)
);
COMMENT ON TABLE refund_policies IS 'Une seule table pour toutes les campagnes (Poll, Event, etc.) au lieu d''une relation 1-1 dupliquée par type, car la structure et la logique métier sont identiques. UNIQUE(campaign_id) préserve la cardinalité 1-1 du diagramme original.';

COMMIT;
