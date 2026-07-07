-- =====================================================================
-- 10_support_notifications_audit.sql
-- DC-09 — Support, Notifications & Audit (MVP)
-- =====================================================================
-- Dépend de : 02 (users), 03 (campaigns)
-- Tables : support_tickets, ticket_messages, notifications,
--          notification_logs, mass_email_campaigns,
--          mass_whatsapp_campaigns, audit_logs, platform_alerts,
--          anomaly_detections
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- SupportTicket
-- ---------------------------------------------------------------------
CREATE TABLE support_tickets (
    ticket_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number         TEXT NOT NULL UNIQUE,
    visitor_id     UUID NOT NULL REFERENCES visitors(visitor_id),
    user_id        UUID REFERENCES users(user_id),
    campaign_id    UUID REFERENCES campaigns(campaign_id),
    subject        ticket_subject NOT NULL,
    description    TEXT NOT NULL,
    status         support_ticket_status NOT NULL DEFAULT 'OPEN',
    priority       ticket_priority NOT NULL DEFAULT 'NORMAL',
    assigned_to    UUID REFERENCES users(user_id),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON COLUMN support_tickets.number IS 'Référence lisible affichée à l''utilisateur (ex: TKT-00342), notamment dans les échanges WhatsApp.';
COMMENT ON COLUMN support_tickets.campaign_id IS 'Nullable : un ticket peut ne pas être lié à une campagne précise. campaign_type non dupliqué ici (déductible via jointure campaigns si besoin).';
COMMENT ON TABLE support_tickets IS 'Un ticket peut être réouvert après CLOSED (changement de statut, pas de nouvelle ligne).';

-- ---------------------------------------------------------------------
-- TicketMessage : fil de conversation
-- ---------------------------------------------------------------------
CREATE TABLE ticket_messages (
    message_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id         UUID NOT NULL REFERENCES support_tickets(ticket_id) ON DELETE CASCADE,
    author_id         UUID NOT NULL,    -- peut être visitor_id ou user_id selon l'auteur ; voir author_role
    author_role       TEXT NOT NULL,
    content           TEXT NOT NULL,
    attachments_urls  TEXT[] NOT NULL DEFAULT '{}',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON COLUMN ticket_messages.author_id IS 'Référence libre (Visitor ou User selon author_role) : pas de FK stricte car deux tables sources possibles.';

-- ---------------------------------------------------------------------
-- Notification : alerte in-app pour un utilisateur
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
    notif_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type         notif_type NOT NULL,
    title        TEXT NOT NULL,
    message      TEXT NOT NULL,
    read         BOOLEAN NOT NULL DEFAULT FALSE,
    entity_id    UUID,
    entity_type  TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON COLUMN notifications.read IS 'Passé à TRUE automatiquement quand l''utilisateur ouvre le panneau de notifications.';
COMMENT ON COLUMN notifications.entity_id IS 'Avec entity_type, relie la notification à sa campagne, ticket ou transaction source (référence libre, résolue applicativement).';

-- ---------------------------------------------------------------------
-- NotificationLog : suivi de la livraison multi-canal
-- ---------------------------------------------------------------------
CREATE TABLE notification_logs (
    log_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notif_id     UUID NOT NULL REFERENCES notifications(notif_id) ON DELETE CASCADE,
    channel      notif_channel NOT NULL,
    send_status  send_status NOT NULL DEFAULT 'PENDING',
    sent_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- MassEmailCampaign : diffusion email de masse par un admin
-- ---------------------------------------------------------------------
CREATE TABLE mass_email_campaigns (
    campaign_id_seq    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id           UUID NOT NULL REFERENCES users(user_id),
    subject            TEXT NOT NULL,
    body_html          TEXT NOT NULL,
    segment            JSONB NOT NULL,
    recipients_count   INTEGER NOT NULL DEFAULT 0,
    delivery_rate      NUMERIC(5,2),
    sent_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE mass_email_campaigns IS 'Renommée campaign_id_seq en PK car "campaign_id" est réservé conceptuellement à la table-chapeau campaigns dans ce schéma ; cette table n''est PAS une "campagne" Liboka (poll/event/...) mais une diffusion marketing admin, donc pas de FK vers campaigns ici.';

-- ---------------------------------------------------------------------
-- MassWhatsAppCampaign : diffusion WhatsApp de masse par un admin
-- ---------------------------------------------------------------------
CREATE TABLE mass_whatsapp_campaigns (
    campaign_id_seq     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id            UUID NOT NULL REFERENCES users(user_id),
    message             TEXT NOT NULL,
    segment             JSONB NOT NULL,
    recipients_count    INTEGER NOT NULL DEFAULT 0,
    green_api_status    green_api_status NOT NULL DEFAULT 'CONNECTED',
    sent_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- AuditLog : journal immuable des actions sensibles (append-only)
-- ---------------------------------------------------------------------
CREATE TABLE audit_logs (
    audit_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id      UUID NOT NULL,
    actor_role    TEXT NOT NULL,
    action_type   audit_action NOT NULL,
    entity_type   TEXT NOT NULL,
    entity_id     UUID NOT NULL,
    before_value  JSONB,
    after_value   JSONB,
    ip            TEXT,
    "timestamp"   TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE audit_logs IS 'IMMUTABLE. INSERT uniquement, AUCUN UPDATE ni DELETE jamais permis. Requis pour conformité légale et investigation anti-fraude. Conservation 5 ans minimum. Le verrou technique (REVOKE + trigger) est posé en 12_cross_fk_patch.sql une fois tous les rôles applicatifs connus.';
COMMENT ON COLUMN audit_logs.actor_id IS 'UUID d''un User (admin/organisateur) ou d''un Visitor selon actor_role. Référence libre, jamais de FK (le journal doit survivre même si l''acteur est ensuite supprimé/anonymisé).';

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs("timestamp");

-- ---------------------------------------------------------------------
-- PlatformAlert : alerte opérationnelle pour l'équipe admin
-- ---------------------------------------------------------------------
CREATE TABLE platform_alerts (
    alert_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type        alert_type NOT NULL,
    severity    severity_level NOT NULL DEFAULT 'INFO',
    message     TEXT NOT NULL,
    entity_id   UUID,
    resolved    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- AnomalyDetection : détection automatique de fraude
-- ---------------------------------------------------------------------
CREATE TABLE anomaly_detections (
    anomaly_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id       UUID REFERENCES polls(poll_id),
    type          anomaly_type NOT NULL,
    description   TEXT NOT NULL,
    occurrences   INTEGER NOT NULL DEFAULT 1,
    status        anomaly_status NOT NULL DEFAULT 'DETECTED',
    detected_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at   TIMESTAMPTZ
);
COMMENT ON TABLE anomaly_detections IS 'Règles configurables depuis le panneau admin : pic de votes >N/min depuis la même IP, paiements identiques répétés, multi-appareils sur le même visitor_id depuis >3 user-agents différents.';

COMMIT;
