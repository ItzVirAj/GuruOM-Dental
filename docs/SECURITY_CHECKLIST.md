# GuruOm Dental — Production Security & Launch Checklist

Complete this checklist prior to pointing the production DNS and switching `OWNER_AREA_ENABLED=true`.

---

## 1. Account Security & Multi-Factor Authentication (2FA)

Ensure hardware security keys (FIDO2/WebAuthn) or dedicated TOTP authenticator apps are mandatory on all provider accounts:
- [ ] **GitHub Account & Organization**: 2FA enabled on all accounts with write or admin permissions.
- [ ] **Neon Console**: 2FA enabled on the database owner account.
- [ ] **Hosting Dashboard (Vercel)**: 2FA enabled with team access controls.
- [ ] **Domain Registrar (DNS Provider)**: 2FA enabled; DNS registry lock enabled to prevent unauthorized domain transfers or DNS hijacking.
- [ ] **Cloudinary / Media Storage**: 2FA enabled on the media management account.
- [ ] **Google / YouTube Channel**: 2FA enabled on the clinic's YouTube and Google Maps administrative profiles.
- [ ] **Unique Master Passwords**: Every single provider account uses a randomly generated, 20+ character password stored in a reputable password manager.

---

## 2. Supply Chain & Code Repository Protection

- [ ] **GitHub Secret Scanning**: Enabled on the repository (free for public and private GitHub repos).
- [ ] **GitHub Push Protection**: Enabled so commits containing credentials are automatically rejected at `git push` time.
- [ ] **Dependabot Alerts & Security Updates**: Verified active via `.github/dependabot.yml`.
- [ ] **Package Lockfile**: `package-lock.json` committed with exact pinned versions (`.npmrc` configured with `save-exact=true`).
- [ ] **Continuous Integration**: GitHub Actions CI workflow (`.github/workflows/ci.yml`) passing typecheck, lint, audit, leak detection, and build.

---

## 3. Production Environment Configuration

Set the following environment variables in the hosting dashboard (never in git):

| Variable | Description | Requirement |
| :--- | :--- | :--- |
| `DATABASE_URL` | Pooled connection string for the limited `guruom_app` role | Must contain `sslmode=require` |
| `DATABASE_URL_UNPOOLED` | Direct connection string for migrations and backups | Must contain `sslmode=require` |
| `BETTER_AUTH_SECRET` | 64-character cryptographic random hex key | Generated via `npm run auth:secret` |
| `BETTER_AUTH_URL` | Canonical public URL | `https://guruomdental.com` |
| `ADMIN_PATH` | Secret owner route prefix (20-64 chars, no common words) | Generated via `npm run owner:slug` |
| `OWNER_AREA_ENABLED` | Feature flag toggling owner portal existence | `"true"` |
| `SITE_URL` | Canonical site domain | `https://guruomdental.com` |
| `CRON_SECRET` | 64-character bearer token for `/api/cron/maintenance` | Generated via `npm run cron:secret` |
| `CSP_MODE` | Content Security Policy mode | Start `"report-only"`, then switch to `"enforce"` |
| `BACKUP_PASSPHRASE` | Encryption passphrase for NDJSON archives (AES-256-GCM) | Minimum 16 high-entropy characters |
| `TRASH_PURGE_DAYS` | Retention window for soft-deleted posts | e.g. `"30"` (default disabled) |

---

## 4. Content Security Policy (CSP) Cutover

- [ ] **Stage 1 (Report-Only)**: Deploy with `CSP_MODE=report-only`.
  - Click through all core journeys: Home, Blog, Article, Contact with Google Maps embed, Appointment booking form, Owner login & 2FA.
  - Review `/api/csp-report` logs to confirm no legitimate styles, fonts, or scripts trigger violations.
- [ ] **Stage 2 (Enforce)**: Update hosting environment variable to `CSP_MODE=enforce` and redeploy.
- [ ] **Verify Strict Headers**: Confirm with `curl -I https://guruomdental.com`:
  - `Content-Security-Policy`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Permissions-Policy: camera=(), microphone=(), ...`
  - `X-Powered-By` is completely omitted.

---

## 5. Network & HTTPS Hygiene

- [ ] **HTTPS-Only**: Automatic redirect from HTTP to HTTPS configured at the edge/CDN.
- [ ] **SSL Certificate**: Valid TLS 1.3 certificate with ALPN and OCSP Stapling.
- [ ] **Canonical Host Redirection**: Redirect `http://guruomdental.com`, `http://www.guruomdental.com`, and `https://www.guruomdental.com` to `https://guruomdental.com`.

---

## 6. Disaster Recovery & Emergency Operations

- [ ] **First Baseline Backup Created**: `npm run db:backup` executed and encrypted archive saved offline.
- [ ] **Dry-Run Restore Verified**: Performed restore into a test Neon branch using `npm run db:restore -- <backup-file>`.
- [ ] **Emergency Recovery Docs Printed**: Printed physical hard-copy of `docs/recovery-procedures.md` and `docs/backup-and-restore.md` stored in a secure physical location.
- [ ] **Owner Backup Codes**: Owner 2FA emergency recovery codes printed and secured in clinic vault.
- [ ] **Contact in security.txt**: Verify placeholder in `public/.well-known/security.txt` updated to actual clinic security address.
