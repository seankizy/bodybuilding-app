import { MESO_LENGTH, MESO_START } from "../program.js";

// ── MESOCYCLE ─────────────────────────────────────────────────────────────────
export function mesocycleWeek(entries, override) {
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
