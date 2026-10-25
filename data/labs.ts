/**
 * GuruOm Dental & Dental Labs — Network Data
 * 
 * Clinical Structure:
 * - 3 In-House Digital Precision Labs: Chh. Sambhajinagar, Ahilyanagar (Flagship), Pune
 * - 7 Regional Service & Delivery Hubs across Maharashtra
 * 
 * Offsets position labels outwards into open canvas space surrounding the 3D map plate
 * so no badges or chips obstruct or sit directly on top of the map districts.
 */

export type LocationType = "lab" | "service";

export interface LabLocation {
  id: string;
  name: string;
  districtId: string;
  districtName?: string;
  type: LocationType;
  tagline: string;
  address: string;
  phone: string;
  hours: string;
  capabilities: string[];
  labelSide?: "left" | "right" | "top" | "bottom" | "auto";
  offset?: { x: number; y: number };
}

export const labs: LabLocation[] = [
  // =========================================================================
  // 3 IN-HOUSE DIGITAL PRECISION LABS
  // =========================================================================
  {
    id: "lab-ahilyanagar",
    name: "Ahilyanagar",
    districtId: "d22",
    districtName: "Ahilyanagar (Ahmednagar)",
    type: "lab",
    tagline: "Flagship Clinic & Central CAD/CAM Milling Lab",
    address: "Sawli Housing Society, Shriram Nagar, Ahilyanagar, Maharashtra 414003",
    phone: "+91 98765 43210",
    hours: "Mon - Sat: 9:00 AM - 8:30 PM",
    capabilities: [
      "In-House CAD/CAM Milling",
      "DMLS 3D Metal Printing",
      "CBCT 3D Diagnostics",
      "Full-Mouth Prosthetics"
    ],
    labelSide: "left",
    offset: { x: -155, y: 0 }
  },
  {
    id: "lab-sambhajinagar",
    name: "Chh. Sambhajinagar",
    districtId: "d15",
    districtName: "Chhatrapati Sambhajinagar",
    type: "lab",
    tagline: "Digital Prosthetics & Zirconia Milling Lab",
    address: "Digital Precision Lab, Chhatrapati Sambhajinagar, Maharashtra",
    phone: "+91 98765 43211",
    hours: "Mon - Sat: 9:00 AM - 8:00 PM",
    capabilities: [
      "High-Translucency Zirconia",
      "Digital Smile Design (DSD)",
      "Clear Aligner Thermoforming",
      "Ceramic Veneer Staining"
    ],
    labelSide: "top",
    offset: { x: 115, y: -120 }
  },
  {
    id: "lab-pune",
    name: "Pune",
    districtId: "d27",
    districtName: "Pune",
    type: "lab",
    tagline: "Additive 3D Printing & Implantology Suite",
    address: "Advanced Precision Lab Suite, Pune, Maharashtra",
    phone: "+91 98765 43212",
    hours: "Mon - Sat: 9:00 AM - 8:00 PM",
    capabilities: [
      "Custom Titanium Abutments",
      "Guided Surgery Stents",
      "Laser Metal Sintering",
      "Same-Day Provisional Bridges"
    ],
    labelSide: "left",
    offset: { x: -105, y: 40 }
  },

  // =========================================================================
  // 7 REGIONAL CLINICAL SERVICE & DELIVERY HUBS
  // =========================================================================
  {
    id: "service-nashik",
    name: "Nashik",
    districtId: "d11",
    districtName: "Nashik",
    type: "service",
    tagline: "Daily Clinical Delivery & Digital Intake",
    address: "Regional Service Desk & Delivery Hub, Nashik",
    phone: "+91 98765 43210",
    hours: "Mon - Sat: 9:00 AM - 7:00 PM",
    capabilities: [
      "Rapid Restorative Pickup",
      "Digital Scan Intake",
      "Clinical Shade Verification"
    ],
    labelSide: "left",
    offset: { x: -110, y: -20 }
  },
  {
    id: "service-nagpur",
    name: "Nagpur",
    districtId: "d02",
    districtName: "Nagpur",
    type: "service",
    tagline: "Vidarbha Clinical Logistics & Support",
    address: "East Maharashtra Service & Logistics Center, Nagpur",
    phone: "+91 98765 43210",
    hours: "Mon - Sat: 9:00 AM - 7:00 PM",
    capabilities: [
      "Overnight Express Courier",
      "Digital File Verification",
      "Warranty Restorations Support"
    ],
    labelSide: "right",
    offset: { x: 145, y: -10 }
  },
  {
    id: "service-jalgaon",
    name: "Jalgaon",
    districtId: "d06",
    districtName: "Jalgaon & Dhule",
    type: "service",
    tagline: "North Maharashtra Service Network",
    address: "North Region Service Desk, Jalgaon",
    phone: "+91 98765 43210",
    hours: "Mon - Sat: 9:00 AM - 7:00 PM",
    capabilities: [
      "Scheduled Route Pickup",
      "Implant Case Logistics",
      "Physical Model Intake"
    ],
    labelSide: "top",
    offset: { x: 0, y: -80 }
  },
  {
    id: "service-jalna",
    name: "Jalna",
    districtId: "d25",
    districtName: "Jalna & Beed",
    type: "service",
    tagline: "Central Maharashtra Partner Clinics Network",
    address: "Central Support & Distribution Point, Jalna",
    phone: "+91 98765 43210",
    hours: "Mon - Sat: 9:00 AM - 7:00 PM",
    capabilities: [
      "Partner Clinic Courier",
      "Same-Day Case Inspection",
      "Prosthetic Delivery Desk"
    ],
    labelSide: "right",
    offset: { x: 270, y: 0 }
  },
  {
    id: "service-nanded",
    name: "Nanded",
    districtId: "d29",
    districtName: "Nanded",
    type: "service",
    tagline: "Marathwada Service & Delivery Center",
    address: "Marathwada Regional Service Hub, Nanded",
    phone: "+91 98765 43210",
    hours: "Mon - Sat: 9:00 AM - 7:00 PM",
    capabilities: [
      "Fast Case Turnaround",
      "Scan-to-Mill Coordination",
      "Restoration Fitting Support"
    ],
    labelSide: "right",
    offset: { x: 200, y: 70 }
  },
  {
    id: "service-solapur",
    name: "Solapur",
    districtId: "d28",
    districtName: "Solapur & Latur",
    type: "service",
    tagline: "South-Central Clinical Service Hub",
    address: "South-Central Support Center, Solapur",
    phone: "+91 98765 43210",
    hours: "Mon - Sat: 9:00 AM - 7:00 PM",
    capabilities: [
      "Daily Logistics Route",
      "Implant Customization Routing",
      "Doctor Assistance Desk"
    ],
    labelSide: "bottom",
    offset: { x: 70, y: 110 }
  },
  {
    id: "service-kolhapur",
    name: "Kolhapur",
    districtId: "d30",
    districtName: "Kolhapur & Sangli",
    type: "service",
    tagline: "Southwest Maharashtra Clinical Network",
    address: "Southwest Regional Service Desk, Kolhapur",
    phone: "+91 98765 43210",
    hours: "Mon - Sat: 9:00 AM - 7:00 PM",
    capabilities: [
      "Full-Arch Restoration Dispatch",
      "Precision Fit Guarantee",
      "Fast Logistics Network"
    ],
    labelSide: "bottom",
    offset: { x: -35, y: 95 }
  }
];

export default labs;
