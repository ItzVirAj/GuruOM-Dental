import crypto from "node:crypto";

const FORBIDDEN_WORDS = [
  "admin",
  "administrator",
  "login",
  "dashboard",
  "owner",
  "cms",
  "panel",
  "manage",
  "wp-admin",
  "backend",
  "secure",
  "staff",
];

function generateSlug() {
  // Generate groups of random hex characters joined by hyphens (e.g. 6-6-6-6 = 27 chars)
  while (true) {
    const part1 = crypto.randomBytes(3).toString("hex");
    const part2 = crypto.randomBytes(4).toString("hex");
    const part3 = crypto.randomBytes(4).toString("hex");
    const part4 = crypto.randomBytes(3).toString("hex");
    const slug = `${part1}-${part2}-${part3}-${part4}`; // 6 + 1 + 8 + 1 + 8 + 1 + 6 = 27 chars

    const hasForbidden = FORBIDDEN_WORDS.some((word) => slug.includes(word));
    if (!hasForbidden && /^[a-z0-9][a-z0-9-]{19,63}$/.test(slug)) {
      return slug;
    }
  }
}

const slug = generateSlug();
console.log("\nGenerated secure ADMIN_PATH slug:");
console.log(slug);
console.log("\nCopy this value into your .env.local as:");
console.log(`ADMIN_PATH="${slug}"\n`);
