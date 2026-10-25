import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

console.log("==================================================");
console.log("   GuruOm Dental — Maharashtra Labs Map Builder    ");
console.log("==================================================");

// Find Python executable: prefer scripts/.venv/Scripts/python (or python3)
let pythonPath = "python";
const venvWin = path.resolve("scripts/.venv/Scripts/python.exe");
const venvUnix = path.resolve("scripts/.venv/bin/python");

if (fs.existsSync(venvWin)) {
  pythonPath = venvWin;
} else if (fs.existsSync(venvUnix)) {
  pythonPath = venvUnix;
}

console.log(`Using Python: ${pythonPath}`);

// Run Python vectorization & generation script
const pyRes = spawnSync(pythonPath, ["scripts/map/build-map.py"], {
  stdio: "inherit",
  shell: true,
});

if (pyRes.status !== 0) {
  console.error("build-map.py failed with exit code", pyRes.status);
  process.exit(pyRes.status || 1);
}

// Run Node SVGO & Resvg image exporter
const nodeRes = spawnSync("node", ["scripts/map/export-images.mjs"], {
  stdio: "inherit",
  shell: true,
});

if (nodeRes.status !== 0) {
  console.error("export-images.mjs failed with exit code", nodeRes.status);
  process.exit(nodeRes.status || 1);
}

console.log("\n[SUCCESS] Map build complete. Static assets and TypeScript data generated.");
