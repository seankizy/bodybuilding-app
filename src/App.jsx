import { useState, useEffect, useRef } from "react";

// ── INLINE ICONS (no external dependency) ─────────────────────────────────────
// Minimal SVG icons matching the lucide API (size, color, strokeWidth props).
function Icon({ size = 20, color = "currentColor", strokeWidth = 2, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: "block", flexShrink: 0 }}>
      {children}
    </svg>
  );
}
const ClipboardList = (p) => <Icon {...p}><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/></Icon>;
const BarChart3 = (p) => <Icon {...p}><path d="M3 3v18h18"/><rect x="7" y="10" width="3" height="8"/><rect x="12" y="6" width="3" height="12"/><rect x="17" y="13" width="3" height="5"/></Icon>;
const Scale = (p) => <Icon {...p}><path d="M12 3v18M7 7h10M5 21h14"/><path d="M7 7l-3 7h6zM17 7l-3 7h6z"/></Icon>;
const Database = (p) => <Icon {...p}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></Icon>;
const MoreHorizontal = (p) => <Icon {...p}><circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/></Icon>;
const Dumbbell = (p) => <Icon {...p}><path d="M6.5 6.5l11 11M21 21l-1-1M3 3l1 1M18 22l4-4M2 6l4-4M7 17l-5 5M17 7l5-5"/></Icon>;
const Timer = (p) => <Icon {...p}><path d="M10 2h4M12 14l3-3"/><circle cx="12" cy="14" r="8"/></Icon>;
const Check = (p) => <Icon {...p}><path d="M20 6L9 17l-5-5"/></Icon>;
const X = (p) => <Icon {...p}><path d="M18 6L6 18M6 6l12 12"/></Icon>;
const Plus = (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>;
const ChevronRight = (p) => <Icon {...p}><path d="M9 18l6-6-6-6"/></Icon>;
const ChevronLeft = (p) => <Icon {...p}><path d="M15 18l-6-6 6-6"/></Icon>;
const RotateCcw = (p) => <Icon {...p}><path d="M3 2v6h6"/><path d="M3 8a9 9 0 1 0 3-6.7L3 8"/></Icon>;
const Pause = (p) => <Icon {...p}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></Icon>;
const Play = (p) => <Icon {...p}><path d="M6 4l14 8-14 8z"/></Icon>;
const TrendingUp = (p) => <Icon {...p}><path d="M22 7l-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/></Icon>;
const Trophy = (p) => <Icon {...p}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z"/></Icon>;
const Moon = (p) => <Icon {...p}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></Icon>;
const Flame = (p) => <Icon {...p}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></Icon>;
const ArrowDown = (p) => <Icon {...p}><path d="M12 5v14M19 12l-7 7-7-7"/></Icon>;
const ArrowUp = (p) => <Icon {...p}><path d="M12 19V5M5 12l7-7 7 7"/></Icon>;
const Download = (p) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></Icon>;
const Upload = (p) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></Icon>;
const Pencil = (p) => <Icon {...p}><path d="M17 3a2.83 2.83 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></Icon>;
const Utensils = (p) => <Icon {...p}><path d="M3 2v7c0 1.1.9 2 2 2h1v11M6 2v9M9 2v9M17 2c-2.2 0-4 2.7-4 6s1.8 6 4 6v10"/></Icon>;
const Search = (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></Icon>;
const Camera = (p) => <Icon {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></Icon>;
const Mic = (p) => <Icon {...p}><path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8"/></Icon>;

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
// Typography: clean sans for labels/body, monospace reserved for NUMBERS (data is the hero)
const SANS = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const MONO = "'DM Mono', 'SF Mono', ui-monospace, monospace";
// ── EDITORIAL GRAYSCALE PALETTE ────────────────────────────────────────────────
// Matches the Coach Report PDF: black/white/grayscale, generous whitespace, thin
// hairlines instead of boxes, bold headlines, muted secondary text. Dark-mode
// inversion of the same print design — near-black bg, off-white text, light-gray rules.
const LAKE = {
  sky:       "#e8e8e8",  // near-white — primary accent / CTAs (was sky blue)
  peak:      "#9a9a9a",  // mid-gray — secondary / info (was atmospheric blue)
  ochre:     "#c9c9c9",  // light gray — warnings / deload (was ochre)
  forest:    "#ffffff",  // pure white — success / in-range / PRs (was forest green)
  lake:      "#b8b8b8",  // light-mid gray — volume productive zone (was lake teal)
  darkwood:  "#d4d4d4",  // pale gray — completion states (was dark forest)
};
const C = {
  bg: "#0a0a0a",
  surface: "#131313",
  surface2: "#1c1c1c",
  line: "#2e2e2e",
  lineSoft: "#1c1c1c",
  text: "#f2f2f2",
  textMid: "#9a9a9a",
  textDim: "#5c5c5c",
  accent: LAKE.sky,      // near-white — primary interactive
  amber: LAKE.ochre,     // light gray — warnings, deload
  blue: LAKE.peak,       // mid-gray — secondary info
  green: LAKE.forest,    // white — success, PRs, in-range
  teal: LAKE.lake,       // light gray — volume productive
  red: "#e05a4d",        // keep red as the single non-grayscale accent for true alerts
};
const shadow = "0 2px 12px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.4)";
const shadowLg = "0 8px 30px rgba(0,0,0,0.6)";

// ── PROGRAM DATA ──────────────────────────────────────────────────────────────
// type: "compound" (leave 1–2 RIR) or "isolation" (failure OK on last set)
// muscle: primary muscle group for weekly volume tracking
const PROGRAM = {
  1: {
    title: "Heavy Squats & Legs",
    tag: "LEGS",
    color: "#e8e8e8",
    exercises: [
      { id: "A", name: "Barbell Squat", sets: 4, reps: "8–12", rest: "2m 30s", type: "compound", muscle: "Quads" },
      { id: "B", name: "Leg Press Machine", sets: 2, reps: "6–10", rest: "2m", type: "compound", muscle: "Quads" },
      { id: "C", name: "Leg Extension Machine", sets: 3, reps: "10–15", rest: "1m", type: "isolation", muscle: "Quads" },
      { id: "D", name: "DB Walking Lunge", sets: 3, reps: "10 each leg", rest: "1m", type: "compound", muscle: "Glutes" },
      { id: "E", name: "Seated Calf Raise Machine", sets: 4, reps: "10–15", rest: "1m", type: "isolation", muscle: "Calves" },
    ],
  },
  2: {
    title: "Heavy Bench & Chest",
    tag: "PUSH",
    color: "#f0f0f0",
    exercises: [
      { id: "A", name: "Smith Machine Bench Press", sets: 4, reps: "8–10", rest: "3m", type: "compound", muscle: "Chest" },
      { id: "B", name: "DB Incline Chest Press", sets: 3, reps: "8–12", rest: "1m 30s", type: "compound", muscle: "Chest" },
      { id: "C", name: "Decline Bench Press", sets: 3, reps: "8–12", rest: "1m 30s", type: "compound", muscle: "Chest" },
      { id: "D", name: "Tricep Overhead Extension", sets: 3, reps: "10–15", rest: "1m", type: "isolation", muscle: "Triceps" },
      { id: "E", name: "Cable Pushdown", sets: 3, reps: "10–15", rest: "1m", type: "isolation", muscle: "Triceps" },
    ],
  },
  3: { title: "Rest Day", tag: "REST", color: "#9a9a9a", exercises: [] },
  4: {
    title: "Posterior Chain",
    tag: "PULL",
    color: "#c9c9c9",
    exercises: [
      { id: "A", name: "Prone Hamstring Curl", sets: 4, reps: "2×10-12, 2×15-20", rest: "1m", type: "isolation", muscle: "Hamstrings" },
      { id: "B", name: "Romanian Deadlift", sets: 3, reps: "6–10", rest: "1m 30s", type: "compound", muscle: "Hamstrings" },
      { id: "C", name: "Barbell Hip Thrust", sets: 4, reps: "20–25", rest: "1m", type: "compound", muscle: "Glutes" },
      { id: "D", name: "Barbell Bent Over Row", sets: 3, reps: "6–10", rest: "1m 30s", type: "compound", muscle: "Back" },
      { id: "E", name: "Lat Pulldown", sets: 3, reps: "8–12", rest: "1m 30s", type: "compound", muscle: "Back" },
      { id: "F", name: "Cable Face Pull", sets: 3, reps: "15–20", rest: "1m", type: "isolation", muscle: "Shoulders" },
    ],
  },
  5: { title: "Rest Day", tag: "REST", color: "#9a9a9a", exercises: [] },
  6: {
    title: "Secondary Lower Body",
    tag: "LEGS",
    color: "#b8b8b8",
    exercises: [
      { id: "A", name: "Hack Squat Machine", sets: 4, reps: "8–10", rest: "2m 30s", type: "compound", muscle: "Quads" },
      { id: "B", name: "DB Bulgarian Split Squat", sets: 2, reps: "8–10", rest: "1m", type: "compound", muscle: "Quads" },
      { id: "C", name: "Lat Pulldown", sets: 3, reps: "10–12", rest: "1m", type: "compound", muscle: "Back" },
      { id: "D", name: "Seated Cable Row", sets: 3, reps: "10–12", rest: "1m", type: "compound", muscle: "Back" },
      { id: "E", name: "EZ Bar Curl", sets: 5, reps: "10–12", rest: "1m", type: "isolation", muscle: "Biceps" },
      { id: "F", name: "DB Hammer Curl", sets: 4, reps: "10–12", rest: "1m", type: "isolation", muscle: "Biceps" },
      { id: "G", name: "Standing Calf Raise Machine", sets: 5, reps: "10–15", rest: "1m", type: "isolation", muscle: "Calves" },
    ],
  },
  7: {
    title: "Overhead Press & Push",
    tag: "PUSH",
    color: "#ffffff",
    exercises: [
      { id: "A", name: "DB Shoulder Press", sets: 4, reps: "5–8", rest: "2m", type: "compound", muscle: "Shoulders" },
      { id: "B", name: "DB Lateral Raise (leaning)", sets: 4, reps: "10–15", rest: "1m", type: "isolation", muscle: "Shoulders" },
      { id: "C", name: "Smith Machine Incline Press", sets: 3, reps: "8–12", rest: "1m", type: "compound", muscle: "Chest" },
      { id: "D", name: "Reverse DB Rear Delt Fly", sets: 3, reps: "12–15", rest: "1m", type: "isolation", muscle: "Shoulders" },
      { id: "E", name: "Weighted Dip Machine", sets: 3, reps: "10–12", rest: "1m", type: "compound", muscle: "Chest" },
      { id: "F", name: "Cable Pushdown", sets: 3, reps: "12–15", rest: "1m", type: "isolation", muscle: "Triceps" },
    ],
  },
};

// Mesocycle config — RP-style 5-week block then deload
const MESO_LENGTH = 5; // weeks before deload
const MESO_START = "2026-05-07"; // week 1 anchor (first logged session)

// ── HELPERS ──────────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function restToSeconds(restStr) {
  if (!restStr) return 60;
  const m = restStr.match(/(\d+)\s*m(?:\s*(\d+)\s*s)?/);
  if (m) return parseInt(m[1]) * 60 + (m[2] ? parseInt(m[2]) : 0);
  const s = restStr.match(/(\d+)\s*s/);
  if (s) return parseInt(s[1]);
  return 60;
}
function fmtDate(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}
function newEntry(dateStr) {
  return {
    id: Date.now(),
    date: dateStr,
    programDay: null,
    customTitle: "",
    note: "",
    movements: [],
    completedAt: null,
    warmup: { stretchBefore: false, treadmill: false, stretchAfter: false },
  };
}
function newMovement(name = "") {
  return { id: Date.now() + Math.random(), name, sets: [{ w: "", r: "" }], note: "" };
}

// ── SEED DATA — from original workout screenshots (May 7 2026) ───────────────
// Only used on first load if localStorage is empty.
const SEED_ENTRIES = [
  {
    id: 1000001, date: "2026-05-07", programDay: 1,
    customTitle: "Heavy Squats & Legs", note: "", completedAt: null,
    movements: [
      { id: 1000101, name: "Barbell Squat (power rack)", programRef: "A", setsTarget: 4, repsTarget: "8–12", rest: "2m 30s", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "47.5", r: "12" }, { w: "50", r: "12" }, { w: "52", r: "12" }, { w: "52", r: "9" }] },
      { id: 1000102, name: "Leg Press Machine", programRef: "B", setsTarget: 2, repsTarget: "6–10", rest: "2m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "199.5", r: "10" }, { w: "199.5", r: "9" }] },
      { id: 1000103, name: "Leg Extension", programRef: "C", setsTarget: 3, repsTarget: "10–15", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "32", r: "9" }, { w: "32", r: "10" }, { w: "32", r: "10" }] },
      { id: 1000104, name: "DB Walking Lunge", programRef: "D", setsTarget: 2, repsTarget: "10 each leg", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "32", r: "10" }, { w: "32", r: "7" }] },
      { id: 1000105, name: "Seated Calf Raises (DB on knees)", programRef: "E", setsTarget: 4, repsTarget: "10–15", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "68", r: "15" }, { w: "68", r: "15" }, { w: "68", r: "14" }, { w: "70.5", r: "14" }] },
    ],
  },
  {
    id: 1000002, date: "2026-05-07", programDay: 2,
    customTitle: "Heavy Bench & Chest", note: "", completedAt: null,
    movements: [
      { id: 1000201, name: "Barbell Bench Press (power rack)", programRef: "A", setsTarget: 4, repsTarget: "8–10", rest: "3m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "84", r: "10" }, { w: "84", r: "10" }, { w: "84", r: "12" }, { w: "86", r: "9" }] },
      { id: 1000202, name: "Close Grip Barbell Bench Press", programRef: "B", setsTarget: 3, repsTarget: "8–10", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "70.5", r: "8" }, { w: "70.5", r: "5" }, { w: "61", r: "8" }] },
      { id: 1000203, name: "DB Incline Chest Press", programRef: "C", setsTarget: 3, repsTarget: "8–12", rest: "1m 30s", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "27", r: "12" }, { w: "27", r: "9" }, { w: "27", r: "10" }] },
      { id: 1000204, name: "Tricep Overhead Extension (DB or EZ bar)", programRef: "D", setsTarget: 3, repsTarget: "10–15", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "18", r: "12" }, { w: "18", r: "10" }, { w: "18", r: "10" }] },
      { id: 1000205, name: "Cable Pushdown (Carnelli)", programRef: "E", setsTarget: 3, repsTarget: "10–15", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "18", r: "10" }, { w: "18", r: "11" }, { w: "18", r: "10" }] },
    ],
  },
  {
    id: 1000004, date: "2026-05-07", programDay: 4,
    customTitle: "Posterior Chain", note: "", completedAt: null,
    movements: [
      { id: 1000401, name: "Prone Hamstring Curl", programRef: "A", setsTarget: 4, repsTarget: "2×10-12, 2×15-20", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "32", r: "12" }, { w: "32", r: "8" }, { w: "22.5", r: "16" }, { w: "22.5", r: "13" }] },
      { id: 1000402, name: "Romanian Deadlift (barbell)", programRef: "B", setsTarget: 3, repsTarget: "6–10", rest: "1m 30s", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "70.5", r: "10" }, { w: "70.5", r: "10" }, { w: "70.5", r: "6" }] },
      { id: 1000403, name: "Barbell Hip Thrust (bench + barbell)", programRef: "C", setsTarget: 2, repsTarget: "20–25", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "61", r: "17" }, { w: "61", r: "13" }] },
      { id: 1000404, name: "Barbell Bent Over Row", programRef: "D", setsTarget: 3, repsTarget: "6–10", rest: "1m 30s", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "52", r: "10" }, { w: "52", r: "10" }, { w: "52", r: "" }] },
      { id: 1000405, name: "Lat Pulldown (Carnelli)", programRef: "E", setsTarget: 3, repsTarget: "8–12", rest: "1m 30s", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "54.5", r: "10" }, { w: "54.5", r: "11" }, { w: "54.5", r: "9" }] },
    ],
  },
  {
    id: 1000006, date: "2026-05-07", programDay: 6,
    customTitle: "Secondary Lower Body", note: "", completedAt: null,
    movements: [
      { id: 1000601, name: "Barbell Front Squat (power rack)", programRef: "A", setsTarget: 4, repsTarget: "8–10", rest: "2m 30s", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "50", r: "10" }, { w: "50", r: "10" }, { w: "55", r: "10" }, { w: "55", r: "9" }] },
      { id: 1000602, name: "DB Bulgarian Split Squat", programRef: "B", setsTarget: 2, repsTarget: "8–10", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "27", r: "9" }, { w: "27", r: "11" }] },
      { id: 1000603, name: "Lat Pulldown (Carnelli)", programRef: "C", setsTarget: 3, repsTarget: "10–12", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "59", r: "12" }, { w: "61", r: "10" }, { w: "61", r: "10" }] },
      { id: 1000604, name: "Cable Row (Carnelli low pulley)", programRef: "D", setsTarget: 3, repsTarget: "10–12", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "59", r: "12" }, { w: "59", r: "11" }, { w: "59", r: "9" }] },
      { id: 1000605, name: "EZ Bar Curl", programRef: "E", setsTarget: 4, repsTarget: "10–12", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "16", r: "12" }, { w: "16", r: "10" }, { w: "16", r: "11" }, { w: "16", r: "6" }] },
      { id: 1000606, name: "DB Hammer Curl", programRef: "F", setsTarget: 3, repsTarget: "10–12", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "10", r: "12" }, { w: "10", r: "12" }, { w: "10.5", r: "11" }] },
    ],
  },
  {
    id: 1000007, date: "2026-05-07", programDay: 7,
    customTitle: "Overhead Press & Push", note: "", completedAt: null,
    movements: [
      { id: 1000701, name: "DB Shoulder Press", programRef: "A", setsTarget: 4, repsTarget: "5–8", rest: "2m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "27", r: "8" }, { w: "27", r: "8" }, { w: "27", r: "7" }, { w: "27", r: "7" }] },
      { id: 1000702, name: "DB Lateral Raise (leaning)", programRef: "B", setsTarget: 4, repsTarget: "10–15", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "3.5", r: "15" }, { w: "3.5", r: "15" }, { w: "3.5", r: "10" }, { w: "3.5", r: "9" }] },
      { id: 1000703, name: "Incline Barbell Press (rack + bench)", programRef: "C", setsTarget: 3, repsTarget: "8–12", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "60", r: "10" }, { w: "60", r: "8" }, { w: "60", r: "8" }] },
      { id: 1000704, name: "Reverse DB Rear Delt Fly", programRef: "D", setsTarget: 3, repsTarget: "12–15", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "5.5", r: "13" }, { w: "5.5", r: "15" }, { w: "7", r: "12" }] },
      { id: 1000705, name: "Weighted Dips (belt or DB between legs)", programRef: "E", setsTarget: 3, repsTarget: "10–12", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "BW", r: "10" }, { w: "BW", r: "10" }, { w: "BW", r: "9" }] },
      { id: 1000706, name: "Tricep Pushdown EZ Bar (cable machine)", programRef: "F", setsTarget: 3, repsTarget: "12–15", rest: "1m", note: "Tempo: 1-0-1-0", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "25", r: "10" }, { w: "25", r: "7" }, { w: "22.5", r: "8" }] },
    ],
  },
];
const SEED_WEIGHTS = [];
// ── STORAGE (localStorage — persists across deployments) ──────────────────
async function loadEntries() {
  try {
    const raw = localStorage.getItem("wj_entries");
    if (raw) { const p = JSON.parse(raw); if (Array.isArray(p) && p.length > 0) return p; }
  } catch {}
  return JSON.parse(JSON.stringify(SEED_ENTRIES));
}
async function saveEntries(entries) {
  try {
    const data = JSON.stringify(entries);
    localStorage.setItem("wj_entries", data);
    // Warn if storage is getting large (>4MB)
    const kb = Math.round(data.length / 1024);
    if (kb > 4096) console.warn(`[Journal] Storage at ${kb}KB — consider exporting CSV backup`);
  } catch (e) {
    if (e.name === "QuotaExceededError") {
      alert("Storage full — please export your data as CSV from the journal header, then contact support.");
    }
  }
}

async function loadWeights() {
  try {
    const raw = localStorage.getItem("wj_weights");
    if (raw) { const p = JSON.parse(raw); if (Array.isArray(p) && p.length > 0) return p; }
  } catch {}
  return JSON.parse(JSON.stringify(SEED_WEIGHTS));
}
async function saveWeights(weights) {
  try { localStorage.setItem("wj_weights", JSON.stringify(weights)); } catch {}
}

// ── CSV EXPORT ────────────────────────────────────────────────────────────────
function buildCSV(entries, weights) {
  const rows = [["TYPE","DATE","PROGRAM_DAY","WORKOUT_TITLE","EXERCISE","SET","WEIGHT_LBS","REPS","RIR","SESSION_NOTE","MOVEMENT_NOTE"]];
  for (const e of [...entries].sort((a,b) => a.date.localeCompare(b.date))) {
    if (!e.movements || e.movements.length === 0) {
      rows.push(["WORKOUT", e.date, e.programDay ?? "", e.customTitle, "", "", "", "", "", csvEsc(e.note), ""]);
      continue;
    }
    for (const mv of e.movements) {
      if (!mv.sets || mv.sets.length === 0) {
        rows.push(["WORKOUT", e.date, e.programDay ?? "", e.customTitle, mv.name, "", "", "", "", csvEsc(e.note), csvEsc(mv.note)]);
        continue;
      }
      for (let i = 0; i < mv.sets.length; i++) {
        const s = mv.sets[i];
        rows.push(["WORKOUT", e.date, e.programDay ?? "", e.customTitle, mv.name, i + 1, s.w ?? "", s.r ?? "", s.rir ?? "", i === 0 ? csvEsc(e.note) : "", i === 0 ? csvEsc(mv.note) : ""]);
      }
    }
  }
  for (const w of [...weights].sort((a,b) => a.date.localeCompare(b.date))) {
    rows.push(["BODY_WEIGHT", w.date, "", "", "", "", w.weight, w.unit, "", csvEsc(w.note ?? ""), ""]);
  }
  return rows.map(r => r.map(v => String(v ?? "")).join(",")).join("\n");
}
function csvEsc(v) {
  if (!v) return "";
  if (v.includes(",") || v.includes('"') || v.includes("\n")) return `"${v.replace(/"/g, '""')}"`;
  return v;
}
function downloadCSV(entries, weights) {
  const csv = buildCSV(entries, weights);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `workout_journal_${todayStr()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
function downloadJSON(entries, weights, mesoOverride, cycleAnchor, macros, macroTargets) {
  const payload = { version: 4, exportedAt: new Date().toISOString(), entries, weights, mesoOverride: mesoOverride ?? null, cycleAnchor: cycleAnchor ?? null, macros: macros ?? {}, macroTargets: macroTargets ?? DEFAULT_MACRO_TARGETS };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `workout_backup_${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
function readJSONBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target.result);
        const entries = Array.isArray(parsed) ? parsed : (parsed.entries ?? []);
        const weights = Array.isArray(parsed) ? [] : (parsed.weights ?? []);
        const mesoOverride = parsed.mesoOverride ?? null;
        const cycleAnchor = parsed.cycleAnchor ?? null;
        const macros = parsed.macros ?? null;
        const macroTargets = parsed.macroTargets ?? null;
        resolve({ entries, weights, mesoOverride, cycleAnchor, macros, macroTargets, raw: parsed });
      } catch { reject(new Error("Invalid JSON file")); }
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsText(file);
  });
}
// Detect a standalone macro-app backup: date-keyed object without an .entries array at top level
function isMacroOnlyBackup(parsed) {
  if (Array.isArray(parsed)) return false;
  if (parsed.entries || parsed.movements) return false; // workout backup shape
  const dateKeys = Object.keys(parsed).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k));
  return dateKeys.length > 0;
}

function getLastSession(entries, programDay) {
  return [...entries]
    .filter(e => e.programDay === programDay)
    .sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;
}

// ── RIR FEEDBACK (movement-type aware) ────────────────────────────────────────
// Compounds: leave 1–2 in the tank. Isolation: failure OK on the last set.
function rirFeedback(rir, type, isLastSet) {
  if (rir === "" || rir === null || rir === undefined) return null;
  const r = parseInt(rir);
  if (isNaN(r)) return null;
  if (type === "compound") {
    if (r === 0) return { color: "#e05a4d", msg: "⚠ Leave 1–2 in tank on compounds" };
    if (r <= 2) return { color: "#ffffff", msg: "✓ Ideal effort" };
    return { color: "#c9c9c9", msg: "↑ Push a bit harder" };
  } else {
    // isolation
    if (isLastSet) {
      if (r <= 1) return { color: "#ffffff", msg: "✓ Failure earned here" };
      return { color: "#c9c9c9", msg: "↑ Push closer to failure" };
    }
    if (r <= 2) return { color: "#ffffff", msg: "✓ Good effort" };
    return { color: "#c9c9c9", msg: "↑ A little harder" };
  }
}

// ── WEEKLY VOLUME PER MUSCLE ──────────────────────────────────────────────────
// RP-style volume landmarks (sets/muscle/week): MEV → MAV → MRV
// 8-day training cycle — landmarks are the standard weekly values × (8/7)
const CYCLE_DAYS = 8;
const SCALE = CYCLE_DAYS / 7; // ~1.143 — scales weekly RP landmarks to an 8-day cycle
const VOLUME_LANDMARKS = {
  Chest:     { mev: Math.round(10 * SCALE), mav: Math.round(18 * SCALE), mrv: Math.round(22 * SCALE) },
  Back:      { mev: Math.round(10 * SCALE), mav: Math.round(20 * SCALE), mrv: Math.round(25 * SCALE) },
  Quads:     { mev: Math.round(8  * SCALE), mav: Math.round(16 * SCALE), mrv: Math.round(20 * SCALE) },
  Hamstrings:{ mev: Math.round(6  * SCALE), mav: Math.round(14 * SCALE), mrv: Math.round(18 * SCALE) },
  Glutes:    { mev: Math.round(6  * SCALE), mav: Math.round(14 * SCALE), mrv: Math.round(18 * SCALE) },
  Shoulders: { mev: Math.round(8  * SCALE), mav: Math.round(18 * SCALE), mrv: Math.round(26 * SCALE) },
  Biceps:    { mev: Math.round(8  * SCALE), mav: Math.round(16 * SCALE), mrv: Math.round(20 * SCALE) },
  Triceps:   { mev: Math.round(8  * SCALE), mav: Math.round(16 * SCALE), mrv: Math.round(20 * SCALE) },
  Calves:    { mev: Math.round(8  * SCALE), mav: Math.round(16 * SCALE), mrv: Math.round(20 * SCALE) },
};
function cycleVolume(entries, cycleAnchor) {
  // Count working sets per muscle from the current cycle anchor onward
  // Falls back to completion-based cycle detection if no manual anchor set
  const vol = {};
  for (const e of entries) {
    if (cycleAnchor && e.date < cycleAnchor) continue;
    for (const mv of e.movements) {
      let muscle = mv.muscle;
      if (!muscle && e.programDay && mv.programRef) {
        const progEx = PROGRAM[e.programDay]?.exercises.find(x => x.id === mv.programRef);
        muscle = progEx?.muscle;
      }
      if (!muscle) continue;
      const workingSets = mv.sets.filter(s => s.r && String(s.r).trim() !== "").length;
      vol[muscle] = (vol[muscle] || 0) + workingSets;
    }
  }
  return vol;
}
function volumeStatus(sets, muscle) {
  const lm = VOLUME_LANDMARKS[muscle];
  if (!lm) return { label: "—", color: C.textMid };
  if (sets < lm.mev) return { label: "below MEV", color: C.textMid };
  if (sets <= lm.mav) return { label: "productive", color: C.teal };
  if (sets <= lm.mrv) return { label: "high", color: C.amber };
  return { label: "over MRV", color: C.red };
}

// ── PROGRESSION & PR HELPERS ──────────────────────────────────────────────────
// Epley formula: 1RM = weight × (1 + reps/30), adjusted for RIR
function estimateOneRM(weight, reps, rir = 0) {
  if (!weight || !reps) return null;
  const w = parseFloat(weight), r = parseFloat(reps) + parseFloat(rir || 0);
  if (isNaN(w) || isNaN(r) || r <= 0) return null;
  return Math.round(w * (1 + r / 30));
}

// Best set per session for a given movement (by estimated 1RM)
function bestSetForMovement(mv) {
  let best = null;
  mv.sets.forEach((s, i) => {
    if (!s.w || !s.r) return;
    const e1rm = estimateOneRM(s.w, s.r, s.rir);
    if (e1rm && (!best || e1rm > best.e1rm)) {
      best = { w: parseFloat(s.w), r: parseFloat(s.r), rir: s.rir || 0, e1rm, setIdx: i };
    }
  });
  return best;
}

// All sessions for a specific movement name, sorted oldest→newest
function movementHistory(entries, mvName) {
  const results = [];
  [...entries].sort((a, b) => a.date.localeCompare(b.date)).forEach(e => {
    e.movements.forEach(mv => {
      if (mv.name.toLowerCase() === mvName.toLowerCase()) {
        const best = bestSetForMovement(mv);
        if (best) results.push({ date: e.date, ...best });
      }
    });
  });
  return results;
}

// Get all unique movement names across entries
function allMovementNames(entries) {
  const names = new Set();
  entries.forEach(e => e.movements.forEach(mv => { if (mv.name) names.add(mv.name); }));
  return [...names].sort();
}

// Personal records per movement
function getPersonalRecords(entries) {
  const records = {}; // mvName -> { maxWeight, maxE1RM, date }
  [...entries].sort((a, b) => a.date.localeCompare(b.date)).forEach(e => {
    e.movements.forEach(mv => {
      if (!mv.name) return;
      const best = bestSetForMovement(mv);
      if (!best) return;
      if (!records[mv.name] || best.e1rm > records[mv.name].maxE1RM) {
        records[mv.name] = { maxWeight: best.w, maxE1RM: best.e1rm, date: e.date, reps: best.r };
      }
    });
  });
  return records;
}

// Check if this session's movement is a new PR
function isNewPR(entry, mv, allEntries) {
  const best = bestSetForMovement(mv);
  if (!best) return false;
  const prevEntries = allEntries.filter(e => e.date < entry.date);
  const prevBest = movementHistory(prevEntries, mv.name).slice(-1)[0];
  return !prevBest || best.e1rm > prevBest.e1rm;
}

// Session completion heatmap — last 10 weeks
function sessionHeatmap(entries) {
  const map = {};
  entries.forEach(e => { map[e.date] = (map[e.date] || 0) + 1; });
  return map;
}

// Push/pull balance — sets per category over last cycle
function pushPullBalance(entries) {
  const PUSH_MUSCLES = new Set(["Chest", "Shoulders", "Triceps"]);
  const PULL_MUSCLES = new Set(["Back", "Biceps"]);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 8);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  let push = 0, pull = 0, legs = 0;
  const LEG_MUSCLES = new Set(["Quads", "Hamstrings", "Glutes", "Calves"]);
  entries.filter(e => e.date >= cutoffStr).forEach(e => {
    e.movements.forEach(mv => {
      let muscle = mv.muscle;
      if (!muscle && e.programDay && mv.programRef) {
        const progEx = PROGRAM[e.programDay]?.exercises.find(x => x.id === mv.programRef);
        muscle = progEx?.muscle;
      }
      const sets = mv.sets.filter(s => s.r).length;
      if (PUSH_MUSCLES.has(muscle)) push += sets;
      else if (PULL_MUSCLES.has(muscle)) pull += sets;
      else if (LEG_MUSCLES.has(muscle)) legs += sets;
    });
  });
  return { push, pull, legs };
}

// Coach export — build a formatted text summary
// Find same-program-day repeat sessions for week-over-week comparison
function findRepeatPairs(entries) {
  const completed = [...entries].filter(e => e.completedAt && e.programDay).sort((a, b) => a.date.localeCompare(b.date));
  const byDay = {};
  completed.forEach(e => {
    (byDay[e.programDay] = byDay[e.programDay] || []).push(e);
  });
  const pairs = [];
  Object.keys(byDay).sort((a, b) => a - b).forEach(day => {
    const list = byDay[day];
    if (list.length >= 2) pairs.push({ day: Number(day), prev: list[list.length - 2], curr: list[list.length - 1] });
  });
  return pairs;
}
function topSetWeight(mv) {
  const weights = mv.sets.filter(s => s.w && s.r).map(s => parseFloat(s.w));
  return weights.length ? Math.max(...weights) : null;
}
function summarizeSets(mv) {
  return mv.sets.filter(s => s.r).map(s => `${s.w || "BW"}x${s.r}`).join(", ");
}

// ── COACH PDF (jsPDF, loaded from CDN at call time — no bundler dependency) ──
async function loadJsPDF() {
  if (window.jspdf) return window.jspdf.jsPDF;
  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Could not load PDF library — check connection."));
    document.head.appendChild(script);
  });
  return window.jspdf.jsPDF;
}

async function downloadCoachPDF(entries, weightLog, mesoInfo, windowDays = 35) {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ unit: "pt", format: "letter" });
  const PAGE_W = 612, PAGE_H = 792, MARGIN = 61;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  let y = MARGIN;

  const BLACK = "#111111", DARK = "#333333", MID = "#767676", LIGHTG = "#b8b8b8", FAINT = "#e8e8e8", PANEL = "#f5f5f5";

  function checkPageBreak(needed) {
    if (y + needed > PAGE_H - MARGIN) { doc.addPage(); y = MARGIN; }
  }
  function text(str, x, yy, opts = {}) {
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(opts.size || 10);
    doc.setTextColor(opts.color || DARK);
    doc.text(str, x, yy, { align: opts.align || "left" });
  }
  function hr(yy, color = FAINT, weight = 0.5) {
    doc.setDrawColor(color);
    doc.setLineWidth(weight);
    doc.line(MARGIN, yy, PAGE_W - MARGIN, yy);
  }

  // Header
  text("TRAINING SUMMARY", MARGIN, y, { size: 9, color: MID }); y += 24;
  text("Coach Report", MARGIN, y, { size: 28, bold: true, color: BLACK }); y += 20;
  const today = entries.length ? entries.map(e => e.date).sort().slice(-1)[0] : todayStr();
  const cutoff = new Date(today); cutoff.setDate(cutoff.getDate() - windowDays);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const fmtD = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
  text(`${fmtD(cutoffStr)} - ${fmtD(today)}, ${today.slice(0,4)}  ·  Generated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`, MARGIN, y, { size: 10.5, color: MID });
  y += 16; hr(y, BLACK, 1); y += 26;

  // Stats row
  const recent = [...entries].filter(e => e.date >= cutoffStr && e.completedAt).sort((a, b) => a.date.localeCompare(b.date));
  const recentWeights = [...weightLog].filter(w => w.date >= cutoffStr).sort((a, b) => a.date.localeCompare(b.date));
  const totalSets = recent.reduce((n, e) => n + e.movements.reduce((m, mv) => m + mv.sets.filter(s => s.r).length, 0), 0);
  let weightChange = null;
  if (recentWeights.length >= 2) {
    const sW = parseFloat(recentWeights[0].weight), eW = parseFloat(recentWeights[recentWeights.length-1].weight);
    if (!isNaN(sW) && !isNaN(eW)) weightChange = eW - sW;
  }
  const colW = CONTENT_W / 3;
  [[String(recent.length), "SESSIONS LOGGED"], [String(totalSets), "SETS COMPLETED"], [weightChange !== null ? `${weightChange>=0?"+":""}${weightChange.toFixed(1)}` : "-", "LBS CHANGE"]].forEach(([num, lbl], i) => {
    text(num, MARGIN + i * colW, y, { size: 22, bold: true, color: BLACK });
    text(lbl, MARGIN + i * colW, y + 14, { size: 8, color: MID });
  });
  y += 30; hr(y, FAINT); y += 24;

  // Body weight
  if (recentWeights.length) {
    checkPageBreak(50);
    text("BODY WEIGHT", MARGIN, y, { size: 12, bold: true, color: BLACK }); y += 16;
    doc.setFillColor(PANEL); doc.rect(MARGIN, y - 12, CONTENT_W, 30, "F");
    const fw = recentWeights[0], lw = recentWeights[recentWeights.length - 1];
    text(`${fw.weight} lbs`, MARGIN + 12, y + 6, { size: 10.5, bold: true });
    text(fmtD(fw.date), MARGIN + 80, y + 6, { size: 9, color: MID });
    text("->", MARGIN + 135, y + 6, { size: 9, color: LIGHTG });
    text(`${lw.weight} lbs`, MARGIN + 155, y + 6, { size: 10.5, bold: true });
    text(fmtD(lw.date), MARGIN + 225, y + 6, { size: 9, color: MID });
    if (weightChange !== null) text(`${weightChange>=0?"+":""}${weightChange.toFixed(1)} lbs`, PAGE_W - MARGIN - 12, y + 6, { size: 10.5, bold: true, align: "right" });
    y += 36;
  }

  // Week-over-week
  const repeatPairs = findRepeatPairs(entries);
  if (repeatPairs.length) {
    checkPageBreak(40);
    y += 10;
    text("WEEK-OVER-WEEK: WEIGHT & REPS", MARGIN, y, { size: 12, bold: true, color: BLACK }); y += 14;
    text("Comparing each program day's most recent two occurrences.", MARGIN, y, { size: 9, color: MID }); y += 18;

    repeatPairs.forEach(({ day, prev, curr }) => {
      checkPageBreak(60);
      text(`Day ${day} - ${curr.customTitle || "Session"}`, MARGIN, y, { size: 10.5, bold: true });
      text(`(${fmtD(prev.date)} -> ${fmtD(curr.date)})`, MARGIN + doc.getTextWidth(`Day ${day} - ${curr.customTitle || "Session"}`) + 8, y, { size: 9, color: MID });
      y += 14;
      const colX = [MARGIN, MARGIN + 140, MARGIN + 290, MARGIN + 420];
      ["MOVEMENT", `LAST (${fmtD(prev.date)})`, `THIS (${fmtD(curr.date)})`, "TOP SET"].forEach((h, i) => text(h, colX[i], y, { size: 7, color: MID, bold: true }));
      y += 6; hr(y, BLACK, 0.75); y += 12;
      const currByName = {}; curr.movements.forEach(mv => currByName[mv.name] = mv);
      const prevByName = {}; prev.movements.forEach(mv => prevByName[mv.name] = mv);
      Object.keys(currByName).forEach(name => {
        checkPageBreak(16);
        const cMv = currByName[name], pMv = prevByName[name];
        const cStr = summarizeSets(cMv), pStr = pMv ? summarizeSets(pMv) : "-";
        const cTop = topSetWeight(cMv), pTop = pMv ? topSetWeight(pMv) : null;
        let deltaStr = "-", deltaColor = LIGHTG;
        if (cTop !== null && pTop !== null) {
          const diff = cTop - pTop;
          if (Math.abs(diff) < 0.01) { deltaStr = "no change"; deltaColor = LIGHTG; }
          else if (diff > 0) { deltaStr = `+${diff}`; deltaColor = BLACK; }
          else { deltaStr = `${diff}`; deltaColor = MID; }
        }
        text(name.length > 22 ? name.slice(0, 21) + "…" : name, colX[0], y, { size: 8.5 });
        doc.setFont("courier", "normal"); doc.setFontSize(7.5); doc.setTextColor(MID);
        doc.text(pStr.length > 26 ? pStr.slice(0, 25) + "…" : pStr, colX[1], y);
        doc.setTextColor(DARK);
        doc.text(cStr.length > 26 ? cStr.slice(0, 25) + "…" : cStr, colX[2], y);
        text(deltaStr, colX[3], y, { size: 8.5, bold: true, color: deltaColor });
        y += 6; hr(y, FAINT, 0.3); y += 10;
      });
      y += 8;
    });
  }

  // All sessions
  if (recent.length) {
    checkPageBreak(40);
    y += 6;
    text("ALL SESSIONS THIS WINDOW", MARGIN, y, { size: 12, bold: true, color: BLACK }); y += 14;
    text(`${recent.length} completed sessions in the last ${windowDays} days`, MARGIN, y, { size: 9, color: MID }); y += 18;

    recent.forEach(e => {
      checkPageBreak(30);
      const dayLbl = e.programDay ? `Day ${e.programDay}` : "";
      text(`${fmtD(e.date)}  ${dayLbl}`, MARGIN, y, { size: 10.5, bold: true });
      text(e.customTitle || "Session", PAGE_W - MARGIN, y, { size: 9.5, color: MID, align: "right" });
      y += 14;
      e.movements.forEach(mv => {
        const sets = mv.sets.filter(s => s.w && s.r);
        if (!sets.length) return;
        checkPageBreak(14);
        const setStr = sets.map(s => `${s.w}x${s.r}${s.rir !== undefined && s.rir !== "" ? ` @${s.rir}` : ""}`).join("  ·  ");
        text(mv.name.length > 28 ? mv.name.slice(0,27)+"…" : mv.name, MARGIN, y, { size: 9 });
        doc.setFont("courier", "normal"); doc.setFontSize(8); doc.setTextColor(DARK);
        doc.text(setStr.length > 55 ? setStr.slice(0,54)+"…" : setStr, MARGIN + 165, y);
        y += 13; hr(y - 4, FAINT, 0.3);
      });
      y += 10;
    });
  }

  // Personal records
  const prs = getPersonalRecords(entries);
  const topPrs = Object.entries(prs).sort((a, b) => b[1].maxE1RM - a[1].maxE1RM).slice(0, 8);
  if (topPrs.length) {
    checkPageBreak(40);
    y += 6;
    text("PERSONAL RECORDS", MARGIN, y, { size: 12, bold: true, color: BLACK }); y += 14;
    text("Estimated one-rep max (Epley formula), all-time best per movement", MARGIN, y, { size: 9, color: MID }); y += 18;
    topPrs.forEach(([name, pr], i) => {
      checkPageBreak(20);
      text(String(i+1).padStart(2,"0"), MARGIN, y, { size: 9, bold: true, color: LIGHTG });
      text(name.length > 30 ? name.slice(0,29)+"…" : name, MARGIN + 24, y, { size: 10, bold: true });
      text(`${pr.maxWeight} lbs x ${pr.reps}  ·  ${fmtD(pr.date)}`, MARGIN + 24, y + 12, { size: 8.5, color: MID });
      text(`~${Math.round(pr.maxE1RM)} lbs`, PAGE_W - MARGIN, y + 4, { size: 12, bold: true, align: "right" });
      y += 24; hr(y - 6, FAINT, 0.3);
    });
  }

  // Footer
  checkPageBreak(30);
  y += 16; hr(y, FAINT); y += 12;
  text("Generated automatically from training log data.", MARGIN, y, { size: 8, color: LIGHTG });

  doc.save(`coach_report_${todayStr()}.pdf`);
}

// ── MESOCYCLE ─────────────────────────────────────────────────────────────────
function mesocycleWeek(entries, override) {
  // override = { anchorDate, weekAtAnchor } set manually by the user; takes priority
  let anchor, baseWeekOffset;
  if (override && override.anchorDate) {
    anchor = override.anchorDate;
    baseWeekOffset = (override.weekAtAnchor || 1) - 1; // weeks already elapsed at anchor
  } else {
    const dated = entries.filter(e => e.movements.length > 0).map(e => e.date).sort();
    anchor = dated[0] ?? MESO_START;
    baseWeekOffset = 0;
  }
  const a = new Date(anchor + "T12:00:00");
  const now = new Date();
  const diffWeeks = Math.floor((now - a) / (7 * 24 * 60 * 60 * 1000)) + baseWeekOffset;
  const safeDiff = Math.max(0, diffWeeks);
  const weekInMeso = (safeDiff % MESO_LENGTH) + 1;
  const isDeload = weekInMeso === MESO_LENGTH;
  return { week: weekInMeso, total: MESO_LENGTH, isDeload, cycle: Math.floor(safeDiff / MESO_LENGTH) + 1 };
}

// ── MACRO TRACKING ────────────────────────────────────────────────────────────
// Merged from MacroTracker app. Data model matches the old app so backups import cleanly:
//   wj_macros = { "YYYY-MM-DD": { entries: [{id, name, cal, p, c, f, time}], dayType } }
const DEFAULT_MACRO_TARGETS = {
  training: { p: 220, c: 200, f: 65 },
  rest:     { p: 220, c: 120, f: 60 },
};
function macroCals(p, c, f) {
  return Math.round((parseFloat(p)||0) * 4 + (parseFloat(c)||0) * 4 + (parseFloat(f)||0) * 9);
}
function loadMacros() {
  try {
    const raw = localStorage.getItem("wj_macros");
    if (raw) { const p = JSON.parse(raw); if (p && typeof p === "object" && !Array.isArray(p)) return p; }
  } catch {}
  return {};
}
function saveMacrosLS(data) {
  try { localStorage.setItem("wj_macros", JSON.stringify(data)); } catch (e) {
    if (e.name === "QuotaExceededError") alert("Storage full — export a backup first.");
  }
}
function loadMacroTargets() {
  try {
    const raw = localStorage.getItem("wj_macro_targets");
    if (raw) { const p = JSON.parse(raw); if (p?.training && p?.rest) return p; }
  } catch {}
  return DEFAULT_MACRO_TARGETS;
}
function saveMacroTargetsLS(t) {
  try { localStorage.setItem("wj_macro_targets", JSON.stringify(t)); } catch {}
}
function migrateMacroBackup(raw) {
  const migrated = {};
  Object.keys(raw).forEach(k => {
    if (k.startsWith("__") || k === "exportedAt" || k === "version") return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) return;
    const day = raw[k];
    const normalizeEntry = (e) => ({
      id: e.id ?? Date.now() + Math.random(),
      name: e.name ?? "Food",
      // Old MacroTracker app used calories/protein/carbs/fat; this app uses cal/p/c/f
      cal: e.cal ?? e.calories ?? macroCals(e.p ?? e.protein, e.c ?? e.carbs, e.f ?? e.fat),
      p: e.p ?? e.protein ?? 0,
      c: e.c ?? e.carbs ?? 0,
      f: e.f ?? e.fat ?? 0,
      time: e.time ?? "",
    });
    if (Array.isArray(day)) {
      migrated[k] = { entries: day.map(normalizeEntry), dayType: "training" };
    } else if (day && typeof day === "object") {
      const entries = Array.isArray(day.entries) ? day.entries.map(normalizeEntry) : [];
      const dt = day.dayType === "rest" ? "rest" : "training";
      migrated[k] = { entries, dayType: dt };
    }
  });
  return migrated;
}
// Extract training/rest targets from an old-format backup (__targetsWorkout / __targetsRest)
function extractMacroTargets(raw) {
  const tw = raw.__targetsWorkout;
  const tr = raw.__targetsRest;
  if (!tw && !tr) return null;
  const norm = (t) => t ? { p: t.p ?? t.protein ?? 220, c: t.c ?? t.carbs ?? 150, f: t.f ?? t.fat ?? 60 } : null;
  const training = norm(tw);
  const rest = norm(tr);
  if (!training && !rest) return null;
  return { training: training ?? DEFAULT_MACRO_TARGETS.training, rest: rest ?? DEFAULT_MACRO_TARGETS.rest };
}
function dayTotals(day) {
  const t = { cal: 0, p: 0, c: 0, f: 0 };
  (day?.entries ?? []).forEach(e => {
    t.cal += parseFloat(e.cal) || 0;
    t.p += parseFloat(e.p) || 0;
    t.c += parseFloat(e.c) || 0;
    t.f += parseFloat(e.f) || 0;
  });
  return { cal: Math.round(t.cal), p: Math.round(t.p), c: Math.round(t.c), f: Math.round(t.f) };
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [entries, setEntries] = useState([]);
  const [view, setView] = useState("journal");
  const [activeId, setActiveId] = useState(null);
  const [activeMvId, setActiveMvId] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newDate, setNewDate] = useState(todayStr());
  const [newProgramDay, setNewProgramDay] = useState(null);
  const [tab, setTab] = useState("journal");
  const [weightLog, setWeightLog] = useState([]);
  const [weightInput, setWeightInput] = useState("");
  const [weightDate, setWeightDate] = useState(todayStr());
  const [weightUnit, setWeightUnit] = useState("lbs");
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mesoOverride, setMesoOverride] = useState(null); // { anchorDate, weekAtAnchor }
  const [cycleAnchor, setCycleAnchor] = useState(null); // ISO date string — manual cycle reset
  // Macro tracking state
  const [macros, setMacros] = useState({});
  const [macroTargets, setMacroTargets] = useState(DEFAULT_MACRO_TARGETS);
  const [macroDate, setMacroDate] = useState(todayStr());
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showTargetsModal, setShowTargetsModal] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [foodP, setFoodP] = useState("");
  const [foodC, setFoodC] = useState("");
  const [foodF, setFoodF] = useState("");
  const [aiDescription, setAiDescription] = useState("");
  const [aiPendingReview, setAiPendingReview] = useState(null); // { name, p, c, f, cal } awaiting confirm
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [dayTypeOverride, setDayTypeOverride] = useState(null); // per-date manual override stored in day data
  const [foodPhoto, setFoodPhoto] = useState(null); // { dataUrl, mediaType }
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [macroSearchQuery, setMacroSearchQuery] = useState("");
  const [showMacroSearch, setShowMacroSearch] = useState(false);
  const [showChef, setShowChef] = useState(false);
  const [showMesoEdit, setShowMesoEdit] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [timerState, setTimerState] = useState(null);
  // NEW: between-movement stopwatch
  const [showStopwatch, setShowStopwatch] = useState(false);
  const [stopwatchElapsed, setStopwatchElapsed] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  // Data tab state
  const [filterDay, setFilterDay] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [importMsg, setImportMsg] = useState("");
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);
  const stopwatchRef = useRef(null);

  const activeEntry = entries.find(e => e.id === activeId);
  const activeMv = activeEntry?.movements.find(m => m.id === activeMvId);

  useEffect(() => {
    Promise.all([loadEntries(), loadWeights()]).then(([e, w]) => {
      setEntries(e);
      setWeightLog(w);
      setLoading(false);
    });
    try {
      const raw = localStorage.getItem("wj_meso");
      if (raw) setMesoOverride(JSON.parse(raw));
    } catch {}
    try {
      const ca = localStorage.getItem("wj_cycle_anchor");
      if (ca) setCycleAnchor(ca);
    } catch {}
    setMacros(loadMacros());
    setMacroTargets(loadMacroTargets());
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  function saveMesoOverride(o) {
    setMesoOverride(o);
    try { localStorage.setItem("wj_meso", JSON.stringify(o)); } catch {}
  }
  function saveCycleAnchor(date) {
    setCycleAnchor(date);
    try {
      if (date) localStorage.setItem("wj_cycle_anchor", date);
      else localStorage.removeItem("wj_cycle_anchor");
    } catch {}
  }
  function mutateMacros(fn) {
    setMacros(prev => {
      const next = fn(JSON.parse(JSON.stringify(prev)));
      saveMacrosLS(next);
      return next;
    });
  }
  function saveMacroTargets(t) {
    setMacroTargets(t);
    saveMacroTargetsLS(t);
  }
  // Is the given date a training day? Auto-detect from workout journal, honoring manual override.
  function detectDayType(dateStr) {
    const day = macros[dateStr];
    if (day?.dayTypeManual) return day.dayType; // manual override wins
    const trained = entries.some(e => e.date === dateStr && e.programDay && PROGRAM[e.programDay]?.exercises.length > 0);
    return trained ? "training" : "rest";
  }

  useEffect(() => {
    if (!loading) saveEntries(entries);
  }, [entries, loading]);

  useEffect(() => {
    if (!loading) saveWeights(weightLog);
  }, [weightLog, loading]);

  function mutate(fn) {
    setEntries(prev => {
      const next = fn(JSON.parse(JSON.stringify(prev)));
      saveEntries(next);
      return next;
    });
  }

  // ── TIMER — timestamp-based so backgrounding doesn't desync ─────────────
  const timerDeadlineRef = useRef(null);

  function startTimer(setIdx, totalSeconds) {
    clearInterval(timerRef.current);
    const deadline = Date.now() + totalSeconds * 1000;
    timerDeadlineRef.current = deadline;
    setTimerState({ setIdx, total: totalSeconds, remaining: totalSeconds, running: true });
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((timerDeadlineRef.current - Date.now()) / 1000));
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        setTimerState(prev => prev ? { ...prev, remaining: 0, running: false, done: true } : null);
      } else {
        setTimerState(prev => prev ? { ...prev, remaining } : null);
      }
    }, 500);
  }
  function pauseTimer() {
    clearInterval(timerRef.current);
    setTimerState(prev => prev ? { ...prev, running: false } : null);
  }
  function resumeTimer() {
    if (!timerState || timerState.remaining <= 0) return;
    const deadline = Date.now() + timerState.remaining * 1000;
    timerDeadlineRef.current = deadline;
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((timerDeadlineRef.current - Date.now()) / 1000));
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        setTimerState(prev => prev ? { ...prev, remaining: 0, running: false, done: true } : null);
      } else {
        setTimerState(prev => prev ? { ...prev, remaining } : null);
      }
    }, 500);
    setTimerState(prev => prev ? { ...prev, running: true, done: false } : null);
  }
  function resetTimer(totalSeconds) {
    clearInterval(timerRef.current);
    timerDeadlineRef.current = null;
    setTimerState(prev => prev ? { ...prev, remaining: totalSeconds, running: false, done: false } : null);
  }
  function dismissTimer() {
    clearInterval(timerRef.current);
    timerDeadlineRef.current = null;
    setTimerState(null);
  }

  // ── STOPWATCH — also timestamp-based ──────────────────────────────────────
  const stopwatchStartRef = useRef(null);
  const stopwatchBaseRef = useRef(0);

  function startStopwatch() {
    stopwatchStartRef.current = Date.now();
    stopwatchBaseRef.current = 0;
    setStopwatchElapsed(0);
    setStopwatchRunning(true);
    clearInterval(stopwatchRef.current);
    stopwatchRef.current = setInterval(() => {
      const elapsed = stopwatchBaseRef.current + Math.round((Date.now() - stopwatchStartRef.current) / 1000);
      setStopwatchElapsed(elapsed);
    }, 500);
  }
  function toggleStopwatch() {
    if (stopwatchRunning) {
      clearInterval(stopwatchRef.current);
      stopwatchBaseRef.current = stopwatchBaseRef.current + Math.round((Date.now() - stopwatchStartRef.current) / 1000);
      setStopwatchRunning(false);
    } else {
      stopwatchStartRef.current = Date.now();
      stopwatchRef.current = setInterval(() => {
        const elapsed = stopwatchBaseRef.current + Math.round((Date.now() - stopwatchStartRef.current) / 1000);
        setStopwatchElapsed(elapsed);
      }, 500);
      setStopwatchRunning(true);
    }
  }
  function resetStopwatch() {
    clearInterval(stopwatchRef.current);
    stopwatchStartRef.current = null;
    stopwatchBaseRef.current = 0;
    setStopwatchElapsed(0);
    setStopwatchRunning(false);
  }
  function dismissStopwatch() {
    clearInterval(stopwatchRef.current);
    stopwatchStartRef.current = null;
    stopwatchBaseRef.current = 0;
    setShowStopwatch(false);
    setStopwatchElapsed(0);
    setStopwatchRunning(false);
  }

  function createEntry() {
    const prog = newProgramDay ? PROGRAM[newProgramDay] : null;
    const entry = newEntry(newDate);
    entry.programDay = newProgramDay;
    entry.customTitle = prog ? prog.title : "";
    if (prog) {
      const last = getLastSession(entries, newProgramDay);
      entry.movements = prog.exercises.map(ex => {
        const lastMv = last?.movements.find(m => m.programRef === ex.id) ?? null;
        const lastSets = lastMv?.sets ?? [];
        const seeded = Array.from({ length: ex.sets }, (_, i) => ({
          w: lastSets[i]?.w ?? "",
          r: lastSets[i]?.r ?? "",
          rir: "",
        }));
        return {
          ...newMovement(ex.name),
          id: Date.now() + Math.random(),
          programRef: ex.id,
          setsTarget: ex.sets,
          repsTarget: ex.reps,
          rest: ex.rest,
          type: ex.type ?? "compound",
          muscle: ex.muscle ?? "",
          sets: seeded,
          lastSets: lastSets.length > 0 ? lastSets : null,
          lastDate: last?.date ?? null,
        };
      });
    }
    mutate(prev => [entry, ...prev]);
    setActiveId(entry.id);
    setView("entry");
    setShowNewModal(false);
    setNewProgramDay(null);
  }

  function deleteEntry(id) {
    mutate(prev => prev.filter(e => e.id !== id));
    setView("journal");
  }
  function updateEntry(id, patch) {
    mutate(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  }
  function toggleWarmup(entryId, key) {
    mutate(prev => prev.map(e => e.id === entryId
      ? { ...e, warmup: { ...(e.warmup ?? { stretchBefore: false, treadmill: false, stretchAfter: false }), [key]: !((e.warmup ?? {})[key]) } }
      : e));
  }
  function addMovement(entryId) {
    const mv = newMovement();
    mutate(prev => prev.map(e => e.id === entryId ? { ...e, movements: [...e.movements, mv] } : e));
    setActiveMvId(mv.id);
    setView("movement");
  }
  function updateMovement(entryId, mvId, patch) {
    mutate(prev => prev.map(e => e.id === entryId
      ? { ...e, movements: e.movements.map(m => m.id === mvId ? { ...m, ...patch } : m) }
      : e));
  }
  function deleteMovement(entryId, mvId) {
    mutate(prev => prev.map(e => e.id === entryId
      ? { ...e, movements: e.movements.filter(m => m.id !== mvId) }
      : e));
    setView("entry");
  }
  function addSet(entryId, mvId) {
    mutate(prev => prev.map(e => e.id === entryId
      ? { ...e, movements: e.movements.map(m => m.id === mvId
          ? { ...m, sets: [...m.sets, { w: m.sets.at(-1)?.w ?? "", r: "", rir: "" }] }
          : m) }
      : e));
  }
  function removeSet(entryId, mvId, si) {
    mutate(prev => prev.map(e => e.id === entryId
      ? { ...e, movements: e.movements.map(m => m.id === mvId
          ? { ...m, sets: m.sets.filter((_, i) => i !== si) }
          : m) }
      : e));
  }
  function updateSet(entryId, mvId, si, field, val) {
    mutate(prev => prev.map(e => e.id === entryId
      ? { ...e, movements: e.movements.map(m => m.id === mvId
          ? { ...m, sets: m.sets.map((s, i) => i === si ? { ...s, [field]: val } : s) }
          : m) }
      : e));
  }

  // Reorder movements via drag
  function reorderMovements(entryId, fromIdx, toIdx) {
    mutate(prev => prev.map(e => {
      if (e.id !== entryId) return e;
      const mvs = [...e.movements];
      const [moved] = mvs.splice(fromIdx, 1);
      mvs.splice(toIdx, 0, moved);
      return { ...e, movements: mvs };
    }));
  }

  const today = todayStr();
  // Resumable session = the most recent incomplete session, whenever it was started.
  // (Separate from the journal list filter below, which only *displays* today's incomplete
  // session to avoid clutter — but a workout started days ago and never finished should
  // still be resumable.)
  const incompleteSessions = entries.filter(e => !e.completedAt).sort((a, b) => b.date.localeCompare(a.date));
  const inProgressSession = incompleteSessions[0] ?? null;
  const sorted = [...entries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter(e => {
      // Always show completed sessions
      if (e.completedAt) return true;
      // Show today's incomplete session (in-progress)
      if (e.date === today) return true;
      // Hide all older incomplete sessions
      return false;
    });

  if (loading) {
    return (
      <Shell>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 12 }}>
          <div style={{ fontSize: 32 }}>🏋️</div>
          <div style={{ fontSize: 14, color: "#5c5c5c", fontFamily: SANS, letterSpacing: 2 }}>LOADING…</div>
        </div>
      </Shell>
    );
  }

  // ── MOVEMENT DETAIL ───────────────────────────────────────────────────────
  if (view === "movement" && activeEntry && activeMv) {
    const prog = activeEntry.programDay ? PROGRAM[activeEntry.programDay] : null;
    const color = prog?.color ?? "#e8e8e8";
    const allMvs = activeEntry.movements;
    const curIdx = allMvs.findIndex(m => m.id === activeMv.id);
    const nextMv = allMvs[curIdx + 1] ?? null;
    const isLast = curIdx === allMvs.length - 1;
    const alreadyDone = !!activeMv.doneAt;

    function finishAndAdvance() {
      const hasLoggedReps = activeMv.sets.some(s => s.r && String(s.r).trim() !== "");
      if (!hasLoggedReps) {
        alert("Log at least one set's reps before completing this movement.");
        return;
      }
      const ts = new Date().toISOString();
      updateMovement(activeEntry.id, activeMv.id, { doneAt: ts });
      dismissTimer();
      if (nextMv) {
        // Jump straight to next movement and auto-start a 90s rest timer at the top
        setActiveMvId(nextMv.id);
        setShowStopwatch(false);
        startTimer("movement", 90); // 1.5 min between-movement rest, auto-starts
      } else {
        setView("entry");
      }
    }

    return (
      <Shell>
        <TopBar
          left={<BackBtn onClick={() => { setView("entry"); setShowStopwatch(false); resetStopwatch(); dismissTimer(); }} label={activeEntry.customTitle || "Entry"} />}
          right={
            <button onClick={() => { deleteMovement(activeEntry.id, activeMv.id); }}
              style={btnStyle("#6b2222", "#e05a4d")}>Delete</button>
          }
        />

        {/* Sticky top timer — only for between-MOVEMENT rest (auto-started on Done·Next) */}
        {timerState && timerState.setIdx === "movement" && !showStopwatch && (() => {
          const remaining = timerState.remaining;
          const running = timerState.running;
          const done = timerState.done;
          const total = timerState.total || 90;
          const pct = total > 0 ? remaining / total : 0;
          const R = 18; const circ = 2 * Math.PI * R;
          const mins = Math.floor(remaining / 60), secs = remaining % 60;
          const timeStr = mins > 0 ? `${mins}:${String(secs).padStart(2,"0")}` : `${secs}s`;
          return (
            <div style={{ position: "sticky", top: 0, zIndex: 20, margin: "0 0 4px", padding: "10px 18px", background: done ? "#1c1c1c" : "#131313", borderBottom: `2px solid ${done ? color + "88" : color + "44"}`, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
                <svg width="44" height="44" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="22" cy="22" r={R} fill="none" stroke="#2e2e2e" strokeWidth="3" />
                  <circle cx="22" cy="22" r={R} fill="none" stroke={color} strokeWidth="3"
                    strokeDasharray={`${circ * pct} ${circ}`} strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 0.5s linear" }} />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: remaining >= 60 ? 10 : 13, fontWeight: 900, fontFamily: SANS, color: done ? color : "#f2f2f2" }}>
                  {done ? "GO" : timeStr}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: done ? color : "#9a9a9a", fontFamily: SANS, textTransform: "uppercase", marginBottom: 4 }}>
                  {done ? "✓ Rest complete — start!" : "Rest before this movement · 1m 30s"}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {!done && running && <button onClick={pauseTimer} style={{ ...btnStyle("#2e2e2e", "#9a9a9a"), padding: "4px 10px", fontSize: 11 }}>⏸</button>}
                  {!done && !running && <button onClick={resumeTimer} style={{ ...btnStyle(color + "22", color), padding: "4px 10px", fontSize: 11 }}>▶</button>}
                  <button onClick={() => resetTimer(90)} style={{ ...btnStyle("#2e2e2e", "#9a9a9a"), padding: "4px 10px", fontSize: 11 }}>↺</button>
                  {done && <button onClick={dismissTimer} style={{ ...btnStyle(color, "#131313"), padding: "4px 14px", fontSize: 12, fontWeight: 800 }}>Dismiss</button>}
                </div>
              </div>
            </div>
          );
        })()}

        <div style={{ padding: "4px 18px 16px" }}>
          {activeMv.programRef && (
            <div style={{ fontSize: 11, letterSpacing: 2, color: "#9a9a9a", textTransform: "uppercase", marginBottom: 6, fontFamily: SANS }}>
              {prog?.title} · {activeMv.programRef}
            </div>
          )}
          {/* CHANGE 3: Editable movement name inline */}
          <input
            style={bigInput}
            value={activeMv.name}
            onChange={e => updateMovement(activeEntry.id, activeMv.id, { name: e.target.value })}
            placeholder="Movement name…"
          />
          {activeMv.repsTarget && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              <Pill color={color}>{activeMv.setsTarget} sets</Pill>
              <Pill color={color}>{activeMv.repsTarget} reps</Pill>
              {activeMv.rest && <Pill color="#9a9a9a">Rest {activeMv.rest}</Pill>}
            </div>
          )}
        </div>

        {activeMv.lastSets && activeMv.lastDate && (
          <div style={{ margin: "0 18px 14px", padding: "10px 14px", borderRadius: 12, background: "#131313" }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: "#5c5c5c", textTransform: "uppercase", fontFamily: SANS, marginBottom: 6 }}>
              Last session · {fmtDate(activeMv.lastDate)}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {activeMv.lastSets.map((s, i) => (
                <span key={i} style={{ fontSize: 12, fontFamily: SANS, fontWeight: 700, padding: "4px 9px", borderRadius: 7, background: "#1c1c1c", color: "#e8e8e888" }}>
                  {s.w ? `${s.w}lbs` : "BW"}×{s.r || "?"}
                </span>
              ))}
            </div>
          </div>
        )}

        <SectionLabel>Set Log</SectionLabel>

        {/* CHANGE 1: Stopwatch between movements — shown after finishing a movement */}
        {showStopwatch && (
          <div style={{ margin: "0 18px 14px", padding: "16px", borderRadius: 14, background: "#e8e8e822" }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: "#e8e8e8", textTransform: "uppercase", fontFamily: SANS, marginBottom: 8 }}>Rest Before Next Movement</div>
            <div style={{ fontSize: 42, fontWeight: 900, color: "#e8e8e8", fontFamily: SANS, letterSpacing: 4, textAlign: "center" }}>
              {`${Math.floor(stopwatchElapsed / 60)}:${String(stopwatchElapsed % 60).padStart(2, "0")}`}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "center" }}>
              <button onClick={toggleStopwatch} style={{ ...btnStyle("#1c1c1c", "#e8e8e8"), padding: "8px 16px" }}>
                {stopwatchRunning ? "⏸ Pause" : "▶ Resume"}
              </button>
              <button onClick={resetStopwatch} style={{ ...btnStyle("#2e2e2e", "#9a9a9a"), padding: "8px 14px" }}>↺</button>
              <button onClick={() => {
                dismissStopwatch();
                if (nextMv) { setActiveMvId(nextMv.id); setTimerState(null); }
                else setView("entry");
              }} style={{ ...btnStyle("#e8e8e8", "#131313"), padding: "8px 16px", fontWeight: 800 }}>
                Next: {nextMv?.name?.split(" ")[0] || "Done"} →
              </button>
            </div>
          </div>
        )}

        {!showStopwatch && activeMv.sets.map((s, i) => {
          const restSecs = restToSeconds(activeMv.rest);
          const setDone = !!s.done;
          const isTimerSet = timerState?.setIdx === i; // between-set timer for this set
          return (
            <div key={i}>
              <SetRow
                num={i + 1}
                weight={s.w} reps={s.r} rir={s.rir ?? ""}
                repsTarget={activeMv.repsTarget ?? null}
                type={activeMv.type ?? (activeEntry.programDay && activeMv.programRef ? (PROGRAM[activeEntry.programDay]?.exercises.find(x => x.id === activeMv.programRef)?.type ?? "compound") : "compound")}
                isLastSet={i === activeMv.sets.length - 1}
                done={setDone}
                color={color}
                onW={v => updateSet(activeEntry.id, activeMv.id, i, "w", v)}
                onR={v => {
                  updateSet(activeEntry.id, activeMv.id, i, "r", v);
                  if (v && String(v) !== "0" && i < activeMv.sets.length - 1) {
                    startTimer(i, restSecs);
                  }
                }}
                onRIR={v => updateSet(activeEntry.id, activeMv.id, i, "rir", v)}
                onDelete={activeMv.sets.length > 1 ? () => removeSet(activeEntry.id, activeMv.id, i) : null}
                onDone={() => {
                  const ts = s.done ? null : new Date().toISOString();
                  updateSet(activeEntry.id, activeMv.id, i, "done", ts);
                  if (!s.done && i < activeMv.sets.length - 1) {
                    startTimer(i, restSecs);
                  }
                }}
              />
              {/* Inline rest timer between sets (not after the last set) */}
              {i < activeMv.sets.length - 1 && (
                <RestTimer
                  restSecs={restSecs}
                  restLabel={activeMv.rest}
                  color={color}
                  timerState={isTimerSet ? timerState : null}
                  onStart={() => startTimer(i, restSecs)}
                  onPause={pauseTimer}
                  onResume={resumeTimer}
                  onReset={() => resetTimer(restSecs)}
                  onDismiss={dismissTimer}
                />
              )}
            </div>
          );
        })}

        {!showStopwatch && <GhostBtn onClick={() => addSet(activeEntry.id, activeMv.id)}>+ Add Set</GhostBtn>}

        <SectionLabel>Notes</SectionLabel>
        <textarea
          style={noteArea}
          value={activeMv.note}
          onChange={e => updateMovement(activeEntry.id, activeMv.id, { note: e.target.value })}
          placeholder="Form cues, how it felt, adjustments…"
          rows={4}
        />

        {!showStopwatch && (
          <div style={{ padding: "16px 18px 120px" }}>
            {alreadyDone ? (
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => updateMovement(activeEntry.id, activeMv.id, { doneAt: null })}
                  style={{ flex: 1, padding: "13px", borderRadius: 14, background: "transparent", color: "#5c5c5c", fontSize: 13, fontFamily: SANS, fontWeight: 700, cursor: "pointer" }}>
                  ↩ Undo Done
                </button>
                {nextMv && (
                  <button onClick={() => { dismissTimer(); setActiveMvId(nextMv.id); }}
                    style={{ flex: 2, padding: "13px", borderRadius: 14, background: "#1c1c1c", color: "#f2f2f2", fontSize: 14, fontFamily: SANS, fontWeight: 800, cursor: "pointer" }}>
                    Next: {nextMv.name || "Movement"} →
                  </button>
                )}
              </div>
            ) : (
              <button onClick={finishAndAdvance} style={{
                width: "100%", padding: "18px", borderRadius: 16,
                background: isLast
                  ? "linear-gradient(135deg, #e8e8e8, #e8e8e8)"
                  : `linear-gradient(135deg, ${color}, ${color}cc)`,
                border: "none", color: "#131313",
                fontSize: 15, fontWeight: 900, cursor: "pointer",
                fontFamily: SANS, letterSpacing: 1,
                boxShadow: `0 4px 24px ${color}33`,
              }}>
                {isLast ? "✓ FINISH LAST MOVEMENT" : `✓ DONE · NEXT: ${(nextMv?.name || "Next").toUpperCase()}`}
              </button>
            )}
          </div>
        )}
        <BottomNav tab={tab} setTab={t => { setTab(t); if (t !== "journal") setView("journal"); }} onOpenMenu={() => setShowMoreMenu(true)} />
        <MoreMenu open={showMoreMenu} onClose={() => setShowMoreMenu(false)} onSelect={(id) => { setShowMoreMenu(false); setTab(id); setView("journal"); }} />
      </Shell>
    );
  }

  // ── ENTRY DETAIL ──────────────────────────────────────────────────────────
  if (view === "entry" && activeEntry) {
    const prog = activeEntry.programDay ? PROGRAM[activeEntry.programDay] : null;
    const color = prog?.color ?? "#e8e8e8";
    const isRest = prog?.exercises?.length === 0;

    return (
      <Shell>
        <TopBar
          left={<BackBtn onClick={() => setView("journal")} label="Journal" />}
          right={
            <button onClick={() => deleteEntry(activeEntry.id)}
              style={btnStyle("#6b2222", "#e05a4d")}>Delete</button>
          }
        />
        <div style={{ padding: "4px 18px 0" }}>
          <input type="date" style={{ ...ghostInput, fontSize: 16, color: "#9a9a9a", marginBottom: 6 }}
            value={activeEntry.date}
            onChange={e => updateEntry(activeEntry.id, { date: e.target.value })} />
          <input style={bigInput} value={activeEntry.customTitle}
            onChange={e => updateEntry(activeEntry.id, { customTitle: e.target.value })}
            placeholder="Workout title…" />
          {prog && (
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              <Pill color={color}>Day {activeEntry.programDay}</Pill>
              <Pill color={color}>{prog.tag}</Pill>
            </div>
          )}
        </div>

        <SectionLabel>Session Notes</SectionLabel>
        <textarea style={noteArea} value={activeEntry.note}
          onChange={e => updateEntry(activeEntry.id, { note: e.target.value })}
          placeholder="How did today feel? Energy, sleep, PRs, anything…" rows={3} />

        {isRest ? (
          <div style={{ margin: "20px 18px", padding: "28px 20px", borderRadius: 16, background: "#1c1c1c", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}><Moon size={34} color={C.textMid} strokeWidth={1.8} /></div>
            <div style={{ color: "#f2f2f2", fontWeight: 700, fontSize: 18 }}>Rest Day</div>
            <div style={{ color: "#9a9a9a", fontSize: 13, marginTop: 4 }}>Recovery is part of the program</div>
          </div>
        ) : (
          <>
            <SectionLabel>Warm-up</SectionLabel>
            <WarmupItem
              label="Stretching"
              checked={!!activeEntry.warmup?.stretchBefore}
              onToggle={() => toggleWarmup(activeEntry.id, "stretchBefore")}
            />
            <WarmupItem
              label="Incline Treadmill (10 min)"
              checked={!!activeEntry.warmup?.treadmill}
              onToggle={() => toggleWarmup(activeEntry.id, "treadmill")}
            />

            <SectionLabel>{activeEntry.movements.length} Movement{activeEntry.movements.length !== 1 ? "s" : ""}</SectionLabel>
            {activeEntry.movements.map((mv, i) => {
              const mvDone = !!mv.doneAt;
              const canMoveUp = i > 0;
              const isPR = isNewPR(activeEntry, mv, entries);
              const canMoveDown = i < activeEntry.movements.length - 1;
              return (
                <div key={mv.id}>
                  <MvCard color={mvDone ? "#e8e8e8" : color}
                    onClick={() => { setActiveMvId(mv.id); setView("movement"); setShowStopwatch(false); resetStopwatch(); }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div onClick={e => {
                        e.stopPropagation();
                        const hasLoggedReps = mv.sets.some(s => s.r && String(s.r).trim() !== "");
                        if (!mv.doneAt && !hasLoggedReps) {
                          alert("Log at least one set's reps before marking this movement done.");
                          return;
                        }
                        const ts = mv.doneAt ? null : new Date().toISOString();
                        updateMovement(activeEntry.id, mv.id, { doneAt: ts });
                      }} style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        background: mvDone ? "#e8e8e8" : "#1c1c1c",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, cursor: "pointer", transition: "all 0.15s",
                      }}>
                        {mvDone ? <span style={{ color: "#131313" }}>✓</span> : <span style={{ fontSize: 11, fontFamily: SANS, fontWeight: 800, color: "#5c5c5c" }}>{mv.programRef ?? String(i + 1)}</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: mvDone ? "#e8e8e8" : "#f2f2f2", lineHeight: 1.3, textDecoration: mvDone ? "line-through" : "none", opacity: mvDone ? 0.7 : 1, display: "flex", alignItems: "center", gap: 6 }}>
                          {mv.name || <span style={{ color: "#5c5c5c" }}>Unnamed movement</span>}
                          {isPR && <span style={{ fontSize: 9, fontWeight: 800, color: "#0a0a0a", background: LAKE.ochre, padding: "2px 6px", borderRadius: 4, letterSpacing: 0.5, flexShrink: 0 }}>PR</span>}
                        </div>
                        <div style={{ fontSize: 12, color: "#9a9a9a", marginTop: 3 }}>
                          {mv.repsTarget ? `${mv.setsTarget} sets · ${mv.repsTarget} reps` : `${mv.sets.length} sets logged`}
                          {mv.doneAt && <span style={{ color: "#e8e8e877", marginLeft: 6 }}>· done {new Date(mv.doneAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
                          {mv.sets.map((s, si) => (
                            <span key={si} style={{
                              fontSize: 11, fontFamily: SANS,
                              padding: "3px 7px", borderRadius: 6,
                              background: s.r ? `${color}2a` : "#2e2e2e",
                              color: s.r ? color : "#5c5c5c", fontWeight: 600,
                            }}>
                              {s.w ? `${s.w}×` : ""}{s.r || "–"}
                            </span>
                          ))}
                        </div>
                      </div>
                      {/* Up/down reorder buttons */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => canMoveUp && reorderMovements(activeEntry.id, i, i - 1)}
                          style={{ width: 32, height: 32, borderRadius: 8, background: canMoveUp ? "#1c1c1c" : "transparent", color: canMoveUp ? "#9a9a9a" : "#5c5c5c", fontSize: 14, cursor: canMoveUp ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS }}>
                          ↑
                        </button>
                        <button
                          onClick={() => canMoveDown && reorderMovements(activeEntry.id, i, i + 1)}
                          style={{ width: 32, height: 32, borderRadius: 8, background: canMoveDown ? "#1c1c1c" : "transparent", color: canMoveDown ? "#9a9a9a" : "#5c5c5c", fontSize: 14, cursor: canMoveDown ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS }}>
                          ↓
                        </button>
                      </div>
                    </div>
                  </MvCard>
                </div>
              );
            })}
            <GhostBtn onClick={() => addMovement(activeEntry.id)}>+ Add Movement</GhostBtn>

            <SectionLabel>Cool-down</SectionLabel>
            <WarmupItem
              label="Stretching"
              checked={!!activeEntry.warmup?.stretchAfter}
              onToggle={() => toggleWarmup(activeEntry.id, "stretchAfter")}
            />
          </>
        )}

        {!isRest && (
          <div style={{ padding: "16px 18px 120px" }}>
            {activeEntry.completedAt ? (
              <div style={{ padding: "18px", borderRadius: 16, background: "#e8e8e822", textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><Trophy size={30} color={C.accent} strokeWidth={2} /></div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#e8e8e8", fontFamily: SANS }}>WORKOUT COMPLETE</div>
                <div style={{ fontSize: 12, color: "#5c5c5c", marginTop: 4, fontFamily: SANS }}>
                  {new Date(activeEntry.completedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  {" · "}
                  {activeEntry.movements.filter(m => m.doneAt).length}/{activeEntry.movements.length} movements done
                </div>
                <button onClick={() => updateEntry(activeEntry.id, { completedAt: null })}
                  style={{ marginTop: 10, padding: "6px 16px", borderRadius: 8, background: "transparent", color: "#5c5c5c", fontSize: 12, fontFamily: SANS, cursor: "pointer" }}>
                  Undo
                </button>
              </div>
            ) : (
              <button onClick={() => {
                const ts = new Date().toISOString();
                mutate(prev => {
                  const updated = prev.map(e => e.id === activeEntry.id
                    ? { ...e, completedAt: ts, movements: e.movements.map(m => m.doneAt ? m : { ...m, doneAt: ts }) }
                    : e);
                  // Check if this completion finishes all 5 training days in the current cycle
                  const trainingDayNums = Object.entries(PROGRAM)
                    .filter(([, d]) => d.exercises.length > 0)
                    .map(([dn]) => Number(dn));
                  const anchor = cycleAnchor;
                  const completedInCycle = new Set(
                    updated.filter(e => e.completedAt && e.programDay &&
                      trainingDayNums.includes(e.programDay) &&
                      (!anchor || e.date >= anchor))
                      .map(e => e.programDay)
                  );
                  // If we just completed the last remaining day, auto-start a new cycle
                  if (activeEntry.programDay && trainingDayNums.includes(activeEntry.programDay)) {
                    completedInCycle.add(activeEntry.programDay);
                    if (trainingDayNums.every(dn => completedInCycle.has(dn))) {
                      // All 5 done — anchor new cycle to today
                      saveCycleAnchor(new Date().toISOString().slice(0, 10));
                    }
                  }
                  return updated;
                });
              }} style={{
                width: "100%", padding: "18px", borderRadius: 16,
                background: "linear-gradient(135deg, #e8e8e8, #e8e8e8)",
                border: "none", color: "#131313",
                fontSize: 16, fontWeight: 900, cursor: "pointer",
                fontFamily: SANS, letterSpacing: 1,
                boxShadow: "0 4px 24px #ffffff44",
              }}>
                ✓ COMPLETE WORKOUT
              </button>
            )}
          </div>
        )}
        <BottomNav tab={tab} setTab={t => { setTab(t); if (t !== "journal") setView("journal"); }} onOpenMenu={() => setShowMoreMenu(true)} />
        <MoreMenu open={showMoreMenu} onClose={() => setShowMoreMenu(false)} onSelect={(id) => { setShowMoreMenu(false); setTab(id); setView("journal"); }} />
      </Shell>
    );
  }

  // ── MACROS TAB ───────────────────────────────────────────────────────────
  if (tab === "macros") {
    const day = macros[macroDate] ?? { entries: [] };
    const dType = detectDayType(macroDate);
    const targets = macroTargets[dType] ?? DEFAULT_MACRO_TARGETS.training;
    const targetCals = macroCals(targets.p, targets.c, targets.f);
    const totals = dayTotals(day);
    const isToday = macroDate === todayStr();
    const trainedToday = entries.some(e => e.date === macroDate && e.programDay && PROGRAM[e.programDay]?.exercises.length > 0);

    function shiftDate(delta) {
      const d = new Date(macroDate + "T12:00:00");
      d.setDate(d.getDate() + delta);
      const next = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      if (next <= todayStr()) setMacroDate(next);
    }
    function toggleDayType() {
      mutateMacros(prev => {
        const d = prev[macroDate] ?? { entries: [] };
        const newType = dType === "training" ? "rest" : "training";
        prev[macroDate] = { ...d, dayType: newType, dayTypeManual: true };
        return prev;
      });
    }
    function addFood() {
      if (!foodName.trim() && !foodP && !foodC && !foodF) return;
      const p = parseFloat(foodP) || 0, c = parseFloat(foodC) || 0, f = parseFloat(foodF) || 0;
      if (editingFoodId) {
        // Update the existing entry in place, keep its original id/time
        mutateMacros(prev => {
          const d = prev[macroDate];
          if (!d) return prev;
          prev[macroDate] = {
            ...d,
            entries: d.entries.map(e => e.id === editingFoodId
              ? { ...e, name: foodName.trim() || "Food", p, c, f, cal: macroCals(p, c, f) }
              : e),
          };
          return prev;
        });
        setEditingFoodId(null);
      } else {
        const entry = {
          id: Date.now(),
          name: foodName.trim() || "Food",
          p, c, f,
          cal: macroCals(p, c, f),
          time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        };
        mutateMacros(prev => {
          const d = prev[macroDate] ?? { entries: [], dayType: dType };
          prev[macroDate] = { ...d, entries: [...(d.entries ?? []), entry] };
          return prev;
        });
      }
      setFoodName(""); setFoodP(""); setFoodC(""); setFoodF("");
      setShowFoodModal(false);
    }
    function startEditFood(entry) {
      setEditingFoodId(entry.id);
      setFoodName(entry.name || "");
      setFoodP(entry.p ? String(entry.p) : "");
      setFoodC(entry.c ? String(entry.c) : "");
      setFoodF(entry.f ? String(entry.f) : "");
      setAiDescription(""); setFoodPhoto(null); setAiError("");
      setShowFoodModal(true);
    }
    function deleteFood(id) {
      mutateMacros(prev => {
        const d = prev[macroDate];
        if (!d) return prev;
        prev[macroDate] = { ...d, entries: d.entries.filter(e => e.id !== id) };
        return prev;
      });
    }
    function logAgain(entry) {
      mutateMacros(prev => {
        const d = prev[todayStr()] ?? { entries: [] };
        prev[todayStr()] = { ...d, entries: [...(d.entries ?? []), { ...entry, id: Date.now(), time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) }] };
        return prev;
      });
    }
    async function aiLogFoodPhoto() {
      if (!foodPhoto) return;
      setAiLoading(true); setAiError("");
      try {
        const apiKey = import.meta.env?.VITE_ANTHROPIC_API_KEY;
        if (!apiKey) throw new Error("AI logging needs VITE_ANTHROPIC_API_KEY set in Vercel env vars.");
        const base64Data = foodPhoto.dataUrl.split(",")[1];
        const resp = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
          body: JSON.stringify({
            model: "claude-sonnet-4-5",
            max_tokens: 500,
            messages: [{
              role: "user",
              content: [
                { type: "image", source: { type: "base64", media_type: foodPhoto.mediaType, data: base64Data } },
                { type: "text", text: (aiDescription.trim()
                    ? `Estimate macros for the food shown in this photo. IMPORTANT: the person has given this note about what they actually ate — it overrides what you'd guess from the image alone (e.g. if they say "half of this" or "ate 2 of the 4 pieces", calculate macros for that actual portion, not the full plate shown): "${aiDescription.trim()}". `
                    : `Estimate macros for the food shown in this photo, for the full portion visible. `)
                    + `If the photo does NOT show identifiable food (e.g. it's blank, unrelated, or too unclear to estimate), respond with ONLY: {"unidentifiable": true}

Otherwise, follow these rules before estimating:
1. Judge the actual visible portion size from the photo (container size, comparison to plate/hand/utensils) — don't default to an oversized assumption.
2. For known branded/packaged foods visible in the photo (cereal boxes, protein powder tubs, packaged snacks), recall the actual nutrition label values for that product's standard serving as accurately as you can.
3. Double-check internal consistency: calories should roughly equal (protein×4 + carbs×4 + fat×9). If your carb number alone implies far more calories than what's visibly in the photo, you've likely overestimated portion size — reconsider.

Respond with ONLY a JSON object, no markdown: {"name": "short food name reflecting the actual portion eaten", "p": grams protein, "c": grams carbs, "f": grams fat}` },
              ],
            }],
          }),
        });
        const data = await resp.json();
        const text = data.content?.map(b => b.text || "").join("") ?? "";
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        if (parsed.unidentifiable) {
          setAiError("Couldn't identify food in that photo — try a clearer shot, or use manual entry below.");
          setAiLoading(false);
          return;
        }
        // Show for review/confirmation rather than logging immediately
        setAiPendingReview({
          name: parsed.name || "Food (photo)",
          p: parseFloat(parsed.p) || 0,
          c: parseFloat(parsed.c) || 0,
          f: parseFloat(parsed.f) || 0,
        });
      } catch (err) {
        setAiError(err.message || "AI photo estimate failed — use manual entry.");
      } finally {
        setAiLoading(false);
      }
    }
    function handlePhotoSelect(file) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => setFoodPhoto({ dataUrl: e.target.result, mediaType: file.type || "image/jpeg" });
      reader.readAsDataURL(file);
    }
    async function aiLogFood() {
      if (!aiDescription.trim()) return;
      setAiLoading(true); setAiError("");
      try {
        const apiKey = import.meta.env?.VITE_ANTHROPIC_API_KEY;
        if (!apiKey) throw new Error("AI logging needs VITE_ANTHROPIC_API_KEY set in Vercel env vars.");
        const resp = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
          body: JSON.stringify({
            model: "claude-sonnet-4-5",
            max_tokens: 500,
            messages: [{ role: "user", content: `Estimate macros for this food description: "${aiDescription}"

If this text does NOT describe an identifiable food or meal (e.g. it's gibberish, random letters, empty, or unrelated to food), respond with ONLY: {"unidentifiable": true}

Otherwise, follow these rules carefully before estimating:
1. If a specific quantity/serving size is given (e.g. "2 eggs", "1 cup", "200g chicken"), use that exact amount.
2. If NO quantity is given, use the STANDARD LABELED SERVING SIZE for that food (e.g. cereal = the serving size printed on that brand's nutrition label, typically 3/4–1 cup / ~30-40g for most cereals — NOT a large bowl). Do not assume a larger-than-standard portion.
3. For known branded/packaged foods (cereals, protein bars, common snacks, fast food items), recall the actual nutrition label values for that product and standard serving as accurately as you can, rather than estimating from scratch.
4. Double-check your numbers are internally consistent: calories should roughly equal (protein×4 + carbs×4 + fat×9). If your carb number alone implies more calories than a reasonable meal/snack (e.g. 200g+ carbs for a single serving of cereal), you have likely overestimated portion size — reconsider using the standard serving instead.

Respond with ONLY a JSON object, no markdown: {"name": "short food name including serving size assumed, e.g. 'Frosted Flakes (3/4 cup)'", "p": grams protein, "c": grams carbs, "f": grams fat}` }],
          }),
        });
        const data = await resp.json();
        const text = data.content?.map(b => b.text || "").join("") ?? "";
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        if (parsed.unidentifiable) {
          setAiError("Couldn't identify a food in that description — try rephrasing, or use manual entry below.");
          setAiLoading(false);
          return;
        }
        // Show for review/confirmation rather than logging immediately —
        // catches cases where the estimate looks obviously wrong before it's saved.
        setAiPendingReview({
          name: parsed.name || aiDescription.slice(0, 40),
          p: parseFloat(parsed.p) || 0,
          c: parseFloat(parsed.c) || 0,
          f: parseFloat(parsed.f) || 0,
        });
      } catch (err) {
        setAiError(err.message || "AI estimate failed — use manual entry.");
      } finally {
        setAiLoading(false);
      }
    }

    const macroBar = (label, val, target, barColor) => {
      const pct = Math.min(100, target > 0 ? (val / target) * 100 : 0);
      const over = val > target;
      return (
        <div key={label} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: C.textMid, fontFamily: SANS, fontWeight: 600 }}>{label}</span>
            <span style={{ fontSize: 12, fontFamily: MONO, color: over ? C.red : barColor }}>{val}g / {target}g</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: C.surface2, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: over ? C.red : barColor, borderRadius: 4, transition: "width 0.3s" }} />
          </div>
        </div>
      );
    };

    return (
      <Shell>
        <div style={{ padding: "52px 18px 16px", background: "linear-gradient(160deg,#131313 0%,#131313 100%)" }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: C.textDim, textTransform: "uppercase", fontFamily: SANS, marginBottom: 4 }}>Nutrition</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: C.text, lineHeight: 1, fontFamily: SANS, letterSpacing: -0.5 }}>Macros</div>
          {/* Date navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
            <button onClick={() => shiftDate(-1)} style={{ background: C.surface2, borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><ChevronLeft size={16} color={C.textMid} /></button>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: SANS, flex: 1, textAlign: "center" }}>
              {isToday ? "Today" : fmtDate(macroDate)}
            </div>
            <button onClick={() => shiftDate(1)} disabled={isToday} style={{ background: C.surface2, borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: isToday ? "default" : "pointer", opacity: isToday ? 0.3 : 1 }}><ChevronRight size={16} color={C.textMid} /></button>
          </div>
        </div>

        {/* Day type banner — auto-detected from workout journal */}
        <div onClick={toggleDayType} style={{ margin: "12px 18px 4px", padding: "12px 16px", borderRadius: 14, cursor: "pointer",
          background: dType === "training" ? LAKE.forest + "22" : C.surface,
          
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: dType === "training" ? LAKE.forest : C.textMid, letterSpacing: 0.5, textTransform: "uppercase", fontFamily: SANS }}>
              {dType === "training" ? "Training Day" : "Rest Day"}
            </div>
            <div style={{ fontSize: 11, color: C.textDim, fontFamily: SANS, marginTop: 2 }}>
              {macros[macroDate]?.dayTypeManual ? "Manually set · tap to switch" : trainedToday ? "Auto — session logged today" : "Auto — no session yet · tap to override"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontFamily: MONO, fontWeight: 700, color: totals.cal > targetCals ? C.red : C.text }}>
              {totals.cal} <span style={{ color: C.textDim, fontWeight: 400 }}>/ {targetCals}</span>
            </div>
            <div style={{ fontSize: 10, fontFamily: MONO, color: C.textDim, marginTop: 1 }}>
              {Math.max(0, targetCals - totals.cal)} left
            </div>
          </div>
        </div>

        {/* Calorie summary + macro bars */}
        <div style={{ margin: "10px 18px", padding: "16px", borderRadius: 18, background: C.surface, boxShadow: shadow }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: SANS }}>Calories</span>
            <span style={{ fontFamily: MONO }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: totals.cal > targetCals ? C.red : LAKE.sky }}>{totals.cal}</span>
              <span style={{ fontSize: 13, color: C.textDim }}> / {targetCals}</span>
            </span>
          </div>
          <div style={{ height: 10, borderRadius: 5, background: C.surface2, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ width: `${Math.min(100, targetCals > 0 ? (totals.cal / targetCals) * 100 : 0)}%`, height: "100%", background: totals.cal > targetCals ? C.red : `linear-gradient(90deg, ${LAKE.sky}aa, ${LAKE.sky})`, borderRadius: 5, transition: "width 0.3s" }} />
          </div>
          {macroBar("Protein", totals.p, targets.p, LAKE.forest)}
          {macroBar("Carbs", totals.c, targets.c, LAKE.ochre)}
          {macroBar("Fat", totals.f, targets.f, LAKE.peak)}
          <div style={{ fontSize: 11, color: C.textDim, fontFamily: SANS, marginTop: 4 }}>
            Remaining: {Math.max(0, targets.p - totals.p)}p · {Math.max(0, targets.c - totals.c)}c · {Math.max(0, targets.f - totals.f)}f · {Math.max(0, targetCals - totals.cal)} kcal
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, padding: "0 18px 8px" }}>
          <button onClick={() => { setAiError(""); setAiPendingReview(null); setEditingFoodId(null); setFoodName(""); setFoodP(""); setFoodC(""); setFoodF(""); setShowFoodModal(true); }}
            style={{ flex: 2, padding: "14px", borderRadius: 14, background: LAKE.sky, border: "none", color: "#0a0a0a", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: SANS, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Plus size={16} strokeWidth={2.5} /> Log Food
          </button>
          <button onClick={() => setShowChef(true)}
            style={{ padding: "14px", borderRadius: 14, background: C.surface2, color: LAKE.forest, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Macro Chef">
            <Utensils size={16} strokeWidth={2} />
          </button>
          <button onClick={() => setShowMacroSearch(s => !s)}
            style={{ padding: "14px", borderRadius: 14, background: showMacroSearch ? LAKE.sky + "33" : C.surface2, color: showMacroSearch ? LAKE.sky : C.textMid, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Search food history">
            <Search size={16} strokeWidth={2} />
          </button>
          <button onClick={() => setShowTargetsModal(true)}
            style={{ padding: "14px", borderRadius: 14, background: C.surface2, color: C.textMid, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Targets
          </button>
        </div>

        {/* Food search across all history */}
        {showMacroSearch && (
          <div style={{ padding: "0 18px 12px" }}>
            <input value={macroSearchQuery} onChange={e => setMacroSearchQuery(e.target.value)} placeholder="Search food history…" autoFocus
              style={{ width: "100%", padding: "11px 14px", borderRadius: 12, background: C.surface2, color: C.text, fontSize: 16, fontFamily: SANS, outline: "none", boxSizing: "border-box", marginBottom: 10 }} />
            {macroSearchQuery.trim().length > 0 && (() => {
              const q = macroSearchQuery.toLowerCase();
              const results = [];
              Object.keys(macros).sort((a, b) => b.localeCompare(a)).forEach(dateKey => {
                (macros[dateKey]?.entries ?? []).forEach(e => {
                  if (e.name?.toLowerCase().includes(q)) results.push({ ...e, date: dateKey });
                });
              });
              return results.length === 0 ? (
                <div style={{ padding: "16px 0", textAlign: "center", color: C.textDim, fontSize: 13, fontFamily: SANS }}>No matches</div>
              ) : (
                <div>
                  {results.slice(0, 30).map(r => (
                    <div key={`${r.date}-${r.id}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, background: C.surface, marginBottom: 6 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
                        <div style={{ fontSize: 10, color: C.textDim, fontFamily: MONO, marginTop: 2 }}>{fmtDate(r.date)} · {r.cal} kcal · {Math.round(r.p)}p/{Math.round(r.c)}c/{Math.round(r.f)}f</div>
                      </div>
                      <button onClick={() => { logAgain(r); setShowMacroSearch(false); setMacroSearchQuery(""); }}
                        style={{ width: 28, height: 28, borderRadius: 8, background: C.surface2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Plus size={13} color={LAKE.sky} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Entries list */}
        <div style={{ padding: "8px 18px 4px" }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: C.textDim, textTransform: "uppercase", fontFamily: SANS, fontWeight: 700 }}>
            {(day.entries ?? []).length} entr{(day.entries ?? []).length === 1 ? "y" : "ies"}
          </div>
        </div>
        <div style={{ padding: "4px 18px 180px" }}>
          {(day.entries ?? []).length === 0 ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: C.textDim, fontSize: 13, fontFamily: SANS }}>Nothing logged {isToday ? "yet today" : "this day"}</div>
          ) : [...day.entries].reverse().map(e => (
            <div key={e.id} onClick={() => isToday && startEditFood(e)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, background: C.surface, marginBottom: 8, cursor: isToday ? "pointer" : "default" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</div>
                <div style={{ fontSize: 11, color: C.textDim, fontFamily: MONO, marginTop: 2 }}>
                  {e.cal || 0} kcal · {Math.round(e.p) || 0}p / {Math.round(e.c) || 0}c / {Math.round(e.f) || 0}f{e.time ? ` · ${e.time}` : ""}
                </div>
              </div>
              {isToday && (
                <button onClick={(ev) => { ev.stopPropagation(); startEditFood(e); }} title="Edit"
                  style={{ width: 30, height: 30, borderRadius: 8, background: C.surface2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Pencil size={13} color={C.textMid} strokeWidth={2} />
                </button>
              )}
              <button onClick={(ev) => { ev.stopPropagation(); logAgain(e); }} title="Log again today"
                style={{ width: 30, height: 30, borderRadius: 8, background: C.surface2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Plus size={14} color={LAKE.sky} strokeWidth={2.5} />
              </button>
              <button onClick={(ev) => { ev.stopPropagation(); deleteFood(e.id); }}
                style={{ width: 30, height: 30, borderRadius: 8, background: "#2a1a18", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={14} color={C.red} strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>

        {/* Log Food modal */}
        {showFoodModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "flex-end", zIndex: 100 }}
            onClick={() => { setShowFoodModal(false); setFoodPhoto(null); setAiError(""); setAiPendingReview(null); setEditingFoodId(null); setFoodName(""); setFoodP(""); setFoodC(""); setFoodF(""); }}>
            <div style={{ background: C.surface, width: "100%", borderRadius: "24px 24px 0 0", padding: "24px 18px 44px", borderBottom: "none", boxSizing: "border-box", maxHeight: "85vh", overflowY: "auto" }}
              onClick={e => e.stopPropagation()}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: C.line, margin: "0 auto 20px" }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 16, fontFamily: SANS }}>{editingFoodId ? "Edit Entry" : aiPendingReview ? "Review Estimate" : "Log Food"}</div>

              {aiPendingReview && (
                <div style={{ marginBottom: 18, padding: "16px", borderRadius: 14, background: C.surface2 }}>
                  <div style={{ fontSize: 11, letterSpacing: 1.5, color: LAKE.ochre, textTransform: "uppercase", fontFamily: SANS, fontWeight: 700, marginBottom: 10 }}>Check before logging</div>
                  <input value={aiPendingReview.name} onChange={e => setAiPendingReview({ ...aiPendingReview, name: e.target.value })}
                    style={{ width: "100%", background: C.bg, borderRadius: 10, padding: "11px 14px", fontSize: 16, fontWeight: 600, color: C.text, outline: "none", fontFamily: SANS, boxSizing: "border-box", marginBottom: 10, border: "none" }} />
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    {[["Protein", "p"], ["Carbs", "c"], ["Fat", "f"]].map(([lbl, key]) => (
                      <div key={key} style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, letterSpacing: 1, color: C.textDim, textTransform: "uppercase", fontFamily: SANS, marginBottom: 4, textAlign: "center" }}>{lbl} g</div>
                        <input type="number" inputMode="decimal" value={aiPendingReview[key]}
                          onChange={e => setAiPendingReview({ ...aiPendingReview, [key]: parseFloat(e.target.value) || 0 })}
                          style={{ width: "100%", background: C.bg, borderRadius: 10, padding: "11px 6px", fontSize: 18, fontWeight: 700, color: C.text, textAlign: "center", outline: "none", fontFamily: MONO, boxSizing: "border-box", border: "none" }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 13, color: C.textMid, fontFamily: MONO, textAlign: "center", marginBottom: 14 }}>
                    = {macroCals(aiPendingReview.p, aiPendingReview.c, aiPendingReview.f)} kcal
                  </div>
                  <div style={{ fontSize: 11, color: C.textDim, fontFamily: SANS, marginBottom: 14, lineHeight: 1.5 }}>
                    Does this look right for what you actually ate? Adjust the numbers above if not, then confirm.
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => { setAiPendingReview(null); setAiDescription(""); setFoodPhoto(null); }}
                      style={{ flex: 1, padding: "14px", borderRadius: 12, background: C.bg, color: C.textMid, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: SANS, border: "none" }}>
                      Discard
                    </button>
                    <button onClick={() => {
                      const entry = {
                        id: Date.now(),
                        name: aiPendingReview.name || "Food",
                        p: aiPendingReview.p, c: aiPendingReview.c, f: aiPendingReview.f,
                        cal: macroCals(aiPendingReview.p, aiPendingReview.c, aiPendingReview.f),
                        time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
                      };
                      mutateMacros(prev => {
                        const d = prev[macroDate] ?? { entries: [], dayType: dType };
                        prev[macroDate] = { ...d, entries: [...(d.entries ?? []), entry] };
                        return prev;
                      });
                      setAiPendingReview(null); setAiDescription(""); setFoodPhoto(null);
                      setShowFoodModal(false);
                    }} style={{ flex: 2, padding: "14px", borderRadius: 12, background: LAKE.forest, color: "#0a0a0a", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: SANS, border: "none" }}>
                      Confirm & Log
                    </button>
                  </div>
                </div>
              )}

              {!editingFoodId && !aiPendingReview && (
              <>
              {/* Photo logging */}
              <div style={{ marginBottom: 14, padding: "14px", borderRadius: 14, background: C.surface2 }}>
                <div style={{ fontSize: 11, letterSpacing: 1.5, color: LAKE.forest, textTransform: "uppercase", fontFamily: SANS, fontWeight: 700, marginBottom: 8 }}>Snap a Photo — AI estimates</div>
                {foodPhoto ? (
                  <div style={{ position: "relative", marginBottom: 8 }}>
                    <img src={foodPhoto.dataUrl} alt="Food" style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 10 }} />
                    <button onClick={() => setFoodPhoto(null)}
                      style={{ position: "absolute", top: 6, right: 6, width: 26, height: 26, borderRadius: 8, background: "rgba(0,0,0,0.7)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <X size={14} color="#fff" strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "18px", borderRadius: 10, border: `1.5px dashed ${C.line}`, cursor: "pointer", color: C.textMid, fontSize: 13, fontFamily: SANS }}>
                    <input type="file" accept="image/*" style={{ display: "none" }}
                      onChange={e => handlePhotoSelect(e.target.files[0])} />
                    Take Photo or Choose Image
                  </label>
                )}
                {foodPhoto && (
                  <>
                    <textarea value={aiDescription} onChange={e => setAiDescription(e.target.value)} rows={2}
                      placeholder="Optional: correct the portion — e.g. &quot;I only ate half of this&quot; or &quot;2 of the 4 pieces&quot; — tap the mic on your keyboard to speak this"
                      style={{ width: "100%", marginTop: 10, background: C.bg, borderRadius: 10, padding: "10px 12px", fontSize: 16, color: C.text, outline: "none", resize: "none", fontFamily: SANS, boxSizing: "border-box" }} />
                    <button onClick={aiLogFoodPhoto} disabled={aiLoading}
                      style={{ width: "100%", marginTop: 8, padding: "11px", borderRadius: 10, background: aiLoading ? C.surface : LAKE.forest, border: "none", color: aiLoading ? C.textDim : "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: SANS }}>
                      {aiLoading ? "Analyzing photo…" : "Estimate & Log from Photo"}
                    </button>
                  </>
                )}
              </div>

              {/* AI describe (text only, no photo) */}
              <div style={{ marginBottom: 18, padding: "14px", borderRadius: 14, background: C.surface2 }}>
                <div style={{ fontSize: 11, letterSpacing: 1.5, color: LAKE.sky, textTransform: "uppercase", fontFamily: SANS, fontWeight: 700, marginBottom: 8 }}>Describe It — AI estimates</div>
                <div style={{ fontSize: 11, color: C.textDim, marginBottom: 8, fontFamily: SANS }}>No photo — type it, or tap the mic on your keyboard to speak it.</div>
                <textarea value={foodPhoto ? "" : aiDescription} onChange={e => setAiDescription(e.target.value)} rows={2}
                  placeholder="e.g. 1.5 scoops whey with oat milk and a banana"
                  style={{ width: "100%", background: C.bg, borderRadius: 10, padding: "10px 12px", fontSize: 16, color: C.text, outline: "none", resize: "none", fontFamily: SANS, boxSizing: "border-box" }} />
                <button onClick={aiLogFood} disabled={aiLoading}
                  style={{ width: "100%", marginTop: 8, padding: "11px", borderRadius: 10, background: aiLoading ? C.surface : LAKE.sky, border: "none", color: aiLoading ? C.textDim : "#0a0a0a", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: SANS }}>
                  {aiLoading ? "Estimating…" : "Estimate & Log"}
                </button>
                {aiError && <div style={{ marginTop: 8, fontSize: 12, color: C.red, fontFamily: SANS }}>{aiError}</div>}
              </div>
              </>
              )}

              {/* Manual entry (always shown — this is the edit form too) */}
              <div style={{ fontSize: 11, letterSpacing: 1.5, color: C.textDim, textTransform: "uppercase", fontFamily: SANS, fontWeight: 700, marginBottom: 8 }}>{editingFoodId ? "Edit Details" : "Or Enter Manually"}</div>
              <input value={foodName} onChange={e => setFoodName(e.target.value)} placeholder="Food name"
                style={{ width: "100%", background: C.surface2, borderRadius: 10, padding: "11px 14px", fontSize: 16, color: C.text, outline: "none", fontFamily: SANS, boxSizing: "border-box", marginBottom: 10 }} />
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                {[["Protein", foodP, setFoodP], ["Carbs", foodC, setFoodC], ["Fat", foodF, setFoodF]].map(([lbl, val, setter]) => (
                  <div key={lbl} style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, letterSpacing: 1, color: C.textDim, textTransform: "uppercase", fontFamily: SANS, marginBottom: 4, textAlign: "center" }}>{lbl} g</div>
                    <input type="number" inputMode="decimal" value={val} onChange={e => setter(e.target.value)} placeholder="0"
                      style={{ width: "100%", background: C.surface2, borderRadius: 10, padding: "11px 6px", fontSize: 18, fontWeight: 700, color: C.text, textAlign: "center", outline: "none", fontFamily: MONO, boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 13, color: C.textMid, fontFamily: MONO, textAlign: "center", marginBottom: 14 }}>
                = {macroCals(foodP, foodC, foodF)} kcal
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {editingFoodId && (
                  <button onClick={() => { setAiPendingReview(null); setEditingFoodId(null); setFoodName(""); setFoodP(""); setFoodC(""); setFoodF(""); setShowFoodModal(false); }}
                    style={{ flex: 1, padding: "14px", borderRadius: 12, background: C.surface2, color: C.textMid, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                    Cancel
                  </button>
                )}
                <button onClick={addFood}
                  style={{ flex: editingFoodId ? 2 : 1, padding: "14px", borderRadius: 12, background: LAKE.forest, border: "none", color: "#0a0a0a", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: SANS }}>
                  {editingFoodId ? "Save Changes" : "Add Entry"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Macro Chef modal */}
        {showChef && (
          <MacroChefModal
            remaining={{ calories: Math.max(0, targetCals - totals.cal), protein: Math.max(0, targets.p - totals.p), carbs: Math.max(0, targets.c - totals.c), fat: Math.max(0, targets.f - totals.f) }}
            onResult={(entry) => {
              mutateMacros(prev => {
                const d = prev[macroDate] ?? { entries: [], dayType: dType };
                prev[macroDate] = { ...d, entries: [...(d.entries ?? []), { ...entry, id: Date.now(), time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) }] };
                return prev;
              });
              setShowChef(false);
            }}
            onClose={() => setShowChef(false)}
          />
        )}

        {/* Targets modal */}
        {showTargetsModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "flex-end", zIndex: 100 }}
            onClick={() => setShowTargetsModal(false)}>
            <div style={{ background: C.surface, width: "100%", borderRadius: "24px 24px 0 0", padding: "24px 18px 44px", borderBottom: "none", boxSizing: "border-box" }}
              onClick={e => e.stopPropagation()}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: C.line, margin: "0 auto 20px" }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 16, fontFamily: SANS }}>Macro Targets</div>
              {["training", "rest"].map(dt => (
                <div key={dt} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: dt === "training" ? LAKE.forest : C.textMid, textTransform: "uppercase", letterSpacing: 1, fontFamily: SANS, marginBottom: 8 }}>
                    {dt === "training" ? "Training Day" : "Rest Day"} · {macroCals(macroTargets[dt].p, macroTargets[dt].c, macroTargets[dt].f)} kcal
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[["p", "Protein"], ["c", "Carbs"], ["f", "Fat"]].map(([key, lbl]) => (
                      <div key={key} style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, letterSpacing: 1, color: C.textDim, textTransform: "uppercase", fontFamily: SANS, marginBottom: 4, textAlign: "center" }}>{lbl}</div>
                        <input type="number" inputMode="numeric" value={macroTargets[dt][key]}
                          onChange={e => saveMacroTargets({ ...macroTargets, [dt]: { ...macroTargets[dt], [key]: parseFloat(e.target.value) || 0 } })}
                          style={{ width: "100%", background: C.surface2, borderRadius: 10, padding: "10px 6px", fontSize: 17, fontWeight: 700, color: C.text, textAlign: "center", outline: "none", fontFamily: MONO, boxSizing: "border-box" }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 11, color: C.textDim, fontFamily: SANS, lineHeight: 1.5 }}>
                The day type auto-switches based on whether you've logged a workout — no more forgetting which targets apply.
              </div>
            </div>
          </div>
        )}

        <ResumeBar session={inProgressSession && activeId !== inProgressSession?.id ? inProgressSession : null} onResume={() => { setActiveId(inProgressSession.id); setTab("journal"); setView("entry"); }} />
        <BottomNav tab={tab} setTab={setTab} onOpenMenu={() => setShowMoreMenu(true)} />
        <MoreMenu open={showMoreMenu} onClose={() => setShowMoreMenu(false)} onSelect={(id) => { setShowMoreMenu(false); setTab(id); setView("journal"); }} />
      </Shell>
    );
  }

  // ── VOLUME TAB ───────────────────────────────────────────────────────────
  if (tab === "volume") {
    const vol = cycleVolume(entries, cycleAnchor);
    const allMuscles = Object.keys(VOLUME_LANDMARKS);
    const cycleLabel = cycleAnchor
      ? new Date(cycleAnchor + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "cycle start";
    return (
      <Shell>
        <div style={{ padding: "52px 18px 20px", background: "linear-gradient(160deg,#131313 0%,#131313 100%)" }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#5c5c5c", textTransform: "uppercase", fontFamily: SANS, marginBottom: 4 }}>Sets Per Muscle · This Cycle</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: "#f2f2f2", lineHeight: 1, fontFamily: SANS, letterSpacing: -0.5 }}>Volume</div>
          <div style={{ fontSize: 13, color: "#5c5c5c", marginTop: 6, fontFamily: SANS }}>Since {cycleLabel} · resets with each new cycle</div>
        </div>
        {/* Deload guidance banner */}
        {(() => {
          const meso = mesocycleWeek(entries, mesoOverride);
          if (!meso.isDeload) return null;
          return (
            <div style={{ margin: "12px 18px 4px", padding: "14px 16px", borderRadius: 14, background: "#e8e8e81a" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Flame size={14} color={C.accent} strokeWidth={2} /> Deload Week — Volume Targets
              </div>
              {Object.entries(VOLUME_LANDMARKS).map(([muscle, lm]) => (
                <div key={muscle} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${C.lineSoft}` }}>
                  <span style={{ fontSize: 12, color: C.textMid, fontFamily: SANS }}>{muscle}</span>
                  <span style={{ fontSize: 12, fontFamily: MONO, color: C.accent }}>
                    {Math.round(lm.mev * 0.5)}–{Math.round(lm.mev * 0.6)} sets · 60% weight · 3–4 RIR
                  </span>
                </div>
              ))}
            </div>
          );
        })()}
        <div style={{ padding: "12px 18px 100px" }}>
          {allMuscles.map(muscle => {
            const sets = vol[muscle] || 0;
            const lm = VOLUME_LANDMARKS[muscle];
            const status = volumeStatus(sets, muscle);
            const pct = Math.min(100, (sets / lm.mrv) * 100);
            const mevPct = (lm.mev / lm.mrv) * 100;
            const mavPct = (lm.mav / lm.mrv) * 100;
            return (
              <div key={muscle} style={{ marginBottom: 12, padding: "16px 18px", borderRadius: 18, background: C.surface, boxShadow: shadow }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: -0.2 }}>{muscle}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 24, fontWeight: 800, color: status.color, fontFamily: MONO }}>{sets}</span>
                    <span style={{ fontSize: 11, color: C.textDim, fontFamily: SANS, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{status.label}</span>
                  </div>
                </div>
                {/* Volume bar with MEV/MAV/MRV markers */}
                <div style={{ position: "relative", height: 12, borderRadius: 6, background: C.surface2, overflow: "hidden" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: `linear-gradient(90deg, ${status.color}aa, ${status.color})`, borderRadius: 6, transition: "width 0.4s ease" }} />
                  <div style={{ position: "absolute", left: `${mevPct}%`, top: 0, bottom: 0, width: 1.5, background: "rgba(255,255,255,0.25)" }} />
                  <div style={{ position: "absolute", left: `${mavPct}%`, top: 0, bottom: 0, width: 1.5, background: "rgba(255,255,255,0.25)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 9, color: C.textDim, fontFamily: MONO, fontWeight: 600 }}>
                  <span>MEV {lm.mev}</span>
                  <span>MAV {lm.mav}</span>
                  <span>MRV {lm.mrv}</span>
                </div>
              </div>
            );
          })}
          <div style={{ padding: "8px 4px", fontSize: 11, color: "#5c5c5c", fontFamily: SANS, lineHeight: 1.6 }}>
            MEV = minimum effective volume · MAV = max adaptive (the productive zone) · MRV = max recoverable. Stay in the green band for growth; back off if you're over MRV repeatedly.
          </div>
        </div>
        <ResumeBar session={inProgressSession && activeId !== inProgressSession?.id ? inProgressSession : null} onResume={() => { setActiveId(inProgressSession.id); setTab("journal"); setView("entry"); }} />
        <BottomNav tab={tab} setTab={setTab} onOpenMenu={() => setShowMoreMenu(true)} />
        <MoreMenu open={showMoreMenu} onClose={() => setShowMoreMenu(false)} onSelect={(id) => { setShowMoreMenu(false); setTab(id); setView("journal"); }} />
      </Shell>
    );
  }

  // ── PROGRESS TAB ─────────────────────────────────────────────────────────
  if (tab === "progress") {
    const prs = getPersonalRecords(entries);
    const mvNames = allMovementNames(entries);
    const selMv = selectedMovement || mvNames[0] || null;
    const history = selMv ? movementHistory(entries, selMv) : [];
    const heatmap = sessionHeatmap(entries);
    const balance = pushPullBalance(entries);
    const meso = mesocycleWeek(entries, mesoOverride);

    // Heatmap — last 70 days (10 weeks)
    const heatDays = [];
    for (let i = 69; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const str = d.toISOString().slice(0, 10);
      heatDays.push({ date: str, count: heatmap[str] || 0 });
    }
    const completedSessions = heatDays.filter(d => d.count > 0).length;

    // Mini SVG line chart for selected movement
    function LineChart({ data, color }) {
      if (data.length < 2) return (
        <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", color: C.textDim, fontSize: 12, fontFamily: SANS }}>
          Need 2+ sessions to show trend
        </div>
      );
      const vals = data.map(d => d.e1rm);
      const min = Math.min(...vals), max = Math.max(...vals);
      const range = max - min || 1;
      const W = 340, H = 80, PAD = 8;
      const pts = vals.map((v, i) => {
        const x = PAD + (i / (vals.length - 1)) * (W - PAD * 2);
        const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
        return [x, y];
      });
      const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
      const area = path + ` L${pts[pts.length-1][0]},${H} L${PAD},${H} Z`;
      return (
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#lg)" />
          <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {pts.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3" fill={color} stroke={C.surface} strokeWidth="1.5" />
          ))}
          <text x={pts[0][0]} y={H - 2} fontSize="9" fill={C.textDim} textAnchor="middle" fontFamily="monospace">{data[0].date.slice(5)}</text>
          <text x={pts[pts.length-1][0]} y={H - 2} fontSize="9" fill={C.textDim} textAnchor="middle" fontFamily="monospace">{data[data.length-1].date.slice(5)}</text>
        </svg>
      );
    }

    return (
      <Shell>
        <div style={{ padding: "52px 18px 20px", background: "linear-gradient(160deg,#131313 0%,#131313 100%)" }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: C.textDim, textTransform: "uppercase", fontFamily: SANS, marginBottom: 4 }}>Performance</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: C.text, lineHeight: 1, fontFamily: SANS, letterSpacing: -0.5 }}>Progress</div>
        </div>

        <div style={{ padding: "0 18px 16px" }}>

          {/* ── SESSION HEATMAP ── */}
          <div style={{ marginBottom: 14, padding: "16px", borderRadius: 18, background: C.surface, boxShadow: shadow }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Consistency</div>
              <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS }}>{completedSessions}/70 days trained</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 3 }}>
              {heatDays.map((d, i) => (
                <div key={i} title={d.date} style={{ aspectRatio: "1", borderRadius: 3, background: d.count > 0 ? C.accent : C.surface2, opacity: d.count > 0 ? 1 : 0.5 }} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: C.textDim, fontFamily: SANS }}>
              <span>10 weeks ago</span><span>Today</span>
            </div>
          </div>

          {/* ── PUSH/PULL BALANCE ── */}
          <div style={{ marginBottom: 14, padding: "16px", borderRadius: 18, background: C.surface, boxShadow: shadow }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Push / Pull Balance <span style={{ fontSize: 11, color: C.textDim, fontWeight: 400 }}>last 8 days</span></div>
            {[
              { label: "Push", val: balance.push, color: C.accent },
              { label: "Pull", val: balance.pull, color: "#9a9a9a" },
              { label: "Legs", val: balance.legs, color: "#e8e8e8" },
            ].map(({ label, val, color }) => {
              const total = balance.push + balance.pull + balance.legs || 1;
              const pct = Math.round((val / total) * 100);
              const ratio = balance.pull > 0 ? (balance.push / balance.pull).toFixed(2) : "—";
              return (
                <div key={label} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: C.textMid, fontFamily: SANS }}>{label}</span>
                    <span style={{ fontSize: 12, fontFamily: MONO, color }}>{val} sets · {pct}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: C.surface2, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.3s" }} />
                  </div>
                </div>
              );
            })}
            {balance.push > 0 && balance.pull > 0 && (
              <div style={{ fontSize: 11, color: C.textDim, fontFamily: SANS, marginTop: 6 }}>
                Push:Pull ratio {(balance.push / balance.pull).toFixed(2)}:1
                {balance.push / balance.pull > 1.3 ? " — consider more pulling" : balance.push / balance.pull < 0.7 ? " — consider more pushing" : " — well balanced"}
              </div>
            )}
          </div>

          {/* ── PER-LIFT PROGRESSION ── */}
          <div style={{ marginBottom: 14, padding: "16px", borderRadius: 18, background: C.surface, boxShadow: shadow }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>Lift Progression</div>
            <select value={selMv || ""} onChange={e => setSelectedMovement(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, background: C.surface2, color: C.text, fontSize: 13, fontFamily: SANS, marginBottom: 12, outline: "none" }}>
              {mvNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            {history.length > 0 && (
              <>
                <LineChart data={history} color={LAKE.lake} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: C.textDim, letterSpacing: 1, textTransform: "uppercase", fontFamily: SANS }}>First</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: C.textMid, fontFamily: MONO }}>{history[0].e1rm}lbs</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: C.textDim, letterSpacing: 1, textTransform: "uppercase", fontFamily: SANS }}>Best</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: LAKE.lake, fontFamily: MONO }}>{Math.max(...history.map(h => h.e1rm))}kg</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: C.textDim, letterSpacing: 1, textTransform: "uppercase", fontFamily: SANS }}>Sessions</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: C.textMid, fontFamily: MONO }}>{history.length}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: C.textDim, letterSpacing: 1, textTransform: "uppercase", fontFamily: SANS }}>Change</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: history[history.length-1].e1rm >= history[0].e1rm ? C.accent : C.red, fontFamily: MONO }}>
                      {history[history.length-1].e1rm >= history[0].e1rm ? "+" : ""}{history[history.length-1].e1rm - history[0].e1rm}lbs
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: C.textDim, fontFamily: SANS, marginTop: 8 }}>Estimated 1RM via Epley formula (adjusted for RIR)</div>
              </>
            )}
          </div>

          {/* ── PERSONAL RECORDS ── */}
          <div style={{ marginBottom: 14, padding: "16px", borderRadius: 18, background: C.surface, boxShadow: shadow }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Personal Records</div>
            {Object.entries(prs).length === 0 ? (
              <div style={{ fontSize: 13, color: C.textDim, fontFamily: SANS }}>Log some sets to see PRs</div>
            ) : Object.entries(prs).sort((a, b) => b[1].maxE1RM - a[1].maxE1RM).map(([name, pr]) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${C.lineSoft}` }}>
                <Trophy size={14} color={C.accent} strokeWidth={2} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                  <div style={{ fontSize: 11, color: C.textDim, fontFamily: SANS, marginTop: 2 }}>{pr.date} · {pr.maxWeight}lbs × {pr.reps}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.accent, fontFamily: MONO }}>~{pr.maxE1RM}lbs</div>
                  <div style={{ fontSize: 9, color: C.textDim, fontFamily: SANS }}>e1RM</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: 20 }} />
        </div>
        <ResumeBar session={inProgressSession && activeId !== inProgressSession?.id ? inProgressSession : null} onResume={() => { setActiveId(inProgressSession.id); setTab("journal"); setView("entry"); }} />
        <BottomNav tab={tab} setTab={setTab} onOpenMenu={() => setShowMoreMenu(true)} />
        <MoreMenu open={showMoreMenu} onClose={() => setShowMoreMenu(false)} onSelect={(id) => { setShowMoreMenu(false); setTab(id); setView("journal"); }} />
      </Shell>
    );
  }

  // ── DATA TAB ─────────────────────────────────────────────────────────────
  if (tab === "data") {
    const sorted_all = [...entries].sort((a, b) => b.date.localeCompare(a.date));
    const filtered = filterDay === null ? sorted_all : sorted_all.filter(e => e.programDay === filterDay);
    const totalSets = entries.reduce((n, e) => n + e.movements.reduce((m, mv) => m + mv.sets.filter(s => s.r).length, 0), 0);
    const totalSessions = entries.length;

    async function handleImport(file) {
      try {
        const result = await readJSONBackup(file);
        const { entries: newEntries, weights: newWeights, mesoOverride: newMeso, cycleAnchor: newAnchor, macros: newMacros, raw } = result;

        // Case 1: this is a standalone MacroTracker-app backup (date-keyed, no .entries)
        if (isMacroOnlyBackup(raw)) {
          const migrated = migrateMacroBackup(raw);
          const importedTargets = extractMacroTargets(raw);
          let addedDays = 0, addedEntries = 0, repairedEntries = 0;
          mutateMacros(prev => {
            Object.keys(migrated).forEach(dateKey => {
              const incoming = migrated[dateKey];
              const existing = prev[dateKey] ?? { entries: [], dayType: incoming.dayType };
              const existingById = new Map((existing.entries ?? []).map(e => [String(e.id), e]));
              let dayChanged = false;
              (incoming.entries ?? []).forEach(e => {
                const key = String(e.id);
                const already = existingById.get(key);
                // Overwrite if new, or if the existing entry has broken/missing macro data (repairs old bad imports)
                const isBroken = already && (already.p === undefined || already.c === undefined || already.f === undefined || isNaN(already.p) || isNaN(already.c) || isNaN(already.f));
                if (!already) { addedEntries++; dayChanged = true; }
                else if (isBroken) { repairedEntries++; dayChanged = true; }
                if (!already || isBroken) existingById.set(key, e);
              });
              if (dayChanged || !prev[dateKey]) addedDays++;
              prev[dateKey] = { ...existing, entries: [...existingById.values()] };
            });
            return prev;
          });
          if (importedTargets) saveMacroTargets(importedTargets);
          setImportStatus("success");
          const repairNote = repairedEntries > 0 ? ` · ${repairedEntries} repaired` : "";
          setImportMsg(`Imported macro history: ${addedDays} days, ${addedEntries} new entries${repairNote}${importedTargets ? " · targets restored" : ""}`);
          return;
        }

        // Case 2: normal workout backup (may also contain merged macros from this app's own export)
        if (!Array.isArray(newEntries)) throw new Error("No entries found in file");
        const existingIds = new Set(entries.map(e => String(e.id)));
        const toAdd = newEntries.filter(e => !existingIds.has(String(e.id)));
        const merged = [...entries, ...toAdd].sort((a, b) => b.date.localeCompare(a.date));
        mutate(() => merged);
        if (newWeights.length > 0) {
          const existingWIds = new Set(weightLog.map(w => String(w.id)));
          const wToAdd = newWeights.filter(w => !existingWIds.has(String(w.id)));
          setWeightLog(prev => [...prev, ...wToAdd].sort((a, b) => b.date.localeCompare(a.date)));
        }
        if (newMeso) saveMesoOverride(newMeso);
        if (newAnchor) saveCycleAnchor(newAnchor);
        let macroNote = "";
        if (newMacros && Object.keys(newMacros).length > 0) {
          let addedEntries = 0;
          mutateMacros(prev => {
            Object.keys(newMacros).forEach(dateKey => {
              const incoming = newMacros[dateKey];
              const existing = prev[dateKey] ?? { entries: [], dayType: incoming.dayType };
              const existingIds2 = new Set((existing.entries ?? []).map(e => String(e.id)));
              const toAddF = (incoming.entries ?? []).filter(e => !existingIds2.has(String(e.id)));
              addedEntries += toAddF.length;
              prev[dateKey] = { ...existing, entries: [...(existing.entries ?? []), ...toAddF] };
            });
            return prev;
          });
          macroNote = ` + ${addedEntries} food entries`;
        }
        const stateRestored = newMeso || newAnchor ? " · mesocycle & cycle state restored" : "";
        setImportStatus("success");
        setImportMsg(`Imported ${toAdd.length} new session${toAdd.length !== 1 ? "s" : ""}${newWeights.length > 0 ? ` + ${newWeights.length} weight entries` : ""}${macroNote}${stateRestored}`);
      } catch (err) {
        setImportStatus("error");
        setImportMsg(err.message || "Import failed");
      }
    }

    return (
      <Shell>
        <div style={{ padding: "52px 18px 20px", background: "linear-gradient(160deg,#131313 0%,#131313 100%)" }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#5c5c5c", textTransform: "uppercase", fontFamily: SANS, marginBottom: 4 }}>Backup & History</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: "#f2f2f2", lineHeight: 1, fontFamily: SANS, letterSpacing: -0.5 }}>Data</div>
          <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
            <div><div style={{ fontSize: 22, fontWeight: 900, color: "#e8e8e8", fontFamily: SANS }}>{totalSessions}</div><div style={{ fontSize: 10, color: "#5c5c5c", letterSpacing: 1, textTransform: "uppercase", fontFamily: SANS }}>Sessions</div></div>
            <div><div style={{ fontSize: 22, fontWeight: 900, color: "#e8e8e8", fontFamily: SANS }}>{totalSets}</div><div style={{ fontSize: 10, color: "#5c5c5c", letterSpacing: 1, textTransform: "uppercase", fontFamily: SANS }}>Sets Logged</div></div>
            <div><div style={{ fontSize: 22, fontWeight: 900, color: "#e05a4d", fontFamily: SANS }}>{weightLog.length}</div><div style={{ fontSize: 10, color: "#5c5c5c", letterSpacing: 1, textTransform: "uppercase", fontFamily: SANS }}>Weigh-ins</div></div>
          </div>
        </div>

        {/* Export / Import + Coach Export */}
        <div style={{ padding: "16px 18px 8px" }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "#5c5c5c", textTransform: "uppercase", fontFamily: SANS, fontWeight: 700, marginBottom: 10 }}>Backup</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <button onClick={() => downloadJSON(entries, weightLog, mesoOverride, cycleAnchor, macros, macroTargets)} style={{ flex: 1, padding: "13px", borderRadius: 14, background: "#e8e8e822", color: "#e8e8e8", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: SANS }}>
              Export JSON
            </button>
            <button onClick={() => downloadCSV(entries, weightLog)} style={{ flex: 1, padding: "13px", borderRadius: 14, background: "#e8e8e822", color: "#e8e8e8", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: SANS }}>
              Export CSV
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept=".json" style={{ display: "none" }}
            onChange={e => { if (e.target.files[0]) handleImport(e.target.files[0]); e.target.value = ""; }} />
          <button onClick={() => { setImportStatus(null); fileInputRef.current?.click(); }}
            style={{ width: "100%", padding: "13px", borderRadius: 14, background: "#e8e8e822", color: "#e8e8e8", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: SANS, marginBottom: 10 }}>
            Import JSON Backup
          </button>
          <button onClick={async () => {
            setPdfLoading(true);
            try {
              await downloadCoachPDF(entries, weightLog, mesocycleWeek(entries, mesoOverride));
            } catch (err) {
              alert(err.message || "Could not generate PDF — check your connection and try again.");
            } finally {
              setPdfLoading(false);
            }
          }} disabled={pdfLoading} style={{ width: "100%", padding: "13px", borderRadius: 14, background: "#1c1c1c", color: pdfLoading ? C.textDim : C.text, fontSize: 13, fontWeight: 700, cursor: pdfLoading ? "default" : "pointer", fontFamily: SANS, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Trophy size={15} color={pdfLoading ? C.textDim : C.accent} strokeWidth={2} /> {pdfLoading ? "Generating PDF…" : "Coach Report (PDF)"}
          </button>
          {importStatus && (
            <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, background: importStatus === "success" ? "#e8e8e822" : "#e05a4d22", color: importStatus === "success" ? "#e8e8e8" : "#e05a4d", fontSize: 13, fontFamily: SANS }}>
              {importStatus === "success" ? "✓ " : "✕ "}{importMsg}
            </div>
          )}
        </div>

        {/* Session search */}
        <div style={{ padding: "8px 18px 4px" }}>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search sessions, movements, notes…"
            style={{ width: "100%", padding: "11px 14px", borderRadius: 12, background: C.surface2, color: C.text, fontSize: 16, fontFamily: SANS, outline: "none", boxSizing: "border-box" }} />
        </div>

        {/* Filter by day */}
        <div style={{ padding: "8px 18px 4px" }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "#5c5c5c", textTransform: "uppercase", fontFamily: SANS, fontWeight: 700, marginBottom: 8 }}>Session History · {filtered.filter(e => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return e.customTitle?.toLowerCase().includes(q) || e.note?.toLowerCase().includes(q) || e.movements.some(m => m.name?.toLowerCase().includes(q) || m.note?.toLowerCase().includes(q));
          }).length} shown</div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
            <button onClick={() => setFilterDay(null)} style={{ flexShrink: 0, padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 11, fontWeight: 700, background: filterDay === null ? "#e8e8e8" : "#2e2e2e", color: filterDay === null ? "#131313" : "#9a9a9a" }}>All</button>
            {Object.entries(PROGRAM).filter(([,d]) => d.exercises.length > 0).map(([dn, d]) => (
              <button key={dn} onClick={() => setFilterDay(filterDay === Number(dn) ? null : Number(dn))}
                style={{ flexShrink: 0, padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 11, fontWeight: 700, background: filterDay === Number(dn) ? d.color : "#2e2e2e", color: filterDay === Number(dn) ? "#131313" : d.color }}>
                Day {dn}
              </button>
            ))}
          </div>
        </div>

        {/* History list */}
        {(() => {
          const displayed = filtered.filter(e => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return e.customTitle?.toLowerCase().includes(q) || e.note?.toLowerCase().includes(q) || e.movements.some(m => m.name?.toLowerCase().includes(q) || m.note?.toLowerCase().includes(q));
          });
          return (
            <div style={{ padding: "4px 18px 100px" }}>
              {displayed.length === 0 ? (
                <div style={{ padding: "40px 0", textAlign: "center", color: "#5c5c5c", fontSize: 13, fontFamily: SANS }}>No sessions found</div>
              ) : displayed.map(entry => {
                const prog = entry.programDay ? PROGRAM[entry.programDay] : null;
                const color = prog?.color ?? "#5c5c5c";
                const expanded = expandedId === entry.id;
                const entryColor = prog?.color ?? "#e8e8e8";
                const totalVol = entry.movements.reduce((n, mv) =>
                  n + mv.sets.reduce((s, set) => s + (parseFloat(set.w)||0) * (parseFloat(set.r)||0), 0), 0);
                return (
                  <div key={entry.id} style={{ marginBottom: 8, borderRadius: 14, overflow: "hidden", background: expanded ? color + "14" : "#131313" }}>
                    <div style={{ height: 3, background: prog ? color : "#2e2e2e" }} />
                    <div onClick={() => setExpandedId(expanded ? null : entry.id)}
                      style={{ padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, color: "#5c5c5c", fontFamily: SANS, letterSpacing: 1, marginBottom: 2 }}>
                          {fmtDate(entry.date)}{entry.programDay ? ` · DAY ${entry.programDay}` : ""}
                          {entry.completedAt && <span style={{ color: "#e8e8e8", marginLeft: 6 }}>✓</span>}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#f2f2f2" }}>{entry.customTitle || "Custom Session"}</div>
                        <div style={{ fontSize: 11, color: "#5c5c5c", fontFamily: SANS, marginTop: 2 }}>
                          {entry.movements.length} movements
                          {totalVol > 0 && <span style={{ color: "#9a9a9a", marginLeft: 8 }}>{Math.round(totalVol).toLocaleString()} lbs total vol</span>}
                        </div>
                      </div>
                      <div style={{ color: "#5c5c5c", fontSize: 14, fontFamily: SANS, transition: "transform 0.2s", transform: expanded ? "rotate(90deg)" : "none" }}>›</div>
                    </div>
                    {expanded && (
                      <div style={{ borderTop: "1px solid #2e2e2e", padding: "10px 14px 14px" }}>
                        {entry.note && <div style={{ fontSize: 12, color: "#9a9a9a", marginBottom: 10, fontStyle: "italic" }}>{entry.note}</div>}
                        {entry.movements.map(mv => (
                          <div key={mv.id} style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#9a9a9a", marginBottom: 4, fontFamily: SANS }}>
                              {mv.programRef ? `${mv.programRef}. ` : ""}{mv.name}
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                              {mv.sets.map((s, si) => (
                                <span key={si} style={{ fontSize: 11, fontFamily: SANS, padding: "3px 8px", borderRadius: 6, background: s.r ? entryColor + "22" : "#2e2e2e", color: s.r ? entryColor : "#5c5c5c" }}>
                                  {s.w ? `${s.w}×` : "BW×"}{s.r || "–"}
                                </span>
                              ))}
                              {mv.note && <span style={{ fontSize: 10, color: "#5c5c5c", fontStyle: "italic", alignSelf: "center", marginLeft: 4 }}>{mv.note}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}
        <ResumeBar session={inProgressSession && activeId !== inProgressSession?.id ? inProgressSession : null} onResume={() => { setActiveId(inProgressSession.id); setTab("journal"); setView("entry"); }} />
        <BottomNav tab={tab} setTab={setTab} onOpenMenu={() => setShowMoreMenu(true)} />
        <MoreMenu open={showMoreMenu} onClose={() => setShowMoreMenu(false)} onSelect={(id) => { setShowMoreMenu(false); setTab(id); setView("journal"); }} />
      </Shell>
    );
  }

  // ── WEIGHT TRACKER ────────────────────────────────────────────────────────
  if (tab === "weight") {
    const sorted_w = [...weightLog].sort((a, b) => b.date.localeCompare(a.date));
    const chartData = [...weightLog].sort((a, b) => a.date.localeCompare(b.date));
    const vals = chartData.map(w => parseFloat(w.weight));
    const minV = vals.length ? Math.min(...vals) : 0;
    const maxV = vals.length ? Math.max(...vals) : 1;
    const range = maxV - minV || 1;
    const latest = sorted_w[0];
    const prev = sorted_w[1];
    const diff = latest && prev ? (parseFloat(latest.weight) - parseFloat(prev.weight)).toFixed(1) : null;
    const totalDiff = sorted_w.length > 1
      ? (parseFloat(sorted_w[0].weight) - parseFloat(sorted_w[sorted_w.length - 1].weight)).toFixed(1)
      : null;
    function addWeight() {
      if (!weightInput || isNaN(parseFloat(weightInput))) return;
      const entry = { id: Date.now(), date: weightDate, weight: weightInput, unit: weightUnit, note: "" };
      setWeightLog(prev => {
        const updated = [entry, ...prev.filter(w => w.date !== weightDate)];
        saveWeights(updated); // save directly — don't rely solely on useEffect
        return updated;
      });
      setWeightInput("");
      setShowWeightForm(false);
    }
    const CHART_H = 140, CHART_W = 340;
    return (
      <Shell>
        <div style={{ padding: "52px 18px 16px", background: "linear-gradient(160deg,#131313 0%,#131313 100%)" }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#5c5c5c", textTransform: "uppercase", fontFamily: SANS, marginBottom: 4 }}>Body Weight</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: "#f2f2f2", lineHeight: 1, fontFamily: SANS, letterSpacing: -0.5 }}>Weight Tracker</div>
          {latest && (
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 8 }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: "#e8e8e8", fontFamily: SANS }}>{latest.weight}</span>
              <span style={{ fontSize: 16, color: "#5c5c5c", fontFamily: SANS }}>{latest.unit}</span>
              {diff !== null && (
                <span style={{ fontSize: 14, fontFamily: SANS, fontWeight: 700, color: parseFloat(diff) < 0 ? "#e8e8e8" : parseFloat(diff) > 0 ? "#e05a4d" : "#9a9a9a" }}>
                  {parseFloat(diff) > 0 ? "+" : ""}{diff} vs last
                </span>
              )}
            </div>
          )}
          {totalDiff !== null && (
            <div style={{ fontSize: 12, color: "#5c5c5c", fontFamily: SANS, marginTop: 4 }}>
              Total change: {parseFloat(totalDiff) > 0 ? "+" : ""}{totalDiff} {sorted_w[0]?.unit} over {weightLog.length} entries
            </div>
          )}
        </div>
        {chartData.length >= 2 && (
          <div style={{ margin: "16px 18px 0", padding: "16px", borderRadius: 16, background: "#131313", overflowX: "auto" }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: "#5c5c5c", textTransform: "uppercase", fontFamily: SANS, marginBottom: 10 }}>Progress</div>
            <svg width="100%" viewBox={`0 0 ${CHART_W} ${CHART_H + 20}`} style={{ display: "block", overflow: "visible" }}>
              {[0, 0.25, 0.5, 0.75, 1].map(p => {
                const y = CHART_H - p * CHART_H;
                const val = (minV + p * range).toFixed(1);
                return (
                  <g key={p}>
                    <line x1="30" y1={y} x2={CHART_W} y2={y} stroke="#2e2e2e" strokeWidth="1" strokeDasharray="3,4" />
                    <text x="26" y={y + 4} fontSize="9" fill="#5c5c5c" textAnchor="end" fontFamily="monospace">{val}</text>
                  </g>
                );
              })}
              {vals.length >= 2 && (
                <polyline
                  points={vals.map((v, i) => {
                    const x = 30 + (i / (vals.length - 1)) * (CHART_W - 30);
                    const y = CHART_H - ((v - minV) / range) * CHART_H;
                    return `${x},${y}`;
                  }).join(" ")}
                  fill="none" stroke="#e8e8e8" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
                />
              )}
              {vals.map((v, i) => {
                const x = 30 + (i / Math.max(vals.length - 1, 1)) * (CHART_W - 30);
                const y = CHART_H - ((v - minV) / range) * CHART_H;
                return <circle key={i} cx={x} cy={y} r="3.5" fill="#e8e8e8" stroke="#131313" strokeWidth="1.5" />;
              })}
            </svg>
          </div>
        )}
        <div style={{ padding: "14px 18px 4px" }}>
          <button onClick={() => { setWeightDate(todayStr()); setWeightInput(""); setShowWeightForm(true); }}
            style={{ width: "100%", padding: "14px", borderRadius: 14, background: "#e8e8e8", border: "none", color: "#131313", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: SANS }}>
            + LOG WEIGHT
          </button>
        </div>
        <div style={{ padding: "8px 18px 4px" }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "#5c5c5c", textTransform: "uppercase", fontFamily: SANS, fontWeight: 700 }}>History · {weightLog.length} entries</div>
        </div>
        {sorted_w.length === 0 ? (
          <div style={{ margin: "20px 18px", padding: "32px 20px", borderRadius: 16, background: "#131313", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}><Scale size={30} color={C.textDim} strokeWidth={1.8} /></div>
            <div style={{ color: "#9a9a9a", fontSize: 14 }}>No weight entries yet</div>
          </div>
        ) : (
          <div style={{ padding: "4px 18px 100px" }}>
            {sorted_w.map((w, i) => {
              const prevW = sorted_w[i + 1];
              const d = prevW ? (parseFloat(w.weight) - parseFloat(prevW.weight)).toFixed(1) : null;
              return (
                <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, background: "#131313", marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "#5c5c5c", fontFamily: SANS }}>{fmtDate(w.date)}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 22, fontWeight: 900, color: "#f2f2f2", fontFamily: SANS }}>{w.weight}</span>
                      <span style={{ fontSize: 12, color: "#5c5c5c", fontFamily: SANS }}>{w.unit}</span>
                      {d !== null && (
                        <span style={{ fontSize: 12, fontFamily: SANS, fontWeight: 700, color: parseFloat(d) < 0 ? "#e8e8e8" : parseFloat(d) > 0 ? "#e05a4d" : "#9a9a9a" }}>
                          {parseFloat(d) > 0 ? "+" : ""}{d}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setWeightLog(prev => { const updated = prev.filter(x => x.id !== w.id); saveWeights(updated); return updated; })}
                    style={{ width: 30, height: 30, borderRadius: 8, background: "#2a1a18", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} strokeWidth={2.5} color={C.red} /></button>
                </div>
              );
            })}
          </div>
        )}
        {showWeightForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-end", zIndex: 100 }}
            onClick={() => setShowWeightForm(false)}>
            <div style={{ background: "#131313", width: "100%", borderRadius: "24px 24px 0 0", padding: "24px 18px 48px", borderBottom: "none" }}
              onClick={e => e.stopPropagation()}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "#5c5c5c", margin: "0 auto 20px" }} />
              <div style={{ fontSize: 18, fontWeight: 800, color: "#f2f2f2", marginBottom: 16, fontFamily: SANS }}>Log Weight</div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Date</label>
                <input type="date" style={modalInput} value={weightDate} onChange={e => setWeightDate(e.target.value)} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={labelStyle}>Weight</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["lbs"].map(u => (
                      <button key={u} onClick={() => setWeightUnit(u)} style={{ padding: "4px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 12, fontWeight: 700, background: weightUnit === u ? "#e8e8e8" : "#2e2e2e", color: weightUnit === u ? "#131313" : "#9a9a9a" }}>{u}</button>
                    ))}
                  </div>
                </div>
                <input type="number" inputMode="decimal" style={{ ...modalInput, fontSize: 28, fontWeight: 900, textAlign: "center", padding: "14px" }}
                  value={weightInput} onChange={e => setWeightInput(e.target.value)} placeholder="0.0" autoFocus />
              </div>
              <button onClick={addWeight} style={{ width: "100%", padding: "15px", borderRadius: 14, background: "#e8e8e8", border: "none", color: "#131313", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: SANS }}>
                SAVE →
              </button>
            </div>
          </div>
        )}
        <ResumeBar session={inProgressSession && activeId !== inProgressSession?.id ? inProgressSession : null} onResume={() => { setActiveId(inProgressSession.id); setTab("journal"); setView("entry"); }} />
        <BottomNav tab={tab} setTab={setTab} onOpenMenu={() => setShowMoreMenu(true)} />
        <MoreMenu open={showMoreMenu} onClose={() => setShowMoreMenu(false)} onSelect={(id) => { setShowMoreMenu(false); setTab(id); setView("journal"); }} />
      </Shell>
    );
  }

  // ── JOURNAL HOME ──────────────────────────────────────────────────────────
  return (
    <Shell>
      <div style={{ padding: "52px 18px 20px", background: "linear-gradient(160deg,#131313 0%,#131313 100%)" }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#5c5c5c", textTransform: "uppercase", fontFamily: SANS, marginBottom: 4 }}>Training Journal</div>
        <div style={{ fontSize: 30, fontWeight: 900, color: "#f2f2f2", lineHeight: 1, fontFamily: SANS, letterSpacing: -0.5 }}>My Workouts</div>
        <div style={{ marginTop: 6 }}>
          <div style={{ fontSize: 13, color: "#5c5c5c" }}>{entries.filter(e => e.completedAt).length} session{entries.filter(e => e.completedAt).length !== 1 ? "s" : ""} logged</div>
        </div>
      </div>

      {/* Mesocycle banner */}
      {(() => {
        const meso = mesocycleWeek(entries, mesoOverride);
        const dimColor = "#e8e8e8";
        return (
          <div onClick={() => setShowMesoEdit(true)} style={{ margin: "12px 18px 4px", padding: "14px 16px", borderRadius: 14, background: meso.isDeload ? "#e8e8e81a" : "#1c1c1c", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: dimColor, textTransform: "uppercase", fontFamily: SANS, fontWeight: 700 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Flame size={13} strokeWidth={2.2} /> Mesocycle {meso.cycle} · Week {meso.week} of {meso.total}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: "#5c5c5c", fontFamily: SANS }}>{meso.isDeload ? "DELOAD" : "ACCUMULATION"}</span>
                <Pencil size={12} color="#5c5c5c" strokeWidth={2} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              {Array.from({ length: meso.total }, (_, i) => {
                const wk = i + 1;
                const isCurrent = wk === meso.week;
                return (
                  <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: isCurrent ? "#e8e8e8" : wk < meso.week ? "#1c1c1c" : "#2e2e2e" }} />
                );
              })}
            </div>
            {meso.isDeload && (
              <div style={{ fontSize: 12, color: "#e8e8e8", fontFamily: SANS, marginTop: 8 }}>
                Deload week — drop volume ~50%, keep weights, leave 3–4 RIR
              </div>
            )}
            {!meso.isDeload && meso.week >= 3 && (
              <div style={{ fontSize: 12, color: "#9a9a9a", fontFamily: SANS, marginTop: 8 }}>
                Add a set to lagging muscles this week · deload in {meso.total - meso.week} wk{meso.total - meso.week !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        );
      })()}

      {/* ── THIS CYCLE tracker ──────────────────────────────────────────── */}
      {(() => {
        const trainingDays = Object.entries(PROGRAM).filter(([, d]) => d.exercises.length > 0);
        const allDayNums = trainingDays.map(([dn]) => Number(dn));

        // If a manual cycle anchor exists, only look at sessions from that date forward
        // Otherwise use the completion-based cycle detection
        let completedDays;
        if (cycleAnchor) {
          completedDays = new Set(
            entries
              .filter(e => e.completedAt && e.date >= cycleAnchor && e.programDay && allDayNums.includes(e.programDay))
              .map(e => e.programDay)
          );
        } else {
          // Walk backwards: collect sessions until we hit a repeated day
          const completedSessions = [...entries]
            .filter(e => e.completedAt && e.programDay && allDayNums.includes(e.programDay))
            .sort((a, b) => b.date.localeCompare(a.date) || b.completedAt.localeCompare(a.completedAt));
          completedDays = new Set();
          for (const e of completedSessions) {
            if (completedDays.has(e.programDay)) break;
            completedDays.add(e.programDay);
          }
        }

        const doneCount = completedDays.size;
        const remaining = trainingDays.filter(([dn]) => !completedDays.has(Number(dn)));

        return (
          <div style={{ margin: "0 18px 12px", padding: "14px 16px", borderRadius: 16, background: C.surface }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.textMid, letterSpacing: 0.5, textTransform: "uppercase", fontFamily: SANS }}>This Cycle</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 12, fontFamily: MONO, color: doneCount === trainingDays.length ? LAKE.forest : C.textMid }}>
                  {doneCount}/{trainingDays.length} done
                </div>
                <button onClick={() => { if (window.confirm("Start a new cycle? This will reset the cycle tracker to today.")) saveCycleAnchor(todayStr()); }}
                  style={{ fontSize: 10, fontWeight: 700, color: LAKE.sky, background: LAKE.sky + "22", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontFamily: SANS, letterSpacing: 0.3 }}>
                  New Cycle
                </button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {trainingDays.map(([dn, d]) => {
                const done = completedDays.has(Number(dn));
                return (
                  <div key={dn} onClick={() => { setNewProgramDay(Number(dn)); setNewDate(todayStr()); setShowNewModal(true); }}
                    style={{ flex: 1, borderRadius: 10, padding: "8px 4px", textAlign: "center", cursor: "pointer",
                      background: done ? d.color + "22" : C.surface2,
                      
                      opacity: done ? 0.7 : 1,
                    }}>
                    <div style={{ fontSize: 15, fontWeight: 800, fontFamily: MONO, color: done ? d.color : C.text }}>
                      {done ? "✓" : dn}
                    </div>
                    <div style={{ fontSize: 8, letterSpacing: 1, color: done ? d.color + "aa" : C.textDim, textTransform: "uppercase", marginTop: 2, fontFamily: SANS }}>{{"1":"LEGS","2":"PUSH","4":"PULL","6":"LEGS II","7":"PUSH II"}[dn] ?? d.tag}</div>
                  </div>
                );
              })}
            </div>
            {remaining.length > 0 && (
              <div style={{ marginTop: 10, fontSize: 12, color: C.textDim, fontFamily: SANS }}>
                Remaining: {remaining.map(([, d]) => d.title.split("&")[0].trim()).join(" · ")}
              </div>
            )}
          </div>
        );
      })()}

      <div style={{ padding: "4px 18px 8px" }}>
        <button onClick={() => { setNewProgramDay(null); setNewDate(todayStr()); setShowNewModal(true); }}
          style={{ width: "100%", padding: "15px", borderRadius: 14, background: LAKE.sky, border: "none", color: "#0a0a0a", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: SANS, letterSpacing: 0.2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 20px rgba(184,212,232,0.2)" }}>
          <Dumbbell size={18} strokeWidth={2.2} /> Log Today's Session
        </button>
      </div>

      {sorted.length === 0 ? (
        <div style={{ margin: "40px 18px", textAlign: "center", color: "#5c5c5c" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}><ClipboardList size={30} color={C.textDim} strokeWidth={1.8} /></div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#9a9a9a" }}>No sessions yet</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Tap a program day above or log a new session</div>
        </div>
      ) : (
        <div style={{ padding: "4px 18px 100px" }}>
          {sorted.map(entry => {
            const prog = entry.programDay ? PROGRAM[entry.programDay] : null;
            const color = prog?.color ?? "#5c5c5c";
            const isRest = prog?.exercises?.length === 0;
            const mvDone = entry.movements.filter(m => m.sets.some(s => s.r)).length;
            const inProgress = !entry.completedAt && entry.date === today;
            return (
              <div key={entry.id}
                onClick={() => { setActiveId(entry.id); setView("entry"); }}
                style={{ marginBottom: 12, borderRadius: 18, overflow: "hidden", background: inProgress ? LAKE.sky + "14" : "#131313", cursor: "pointer", opacity: inProgress ? 0.9 : 1 }}>
                <div style={{ height: 4, background: inProgress ? LAKE.sky + "66" : isRest ? "#2e2e2e" : color }} />
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: "#5c5c5c", fontFamily: SANS, letterSpacing: 1, marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}>
                        {fmtDate(entry.date)}{prog ? ` · DAY ${entry.programDay}` : ""}
                        {entry.completedAt && <span style={{ color: "#e8e8e8", fontWeight: 800 }}>✓</span>}
                        {inProgress && (
                          <span style={{ fontSize: 9, fontWeight: 700, color: "#0a0a0a", background: LAKE.sky, padding: "2px 7px", borderRadius: 4, letterSpacing: 0.5, textTransform: "uppercase" }}>
                            In Progress
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: "#f2f2f2", lineHeight: 1.2 }}>{entry.customTitle || "Untitled Session"}</div>
                      {entry.note ? (
                        <div style={{ fontSize: 13, color: "#9a9a9a", marginTop: 5, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{entry.note}</div>
                      ) : null}
                    </div>
                    <div style={{ fontSize: 20, color: "#2e2e2e" }}>›</div>
                  </div>
                  {!isRest && entry.movements.length > 0 && (
                    <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {entry.movements.slice(0, 5).map(mv => (
                        <span key={mv.id} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 7, background: "#1c1c1c", color: "#9a9a9a", fontFamily: SANS }}>
                          {mv.programRef ? `${mv.programRef}. ` : ""}{mv.name || "–"}
                        </span>
                      ))}
                      {entry.movements.length > 5 && (
                        <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 7, background: "#1c1c1c", color: "#5c5c5c" }}>
                          +{entry.movements.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                  {!isRest && (
                    <div style={{ marginTop: 8, fontSize: 11, color: "#5c5c5c", fontFamily: SANS }}>
                      {entry.movements.length} movement{entry.movements.length !== 1 ? "s" : ""}
                      {mvDone > 0 && ` · ${mvDone} logged`}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showMesoEdit && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "flex-end", zIndex: 100 }}
          onClick={() => setShowMesoEdit(false)}>
          <div style={{ background: "#131313", width: "100%", borderRadius: "24px 24px 0 0", padding: "24px 18px 44px", borderBottom: "none", boxSizing: "border-box" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "#2e2e2e", margin: "0 auto 20px" }} />
            <div style={{ fontSize: 18, fontWeight: 700, color: "#f2f2f2", marginBottom: 6, fontFamily: SANS }}>Set Mesocycle Week</div>
            <div style={{ fontSize: 13, color: "#9a9a9a", marginBottom: 18, fontFamily: SANS, lineHeight: 1.5 }}>
              Which week of the {MESO_LENGTH}-week block are you in right now? It'll count forward from today.
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {Array.from({ length: MESO_LENGTH }, (_, i) => {
                const wk = i + 1;
                const isDeloadWk = wk === MESO_LENGTH;
                const current = mesocycleWeek(entries, mesoOverride).week === wk;
                return (
                  <button key={wk} onClick={() => { saveMesoOverride({ anchorDate: todayStr(), weekAtAnchor: wk }); setShowMesoEdit(false); }}
                    style={{ flex: 1, padding: "16px 0", borderRadius: 12, background: current ? "#e8e8e8" : "#1c1c1c", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, fontFamily: MONO, color: current ? "#0a0a0a" : "#f2f2f2" }}>{wk}</span>
                    <span style={{ fontSize: 9, fontFamily: SANS, fontWeight: 700, letterSpacing: 0.5, color: current ? "#0a0a0a" : "#5c5c5c" }}>{isDeloadWk ? "DELOAD" : "WK"}</span>
                  </button>
                );
              })}
            </div>
            <button onClick={() => { saveMesoOverride(null); setShowMesoEdit(false); }}
              style={{ width: "100%", padding: "12px", borderRadius: 12, background: "transparent", color: "#9a9a9a", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
              Reset to automatic
            </button>
          </div>
        </div>
      )}

      {showNewModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-end", zIndex: 100 }}
          onClick={() => setShowNewModal(false)}>
          <div style={{ background: "#131313", width: "100%", borderRadius: "24px 24px 0 0", padding: "24px 18px 44px", borderBottom: "none", boxSizing: "border-box", overflow: "hidden" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "#5c5c5c", margin: "0 auto 20px" }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: "#f2f2f2", marginBottom: 16, fontFamily: SANS }}>Log Session</div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Date</label>
              <div style={{ position: "relative" }}>
                <div style={{ ...modalInput, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                  <span>{newDate ? new Date(newDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "Select date"}</span>
                  <span style={{ fontSize: 11, color: "#9a9a9a" }}>tap to change</span>
                </div>
                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                  style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }} />
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Program Day (optional)</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                <div onClick={() => setNewProgramDay(null)} style={{ padding: "7px 14px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: SANS, background: newProgramDay === null ? "#e8e8e8" : "#1c1c1c", color: newProgramDay === null ? "#131313" : "#9a9a9a" }}>Custom</div>
                {Object.entries(PROGRAM).map(([dn, d]) => (
                  <div key={dn} onClick={() => setNewProgramDay(Number(dn))} style={{ padding: "8px 12px", borderRadius: 10, cursor: "pointer", fontFamily: SANS, background: newProgramDay === Number(dn) ? d.color : "#1c1c1c", color: newProgramDay === Number(dn) ? "#131313" : d.color, textAlign: "center", minWidth: 56 }}>
                    <div style={{ fontSize: 15, fontWeight: 800 }}>{dn}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5, marginTop: 2, opacity: 0.85 }}>
                      {{"1":"LEGS","2":"PUSH","3":"REST","4":"PULL","5":"REST","6":"LEGS II","7":"PUSH II"}[dn]}
                    </div>
                  </div>
                ))}
              </div>
              {newProgramDay && (() => {
                const last = getLastSession(entries, newProgramDay);
                return (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 12, color: "#5c5c5c", fontFamily: SANS }}>→ {PROGRAM[newProgramDay].title} · {PROGRAM[newProgramDay].exercises.length} exercises pre-loaded</div>
                    {last ? (
                      <div style={{ fontSize: 12, color: "#e8e8e877", fontFamily: SANS, marginTop: 4 }}>✓ Last session {fmtDate(last.date)} · weights carried forward</div>
                    ) : (
                      <div style={{ fontSize: 12, color: "#5c5c5c", fontFamily: SANS, marginTop: 4 }}>No previous session found · sets will start blank</div>
                    )}
                  </div>
                );
              })()}
            </div>
            <button onClick={createEntry} style={{ width: "100%", padding: "15px", borderRadius: 14, background: "#e8e8e8", border: "none", color: "#131313", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: SANS }}>
              CREATE SESSION →
            </button>
          </div>
        </div>
      )}
      <ResumeBar session={inProgressSession && activeId !== inProgressSession?.id ? inProgressSession : null} onResume={() => { setActiveId(inProgressSession.id); setTab("journal"); setView("entry"); }} />
      <BottomNav tab={tab} setTab={setTab} onOpenMenu={() => setShowMoreMenu(true)} />
        <MoreMenu open={showMoreMenu} onClose={() => setShowMoreMenu(false)} onSelect={(id) => { setShowMoreMenu(false); setTab(id); setView("journal"); }} />
    </Shell>
  );
}

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────
function RestTimer({ restSecs, restLabel, color, timerState, onStart, onPause, onResume, onReset, onDismiss }) {
  const active = timerState && (timerState.running || timerState.remaining < timerState.total);
  const remaining = timerState?.remaining ?? restSecs;
  const total = timerState?.total ?? restSecs;
  const running = timerState?.running ?? false;
  const done = timerState?.done ?? false;
  const pct = total > 0 ? remaining / total : 1;
  const R = 22, circ = 2 * Math.PI * R;
  const dash = circ * pct;
  const mins = Math.floor(remaining / 60), secs = remaining % 60;
  const timeStr = mins > 0 ? `${mins}:${String(secs).padStart(2, "0")}` : `${secs}s`;
  return (
    <div style={{ margin: "2px 18px 8px", padding: "10px 14px", borderRadius: 14, background: done ? color + "1a" : "#131313", display: "flex", alignItems: "center", gap: 12, transition: "background 0.3s" }}>
      <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0 }}>
        <svg width="52" height="52" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="26" cy="26" r={R} fill="none" stroke="#2e2e2e" strokeWidth="3" />
          <circle cx="26" cy="26" r={R} fill="none" stroke={done ? color : running ? color : "#5c5c5c"} strokeWidth="3" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.9s linear, stroke 0.3s" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: remaining >= 60 ? 11 : 13, fontWeight: 800, fontFamily: SANS, color: done ? color : running ? "#f2f2f2" : "#5c5c5c" }}>
          {done ? "✓" : timeStr}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: SANS, color: done ? color : "#5c5c5c", fontWeight: 700, marginBottom: 6 }}>
          {done ? "Rest complete" : `Rest · ${restLabel}`}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {!active && !done && <button onClick={onStart} style={timerBtn(color, true)}>▶ Start</button>}
          {active && running && <button onClick={onPause} style={timerBtn("#5c5c5c", false)}>⏸ Pause</button>}
          {active && !running && !done && <button onClick={onResume} style={timerBtn(color, true)}>▶ Resume</button>}
          {active && <button onClick={onReset} style={timerBtn("#2e2e2e", false)}>↺</button>}
          {done && <button onClick={onDismiss} style={timerBtn(color, true)}>Next set →</button>}
        </div>
      </div>
    </div>
  );
}
function timerBtn(bg, bright) {
  return { padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: bg, color: bright ? "#131313" : "#9a9a9a", fontSize: 12, fontWeight: 700, fontFamily: SANS };
}
function MacroChefModal({ remaining, onResult, onClose }) {
  const [mode, setMode] = useState("home"); // home | kitchen | restaurant
  const [input, setInput] = useState("");
  const [restaurant, setRestaurant] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState(null);

  async function askChef() {
    if (!input.trim()) return;
    setLoading(true); setError(""); setResponse(null);
    try {
      const apiKey = import.meta.env?.VITE_ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error("Macro Chef needs VITE_ANTHROPIC_API_KEY set in Vercel env vars.");
      const macroTarget = `${Math.round(remaining.calories)} kcal, ${Math.round(remaining.protein)}g protein, ${Math.round(remaining.carbs)}g carbs, ${Math.round(remaining.fat)}g fat`;
      const prompt = mode === "kitchen"
        ? `I need to hit these remaining macros today: ${macroTarget}. I have these ingredients available: ${input}. Suggest a meal or meals I can make that gets me as close as possible to those targets. Be practical and specific with quantities.`
        : `I'm at ${restaurant || "a restaurant"} and need to hit these remaining macros today: ${macroTarget}. ${input ? `Menu context or preferences: ${input}.` : ""} Suggest specific menu items or ordering strategies to hit my targets as closely as possible.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5", max_tokens: 1000,
          system: "You are a nutrition-focused personal chef. Give practical, specific meal suggestions that hit macro targets. Format your response clearly with: 1) The meal/order recommendation, 2) Estimated macros, 3) Any prep tips. Keep it concise and actionable.",
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      setResponse(data.content?.find(b => b.type === "text")?.text || "");
    } catch (e) {
      setError(e.message || "Could not get suggestions. Try again.");
    }
    setLoading(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "flex-end", zIndex: 100 }} onClick={onClose}>
      <div style={{ background: C.surface, width: "100%", borderRadius: "24px 24px 0 0", padding: "24px 18px 44px", borderBottom: "none", boxSizing: "border-box", maxHeight: "85vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.line, margin: "0 auto 20px" }} />
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4, fontFamily: SANS, display: "flex", alignItems: "center", gap: 8 }}>
          <Utensils size={18} color={LAKE.forest} strokeWidth={2} /> Macro Chef
        </div>
        <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS, marginBottom: 16 }}>
          Remaining today: {Math.round(remaining.protein)}p · {Math.round(remaining.carbs)}c · {Math.round(remaining.fat)}f · {Math.round(remaining.calories)} kcal
        </div>

        {mode === "home" && (
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setMode("kitchen")} style={{ flex: 1, padding: "20px 12px", borderRadius: 14, background: C.surface2, color: C.text, cursor: "pointer", fontFamily: SANS, textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>In My Kitchen</div>
              <div style={{ fontSize: 11, color: C.textDim }}>Tell it what you have</div>
            </button>
            <button onClick={() => setMode("restaurant")} style={{ flex: 1, padding: "20px 12px", borderRadius: 14, background: C.surface2, color: C.text, cursor: "pointer", fontFamily: SANS, textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Eating Out</div>
              <div style={{ fontSize: 11, color: C.textDim }}>Get ordering advice</div>
            </button>
          </div>
        )}

        {mode !== "home" && !response && (
          <>
            {mode === "restaurant" && (
              <input value={restaurant} onChange={e => setRestaurant(e.target.value)} placeholder="Restaurant name (optional)"
                style={{ width: "100%", background: C.surface2, borderRadius: 10, padding: "11px 14px", fontSize: 16, color: C.text, outline: "none", fontFamily: SANS, boxSizing: "border-box", marginBottom: 10 }} />
            )}
            <textarea value={input} onChange={e => setInput(e.target.value)} rows={3}
              placeholder={mode === "kitchen" ? "e.g. chicken breast, rice, eggs, spinach, olive oil" : "e.g. menu has salads, bowls, grilled proteins"}
              style={{ width: "100%", background: C.surface2, borderRadius: 10, padding: "11px 14px", fontSize: 16, color: C.text, outline: "none", resize: "none", fontFamily: SANS, boxSizing: "border-box", marginBottom: 10 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setMode("home")} style={{ padding: "12px 16px", borderRadius: 10, background: "transparent", color: C.textMid, fontSize: 13, cursor: "pointer", fontFamily: SANS }}>Back</button>
              <button onClick={askChef} disabled={loading || !input.trim()}
                style={{ flex: 1, padding: "12px", borderRadius: 10, background: loading ? C.surface2 : LAKE.forest, border: "none", color: loading ? C.textDim : "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: SANS }}>
                {loading ? "Thinking…" : "Ask Chef"}
              </button>
            </div>
            {error && <div style={{ marginTop: 10, fontSize: 12, color: C.red, fontFamily: SANS }}>{error}</div>}
          </>
        )}

        {response && (
          <>
            <div style={{ padding: "14px", borderRadius: 12, background: C.surface2, fontSize: 14, color: C.text, fontFamily: SANS, lineHeight: 1.6, whiteSpace: "pre-wrap", marginBottom: 12 }}>
              {response}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setResponse(null); setInput(""); }} style={{ flex: 1, padding: "12px", borderRadius: 10, background: "transparent", color: C.textMid, fontSize: 13, cursor: "pointer", fontFamily: SANS }}>Ask Again</button>
              <button onClick={() => onResult({ name: mode === "restaurant" ? (restaurant || "Restaurant meal") : "Kitchen meal", p: 0, c: 0, f: 0, cal: 0, note: "Logged from Macro Chef — edit macros manually" })}
                style={{ flex: 1, padding: "12px", borderRadius: 10, background: LAKE.sky, border: "none", color: "#0a0a0a", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: SANS }}>
                Log Placeholder
              </button>
            </div>
            <div style={{ fontSize: 10, color: C.textDim, fontFamily: SANS, marginTop: 8, textAlign: "center" }}>
              Chef gives suggestions, not exact macros — log the real meal manually once you know what you ate.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MoreMenu({ open, onClose, onSelect }) {
  if (!open) return null;
  const items = [
    { id: "volume", label: "Volume", Icon: BarChart3, desc: "Sets per muscle vs MEV/MAV/MRV" },
    { id: "progress", label: "Progress", Icon: TrendingUp, desc: "Consistency, lifts, PRs, balance" },
    { id: "data", label: "Data & Backup", Icon: Database, desc: "Export, import, session history" },
  ];
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "flex-end", zIndex: 100 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.surface, width: "100%", borderRadius: "24px 24px 0 0", padding: "10px 18px 40px", boxSizing: "border-box", maxWidth: 430, margin: "0 auto" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.line, margin: "0 auto 18px" }} />
        {items.map(item => (
          <button key={item.id} onClick={() => onSelect(item.id)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 4px",
            background: "none", border: "none", cursor: "pointer", textAlign: "left",
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: C.surface2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <item.Icon size={19} color={C.text} strokeWidth={1.8} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: SANS }}>{item.label}</div>
              <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS, marginTop: 1 }}>{item.desc}</div>
            </div>
            <ChevronRight size={18} color={C.textDim} strokeWidth={2} />
          </button>
        ))}
      </div>
    </div>
  );
}

function ResumeBar({ session, onResume }) {
  if (!session) return null;
  const mvTotal = session.movements.length;
  const mvDone = session.movements.filter(m => m.doneAt).length;
  const isToday = session.date === todayStr();
  const dateLabel = isToday ? "" : ` · ${fmtDate(session.date)}`;
  return (
    <div onClick={onResume} style={{
      position: "fixed", bottom: 72, left: "50%", transform: "translateX(-50%)",
      width: "calc(100% - 36px)", maxWidth: 394,
      background: "linear-gradient(135deg, #1c1c1c, #161616)",
      borderRadius: 16, padding: "11px 16px",
      display: "flex", alignItems: "center", gap: 12,
      cursor: "pointer", zIndex: 49,
      boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${LAKE.sky}22`,
    }}>
      {/* Animated pulse dot */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: LAKE.sky }} />
        <div style={{ position: "absolute", inset: -3, borderRadius: "50%", border: `1.5px solid ${LAKE.sky}55`, animation: "pulse 2s infinite" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: LAKE.sky, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {session.customTitle || "Session in progress"}{dateLabel}
        </div>
        <div style={{ fontSize: 11, color: "#9a9a9a", fontFamily: SANS, marginTop: 1 }}>
          {mvDone}/{mvTotal} movements done · tap to resume
        </div>
      </div>
      <div style={{ fontSize: 18, color: LAKE.sky, flexShrink: 0 }}>›</div>
    </div>
  );
}

function BottomNav({ tab, setTab, onOpenMenu }) {
  const tabs = [
    { id: "journal", label: "Journal", Icon: ClipboardList },
    { id: "macros", label: "Macros", Icon: Utensils },
    { id: "weight", label: "Weight", Icon: Scale },
  ];
  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "rgba(13,13,15,0.94)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", display: "flex", padding: "12px 0 28px", zIndex: 50 }}>
      {tabs.map(t => {
        const active = tab === t.id;
        return (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", padding: "6px 0", transition: "transform 0.15s", transform: active ? "translateY(-1px)" : "none" }}>
            <t.Icon size={26} strokeWidth={active ? 2.4 : 1.8} color={active ? C.accent : C.textDim} />
            <span style={{ fontSize: 11, letterSpacing: 0.3, fontFamily: SANS, color: active ? C.accent : C.textDim, fontWeight: active ? 700 : 500 }}>{t.label}</span>
          </button>
        );
      })}
      <button onClick={onOpenMenu} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", padding: "6px 0" }}>
        <MoreHorizontal size={26} strokeWidth={1.8} color={C.textDim} />
        <span style={{ fontSize: 11, letterSpacing: 0.3, fontFamily: SANS, color: C.textDim, fontWeight: 500 }}>More</span>
      </button>
    </div>
  );
}
function Shell({ children }) {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: SANS, maxWidth: 430, margin: "0 auto", overflowX: "hidden" }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.5)} }`}</style>
      {children}
    </div>
  );
}
function TopBar({ left, right }) {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "52px 18px 8px" }}>{left}{right}</div>;
}
function BackBtn({ onClick, label }) {
  return <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", color: C.accent, fontSize: 15, fontWeight: 600, padding: 0, fontFamily: SANS, display: "flex", alignItems: "center", gap: 4 }}><ChevronLeft size={18} strokeWidth={2.4} /> {label}</button>;
}
function SectionLabel({ children }) {
  return <div style={{ padding: "16px 18px 6px", fontSize: 11, letterSpacing: 2, color: "#5c5c5c", textTransform: "uppercase", fontFamily: SANS, fontWeight: 700 }}>{children}</div>;
}
function Pill({ color, children }) {
  return <span style={{ padding: "5px 13px", borderRadius: 20, background: color + "2a", fontSize: 12, fontWeight: 600, color, fontFamily: SANS, letterSpacing: 0.2 }}>{children}</span>;
}
function MvCard({ children, color, onClick }) {
  return <div onClick={onClick} style={{ margin: "0 18px 10px", padding: "16px 18px", borderRadius: 18, background: C.surface, boxShadow: shadow, cursor: "pointer", transition: "transform 0.12s, border-color 0.2s" }}>{children}</div>;
}
function GhostBtn({ onClick, children }) {
  return <button onClick={onClick} style={{ display: "block", width: "calc(100% - 36px)", margin: "4px 18px", padding: "13px", borderRadius: 14, background: "transparent", border: `1.5px dashed ${C.line}`, color: C.textDim, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: SANS }}>{children}</button>;
}
function WarmupItem({ label, checked, onToggle }) {
  return (
    <div onClick={onToggle} style={{ margin: "0 18px 8px", padding: "14px 16px", borderRadius: 14, background: checked ? "#e8e8e814" : C.surface, boxShadow: shadow, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: checked ? "#e8e8e8" : "#1c1c1c", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}>
        {checked && <Check size={15} strokeWidth={3} color="#131313" />}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: checked ? "#e8e8e8" : C.text, fontFamily: SANS, textDecoration: checked ? "line-through" : "none", opacity: checked ? 0.75 : 1 }}>
        {label}
      </div>
    </div>
  );
}

// SetRow with weight, reps, RIR selector, and movement-type-aware feedback
function SetRow({ num, weight, reps, rir, repsTarget, type, isLastSet, done, color, onW, onR, onRIR, onDelete, onDone }) {
  const repRange = (() => {
    if (!repsTarget) return null;
    // Handle split format: "2×10-12, 2×15-20" — pick the range for this set number
    const splitMatch = repsTarget.match(/(\d+)×(\d+)[–\-](\d+)/g);
    if (splitMatch) {
      let setCounter = 0;
      for (const chunk of splitMatch) {
        const cm = chunk.match(/(\d+)×(\d+)[–\-](\d+)/);
        if (!cm) continue;
        const count = parseInt(cm[1]);
        setCounter += count;
        if (num <= setCounter) {
          return { min: parseInt(cm[2]), max: parseInt(cm[3]) };
        }
      }
    }
    // Standard single range: "10–12"
    const m = repsTarget.match(/(\d+)\s*[–\-]\s*(\d+)/);
    if (m) return { min: parseInt(m[1]), max: parseInt(m[2]) };
    const single = repsTarget.match(/^(\d+)/);
    if (single) return { min: parseInt(single[1]), max: parseInt(single[1]) };
    return null;
  })();
  const repVal = parseFloat(reps);
  const inRange = repRange && !isNaN(repVal) && repVal >= repRange.min && repVal <= repRange.max;
  const belowRange = repRange && !isNaN(repVal) && repVal < repRange.min;
  const aboveRange = repRange && !isNaN(repVal) && repVal > repRange.max;
  const rirFb = rirFeedback(rir, type, isLastSet);

  return (
    <div style={{ margin: "0 18px 4px", padding: "12px 14px", borderRadius: 14, background: done ? color + "14" : "#1c1c1c", transition: "background 0.2s", opacity: done ? 0.75 : 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: "#1c1c1c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, color: "#9a9a9a", fontFamily: SANS, flexShrink: 0 }}>{num}</div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{ fontSize: 10, letterSpacing: 1.5, color: "#5c5c5c", textTransform: "uppercase", fontFamily: SANS }}>Weight</div>
          <input type="number" inputMode="decimal" value={weight} onChange={e => onW(e.target.value)} placeholder="0" style={setInput(color)} />
          <div style={{ fontSize: 10, color: "#5c5c5c", fontFamily: SANS }}>lbs</div>
        </div>
        <div style={{ color: "#2e2e2e", fontSize: 16, fontWeight: 300 }}>×</div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{ fontSize: 10, letterSpacing: 1.5, color: "#5c5c5c", textTransform: "uppercase", fontFamily: SANS }}>
            Reps{repRange ? ` ${repRange.min}–${repRange.max}` : ""}
          </div>
          <input type="number" inputMode="numeric" value={reps} onChange={e => onR(e.target.value)}
            placeholder={repRange ? `${repRange.min}–${repRange.max}` : "0"}
            style={{ ...setInput(color), borderColor: inRange ? LAKE.forest : belowRange ? "#e05a4d" : aboveRange ? LAKE.ochre : undefined }} />
          <div style={{ fontSize: 10, fontFamily: SANS, fontWeight: 700, color: inRange ? LAKE.forest : belowRange ? "#e05a4d" : aboveRange ? LAKE.ochre : "#5c5c5c" }}>
            {inRange ? "✓ in range" : belowRange ? "↓ go lighter" : aboveRange ? "↑ go heavier" : "reps"}
          </div>
        </div>
        <button onClick={onDone} style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: done ? LAKE.forest : C.surface2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.12s, background 0.15s", transform: done ? "scale(1.05)" : "scale(1)" }}><Check size={20} strokeWidth={3} color={done ? C.bg : C.textDim} /></button>
        {onDelete && (
          <button onClick={onDelete} style={{ width: 28, height: 28, borderRadius: 8, background: "#2a1a18", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><X size={15} strokeWidth={2.5} color={C.red} /></button>
        )}
      </div>
      {/* RIR row — left-justified, aligned under "Weight" label above; feedback text sits in its own fixed-position slot so it never shifts the RIR buttons */}
      <div style={{ display: "flex", alignItems: "center", marginTop: 10, paddingTop: 10, borderTop: "1px solid #1c1c1c", paddingLeft: 44 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ fontSize: 10, letterSpacing: 1.5, color: "#5c5c5c", textTransform: "uppercase", fontFamily: SANS, flexShrink: 0 }}>RIR</div>
          <div style={{ display: "flex", gap: 5 }}>
            {["0", "1", "2", "3", "4"].map(v => {
              const sel = String(rir) === v;
              return (
                <button key={v} onClick={() => onRIR(sel ? "" : v)} style={{
                  width: 30, height: 30, borderRadius: 8, cursor: "pointer",
                  background: sel ? color : "#1c1c1c",
                  color: sel ? "#131313" : "#9a9a9a",
                  fontSize: 13, fontWeight: 800, fontFamily: SANS,
                }}>{v}</button>
              );
            })}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0, textAlign: "right", paddingLeft: 10 }}>
          {rirFb && (
            <div style={{ fontSize: 10, fontFamily: SANS, fontWeight: 700, color: rirFb.color, lineHeight: 1.2 }}>
              {rirFb.msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function setInput(color) {
  return { width: "100%", background: "#1c1c1c", borderRadius: 10, padding: "8px 6px", fontSize: 20, fontWeight: 800, color: "#f2f2f2", textAlign: "center", outline: "none", border: "none", WebkitAppearance: "none", fontFamily: MONO };
}
const bigInput = { width: "100%", background: "transparent", border: "none", borderBottom: "1.5px solid #2e2e2e", padding: "6px 0", fontSize: 22, fontWeight: 800, color: "#f2f2f2", outline: "none", fontFamily: SANS, letterSpacing: -0.5, boxSizing: "border-box" };
const ghostInput = { width: "100%", background: "transparent", border: "none", padding: "4px 0", outline: "none", fontFamily: SANS, boxSizing: "border-box", color: "#9a9a9a" };
const noteArea = { width: "calc(100% - 36px)", margin: "0 18px", background: "#131313", borderRadius: 14, padding: "12px 14px", fontSize: 16, color: "#9a9a9a", outline: "none", resize: "none", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, boxSizing: "border-box" };
const modalInput = { width: "100%", background: "#1c1c1c", borderRadius: 10, padding: "11px 14px", fontSize: 16, color: "#f2f2f2", outline: "none", fontFamily: SANS, boxSizing: "border-box" };
const labelStyle = { fontSize: 11, letterSpacing: 2, color: "#5c5c5c", textTransform: "uppercase", fontFamily: SANS, fontWeight: 700 };
function btnStyle(bg, text) {
  return { padding: "7px 14px", borderRadius: 10, background: bg, border: "none", color: text, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: SANS };
}
