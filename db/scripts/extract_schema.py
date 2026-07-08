"""
extract_schema.py — Extrait tables/colonnes/FK depuis information_schema
pour générer un ERD fidèle au schéma réellement créé (pas une transcription
manuelle qui pourrait diverger du SQL exécuté).
"""
import psycopg2
import json

conn = psycopg2.connect(host="localhost", dbname="liboka_vote_erd", user="postgres", password="postgres")
cur = conn.cursor()

# Tables + colonnes (PK marquée)
cur.execute("""
    SELECT t.table_name, c.column_name,
           CASE WHEN c.data_type = 'USER-DEFINED' THEN c.udt_name ELSE c.data_type END AS dtype,
           c.is_nullable,
           CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END AS is_pk
    FROM information_schema.tables t
    JOIN information_schema.columns c ON c.table_name = t.table_name AND c.table_schema='public'
    LEFT JOIN (
        SELECT kcu.table_name, kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema='public'
    ) pk ON pk.table_name = t.table_name AND pk.column_name = c.column_name
    WHERE t.table_schema='public'
    ORDER BY t.table_name, c.ordinal_position;
""")
tables = {}
for table_name, col_name, dtype, nullable, is_pk in cur.fetchall():
    tables.setdefault(table_name, []).append({
        "name": col_name, "type": dtype, "nullable": nullable == 'YES', "pk": is_pk
    })

# Foreign keys
cur.execute("""
    SELECT
        tc.table_name AS source_table,
        kcu.column_name AS source_col,
        ccu.table_name AS target_table,
        ccu.column_name AS target_col
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public';
""")
fks = [{"source_table": r[0], "source_col": r[1], "target_table": r[2], "target_col": r[3]} for r in cur.fetchall()]

with open("/home/claude/liboka-vote-db/docs/schema_extract.json", "w") as f:
    json.dump({"tables": tables, "foreign_keys": fks}, f, indent=2)

print(f"Extrait : {len(tables)} tables, {len(fks)} foreign keys.")
cur.close()
conn.close()
