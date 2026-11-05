import crypto from "node:crypto";

function generateAuthSecret() {
  // Generates 48 cryptographically secure random bytes in base64url format (> 32 bytes)
  return crypto.randomBytes(48).toString("base64url");
}

const secret = generateAuthSecret();
console.log("\nGenerated secure BETTER_AUTH_SECRET:");
console.log(secret);
console.log("\nCopy this value into your .env.local as:");
console.log(`BETTER_AUTH_SECRET="${secret}"\n`);
