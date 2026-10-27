import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import path from "node:path";

async function runMigrate() {
  const connectionString =
    process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

  if (
    !connectionString ||
    connectionString.includes("REPLACE_WITH_") ||
    connectionString.includes("ep-sample")
  ) {
    console.error(
      "\n[ERROR] DATABASE_URL_UNPOOLED is not configured in .env.local.\n" +
        "Please follow the setup steps in docs/neon-setup.md to configure your database connection string.\n"
    );
    process.exit(1);
  }

  console.log("Connecting with database owner role to run migrations...");
  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  try {
    const migrationsFolder = path.resolve(process.cwd(), "drizzle");
    console.log(`Applying migrations from ${migrationsFolder}...`);
    await migrate(db, { migrationsFolder });
    console.log("[SUCCESS] Migrations applied successfully!");
  } catch (error) {
    console.error(
      "[ERROR] Migration failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrate();
