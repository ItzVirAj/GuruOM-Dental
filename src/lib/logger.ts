/**
 * Centralized Security Logger for GuruOm Dental
 * Automatically redacts sensitive parameters, credentials, tokens, and secrets
 * before writing to stdout/stderr.
 */

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /authorization/i,
  /cookie/i,
  /otp/i,
  /code/i,
  /connection/i,
  /database/i,
];

const CONNECTION_STRING_REGEX = /postgres(?:ql)?:\/\/[^:]+:[^@]+@[^/\s]+/gi;
const BEARER_REGEX = /Bearer\s+[A-Za-z0-9._~+/-]+=*/gi;

/**
 * Deeply redacts sensitive keys and values from objects, arrays, and primitive strings.
 */
export function sanitizeLogData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "string") {
    return data
      .replace(CONNECTION_STRING_REGEX, "postgresql://[REDACTED_CREDENTIALS]@[HOST]")
      .replace(BEARER_REGEX, "Bearer [REDACTED]");
  }

  if (typeof data === "number" || typeof data === "boolean") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item));
  }

  if (data instanceof Error) {
    return {
      name: data.name,
      message: sanitizeLogData(data.message),
      // In production, suppress stack trace to prevent internal path leaks
      stack: process.env.NODE_ENV === "production" ? undefined : sanitizeLogData(data.stack),
    };
  }

  if (typeof data === "object") {
    const sanitizedObj: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      const isSensitiveKey = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));

      if (isSensitiveKey) {
        sanitizedObj[key] = "[REDACTED]";
      } else {
        sanitizedObj[key] = sanitizeLogData(value);
      }
    }

    return sanitizedObj;
  }

  return "[UNSERIALIZABLE]";
}

export const logger = {
  log: (...args: unknown[]) => {
    const sanitized = args.map((arg) => sanitizeLogData(arg));
    console.log(...sanitized);
  },
  info: (...args: unknown[]) => {
    const sanitized = args.map((arg) => sanitizeLogData(arg));
    console.info(...sanitized);
  },
  warn: (...args: unknown[]) => {
    const sanitized = args.map((arg) => sanitizeLogData(arg));
    console.warn(...sanitized);
  },
  error: (...args: unknown[]) => {
    const sanitized = args.map((arg) => sanitizeLogData(arg));
    console.error(...sanitized);
  },
  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      const sanitized = args.map((arg) => sanitizeLogData(arg));
      console.debug(...sanitized);
    }
  },
};
