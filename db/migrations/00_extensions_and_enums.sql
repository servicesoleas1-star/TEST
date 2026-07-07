-- =====================================================================
-- 00_extensions_and_enums.sql
-- Liboka Vote / Moledi Events — Fondations : extensions + types ENUM
-- =====================================================================
-- Ce fichier doit être exécuté EN PREMIER, avant toute table.
-- Il ne dépend de rien.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- Extensions PostgreSQL
-- ---------------------------------------------------------------------
-- gen_random_uuid() pour générer les clés primaires UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- citext : emails insensibles à la casse (évite les doublons "A@x.com" / "a@x.com")
CREATE EXTENSION IF NOT EXISTS "citext";
-- pg_trgm : recherche texte performante (slug, full_name, title...) via index GIN
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ---------------------------------------------------------------------
-- DC-01 — Identity & Session
-- ---------------------------------------------------------------------
CREATE TYPE action_type AS ENUM (
    'VOTE','TICKET_PURCHASE','DONATION','CF_CONTRIBUTION',
    'CONTEST_ENTRY','LOTTERY_TICKET'
);
CREATE TYPE action_status AS ENUM (
    'PENDING','CONFIRMED','FAILED','EXPIRED','REFUNDED'
);

-- ---------------------------------------------------------------------
-- DC-02 — Authentication & Users
-- ---------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('ORGANIZER','ADMIN','SUPER_ADMIN');
CREATE TYPE user_status AS ENUM ('ACTIVE','SUSPENDED','DELETED');
CREATE TYPE token_type AS ENUM (
    'EMAIL_VERIFICATION','PASSWORD_RESET','JURY_INVITATION',
    'ADMIN_INVITATION','TWO_FA_OTP'
);
CREATE TYPE two_fa_type AS ENUM ('TOTP','EMAIL_OTP');
CREATE TYPE language_code AS ENUM ('FR','EN');
CREATE TYPE newsletter_freq AS ENUM ('INSTANT','DAILY','WEEKLY','NEVER');
CREATE TYPE source_type AS ENUM (
    'SOCIAL_NETWORK','INFLUENCER','EVENT','ADVERTISING','OTHER'
);

-- ---------------------------------------------------------------------
-- DC-03 — Polls & Votes
-- ---------------------------------------------------------------------
CREATE TYPE vote_type AS ENUM (
    'FREE_VISITOR_ID','FREE_EMAIL','FREE_PHONE','FREE_SMS','FREE_WHATSAPP',
    'PAID','ADSENSE','UNIQUE_CODE','JURY_WEIGHTED'
);
CREATE TYPE poll_status AS ENUM (
    'DRAFT','PENDING_VALIDATION','PUBLISHED','OPEN','SUSPENDED',
    'CLOSED','CANCELLED','REJECTED'
);
CREATE TYPE vote_status AS ENUM ('COUNTED','NOT_COUNTED','CANCELLED','REFUNDED');
CREATE TYPE anti_dup_method AS ENUM (
    'VISITOR_ID','EMAIL','PHONE','SMS_OTP','WHATSAPP_OTP','UNIQUE_CODE'
);
CREATE TYPE code_status AS ENUM ('UNUSED','USED','CANCELLED');
CREATE TYPE otp_channel AS ENUM ('SMS','WHATSAPP');
CREATE TYPE results_visibility AS ENUM ('PUBLIC','HIDDEN','AFTER_CLOSE');
CREATE TYPE media_type AS ENUM ('PHOTO','VIDEO');
CREATE TYPE gallery_tag AS ENUM ('BEFORE','DURING','AFTER');
CREATE TYPE notice_type AS ENUM ('ANNOUNCEMENT','POPUP');
CREATE TYPE poll_complaint_type AS ENUM (
    'VOTE_NOT_COUNTED','PAYMENT_WITHOUT_VOTE','DUPLICATE_VOTE',
    'TECHNICAL','WRONG_INFO','SUSPECTED_FRAUD','MISSING_CANDIDATE',
    'WRONG_SCORE','OTHER'
);

-- ---------------------------------------------------------------------
-- DC-04 — Events & Ticketing
-- ---------------------------------------------------------------------
CREATE TYPE event_status AS ENUM (
    'DRAFT','PENDING','PUBLISHED','UPCOMING','ONGOING','ENDED',
    'SUSPENDED','CANCELLED'
);
CREATE TYPE event_mode AS ENUM ('TICKETING','SHOWCASE','REGISTRATION_FORM');
CREATE TYPE ticket_category AS ENUM (
    'FREE','STANDARD','VIP','EARLY_BIRD','PROMO_CODE','GROUP_PACK'
);
CREATE TYPE ticket_status AS ENUM ('VALID','USED','CANCELLED','REFUNDED');
CREATE TYPE delivery_channel AS ENUM ('EMAIL','WHATSAPP');
CREATE TYPE sponsor_level AS ENUM ('PLATINUM','GOLD','SILVER','BRONZE','MEDIA_PARTNER');
CREATE TYPE resource_access AS ENUM ('FREE','AFTER_TICKET','AFTER_REGISTRATION');
CREATE TYPE scan_method AS ENUM ('CAMERA','MANUAL_ENTRY');
CREATE TYPE scan_result AS ENUM ('VALID','ALREADY_USED','INVALID');
CREATE TYPE event_complaint_type AS ENUM (
    'TICKET_NOT_RECEIVED','INVALID_QR','REFUND_ISSUE','ENTRY_PROBLEM',
    'WRONG_INFO','OTHER'
);

-- ---------------------------------------------------------------------
-- DC-05 — Donations & Crowdfunding
-- ---------------------------------------------------------------------
CREATE TYPE fundraiser_status AS ENUM ('DRAFT','PENDING','ACTIVE','CLOSED','CANCELLED');
CREATE TYPE donation_status AS ENUM ('PENDING','CONFIRMED','CANCELLED','REFUNDED');
CREATE TYPE cf_status AS ENUM (
    'DRAFT','PENDING','ACTIVE','GOAL_REACHED','CLOSED_SUCCESS',
    'CLOSED_FAILED','CANCELLED'
);
CREATE TYPE contrib_status AS ENUM ('PENDING','CONFIRMED','CANCELLED','REFUNDED');
CREATE TYPE comment_status AS ENUM ('VISIBLE','HIDDEN','DELETED');

-- ---------------------------------------------------------------------
-- DC-06 — Sponsorship, Lotteries & Contests
-- ---------------------------------------------------------------------
CREATE TYPE call_status AS ENUM ('ACTIVE','CLOSED');
CREATE TYPE level_name AS ENUM ('PLATINUM','GOLD','SILVER','BRONZE');
CREATE TYPE app_status AS ENUM ('PENDING','APPROVED','REJECTED');
CREATE TYPE contest_format AS ENUM ('SUBMISSION','QUIZ','BRACKET','OTHER');
CREATE TYPE contest_status AS ENUM ('DRAFT','ACTIVE','ONGOING','ENDED','CANCELLED');
CREATE TYPE registration_mode AS ENUM ('AUTO','MANUAL');
CREATE TYPE participant_status AS ENUM ('REGISTERED','QUALIFIED','ELIMINATED','WINNER');
CREATE TYPE escrow_status AS ENUM ('LOCKED','RELEASED','REFUNDED');
CREATE TYPE payout_status AS ENUM ('PENDING','COMPLETED','FAILED');
CREATE TYPE draw_mode AS ENUM ('AUTO','MANUAL');
CREATE TYPE lottery_status AS ENUM ('ACTIVE','CLOSED','CANCELLED');
CREATE TYPE lottery_ticket_status AS ENUM ('PENDING_DRAW','WINNER','NON_WINNER');

-- ---------------------------------------------------------------------
-- DC-07 — Design & Customization
-- ---------------------------------------------------------------------
CREATE TYPE block_type AS ENUM (
    'BANNER','RICH_TEXT','IMAGE','GALLERY','VIDEO','COUNTDOWN',
    'CANDIDATES','SCHEDULE','TESTIMONIALS','CTA_BUTTON','SPACER',
    'DIVIDER','QR_CODE'
);
CREATE TYPE dns_status AS ENUM ('PENDING','VERIFIED','ERROR');

-- ---------------------------------------------------------------------
-- DC-08 — Finance & Payments
-- ---------------------------------------------------------------------
CREATE TYPE tx_type AS ENUM (
    'VOTE','TICKET','DONATION','CF_CONTRIBUTION','LOTTERY_TICKET',
    'CONTEST_ENTRY','ESCROW_DEPOSIT','IA_CREDITS','DOMAIN','SPONSORSHIP'
);
CREATE TYPE tx_status AS ENUM (
    'INITIATED','PENDING','CONFIRMED','FAILED','EXPIRED',
    'REFUNDED','REFUND_FAILED'
);
CREATE TYPE payment_method AS ENUM ('MOBILE_MONEY','CARD','PAYPAL');
CREATE TYPE agg_status AS ENUM ('OPERATIONAL','DEGRADED','DOWN');
CREATE TYPE commission_type AS ENUM (
    'VOTE','TICKET','DONATION','CF','CONTEST','LOTTERY',
    'ESCROW_FEE','ADSENSE_SHARE'
);

-- ---------------------------------------------------------------------
-- DC-09 — Support, Notifications & Audit
-- ---------------------------------------------------------------------
CREATE TYPE ticket_subject AS ENUM (
    'VOTE','TICKET','PAYMENT','REFUND','FRAUD','TECHNICAL','OTHER'
);
CREATE TYPE support_ticket_status AS ENUM ('OPEN','IN_PROGRESS','RESOLVED','CLOSED');
CREATE TYPE ticket_priority AS ENUM ('LOW','NORMAL','HIGH','CRITICAL');
CREATE TYPE notif_type AS ENUM (
    'ADMIN_MESSAGE','CAMPAIGN_VALIDATED','CAMPAIGN_REJECTED',
    'CAMPAIGN_SUSPENDED','CAMPAIGN_CLOSED','MILESTONE_REACHED',
    'PAYMENT_CONFIRMED','PAYOUT_COMPLETED','PAYOUT_FAILED',
    'TICKET_REPLIED','GOAL_REACHED'
);
CREATE TYPE notif_channel AS ENUM ('EMAIL','WHATSAPP','IN_APP');
CREATE TYPE send_status AS ENUM ('SENT','FAILED','PENDING');
CREATE TYPE green_api_status AS ENUM ('CONNECTED','DISCONNECTED');
CREATE TYPE audit_action AS ENUM (
    'CREATE','UPDATE','DELETE','VALIDATE','REJECT','SUSPEND','CLOSE',
    'CANCEL','BLOCK','UNBLOCK','LOGIN','PAYMENT','REFUND','PAYOUT',
    'CONFIG_CHANGE'
);
CREATE TYPE alert_type AS ENUM (
    'LONG_PENDING_TX','AGGREGATOR_DOWN','GREEN_API_DOWN',
    'SUSPICIOUS_VOTES','HIGH_FAILURE_RATE','RECONCILIATION_GAP'
);
CREATE TYPE severity_level AS ENUM ('INFO','WARNING','CRITICAL');
CREATE TYPE anomaly_type AS ENUM (
    'VOTE_SPIKE','IDENTICAL_PAYMENTS','MULTIPLE_DEVICES','ABNORMAL_RHYTHM'
);
CREATE TYPE anomaly_status AS ENUM (
    'DETECTED','UNDER_INVESTIGATION','RESOLVED','FALSE_POSITIVE'
);

-- ---------------------------------------------------------------------
-- DC-10 — Back-office & Global Config
-- ---------------------------------------------------------------------
CREATE TYPE faq_type AS ENUM (
    'HOW_IT_WORKS','POLL_TEMPLATE','EVENT_TEMPLATE','DONATION_TEMPLATE',
    'CF_TEMPLATE','CONTEST_TEMPLATE','LOTTERY_TEMPLATE'
);
CREATE TYPE legal_type AS ENUM ('TERMS','SALES_TERMS','LEGAL_NOTICE','COOKIES','PRIVACY');
CREATE TYPE kpi_type AS ENUM (
    'MAU','ORGANIZER_RETENTION','CONVERSION_RATE','MEDIAN_VOTE_TIME',
    'MONTHLY_PAID_VOTES','GROSS_REVENUE','MOLEDI_COMMISSION',
    'PAYMENT_FAILURE_RATE','RECONCILIATION_RATE','UPTIME','AVG_PAYOUT_DELAY'
);

-- ---------------------------------------------------------------------
-- Table-chapeau "campaigns" (cf. décision de conception : CTI)
-- ---------------------------------------------------------------------
-- Regroupe TOUS les types de campagne pour permettre des FK réelles
-- depuis Transaction, SupportTicket, PageConfig, EscrowDeposit, etc.
CREATE TYPE campaign_type AS ENUM (
    'POLL','EVENT','FUNDRAISER','CF_PROJECT','LOTTERY','CONTEST','SPONSOR_CALL'
);

COMMIT;
