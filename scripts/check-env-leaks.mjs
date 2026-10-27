import fs from "node:fs";
import path from "node:path";

const FORBIDDEN_WORDS = ["SECRET", "KEY", "PASSWORD", "TOKEN", "DATABASE"];

let hasLeak = false;

function checkKey(key, source) {
  if (key.startsWith("NEXT_PUBLIC_")) {
    const upper = key.toUpperCase();
    for (const forbidden of FORBIDDEN_WORDS) {
      if (upper.includes(forbidden)) {
        console.error(
          `[SECURITY VIOLATION] Dangerous public environment variable detected in ${source}: "${key}". Public variables must never expose secrets, keys, passwords, tokens, or databases.`
        );
        hasLeak = true;
      }
    }
  }
}

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
