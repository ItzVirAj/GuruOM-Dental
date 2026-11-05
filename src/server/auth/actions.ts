"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { getDb } from "@/src/db/client";
import { user, account } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "better-auth/crypto";
import QRCode from "qrcode";
import { getClientIp } from "./ip";
import { ownerHref } from "@/src/lib/owner-url";
import { validatePasswordStrength } from "./password";
import { requireOwner } from "./guard";
import {
  checkAccountLockout,
  recordAuthFailure,
  resetAccountLockout,
  recordSecurityEvent,
  runDummyPasswordCheck,
} from "./security";
import { audit } from "@/src/server/security/audit";

export interface ActionState {
  error?: string;
  success?: boolean;
  twoFactorRequired?: boolean;
  setup2FARequired?: boolean;
  redirectUrl?: string;
  backupCodes?: string[];
  message?: string;
}

/**
 * Owner Sign-In Server Action
 */
export async function loginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please provide both email and password." };
  }

  const reqHeaders = await headers();
  const ip = await getClientIp();
  const userAgent = reqHeaders.get("user-agent") || undefined;

  const db = getDb();
  if (!db) {
    return { error: "Service unavailable. Database offline." };
  }

  // 1. Check if user exists
  const existingUsers = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existingUsers.length === 0) {
    // Constant-time dummy check to prevent timing attack enumeration
    await runDummyPasswordCheck(password);
    await recordSecurityEvent({
      type: "login_failure_unknown_user",
      ip,
      userAgent,
      metadata: { attemptedEmail: email },
    });
    return { error: "Invalid credentials. Please verify your email and password." };
  }

  const ownerUser = existingUsers[0];

  // 2. Check account lockout status
  const lockout = await checkAccountLockout(ownerUser.id);
  if (lockout.isLocked) {
    const minutes = Math.max(1, Math.ceil((lockout.remainingSeconds || 0) / 60));
    await recordSecurityEvent({
      type: "login_failure_locked_out",
      userId: ownerUser.id,
      ip,
      userAgent,
      metadata: { remainingSeconds: lockout.remainingSeconds },
    });
    return {
      error: `Account is temporarily locked due to consecutive failed attempts. Please try again in ${minutes} minute(s).`,
    };
  }

  // 3. Verify password via account table
  const userAccounts = await db
    .select()
    .from(account)
    .where(eq(account.userId, ownerUser.id))
    .limit(1);

  if (userAccounts.length === 0 || !userAccounts[0].password) {
    await runDummyPasswordCheck(password);
    return { error: "Invalid credentials. Please verify your email and password." };
  }

  const isPasswordValid = await verifyPassword({
    hash: userAccounts[0].password,
    password,
  });

  if (!isPasswordValid) {
    const failureResult = await recordAuthFailure(ownerUser.id, ip, userAgent);
    await recordSecurityEvent({
      type: "login_failure_bad_password",
      userId: ownerUser.id,
      ip,
      userAgent,
    });

    if (failureResult.isNowLocked) {
      return {
        error:
          "Maximum login attempts exceeded. Your account has been temporarily locked for 15 minutes.",
      };
    }

    return { error: "Invalid credentials. Please verify your email and password." };
  }

  // 4. Authenticate through Better Auth to establish session or trigger 2FA challenge
  try {
    const res = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: reqHeaders,
    });

    // Reset failed attempt counter on valid password
    await resetAccountLockout(ownerUser.id);

    // If Better Auth returned twoFactorRedirect or user has 2FA enabled
    if (
      (res && typeof res === "object" && "twoFactorRedirect" in res && res.twoFactorRedirect) ||
      ownerUser.twoFactorEnabled
    ) {
      return {
        success: true,
        twoFactorRequired: true,
        redirectUrl: ownerHref("/verify"),
      };
    }

    // If 2FA is not yet configured, direct to setup
    if (!ownerUser.twoFactorEnabled) {
      return {
        success: true,
        setup2FARequired: true,
        redirectUrl: ownerHref("/setup-2fa"),
      };
    }

    await recordSecurityEvent({
      type: "login_success",
      userId: ownerUser.id,
      ip,
      userAgent,
    });

    await audit({
      actorUserId: ownerUser.id,
      action: "owner_login",
      entityType: "session",
      entityId: ownerUser.id,
      summary: `Owner login successful (${email})`,
      ip,
      userAgent,
    });

    return {
      success: true,
      redirectUrl: ownerHref("/"),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication failed.";
    // If Better Auth throws twoFactorRedirect
    if (message.includes("two-factor") || message.includes("2FA")) {
      return {
        success: true,
        twoFactorRequired: true,
        redirectUrl: ownerHref("/verify"),
      };
    }

    console.error("[LOGIN_ERROR]", err);
    return { error: "Invalid credentials or sign-in rejected." };
  }
}

/**
 * TOTP 2FA Verification Server Action
 */
export async function verifyTotpAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const code = (formData.get("code") as string)?.trim().replace(/\s+/g, "");

  if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
    return { error: "Please enter a valid 6-digit verification code." };
  }

  const reqHeaders = await headers();
  const ip = await getClientIp();
  const userAgent = reqHeaders.get("user-agent") || undefined;

  try {
    const res = await auth.api.verifyTOTP({
      body: { code },
      headers: reqHeaders,
    });

    if (res && typeof res === "object" && "user" in res) {
      const u = res.user as { id?: string };
      await recordSecurityEvent({
        type: "two_factor_success",
        userId: u?.id,
        ip,
        userAgent,
        metadata: { method: "totp" },
      });

      return {
        success: true,
        redirectUrl: ownerHref("/"),
      };
    }

    return { error: "Verification failed. Please try again." };
  } catch (err: unknown) {
    console.error("[VERIFY_TOTP_ERROR]", err);
    await recordSecurityEvent({
      type: "two_factor_failure",
      ip,
      userAgent,
      metadata: { method: "totp" },
    });

    return {
      error: "Invalid or expired verification code. Please check your authenticator and try again.",
    };
  }
}

/**
 * Backup Code Verification Server Action
 */
export async function verifyBackupCodeAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const code = (formData.get("code") as string)?.trim();

  if (!code || code.length < 8) {
    return { error: "Please enter a valid backup code." };
  }

  const reqHeaders = await headers();
  const ip = await getClientIp();
  const userAgent = reqHeaders.get("user-agent") || undefined;

  try {
    const res = await auth.api.verifyBackupCode({
      body: { code },
      headers: reqHeaders,
    });

    if (res && typeof res === "object" && "user" in res) {
      const u = res.user as { id?: string };
      await recordSecurityEvent({
        type: "backup_code_used",
        userId: u?.id,
        ip,
        userAgent,
      });

      return {
        success: true,
        redirectUrl: ownerHref("/"),
      };
    }

    return { error: "Invalid backup code." };
  } catch (err: unknown) {
    console.error("[VERIFY_BACKUP_CODE_ERROR]", err);
    await recordSecurityEvent({
      type: "two_factor_failure",
      ip,
      userAgent,
      metadata: { method: "backup_code" },
    });

    return {
      error: "Invalid or already used backup code.",
    };
  }
}

/**
 * Step 1: Request 2FA TOTP configuration & generate local QR code
 */
export async function request2FASetupAction(password: string): Promise<{
  error?: string;
  success?: boolean;
  totpURI?: string;
  qrCodeDataUrl?: string;
  secret?: string;
  backupCodes?: string[];
}> {
  await requireOwner({ allowUnverified2FA: true });
  const reqHeaders = await headers();

  if (!password) {
    return { error: "Please enter your password to set up 2FA." };
  }

  try {
    const res = await auth.api.enableTwoFactor({
      body: {
        password,
        method: "totp",
      },
      headers: reqHeaders,
    });

    const data = res as { totpURI?: string; backupCodes?: string[] };
    if (!data.totpURI) {
      return { error: "Failed to generate TOTP secret." };
    }

    const qrCodeDataUrl = await QRCode.toDataURL(data.totpURI, {
      margin: 1,
      width: 240,
      color: {
        dark: "#1A1918",
        light: "#FFFFFF",
      },
    });

    let secret = "";
    try {
      const parsed = new URL(data.totpURI);
      secret = parsed.searchParams.get("secret") || "";
    } catch {
      const match = data.totpURI.match(/secret=([A-Z0-9]+)/i);
      if (match) secret = match[1];
    }

    return {
      success: true,
      totpURI: data.totpURI,
      qrCodeDataUrl,
      secret,
      backupCodes: data.backupCodes,
    };
  } catch (err: unknown) {
    console.error("[REQUEST_2FA_ERROR]", err);
    return {
      error:
        err instanceof Error
          ? err.message
          : "Invalid password or failed to generate 2FA secret.",
    };
  }
}

/**
 * Step 2: Confirm 2FA setup with authenticator token
 */
export async function confirm2FASetupAction(code: string): Promise<ActionState> {
  const { user: owner } = await requireOwner({ allowUnverified2FA: true });
  const reqHeaders = await headers();
  const ip = await getClientIp();
  const cleanCode = code.trim().replace(/\s+/g, "");

  if (!cleanCode || cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
    return { error: "Please enter the 6-digit code shown in your authenticator app." };
  }

  try {
    await auth.api.verifyTOTP({
      body: { code: cleanCode },
      headers: reqHeaders,
    });

    const db = getDb();
    if (db) {
      await db
        .update(user)
        .set({
          twoFactorEnabled: true,
          updatedAt: new Date(),
        })
        .where(eq(user.id, owner.id));
    }

    await recordSecurityEvent({
      type: "two_factor_success",
      userId: owner.id,
      ip,
      metadata: { action: "mandatory_setup_completed" },
    });

    return {
      success: true,
      redirectUrl: ownerHref("/"),
    };
  } catch (err: unknown) {
    console.error("[CONFIRM_2FA_ERROR]", err);
    return {
      error:
        err instanceof Error
          ? err.message
          : "Invalid code. Please ensure your device clock is synchronized and try again.",
    };
  }
}

/**
 * Logout Action
 */
export async function logoutAction(): Promise<void> {
  const reqHeaders = await headers();
  const ip = await getClientIp();
  const userAgent = reqHeaders.get("user-agent") || undefined;

  try {
    const sessionRes = await auth.api.getSession({ headers: reqHeaders });
    if (sessionRes?.user?.id) {
      await audit({
        actorUserId: sessionRes.user.id,
        action: "owner_logout",
        entityType: "session",
        entityId: sessionRes.session.id,
        summary: `Owner logged out (${sessionRes.user.email})`,
        ip,
        userAgent,
      });
    }
    await auth.api.signOut({
      headers: reqHeaders,
    });
  } catch {
    // Best-effort sign-out
  }
  redirect(ownerHref("/login"));
}

/**
 * Revoke Individual Session Action
 */
export async function revokeSessionAction(token: string): Promise<ActionState> {
  const { user: owner } = await requireOwner({ fresh: true });
  const reqHeaders = await headers();
  const ip = await getClientIp();

  try {
    await auth.api.revokeSession({
      body: { token },
      headers: reqHeaders,
    });

    await recordSecurityEvent({
      type: "session_revoked",
      userId: owner.id,
      ip,
      metadata: { revokedTokenPrefix: token.substring(0, 8) },
    });

    return { success: true, message: "Session revoked successfully." };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to revoke session.",
    };
  }
}

/**
 * Revoke All Other Sessions Action
 */
export async function revokeAllOtherSessionsAction(): Promise<ActionState> {
  const { user: owner } = await requireOwner({ fresh: true });
  const reqHeaders = await headers();
  const ip = await getClientIp();

  try {
    await auth.api.revokeOtherSessions({
      headers: reqHeaders,
    });

    await recordSecurityEvent({
      type: "all_other_sessions_revoked",
      userId: owner.id,
      ip,
    });

    return { success: true, message: "All other sessions have been terminated." };
  } catch (err: unknown) {
    return {
      error:
        err instanceof Error ? err.message : "Failed to revoke other sessions.",
    };
  }
}

/**
 * Change Password Action
 */
export async function changePasswordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { user: owner } = await requireOwner({ fresh: true });
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword) {
    return { error: "Please enter your current and new password." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match." };
  }

  const strength = validatePasswordStrength(newPassword, [
    owner.name,
    owner.email,
    "guruom",
    "dental",
  ]);

  if (!strength.isValid) {
    return { error: strength.error };
  }

  const reqHeaders = await headers();
  const ip = await getClientIp();

  try {
    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      },
      headers: reqHeaders,
    });

    await recordSecurityEvent({
      type: "password_changed",
      userId: owner.id,
      ip,
      metadata: { action: "user_initiated_change" },
    });

    return {
      success: true,
      message: "Password changed successfully. All other sessions have been terminated.",
    };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to change password.",
    };
  }
}

/**
 * Regenerate Backup Codes Action
 */
export async function regenerateBackupCodesAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { user: owner } = await requireOwner({ fresh: true });
  const password = formData.get("password") as string;

  if (!password) {
    return { error: "Your account password is required to generate new backup codes." };
  }

  const reqHeaders = await headers();
  const ip = await getClientIp();

  try {
    const res = await auth.api.generateBackupCodes({
      body: { password },
      headers: reqHeaders,
    });

    await recordSecurityEvent({
      type: "backup_codes_regenerated",
      userId: owner.id,
      ip,
    });

    return {
      success: true,
      backupCodes: (res as { backupCodes?: string[] })?.backupCodes,
      message: "New backup codes generated. Old backup codes have been invalidated.",
    };
  } catch (err: unknown) {
    return {
      error:
        err instanceof Error ? err.message : "Failed to generate backup codes.",
    };
  }
}
