import fs from "node:fs";
import path from "node:path";

console.log("\n========================================================");
console.log(" GuruOm Dental - Owner Area Guard Compliance Audit");
console.log("========================================================\n");

const ownerPagesDir = path.resolve(process.cwd(), "app", "(owner)", "ow");
const ownerServerDir = path.resolve(process.cwd(), "src", "server", "owner");

let totalScanned = 0;
let violations = [];

function scanPages(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanPages(fullPath);
    } else if (
      entry.name === "page.tsx" ||
      entry.name === "page.ts" ||
      entry.name === "layout.tsx" ||
      entry.name === "route.ts"
    ) {
      totalScanned++;
      const relative = path.relative(ownerPagesDir, fullPath);
      const parts = relative.split(path.sep);

      // Root layout is shared with unauthenticated entry points (login, verify)
      if (relative === "layout.tsx") {
        continue;
      }

      // Check if this page is in an allowlisted folder (login or verify)
      const isPublicAuthEntry = parts[0] === "login" || parts[0] === "verify";
      if (isPublicAuthEntry) {
        continue;
      }

      const content = fs.readFileSync(fullPath, "utf8");
      const hasRequireOwner =
        content.includes("requireOwner") || content.includes("withOwner");

      if (!hasRequireOwner) {
        violations.push({
          file: relative,
          reason: "Missing requireOwner() or withOwner() guard invocation",
        });
      }
    }
  }
}

function scanServerActions(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanServerActions(fullPath);
    } else if (entry.name.endsWith(".ts")) {
      const content = fs.readFileSync(fullPath, "utf8");
      if (content.includes('"use server"') || content.includes("'use server'")) {
        totalScanned++;
        const relative = path.relative(ownerServerDir, fullPath);

        // Every server action file in owner area must import and invoke requireOwner or withOwner
        const hasGuard =
          content.includes("withOwner(") || content.includes("requireOwner(");

        if (!hasGuard) {
          violations.push({
            file: `src/server/owner/${relative}`,
            reason: "Server action file missing withOwner() or requireOwner() guard wrapping",
          });
        }
      }
    }
  }
}

scanPages(ownerPagesDir);
scanServerActions(ownerServerDir);

console.log(`Scanned ${totalScanned} owner area component and server action file(s).`);

if (violations.length > 0) {
  console.error("\n[GUARD VIOLATIONS DETECTED]");
  for (const v of violations) {
    console.error(`- ${v.file}: ${v.reason}`);
  }
  process.exit(1);
} else {
  console.log("\n[SUCCESS] All protected owner pages and server actions invoke requireOwner/withOwner defense-in-depth.\n");
  process.exit(0);
}
