if (typeof window !== "undefined") {
  throw new Error("server-env: This module must not be imported in client-side code");
}
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
  DATABASE_URL: z
    .string()
    .min(1)
    .refine(
      (val) => val.includes("sslmode=require"),
      { message: "DATABASE_URL must mandate SSL connection (sslmode=require)" }
    )
    .optional(),
  DATABASE_URL_UNPOOLED: z
    .string()
    .min(1)
    .refine(
      (val) => val.includes("sslmode=require"),
      { message: "DATABASE_URL_UNPOOLED must mandate SSL connection (sslmode=require)" }
    )
    .optional(),
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
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters long")
    .optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  CRON_SECRET: z.string().min(32).optional(),
  CSP_MODE: z.enum(["report-only", "enforce"]).default("report-only"),
  BACKUP_PASSPHRASE: z.string().min(8).optional(),
  TRASH_PURGE_DAYS: z.string().optional(),
  TURNSTILE_SITE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_FOLDER: z.string().default(process.env.NODE_ENV === "production" ? "guruom" : "guruom-dev"),
  UPLOAD_MAX_BYTES: z.coerce.number().default(4194304),
  MEDIA_LIBRARY_MAX_BYTES: z.coerce.number().default(314572800),
  DAILY_UPLOAD_LIMIT: z.coerce.number().default(200),
});

export type ServerEnv = z.infer<typeof envSchema>;

let cachedEnv: ServerEnv | null = null;

export function getEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const siteUrl = process.env.SITE_URL || "http://localhost:3000";

  const result = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
    ADMIN_PATH: process.env.ADMIN_PATH,
    OWNER_AREA_ENABLED: process.env.OWNER_AREA_ENABLED,
    SITE_URL: siteUrl,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || siteUrl,
    TURNSTILE_SITE_KEY: process.env.TURNSTILE_SITE_KEY,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER,
    UPLOAD_MAX_BYTES: process.env.UPLOAD_MAX_BYTES,
    MEDIA_LIBRARY_MAX_BYTES: process.env.MEDIA_LIBRARY_MAX_BYTES,
    DAILY_UPLOAD_LIMIT: process.env.DAILY_UPLOAD_LIMIT,
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

export function getRequiredAuthSecret(): string {
  const env = getEnv();
  if (!env.BETTER_AUTH_SECRET) {
    throw new Error(
      "BETTER_AUTH_SECRET is not configured or is under 32 characters. Run 'npm run auth:secret' and add it to .env.local."
    );
  }
  return env.BETTER_AUTH_SECRET;
}

export function getCloudinaryConfig() {
  const env = getEnv();
  const cloudName = env.CLOUDINARY_CLOUD_NAME || env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const isConfigured = Boolean(
    cloudName &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET &&
    env.CLOUDINARY_API_SECRET.trim() !== ""
  );
  return {
    isConfigured,
    cloudName: cloudName || "",
    apiKey: env.CLOUDINARY_API_KEY || "",
    apiSecret: env.CLOUDINARY_API_SECRET || "",
    folder: env.CLOUDINARY_FOLDER,
    uploadMaxBytes: env.UPLOAD_MAX_BYTES,
    mediaLibraryMaxBytes: env.MEDIA_LIBRARY_MAX_BYTES,
    dailyUploadLimit: env.DAILY_UPLOAD_LIMIT,
  };
}

export function getRequiredCloudinaryConfig() {
  const config = getCloudinaryConfig();
  if (!config.isConfigured) {
    throw new Error(
      "Cloudinary credentials missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.local."
    );
  }
  return config;
}

export const env = getEnv;
