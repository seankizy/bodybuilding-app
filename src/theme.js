
// ── DESIGN TOKENS · "KAP marbles" (Nov 2026) ─────────────────────────────────
// Dark Nero Marquina ground, ivory text, and real stone textures for every
// status fill. Inter for everything; Cormorant Garamond only for screen titles
// and hero numbers. Four sizes only: 32 / 44 (Cormorant), 15 / 12 (Inter).
export const SANS = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
// Numbers use Inter with tabular figures (set globally in index.html), so MONO is Inter.
export const MONO = SANS;
export const SERIF = "'Cormorant Garamond', 'Cormorant', Georgia, serif";

export const FS = { title: 32, hero: 44, body: 15, label: 12, input: 16 };

// Stone textures (self-hosted in public/marble). Each value is a complete CSS
// `background` shorthand, so it drops in anywhere a background color went.
const stoneBg = name => `url(/marble/${name}.webp) center / cover`;
export const STONE = {
  nero: stoneBg("nero"),
  cipollino: stoneBg("cipollino"),        // completed sets, carbs
  primary: stoneBg("cipollino-btn"),      // Cipollino Verde pre-blended with #d9ddd5 (soft-light) for primary buttons
  rosa: stoneBg("rosa"),                  // PRs, fat
  bardiglio: stoneBg("bardiglio"),        // protein, below-MEV volume
  arabescato: stoneBg("arabescato"),      // productive / in-range volume
  viola: stoneBg("viola"),                // over-MRV volume, true alerts
  carrara: stoneBg("carrara"),            // selected chips, active tab, rest timer, progress dots
  venato: stoneBg("venato"),              // mesocycle / deload banner
};
// Completed set row: Cipollino under a dark veil so ivory text and inputs still read.
export const DONE_ROW = `linear-gradient(rgba(10,12,10,0.7), rgba(10,12,10,0.7)), ${STONE.cipollino}`;

// Solid tints sampled from each stone, for text, strokes and SVG where a texture can't go.
export const TINT = {
  cipollino: "#b9c7b4",
  rosa: "#e2b4aa",
  bardiglio: "#a9b4c4",
  arabescato: "#e9e8e2",
  viola: "#c9a6be",
  violaDeep: "#d49ab8",
  carrara: "#d7d4d8",
  venato: "#dad6d3",
};

// Ink colors for text sitting on a light stone.
export const INK = { cipollino: "#15201b", stone: "#1a1a1a", rosa: "#3a1f1f" };

export const C = {
  bg: "transparent",                    // the marble ground lives on <body> (index.html)
  page: "#0b0b0b",
  surface: "rgba(12,12,12,0.74)",       // cards
  surface2: "rgba(255,255,255,0.05)",   // tiles / inset controls
  surface3: "rgba(255,255,255,0.07)",   // inputs / tracks
  sheet: "rgba(14,14,14,0.96)",
  handle: "rgba(255,255,255,0.18)",     // sheet grabbers, neutral strokes
  alertWash: "rgba(201,166,190,0.12)",  // Breccia Viola wash behind destructive icons         // modals and bottom sheets (opaque enough over content)
  border: "rgba(255,255,255,0.08)",
  cardBorder: "1px solid rgba(255,255,255,0.08)",
  line: "rgba(255,255,255,0.08)",
  lineSoft: "rgba(255,255,255,0.05)",
  text: "#EEE9E0",                      // ivory
  textMid: "#d9d3c9",
  textDim: "#B8B2A8",                   // secondary / labels
  textFaint: "#8c877f",                 // dim
  ink: INK.cipollino,
  accent: "#EEE9E0",                    // primary interactive text (fills use STONE.primary)
  // Status tints (text, strokes). Fills use STONE.* textures.
  success: TINT.cipollino,
  pr: TINT.rosa,
  warn: TINT.viola,
  alert: TINT.violaDeep,
  low: TINT.bardiglio,
  productive: TINT.arabescato,
  high: TINT.venato,
  selected: TINT.carrara,
  // Legacy names kept so older call sites still resolve (no amber, green or red left).
  amber: TINT.viola,
  blue: TINT.bardiglio,
  green: TINT.cipollino,
  teal: TINT.arabescato,
  red: TINT.violaDeep,
};
// Legacy palette alias (was the grayscale "lake" palette).
export const LAKE = {
  sky: C.accent,
  peak: TINT.rosa,
  ochre: TINT.cipollino,
  forest: TINT.bardiglio,
  lake: TINT.arabescato,
  darkwood: TINT.cipollino,
};

// Map a status tint (or a program day's gray) to its stone fill; anything else passes through.
const FILL_MAP = {
  [TINT.cipollino]: STONE.cipollino,
  [TINT.rosa]: STONE.rosa,
  [TINT.bardiglio]: STONE.bardiglio,
  [TINT.arabescato]: STONE.arabescato,
  [TINT.viola]: STONE.viola,
  [TINT.violaDeep]: STONE.viola,
  [TINT.carrara]: STONE.carrara,
  [TINT.venato]: STONE.venato,
  [C.accent]: STONE.carrara,
  // program.js day colors (grays) read as "selected" when used as a fill
  "#e8e8e8": STONE.carrara, "#f0f0f0": STONE.carrara, "#c4c4c4": STONE.carrara,
  "#c9c9c9": STONE.carrara, "#b8b8b8": STONE.carrara, "#ffffff": STONE.carrara,
};
export const fill = c => FILL_MAP[c] ?? c;
export const isStone = c => typeof c === "string" && c.includes("url(");
// Ink to put on top of fill(c).
export const inkOn = c => {
  if (c === TINT.rosa) return INK.rosa;
  if (c === TINT.cipollino) return INK.cipollino;
  return FILL_MAP[c] ? INK.stone : C.text;
};

// Typography presets
export const TITLE = { fontFamily: SERIF, fontSize: 32, fontWeight: 600, lineHeight: 1.1, letterSpacing: 0.2, fontVariantNumeric: "lining-nums" };
export const HERO = { fontFamily: SERIF, fontSize: 44, fontWeight: 600, lineHeight: 1, fontVariantNumeric: "lining-nums" };

export const shadow = "0 2px 12px rgba(0,0,0,0.35)";
export const shadowLg = "0 8px 30px rgba(0,0,0,0.6)";
