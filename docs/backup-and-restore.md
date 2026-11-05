# GuruOm Dental — Database Backup & Disaster Recovery Runbook

This document defines the backup cadence, encryption standards, disaster recovery procedures, and restore verification tests for the GuruOm Dental PostgreSQL database.

---

## 1. Backup Cadence & Retention

| Event | Action | Destination |
| :--- | :--- | :--- |
| **Weekly Scheduled** | Automated or manual export via `npm run db:backup` | Local encrypted archive + cold storage |
| **Pre-Deployment / Pre-Migration** | Manual snapshot before running schema migrations or large updates | Local `./backups/` directory |
| **Daily Automated** | Daily maintenance cron cleans expired tokens & applies log checkpointing | Neon managed snapshots |

### Neon Free Plan Point-in-Time Recovery (PITR) Limit
> [!IMPORTANT]
> The **Neon Free Tier** provides **24 hours** of point-in-time recovery (PITR) history for branches.
> Because un-snapshotted data older than 24 hours cannot be recovered via Neon branch time-travel on the free tier, our standalone NDJSON backup tool (`npm run db:backup`) is essential for maintaining long-term recovery archives.

---

## 2. Encryption & Offline Storage Strategy

1. **AES-256-GCM Encryption**:
   - Set `BACKUP_PASSPHRASE` in `.env.local` (minimum 16 characters).
   - `npm run db:backup` uses `scrypt` to derive a 256-bit encryption key with a cryptographically random 16-byte salt and 12-byte initialization vector (IV).
   - Encrypted files receive the `.enc` extension and can only be decrypted with the passphrase.
2. **Cold Offline Copies**:
   - Copy the `.enc` backup file to an external encrypted USB drive or isolated cloud cold-storage vault (e.g. AWS S3 Glacier or Google Cloud Coldline with Object Lock).
   - Never store backup passphrases in the same location as backup files.
3. **Never Commit Backups to Git**:
   - `./backups/` and `*.enc` are strictly gitignored in `.gitignore`.

---

## 3. Creating a Backup

Run the portable PowerShell/Node script:

```powershell
npm run db:backup
```

Output:
- Compresses table records into Gzip / AES-256-GCM NDJSON.
- Prints row counts for all application tables: `posts`, `categories`, `tags`, `post_tags`, `user`, `account`, `two_factor`, `session`, `security_events`, `audit_log`, `rate_limits`.
- Sanitized output: Zero connection strings or passwords printed.

---

## 4. Disaster Recovery & Testing Restores

To safely verify a backup without endangering production data, test restoration into a **Neon Development Branch**:

### Step 1: Create an Isolated Neon Branch
In the Neon Console:
1. Navigate to your project -> **Branches**.
2. Click **New Branch** (e.g. `recovery-test-branch`) branched from your baseline or an empty branch.
3. Copy the branch connection string.

### Step 2: Configure Environment for Dev Restore
In your terminal or temporary `.env` session:
```powershell
$env:RESTORE_DEV_ALLOW="true"
$env:DATABASE_URL="postgresql://neondb_owner:password@ep-recovery-test.neon.tech/neondb?sslmode=require"
```

### Step 3: Execute Restore
```powershell
npm run db:restore -- backups/backup-<timestamp>.enc
```

The CLI requires you to confirm:
```
Type "CONFIRM RESTORE DEV DATABASE" to proceed:
```
Type the exact phrase. The script will:
1. Validate that the target database is NOT a production database.
2. Decrypt using `BACKUP_PASSPHRASE` and decompress.
3. Restore tables in relational dependency order (`categories` -> `tags` -> `user` -> `posts` -> `post_tags` -> `audit_log`).
4. Print a table comparing row counts restored.

---

## 5. Verification Checklist

- [ ] Weekly encrypted backup verified.
- [ ] Offsite copy transferred to cold storage.
- [ ] Quarterly dry-run restore into a fresh Neon branch completed.
- [ ] Database integrity check passes: `npm run db:check`.
- [ ] Audit chain integrity check passes: `npm run audit:verify`.
