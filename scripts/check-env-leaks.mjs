import fs from "node:fs";
import path from "node:path";

const FORBIDDEN_WORDS = [
  "SECRET",
  "KEY",
  "PASSWORD",
  "TOKEN",
  "DATABASE",
  "CLOUDINARY_API_SECRET",
  "CLOUDINARY_SECRET",
];

let hasLeak = false;

function checkKey(key, source) {
  if (key.startsWith("NEXT_PUBLIC_")) {
    const upper = key.toUpperCase();
    for (const forbidden of FORBIDDEN_WORDS) {
      if (upper.includes(forbidden)) {
        console.error(
          `[SECURITY VIOLATION] Dangerous public environment variable detected in ${source}: "${key}". Public variables must never expose secrets, keys, passwords, tokens, databases, or Cloudinary API secrets.`
        );
        hasLeak = true;
      }
    }
  }
}

// Ensure CLOUDINARY_API_SECRET is never referenced in client component directories
function scanClientFiles(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next" && entry.name !== ".git") {
        scanClientFiles(full);
      }
    } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      const code = fs.readFileSync(full, "utf8");
      // Check if file is a client component
      if (code.includes('"use client"') || code.includes("'use client'")) {
        if (code.includes("CLOUDINARY_API_SECRET") || code.includes("CLOUDINARY_API_KEY")) {
          console.error(
            `[SECURITY VIOLATION] Client component ${path.relative(process.cwd(), full)} directly references Cloudinary API credentials!`
          );
          hasLeak = true;
        }
      }
    }
  }
}

scanClientFiles(path.join(process.cwd(), "components"));
scanClientFiles(path.join(process.cwd(), "app"));
scanClientFiles(path.join(process.cwd(), "src", "lib", "media"));

// Check runtime process.env
for (const key of Object.keys(process.env)) {
  checkKey(key, "process.env");
}

// Check any .env* files in current directory
const cwd = process.cwd();
const files = fs.readdirSync(cwd);
for (const file of files) {
  if (file.startsWith(".env") && fs.statSync(path.join(cwd, file)).isFile()) {
    const content = fs.readFileSync(path.join(cwd, file), "utf8");
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith("#")) continue;
      const match = line.match(/^([A-Za-z0-9_]+)=/);
      if (match) {
        checkKey(match[1], `${file}:${i + 1}`);
      }
    }
  }
}

if (hasLeak) {
  console.error("Environment leak check FAILED.");
  process.exit(1);
} else {
  console.log("Environment leak check PASSED: No sensitive NEXT_PUBLIC_ variables found.");
}
