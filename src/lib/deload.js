// ── DELOAD CYCLE + NEXT-BLOCK CUES ──────────────────────────────────────────
// One full 8-day cycle of lighter training, planned ahead so every lift shows the
// exact weight x reps x sets. Same exercises, about half the sets, about 10 to 15%
// under the last top working weight, reps at the normal target, RIR 3 to 4.
//
// The deload runs from its start date until the Day 7 session of that cycle is
// completed (so a missed day just shifts it, like the training holds). After that
// the next-block cues become the active targets until each lift is logged again.
//
// Stored in localStorage as wj_deload, included in the JSON export and Drive backup:
//   { startDate, createdAt, endedAt, plans: { [location]: { [day]: [prescription] } }, cues: { [name]: cue } }
import { PROGRAM, LOCATIONS, canonName, nameKey, resolveExercise } from "../program.js";
import { lastMovementByName } from "./movements.js";
import { addDays, daysBetween } from "./checkins.js";
import { todayPlan } from "./dailyBrief.js";

const KEY = "wj_deload";
export const CYCLE_LEN = 8;
export const DELOAD_LAST_DAY = 7; // last training day of the cycle

export function loadDeload() {
  try { const d = JSON.parse(localStorage.getItem(KEY) || "null"); return d && d.startDate ? d : null; } catch { return null; }
}
export function saveDeload(d) {
  try { if (d) localStorage.setItem(KEY, JSON.stringify(d)); else localStorage.removeItem(KEY); } catch {}
}

// Start of the next cycle (next Day 1), walking the 8-day cycle forward from where
// the app says he is today. Misses shift it, same as the Outlook holds.
export function nextCycleStart(entries, today) {
  const plan = todayPlan(entries, today);
  let pos = plan.day, date = plan.kind === "train" ? today : plan.due;
  if (pos === 1 && plan.kind !== "done") {
    // Day 1 is the next session itself, so that is the next cycle.
    return date < today ? today : date;
  }
  let guard = 0;
  while (pos !== 1 && guard++ < 20) { pos = (pos % CYCLE_LEN) + 1; date = addDays(date, 1); }
  return date;
}

// off | scheduled | active | done
export function deloadStatus(d, entries, today) {
  if (!d) return { status: "off" };
  const start = d.startDate;
  const end = d.endedAt ?? deloadEndDate(d, entries);
  if (end && today > end) return { status: "done", start, end };
  if (today < start) return { status: "scheduled", start, daysAway: daysBetween(today, start) };
  return { status: "active", start, end: end ?? null, dayOfCycle: Math.min(CYCLE_LEN, daysBetween(start, today) + 1) };
}
// The date the deload finished: Day 7 completed on/after the start, or two weeks out as a safety stop.
export function deloadEndDate(d, entries) {
  const done = entries
    .filter(e => e.completedAt && e.programDay === DELOAD_LAST_DAY && e.date >= d.startDate)
    .map(e => e.date).sort()[0];
  if (done) return done;
  return addDays(d.startDate, 13);
}
export function isDeloadActive(entries, today) {
  return deloadStatus(loadDeload(), entries, today).status === "active";
}
// The deload decides when one is planned; otherwise the old mesocycle week-7 rule applies.
export function deloadNow(entries, today, mesoIsDeload) {
  const d = loadDeload();
  if (!d) return !!mesoIsDeload;
  return deloadStatus(d, entries, today).status === "active";
}

// ── PRESCRIPTION ────────────────────────────────────────────────────────────
const isDB = n => /\bDB\b|dumbbell/i.test(n);
function increment(ex, top) {
  if (ex.loadStep) return ex.loadStep;
  if (isDB(ex.name)) return top <= 30 ? 2.5 : 5;
  return 5;
}
function repTarget(reps) {
  const m = String(reps || "").match(/(\d+)\s*[–-]\s*(\d+)/);
  if (m) return Math.floor((Number(m[1]) + Number(m[2])) / 2);
  const one = String(reps || "").match(/\d+/);
  return one ? Number(one[0]) : null;
}
const perSide = reps => /each/i.test(String(reps || "")) ? " each leg" : "";


// Top working weight from the last session of this lift before the deload.
function lastTop(entries, name, startDate, location) {
  const before = entries.filter(e => e.date < startDate);
  const last = lastMovementByName(before, name, location);
  if (!last) return null;
  const sets = last.mv.sets.map(s => ({ w: parseFloat(s.w), r: parseFloat(s.r) })).filter(s => !isNaN(s.r) && s.r > 0);
  if (!sets.length) return null;
  const top = sets.reduce((a, b) => ((b.w || 0) > (a.w || 0) ? b : a));
  return { w: top.w || 0, r: top.r, date: last.date, sets: last.mv.sets };
}

export function prescribe(entries, ex, startDate, location) {
  const sets = ex.sets >= 3 ? Math.ceil(ex.sets / 2) : 1;
  const reps = repTarget(ex.reps);
  const top = lastTop(entries, ex.name, startDate, location);
  let weight = null;
  if (!ex.bodyweight && top && top.w > 0) {
    const inc = increment(ex, top.w);
    weight = Math.round((top.w * 0.875) / inc) * inc;
    if (weight > top.w * 0.9) weight -= inc;
    if (weight < top.w * 0.85 - 0.001 && weight + inc <= top.w * 0.9) weight += inc;
    weight = Math.max(inc, Math.round(weight * 10) / 10);
  }
  const repsTxt = reps ? `${reps}${perSide(ex.reps)}` : ex.reps;
  const text = weight ? `${weight} x ${repsTxt} x ${sets}` : ex.bodyweight ? `${repsTxt} reps x ${sets}` : `${repsTxt} x ${sets}`;
  return {
    name: ex.name, slot: ex.id, sets, reps, repsRange: ex.reps, weight, rir: "3 to 4", rest: ex.rest, substituted: !!ex.substituted,
    lastTop: top ? { w: top.w, r: top.r, date: top.date } : null,
    text,
    note: weight ? `Down from ${top.w} x ${top.r}. RIR 3 to 4, no set to failure.`
      : ex.bodyweight ? "Bodyweight. Stop 3 to 4 reps short of failure."
      : "No recent log here. Pick a load about 15% under your usual and stop 3 to 4 reps short.",
  };
}

export function exercisesForDay(day, location) {
  return (PROGRAM[day]?.exercises ?? []).map(ex => resolveExercise(day, ex.id, location) ?? ex);
}
export function buildPlans(entries, startDate) {
  const plans = {};
  for (const loc of Object.keys(LOCATIONS)) {
    plans[loc] = {};
    for (const day of Object.keys(PROGRAM).map(Number)) {
      const exs = exercisesForDay(day, loc);
      if (exs.length) plans[loc][day] = exs.map(ex => prescribe(entries, ex, startDate, loc));
    }
  }
  return plans;
}
// Planned prescription for a lift in the deload (stored snapshot first, live fallback).
export function deloadPlanFor(entries, d, day, name, location = "equinox") {
  if (!d) return null;
  const want = nameKey(name);
  const stored = d.plans?.[location]?.[day]?.find(p => nameKey(p.name) === want)
    ?? (d.plans?.[location] ? Object.values(d.plans[location]).flat().find(p => nameKey(p.name) === want) : null);
  if (stored) return stored;
  const ex = exercisesForDay(day, location).find(x => nameKey(x.name) === want);
  return ex ? prescribe(entries, ex, d.startDate, location) : null;
}

// ── NEXT-BLOCK CUES ─────────────────────────────────────────────────────────
// From Hark's review of the Nov 2, 2026 coach report (Sep 26 to Nov 1), plus
// what each lift's own log shows. One line each, with the detail behind a tap.
const RIR_RULE = "Stop the first sets 1 to 2 reps short instead of going to failure, so later sets keep their reps.";
const PROGRESSION_RULE = "When every set hits the top of the rep range at the target RIR, add the smallest increment next session.";
const REST_RULE = "Rest 2 to 3 minutes between sets on this compound.";
const SIDE_DELT = "Add 2 to 3 sets of side-delt work a week next block. One more set here covers most of it.";

const REVIEW = {
  "Barbell Hip Thrust": { short: "Restart about 155, then build", target: 155, why: "Hit 182, then dropped to 147 on Oct 29. Restart near 155 and climb back with clean reps." },
  "EZ Bar Curl": { short: "Restart about 50", target: 50, why: "60 x 6, then down to 40 on Oct 30. 50 lets you own the 8 to 12 range again." },
  "DB Hammer Curl": { short: "Go up to 25 lb", target: 25, why: "20 lb for 5 sessions at 0 RIR. That is a stall, not a strength limit. Try 25." },
  "Leg Extension Machine": { short: "Add load, it has stalled", addLoad: true, why: "Stuck at the same weight. Add the smallest step and rebuild the reps." },
  "DB Overhead Tricep Extension": { short: "Add load, it has stalled", addLoad: true, why: "Stuck at the same weight. Add the smallest step and rebuild the reps." },
  "Reverse Pec Deck": { short: "Add load, it has stalled", addLoad: true, why: "Stuck at the same weight. Add the smallest step and rebuild the reps." },
  "Incline DB Curl": { short: "Stop set 1 two reps short", why: "25 x 12, then 7, then 6. Reps collapse when the first set goes to failure." },
  "DB Bulgarian Split Squat": { short: "Stop set 1 two reps short", why: "80 x 10, then 8, then 5. Reps collapse when the first set goes to failure." },
  "Seated Leg Curl Machine": { short: "Stop set 1 two reps short", why: "140 x 15, then 11, then 10. Reps collapse when the first set goes to failure." },
  "DB Lateral Raise": { short: "Add one set next block", sideDelt: true, why: SIDE_DELT },
  "Cable Lateral Raise": { short: "Add one set next block", sideDelt: true, why: SIDE_DELT },
};

// Rep collapse from his own log: first set down 4+ reps by the last set at the same load.
function repCollapse(sets) {
  const s = (sets || []).map(x => ({ w: parseFloat(x.w), r: parseFloat(x.r) })).filter(x => !isNaN(x.r) && x.r > 0);
  if (s.length < 3) return null;
  if (s[0].r - s[s.length - 1].r >= 4) return `${s[0].w || ""}${s[0].w ? " x " : ""}${s.map(x => x.r).join(", ")}`;
  return null;
}

export function buildCue(entries, ex, startDate, location = "equinox") {
  const name = canonName(ex.name);
  const r = REVIEW[name];
  const top = lastTop(entries, ex.name, startDate, location);
  const detail = [];
  let short = r?.short ?? null;
  let target = r?.target ?? null;
  if (r?.addLoad && top?.w > 0) {
    target = top.w + increment(ex, top.w);
    short = `Go up to ${target}, it has stalled`;
  }
  if (r) detail.push(r.why);
  const collapse = top ? repCollapse(top.sets) : null;
  if (!short && collapse) { short = "Stop set 1 two reps short"; detail.push(`Last time: ${collapse}. Reps collapse when the first set goes to failure.`); }
  if (!short) short = ex.type === "compound" ? "Rest 2 to 3 min, leave 1 to 2 reps" : "Top of the range at target RIR, then add";
  detail.push(RIR_RULE);
  if (ex.type === "compound") detail.push(REST_RULE);
  detail.push(PROGRESSION_RULE);
  return { name: ex.name, short, detail: [...new Set(detail)], target, sideDelt: !!r?.sideDelt };
}
export function buildCues(entries, startDate) {
  const cues = {};
  for (const loc of Object.keys(LOCATIONS)) {
    for (const day of Object.keys(PROGRAM).map(Number)) {
      for (const ex of exercisesForDay(day, loc)) {
        const k = canonName(ex.name);
        if (!cues[k]) cues[k] = buildCue(entries, ex, startDate, loc);
      }
    }
  }
  return cues;
}
export function cueFor(d, name) {
  if (!d?.cues) return null;
  return d.cues[canonName(name)] ?? Object.values(d.cues).find(c => nameKey(c.name) === nameKey(name)) ?? null;
}

// After the deload: a cue with a restart weight is the suggested load until the lift
// is logged once after the deload ended.
export function nextBlockTarget(entries, name, today, excludeEntryId = null) {
  const d = loadDeload();
  if (!d) return null;
  const st = deloadStatus(d, entries, today);
  if (st.status !== "done") return null;
  const cue = cueFor(d, name);
  if (!cue?.target) return null;
  const want = nameKey(name);
  const logged = entries.some(e => e.id !== excludeEntryId && e.date > st.end && e.movements.some(m => m.name && nameKey(m.name) === want && m.sets.some(s => s.r !== "" && s.r != null)));
  return logged ? null : { weight: cue.target, note: `Next block: ${cue.short}. ${cue.detail[0]}` };
}

export function scheduleDeload(entries, today, startDate) {
  const start = startDate ?? nextCycleStart(entries, today);
  const d = { startDate: start, createdAt: new Date().toISOString(), endedAt: null, plans: buildPlans(entries, start), cues: buildCues(entries, start) };
  saveDeload(d);
  return d;
}

// Nutrition during the deload (from the Nov 2, 2026 review).
export function deloadNutrition(rate) {
  const lines = [
    "Protein stays at 200 g.",
    "Calories at maintenance this week, not a surplus.",
    "You went from 178.7 to 185.8 lb, Sep 26 to Nov 2 (about 1.4 lb a week). After the deload, trim about 200 kcal if the gain stays above 0.5 lb a week.",
  ];
  if (rate != null) lines.push(`Current trend: ${rate >= 0 ? "+" : ""}${rate.toFixed(2)} lb a week.`);
  return lines;
}
