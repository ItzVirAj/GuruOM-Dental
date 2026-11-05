import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { ownerHref } from "@/src/lib/owner-url";
import {
  SESSION_ABSOLUTE_MAX_AGE_SECONDS,
  SESSION_FRESH_AGE_SECONDS,
} from "./policy";

export interface RequireOwnerOptions {
  /**
   * If true, requires the session to have been authenticated within SESSION_FRESH_AGE_SECONDS (10m).
   * Used for high-security actions (changing password, generating backup codes, managing sessions).
   */
  fresh?: boolean;
  /**
   * Set to true on the /setup-2fa page to allow users whose 2FA is not yet verified to access the page.
   */
  allowUnverified2FA?: boolean;
}

export type OwnerSession = Awaited<ReturnType<typeof auth.api.getSession>>;

export async function requireOwner(options: RequireOwnerOptions = {}) {
  const headerList = await headers();
  const sessionData = await auth.api.getSession({
    headers: headerList,
  });

  if (!sessionData || !sessionData.user || !sessionData.session) {
    redirect(ownerHref("/login"));
  }

  const { user, session } = sessionData;

  // Verify role
  if ((user as Record<string, unknown>).role !== "owner") {
    redirect(ownerHref("/login"));
  }

  // Absolute 12-hour session lifetime enforcement
  const sessionCreatedAt = new Date(session.createdAt).getTime();
  const now = Date.now();
  if (now - sessionCreatedAt > SESSION_ABSOLUTE_MAX_AGE_SECONDS * 1000) {
    try {
      await auth.api.revokeSession({
        headers: headerList,
        body: { token: session.token },
      });
    } catch {
      // Best-effort session revocation
    }
    redirect(ownerHref("/login?reason=session_expired"));
  }

  // Session freshness check for sensitive actions
  if (options.fresh) {
    const sessionAge = now - sessionCreatedAt;
    if (sessionAge > SESSION_FRESH_AGE_SECONDS * 1000) {
      redirect(ownerHref("/verify?fresh=true"));
    }
  }

  // Mandatory 2FA enforcement
  const is2FAEnabled = Boolean(
    (user as Record<string, unknown>).twoFactorEnabled
  );
  if (!is2FAEnabled && !options.allowUnverified2FA) {
    redirect(ownerHref("/setup-2fa"));
  }

  return { user, session };
}

/**
 * Higher-order wrapper for Server Actions requiring owner authentication.
 */
export async function withOwner<T>(
  action: (context: {
    user: NonNullable<OwnerSession>["user"];
    session: NonNullable<OwnerSession>["session"];
  }) => Promise<T>,
  options: RequireOwnerOptions = {}
): Promise<T> {
  const context = await requireOwner(options);
  return action(context);
}
