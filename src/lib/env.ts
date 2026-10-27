import "server-only";
import { z } from "zod";

const FORBIDDEN_WORDS = [
  "admin",
  "administrator",
  "login",
  "dashboard",
  "owner",
  "cms",
  "panel",
  "manage",
  "wp-admin",
  "backend",
  "secure",
  "staff",
] as const;

const ADMIN_PATH_REGEX = /^[a-z0-9][a-z0-9-]{19,63}$/;

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required").optional(),
  DATABASE_URL_UNPOOLED: z.string().min(1).optional(),
  ADMIN_PATH: z
    .string()
    .refine((val) => ADMIN_PATH_REGEX.test(val), {
      message:
        "ADMIN_PATH must be 20-64 characters matching ^[a-z0-9][a-z0-9-]{19,63}$",
    })
    .refine(
      (val) => {
        const lower = val.toLowerCase();
        return !FORBIDDEN_WORDS.some((word) => lower.includes(word));
      },
      {
        message:
          "ADMIN_PATH must not contain common administrative words (e.g. admin, login, dashboard)",
      }
    )
    .optional(),
  OWNER_AREA_ENABLED: z.enum(["true", "false"]).default("false"),
  SITE_URL: z.string().url().default("http://localhost:3000"),
});

export type ServerEnv = z.infer<typeof envSchema>;

let cachedEnv: ServerEnv | null = null;

export function getEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const result = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
    ADMIN_PATH: process.env.ADMIN_PATH,
    OWNER_AREA_ENABLED: process.env.OWNER_AREA_ENABLED,
    SITE_URL: process.env.SITE_URL || "http://localhost:3000",
  });

  if (!result.success) {
    // Redact any actual values to prevent leaking secrets in error messages/logs
    const issues = result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    throw new Error(
      `Environment validation failed: ${JSON.stringify(issues)} (Values redacted for security)`
    );
  }

  cachedEnv = result.data;
  return cachedEnv;
}

export function getRequiredAdminPath(): string {
  const env = getEnv();
  if (!env.ADMIN_PATH) {
    throw new Error(
      "ADMIN_PATH environment variable is not defined or is invalid. Set ADMIN_PATH in .env.local."
    );
  }
  return env.ADMIN_PATH;
}

export const env = getEnv;
