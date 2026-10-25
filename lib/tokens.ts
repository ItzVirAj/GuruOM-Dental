/**
 * Design system color tokens for GuruOm Dental (Charcoal + Orange Rebrand)
 * Single source of truth matching app/globals.css CSS variables and Tailwind v4 theme.
 */
export const tokens = {
  brand: "#383435",
  brandDark: "#1E1B1C",
  brandLight: "#606060",
  accent: "#F7922F",
  accentSoft: "#FEF1E2",
  accentDeep: "#B8560B",
  onAccent: "#1E1B1C",
  surface: "#F6F5F3",
  surfaceAlt: "#ECEBE9",
  white: "#FFFFFF",
  ink: "#231F20",
  inkMuted: "#6B6667",
  inkInverse: "#FFFFFF",
  line: "#E0DDDA",
  success: "#2E9E6B",
  warning: "#C98A00",
  danger: "#D64545",
} as const;

export type TokenKey = keyof typeof tokens;
