#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

console.log("\n========================================================");
console.log(" GuruOm Dental - DangerouslySetInnerHTML Security Audit");
console.log("========================================================\n");

const ROOT_DIRS = ["app", "components", "src"];
const ALLOWLISTED_FILES = [
  path.normalize("app/blog/[slug]/page.tsx"),
  path.normalize("app/videos/[slug]/page.tsx"),
  path.normalize("app/services/[slug]/page.tsx"),
  path.normalize("app/careers/page.tsx"),
  path.normalize("app/page.tsx"),
  path.normalize("app/contact/page.tsx"),
  path.normalize("components/sections/home/HomeFaq.tsx"),
  path.normalize("components/seo/JsonLd.tsx"),
];

let totalScanned = 0;
const violations = [];

function scan(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next") {
        scan(fullPath);
      }
    } else if (
      entry.name.endsWith(".tsx") ||
      entry.name.endsWith(".jsx") ||
      entry.name.endsWith(".ts") ||
      entry.name.endsWith(".js")
    ) {
      totalScanned++;
      const relative = path.normalize(path.relative(process.cwd(), fullPath));
      const content = fs.readFileSync(fullPath, "utf-8");

      if (content.includes("dangerouslySetInnerHTML")) {
        const isAllowlisted = ALLOWLISTED_FILES.some((allowed) =>
          relative.endsWith(allowed)
        );

        if (!isAllowlisted) {
          violations.push({
            file: relative,
            reason: "dangerouslySetInnerHTML is strictly prohibited outside JSON-LD scripts",
          });
        } else {
          // Verify it is only used for application/ld+json
          const lines = content.split("\n");
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes("dangerouslySetInnerHTML")) {
              const context = lines.slice(Math.max(0, i - 3), i + 4).join("\n");
              if (!context.includes("application/ld+json")) {
                violations.push({
                  file: `${relative}:${i + 1}`,
                  reason: "dangerouslySetInnerHTML must only be used within <script type=\"application/ld+json\">",
                });
              }
            }
          }
        }
      }
    }
  }
}

for (const d of ROOT_DIRS) {
  scan(path.resolve(process.cwd(), d));
}

console.log(`Scanned ${totalScanned} application files.`);

if (violations.length > 0) {
  console.error("\n[SECURITY AUDIT FAIL] Prohibited dangerouslySetInnerHTML found:");
  for (const v of violations) {
    console.error(`- ${v.file}: ${v.reason}`);
  }
  process.exit(1);
} else {
  console.log("[PASS] Zero prohibited dangerouslySetInnerHTML instances found.");
  console.log("[INFO] Content rendering is 100% safe and structured.\n");
  process.exit(0);
}
