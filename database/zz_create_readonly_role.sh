#!/bin/sh
set -eu
# Called by the official PostgreSQL image only when initializing an empty volume.
# Credentials come exclusively from the private Docker Compose environment.
: "${APP_DB_USER:?APP_DB_USER is required}"
: "${APP_DB_PASSWORD:?APP_DB_PASSWORD is required}"

psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v ON_ERROR_STOP=1 \
  -v runtime_user="$APP_DB_USER" \
  -v runtime_password="$APP_DB_PASSWORD" <<'SQL'
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'runtime_user', :'runtime_password')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'runtime_user')
\gexec
SELECT format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), :'runtime_user')
\gexec
SELECT format('GRANT USAGE ON SCHEMA public TO %I', :'runtime_user')
\gexec
SELECT format('GRANT SELECT ON ALL TABLES IN SCHEMA public TO %I', :'runtime_user')
\gexec
SQL
