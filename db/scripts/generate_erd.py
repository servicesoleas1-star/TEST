"""
generate_erd.py — Génère des fichiers Mermaid erDiagram par domaine logique,
à partir de l'extraction réelle du schéma (schema_extract.json), pour
garantir que les ERD livrés correspondent exactement au SQL exécuté.
"""
import json

with open("/home/claude/liboka-vote-db/docs/schema_extract.json") as f:
    data = json.load(f)

tables = data["tables"]
fks = data["foreign_keys"]

# Regroupement par domaine logique (correspond aux migrations)
DOMAINS = {
    "01_identity_session": ["visitors", "public_sessions", "public_actions", "gdpr_consents", "rate_limits"],
    "02_auth_users": ["users", "user_preferences", "user_sessions", "tokens", "two_fa", "login_logs",
                       "admin_permissions", "acquisition_sources", "influencers"],
    "03_campaigns_core": ["campaigns"],
    "04_polls_votes": ["polls", "candidate_categories", "candidates", "votes", "anti_duplicates",
                        "vote_otps", "unique_codes", "jury_sessions", "jury_scores", "weighted_scores",
                        "closing_reports", "poll_news", "poll_galleries", "poll_partners", "poll_faqs",
                        "poll_notices", "poll_reports"],
    "05_events_ticketing": ["events", "event_venues", "ticket_types", "promo_codes", "ticket_purchases",
                             "temporary_reservations", "entry_scans", "program_sessions", "speakers",
                             "event_sponsors", "merch_items", "merch_purchases", "event_galleries",
                             "event_resources", "event_reports"],
    "06_donations_crowdfunding": ["fundraisers", "donations", "fundraiser_comments", "fundraiser_updates",
                                   "cf_projects", "tiers", "tier_options", "cf_contributions",
                                   "cf_team_members", "cf_updates", "cf_questions", "cf_comments"],
    "07_sponsorship_lottery_contest": ["sponsor_calls", "sponsorship_levels", "sponsor_applications",
                                        "contests", "prizes", "contest_participants", "submissions",
                                        "bracket_matches", "escrow_deposits", "prize_payments",
                                        "lotteries", "lottery_tickets", "lottery_draws"],
    "08_design_customization": ["page_configs", "blocks", "brand_settings", "custom_domains",
                                 "design_templates", "ticket_designs", "ia_credits", "ia_generations",
                                 "ia_credit_packs"],
    "09_finance_payments": ["transactions", "user_commission_configs", "commission_configs",
                             "payout_requests", "organizer_balances", "aggregators",
                             "aggregator_health_logs", "failover_logs", "webhook_logs",
                             "psp_reconciliations", "country_configs", "minimum_payout_configs",
                             "payout_blocks", "refund_policies"],
    "10_support_notifications_audit": ["support_tickets", "ticket_messages", "notifications",
                                        "notification_logs", "mass_email_campaigns",
                                        "mass_whatsapp_campaigns", "audit_logs", "platform_alerts",
                                        "anomaly_detections"],
    "11_backoffice_config": ["site_configs", "global_faqs", "feature_flags", "maintenance_modes",
                              "kpi_snapshots", "canned_replies", "system_email_templates",
                              "legal_pages", "language_configs"],
}

def mermaid_type(pg_type):
    mapping = {
        "uuid": "uuid", "character varying": "string", "text": "string",
        "boolean": "boolean", "integer": "int", "numeric": "decimal",
        "timestamp with time zone": "timestamp", "date": "date", "jsonb": "json",
        "ARRAY": "array", "citext": "string",
    }
    if pg_type in mapping:
        return mapping[pg_type]
    # Types ENUM personnalisés (ex: poll_status, user_role...) : on les garde
    # tels quels, mais Mermaid n'accepte ni espace ni tiret dans un nom de type.
    return pg_type.replace(" ", "_").replace("-", "_")

def sanitize(name):
    return name.upper()

ESSENTIAL_SUFFIXES = ("_id", "status", "type", "code", "name", "title", "slug", "email", "amount", "role")

def is_essential_column(col, is_pk_or_fk):
    if is_pk_or_fk:
        return True
    cname = col["name"].lower()
    return any(cname == s or cname.endswith(s) for s in ESSENTIAL_SUFFIXES)

def build_domain_file(domain_name, table_list, max_cols=10):
    lines = ["erDiagram"]
    table_set = set(table_list)

    # Relations (uniquement entre tables du même domaine, pour rester lisible)
    seen_rels = set()
    for fk in fks:
        src, tgt = fk["source_table"], fk["target_table"]
        if src in table_set and tgt in table_set and src != tgt:
            rel_key = (src, tgt)
            if rel_key in seen_rels:
                continue
            seen_rels.add(rel_key)
            lines.append(f'  {sanitize(tgt)} ||--o{{ {sanitize(src)} : "{fk["source_col"]}"')

    # Définition des tables : on garde PK/FK toujours, puis on complète avec
    # les colonnes "essentielles" (status, type, name...) jusqu'à max_cols,
    # pour garder chaque table lisible même si elle a 20+ colonnes en réalité.
    for t in table_list:
        if t not in tables:
            continue
        lines.append(f"  {sanitize(t)} {{")
        cols_shown = 0
        for col in tables[t]:
            if cols_shown >= max_cols:
                lines.append(f"    string _more_columns_omitted")
                break
            ctype = mermaid_type(col["type"])
            cname = col["name"]
            tag = "PK" if col["pk"] else ""
            is_fk = any(f["source_table"] == t and f["source_col"] == cname for f in fks)
            if is_fk and not tag:
                tag = "FK"
            if not is_essential_column(col, bool(tag)):
                continue
            line = f"    {ctype} {cname}"
            if tag:
                line += f" {tag}"
            lines.append(line)
            cols_shown += 1
        lines.append("  }")

    return "\n".join(lines)

import os
os.makedirs("/home/claude/liboka-vote-db/docs/erd", exist_ok=True)

for domain, table_list in DOMAINS.items():
    content = build_domain_file(domain, table_list)
    path = f"/home/claude/liboka-vote-db/docs/erd/{domain}.mmd"
    with open(path, "w") as f:
        f.write(content)
    print(f"Généré : {path} ({len(table_list)} tables)")

# Vue d'ensemble : uniquement les tables "campagne" + campaigns + transactions
# (le coeur du schéma, pour une vue globale lisible)
overview_tables = ["campaigns", "polls", "events", "fundraisers", "cf_projects",
                    "lotteries", "contests", "sponsor_calls", "transactions", "users"]
content = build_domain_file("overview", overview_tables)
with open("/home/claude/liboka-vote-db/docs/erd/00_overview.mmd", "w") as f:
    f.write(content)
print("Généré : 00_overview.mmd (vue d'ensemble du coeur du schéma)")
