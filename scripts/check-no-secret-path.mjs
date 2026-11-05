import fs from "node:fs";
import path from "node:path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const adminPath = process.env.ADMIN_PATH?.trim();
const authSecret = process.env.BETTER_AUTH_SECRET?.trim();

const secretsToScan = [];
if (adminPath && !adminPath.startsWith("sample-") && !adminPath.includes("REPLACE_WITH_")) {
  secretsToScan.push({ name: "ADMIN_PATH", value: adminPath });
}
if (authSecret && !authSecret.includes("REPLACE_WITH_") && authSecret.length >= 16) {
  secretsToScan.push({ name: "BETTER_AUTH_SECRET", value: authSecret });
}

if (secretsToScan.length === 0) {
  console.log(
    "check-no-secret-path: No custom secrets configured in .env.local to scan. Skipping."
  );
  process.exit(0);
}

let leakFound = false;

function scanDirectory(dir, allowedFiles = []) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      scanDirectory(fullPath, allowedFiles);
    } else if (entry.isFile()) {
      const normalized = fullPath.replace(/\\/g, "/");
      const isAllowed = allowedFiles.some((allowed) =>
        normalized.endsWith(allowed)
      );

      if (isAllowed) continue;

      try {
        const content = fs.readFileSync(fullPath, "utf8");
        for (const secret of secretsToScan) {
          if (content.includes(secret.value)) {
            console.error(
              `[LEAK DETECTED] Secret ${secret.name} was found in: ${fullPath}`
            );
            leakFound = true;
          }
        }
      } catch {
        // Skip unreadable binary files
      }
    }
  }
}

console.log("Scanning source files and client bundles for secret leaks...");

// Files where secrets are legitimately referenced on server
const allowedFiles = [
  ".env",
  ".env.local",
  ".env.example",
  "src/lib/env.ts",
  "proxy.ts",
  "scripts/generate-owner-slug.mjs",
  "scripts/generate-auth-secret.mjs",
  "scripts/check-no-secret-path.mjs",
  "scripts/check-env-leaks.mjs",
];

// Scan source directories
scanDirectory(path.resolve("app"), allowedFiles);
scanDirectory(path.resolve("components"), allowedFiles);
scanDirectory(path.resolve("src"), allowedFiles);
scanDirectory(path.resolve("public"), allowedFiles);

// Scan client bundle output in .next/static if build has occurred
const nextStaticDir = path.resolve(".next", "static");
if (fs.existsSync(nextStaticDir)) {
  scanDirectory(nextStaticDir, allowedFiles);
}

if (leakFound) {
  console.error(
    "\n[SECURITY FAILURE] Sensitive credentials or secret paths leaked into source files or client bundles!"
  );
  process.exit(1);
} else {
  console.log(
    "[PASS] No secret ADMIN_PATH or BETTER_AUTH_SECRET leaks found in source code or client bundles."
  );
}
