

export const DEFAULT_MACRO_TARGETS = {
  // Revised Sep 29, 2026: protein down to 200g, freed calories to carbs, rest days
  // raised so the surplus holds every day. Adjust every 2 weeks off the 7-day
  // average weight (see the check-in card): under +0.25 lb/wk add 150 kcal of carbs,
  // over +0.75 lb/wk remove 150.
  training: { p: 200, c: 330, f: 75 }, // ~2,795 kcal
  rest:     { p: 200, c: 270, f: 70 }, // ~2,510 kcal
};
export function macroCals(p, c, f) {
  return Math.round((parseFloat(p)||0) * 4 + (parseFloat(c)||0) * 4 + (parseFloat(f)||0) * 9);
}
export function loadMacros() {
  try {
    const raw = localStorage.getItem("wj_macros");
    if (raw) { const p = JSON.parse(raw); if (p && typeof p === "object" && !Array.isArray(p)) return p; }
  } catch {}
  return {};
}
export function saveMacrosLS(data) {
  try { localStorage.setItem("wj_macros", JSON.stringify(data)); } catch (e) {
    if (e.name === "QuotaExceededError") alert("Storage full — export a backup first.");
  }
}
export function loadMacroTargets() {
  try {
    const raw = localStorage.getItem("wj_macro_targets");
    if (raw) { const p = JSON.parse(raw); if (p?.training && p?.rest) return p; }
  } catch {}
  return DEFAULT_MACRO_TARGETS;
}
export function saveMacroTargetsLS(t) {
  try { localStorage.setItem("wj_macro_targets", JSON.stringify(t)); } catch {}
}
export function migrateMacroBackup(raw) {
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
export function extractMacroTargets(raw) {
  const tw = raw.__targetsWorkout;
  const tr = raw.__targetsRest;
  if (!tw && !tr) return null;
  const norm = (t) => t ? { p: t.p ?? t.protein ?? 220, c: t.c ?? t.carbs ?? 150, f: t.f ?? t.fat ?? 60 } : null;
  const training = norm(tw);
  const rest = norm(tr);
  if (!training && !rest) return null;
  return { training: training ?? DEFAULT_MACRO_TARGETS.training, rest: rest ?? DEFAULT_MACRO_TARGETS.rest };
}
export function dayTotals(day) {
  const t = { cal: 0, p: 0, c: 0, f: 0 };
  (day?.entries ?? []).forEach(e => {
    t.cal += parseFloat(e.cal) || 0;
    t.p += parseFloat(e.p) || 0;
    t.c += parseFloat(e.c) || 0;
    t.f += parseFloat(e.f) || 0;
  });
  return { cal: Math.round(t.cal), p: Math.round(t.p), c: Math.round(t.c), f: Math.round(t.f) };
}
