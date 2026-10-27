# Neon Postgres Setup Guide for GuruOm Dental

This guide walks you through setting up a serverless PostgreSQL database on [Neon](https://neon.tech) and configuring least-privilege database roles for GuruOm Dental.

---

### Security Architecture: Dual-Role Isolation
In production, your web application connects using a restricted runtime role (`guruom_app`), while schema migrations run using the administrative owner role (`neondb_owner`). **Why?** If the web server runtime environment or connection string is ever leaked or intercepted, an attacker possessing `guruom_app` credentials has only data manipulation permissions (`SELECT`, `INSERT`, `UPDATE`, `DELETE`). They **cannot** drop tables (`DROP TABLE`), alter schemas (`ALTER TABLE`), create triggers, or access database administration functions. This stops common SQL injection and credential extraction attacks from causing catastrophic schema loss.

---

### Step 1: Create a Neon Project
1. Go to [console.neon.tech](https://console.neon.tech) and sign in (or create a free account).
2. Click **Create Project**.
3. Name your project (e.g., `guruom-dental`).
4. Select the PostgreSQL version (default `16` or `17` recommended).
5. Choose the region closest to your hosting region (e.g., AWS Asia Pacific / Mumbai `ap-south-1` or Singapore `ap-southeast-1` if hosted in Asia).
6. Click **Create Project**.

---

### Step 2: Retrieve the Connection Strings
1. In your Neon Project Dashboard, navigate to the **Dashboard** tab.
2. In the **Connection Details** widget:
   - Check the **Pooled connection** checkbox. Copy the pooled connection URI string. This will be your `DATABASE_URL` template.
   - Uncheck the **Pooled connection** checkbox to view the direct connection URI string. Copy this direct URI string. This will be your `DATABASE_URL_UNPOOLED` value.
3. Note: Neon's default user is `neondb_owner`.

---

### Step 3: Create the Restricted Application Role (`guruom_app`)
1. In the Neon console left sidebar, click **SQL Editor**.
2. Open [`scripts/db/create-app-role.sql`](file:///c:/proj/GuruOm_Dental/scripts/db/create-app-role.sql) in your local editor.
3. Replace the placeholder `'REPLACE_WITH_STRONG_APPLICATION_PASSWORD'` on lines 21 and 23 with a strong random password of your choice (e.g., generated with a password manager).
4. Paste the entire SQL script into Neon's SQL Editor and click **Run**.
5. You should see a success message confirming the role creation and privilege grants.

---

### Step 4: Configure `.env.local`
Create or edit `.env.local` in the project root (never commit this file; it is gitignored):

```env
# 1. DATABASE_URL: Uses the POOLED connection string with the LIMITED 'guruom_app' role and password:
DATABASE_URL="postgresql://guruom_app:YOUR_APP_ROLE_PASSWORD@ep-sample-pooler.region.neon.tech/neondb?sslmode=require"

# 2. DATABASE_URL_UNPOOLED: Uses the DIRECT (unpooled) connection string with the OWNER 'neondb_owner' role:
DATABASE_URL_UNPOOLED="postgresql://neondb_owner:YOUR_OWNER_ROLE_PASSWORD@ep-sample.region.neon.tech/neondb?sslmode=require"

# 3. ADMIN_PATH: Generate via `npm run owner:slug`
ADMIN_PATH="YOUR_GENERATED_SLUG"

# 4. OWNER_AREA_ENABLED: Set to "true" to enable the owner placeholder route
OWNER_AREA_ENABLED="true"

# 5. SITE_URL: Your local or production base domain
SITE_URL="http://localhost:3000"
```

---

### Step 5: Run Migrations and Seed
Once `.env.local` is populated:
1. Run schema migrations against the direct owner endpoint:
   ```powershell
   npm run db:migrate
   ```
2. Seed existing blog articles and categories:
   ```powershell
   npm run db:seed
   ```
3. Run the automated permissions and visibility check:
   ```powershell
   npm run db:check
   ```
