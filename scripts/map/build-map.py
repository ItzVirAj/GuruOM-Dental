import os
import sys
import math
import json
import cv2
import numpy as np
from PIL import Image
import shapely
from shapely.geometry import Polygon, MultiPolygon
from shapely.ops import polylabel, unary_union

# ==============================================================================
# CONFIGURATION & EDITABLE PARAMETERS
# (Matches user's reference image: front-facing North-Up perspective)
# ==============================================================================

# Planar yaw rotation in degrees:
# -1.5 degrees aligns the northern border (Nandurbar -> Gondia) horizontally,
# matching the exact angle of the reference image.
MAP_ROTATION_DEG = -1.5

# 3D Tilt / Pitch angle in degrees:
# 36.0 degrees foreshortens the vertical axis to achieve the exact 1.58:1 aspect ratio.
ISO_ANGLE_DEG = 36.0

# 3D Extrusion lean angle in degrees (-4.0 gives the slight downward-left extrusion of the reference)
EXTRUSION_LEAN_DEG = -4.0

# Scale factor
ISO_SCALE = 1.0

# Extrusion heights (units)
BASE_SLAB_HEIGHT = 40.0  # Chunky 3D base diorama slab thickness matching reference
NON_LAB_HEIGHT = 5.0     # Height of standard district prisms
LAB_HEIGHT = 22.0        # Elevated height of the 10 lab districts

# Source file locations
MAP_SRC_FILLED = "public/maps/source/maharashtra-map-filled.png"
MAP_SRC_ORIGINAL = "public/maps/source/maharashtra-map-original.png"
DEBUG_IMG = "scripts/map/debug.png"

# Fixed original map canvas center
MAP_CENTER_X = 384.0
MAP_CENTER_Y = 288.0

# Rotation & Projection trigonometry
YAW_RAD = math.radians(MAP_ROTATION_DEG)
YAW_COS = math.cos(YAW_RAD)
YAW_SIN = math.sin(YAW_RAD)
PITCH_FACTOR = math.cos(math.radians(ISO_ANGLE_DEG))
EXTRUDE_DX = math.sin(math.radians(EXTRUSION_LEAN_DEG))
EXTRUDE_DY = math.cos(math.radians(EXTRUSION_LEAN_DEG))

def get_rotated_plane_coords(x, y):
    """Convert (x, y) into centered map-plane coordinates with yaw rotation."""
    dx = x - MAP_CENTER_X
    dy = y - MAP_CENTER_Y
    rx = dx * YAW_COS - dy * YAW_SIN
    ry = dx * YAW_SIN + dy * YAW_COS
    return rx, ry

def project(x, y, z=0.0):
    """
    Project point (x, y) at elevation height z to screen coordinates.
    Matches the front-facing reference image angle and perspective.
    """
    rx, ry = get_rotated_plane_coords(x, y)
    sx = rx * ISO_SCALE + z * EXTRUDE_DX
    sy = ry * PITCH_FACTOR * ISO_SCALE - z * EXTRUDE_DY
    return sx, sy

def chaikin_smoothing(points, iterations=1):
    """Chaikin corner cutting algorithm for smooth, organic district boundaries."""
    pts = np.array(points, dtype=np.float32)
    for _ in range(iterations):
        new_pts = []
        n = len(pts)
        for i in range(n):
            p0 = pts[i]
            p1 = pts[(i + 1) % n]
            q = 0.75 * p0 + 0.25 * p1
            r = 0.25 * p0 + 0.75 * p1
            new_pts.extend([q, r])
        pts = np.array(new_pts, dtype=np.float32)
    return pts

def poly_to_svg_path(coords):
    """Convert a sequence of (x, y) coordinates into an SVG path d string."""
    if not coords or len(coords) < 3:
        return ""
    d_parts = [f"M {coords[0][0]:.2f} {coords[0][1]:.2f}"]
    for pt in coords[1:]:
        d_parts.append(f"L {pt[0]:.2f} {pt[1]:.2f}")
    d_parts.append("Z")
    return " ".join(d_parts)

def build_map():
    print(f"=== Step 1: Loading & Inspecting Map Image (Rotation: {MAP_ROTATION_DEG} deg) ===")
    if not os.path.exists(MAP_SRC_FILLED):
        alt_path = "assets/images/maharashtra-map-filled.png"
        if os.path.exists(alt_path):
            os.makedirs(os.path.dirname(MAP_SRC_FILLED), exist_ok=True)
            import shutil
            shutil.copyfile(alt_path, MAP_SRC_FILLED)
        else:
            raise FileNotFoundError(f"Source map not found at {MAP_SRC_FILLED} or {alt_path}")

    img = Image.open(MAP_SRC_FILLED).convert("RGB")
    arr = np.array(img)
    h, w, _ = arr.shape
    print(f"Map dimensions: {w}x{h}")

    gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    orange_mask = (r > 180) & (b < 120) & (g > 80)
    border_mask = (gray < 130).astype(np.uint8)

    # 1. Label connected regions of non-border pixels
    non_border = (1 - border_mask).astype(np.uint8)
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(non_border)

    # The background outside Maharashtra is the largest component
    areas = stats[:, cv2.CC_STAT_AREA]
    sorted_idx = np.argsort(areas)[::-1]
    bg_label = sorted_idx[0]

    # Filter district regions: exclude border (0), background, and specks < 60 px
    candidate_labels = [i for i in range(num_labels) if i != 0 and i != bg_label and areas[i] > 60]
    print(f"Candidate districts count: {len(candidate_labels)}")

    # Check for lab districts
    lab_labels = []
    for dl in candidate_labels:
        mask = (labels == dl)
        o_count = np.sum(orange_mask & mask)
        if o_count > 100:
            lab_labels.append(dl)

    print(f"Detected {len(lab_labels)} lab districts: {lab_labels}")

    # VERIFY exactly 10 lab districts
    if len(lab_labels) != 10:
        os.makedirs(os.path.dirname(DEBUG_IMG), exist_ok=True)
        debug_img = arr.copy()
        for dl in candidate_labels:
            cx, cy = int(centroids[dl][0]), int(centroids[dl][1])
            is_lab = dl in lab_labels
            color = (0, 255, 0) if is_lab else (255, 0, 0)
            cv2.circle(debug_img, (cx, cy), 6, color, -1)
            cv2.putText(debug_img, f"{dl}", (cx + 8, cy + 4), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 0, 0), 1)
        Image.fromarray(debug_img).save(DEBUG_IMG)
        print(f"ERROR: Expected exactly 10 lab districts, found {len(lab_labels)}. Saved debug image to {DEBUG_IMG}")
        sys.exit(1)

    # If original line-art reference map doesn't exist, create it from filled
    if not os.path.exists(MAP_SRC_ORIGINAL):
        orig = arr.copy()
        orig[orange_mask] = [255, 255, 255]
        for dl in lab_labels:
            cx, cy = int(centroids[dl][0]), int(centroids[dl][1])
            cv2.circle(orig, (cx, cy), 8, (247, 146, 47), -1)
            cv2.circle(orig, (cx, cy), 8, (184, 86, 11), 1)
        Image.fromarray(orig).save(MAP_SRC_ORIGINAL)
        print(f"Saved generated original map reference to {MAP_SRC_ORIGINAL}")

    print("=== Step 2: Vectorizing & Smoothing District Boundaries ===")
    dilation_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    district_data = []

    for dl in candidate_labels:
        mask = (labels == dl).astype(np.uint8)
        dilated = cv2.dilate(mask, dilation_kernel, iterations=1)
        contours, _ = cv2.findContours(dilated, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            continue

        cnt = max(contours, key=cv2.contourArea)
        approx = cv2.approxPolyDP(cnt, epsilon=1.0, closed=True)
        pts = approx.reshape(-1, 2)
        smoothed = chaikin_smoothing(pts, iterations=1)

        poly = Polygon(smoothed).buffer(0)
        if poly.is_empty:
            continue
        if isinstance(poly, MultiPolygon):
            poly = max(poly.geoms, key=lambda p: p.area)

        v_center = polylabel(poly, tolerance=0.5)

        ext_coords = list(poly.exterior.coords)
        if len(ext_coords) > 240:
            subsample = math.ceil(len(ext_coords) / 240)
            ext_coords = ext_coords[::subsample]
            if ext_coords[0] != ext_coords[-1]:
                ext_coords.append(ext_coords[0])

        is_lab = dl in lab_labels
        cx, cy = float(centroids[dl][0]), float(centroids[dl][1])
        bounds = poly.bounds

        # Compute rotated plane depth for sorting
        _, c_ry = get_rotated_plane_coords(cx, cy)

        district_data.append({
            "raw_id": dl,
            "poly": poly,
            "coords": [(float(x), float(y)) for x, y in ext_coords],
            "centroid": [round(cx, 2), round(cy, 2)],
            "visualCenter": [round(float(v_center.x), 2), round(float(v_center.y), 2)],
            "bbox": [round(float(b), 2) for b in bounds],
            "area": round(float(poly.area), 2),
            "isLab": is_lab,
            "point_count": len(ext_coords),
            "rotatedDepth": c_ry
        })

    print(f"Processed {len(district_data)} districts successfully.")

    # Sort districts in reading order for IDs (top-to-bottom primary, left-to-right secondary)
    district_data.sort(key=lambda d: (round(d["centroid"][1] / 28.0), d["centroid"][0]))
    for idx, d in enumerate(district_data):
        d["id"] = f"d{idx+1:02d}"

    # State outline via unary_union
    all_polys = [d["poly"] for d in district_data]
    state_union = unary_union(all_polys).buffer(0)
    if isinstance(state_union, MultiPolygon):
        state_union = max(state_union.geoms, key=lambda p: p.area)
    state_coords = list(state_union.exterior.coords)
    state_outline_d = poly_to_svg_path(state_coords)
    print(f"State outline points: {len(state_coords)}")

    # Sort the 10 lab districts: North to South (y), then West to East (x)
    lab_districts = [d for d in district_data if d["isLab"]]
    lab_districts.sort(key=lambda d: (d["centroid"][1], d["centroid"][0]))
    lab_district_ids = [d["id"] for d in lab_districts]

    print("\n=== Step 3: Lab Districts Auto-Assigned ===")
    for idx, ld in enumerate(lab_districts):
        print(f"  Lab {idx+1}: District {ld['id']} (center={ld['visualCenter']}, centroid={ld['centroid']})")

    # ----------------------------------------------------------------------
    # Compute 3D Isometric Geometry & Side Walls
    # ----------------------------------------------------------------------
    print(f"\n=== Step 4: Computing Extrusions & Depth Sorting (Rotation: {MAP_ROTATION_DEG} deg) ===")
    
    # Depth ordering (painter's algorithm):
    # Sort ascending by rotatedDepth (smaller ry is further in back, larger ry is in front closer to viewer)
    sorted_for_rendering = sorted(district_data, key=lambda d: d["rotatedDepth"])

    iso_districts = []
    all_iso_x = []
    all_iso_y = []

    for d in sorted_for_rendering:
        is_lab = d["isLab"]
        h_val = LAB_HEIGHT if is_lab else NON_LAB_HEIGHT

        top_pts = []
        base_pts = []
        for x, y in d["coords"]:
            bx, by = project(x, y, 0.0)
            tx, ty = project(x, y, h_val)
            base_pts.append((bx, by))
            top_pts.append((tx, ty))
            all_iso_x.extend([bx, tx])
            all_iso_y.extend([by, ty])

        top_path_d = poly_to_svg_path(top_pts)
        base_path_d = poly_to_svg_path(base_pts)

        # Compute side walls for viewer-facing edges
        walls = []
        coords = d["coords"]
        n_pts = len(coords)

        for i in range(n_pts - 1):
            p1 = coords[i]
            p2 = coords[i + 1]
            bx1, by1 = project(p1[0], p1[1], 0.0)
            bx2, by2 = project(p2[0], p2[1], 0.0)
            tx1, ty1 = project(p1[0], p1[1], h_val)
            tx2, ty2 = project(p2[0], p2[1], h_val)

            # Extrusion displacement vector from top to base
            vx = bx1 - tx1
            vy = by1 - ty1

            # Signed screen cross product determines visibility of extruded side walls
            signed_area = (tx1 - tx2) * vy - (ty1 - ty2) * vx
            is_front_facing = signed_area > 0.05

            if is_front_facing:
                nx = ty2 - ty1
                orientation = "left" if nx < -0.2 else "right"
                wall_d = f"M {bx1:.2f} {by1:.2f} L {bx2:.2f} {by2:.2f} L {tx2:.2f} {ty2:.2f} L {tx1:.2f} {ty1:.2f} Z"
                walls.append({
                    "d": wall_d,
                    "orientation": orientation,
                    "edge": [(round(bx1, 2), round(by1, 2)), (round(bx2, 2), round(by2, 2))]
                })

        vx, vy = d["visualCenter"]
        pin_base_x, pin_base_y = project(vx, vy, 0.0)
        pin_top_x, pin_top_y = project(vx, vy, h_val)

        iso_districts.append({
            "id": d["id"],
            "isLab": is_lab,
            "area": d["area"],
            "centroid": d["centroid"],
            "visualCenter": d["visualCenter"],
            "depthScore": round(d["rotatedDepth"], 2),
            "height": h_val,
            "topPath": top_path_d,
            "basePath": base_path_d,
            "originalPath": poly_to_svg_path(d["coords"]),
            "walls": walls,
            "pin": {
                "base": [round(pin_base_x, 2), round(pin_base_y, 2)],
                "top": [round(pin_top_x, 2), round(pin_top_y, 2)],
                "height": h_val
            }
        })

    # Base diorama plate (extruded silhouette)
    base_plate_walls = []
    base_coords = state_coords
    for i in range(len(base_coords) - 1):
        p1 = base_coords[i]
        p2 = base_coords[i + 1]
        bx1, by1 = project(p1[0], p1[1], -BASE_SLAB_HEIGHT)
        bx2, by2 = project(p2[0], p2[1], -BASE_SLAB_HEIGHT)
        tx1, ty1 = project(p1[0], p1[1], 0.0)
        tx2, ty2 = project(p2[0], p2[1], 0.0)
        all_iso_x.extend([bx1, tx1])
        all_iso_y.extend([by1, ty1])

        vx = bx1 - tx1
        vy = by1 - ty1
        signed_area = (tx1 - tx2) * vy - (ty1 - ty2) * vx

        if signed_area > 0.05:
            nx = ty2 - ty1
            orientation = "left" if nx < -0.2 else "right"
            wall_d = f"M {bx1:.2f} {by1:.2f} L {bx2:.2f} {by2:.2f} L {tx2:.2f} {ty2:.2f} L {tx1:.2f} {ty1:.2f} Z"
            base_plate_walls.append({"d": wall_d, "orientation": orientation})

    base_plate_top_d = poly_to_svg_path([project(x, y, 0.0) for x, y in base_coords])
    base_plate_bottom_d = poly_to_svg_path([project(x, y, -BASE_SLAB_HEIGHT) for x, y in base_coords])

    # Dynamic viewBox calculation with comfortable padding
    min_x, max_x = min(all_iso_x) - 70, max(all_iso_x) + 70
    min_y, max_y = min(all_iso_y) - 90, max(all_iso_y) + 70
    view_w = math.ceil(max_x - min_x)
    view_h = math.ceil(max_y - min_y)
    view_box = f"{min_x:.1f} {min_y:.1f} {view_w} {view_h}"
    print(f"Projected ViewBox: {view_box}")

    # ----------------------------------------------------------------------
    # Step 5: Write TypeScript Output Files
    # ----------------------------------------------------------------------
    print("\n=== Step 5: Writing TypeScript Data Files ===")
    
    ts_content = f"""// GENERATED by npm run map:build. Do not edit by hand.

export interface DistrictWall {{
  d: string;
  orientation: "left" | "right";
  edge?: [number, number][];
}}

export interface IsometricDistrict {{
  id: string;
  isLab: boolean;
  area: number;
  centroid: [number, number];
  visualCenter: [number, number];
  depthScore: number;
  height: number;
  topPath: string;
  basePath: string;
  originalPath: string;
  walls: DistrictWall[];
  pin: {{
    base: [number, number];
    top: [number, number];
    height: number;
  }};
}}

export interface BasePlate {{
  topPath: string;
  bottomPath: string;
  walls: DistrictWall[];
  height: number;
}}

export interface MaharashtraMapData {{
  viewBox: string;
  viewBoxBounds: {{ minX: number; minY: number; width: number; height: number }};
  originalSize: {{ width: number; height: number }};
  isoParams: {{
    rotationDeg: number;
    angleDeg: number;
    scale: number;
    baseSlabHeight: number;
    nonLabHeight: number;
    labHeight: number;
  }};
  labDistrictIds: string[];
  stateOutline: string;
  basePlate: BasePlate;
  districts: IsometricDistrict[];
}}

export const MAHARASHTRA_MAP_DATA: MaharashtraMapData = {{
  viewBox: "{view_box}",
  viewBoxBounds: {{
    minX: {min_x:.1f},
    minY: {min_y:.1f},
    width: {view_w},
    height: {view_h}
  }},
  originalSize: {{
    width: {w},
    height: {h}
  }},
  isoParams: {{
    rotationDeg: {MAP_ROTATION_DEG},
    angleDeg: {ISO_ANGLE_DEG},
    scale: {ISO_SCALE},
    baseSlabHeight: {BASE_SLAB_HEIGHT},
    nonLabHeight: {NON_LAB_HEIGHT},
    labHeight: {LAB_HEIGHT}
  }},
  labDistrictIds: {json.dumps(lab_district_ids, indent=2)},
  stateOutline: "{state_outline_d}",
  basePlate: {{
    topPath: "{base_plate_top_d}",
    bottomPath: "{base_plate_bottom_d}",
    height: {BASE_SLAB_HEIGHT},
    walls: {json.dumps(base_plate_walls, indent=4)}
  }},
  districts: {json.dumps(iso_districts, indent=4)}
}};

export default MAHARASHTRA_MAP_DATA;
"""

    for out_path in ["src/data/maharashtra-map.generated.ts", "data/maharashtra-map.generated.ts"]:
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(ts_content)
        print(f"Wrote generated map data to: {out_path}")

    # Check if labs.ts exists, preserve user edits
    labs_ts_path = "data/labs.ts" if os.path.exists("data/labs.ts") else "src/data/labs.ts"
    if not os.path.exists(labs_ts_path):
        labs_list = []
        for idx, ld in enumerate(lab_districts):
            lab_num = idx + 1
            side = "left" if ld["visualCenter"][0] < (w / 2) else "right"
            labs_list.append({
                "id": f"lab-{lab_num}",
                "name": "XYZ",
                "districtId": ld["id"],
                "address": "[PLACEHOLDER] Address line, City",
                "phone": "[PLACEHOLDER]",
                "hours": "[PLACEHOLDER]",
                "labelSide": side,
                "offset": {"x": 0, "y": 0}
            })

        labs_file_content = f"""/**
 * Rename labs here. The map labels, list, tooltips and aria-labels update automatically.
 * Replace all PLACEHOLDER values before launch and never publish unverified addresses or phone numbers.
 */

export interface LabLocation {{
  id: string; // "lab-1" to "lab-10"
  name: string; // "XYZ"
  districtId: string; // matching district id in MAHARASHTRA_MAP_DATA
  address: string;
  phone: string;
  hours: string;
  labelSide?: "left" | "right" | "auto";
  offset?: {{ x: number; y: number }};
}}

export const labs: LabLocation[] = {json.dumps(labs_list, indent=2)};

export default labs;
"""
        for p in ["data/labs.ts", "src/data/labs.ts"]:
            os.makedirs(os.path.dirname(p), exist_ok=True)
            with open(p, "w", encoding="utf-8") as f:
                f.write(labs_file_content)
            print(f"Created initial labs data at: {p}")
    else:
        print(f"Preserved existing labs data in: {labs_ts_path}")

    # 3. Output Static SVG (public/maps/labs-isometric.svg)
    print("\n=== Step 6: Generating Static SVG & Exports ===")
    generate_static_svg(view_box, base_plate_bottom_d, base_plate_walls, base_plate_top_d, iso_districts, lab_districts, min_x, max_x, min_y, max_y)

def generate_static_svg(view_box, base_bottom, base_walls, base_top, districts, lab_districts, min_x, max_x, min_y, max_y):
    """Generate public/maps/labs-isometric.svg with static hex colors matching design tokens."""
    c_brand_dark = "#1E1B1C"
    c_accent = "#F7922F"
    c_surface_alt = "#ECEBE9"
    c_white = "#FFFFFF"
    c_line = "#E0DDDA"
    c_base_wall_left = "#B8B5B1"
    c_base_wall_right = "#6E6A67"
    c_nonlab_wall_left = "#D5D3CF"
    c_nonlab_wall_right = "#B8B5B1"
    c_lab_wall_left = "#D96E14"
    c_lab_wall_right = "#A04604"

    mid_x = (min_x + max_x) / 2
    ground_y = max_y - 80
    ground_rx = (max_x - min_x) * 0.45
    ground_ry = (max_y - min_y) * 0.28

    svg_lines = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view_box}" role="img" aria-label="Map of Maharashtra showing 10 lab locations" width="100%" height="100%">',
        '  <defs>',
        f'    <linearGradient id="nonLabGrad" x1="0%" y1="100%" x2="0%" y2="0%">',
        f'      <stop offset="0%" stop-color="{c_surface_alt}" />',
        f'      <stop offset="100%" stop-color="{c_white}" />',
        '    </linearGradient>',
        f'    <linearGradient id="labGrad" x1="0%" y1="100%" x2="0%" y2="0%">',
        f'      <stop offset="0%" stop-color="{c_accent}" />',
        f'      <stop offset="100%" stop-color="#FFA851" />',
        '    </linearGradient>',
        f'    <linearGradient id="baseTopGrad" x1="0%" y1="100%" x2="0%" y2="0%">',
        f'      <stop offset="0%" stop-color="{c_surface_alt}" />',
        f'      <stop offset="100%" stop-color="{c_white}" />',
        '    </linearGradient>',
        '    <filter id="labGlowFilter" x="-20%" y="-20%" width="140%" height="140%">',
        '      <feGaussianBlur stdDeviation="14" result="blur" />',
        '    </filter>',
        '  </defs>',
        '',
        '  <!-- Background grid & ambient ground shadow -->',
        f'  <ellipse cx="{mid_x:.1f}" cy="{ground_y:.1f}" rx="{ground_rx:.1f}" ry="{ground_ry:.1f}" fill="rgba(0,0,0,0.4)" filter="blur(32px)" />',
        '',
        '  <!-- Base Plate Diorama Slab -->',
        '  <g id="base-plate" class="base-plate">',
    ]

    for w in base_walls:
        fill_col = c_base_wall_left if w["orientation"] == "left" else c_base_wall_right
        svg_lines.append(f'    <path d="{w["d"]}" fill="{fill_col}" stroke="rgba(0,0,0,0.15)" stroke-width="0.5" />')

    svg_lines.append(f'    <path d="{base_top}" fill="url(#baseTopGrad)" stroke="rgba(0,0,0,0.15)" stroke-width="0.75" />')
    svg_lines.append('  </g>')
    svg_lines.append('')

    # Lab glow layer
    svg_lines.append('  <!-- Unified Lab Glow Layer -->')
    svg_lines.append('  <g id="lab-glows" filter="url(#labGlowFilter)" opacity="0.7">')
    for d in districts:
        if d["isLab"]:
            svg_lines.append(f'    <path d="{d["topPath"]}" fill="{c_accent}" />')
    svg_lines.append('  </g>')
    svg_lines.append('')

    # Districts in depth order
    svg_lines.append('  <!-- Districts & Side Walls (Back to Front) -->')
    svg_lines.append('  <g id="districts-layer">')

    for d in districts:
        is_lab = d["isLab"]
        d_id = d["id"]
        svg_lines.append(f'    <g id="district-{d_id}" data-id="{d_id}" data-is-lab="{str(is_lab).lower()}">')

        for w in d["walls"]:
            if is_lab:
                w_fill = c_lab_wall_left if w["orientation"] == "left" else c_lab_wall_right
            else:
                w_fill = c_nonlab_wall_left if w["orientation"] == "left" else c_nonlab_wall_right
            svg_lines.append(f'      <path d="{w["d"]}" fill="{w_fill}" stroke="rgba(0,0,0,0.15)" stroke-width="0.5" />')

        top_fill = "url(#labGrad)" if is_lab else "url(#nonLabGrad)"
        stroke_col = "rgba(255,255,255,0.7)" if is_lab else "rgba(255,255,255,0.5)"
        svg_lines.append(f'      <path d="{d["topPath"]}" fill="{top_fill}" stroke="{stroke_col}" stroke-width="0.75" />')

        if is_lab:
            svg_lines.append(f'      <path d="{d["topPath"]}" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1.2" stroke-linecap="round" />')

        svg_lines.append('    </g>')

    svg_lines.append('  </g>')
    svg_lines.append('')

    # Pins & Labels for 10 Labs
    svg_lines.append('  <!-- Pins & Labels Layer -->')
    svg_lines.append('  <g id="pins-and-labels">')

    radial_offsets = {
        1: (80, -25),
        2: (0, -60),
        3: (-90, -35),
        4: (55, -50),
        5: (-95, -10),
        6: (85, -20),
        7: (-95, 15),
        8: (85, 10),
        9: (65, 45),
        10: (-25, 65),
    }

    for idx, d in enumerate(districts):
        if not d["isLab"]:
            continue
        lab_idx = [ld["id"] for ld in lab_districts].index(d["id"]) + 1
        tx, ty = d["pin"]["top"]
        bx, by = d["pin"]["base"]

        off_x, off_y = radial_offsets.get(lab_idx, (80, -20))
        cx = tx + off_x
        cy = ty + off_y

        chip_w = 48
        chip_h = 22
        chip_x = cx - chip_w / 2
        chip_y = cy - chip_h / 2

        if off_x > 15:
            leader_x = chip_x
            leader_y = cy
        elif off_x < -15:
            leader_x = chip_x + chip_w
            leader_y = cy
        elif off_y < 0:
            leader_x = cx
            leader_y = chip_y + chip_h
        else:
            leader_x = cx
            leader_y = chip_y

        svg_lines.append(f'    <g id="pin-group-lab-{lab_idx}" class="lab-pin-group" data-lab-id="lab-{lab_idx}">')
        svg_lines.append(f'      <ellipse cx="{bx:.2f}" cy="{by:.2f}" rx="14" ry="8" fill="none" stroke="{c_accent}" stroke-width="1.5" opacity="0.6" />')
        svg_lines.append(f'      <ellipse cx="{bx:.2f}" cy="{by:.2f}" rx="4" ry="2.3" fill="rgba(0,0,0,0.5)" />')
        svg_lines.append(f'      <line x1="{bx:.2f}" y1="{by:.2f}" x2="{tx:.2f}" y2="{ty:.2f}" stroke="{c_white}" stroke-width="1.5" stroke-dasharray="2 2" opacity="0.6" />')
        svg_lines.append(f'      <circle cx="{tx:.2f}" cy="{ty - 12:.2f}" r="7" fill="{c_accent}" stroke="{c_white}" stroke-width="2" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))" />')
        svg_lines.append(f'      <circle cx="{tx:.2f}" cy="{ty - 12:.2f}" r="2.5" fill="{c_white}" />')
        svg_lines.append(f'      <line x1="{tx:.2f}" y1="{ty - 12:.2f}" x2="{leader_x:.2f}" y2="{leader_y:.2f}" stroke="rgba(255,255,255,0.7)" stroke-width="1" />')
        svg_lines.append(f'      <rect x="{chip_x:.2f}" y="{chip_y:.2f}" width="{chip_w}" height="{chip_h}" rx="8" fill="{c_white}" stroke="{c_line}" stroke-width="0.5" filter="drop-shadow(0 2px 5px rgba(0,0,0,0.25))" />')
        svg_lines.append(f'      <text x="{chip_x + chip_w/2:.2f}" y="{chip_y + 14.5:.2f}" font-family="DM Sans, sans-serif" font-size="10" font-weight="700" fill="{c_brand_dark}" text-anchor="middle" letter-spacing="0.05em">XYZ</text>')
        svg_lines.append('    </g>')

    # Isometric Compass
    compass_x = max_x - 120
    compass_y = min_y + 40
    svg_lines.append(f'    <g id="iso-compass" transform="translate({compass_x:.1f}, {compass_y:.1f})">')
    svg_lines.append(f'      <ellipse cx="0" cy="0" rx="22" ry="12.7" fill="rgba(30,27,28,0.75)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />')
    svg_lines.append(f'      <polygon points="0,-16 5,-3 -5,-3" fill="{c_accent}" />')
    svg_lines.append(f'      <polygon points="0,16 5,3 -5,3" fill="rgba(255,255,255,0.4)" />')
    svg_lines.append(f'      <text x="0" y="-19" font-family="DM Sans, sans-serif" font-size="9" font-weight="700" fill="{c_white}" text-anchor="middle">N</text>')
    svg_lines.append('    </g>')



    svg_lines.append('  </g>')
    svg_lines.append('</svg>')

    svg_out = "\n".join(svg_lines)
    svg_dest = "public/maps/labs-isometric.svg"
    os.makedirs(os.path.dirname(svg_dest), exist_ok=True)
    with open(svg_dest, "w", encoding="utf-8") as f:
        f.write(svg_out)
    print(f"Generated raw static SVG at: {svg_dest} ({len(svg_out)} bytes)")

if __name__ == "__main__":
    build_map()
