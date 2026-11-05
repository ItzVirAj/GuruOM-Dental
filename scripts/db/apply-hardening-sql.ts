import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { Pool } from "@neondatabase/serverless";

async function applyHardeningSql() {
  const connectionString =
    process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("[ERROR] No database connection string.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString });

  try {
    console.log("Applying security definitions and purge function...");

    // 1. Create purge_old_logs function
    await pool.query(`
      CREATE OR REPLACE FUNCTION purge_old_logs(p_days integer)
      RETURNS integer
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $$
      DECLARE
        v_cutoff timestamp with time zone;
        v_count integer := 0;
        v_last_purged RECORD;
        v_latest_tip RECORD;
        v_checkpoint_hash varchar(64);
      BEGIN
        v_cutoff := now() - (p_days || ' days')::interval;

        -- Find the latest record that falls in the purge window
        SELECT id, row_hash, created_at INTO v_last_purged
        FROM audit_log
        WHERE created_at < v_cutoff AND action != 'checkpoint_purge'
        ORDER BY created_at DESC
        LIMIT 1;

        IF FOUND THEN
          -- Get current tip of the audit log chain
          SELECT row_hash INTO v_latest_tip
          FROM audit_log
          ORDER BY created_at DESC
          LIMIT 1;

          -- Compute checkpoint row_hash
          v_checkpoint_hash := encode(sha256((
            COALESCE(v_latest_tip.row_hash, repeat('0', 64)) ||
            '{"action":"checkpoint_purge","entity_type":"audit_log","summary":"Purged logs older than ' || p_days || ' days","last_purged_hash":"' || v_last_purged.row_hash || '"}'
          )::bytea), 'hex');

          -- Insert cryptographic checkpoint row
          INSERT INTO audit_log (
            action,
            entity_type,
            summary,
            diff,
            prev_hash,
            row_hash,
            created_at
          ) VALUES (
            'checkpoint_purge',
            'audit_log',
            'Purged audit logs older than ' || p_days || ' days up to checkpoint',
            jsonb_build_object('last_purged_hash', v_last_purged.row_hash, 'purged_up_to', v_last_purged.created_at),
            COALESCE(v_latest_tip.row_hash, repeat('0', 64)),
            v_checkpoint_hash,
            now()
          );

          -- Delete logs older than cutoff (except checkpoints)
          WITH deleted AS (
            DELETE FROM audit_log
            WHERE created_at < v_cutoff AND action != 'checkpoint_purge'
            RETURNING 1
          )
          SELECT count(*) INTO v_count FROM deleted;

          DELETE FROM security_events
          WHERE created_at < v_cutoff;
        END IF;

        RETURN v_count;
      END;
      $$;
    `);

    // 2. Grant permissions if guruom_app exists
    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'guruom_app') THEN
          -- Set statement_timeout on guruom_app
          ALTER ROLE guruom_app SET statement_timeout = '5s';

          -- Grant DML on application tables
          GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE rate_limits TO guruom_app;
          GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE post_working_copies TO guruom_app;
          GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE post_slug_history TO guruom_app;
          GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE post_revisions TO guruom_app;
          GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE posts TO guruom_app;
          GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE categories TO guruom_app;
          GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE tags TO guruom_app;
          GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE post_tags TO guruom_app;
          GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "user" TO guruom_app;
          GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE session TO guruom_app;
          GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE account TO guruom_app;
          GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE two_factor TO guruom_app;
          GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE account_lockouts TO guruom_app;
          GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE media TO guruom_app;
          GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE post_media TO guruom_app;
          GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE media_deletions TO guruom_app;
          
          -- Append-only for audit_log and security_events: no UPDATE, no DELETE
          GRANT SELECT, INSERT ON TABLE audit_log TO guruom_app;
          REVOKE UPDATE, DELETE ON TABLE audit_log FROM guruom_app;

          GRANT SELECT, INSERT ON TABLE security_events TO guruom_app;
          REVOKE UPDATE, DELETE ON TABLE security_events FROM guruom_app;

          -- Grant execute on purge function
          GRANT EXECUTE ON FUNCTION purge_old_logs(integer) TO guruom_app;
        END IF;
      END
      $$;
    `);

    console.log("[SUCCESS] Hardening SQL and purge_old_logs installed successfully!");
  } catch (err) {
    console.error("[ERROR] Failed to apply hardening SQL:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

applyHardeningSql();
