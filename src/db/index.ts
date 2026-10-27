import "server-only";
import { neon, Pool } from "@neondatabase/serverless";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzleWs } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

// Cache HTTP drizzle instance
let httpDbInstance: ReturnType<typeof drizzleHttp<typeof schema>> | null = null;

function getConnectionString(): string | null {
  const url = process.env.DATABASE_URL;
  if (!url || url.includes("REPLACE_WITH_") || url.includes("ep-sample-pooler")) {
    return null;
  }
  return url;
}

/**
 * Returns the Drizzle ORM client using Neon's HTTP driver.
 * Ideal for serverless read queries and standard web requests with zero connection overhead.
 */
export function getDb() {
  const connectionString = getConnectionString();
  if (!connectionString) {
    return null;
  }

  if (!httpDbInstance) {
    const sql = neon(connectionString);
    httpDbInstance = drizzleHttp(sql, { schema });
  }

  return httpDbInstance;
}

/**
 * Returns a Drizzle ORM client using Neon's WebSocket Pool driver.
 * Use this when interactive database transactions (e.g. tx.rollback()) or stateful sessions are needed.
 */
export function getTransactionDb(unpooledUrl?: string) {
  const url = unpooledUrl || process.env.DATABASE_URL_UNPOOLED || getConnectionString();
  if (!url || url.includes("REPLACE_WITH_") || url.includes("ep-sample")) {
    return null;
  }

  const pool = new Pool({ connectionString: url });
  return {
    db: drizzleWs(pool, { schema }),
    pool,
  };
}

export { schema };
