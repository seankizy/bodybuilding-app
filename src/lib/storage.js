import { todayStr } from "./utils.js";
import { DEFAULT_MACRO_TARGETS } from "./macros.js";

export const SEED_WEIGHTS = [];
// ── STORAGE (localStorage — persists across deployments) ──────────────────
export async function loadEntries() {
  try {
    const raw = localStorage.getItem("wj_entries");
    if (raw) { const p = JSON.parse(raw); if (Array.isArray(p)) return p; }
  } catch {}
  return [];
}
export async function saveEntries(entries) {
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

export async function loadWeights() {
  try {
    const raw = localStorage.getItem("wj_weights");
    if (raw) { const p = JSON.parse(raw); if (Array.isArray(p) && p.length > 0) return p; }
  } catch {}
  return JSON.parse(JSON.stringify(SEED_WEIGHTS));
}
export async function saveWeights(weights) {
  try { localStorage.setItem("wj_weights", JSON.stringify(weights)); } catch {}
}

// ── SERVER CALLS ──────────────────────────────────────────────────────────────
// AI and Drive calls go through /api/* on Vercel so no key ever ships to the browser.
// The server checks a passcode you enter once on this phone (APP_PASSCODE env var).
export function getPasscode() {
  let code = "";
  try { code = localStorage.getItem("wj_passcode") || ""; } catch {}
  if (!code) {
    code = (window.prompt("Enter your app passcode to use AI and photos") || "").trim();
    if (code) { try { localStorage.setItem("wj_passcode", code); } catch {} }
  }
  return code;
}
// A wrong passcode is forgotten so the app asks again next time.
export async function apiFetch(url, opts) {
  const resp = await fetch(url, opts);
  if (resp.status === 401) { try { localStorage.removeItem("wj_passcode"); } catch {} }
  return resp;
}
export function appHeaders() {
  return { "Content-Type": "application/json", "x-app-passcode": getPasscode() };
}

// ── BACKUP ────────────────────────────────────────────────────────────────────
// On iPhone this opens the share sheet, so you can save straight to Google Drive or Files.
export async function saveBackupFile(payload) {
  const name = `workout_backup_${todayStr()}.json`;
  const json = JSON.stringify(payload, null, 2);
  try {
    const file = new File([json], name, { type: "application/json" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: "Workout Journal backup" });
      try { localStorage.setItem("wj_last_backup", new Date().toISOString()); } catch {}
      return true;
    }
  } catch (e) {
    if (e?.name === "AbortError") return false; // user closed the share sheet
  }
  const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
  try { localStorage.setItem("wj_last_backup", new Date().toISOString()); } catch {}
  return true;
}
export function backupFromStorage() {
  const read = (k, fallback) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
  let cycleAnchor = null;
  try { cycleAnchor = localStorage.getItem("wj_cycle_anchor"); } catch {}
  return {
    version: 4, exportedAt: new Date().toISOString(),
    entries: read("wj_entries", []), weights: read("wj_weights", []),
    mesoOverride: read("wj_meso", null), cycleAnchor,
    macros: read("wj_macros", {}), macroTargets: read("wj_macro_targets", DEFAULT_MACRO_TARGETS),
    deload: read("wj_deload", null),
  };
}
export function daysSinceBackup() {
  try {
    const last = localStorage.getItem("wj_last_backup");
    if (!last) return Infinity;
    return (Date.now() - new Date(last).getTime()) / 86400000;
  } catch { return Infinity; }
}

// ── CSV EXPORT ────────────────────────────────────────────────────────────────
export function buildCSV(entries, weights) {
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
export function csvEsc(v) {
  if (!v) return "";
  if (v.includes(",") || v.includes('"') || v.includes("\n")) return `"${v.replace(/"/g, '""')}"`;
  return v;
}
export function downloadCSV(entries, weights) {
  const csv = buildCSV(entries, weights);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `workout_journal_${todayStr()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
export function downloadJSON(entries, weights, mesoOverride, cycleAnchor, macros, macroTargets) {
  const payload = { version: 4, exportedAt: new Date().toISOString(), entries, weights, mesoOverride: mesoOverride ?? null, cycleAnchor: cycleAnchor ?? null, macros: macros ?? {}, macroTargets: macroTargets ?? DEFAULT_MACRO_TARGETS };
  try { payload.deload = JSON.parse(localStorage.getItem("wj_deload") || "null"); } catch { payload.deload = null; }
  return saveBackupFile(payload);
}
export function readJSONBackup(file) {
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
export function isMacroOnlyBackup(parsed) {
  if (Array.isArray(parsed)) return false;
  if (parsed.entries || parsed.movements) return false; // workout backup shape
  const dateKeys = Object.keys(parsed).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k));
  return dateKeys.length > 0;
}

export function getLastSession(entries, programDay, location = null) {
  const days = [...entries]
    .filter(e => e.programDay === programDay)
    .sort((a, b) => b.date.localeCompare(a.date));
  if (location) {
    const same = days.find(e => (e.location ?? "equinox") === location);
    if (same) return same;
  }
  return days[0] ?? null;
}
