#!/usr/bin/env bash
# =====================================================================
#  Provision a dedicated, isolated automation test database.
#  Usage:  sudo bash scripts/db/provision.sh
#  Idempotent: safe to re-run (recreates schema + seed each time).
# =====================================================================
set -euo pipefail

DB_NAME="${DB_NAME:-automation_db}"
DB_USER="${DB_USER:-automation_user}"
DB_PASS="${DB_PASS:-changeme}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> Creating role '${DB_USER}' (if absent)"
sudo -u postgres psql -v ON_ERROR_STOP=1 -c \
  "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='${DB_USER}') THEN CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}'; END IF; END \$\$;"

echo "==> Creating database '${DB_NAME}' (if absent)"
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
fi

echo "==> Applying schema + seed"
sudo -u postgres psql -v ON_ERROR_STOP=1 -d "${DB_NAME}" -f "${SCRIPT_DIR}/schema.sql"

echo "==> Granting privileges to '${DB_USER}'"
sudo -u postgres psql -v ON_ERROR_STOP=1 -d "${DB_NAME}" -c \
  "GRANT ALL ON SCHEMA public TO ${DB_USER}; GRANT ALL ON ALL TABLES IN SCHEMA public TO ${DB_USER}; GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO ${DB_USER};"

echo "✓ Done. ${DB_USER}@localhost:5432/${DB_NAME} is ready."
