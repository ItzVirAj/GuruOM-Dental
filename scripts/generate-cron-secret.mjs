#!/usr/bin/env node
import crypto from "node:crypto";

const secret = crypto.randomBytes(32).toString("hex");

console.log("\n========================================================");
console.log(" GuruOm Dental - Cron Secret Generation Utility");
console.log("========================================================\n");
console.log("Generated 64-character high-entropy CRON_SECRET:\n");
console.log(`CRON_SECRET=${secret}\n`);
console.log("Add this to your .env.local and production hosting environment.");
console.log("Configure the cron job to send:");
console.log(`Authorization: Bearer ${secret}\n`);
