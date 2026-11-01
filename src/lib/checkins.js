import { BLOCK_START } from "../program.js";
import { localDateStr } from "./utils.js";

// ── CHECK-INS ────────────────────────────────────────────────────────────────
// Every 2 weeks from the block start (Mondays: Oct 5, Oct 19, Nov 2, ...), bring
// the coach report and backup to Claude for review. The check-in that lands in the
// last two weeks of a block doubles as the full program review before the next one.
export const CHECKIN_ANCHOR = BLOCK_START;
export const CHECKIN_EVERY_DAYS = 14;
export function addDays(dateStr, n) {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + n);
  return localDateStr(d);
}
export function daysBetween(a, b) {
  return Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 86400000);
}
// Latest scheduled check-in on or before `today` (null before the first one), and
// the next one after today.
export function checkinSchedule(today) {
  const elapsed = daysBetween(CHECKIN_ANCHOR, today);
  const k = Math.floor(Math.max(0, elapsed) / CHECKIN_EVERY_DAYS);
  const latest = k >= 1 ? addDays(CHECKIN_ANCHOR, k * CHECKIN_EVERY_DAYS) : null;
  const next = addDays(CHECKIN_ANCHOR, (k + 1) * CHECKIN_EVERY_DAYS);
  return { latest, next };
}
// 7-day average weight ending on `end`, compared with the 7-day average two weeks
// earlier. Returns the weekly rate of change in lbs, or null without enough data.
export function weightTrend(weightLog, end) {
  const toLb = w => (w.unit === "kg" ? parseFloat(w.weight) * 2.20462 : parseFloat(w.weight));
  const avg = (from, to) => {
    const pts = weightLog.filter(w => w.date >= from && w.date <= to).map(toLb).filter(n => !isNaN(n));
    return pts.length >= 3 ? pts.reduce((s, n) => s + n, 0) / pts.length : null;
  };
  const now = avg(addDays(end, -6), end);
  const before = avg(addDays(end, -20), addDays(end, -14));
  if (now == null || before == null) return { now, before, rate: null };
  return { now, before, rate: (now - before) / 2 };
}
// The every-2-weeks calorie rule: target is about +0.5 lb per week (coach, Oct 5).
export function surplusAdvice(rate) {
  if (rate == null) return { action: "none", carbs: 0, text: "Not enough weigh-ins to judge the trend. Weigh in at least 3 mornings a week." };
  // Coach (Oct 5): aim for about +0.5 lb/week, judged on the 7-day average, not single
  // weigh-ins. A band of 0.25 to 0.75 counts as on target.
  if (rate < 0.25) return { action: "add", carbs: 38, text: `Gaining ${rate.toFixed(2)} lb/week, under the +0.5 target. Add 150 kcal of carbs (about 38g) to both day types.` };
  if (rate > 0.75) return { action: "remove", carbs: -38, text: `Gaining ${rate.toFixed(2)} lb/week, over the +0.5 target. Take 150 kcal of carbs (about 38g) out of both day types.` };
  return { action: "hold", carbs: 0, text: `Gaining ${rate.toFixed(2)} lb/week, right around the +0.5 lb target. Keep the current targets.` };
}
