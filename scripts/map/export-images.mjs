import fs from "fs";
import path from "path";
import { optimize } from "svgo";
import { Resvg } from "@resvg/resvg-js";

const SVG_PATH = path.resolve("public/maps/labs-isometric.svg");
const PNG_2X_PATH = path.resolve("public/maps/labs-isometric@2x.png");
const PNG_DARK_PATH = path.resolve("public/maps/labs-isometric-dark.png");

async function exportImages() {
  console.log("=== Step 4: Optimizing SVG & Exporting PNGs via @resvg/resvg-js ===");
  if (!fs.existsSync(SVG_PATH)) {
    throw new Error(`SVG file not found at ${SVG_PATH}`);
  }

  const rawSvg = fs.readFileSync(SVG_PATH, "utf-8");
  console.log(`Original SVG size: ${(rawSvg.length / 1024).toFixed(1)} KB`);

  // Optimize with SVGO
  const svgoResult = optimize(rawSvg, {
    path: SVG_PATH,
    multipass: true,
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            cleanupIds: false, // Keep IDs for animation/referencing
          },
        },
      },
    ],
  });

  const optimizedSvg = svgoResult.data;
  fs.writeFileSync(SVG_PATH, optimizedSvg, "utf-8");
  console.log(`Optimized SVG size: ${(optimizedSvg.length / 1024).toFixed(1)} KB`);

  // 1. Export 2400px wide transparent PNG
  console.log("Rendering 2400px transparent PNG...");
  const resvgTransparent = new Resvg(optimizedSvg, {
    fitTo: { mode: "width", value: 2400 },
    font: {
      loadSystemFonts: true,
      defaultFontFamily: "sans-serif",
    },
  });
  const pngTransparent = resvgTransparent.render().asPng();
  fs.writeFileSync(PNG_2X_PATH, pngTransparent);
  console.log(`Exported: ${PNG_2X_PATH} (${(pngTransparent.length / 1024).toFixed(1)} KB)`);

  // 2. Export 2400px wide dark background PNG
  console.log("Rendering 2400px brand-dark PNG...");
  // Inject a background rectangle with #1E1B1C right after opening svg tag
  const darkSvg = optimizedSvg.replace(
    /(<svg[^>]*>)/i,
    `$1<rect x="-200%" y="-200%" width="500%" height="500%" fill="#1E1B1C" />`
  );

  const resvgDark = new Resvg(darkSvg, {
    fitTo: { mode: "width", value: 2400 },
    font: {
      loadSystemFonts: true,
      defaultFontFamily: "sans-serif",
    },
  });
  const pngDark = resvgDark.render().asPng();
  fs.writeFileSync(PNG_DARK_PATH, pngDark);
  console.log(`Exported: ${PNG_DARK_PATH} (${(pngDark.length / 1024).toFixed(1)} KB)`);
}

exportImages().catch((err) => {
  console.error("Export error:", err);
  process.exit(1);
});
