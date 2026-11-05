import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import pngToIco from "png-to-ico";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const iconSvgPath = path.join(rootDir, "app", "icon.svg");
const faviconIcoPath = path.join(rootDir, "app", "favicon.ico");
const appleIconPngPath = path.join(rootDir, "app", "apple-icon.png");
const brandInversePath = path.join(rootDir, "public", "brand", "g-icon-orange-on-white.svg");

// 1. Source SVG (with 22% rounded corners for favicon/browser tabs)
const iconSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- brand orange #F7922F -->
  <rect width="64" height="64" rx="14" fill="#F7922F" />
  <path
    d="M 43 21 A 15 15 0 1 0 47 32 H 32"
    fill="none"
    stroke="#FFFFFF"
    stroke-width="8"
    stroke-linecap="butt"
    stroke-linejoin="miter"
  />
</svg>`;

// 2. Full-bleed SVG for Apple Touch Icon (iOS automatically masks/rounds icons)
const appleIconSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- brand orange #F7922F full-bleed for iOS -->
  <rect width="64" height="64" fill="#F7922F" />
  <path
    d="M 43 21 A 15 15 0 1 0 47 32 H 32"
    fill="none"
    stroke="#FFFFFF"
    stroke-width="8"
    stroke-linecap="butt"
    stroke-linejoin="miter"
  />
</svg>`;

// 3. Inverse variant: orange G on white rounded square
const inverseSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- brand orange #F7922F on white -->
  <rect width="64" height="64" rx="14" fill="#FFFFFF" />
  <path
    d="M 43 21 A 15 15 0 1 0 47 32 H 32"
    fill="none"
    stroke="#F7922F"
    stroke-width="8"
    stroke-linecap="butt"
    stroke-linejoin="miter"
  />
</svg>`;

function rasterizeSvg(svgString, size) {
  const resvg = new Resvg(svgString, {
    fitTo: { mode: "width", value: size },
    shapeRendering: 2, // geometricPrecision
    imageRendering: 1, // optimizeQuality
    textRendering: 1,
  });
  return resvg.render().asPng();
}

async function build() {
  console.log("Building GuruOm Dental favicon set...");

  // Write app/icon.svg
  await fs.writeFile(iconSvgPath, iconSvgContent, "utf8");
  console.log(`✓ Wrote ${path.relative(rootDir, iconSvgPath)}`);

  // Ensure public/brand exists and write inverse SVG
  await fs.mkdir(path.dirname(brandInversePath), { recursive: true });
  await fs.writeFile(brandInversePath, inverseSvgContent, "utf8");
  console.log(`✓ Wrote ${path.relative(rootDir, brandInversePath)}`);

  // Generate 16x16, 32x32, 48x48 PNG layers for ICO
  const png16 = rasterizeSvg(iconSvgContent, 16);
  const png32 = rasterizeSvg(iconSvgContent, 32);
  const png48 = rasterizeSvg(iconSvgContent, 48);

  const icoBuffer = await pngToIco([png16, png32, png48]);
  await fs.writeFile(faviconIcoPath, icoBuffer);
  console.log(`✓ Wrote ${path.relative(rootDir, faviconIcoPath)} (16x16, 32x32, 48x48 layers)`);

  // Generate 180x180 apple-icon.png with full-bleed square
  const appleIconPng = rasterizeSvg(appleIconSvgContent, 180);
  await fs.writeFile(appleIconPngPath, appleIconPng);
  console.log(`✓ Wrote ${path.relative(rootDir, appleIconPngPath)} (180x180 full-bleed)`);

  // Verify generated image properties
  const icoStats = await fs.stat(faviconIcoPath);
  const appleMeta = await sharp(appleIconPngPath).metadata();

  console.log("\nFavicon set successfully generated:");
  console.log(`- ${path.relative(rootDir, iconSvgPath)} (SVG source, 64x64 viewBox)`);
  console.log(`- ${path.relative(rootDir, faviconIcoPath)} (${icoStats.size} bytes)`);
  console.log(`- ${path.relative(rootDir, appleIconPngPath)} (${appleMeta.width}x${appleMeta.height} PNG)`);
  console.log(`- ${path.relative(rootDir, brandInversePath)} (SVG inverse variant)`);
}

build().catch((err) => {
  console.error("Failed to build favicons:", err);
  process.exit(1);
});

