import { describe, it, expect } from "vitest";
import {
  computeCenteredCrop,
  computeOutputDimensions,
  FULL_CROP,
} from "../src/lib/media/client-resize";

describe("Client image crop and size calculations", () => {
  it("returns full crop when targetRatio is null or matches source ratio", () => {
    expect(computeCenteredCrop(1600, 1200, null)).toEqual(FULL_CROP);
    expect(computeCenteredCrop(1600, 1200, 4 / 3)).toEqual(FULL_CROP);
  });

  it("center-crops horizontally when image is wider than target aspect (16:9 -> 4:5)", () => {
    const crop = computeCenteredCrop(1600, 900, 4 / 5);
    expect(crop.y).toBe(0);
    expect(crop.height).toBe(1);
    expect(crop.width).toBeCloseTo((4 / 5) * 900 / 1600, 4);
    expect(crop.x).toBeCloseTo((1 - crop.width) / 2, 4);
  });

  it("center-crops vertically when image is taller than target aspect (3:4 -> 16:10)", () => {
    const crop = computeCenteredCrop(900, 1200, 16 / 10);
    expect(crop.x).toBe(0);
    expect(crop.width).toBe(1);
    expect(crop.height).toBeCloseTo(900 / ((16 / 10) * 1200), 4);
    expect(crop.y).toBeCloseTo((1 - crop.height) / 2, 4);
  });

  it("scales output dimensions without upscaling and caps at 2400px", () => {
    expect(computeOutputDimensions(3000, 2000, 2400, 2400)).toEqual({
      width: 2400,
      height: 1600,
    });
    expect(computeOutputDimensions(1000, 1250, 800, 800)).toEqual({
      width: 640,
      height: 800,
    });
    // Never upscales smaller cropped regions
    expect(computeOutputDimensions(600, 750, 1920, 1920)).toEqual({
      width: 600,
      height: 750,
    });
  });
});
