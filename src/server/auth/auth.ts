import { betterAuth, APIError } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { twoFactor } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { getDb, schema } from "@/src/db/client";
import {
  SESSION_IDLE_EXPIRES_IN_SECONDS,
  SESSION_UPDATE_AGE_SECONDS,
  SESSION_FRESH_AGE_SECONDS,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  TWO_FACTOR_ISSUER,
} from "./policy";
import { getRequiredAuthSecret } from "@/src/lib/env";

const db = getDb();

if (!db) {
  throw new Error(
    "Database connection is not initialized. Please verify DATABASE_URL is set."
  );
}

const secret = getRequiredAuthSecret();
const baseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

export const auth = betterAuth({
  secret,
  baseURL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "owner",
        input: false,
      },
    },
  },
  session: {
    expiresIn: SESSION_IDLE_EXPIRES_IN_SECONDS,
    updateAge: SESSION_UPDATE_AGE_SECONDS,
    freshAge: SESSION_FRESH_AGE_SECONDS,
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: PASSWORD_MIN_LENGTH,
    maxPasswordLength: PASSWORD_MAX_LENGTH,
    disableSignUp: true, // Defense-in-depth: disable public sign up
  },
  rateLimit: {
    storage: "database",
    modelName: "rateLimit",
  },
  trustedOrigins: [
    baseURL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    cookies: {
      sessionToken: {
        attributes: {
          sameSite: "strict",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        },
      },
    },
  },
  hooks: {
    before: async (ctx) => {
      // Disallow any sign-up attempts as defense-in-depth
      const path = (ctx as { path?: string }).path;
      if (
        typeof path === "string" &&
        (path === "/sign-up/email" || path.startsWith("/sign-up"))
      ) {
        throw new APIError("FORBIDDEN", {
          message: "Public registration is disabled.",
        });
      }
    },
  },
  plugins: [
    twoFactor({
      issuer: TWO_FACTOR_ISSUER,
      skipVerificationOnEnable: false,
      accountLockout: {
        enabled: true,
        maxFailedAttempts: 5,
        durationSeconds: 15 * 60,
      },
    }),
    nextCookies(),
  ],
});
