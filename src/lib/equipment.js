// ── GYM EQUIPMENT PROFILES ──────────────────────────────────────────────────
// Per-gym machine limits, so a suggestion never asks for more than the stack or
// sled at that gym can hold. Stored in localStorage as wj_equipment:
//   { [location]: { [exercise name]: maxLoadLb } }
// Seeded defaults apply until Sean edits that machine (an edit, including a clear,
// always wins). Included in the JSON export and the Drive backup.
import { nameKey } from "../program.js";

const KEY = "wj_equipment";
// Sean, Nov 3, 2026: the leg press at the apartment gym maxes out at 235 lb.
export const DEFAULT_EQUIPMENT = {
  apartment: { "Leg Press Machine": 235 },
};

function readStored() {
  try { return JSON.parse(localStorage.getItem(KEY) || "null") || {}; } catch { return {}; }
}
// Merged view: defaults first, stored edits on top. A stored null means "no max".
export function loadEquipment() {
  const stored = readStored();
  const out = {};
  for (const loc of new Set([...Object.keys(DEFAULT_EQUIPMENT), ...Object.keys(stored)])) {
    const merged = { ...(DEFAULT_EQUIPMENT[loc] ?? {}), ...(stored[loc] ?? {}) };
    out[loc] = Object.fromEntries(Object.entries(merged).filter(([, v]) => v != null && v !== "" && Number(v) > 0).map(([k, v]) => [k, Number(v)]));
  }
  return out;
}
export function rawEquipment() { return readStored(); }
export function saveRawEquipment(obj) {
  try { if (obj && typeof obj === "object") localStorage.setItem(KEY, JSON.stringify(obj)); } catch {}
}
export function machineMax(location, name) {
  if (!location || !name) return null;
  const table = loadEquipment()[location] ?? {};
  const want = nameKey(name);
  for (const [k, v] of Object.entries(table)) if (nameKey(k) === want) return v;
  return null;
}
// max = number to set, or null/"" to remove the limit for that machine at that gym.
export function setMachineMax(location, name, max) {
  const stored = readStored();
  const table = { ...(stored[location] ?? {}) };
  const want = nameKey(name);
  for (const k of Object.keys(table)) if (nameKey(k) === want && k !== name) delete table[k];
  const n = Number(max);
  table[name] = max === null || max === "" || !(n > 0) ? null : n;
  stored[location] = table;
  saveRawEquipment(stored);
}

// Cap a suggestion at this machine's max. When the progression asks for more than the
// machine holds, prescribe the max and progress with reps, tempo, pauses, then a harder
// variation, and say so.
export function capSuggestion(sug, { max, location, label, repsTarget, lastTop, crossGym, otherLabel }) {
  if (!sug || !(max > 0) || !(sug.weight > max)) return sug;
  const m = String(repsTarget || "").match(/(\d+)\s*[–-]\s*(\d+)/);
  const top = m ? Number(m[2]) : null;
  const here = label || "this gym";
  if (sug.action === "deload") {
    const w = Math.max(5, Math.round((max * 0.875) / 5) * 5);
    return { ...sug, weight: w, capped: max,
      reason: `Deload cycle. ${here}'s machine tops out at ${max} lb, so use about 15% under that and leave 3+ reps in reserve.` };
  }
  const atMaxAlready = lastTop && !crossGym && lastTop.w >= max;
  const repsLine = top
    ? (atMaxAlready && lastTop.r >= top
        ? `You already hit ${lastTop.r} reps at ${max}. Go past ${top} toward ${top + 5}, then use a 3-second lowering with a 1-second pause at the bottom, then go single-leg at ${max}.`
        : `Build reps to the top of ${repsTarget} and beyond toward ${top + 5}, then add a 3-second lowering with a pause at the bottom, then go single-leg.`)
    : "Add reps first, then a 3-second lowering with a pause at the bottom, then a single-leg variation.";
  const from = crossGym && lastTop ? ` Your ${lastTop.w} lb at ${otherLabel || "the other gym"} was a different machine and does not carry over.` : "";
  return { ...sug, action: sug.action === "back_off" ? "back_off" : "hold", calibrate: false, weight: max, capped: max,
    reason: `${here}'s machine maxes out at ${max} lb, so the load stays at ${max}.${from} ${repsLine}` };
}
