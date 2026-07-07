#!/usr/bin/env bash
# =====================================================================
# setup_db.sh — Crée la base et exécute toutes les migrations dans l'ordre
# =====================================================================
# Usage :
#   ./scripts/setup_db.sh [nom_base]
#
# Variables d'environnement supportées (valeurs par défaut entre parenthèses) :
#   PGHOST     (localhost)
#   PGPORT     (5432)
#   PGUSER     (postgres)
#   PGPASSWORD (à fournir, ou utiliser ~/.pgpass / peer auth)
#
# Le script est idempotent au sens "échoue proprement" : si la base
# existe déjà, il propose de la recréer plutôt que d'écraser silencieusement.
# =====================================================================
set -euo pipefail

DB_NAME="${1:-liboka_vote}"
MIGRATIONS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../migrations" && pwd)"

echo "=== Liboka Vote / Moledi Events — Setup base de données ==="
echo "Base cible : ${DB_NAME}"
echo "Dossier migrations : ${MIGRATIONS_DIR}"
echo

# Vérifie si la base existe déjà
if psql -lqt | cut -d '|' -f 1 | grep -qw "${DB_NAME}"; then
  read -r -p "La base '${DB_NAME}' existe déjà. La supprimer et recréer ? [y/N] " confirm
  if [[ "${confirm}" =~ ^[Yy]$ ]]; then
    dropdb "${DB_NAME}"
  else
    echo "Annulé. Choisissez un autre nom ou supprimez la base manuellement."
    exit 1
  fi
fi

createdb "${DB_NAME}"
echo "Base '${DB_NAME}' créée."
echo

for f in "${MIGRATIONS_DIR}"/*.sql; do
  echo ">>> Exécution de $(basename "${f}")"
  psql -d "${DB_NAME}" -v ON_ERROR_STOP=1 -f "${f}"
done

echo
echo "=== Migrations terminées avec succès ==="
echo "Pour valider les règles métier, lancez : psql -d ${DB_NAME} -f scripts/run_integrity_tests.sql"
echo "Pour charger des données de démonstration : psql -d ${DB_NAME} -f seeds/seed_demo.sql"
