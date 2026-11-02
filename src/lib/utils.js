

// ── HELPERS ──────────────────────────────────────────────────────────────────
export function todayStr() {
  // IMPORTANT: use LOCAL date components, not toISOString() which is UTC-based.
  // toISOString() rolls over to the next calendar day ~4-5 hours early for US timezones
  // (e.g. 8pm Eastern is already after midnight UTC), which silently broke "today" for
  // macros, journal entries, and cycle tracking in the evening.
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
export function localDateStr(d) {
  // Same local-date logic as todayStr(), for an arbitrary Date object (not just "now")
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
export function restToSeconds(restStr) {
  if (!restStr) return 60;
  const m = restStr.match(/(\d+)\s*m(?:\s*(\d+)\s*s)?/);
  if (m) return parseInt(m[1]) * 60 + (m[2] ? parseInt(m[2]) : 0);
  const s = restStr.match(/(\d+)\s*s/);
  if (s) return parseInt(s[1]);
  return 60;
}
export function fmtDate(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(String(iso))) return "Date unknown";
  const d = new Date(String(iso).slice(0, 10) + "T12:00:00");
  if (isNaN(d)) return "Date unknown";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}
export function newEntry(dateStr) {
  return {
    id: Date.now(),
    date: dateStr,
    programDay: null,
    customTitle: "",
    note: "",
    movements: [],
    completedAt: null,
    warmup: { stretchBefore: false, treadmill: false, stretchAfter: false },
    location: "equinox",
  };
}
export function newMovement(name = "") {
  return { id: Date.now() + Math.random(), name, sets: [{ w: "", r: "" }], note: "" };
}
