

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
// Typography: clean sans for labels/body, monospace reserved for NUMBERS (data is the hero)
export const SANS = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
export const MONO = "'DM Mono', 'SF Mono', ui-monospace, monospace";
// ── EDITORIAL GRAYSCALE PALETTE ────────────────────────────────────────────────
// Matches the Coach Report PDF: black/white/grayscale, generous whitespace, thin
// hairlines instead of boxes, bold headlines, muted secondary text. Dark-mode
// inversion of the same print design — near-black bg, off-white text, light-gray rules.
export const LAKE = {
  sky:       "#e8e8e8",  // near-white — primary accent / CTAs (was sky blue)
  peak:      "#9a9a9a",  // mid-gray — secondary / info (was atmospheric blue)
  ochre:     "#c9c9c9",  // light gray — warnings / deload (was ochre)
  forest:    "#ffffff",  // pure white — success / in-range / PRs (was forest green)
  lake:      "#b8b8b8",  // light-mid gray — volume productive zone (was lake teal)
  darkwood:  "#d4d4d4",  // pale gray — completion states (was dark forest)
};
export const C = {
  bg: "#0a0a0a",
  surface: "#131313",
  surface2: "#1c1c1c",
  line: "#2e2e2e",
  lineSoft: "#1c1c1c",
  text: "#f2f2f2",
  textMid: "#9a9a9a",
  textDim: "#5c5c5c",
  accent: LAKE.sky,      // near-white — primary interactive
  // Status hues (Nov 2026): the base stays black/gray with a near-white accent, but
  // status needs a real color so success, warnings and alerts read at a glance.
  amber: "#e0a83a",      // warnings, high volume, deload
  blue: LAKE.peak,       // mid-gray — secondary info
  green: "#4cc38a",      // success, PRs, in-range
  teal: "#4cc38a",       // productive volume (same green as the "green band")
  red: "#e05a4d",        // over MRV, true alerts
};
export const shadow = "0 2px 12px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.4)";
export const shadowLg = "0 8px 30px rgba(0,0,0,0.6)";
