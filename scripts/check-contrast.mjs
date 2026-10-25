import fs from 'node:fs';

// Read tokens from app/globals.css to ensure we read active values
const css = fs.readFileSync('app/globals.css', 'utf8');

function extractToken(varName) {
  const match = css.match(new RegExp(`${varName}:\\s*(#[0-9a-fA-F]{6});`));
  if (!match) throw new Error(`Token ${varName} not found in globals.css`);
  return match[1];
}

const tokens = {
  brand: extractToken('--brand'),
  'brand-dark': extractToken('--brand-dark'),
  'brand-light': extractToken('--brand-light'),
  accent: extractToken('--accent'),
  'accent-soft': extractToken('--accent-soft'),
  'accent-deep': extractToken('--accent-deep'),
  'on-accent': extractToken('--on-accent'),
  surface: extractToken('--surface'),
  'surface-alt': extractToken('--surface-alt'),
  white: extractToken('--white'),
  ink: extractToken('--ink'),
  'ink-muted': extractToken('--ink-muted'),
  'ink-inverse': extractToken('--ink-inverse'),
  line: extractToken('--line'),
  success: extractToken('--success'),
  warning: extractToken('--warning'),
  danger: extractToken('--danger'),
};

function hexToRgb(hex) {
  const num = parseInt(hex.slice(1), 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrast(hex1, hex2) {
  const lum1 = luminance(hex1);
  const lum2 = luminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Define pairs actually used in the site design system
const testPairs = [
  { text: 'ink', bg: 'surface', type: 'Normal Text', min: 4.5, context: 'Body text on page background' },
  { text: 'ink', bg: 'surface-alt', type: 'Normal Text', min: 4.5, context: 'Body text on alternate cards' },
  { text: 'ink', bg: 'white', type: 'Normal Text', min: 4.5, context: 'Body text on white cards' },
  { text: 'ink-muted', bg: 'surface', type: 'Normal Text', min: 4.5, context: 'Muted body / captions on surface' },
  { text: 'ink-muted', bg: 'surface-alt', type: 'Normal Text', min: 4.5, context: 'Muted text on surface-alt' },
  { text: 'ink-muted', bg: 'white', type: 'Normal Text', min: 4.5, context: 'Muted text on white' },
  { text: 'white', bg: 'brand', type: 'Normal Text', min: 4.5, context: 'Primary button text, header text' },
  { text: 'white', bg: 'brand-dark', type: 'Normal Text', min: 4.5, context: 'Dark section headings / text' },
  { text: 'white', bg: 'brand-light', type: 'UI / Large Text', min: 3.0, context: 'Badge / pill indicator on brand-light' },
  { text: 'on-accent', bg: 'accent', type: 'Normal Text', min: 4.5, context: 'Secondary button text on orange' },
  { text: 'accent', bg: 'brand', type: 'UI / Large Text', min: 3.0, context: 'Arrow circles, icons on brand' },
  { text: 'accent', bg: 'brand-dark', type: 'Normal Text', min: 4.5, context: 'Eyebrow text, stats counter on dark' },
  { text: 'accent-deep', bg: 'white', type: 'Normal Text', min: 4.5, context: 'Orange text / links on white' },
  { text: 'accent-deep', bg: 'surface', type: 'UI / Large Text', min: 3.0, context: 'Asterisks, icons, bold eyebrows on surface' },
  { text: 'accent-deep', bg: 'surface-alt', type: 'UI / Large Text', min: 3.0, context: 'Asterisks, icons on surface-alt' },
  { text: 'accent-deep', bg: 'accent-soft', type: 'UI / Large Text', min: 3.0, context: 'Badges, pill tags on accent-soft' },
  { text: 'brand', bg: 'accent-soft', type: 'Normal Text', min: 4.5, context: 'Text on accent-soft cards' },
  { text: 'brand-dark', bg: 'accent-soft', type: 'Normal Text', min: 4.5, context: 'Heading text on accent-soft' },
  { text: 'success', bg: 'white', type: 'UI / Large Text', min: 3.0, context: 'Success checkmark icons on white' },
  { text: 'danger', bg: 'white', type: 'UI / Large Text', min: 3.0, context: 'Error icons / alert badges on white' },
  { text: 'warning', bg: 'brand-dark', type: 'Normal Text', min: 4.5, context: 'Warning text / icons on dark' },
];

console.log('='.repeat(80));
console.log('WCAG CONTRAST AUDIT REPORT — GURUOM DENTAL');
console.log('='.repeat(80));
console.log(
  `${'Text Token'.padEnd(14)} | ${'BG Token'.padEnd(14)} | ${'Ratio'.padEnd(7)} | ${'Min'.padEnd(5)} | ${'Status'.padEnd(6)} | Context`
);
console.log('-'.repeat(80));

let passCount = 0;
let failCount = 0;

for (const pair of testPairs) {
  const textHex = tokens[pair.text];
  const bgHex = tokens[pair.bg];
  const ratio = contrast(textHex, bgHex);
  const minRequired = pair.min ?? (pair.type === 'Normal Text' ? 4.5 : 3.0);
  const pass = ratio >= minRequired;
  if (pass) passCount++;
  else failCount++;

  const status = pass ? 'PASS' : 'FAIL';
  console.log(
    `${pair.text.padEnd(14)} | ${pair.bg.padEnd(14)} | ${ratio.toFixed(2).padEnd(7)} | ${minRequired.toFixed(1).padEnd(5)} | ${status.padEnd(6)} | ${pair.context} (${textHex} on ${bgHex})`
  );
}

console.log('-'.repeat(80));
console.log(`Summary: ${passCount} Passed, ${failCount} Failed.`);
console.log('='.repeat(80));

if (failCount > 0) {
  process.exitCode = 1;
}
