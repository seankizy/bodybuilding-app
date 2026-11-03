import { MESO_LENGTH, BLOCK_START, PROGRAM } from "../program.js";

// ── MESOCYCLE, COUNTED IN 8-DAY CYCLES ───────────────────────────────────────
// Training is counted in completed 8-day cycles from the log, never calendar weeks.
// A block is MESO_LENGTH cycles; the last one is the deload cycle.
//
//  - A cycle starts at a logged Day 1 session. Missed days shift the cycle, they never
//    skip it, so a slow cycle is still one cycle.
//  - The cycle stays current until its Day 7 (the last training day) is completed.
//    The day after that, the next cycle is current even before its Day 1 is logged.
//  - Only completed sessions count. An in-progress session never moves the count.
//
// Override (wj_meso, set from the edit sheet): { anchorDate, cycleAtAnchor } means
// "the cycle in progress (or about to start) on anchorDate is cycle N of the count".
// Older installs stored { anchorDate, weekAtAnchor }; weekAtAnchor is read as the
// cycle number, which for the Sep 2026 block pin (anchor Sep 21/22, 1) is the same.

const CYCLE_DAYS = 8;
const LAST_TRAINING_DAY = Math.max(...Object.keys(PROGRAM).map(Number).filter(n => PROGRAM[n]?.exercises?.length > 0));

function readOverride() {
  try { return JSON.parse(localStorage.getItem("wj_meso") || "null"); } catch { return null; }
}
function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Completed training sessions on/after the anchor, oldest first, each tagged with its
// running cycle number. Returns { anchor, startCycle, sessions: [{ date, day, cycle }] }.
export function cycleTimeline(entries, override) {
  const ov = override === undefined ? readOverride() : override;
  const anchor = ov?.anchorDate || BLOCK_START;
  const startCycle = Math.max(1, Number(ov?.cycleAtAnchor ?? ov?.weekAtAnchor ?? 1) || 1);
  const done = (entries || [])
    .filter(e => e.completedAt && e.date >= anchor && PROGRAM[e.programDay]?.exercises?.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date) || String(a.completedAt).localeCompare(String(b.completedAt)));
  let cycle = startCycle, seen = false;
  const sessions = done.map(e => {
    if (e.programDay === 1 && seen) cycle++;
    seen = true;
    return { date: e.date, day: e.programDay, cycle };
  });
  return { anchor, startCycle, sessions };
}

// Running cycle number (1-based, across blocks) for a date.
export function cycleIndexOn(entries, date, override) {
  const { startCycle, sessions } = cycleTimeline(entries, override);
  const upto = sessions.filter(s => s.date <= date);
  if (!upto.length) return startCycle;
  const last = upto[upto.length - 1];
  // Day 7 done and the next Day 1 is due (the Day 8 rest day still belongs to this
  // cycle): the next cycle is current, even before its Day 1 is logged.
  if (last.day === LAST_TRAINING_DAY) {
    const due = new Date(last.date + "T12:00:00");
    due.setDate(due.getDate() + (CYCLE_DAYS - LAST_TRAINING_DAY + 1));
    const dueStr = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, "0")}-${String(due.getDate()).padStart(2, "0")}`;
    if (date >= dueStr) return last.cycle + 1;
  }
  return last.cycle;
}

function blockPos(idx) {
  const cycleInBlock = ((idx - 1) % MESO_LENGTH) + 1;
  return { cycleInBlock, block: Math.floor((idx - 1) / MESO_LENGTH) + 1, isDeload: cycleInBlock === MESO_LENGTH };
}

// True when a session date falls in a deload cycle (by the cycle count, not the calendar).
export function isDeloadCycleOn(entries, date, override) {
  return blockPos(cycleIndexOn(entries, date, override)).isDeload;
}

// Kept under its old name so callers do not change. `week` is now the cycle within the
// block (1..total) and `cycle` is the block number; `cycleInBlock`/`block` say it plainly.
export function mesocycleWeek(entries, override, today = localToday()) {
  const idx = cycleIndexOn(entries, today, override);
  const p = blockPos(idx);
  return {
    week: p.cycleInBlock, cycleInBlock: p.cycleInBlock, total: MESO_LENGTH,
    isDeload: p.isDeload, cycle: p.block, block: p.block, cycleIndex: idx, unit: "cycle",
  };
}
