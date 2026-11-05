# Security Surface and Attack-Surface Inventory

| Path or Action | Type | Methods | Who May Call | Input Validation | Rate Limit | What It Writes | Third-Party Requests |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | Page | GET | Public | None (Static) | CDN / Edge | None | None |
| `/about` | Page | GET | Public | None (Static) | CDN / Edge | None | None |
| `/services` | Page | GET | Public | None (Static) | CDN / Edge | None | None |
| `/services/[slug]` | Page | GET | Public | Slug validation | CDN / Edge | None | None |
| `/contact` | Page | GET | Public | None (Static) | CDN / Edge | None | None |
| `/careers` | Page | GET | Public | None (Static) | CDN / Edge | None | None |
| `/privacy` | Page | GET | Public | None (Static) | CDN / Edge | None | None |
| `/terms` | Page | GET | Public | None (Static) | CDN / Edge | None | None |
| `/appointment` | Page | GET | Public | None (PPR) | CDN / Edge | None | None |
| `/blog` | Page | GET | Public | Query params | CDN / Edge | None | Neon Postgres (Read) |
| `/blog/[slug]` | Page | GET | Public | Slug validation | CDN / Edge | None | Neon Postgres (Read) |
| `/videos` | Page | GET | Public | Query params | CDN / Edge | None | Neon Postgres (Read) |
| `/videos/[slug]` | Page | GET | Public | Slug validation | CDN / Edge | None | Neon Postgres (Read) |
| `/feed.xml` | Route Handler | GET | Public | None | CDN / Edge (s-maxage=300) | None (Read-only) | Neon Postgres (Read) |
| `/animation-lab` | Page | GET | Public (Dev) | None | CDN / Edge | None | None |
| `/design-system` | Page | GET | Public (Dev) | None | CDN / Edge | None | None |
| `/sitemap.xml` | Route | GET | Public | None | CDN / Edge | None | Neon Postgres (Read) |
| `/robots.txt` | Route | GET | Public | None | CDN / Edge | None | None |
| `/<ADMIN_PATH>` | Page | GET | Owner (Verified 2FA) | Session guard | Server-side guard | None | Neon Postgres (Read) |
| `/<ADMIN_PATH>/login` | Page | GET | Public / Unauthenticated | Session check | Server-side guard | None | Neon Postgres (Read) |
| `/<ADMIN_PATH>/security` | Page | GET | Owner (Fresh 10m session) | Fresh session guard | Server-side guard | None | Neon Postgres (Read) |
| `/<ADMIN_PATH>/setup-2fa` | Page | GET | Owner (Unverified 2FA) | Onboarding guard | Server-side guard | None | Neon Postgres (Read) |
| `/<ADMIN_PATH>/verify` | Page | GET | Owner (Pending 2FA) | 2FA pending guard | Server-side guard | None | None |
| `/api/auth/[...all]` | Route Handler | GET, POST | Public / Owner | Better Auth internal schemas | DB-backed plugin | `session`, `account`, `user`, `two_factor`, `rate_limit` | Neon Postgres |
| `/api/blog` | Route Handler | GET | Public | Zod (`querySchema`) | In-memory (FLAGGED: Needs DB rate limiter) | None (Read-only) | Neon Postgres (Read) |
| `submitContact` | Server Action | POST | Public | Zod (`contactFormSchema`) | In-memory (FLAGGED: Needs DB rate limiter) | Dispatches notification stub | None |
| `submitAppointment` | Server Action | POST | Public | Zod (`combinedBookingSchema`) | In-memory (FLAGGED: Needs DB rate limiter) | Dispatches notification stub | None |
| `NewsletterForm` submit | Client / Action | POST | Public | Client regex only (FLAGGED: No Zod, no server rate limit) | None (FLAGGED) | Client stub | None |
| `loginAction` | Server Action | POST | Public / Owner | String presence + email format | In-memory + DB lockout (`account_lockouts`) | `session`, `account_lockouts`, `security_events` | Neon Postgres |
| `verifyTwoFactorAction` | Server Action | POST | Owner (Pending 2FA) | String presence + 6 digits | In-memory + DB lockout (`account_lockouts`) | `session`, `security_events` | Neon Postgres |
| `setupTwoFactorAction` | Server Action | POST | Owner (Authenticated) | Session guard | Session-guarded | None | Neon Postgres |
| `confirmTwoFactorAction`| Server Action | POST | Owner (Authenticated) | TOTP 6-digit validation | Session-guarded | `two_factor`, `user`, `security_events` | Neon Postgres |
| `changePasswordAction` | Server Action | POST | Owner (Fresh Session) | Zxcvbn + length + dictionary | Fresh-session guard | `account`, `session` (revoke others), `security_events` | Neon Postgres |
| `regenerateBackupCodesAction`| Server Action | POST | Owner (Fresh Session) | Fresh session guard | Fresh-session guard | `two_factor`, `security_events` | Neon Postgres |
| `revokeSessionAction` | Server Action | POST | Owner (Authenticated) | Session ID presence | Session-guarded | `session`, `security_events` | Neon Postgres |
| `revokeAllOtherSessionsAction`| Server Action | POST | Owner (Authenticated) | Session token guard | Session-guarded | `session`, `security_events` | Neon Postgres |
| `logoutAction` | Server Action | POST | Owner (Authenticated) | Session token guard | Session-guarded | Deletes active `session`, `security_events` | Neon Postgres |

---

## Flagged Items Requiring Hardening

1. **`submitContact` (`app/contact/actions.ts`):** Uses an in-memory rate limiter (`checkRateLimit("contact", clientIp)`). In serverless deployments, in-memory states are not shared between instances, allowing attackers to bypass rate limits by hitting different instances.
   - *Fix:* Replace with PostgreSQL-backed shared rate limiter (`src/server/security/rate-limit.ts`) using salted SHA-256 IP hashes.
2. **`submitAppointment` (`app/appointment/actions.ts`):** Uses an in-memory rate limiter (`checkRateLimit("appointment", clientIp)`).
   - *Fix:* Replace with PostgreSQL-backed shared rate limiter (`src/server/security/rate-limit.ts`) using salted SHA-256 IP hashes.
3. **`NewsletterForm` (`components/ui/NewsletterForm.tsx`):** Handled entirely in client state with simulated dispatch, without a backing Server Action, Zod server-side validation, or server-side rate limiting.
   - *Fix:* Create a dedicated server action `subscribeNewsletter` validated with Zod and guarded by the PostgreSQL-backed rate limiter.
4. **`/api/blog` (`app/api/blog/route.ts`):** Uses an in-memory `Map` for rate limiting (`ipRequestCounts`).
   - *Fix:* Replace with PostgreSQL-backed shared rate limiter.
5. **CSP Report Endpoint (`/api/csp-report`):** Will receive browser violation reports from the public.
   - *Fix:* Implement with strict payload size limit (max 10KB), Zod validation, and PostgreSQL-backed rate limiter.

---

## Next.js Public Page Inline Bootstrap Scripts Trade-Off

In Next.js App Router (Turbopack / Webpack), public statically generated and Partial Prerendered (PPR) pages inject inline hydration scripts (e.g. `self.__next_f.push(...)` and runtime initialization).
Generating dynamic random nonces per request would force all public pages to render dynamically at runtime on every single request, completely disabling Next.js static optimization, ISR, and CDN caching.

Therefore:
- **Owner Area:** Uses strict per-request cryptographic nonces (`script-src 'self' 'nonce-...' 'strict-dynamic'`). Since owner pages are authenticated and dynamic, nonces carry zero performance penalty.
- **Public Area:** Uses a pragmatic policy (`script-src 'self' 'unsafe-inline'`) combined with strict `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, and `frame-ancestors 'none'`. As confirmed in Next.js 16 documentation, Next.js does not yet support dynamic per-request nonces on static/cached pages without de-opting them from the edge cache.
