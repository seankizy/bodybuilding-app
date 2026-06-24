import { useState, useEffect, useRef } from "react";
import {
  ClipboardList, BarChart3, Scale, Database, Dumbbell, Timer,
  Check, X, Plus, ChevronRight, ChevronLeft, RotateCcw, Pause, Play,
  TrendingUp, Trophy, Moon, Flame, ArrowDown, ArrowUp, Download, Upload, Pencil
} from "lucide-react";

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
// Typography: clean sans for labels/body, monospace reserved for NUMBERS (data is the hero)
const SANS = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const MONO = "'DM Mono', 'SF Mono', ui-monospace, monospace";
// Dark palette — layered surfaces for depth
const C = {
  bg: "#0a0a0a",        // near-black base
  surface: "#111110",   // card base (warm black)
  surface2: "#1a1916",  // raised card
  line: "#2a2823",      // borders (warm dark)
  lineSoft: "#1c1b18",  // subtle dividers
  text: "#f5f1e8",      // primary text (warm white)
  textMid: "#a89f8c",   // secondary (muted gold-grey)
  textDim: "#6b6557",   // tertiary
  accent: "#d4af37",    // primary brand — GOLD
  amber: "#d4af37",     // alias to gold (collapse extra colors)
  blue: "#d4af37",      // alias to gold (was a 3rd color, now unified)
  red: "#e05a4d",       // single highlight color — red
};
const shadow = "0 2px 12px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)";
const shadowLg = "0 8px 30px rgba(0,0,0,0.5)";

// ── PROGRAM DATA ──────────────────────────────────────────────────────────────
// type: "compound" (leave 1–2 RIR) or "isolation" (failure OK on last set)
// muscle: primary muscle group for weekly volume tracking
const PROGRAM = {
  1: {
    title: "Heavy Squats & Legs",
    tag: "LEGS",
    color: "#d4af37",
    exercises: [
      { id: "A", name: "Barbell Squat (power rack)", sets: 4, reps: "8–12", rest: "2m 30s", type: "compound", muscle: "Quads" },
      { id: "B", name: "Leg Press Machine", sets: 2, reps: "6–10", rest: "2m", type: "compound", muscle: "Quads" },
      { id: "C", name: "Leg Extension", sets: 3, reps: "10–15", rest: "1m", type: "isolation", muscle: "Quads" },
      { id: "D", name: "DB Walking Lunge", sets: 2, reps: "10 each leg", rest: "1m", type: "compound", muscle: "Glutes" },
      { id: "E", name: "Seated Calf Raises (DB on knees)", sets: 4, reps: "10–15", rest: "1m", type: "isolation", muscle: "Calves" },
    ],
  },
  2: {
    title: "Heavy Bench & Chest",
    tag: "PUSH",
    color: "#e8c860",
    exercises: [
      { id: "A", name: "Barbell Bench Press (power rack)", sets: 4, reps: "8–10", rest: "3m", type: "compound", muscle: "Chest" },
      { id: "B", name: "Close Grip Barbell Bench Press", sets: 3, reps: "8–10", rest: "1m", type: "compound", muscle: "Triceps" },
      { id: "C", name: "DB Incline Chest Press", sets: 3, reps: "8–12", rest: "1m 30s", type: "compound", muscle: "Chest" },
      { id: "D", name: "Tricep Overhead Extension (DB or EZ bar)", sets: 3, reps: "10–15", rest: "1m", type: "isolation", muscle: "Triceps" },
      { id: "E", name: "Cable Pushdown (Carnelli)", sets: 3, reps: "10–15", rest: "1m", type: "isolation", muscle: "Triceps" },
    ],
  },
  3: { title: "Rest Day", tag: "REST", color: "#a89f8c", exercises: [] },
  4: {
    title: "Posterior Chain",
    tag: "PULL",
    color: "#b8893b",
    exercises: [
      { id: "A", name: "Prone Hamstring Curl", sets: 4, reps: "2×10-12, 2×15-20", rest: "1m", type: "isolation", muscle: "Hamstrings" },
      { id: "B", name: "Romanian Deadlift (barbell)", sets: 3, reps: "6–10", rest: "1m 30s", type: "compound", muscle: "Hamstrings" },
      { id: "C", name: "Barbell Hip Thrust (bench + barbell)", sets: 2, reps: "20–25", rest: "1m", type: "compound", muscle: "Glutes" },
      { id: "D", name: "Barbell Bent Over Row", sets: 3, reps: "6–10", rest: "1m 30s", type: "compound", muscle: "Back" },
      { id: "E", name: "Lat Pulldown (Carnelli)", sets: 3, reps: "8–12", rest: "1m 30s", type: "compound", muscle: "Back" },
    ],
  },
  5: { title: "Rest Day", tag: "REST", color: "#a89f8c", exercises: [] },
  6: {
    title: "Secondary Lower Body",
    tag: "LEGS",
    color: "#c9a227",
    exercises: [
      { id: "A", name: "Barbell Front Squat (power rack)", sets: 4, reps: "8–10", rest: "2m 30s", type: "compound", muscle: "Quads" },
      { id: "B", name: "DB Bulgarian Split Squat", sets: 2, reps: "8–10", rest: "1m", type: "compound", muscle: "Quads" },
      { id: "C", name: "Lat Pulldown (Carnelli)", sets: 3, reps: "10–12", rest: "1m", type: "compound", muscle: "Back" },
      { id: "D", name: "Cable Row (Carnelli low pulley)", sets: 3, reps: "10–12", rest: "1m", type: "compound", muscle: "Back" },
      { id: "E", name: "EZ Bar Curl", sets: 4, reps: "10–12", rest: "1m", type: "isolation", muscle: "Biceps" },
      { id: "F", name: "DB Hammer Curl", sets: 3, reps: "10–12", rest: "1m", type: "isolation", muscle: "Biceps" },
    ],
  },
  7: {
    title: "Overhead Press & Push",
    tag: "PUSH",
    color: "#d9b04a",
    exercises: [
      { id: "A", name: "DB Shoulder Press", sets: 4, reps: "5–8", rest: "2m", type: "compound", muscle: "Shoulders" },
      { id: "B", name: "DB Lateral Raise (leaning)", sets: 4, reps: "10–15", rest: "1m", type: "isolation", muscle: "Shoulders" },
      { id: "C", name: "Incline Barbell Press (rack + bench)", sets: 3, reps: "8–12", rest: "1m", type: "compound", muscle: "Chest" },
      { id: "D", name: "Reverse DB Rear Delt Fly", sets: 3, reps: "12–15", rest: "1m", type: "isolation", muscle: "Shoulders" },
      { id: "E", name: "Weighted Dips (belt or DB between legs)", sets: 3, reps: "10–12", rest: "1m", type: "compound", muscle: "Chest" },
      { id: "F", name: "Tricep Pushdown EZ Bar (cable machine)", sets: 3, reps: "12–15", rest: "1m", type: "isolation", muscle: "Triceps" },
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
  const rows = [["TYPE","DATE","PROGRAM_DAY","WORKOUT_TITLE","EXERCISE","SET","WEIGHT_KG","REPS","RIR","SESSION_NOTE","MOVEMENT_NOTE"]];
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
function downloadJSON(entries, weights) {
  const payload = { version: 2, exportedAt: new Date().toISOString(), entries, weights };
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
        // Support both raw array and versioned object
        const entries = Array.isArray(parsed) ? parsed : (parsed.entries ?? []);
        const weights = Array.isArray(parsed) ? [] : (parsed.weights ?? []);
        resolve({ entries, weights });
      } catch { reject(new Error("Invalid JSON file")); }
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsText(file);
  });
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
    if (r <= 2) return { color: "#d4af37", msg: "✓ Ideal effort" };
    return { color: "#d4af37", msg: "↑ Push a bit harder" };
  } else {
    // isolation
    if (isLastSet) {
      if (r <= 1) return { color: "#d4af37", msg: "✓ Failure earned here" };
      return { color: "#d4af37", msg: "↑ Push closer to failure" };
    }
    if (r <= 2) return { color: "#d4af37", msg: "✓ Good effort" };
    return { color: "#d4af37", msg: "↑ A little harder" };
  }
}

// ── WEEKLY VOLUME PER MUSCLE ──────────────────────────────────────────────────
// RP-style volume landmarks (sets/muscle/week): MEV → MAV → MRV
const VOLUME_LANDMARKS = {
  Chest:     { mev: 10, mav: 18, mrv: 22 },
  Back:      { mev: 10, mav: 20, mrv: 25 },
  Quads:     { mev: 8,  mav: 16, mrv: 20 },
  Hamstrings:{ mev: 6,  mav: 14, mrv: 18 },
  Glutes:    { mev: 6,  mav: 14, mrv: 18 },
  Shoulders: { mev: 8,  mav: 18, mrv: 26 },
  Biceps:    { mev: 8,  mav: 16, mrv: 20 },
  Triceps:   { mev: 8,  mav: 16, mrv: 20 },
  Calves:    { mev: 8,  mav: 16, mrv: 20 },
};
function weekStart(dateStr) {
  // Monday-start week key
  const d = new Date(dateStr + "T12:00:00");
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}
function weeklyVolume(entries, weekKey) {
  // Counts working sets (reps logged) per muscle for the given week
  const vol = {};
  for (const e of entries) {
    if (weekStart(e.date) !== weekKey) continue;
    for (const mv of e.movements) {
      // Use stored muscle, or look it up from PROGRAM via programDay + programRef
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
  if (!lm) return { label: "—", color: "#a89f8c" };
  if (sets < lm.mev) return { label: "below MEV", color: "#d4af37" };
  if (sets <= lm.mav) return { label: "productive", color: "#d4af37" };
  if (sets <= lm.mrv) return { label: "high", color: "#d4af37" };
  return { label: "over MRV", color: "#e05a4d" };
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
  const [showMesoEdit, setShowMesoEdit] = useState(false);
  const [timerState, setTimerState] = useState(null);
  // NEW: between-movement stopwatch
  const [showStopwatch, setShowStopwatch] = useState(false);
  const [stopwatchElapsed, setStopwatchElapsed] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  // Data tab state
  const [filterDay, setFilterDay] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
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
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  function saveMesoOverride(o) {
    setMesoOverride(o);
    try { localStorage.setItem("wj_meso", JSON.stringify(o)); } catch {}
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

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  if (loading) {
    return (
      <Shell>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 12 }}>
          <div style={{ fontSize: 32 }}>🏋️</div>
          <div style={{ fontSize: 14, color: "#6b6557", fontFamily: SANS, letterSpacing: 2 }}>LOADING…</div>
        </div>
      </Shell>
    );
  }

  // ── MOVEMENT DETAIL ───────────────────────────────────────────────────────
  if (view === "movement" && activeEntry && activeMv) {
    const prog = activeEntry.programDay ? PROGRAM[activeEntry.programDay] : null;
    const color = prog?.color ?? "#d4af37";
    const allMvs = activeEntry.movements;
    const curIdx = allMvs.findIndex(m => m.id === activeMv.id);
    const nextMv = allMvs[curIdx + 1] ?? null;
    const isLast = curIdx === allMvs.length - 1;
    const alreadyDone = !!activeMv.doneAt;

    function finishAndAdvance() {
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
              style={btnStyle("#7a2c22", "#e05a4d")}>Delete</button>
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
            <div style={{ position: "sticky", top: 0, zIndex: 20, margin: "0 0 4px", padding: "10px 18px", background: done ? "#1a1607" : "#111110", borderBottom: `2px solid ${done ? color + "88" : color + "44"}`, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
                <svg width="44" height="44" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="22" cy="22" r={R} fill="none" stroke="#2a2823" strokeWidth="3" />
                  <circle cx="22" cy="22" r={R} fill="none" stroke={color} strokeWidth="3"
                    strokeDasharray={`${circ * pct} ${circ}`} strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 0.5s linear" }} />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: remaining >= 60 ? 10 : 13, fontWeight: 900, fontFamily: SANS, color: done ? color : "#f5f1e8" }}>
                  {done ? "GO" : timeStr}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: done ? color : "#a89f8c", fontFamily: SANS, textTransform: "uppercase", marginBottom: 4 }}>
                  {done ? "✓ Rest complete — start!" : "Rest before this movement · 1m 30s"}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {!done && running && <button onClick={pauseTimer} style={{ ...btnStyle("#2a2823", "#a89f8c"), padding: "4px 10px", fontSize: 11 }}>⏸</button>}
                  {!done && !running && <button onClick={resumeTimer} style={{ ...btnStyle(color + "22", color), padding: "4px 10px", fontSize: 11 }}>▶</button>}
                  <button onClick={() => resetTimer(90)} style={{ ...btnStyle("#2a2823", "#a89f8c"), padding: "4px 10px", fontSize: 11 }}>↺</button>
                  {done && <button onClick={dismissTimer} style={{ ...btnStyle(color, "#111110"), padding: "4px 14px", fontSize: 12, fontWeight: 800 }}>Dismiss</button>}
                </div>
              </div>
            </div>
          );
        })()}

        <div style={{ padding: "4px 18px 16px" }}>
          {activeMv.programRef && (
            <div style={{ fontSize: 11, letterSpacing: 2, color: "#a89f8c", textTransform: "uppercase", marginBottom: 6, fontFamily: SANS }}>
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
              {activeMv.rest && <Pill color="#a89f8c">Rest {activeMv.rest}</Pill>}
            </div>
          )}
        </div>

        {activeMv.lastSets && activeMv.lastDate && (
          <div style={{ margin: "0 18px 14px", padding: "10px 14px", borderRadius: 12, background: "#161410", border: "1px solid #3a3318" }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: "#6b6557", textTransform: "uppercase", fontFamily: SANS, marginBottom: 6 }}>
              Last session · {fmtDate(activeMv.lastDate)}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {activeMv.lastSets.map((s, i) => (
                <span key={i} style={{ fontSize: 12, fontFamily: SANS, fontWeight: 700, padding: "4px 9px", borderRadius: 7, background: "#1a1607", border: "1px solid #3a3318", color: "#d4af3788" }}>
                  {s.w ? `${s.w}kg` : "BW"}×{s.r || "?"}
                </span>
              ))}
            </div>
          </div>
        )}

        <SectionLabel>Set Log</SectionLabel>

        {/* CHANGE 1: Stopwatch between movements — shown after finishing a movement */}
        {showStopwatch && (
          <div style={{ margin: "0 18px 14px", padding: "16px", borderRadius: 14, background: "#1a1607", border: "2px solid #d4af3766" }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: "#d4af37", textTransform: "uppercase", fontFamily: SANS, marginBottom: 8 }}>Rest Before Next Movement</div>
            <div style={{ fontSize: 42, fontWeight: 900, color: "#d4af37", fontFamily: SANS, letterSpacing: 4, textAlign: "center" }}>
              {`${Math.floor(stopwatchElapsed / 60)}:${String(stopwatchElapsed % 60).padStart(2, "0")}`}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "center" }}>
              <button onClick={toggleStopwatch} style={{ ...btnStyle("#1a1607", "#d4af37"), padding: "8px 16px" }}>
                {stopwatchRunning ? "⏸ Pause" : "▶ Resume"}
              </button>
              <button onClick={resetStopwatch} style={{ ...btnStyle("#2a2823", "#a89f8c"), padding: "8px 14px" }}>↺</button>
              <button onClick={() => {
                dismissStopwatch();
                if (nextMv) { setActiveMvId(nextMv.id); setTimerState(null); }
                else setView("entry");
              }} style={{ ...btnStyle("#d4af37", "#111110"), padding: "8px 16px", fontWeight: 800 }}>
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
          <div style={{ padding: "16px 18px 48px" }}>
            {alreadyDone ? (
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => updateMovement(activeEntry.id, activeMv.id, { doneAt: null })}
                  style={{ flex: 1, padding: "13px", borderRadius: 14, background: "transparent", border: "1px solid #2a2823", color: "#6b6557", fontSize: 13, fontFamily: SANS, fontWeight: 700, cursor: "pointer" }}>
                  ↩ Undo Done
                </button>
                {nextMv && (
                  <button onClick={() => { dismissTimer(); setActiveMvId(nextMv.id); }}
                    style={{ flex: 2, padding: "13px", borderRadius: 14, background: "#1a1916", border: "1px solid #2a2823", color: "#f5f1e8", fontSize: 14, fontFamily: SANS, fontWeight: 800, cursor: "pointer" }}>
                    Next: {nextMv.name || "Movement"} →
                  </button>
                )}
              </div>
            ) : (
              <button onClick={finishAndAdvance} style={{
                width: "100%", padding: "18px", borderRadius: 16,
                background: isLast
                  ? "linear-gradient(135deg, #d4af37, #c4a030)"
                  : `linear-gradient(135deg, ${color}, ${color}cc)`,
                border: "none", color: "#111110",
                fontSize: 15, fontWeight: 900, cursor: "pointer",
                fontFamily: SANS, letterSpacing: 1,
                boxShadow: `0 4px 24px ${color}33`,
              }}>
                {isLast ? "✓ FINISH LAST MOVEMENT" : `✓ DONE · NEXT: ${(nextMv?.name || "Next").toUpperCase()}`}
              </button>
            )}
          </div>
        )}
      </Shell>
    );
  }

  // ── ENTRY DETAIL ──────────────────────────────────────────────────────────
  if (view === "entry" && activeEntry) {
    const prog = activeEntry.programDay ? PROGRAM[activeEntry.programDay] : null;
    const color = prog?.color ?? "#d4af37";
    const isRest = prog?.exercises?.length === 0;

    return (
      <Shell>
        <TopBar
          left={<BackBtn onClick={() => setView("journal")} label="Journal" />}
          right={
            <button onClick={() => deleteEntry(activeEntry.id)}
              style={btnStyle("#7a2c22", "#e05a4d")}>Delete</button>
          }
        />
        <div style={{ padding: "4px 18px 0" }}>
          <input type="date" style={{ ...ghostInput, fontSize: 13, color: "#a89f8c", marginBottom: 6 }}
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
          <div style={{ margin: "20px 18px", padding: "28px 20px", borderRadius: 16, background: "#1a1916", border: "1px solid #2a2823", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}><Moon size={34} color={C.textMid} strokeWidth={1.8} /></div>
            <div style={{ color: "#f5f1e8", fontWeight: 700, fontSize: 18 }}>Rest Day</div>
            <div style={{ color: "#a89f8c", fontSize: 13, marginTop: 4 }}>Recovery is part of the program</div>
          </div>
        ) : (
          <>
            <SectionLabel>{activeEntry.movements.length} Movement{activeEntry.movements.length !== 1 ? "s" : ""}</SectionLabel>
            {activeEntry.movements.map((mv, i) => {
              const mvDone = !!mv.doneAt;
              const canMoveUp = i > 0;
              const canMoveDown = i < activeEntry.movements.length - 1;
              return (
                <div key={mv.id}>
                  <MvCard color={mvDone ? "#d4af37" : color}
                    onClick={() => { setActiveMvId(mv.id); setView("movement"); setShowStopwatch(false); resetStopwatch(); }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div onClick={e => {
                        e.stopPropagation();
                        const ts = mv.doneAt ? null : new Date().toISOString();
                        updateMovement(activeEntry.id, mv.id, { doneAt: ts });
                      }} style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        background: mvDone ? "#d4af3722" : "#1a1916",
                        border: `2px solid ${mvDone ? "#d4af37" : "#2a2823"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, cursor: "pointer", transition: "all 0.15s",
                      }}>
                        {mvDone ? "✓" : <span style={{ fontSize: 11, fontFamily: SANS, fontWeight: 800, color: "#6b6557" }}>{mv.programRef ?? String(i + 1)}</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: mvDone ? "#d4af37" : "#f5f1e8", lineHeight: 1.3,
                          textDecoration: mvDone ? "line-through" : "none", opacity: mvDone ? 0.7 : 1 }}>
                          {mv.name || <span style={{ color: "#6b6557" }}>Unnamed movement</span>}
                        </div>
                        <div style={{ fontSize: 12, color: "#a89f8c", marginTop: 3 }}>
                          {mv.repsTarget ? `${mv.setsTarget} sets · ${mv.repsTarget} reps` : `${mv.sets.length} sets logged`}
                          {mv.doneAt && <span style={{ color: "#d4af3777", marginLeft: 6 }}>· done {new Date(mv.doneAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
                          {mv.sets.map((s, si) => (
                            <span key={si} style={{
                              fontSize: 11, fontFamily: SANS,
                              padding: "3px 7px", borderRadius: 6,
                              background: s.r ? `${color}22` : "#2a2823",
                              border: `1px solid ${s.r ? color + "44" : "#6b6557"}`,
                              color: s.r ? color : "#6b6557", fontWeight: 600,
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
                          style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #2a2823", background: canMoveUp ? "#1a1916" : "transparent", color: canMoveUp ? "#a89f8c" : "#6b6557", fontSize: 14, cursor: canMoveUp ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS }}>
                          ↑
                        </button>
                        <button
                          onClick={() => canMoveDown && reorderMovements(activeEntry.id, i, i + 1)}
                          style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #2a2823", background: canMoveDown ? "#1a1916" : "transparent", color: canMoveDown ? "#a89f8c" : "#6b6557", fontSize: 14, cursor: canMoveDown ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS }}>
                          ↓
                        </button>
                      </div>
                    </div>
                  </MvCard>
                </div>
              );
            })}
            <GhostBtn onClick={() => addMovement(activeEntry.id)}>+ Add Movement</GhostBtn>
          </>
        )}

        {!isRest && (
          <div style={{ padding: "16px 18px 48px" }}>
            {activeEntry.completedAt ? (
              <div style={{ padding: "18px", borderRadius: 16, background: "#1a1607", border: "2px solid #d4af3766", textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><Trophy size={30} color={C.accent} strokeWidth={2} /></div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#d4af37", fontFamily: SANS }}>WORKOUT COMPLETE</div>
                <div style={{ fontSize: 12, color: "#6b6557", marginTop: 4, fontFamily: SANS }}>
                  {new Date(activeEntry.completedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  {" · "}
                  {activeEntry.movements.filter(m => m.doneAt).length}/{activeEntry.movements.length} movements done
                </div>
                <button onClick={() => updateEntry(activeEntry.id, { completedAt: null })}
                  style={{ marginTop: 10, padding: "6px 16px", borderRadius: 8, background: "transparent", border: "1px solid #2a2823", color: "#6b6557", fontSize: 12, fontFamily: SANS, cursor: "pointer" }}>
                  Undo
                </button>
              </div>
            ) : (
              <button onClick={() => {
                const ts = new Date().toISOString();
                mutate(prev => prev.map(e => e.id === activeEntry.id
                  ? { ...e, completedAt: ts, movements: e.movements.map(m => m.doneAt ? m : { ...m, doneAt: ts }) }
                  : e));
              }} style={{
                width: "100%", padding: "18px", borderRadius: 16,
                background: "linear-gradient(135deg, #d4af37, #c4a030)",
                border: "none", color: "#111110",
                fontSize: 16, fontWeight: 900, cursor: "pointer",
                fontFamily: SANS, letterSpacing: 1,
                boxShadow: "0 4px 24px #d4af3733",
              }}>
                ✓ COMPLETE WORKOUT
              </button>
            )}
          </div>
        )}
      </Shell>
    );
  }

  // ── VOLUME TAB ───────────────────────────────────────────────────────────
  if (tab === "volume") {
    const thisWeek = weekStart(todayStr());
    const vol = weeklyVolume(entries, thisWeek);
    const allMuscles = Object.keys(VOLUME_LANDMARKS);
    const weekLabel = new Date(thisWeek + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return (
      <Shell>
        <div style={{ padding: "52px 18px 20px", background: "linear-gradient(160deg,#111110 0%,#141210 100%)" }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#6b6557", textTransform: "uppercase", fontFamily: SANS, marginBottom: 4 }}>Weekly Sets Per Muscle</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: "#f5f1e8", lineHeight: 1, fontFamily: SANS, letterSpacing: -0.5 }}>Volume</div>
          <div style={{ fontSize: 13, color: "#6b6557", marginTop: 6, fontFamily: SANS }}>Week of {weekLabel} · resets Monday</div>
        </div>
        <div style={{ padding: "12px 18px 100px" }}>
          {allMuscles.map(muscle => {
            const sets = vol[muscle] || 0;
            const lm = VOLUME_LANDMARKS[muscle];
            const status = volumeStatus(sets, muscle);
            const pct = Math.min(100, (sets / lm.mrv) * 100);
            const mevPct = (lm.mev / lm.mrv) * 100;
            const mavPct = (lm.mav / lm.mrv) * 100;
            return (
              <div key={muscle} style={{ marginBottom: 12, padding: "16px 18px", borderRadius: 18, background: C.surface, border: `1px solid ${C.line}`, boxShadow: shadow }}>
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
          <div style={{ padding: "8px 4px", fontSize: 11, color: "#6b6557", fontFamily: SANS, lineHeight: 1.6 }}>
            MEV = minimum effective volume · MAV = max adaptive (the productive zone) · MRV = max recoverable. Stay in the green band for growth; back off if you're over MRV repeatedly.
          </div>
        </div>
        <BottomNav tab={tab} setTab={setTab} />
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
        const { entries: newEntries, weights: newWeights } = await readJSONBackup(file);
        if (!Array.isArray(newEntries)) throw new Error("No entries found in file");
        // Merge: keep existing entries not in backup, add all from backup
        const existingIds = new Set(entries.map(e => String(e.id)));
        const toAdd = newEntries.filter(e => !existingIds.has(String(e.id)));
        const merged = [...entries, ...toAdd].sort((a, b) => b.date.localeCompare(a.date));
        mutate(() => merged);
        if (newWeights.length > 0) {
          const existingWIds = new Set(weightLog.map(w => String(w.id)));
          const wToAdd = newWeights.filter(w => !existingWIds.has(String(w.id)));
          setWeightLog(prev => [...prev, ...wToAdd].sort((a, b) => b.date.localeCompare(a.date)));
        }
        setImportStatus("success");
        setImportMsg(`Imported ${toAdd.length} new session${toAdd.length !== 1 ? "s" : ""}${newWeights.length > 0 ? ` + ${newWeights.length} weight entries` : ""}`);
      } catch (err) {
        setImportStatus("error");
        setImportMsg(err.message || "Import failed");
      }
    }

    return (
      <Shell>
        <div style={{ padding: "52px 18px 20px", background: "linear-gradient(160deg,#111110 0%,#141210 100%)" }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#6b6557", textTransform: "uppercase", fontFamily: SANS, marginBottom: 4 }}>Backup & History</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: "#f5f1e8", lineHeight: 1, fontFamily: SANS, letterSpacing: -0.5 }}>Data</div>
          <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
            <div><div style={{ fontSize: 22, fontWeight: 900, color: "#d4af37", fontFamily: SANS }}>{totalSessions}</div><div style={{ fontSize: 10, color: "#6b6557", letterSpacing: 1, textTransform: "uppercase", fontFamily: SANS }}>Sessions</div></div>
            <div><div style={{ fontSize: 22, fontWeight: 900, color: "#d4af37", fontFamily: SANS }}>{totalSets}</div><div style={{ fontSize: 10, color: "#6b6557", letterSpacing: 1, textTransform: "uppercase", fontFamily: SANS }}>Sets Logged</div></div>
            <div><div style={{ fontSize: 22, fontWeight: 900, color: "#e05a4d", fontFamily: SANS }}>{weightLog.length}</div><div style={{ fontSize: 10, color: "#6b6557", letterSpacing: 1, textTransform: "uppercase", fontFamily: SANS }}>Weigh-ins</div></div>
          </div>
        </div>

        {/* Export / Import */}
        <div style={{ padding: "16px 18px 8px" }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "#6b6557", textTransform: "uppercase", fontFamily: SANS, fontWeight: 700, marginBottom: 10 }}>Backup</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <button onClick={() => downloadJSON(entries, weightLog)} style={{ flex: 1, padding: "13px", borderRadius: 14, background: "#1a1607", border: "1.5px solid #d4af3744", color: "#d4af37", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: SANS }}>
              Export JSON
            </button>
            <button onClick={() => downloadCSV(entries, weightLog)} style={{ flex: 1, padding: "13px", borderRadius: 14, background: "#1a1607", border: "1.5px solid #d4af3744", color: "#d4af37", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: SANS }}>
              Export CSV
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept=".json" style={{ display: "none" }}
            onChange={e => { if (e.target.files[0]) handleImport(e.target.files[0]); e.target.value = ""; }} />
          <button onClick={() => { setImportStatus(null); fileInputRef.current?.click(); }}
            style={{ width: "100%", padding: "13px", borderRadius: 14, background: "#1a1607", border: "1.5px solid #d4af3744", color: "#d4af37", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: SANS }}>
            Import JSON Backup
          </button>
          {importStatus && (
            <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, background: importStatus === "success" ? "#1a1607" : "#1f1310", border: `1px solid ${importStatus === "success" ? "#d4af3744" : "#e05a4d44"}`, color: importStatus === "success" ? "#d4af37" : "#e05a4d", fontSize: 13, fontFamily: SANS }}>
              {importStatus === "success" ? "✓ " : "✕ "}{importMsg}
            </div>
          )}
        </div>

        {/* Filter by day */}
        <div style={{ padding: "8px 18px 4px" }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "#6b6557", textTransform: "uppercase", fontFamily: SANS, fontWeight: 700, marginBottom: 8 }}>Session History · {filtered.length} shown</div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
            <button onClick={() => setFilterDay(null)} style={{ flexShrink: 0, padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 11, fontWeight: 700, background: filterDay === null ? "#d4af37" : "#2a2823", color: filterDay === null ? "#111110" : "#a89f8c" }}>All</button>
            {Object.entries(PROGRAM).filter(([,d]) => d.exercises.length > 0).map(([dn, d]) => (
              <button key={dn} onClick={() => setFilterDay(filterDay === Number(dn) ? null : Number(dn))}
                style={{ flexShrink: 0, padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 11, fontWeight: 700, background: filterDay === Number(dn) ? d.color : "#2a2823", color: filterDay === Number(dn) ? "#111110" : d.color }}>
                Day {dn}
              </button>
            ))}
          </div>
        </div>

        {/* History list */}
        <div style={{ padding: "4px 18px 100px" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "#6b6557", fontSize: 13, fontFamily: SANS }}>No sessions found</div>
          ) : filtered.map(entry => {
            const prog = entry.programDay ? PROGRAM[entry.programDay] : null;
            const color = prog?.color ?? "#6b6557";
            const expanded = expandedId === entry.id;
            const entryProg = entry.programDay ? PROGRAM[entry.programDay] : null;
            const entryColor = entryProg?.color ?? "#d4af37";
            const totalVol = entry.movements.reduce((n, mv) =>
              n + mv.sets.reduce((s, set) => s + (parseFloat(set.w)||0) * (parseFloat(set.r)||0), 0), 0);
            return (
              <div key={entry.id} style={{ marginBottom: 8, borderRadius: 14, overflow: "hidden", background: "#111110", border: `1.5px solid ${expanded ? color + "66" : "#2a2823"}` }}>
                <div style={{ height: 3, background: prog ? color : "#2a2823" }} />
                <div onClick={() => setExpandedId(expanded ? null : entry.id)}
                  style={{ padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: "#6b6557", fontFamily: SANS, letterSpacing: 1, marginBottom: 2 }}>
                      {fmtDate(entry.date)}{entry.programDay ? ` · DAY ${entry.programDay}` : ""}
                      {entry.completedAt && <span style={{ color: "#d4af37", marginLeft: 6 }}>✓</span>}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#f5f1e8" }}>{entry.customTitle || "Custom Session"}</div>
                    <div style={{ fontSize: 11, color: "#6b6557", fontFamily: SANS, marginTop: 2 }}>
                      {entry.movements.length} movements
                      {totalVol > 0 && <span style={{ color: "#a89f8c", marginLeft: 8 }}>{Math.round(totalVol).toLocaleString()} lbs total vol</span>}
                    </div>
                  </div>
                  <div style={{ color: "#6b6557", fontSize: 14, fontFamily: SANS, transition: "transform 0.2s", transform: expanded ? "rotate(90deg)" : "none" }}>›</div>
                </div>
                {expanded && (
                  <div style={{ borderTop: "1px solid #2a2823", padding: "10px 14px 14px" }}>
                    {entry.note && <div style={{ fontSize: 12, color: "#a89f8c", marginBottom: 10, fontStyle: "italic" }}>{entry.note}</div>}
                    {entry.movements.map(mv => (
                      <div key={mv.id} style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#a89f8c", marginBottom: 4, fontFamily: SANS }}>
                          {mv.programRef ? `${mv.programRef}. ` : ""}{mv.name}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          {mv.sets.map((s, si) => (
                            <span key={si} style={{ fontSize: 11, fontFamily: SANS, padding: "3px 8px", borderRadius: 6, background: s.r ? entryColor + "22" : "#2a2823", border: `1px solid ${s.r ? entryColor + "44" : "#6b6557"}`, color: s.r ? entryColor : "#6b6557" }}>
                              {s.w ? `${s.w}×` : "BW×"}{s.r || "–"}
                            </span>
                          ))}
                          {mv.note && <span style={{ fontSize: 10, color: "#6b6557", fontStyle: "italic", alignSelf: "center", marginLeft: 4 }}>{mv.note}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <BottomNav tab={tab} setTab={setTab} />
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
        <div style={{ padding: "52px 18px 16px", background: "linear-gradient(160deg,#111110 0%,#141210 100%)" }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#6b6557", textTransform: "uppercase", fontFamily: SANS, marginBottom: 4 }}>Body Weight</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: "#f5f1e8", lineHeight: 1, fontFamily: SANS, letterSpacing: -0.5 }}>Weight Tracker</div>
          {latest && (
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 8 }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: "#d4af37", fontFamily: SANS }}>{latest.weight}</span>
              <span style={{ fontSize: 16, color: "#6b6557", fontFamily: SANS }}>{latest.unit}</span>
              {diff !== null && (
                <span style={{ fontSize: 14, fontFamily: SANS, fontWeight: 700, color: parseFloat(diff) < 0 ? "#d4af37" : parseFloat(diff) > 0 ? "#e05a4d" : "#a89f8c" }}>
                  {parseFloat(diff) > 0 ? "+" : ""}{diff} vs last
                </span>
              )}
            </div>
          )}
          {totalDiff !== null && (
            <div style={{ fontSize: 12, color: "#6b6557", fontFamily: SANS, marginTop: 4 }}>
              Total change: {parseFloat(totalDiff) > 0 ? "+" : ""}{totalDiff} {sorted_w[0]?.unit} over {weightLog.length} entries
            </div>
          )}
        </div>
        {chartData.length >= 2 && (
          <div style={{ margin: "16px 18px 0", padding: "16px", borderRadius: 16, background: "#111110", border: "1px solid #2a2823", overflowX: "auto" }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: "#6b6557", textTransform: "uppercase", fontFamily: SANS, marginBottom: 10 }}>Progress</div>
            <svg width="100%" viewBox={`0 0 ${CHART_W} ${CHART_H + 20}`} style={{ display: "block", overflow: "visible" }}>
              {[0, 0.25, 0.5, 0.75, 1].map(p => {
                const y = CHART_H - p * CHART_H;
                const val = (minV + p * range).toFixed(1);
                return (
                  <g key={p}>
                    <line x1="30" y1={y} x2={CHART_W} y2={y} stroke="#2a2823" strokeWidth="1" strokeDasharray="3,4" />
                    <text x="26" y={y + 4} fontSize="9" fill="#6b6557" textAnchor="end" fontFamily="monospace">{val}</text>
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
                  fill="none" stroke="#d4af37" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
                />
              )}
              {vals.map((v, i) => {
                const x = 30 + (i / Math.max(vals.length - 1, 1)) * (CHART_W - 30);
                const y = CHART_H - ((v - minV) / range) * CHART_H;
                return <circle key={i} cx={x} cy={y} r="3.5" fill="#d4af37" stroke="#111110" strokeWidth="1.5" />;
              })}
            </svg>
          </div>
        )}
        <div style={{ padding: "14px 18px 4px" }}>
          <button onClick={() => { setWeightDate(todayStr()); setWeightInput(""); setShowWeightForm(true); }}
            style={{ width: "100%", padding: "14px", borderRadius: 14, background: "#d4af37", border: "none", color: "#111110", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: SANS }}>
            + LOG WEIGHT
          </button>
        </div>
        <div style={{ padding: "8px 18px 4px" }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "#6b6557", textTransform: "uppercase", fontFamily: SANS, fontWeight: 700 }}>History · {weightLog.length} entries</div>
        </div>
        {sorted_w.length === 0 ? (
          <div style={{ margin: "20px 18px", padding: "32px 20px", borderRadius: 16, background: "#111110", border: "1px solid #2a2823", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}><Scale size={30} color={C.textDim} strokeWidth={1.8} /></div>
            <div style={{ color: "#a89f8c", fontSize: 14 }}>No weight entries yet</div>
          </div>
        ) : (
          <div style={{ padding: "4px 18px 100px" }}>
            {sorted_w.map((w, i) => {
              const prevW = sorted_w[i + 1];
              const d = prevW ? (parseFloat(w.weight) - parseFloat(prevW.weight)).toFixed(1) : null;
              return (
                <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, background: "#111110", border: "1px solid #2a2823", marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "#6b6557", fontFamily: SANS }}>{fmtDate(w.date)}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 22, fontWeight: 900, color: "#f5f1e8", fontFamily: SANS }}>{w.weight}</span>
                      <span style={{ fontSize: 12, color: "#6b6557", fontFamily: SANS }}>{w.unit}</span>
                      {d !== null && (
                        <span style={{ fontSize: 12, fontFamily: SANS, fontWeight: 700, color: parseFloat(d) < 0 ? "#d4af37" : parseFloat(d) > 0 ? "#e05a4d" : "#a89f8c" }}>
                          {parseFloat(d) > 0 ? "+" : ""}{d}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setWeightLog(prev => { const updated = prev.filter(x => x.id !== w.id); saveWeights(updated); return updated; })}
                    style={{ width: 30, height: 30, borderRadius: 8, background: "#1f1310", border: "1px solid #4a2820", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} strokeWidth={2.5} color={C.red} /></button>
                </div>
              );
            })}
          </div>
        )}
        {showWeightForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-end", zIndex: 100 }}
            onClick={() => setShowWeightForm(false)}>
            <div style={{ background: "#111110", width: "100%", borderRadius: "24px 24px 0 0", padding: "24px 18px 48px", border: "1.5px solid #2a2823", borderBottom: "none" }}
              onClick={e => e.stopPropagation()}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "#6b6557", margin: "0 auto 20px" }} />
              <div style={{ fontSize: 18, fontWeight: 800, color: "#f5f1e8", marginBottom: 16, fontFamily: SANS }}>Log Weight</div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Date</label>
                <input type="date" style={modalInput} value={weightDate} onChange={e => setWeightDate(e.target.value)} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={labelStyle}>Weight</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["lbs", "kg"].map(u => (
                      <button key={u} onClick={() => setWeightUnit(u)} style={{ padding: "4px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 12, fontWeight: 700, background: weightUnit === u ? "#d4af37" : "#2a2823", color: weightUnit === u ? "#111110" : "#a89f8c" }}>{u}</button>
                    ))}
                  </div>
                </div>
                <input type="number" inputMode="decimal" style={{ ...modalInput, fontSize: 28, fontWeight: 900, textAlign: "center", padding: "14px" }}
                  value={weightInput} onChange={e => setWeightInput(e.target.value)} placeholder="0.0" autoFocus />
              </div>
              <button onClick={addWeight} style={{ width: "100%", padding: "15px", borderRadius: 14, background: "#d4af37", border: "none", color: "#111110", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: SANS }}>
                SAVE →
              </button>
            </div>
          </div>
        )}
        <BottomNav tab={tab} setTab={setTab} />
      </Shell>
    );
  }

  // ── JOURNAL HOME ──────────────────────────────────────────────────────────
  return (
    <Shell>
      <div style={{ padding: "52px 18px 20px", background: "linear-gradient(160deg,#111110 0%,#141210 100%)" }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#6b6557", textTransform: "uppercase", fontFamily: SANS, marginBottom: 4 }}>Training Journal</div>
        <div style={{ fontSize: 30, fontWeight: 900, color: "#f5f1e8", lineHeight: 1, fontFamily: SANS, letterSpacing: -0.5 }}>My Workouts</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
          <div style={{ fontSize: 13, color: "#6b6557" }}>{entries.length} session{entries.length !== 1 ? "s" : ""} logged</div>
          <button onClick={() => setTab("data")}
            style={{ padding: "5px 12px", borderRadius: 8, background: "transparent", border: `1px solid ${C.line}`, color: C.textMid, fontSize: 12, fontFamily: SANS, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            <Database size={13} strokeWidth={2} /> Data
          </button>
        </div>
      </div>

      {/* Mesocycle banner */}
      {(() => {
        const meso = mesocycleWeek(entries, mesoOverride);
        const dimColor = "#d4af37";
        return (
          <div onClick={() => setShowMesoEdit(true)} style={{ margin: "12px 18px 4px", padding: "14px 16px", borderRadius: 14, background: meso.isDeload ? "#1a1607" : "#111110", border: `1.5px solid ${meso.isDeload ? "#d4af3744" : "#2a2823"}`, cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: dimColor, textTransform: "uppercase", fontFamily: SANS, fontWeight: 700 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Flame size={13} strokeWidth={2.2} /> Mesocycle {meso.cycle} · Week {meso.week} of {meso.total}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: "#6b6557", fontFamily: SANS }}>{meso.isDeload ? "DELOAD" : "ACCUMULATION"}</span>
                <Pencil size={12} color="#6b6557" strokeWidth={2} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              {Array.from({ length: meso.total }, (_, i) => {
                const wk = i + 1;
                const isCurrent = wk === meso.week;
                return (
                  <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: isCurrent ? "#d4af37" : wk < meso.week ? "#3a3318" : "#2a2823" }} />
                );
              })}
            </div>
            {meso.isDeload && (
              <div style={{ fontSize: 12, color: "#d4af37", fontFamily: SANS, marginTop: 8 }}>
                Deload week — drop volume ~50%, keep weights, leave 3–4 RIR
              </div>
            )}
            {!meso.isDeload && meso.week >= 3 && (
              <div style={{ fontSize: 12, color: "#a89f8c", fontFamily: SANS, marginTop: 8 }}>
                Add a set to lagging muscles this week · deload in {meso.total - meso.week} wk{meso.total - meso.week !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        );
      })()}

      <div style={{ padding: "12px 0 4px" }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: "#6b6557", textTransform: "uppercase", fontFamily: SANS, padding: "0 18px", marginBottom: 8 }}>Program Days</div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "2px 18px 8px", scrollbarWidth: "none" }}>
          {Object.entries(PROGRAM).map(([dn, d]) => (
            <div key={dn} style={{ flexShrink: 0, padding: "8px 12px", borderRadius: 12, background: "#1a1916", border: `1.5px solid ${d.color}33`, cursor: "pointer", minWidth: 60, textAlign: "center" }}
              onClick={() => { setNewProgramDay(Number(dn)); setNewDate(todayStr()); setShowNewModal(true); }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: d.color, fontFamily: SANS }}>{dn}</div>
              <div style={{ fontSize: 9, letterSpacing: 1.5, color: "#6b6557", textTransform: "uppercase", marginTop: 2 }}>{d.tag}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "4px 18px 8px" }}>
        <button onClick={() => { setNewProgramDay(null); setNewDate(todayStr()); setShowNewModal(true); }}
          style={{ width: "100%", padding: "15px", borderRadius: 14, background: C.accent, border: "none", color: C.bg, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: SANS, letterSpacing: 0.2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 20px rgba(74,222,128,0.25)" }}>
          <Dumbbell size={18} strokeWidth={2.2} /> Log Today's Session
        </button>
      </div>

      {sorted.length === 0 ? (
        <div style={{ margin: "40px 18px", textAlign: "center", color: "#6b6557" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}><ClipboardList size={30} color={C.textDim} strokeWidth={1.8} /></div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#a89f8c" }}>No sessions yet</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Tap a program day above or log a new session</div>
        </div>
      ) : (
        <div style={{ padding: "4px 18px 100px" }}>
          {sorted.map(entry => {
            const prog = entry.programDay ? PROGRAM[entry.programDay] : null;
            const color = prog?.color ?? "#6b6557";
            const isRest = prog?.exercises?.length === 0;
            const mvDone = entry.movements.filter(m => m.sets.some(s => s.r)).length;
            return (
              <div key={entry.id}
                onClick={() => { setActiveId(entry.id); setView("entry"); }}
                style={{ marginBottom: 12, borderRadius: 18, overflow: "hidden", background: "#111110", border: `1.5px solid #2a2823`, cursor: "pointer" }}>
                <div style={{ height: 4, background: isRest ? "#2a2823" : color }} />
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: "#6b6557", fontFamily: SANS, letterSpacing: 1, marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}>
                        {fmtDate(entry.date)}{prog ? ` · DAY ${entry.programDay}` : ""}
                        {entry.completedAt && <span style={{ color: "#d4af37", fontWeight: 800 }}>✓</span>}
                      </div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: "#f5f1e8", lineHeight: 1.2 }}>{entry.customTitle || "Untitled Session"}</div>
                      {entry.note ? (
                        <div style={{ fontSize: 13, color: "#a89f8c", marginTop: 5, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{entry.note}</div>
                      ) : null}
                    </div>
                    <div style={{ fontSize: 20, color: "#2a2823" }}>›</div>
                  </div>
                  {!isRest && entry.movements.length > 0 && (
                    <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {entry.movements.slice(0, 5).map(mv => (
                        <span key={mv.id} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 7, background: "#1a1916", border: "1px solid #2a2823", color: "#a89f8c", fontFamily: SANS }}>
                          {mv.programRef ? `${mv.programRef}. ` : ""}{mv.name || "–"}
                        </span>
                      ))}
                      {entry.movements.length > 5 && (
                        <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 7, background: "#1a1916", border: "1px solid #2a2823", color: "#6b6557" }}>
                          +{entry.movements.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                  {!isRest && (
                    <div style={{ marginTop: 8, fontSize: 11, color: "#6b6557", fontFamily: SANS }}>
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
          <div style={{ background: "#111110", width: "100%", borderRadius: "24px 24px 0 0", padding: "24px 18px 44px", border: "1.5px solid #2a2823", borderBottom: "none", boxSizing: "border-box" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "#2a2823", margin: "0 auto 20px" }} />
            <div style={{ fontSize: 18, fontWeight: 700, color: "#f5f1e8", marginBottom: 6, fontFamily: SANS }}>Set Mesocycle Week</div>
            <div style={{ fontSize: 13, color: "#a89f8c", marginBottom: 18, fontFamily: SANS, lineHeight: 1.5 }}>
              Which week of the {MESO_LENGTH}-week block are you in right now? It'll count forward from today.
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {Array.from({ length: MESO_LENGTH }, (_, i) => {
                const wk = i + 1;
                const isDeloadWk = wk === MESO_LENGTH;
                const current = mesocycleWeek(entries, mesoOverride).week === wk;
                return (
                  <button key={wk} onClick={() => { saveMesoOverride({ anchorDate: todayStr(), weekAtAnchor: wk }); setShowMesoEdit(false); }}
                    style={{ flex: 1, padding: "16px 0", borderRadius: 12, border: `1.5px solid ${current ? "#d4af37" : "#2a2823"}`, background: current ? "#d4af37" : "#1a1916", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, fontFamily: MONO, color: current ? "#0a0a0a" : "#f5f1e8" }}>{wk}</span>
                    <span style={{ fontSize: 9, fontFamily: SANS, fontWeight: 700, letterSpacing: 0.5, color: current ? "#0a0a0a" : "#6b6557" }}>{isDeloadWk ? "DELOAD" : "WK"}</span>
                  </button>
                );
              })}
            </div>
            <button onClick={() => { saveMesoOverride(null); setShowMesoEdit(false); }}
              style={{ width: "100%", padding: "12px", borderRadius: 12, background: "transparent", border: "1.5px solid #2a2823", color: "#a89f8c", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
              Reset to automatic
            </button>
          </div>
        </div>
      )}

      {showNewModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-end", zIndex: 100 }}
          onClick={() => setShowNewModal(false)}>
          <div style={{ background: "#111110", width: "100%", borderRadius: "24px 24px 0 0", padding: "24px 18px 44px", border: "1.5px solid #2a2823", borderBottom: "none", boxSizing: "border-box", overflow: "hidden" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "#6b6557", margin: "0 auto 20px" }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: "#f5f1e8", marginBottom: 16, fontFamily: SANS }}>Log Session</div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Date</label>
              <div style={{ position: "relative" }}>
                <div style={{ ...modalInput, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                  <span>{newDate ? new Date(newDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "Select date"}</span>
                  <span style={{ fontSize: 11, color: "#a89f8c" }}>tap to change</span>
                </div>
                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                  style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }} />
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Program Day (optional)</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                <div onClick={() => setNewProgramDay(null)} style={{ padding: "7px 14px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: SANS, background: newProgramDay === null ? "#d4af37" : "#1a1916", color: newProgramDay === null ? "#111110" : "#a89f8c", border: `1.5px solid ${newProgramDay === null ? "#d4af37" : "#2a2823"}` }}>Custom</div>
                {Object.entries(PROGRAM).map(([dn, d]) => (
                  <div key={dn} onClick={() => setNewProgramDay(Number(dn))} style={{ padding: "7px 14px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: SANS, background: newProgramDay === Number(dn) ? d.color : "#1a1916", color: newProgramDay === Number(dn) ? "#111110" : d.color, border: `1.5px solid ${newProgramDay === Number(dn) ? d.color : d.color + "33"}` }}>Day {dn}</div>
                ))}
              </div>
              {newProgramDay && (() => {
                const last = getLastSession(entries, newProgramDay);
                return (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 12, color: "#6b6557", fontFamily: SANS }}>→ {PROGRAM[newProgramDay].title} · {PROGRAM[newProgramDay].exercises.length} exercises pre-loaded</div>
                    {last ? (
                      <div style={{ fontSize: 12, color: "#d4af3777", fontFamily: SANS, marginTop: 4 }}>✓ Last session {fmtDate(last.date)} · weights carried forward</div>
                    ) : (
                      <div style={{ fontSize: 12, color: "#6b6557", fontFamily: SANS, marginTop: 4 }}>No previous session found · sets will start blank</div>
                    )}
                  </div>
                );
              })()}
            </div>
            <button onClick={createEntry} style={{ width: "100%", padding: "15px", borderRadius: 14, background: "#d4af37", border: "none", color: "#111110", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: SANS }}>
              CREATE SESSION →
            </button>
          </div>
        </div>
      )}
      <BottomNav tab={tab} setTab={setTab} />
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
    <div style={{ margin: "2px 18px 8px", padding: "10px 14px", borderRadius: 14, background: done ? "#1a1607" : "#111110", border: `1px solid ${done ? color + "66" : "#2a2823"}`, display: "flex", alignItems: "center", gap: 12, transition: "background 0.3s, border-color 0.3s" }}>
      <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0 }}>
        <svg width="52" height="52" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="26" cy="26" r={R} fill="none" stroke="#2a2823" strokeWidth="3" />
          <circle cx="26" cy="26" r={R} fill="none" stroke={done ? color : running ? color : "#6b6557"} strokeWidth="3" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.9s linear, stroke 0.3s" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: remaining >= 60 ? 11 : 13, fontWeight: 800, fontFamily: SANS, color: done ? color : running ? "#f5f1e8" : "#6b6557" }}>
          {done ? "✓" : timeStr}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: SANS, color: done ? color : "#6b6557", fontWeight: 700, marginBottom: 6 }}>
          {done ? "Rest complete" : `Rest · ${restLabel}`}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {!active && !done && <button onClick={onStart} style={timerBtn(color, true)}>▶ Start</button>}
          {active && running && <button onClick={onPause} style={timerBtn("#6b6557", false)}>⏸ Pause</button>}
          {active && !running && !done && <button onClick={onResume} style={timerBtn(color, true)}>▶ Resume</button>}
          {active && <button onClick={onReset} style={timerBtn("#2a2823", false)}>↺</button>}
          {done && <button onClick={onDismiss} style={timerBtn(color, true)}>Next set →</button>}
        </div>
      </div>
    </div>
  );
}
function timerBtn(bg, bright) {
  return { padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: bg, color: bright ? "#111110" : "#a89f8c", fontSize: 12, fontWeight: 700, fontFamily: SANS };
}
function BottomNav({ tab, setTab }) {
  const tabs = [
    { id: "journal", label: "Journal", Icon: ClipboardList },
    { id: "volume", label: "Volume", Icon: BarChart3 },
    { id: "weight", label: "Weight", Icon: Scale },
    { id: "data", label: "Data", Icon: Database },
  ];
  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "rgba(14,17,22,0.92)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderTop: `1px solid ${C.line}`, display: "flex", padding: "8px 0 24px", zIndex: 50 }}>
      {tabs.map(t => {
        const active = tab === t.id;
        return (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: "6px 0", transition: "transform 0.15s", transform: active ? "translateY(-1px)" : "none" }}>
            <t.Icon size={20} strokeWidth={active ? 2.4 : 1.8} color={active ? C.accent : C.textDim} />
            <span style={{ fontSize: 10, letterSpacing: 0.5, fontFamily: SANS, color: active ? C.accent : C.textDim, fontWeight: active ? 700 : 500 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
function Shell({ children }) {
  return <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: SANS, maxWidth: 430, margin: "0 auto", overflowX: "hidden" }}>{children}</div>;
}
function TopBar({ left, right }) {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "52px 18px 8px" }}>{left}{right}</div>;
}
function BackBtn({ onClick, label }) {
  return <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", color: C.accent, fontSize: 15, fontWeight: 600, padding: 0, fontFamily: SANS, display: "flex", alignItems: "center", gap: 4 }}><ChevronLeft size={18} strokeWidth={2.4} /> {label}</button>;
}
function SectionLabel({ children }) {
  return <div style={{ padding: "16px 18px 6px", fontSize: 11, letterSpacing: 2, color: "#6b6557", textTransform: "uppercase", fontFamily: SANS, fontWeight: 700 }}>{children}</div>;
}
function Pill({ color, children }) {
  return <span style={{ padding: "5px 13px", borderRadius: 20, background: color + "1a", border: `1px solid ${color}33`, fontSize: 12, fontWeight: 600, color, fontFamily: SANS, letterSpacing: 0.2 }}>{children}</span>;
}
function MvCard({ children, color, onClick }) {
  return <div onClick={onClick} style={{ margin: "0 18px 10px", padding: "16px 18px", borderRadius: 18, background: C.surface, border: `1px solid ${C.line}`, boxShadow: shadow, cursor: "pointer", transition: "transform 0.12s, border-color 0.2s" }}>{children}</div>;
}
function GhostBtn({ onClick, children }) {
  return <button onClick={onClick} style={{ display: "block", width: "calc(100% - 36px)", margin: "4px 18px", padding: "13px", borderRadius: 14, background: "transparent", border: `1.5px dashed ${C.line}`, color: C.textDim, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: SANS }}>{children}</button>;
}

// SetRow with weight, reps, RIR selector, and movement-type-aware feedback
function SetRow({ num, weight, reps, rir, repsTarget, type, isLastSet, done, color, onW, onR, onRIR, onDelete, onDone }) {
  const repRange = (() => {
    if (!repsTarget) return null;
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
    <div style={{ margin: "0 18px 4px", padding: "12px 14px", borderRadius: 14, background: done ? "#161410" : "#111110", border: `1px solid ${done ? color + "44" : "#2a2823"}`, transition: "background 0.2s, border-color 0.2s", opacity: done ? 0.75 : 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: "#1a1916", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#6b6557", fontFamily: SANS, flexShrink: 0 }}>{num}</div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{ fontSize: 10, letterSpacing: 1.5, color: "#6b6557", textTransform: "uppercase", fontFamily: SANS }}>Weight</div>
          <input type="number" inputMode="decimal" value={weight} onChange={e => onW(e.target.value)} placeholder="0" style={setInput(color)} />
          <div style={{ fontSize: 10, color: "#6b6557", fontFamily: SANS }}>kg</div>
        </div>
        <div style={{ color: "#2a2823", fontSize: 16, fontWeight: 300 }}>×</div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{ fontSize: 10, letterSpacing: 1.5, color: "#6b6557", textTransform: "uppercase", fontFamily: SANS }}>
            Reps{repRange ? ` ${repRange.min}–${repRange.max}` : ""}
          </div>
          <input type="number" inputMode="numeric" value={reps} onChange={e => onR(e.target.value)}
            placeholder={repRange ? `${repRange.min}–${repRange.max}` : "0"}
            style={{ ...setInput(color), borderColor: inRange ? color : belowRange ? "#e05a4d" : aboveRange ? "#d4af37" : undefined }} />
          <div style={{ fontSize: 10, fontFamily: SANS, fontWeight: 700, color: inRange ? color : belowRange ? "#e05a4d" : aboveRange ? "#d4af37" : "#6b6557" }}>
            {inRange ? "✓ in range" : belowRange ? "↓ go lighter" : aboveRange ? "↑ go heavier" : "reps"}
          </div>
        </div>
        <button onClick={onDone} style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: done ? color : C.surface2, border: `2px solid ${done ? color : C.line}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.12s, background 0.15s, border-color 0.15s", transform: done ? "scale(1.05)" : "scale(1)" }}><Check size={20} strokeWidth={3} color={done ? C.bg : C.textDim} /></button>
        {onDelete && (
          <button onClick={onDelete} style={{ width: 28, height: 28, borderRadius: 8, background: "#1f1310", border: "1px solid #4a2820", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><X size={15} strokeWidth={2.5} color={C.red} /></button>
        )}
      </div>
      {/* RIR row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, paddingTop: 10, borderTop: "1px solid #1c1b18" }}>
        <div style={{ fontSize: 10, letterSpacing: 1.5, color: "#6b6557", textTransform: "uppercase", fontFamily: SANS, flexShrink: 0 }}>RIR</div>
        <div style={{ display: "flex", gap: 5 }}>
          {["0", "1", "2", "3", "4"].map(v => {
            const sel = String(rir) === v;
            return (
              <button key={v} onClick={() => onRIR(sel ? "" : v)} style={{
                width: 30, height: 30, borderRadius: 8, cursor: "pointer",
                background: sel ? color : "#1a1916",
                border: `1.5px solid ${sel ? color : "#2a2823"}`,
                color: sel ? "#111110" : "#a89f8c",
                fontSize: 13, fontWeight: 800, fontFamily: SANS,
              }}>{v}</button>
            );
          })}
        </div>
        {rirFb && (
          <div style={{ fontSize: 10, fontFamily: SANS, fontWeight: 700, color: rirFb.color, marginLeft: "auto", textAlign: "right", lineHeight: 1.2 }}>
            {rirFb.msg}
          </div>
        )}
      </div>
    </div>
  );
}

function setInput(color) {
  return { width: "100%", background: "#1a1916", border: `1.5px solid #2a2823`, borderRadius: 10, padding: "8px 6px", fontSize: 20, fontWeight: 800, color: "#f5f1e8", textAlign: "center", outline: "none", WebkitAppearance: "none", fontFamily: MONO };
}
const bigInput = { width: "100%", background: "transparent", border: "none", borderBottom: "1.5px solid #2a2823", padding: "6px 0", fontSize: 22, fontWeight: 800, color: "#f5f1e8", outline: "none", fontFamily: SANS, letterSpacing: -0.5, boxSizing: "border-box" };
const ghostInput = { width: "100%", background: "transparent", border: "none", padding: "4px 0", outline: "none", fontFamily: SANS, boxSizing: "border-box", color: "#a89f8c" };
const noteArea = { width: "calc(100% - 36px)", margin: "0 18px", background: "#111110", border: "1.5px solid #2a2823", borderRadius: 14, padding: "12px 14px", fontSize: 14, color: "#a89f8c", outline: "none", resize: "none", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, boxSizing: "border-box" };
const modalInput = { width: "100%", background: "#1a1916", border: "1.5px solid #2a2823", borderRadius: 10, padding: "11px 14px", fontSize: 15, color: "#f5f1e8", outline: "none", fontFamily: SANS, boxSizing: "border-box" };
const labelStyle = { fontSize: 11, letterSpacing: 2, color: "#6b6557", textTransform: "uppercase", fontFamily: SANS, fontWeight: 700 };
function btnStyle(bg, text) {
  return { padding: "7px 14px", borderRadius: 10, background: bg, border: "none", color: text, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: SANS };
}