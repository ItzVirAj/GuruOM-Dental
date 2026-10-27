-- ==============================================================================
-- Least-Privilege Application Role for GuruOm Dental
-- ==============================================================================
-- Run this script in the Neon SQL Console as the default database owner (neondb_owner).
--
-- Security Rationale (Principle of Least Privilege):
-- The web application runs in production using this restricted 'guruom_app' role.
-- By restricting this role strictly to DML operations (SELECT, INSERT, UPDATE, DELETE)
-- and revoking CREATE / ALTER / DROP permissions on the schema, even if the web server's
-- runtime credentials or connection string are leaked or compromised, an attacker
-- cannot DROP tables, ALTER schemas, or execute administrative commands.
-- Administrative migrations are executed exclusively via DATABASE_URL_UNPOOLED
-- with the owner role.
-- ==============================================================================

-- 1. Create limited application user role (replace placeholder password before executing)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'guruom_app') THEN
    CREATE ROLE guruom_app WITH LOGIN PASSWORD 'REPLACE_WITH_STRONG_APPLICATION_PASSWORD' NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
  ELSE
    ALTER ROLE guruom_app WITH PASSWORD 'REPLACE_WITH_STRONG_APPLICATION_PASSWORD';
  END IF;
END
$$;

-- 2. Allow connection and schema usage
GRANT CONNECT ON DATABASE neondb TO guruom_app;
GRANT USAGE ON SCHEMA public TO guruom_app;

-- 3. Grant DML (Data Manipulation Language) on all existing tables in schema public
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO guruom_app;

-- 4. Grant usage on all existing sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO guruom_app;

-- 5. Ensure future tables created by migrations automatically grant DML to guruom_app
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO guruom_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO guruom_app;

-- 6. Explicitly ensure no table creation or alteration rights exist on schema public
REVOKE CREATE ON SCHEMA public FROM guruom_app;
