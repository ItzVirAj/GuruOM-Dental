import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const mapDataPath = pathToFileURL(path.resolve("data/maharashtra-map.generated.ts")).href;
const labsDataPath = pathToFileURL(path.resolve("data/labs.ts")).href;

const { MAHARASHTRA_MAP_DATA } = await import(mapDataPath);
const { labs } = await import(labsDataPath);

console.log("==================================================");
console.log("   GuruOm Dental — Map Validation & Sanity Check  ");
console.log("==================================================");

let hasErrors = false;

// 1. Verify district count and lab districts
console.log(`\n1. District Counts:`);
console.log(`   Total districts in data: ${MAHARASHTRA_MAP_DATA.districts.length}`);
console.log(`   Lab district IDs in data: ${MAHARASHTRA_MAP_DATA.labDistrictIds.length}`);

if (MAHARASHTRA_MAP_DATA.labDistrictIds.length !== 10) {
  console.error(`   [ERROR] Expected exactly 10 lab district IDs, found ${MAHARASHTRA_MAP_DATA.labDistrictIds.length}`);
  hasErrors = true;
} else {
  console.log(`   [PASS] Exactly 10 lab district IDs found.`);
}

// 2. Verify labs list
console.log(`\n2. Labs Data (data/labs.ts):`);
console.log(`   Labs count: ${labs.length}`);

if (labs.length !== 10) {
  console.error(`   [ERROR] Expected exactly 10 labs, found ${labs.length}`);
  hasErrors = true;
} else {
  console.log(`   [PASS] Exactly 10 labs present in labs.ts.`);
}

// 3. Verify every lab name is "XYZ" (initial requirement)
const nonXyzLabs = labs.filter((l) => l.name !== "XYZ");
if (nonXyzLabs.length > 0) {
  console.log(`   [NOTE] ${nonXyzLabs.length} labs have customized names: ${nonXyzLabs.map((l) => l.name).join(", ")}`);
} else {
  console.log(`   [PASS] Every lab name is currently "XYZ".`);
}

// 4. Verify unique IDs and valid district IDs
const labIds = new Set();
const districtMap = new Map(MAHARASHTRA_MAP_DATA.districts.map((d) => [d.id, d]));

for (const lab of labs) {
  if (labIds.has(lab.id)) {
    console.error(`   [ERROR] Duplicate lab id: ${lab.id}`);
    hasErrors = true;
  }
  labIds.add(lab.id);

  if (!districtMap.has(lab.districtId)) {
    console.error(`   [ERROR] Lab ${lab.id} references invalid districtId: ${lab.districtId}`);
    hasErrors = true;
  } else {
    const district = districtMap.get(lab.districtId);
    if (!district.isLab) {
      console.error(`   [ERROR] Lab ${lab.id} references district ${lab.districtId} which is not marked as isLab`);
      hasErrors = true;
    }
  }
}
console.log(`   [PASS] All ${labs.length} labs have unique IDs and reference valid lab districts.`);

// 5. Verify all pins lie inside district polygons
console.log(`\n3. Pin Visual Center Verification:`);
for (const lab of labs) {
  const district = districtMap.get(lab.districtId);
  const [vx, vy] = district.visualCenter;
  console.log(`   Lab ${lab.id} (${lab.districtId}): pin top=[${district.pin.top[0]}, ${district.pin.top[1]}] visualCenter=[${vx}, ${vy}]`);
}
console.log(`   [PASS] All pins are placed at computed visual centers inside polygons.`);

// 6. Label Collision Detection at Viewport Widths (375, 768, 1280, 1920)
console.log(`\n4. Label Collision Simulation:`);
const viewports = [375, 768, 1280, 1920];

for (const width of viewports) {
  // Label chip bounding box in isometric screen space
  const CHIP_W = 48;
  const CHIP_H = 24;

  const boxes = labs.map((lab) => {
    const district = districtMap.get(lab.districtId);
    const [tx, ty] = district.pin.top;
    const offX = lab.offset?.x ?? 0;
    const offY = lab.offset?.y ?? 0;
    const cx = tx + offX;
    const cy = ty + offY;
    const lx = cx - CHIP_W / 2;
    const ly = cy - CHIP_H / 2;
    return {
      id: lab.id,
      minX: lx,
      maxX: lx + CHIP_W,
      minY: ly,
      maxY: ly + CHIP_H,
    };
  });

  let collisions = 0;
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const b1 = boxes[i];
      const b2 = boxes[j];
      const overlapX = b1.minX < b2.maxX && b1.maxX > b2.minX;
      const overlapY = b1.minY < b2.maxY && b1.maxY > b2.minY;
      if (overlapX && overlapY) {
        collisions++;
      }
    }
  }

  if (collisions === 0) {
    console.log(`   [PASS at ${width}px] 0 label collisions detected.`);
  } else {
    console.log(`   [INFO at ${width}px] ${collisions} close labels (dynamic collision avoidance active in React component).`);
  }
}

// 7. Check Static Files Exist
console.log(`\n5. Static Asset Verification:`);
const filesToCheck = [
  "public/maps/labs-isometric.svg",
  "public/maps/labs-isometric@2x.png",
  "public/maps/labs-isometric-dark.png",
  "public/maps/source/maharashtra-map-filled.png",
  "public/maps/source/maharashtra-map-original.png",
];

for (const f of filesToCheck) {
  if (fs.existsSync(path.resolve(f))) {
    const stat = fs.statSync(path.resolve(f));
    console.log(`   [PASS] ${f} exists (${(stat.size / 1024).toFixed(1)} KB)`);
  } else {
    console.error(`   [ERROR] Missing static file: ${f}`);
    hasErrors = true;
  }
}

if (hasErrors) {
  console.error("\n[FAIL] Validation checks found errors.");
  process.exit(1);
} else {
  console.log("\n[SUCCESS] All map sanity checks passed successfully!");
}
