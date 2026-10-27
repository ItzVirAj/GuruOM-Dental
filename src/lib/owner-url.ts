import "server-only";
import { getEnv } from "./env";

/**
 * Server-only helper to generate internal owner URLs using the secret ADMIN_PATH.
 * By importing "server-only", this helper can never be bundled into client-side JavaScript.
 */
export function ownerHref(relativePath: string = ""): string {
  const env = getEnv();
  const adminSegment = env.ADMIN_PATH;
  if (!adminSegment) {
    throw new Error(
      "ADMIN_PATH is not configured in the environment. Set ADMIN_PATH in .env.local."
    );
  }

  const cleanPath = relativePath.startsWith("/")
    ? relativePath
    : `/${relativePath}`;

  return cleanPath === "/" ? `/${adminSegment}` : `/${adminSegment}${cleanPath}`;
}
