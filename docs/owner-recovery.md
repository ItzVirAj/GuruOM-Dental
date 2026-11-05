# GuruOm Dental - Owner Authentication & Emergency Recovery Runbook

This document details the security architecture, authentication policies, and operational recovery procedures for the GuruOm Dental Owner Portal.

---

## 1. Architecture & Policy Overview

| Policy / Feature | Specification | Rationale |
| :--- | :--- | :--- |
| **Identity Engine** | Better Auth v1.7+ with Drizzle ORM adapter on Neon Postgres | Modern, robust sessions, password hashing (scrypt), and native TOTP |
| **Access Model** | **Strict Single Owner** (`role: "owner"`) | No public registration; impossible to register second accounts |
| **Two-Factor Authentication** | **Mandatory TOTP** + 10 Emergency Backup Codes | Prevents takeover even if password leaks; enrollment enforced on login |
| **Account Lockout** | Exponential lockout after 5 consecutive failed attempts | Mitigates brute-force credential stuffing; starts at 15m up to 24h |
| **Session Inactivity** | 60-minute sliding idle timeout (`expiresIn: 3600`) | Terminates abandoned browser tabs |
| **Absolute Session Max** | 12-hour hard session ceiling (`SESSION_ABSOLUTE_MAX_AGE_SECONDS`) | Forces fresh authentication daily |
| **Sensitive Fresh Age** | 10-minute re-auth window (`SESSION_FRESH_AGE_SECONDS`) | Guards password change, session revocation, and backup code regeneration |
| **Timing Attack Guard** | Constant-time scrypt calculation on unknown emails | Prevents username/email enumeration via response latency |
| **Audit Log Retention** | 180-day immutable cryptographic event log | Meets compliance and security incident investigation requirements |

---

## 2. Emergency Recovery CLI Tools

All recovery scripts run locally via PowerShell with direct database owner access (`DATABASE_URL_UNPOOLED` or `DATABASE_URL`):

### Provision Owner Account (Initial Setup)
```powershell
npm run owner:create
```
*Validates that no user exists in the database. Prompts for full name, email, and master password. Checks that password meets 14+ characters and zxcvbn score $\ge 3$. Provisions owner record and initializes lockout tracking.*

### Emergency Password Reset
```powershell
npm run owner:reset-password
```
*Locates the owner record, prompts for a new compliant password, updates the password hash, **terminates all active sessions across all devices**, and clears any active lockouts.*

### Emergency Two-Factor (2FA) Reset
```powershell
npm run owner:reset-2fa
```
*Use this if your authenticator device is lost, stolen, or damaged, and all 10 backup codes have been consumed. Clears the 2FA secret from the database, revokes all active sessions, and requires fresh TOTP re-binding on the next sign-in.*

---

## 3. Account Lockout & Unlocking

If 5 consecutive incorrect passwords are submitted:
1. The account is locked for **15 minutes**.
2. An `account_locked` event is logged in `security_events`.
3. Subsequent login attempts display the remaining lockout minutes.
4. If failures continue after the first lockout period, the duration doubles exponentially (30m, 60m, up to 24h).

### Manual Immediate Unlock
To unlock the account immediately without waiting for the timer:
```powershell
npm run owner:reset-password
```
*(Setting a new password automatically resets `failed_count = 0` and clears `locked_until`.)*

---

## 4. Security Audit Verification

To verify the integrity of the authentication guards and defense-in-depth across the application:

```powershell
# Verify that all owner pages invoke requireOwner
npm run auth:guards

# Run comprehensive automated test suite (12 assertions)
npm run auth:check

# Verify zero secrets or secret paths leak into bundles
npm run check:leaks
```
