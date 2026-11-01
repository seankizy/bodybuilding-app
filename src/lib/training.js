import { C } from "../theme.js";
import { BLOCK_START, COACH_SINCE, COACH_TARGETS, LOCATIONS, MESO_LENGTH, PROGRAM, canonName, loggedSince, nameKey, programExByName, programExFor, slotAlternatives } from "../program.js";
import { fmtDate, localDateStr } from "./utils.js";
import { daysBetween } from "./checkins.js";

// ── RIR FEEDBACK (movement-type aware) ────────────────────────────────────────
// Compounds: leave 1–2 in the tank. Isolation: failure OK on the last set.
export function rirFeedback(rir, type, isLastSet) {
  if (rir === "" || rir === null || rir === undefined) return null;
  const r = parseInt(rir);
  if (isNaN(r)) return null;
  if (type === "compound") {
    if (r === 0) return { color: C.red, msg: "⚠ Leave 1–2 in tank on compounds" };
    if (r <= 2) return { color: C.green, msg: "✓ Ideal effort" };
    return { color: C.amber, msg: "↑ Push a bit harder" };
  } else {
    // isolation
    if (isLastSet) {
      if (r <= 1) return { color: C.green, msg: "✓ Failure earned here" };
      return { color: C.amber, msg: "↑ Push closer to failure" };
    }
    if (r <= 2) return { color: C.green, msg: "✓ Good effort" };
    return { color: C.amber, msg: "↑ A little harder" };
  }
}

// ── WEEKLY VOLUME PER MUSCLE ──────────────────────────────────────────────────
// RP-style volume landmarks (sets/muscle/week): MEV → MAV → MRV
// 8-day training cycle — landmarks are the standard weekly values × (8/7)
export const CYCLE_DAYS = 8;
export const SCALE = CYCLE_DAYS / 7; // ~1.143 — scales weekly RP landmarks to an 8-day cycle
export const VOLUME_LANDMARKS = {
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
export function cycleVolume(entries, cycleAnchor, endDate = null) {
  // Count working sets per muscle from the cycle anchor onward, optionally bounded by
  // an end date (exclusive-of-later-sessions) so past, already-finished cycles can be
  // viewed too — not just the open-ended "anchor to now" current cycle.
  const vol = {};
  for (const e of entries) {
    if (cycleAnchor && e.date < cycleAnchor) continue;
    if (endDate && e.date > endDate) continue;
    for (const mv of e.movements) {
      let muscle = mv.muscle;
      if (!muscle && e.programDay && mv.programRef) {
        const progEx = programExFor(e, mv) ?? programExByName(mv.name);
        muscle = progEx?.muscle;
      }
      if (!muscle) continue;
      const workingSets = mv.sets.filter(s => s.r && String(s.r).trim() !== "").length;
      vol[muscle] = (vol[muscle] || 0) + workingSets;
    }
  }
  return vol;
}

// Segment full training history into distinct past cycles, so Volume can show any
// previous cycle's totals, not just the current in-progress one. A cycle boundary is
// detected the same way "This Cycle" auto-completion works: walking forward through
// completed training-day sessions, a cycle ends once every training day has repeated.
export function segmentPastCycles(entries) {
  const trainingDayNums = Object.entries(PROGRAM).filter(([, d]) => d.exercises.length > 0).map(([dn]) => Number(dn));
  const completed = [...entries]
    .filter(e => e.completedAt && e.programDay && trainingDayNums.includes(e.programDay))
    .sort((a, b) => a.date.localeCompare(b.date) || a.completedAt.localeCompare(b.completedAt));

  const cycles = [];
  let seenDays = new Set();
  let cycleStart = null;
  let cycleSessions = [];
  for (const e of completed) {
    if (cycleStart === null) cycleStart = e.date;
    cycleSessions.push(e);
    seenDays.add(e.programDay);
    if (trainingDayNums.every(dn => seenDays.has(dn))) {
      cycles.push({ start: cycleStart, end: e.date, sessions: cycleSessions });
      seenDays = new Set();
      cycleStart = null;
      cycleSessions = [];
    }
  }
  // Return most-recent-first; each entry has enough info to compute volume for that window
  return cycles.reverse();
}
export function volumeStatus(sets, muscle) {
  const lm = VOLUME_LANDMARKS[muscle];
  if (!lm) return { label: "—", color: C.textMid };
  if (sets < lm.mev) return { label: "below MEV", color: C.textMid };
  if (sets <= lm.mav) return { label: "productive", color: C.teal };
  if (sets <= lm.mrv) return { label: "high", color: C.amber };
  return { label: "over MRV", color: C.red };
}

// ── PROGRESSION & PR HELPERS ──────────────────────────────────────────────────
// Epley formula: 1RM = weight × (1 + reps/30), adjusted for RIR
export function estimateOneRM(weight, reps, rir = 0) {
  if (!weight || !reps) return null;
  const w = parseFloat(weight), r = parseFloat(reps) + parseFloat(rir || 0);
  if (isNaN(w) || isNaN(r) || r <= 0) return null;
  return Math.round(w * (1 + r / 30));
}

// Best set per session for a given movement (by estimated 1RM)
export function bestSetForMovement(mv) {
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
export function movementHistory(entries, mvName) {
  const results = [];
  [...entries].sort((a, b) => a.date.localeCompare(b.date)).forEach(e => {
    e.movements.forEach(mv => {
      if (mv.name && nameKey(mv.name) === nameKey(mvName)) {
        const best = bestSetForMovement(mv);
        if (best) results.push({ date: e.date, ...best });
      }
    });
  });
  return results;
}

// ── AUTOREGULATED PROGRESSION ─────────────────────────────────────────────────
// Parse a repsTarget string into {min,max} for a given set number.
// Handles split formats ("2×10-12, 2×15-20"), ranges ("8–12"), and singles ("10").
export function parseRepRange(repsTarget, setNum = 1) {
  if (!repsTarget) return null;
  const splitMatch = repsTarget.match(/(\d+)×(\d+)[–\-](\d+)/g);
  if (splitMatch) {
    let setCounter = 0;
    for (const chunk of splitMatch) {
      const cm = chunk.match(/(\d+)×(\d+)[–\-](\d+)/);
      if (!cm) continue;
      setCounter += parseInt(cm[1]);
      if (setNum <= setCounter) return { min: parseInt(cm[2]), max: parseInt(cm[3]) };
    }
  }
  const m = repsTarget.match(/(\d+)\s*[–\-]\s*(\d+)/);
  if (m) return { min: parseInt(m[1]), max: parseInt(m[2]) };
  const single = repsTarget.match(/^(\d+)/);
  if (single) return { min: parseInt(single[1]), max: parseInt(single[1]) };
  return null;
}

// Round a suggested load to something actually loadable in a gym.
// Barbell/plate-loaded work rounds to 5s; dumbbell/cable/isolation to 2.5s.
export function roundLoad(weight, type, stepOverride = null) {
  const step = stepOverride ?? (type === "compound" ? 5 : 2.5);
  return Math.round(weight / step) * step;
}

// Every past session of one movement, newest first, with its sets parsed and
// summarized. Used by the progression engine so it can look back through the
// whole history rather than only at the single most recent session.
export function movementSessions(entries, mvName, excludeEntryId = null, bodyweight = false, location = null) {
  if (!mvName) return [];
  const want = nameKey(mvName);
  const out = [];
  const sorted = [...entries]
    .filter(e => e.id !== excludeEntryId)
    .sort((a, b) => b.date.localeCompare(a.date));
  for (const e of sorted) {
    for (const mv of e.movements) {
      if (!mv.name || nameKey(mv.name) !== want) continue;
      const sets = mv.sets
        .map((s, i) => ({
          // Bodyweight movements are usually logged with a blank weight; count them as 0.
          w: isNaN(parseFloat(s.w)) && bodyweight ? 0 : parseFloat(s.w),
          r: parseFloat(s.r),
          rir: s.rir === "" || s.rir === null || s.rir === undefined ? null : parseFloat(s.rir),
          setNum: i + 1,
        }))
        .filter(s => !isNaN(s.w) && !isNaN(s.r));
      if (sets.length === 0) continue;
      const withRIR = sets.filter(s => s.rir !== null && !isNaN(s.rir));
      out.push({
        date: e.date,
        location: e.location ?? "equinox",
        sets,
        topSet: sets.reduce((a, b) => (b.w > a.w ? b : a)),
        totalReps: sets.reduce((n, s) => n + s.r, 0),
        avgRIR: withRIR.length ? withRIR.reduce((sum, s) => sum + s.rir, 0) / withRIR.length : null,
        lastSetRIR: withRIR.length ? withRIR[withRIR.length - 1].rir : null,
        hasRIR: withRIR.length > 0,
      });
    }
  }
  // Same-gym history is the only reliable basis for progression: the same lift can
  // feel very different on another gym's machine. With no history at this gym yet,
  // fall back to the other gym's sessions but flag it so the engine calibrates
  // instead of prescribing a jump.
  if (location) {
    const same = out.filter(s => s.location === location);
    if (same.length) return same;
    if (out.length) out.crossGym = true;
  }
  return out;
}

// How many working sets need to hit the top of the rep range before an accessory
// is allowed to add weight. Compounds progress off a single strong top set (one
// true working set is meaningful signal on a heavy lift), but accessories use
// double progression: reps first, then load, checked across ALL working sets so
// one lucky set doesn't drag the load up before the movement is actually ready.
//
// Rule: all sets but one need to hit max reps (e.g. 4 sets needs 3, 3 sets needs
// 2). With only 2 sets there is no room for a miss without losing the signal
// entirely, so both are required. A single-set accessory just needs that set.
export function accessorySetsNeeded(totalSets) {
  if (totalSets <= 2) return totalSets;
  return totalSets - 1;
}

// Suggest the next session's load/rep action for one movement.
//
// Reads back through the FULL history for this movement, not just the last
// session. If the most recent session has no RIR logged, it looks further back
// for the last session that does, and if RIR was never logged at all it falls
// back to reading the rep trend across sessions instead of giving up.
//
// Deliberately conservative: reads only logged sets, never auto-applies
// anything, and holds steady rather than guessing when the signal is weak.
export function suggestProgression(entries, mvName, repsTarget, type, opts = {}) {
  const {
    isDeloadWeek = false, excludeEntryId = null,
    loadStep = null, bodyweight = false, startWeight = null, location = null, setsTarget = null,
  } = opts;

  // Coach's one-time target for the next session (see COACH_TARGETS).
  const coachT = COACH_TARGETS[canonName(mvName)];
  if (coachT && !loggedSince(entries.filter(e => e.id !== excludeEntryId), mvName, COACH_SINCE)) {
    return { action: "coach", weight: coachT.weight, lastWeight: null, lastDate: null, reason: coachT.note };
  }

  // Block starting weight takes priority until the movement is logged once in the
  // current block, so the card agrees with the weight that was pre-filled.
  if (startWeight != null && !loggedSince(
    entries.filter(e => e.id !== excludeEntryId), mvName, BLOCK_START)) {
    return {
      action: "block_start",
      weight: startWeight,
      lastWeight: null, lastDate: null,
      reason: `Starting weight for the new block. Log RIR on every set and the engine takes over from next session.${loadStep ? ` Progress in ${loadStep} lb steps only.` : ""}`,
    };
  }

  const sessions = movementSessions(entries, mvName, excludeEntryId, bodyweight, location);
  if (sessions.length === 0) return null;

  const recent = sessions[0];
  const topSet = recent.topSet;
  const lastDate = recent.date;
  const range = parseRepRange(repsTarget, topSet.setNum);
  // Compounds: one strong top set is enough signal to add weight.
  // Accessories/isolation: double progression — require max reps across all but
  // one working set (both, if there are only two) before load goes up. A single
  // set under the rep floor is still enough to back off either way; that's a
  // safety signal, not a "have you earned the jump" signal.
  let hitTopOfRange, belowRange, accessoryProgressNote = "", accessoryNeed = 0;
  if (type === "compound" || !range) {
    hitTopOfRange = range ? topSet.r >= range.max : false;
    belowRange = range ? topSet.r < range.min : false;
  } else {
    // The bar is set by today's prescription (e.g. 3 working sets), not by however
    // many sets happened to be logged last time (extra sets do not raise the bar).
    const prescribed = setsTarget && setsTarget > 0 ? setsTarget : recent.sets.length;
    const need = accessorySetsNeeded(prescribed);
    accessoryNeed = need;
    const atMax = recent.sets.filter(s => s.r >= range.max).length;
    hitTopOfRange = atMax >= need;
    belowRange = topSet.r < range.min;
    accessoryProgressNote = `${atMax} of ${recent.sets.length} sets logged at ${range.max}+ reps (need ${need} of your ${prescribed})`;
  }
  // Per-exercise step override (e.g. hip thrust moves in 10 lb jumps only)
  const bump = loadStep ?? (type === "compound" ? 10 : 5);
  const rl = w => roundLoad(w, type, loadStep);
  // A reduction must actually reduce. With coarse steps (e.g. 10 lb on a 30 lb hip
  // thrust), 95% of the load can round straight back to the same number, so fall
  // back to dropping one full step whenever rounding erases the cut.
  const stepSize = loadStep ?? (type === "compound" ? 5 : 2.5);
  const down = (w, pct) => { const eased = rl(w * pct); return eased < w ? eased : Math.max(0, w - stepSize); };

  // First time at this gym for this movement: the other gym's numbers are only a
  // starting guess. Hold, calibrate, and let this gym's own log drive next week.
  if (sessions.crossGym && !bodyweight && !isDeloadWeek && topSet.w > 0) {
    const from = LOCATIONS[recent.location]?.short ?? "the other gym";
    const here = LOCATIONS[location]?.short ?? "this gym";
    return {
      action: "hold", calibrate: true,
      weight: topSet.w, lastWeight: topSet.w, lastDate,
      reason: `First time on ${here}'s machine. Last logged at ${from}: ${topSet.w} x ${topSet.r}. Machines differ, so use that only as a starting point. Pick the load that lands you in ${repsTarget} with 1 to 2 reps in reserve, log it exactly as the stack reads, and from next time on the suggestion comes from ${here}'s own numbers.`,
    };
  }

  // Bodyweight movements (ab work etc.) progress by reps and control, never load.
  if (bodyweight) {
    if (isDeloadWeek) {
      return {
        action: "deload", weight: 0, lastWeight: 0, lastDate,
        reason: "Deload week. Cut to 2 sets and stop well short of failure.",
      };
    }
    if (range && topSet.r >= range.max) {
      return {
        action: "add_reps", weight: 0, lastWeight: 0, lastDate,
        reason: `Hit ${topSet.r} reps last time, the top of the ${range.min} to ${range.max} range. Slow the eccentric or add a pause rather than chasing more reps.`,
      };
    }
    return {
      action: "add_reps", weight: 0, lastWeight: 0, lastDate,
      reason: range
        ? `Last time: ${topSet.r} reps. Build toward ${range.max} with strict form before making it harder.`
        : `Build reps with strict form before making it harder.`,
    };
  }

  // Logged at bodyweight / zero load. Percentage-based advice is meaningless here,
  // and for a movement the program expects to be loaded the real answer is to start
  // putting weight on it, not to shave a percentage off nothing.
  if (!(topSet.w > 0)) {
    return {
      action: "add_weight",
      weight: 0,
      lastWeight: 0, lastDate,
      reason: `Logged at bodyweight last time (${topSet.r} reps). Add external load so this movement can actually progress, then log the weight.`,
    };
  }

  // Deload overrides everything — intensity comes down regardless of performance
  if (isDeloadWeek) {
    return {
      action: "deload",
      weight: down(topSet.w, 0.85),
      lastWeight: topSet.w, lastDate,
      reason: "Deload week. Drop load about 15% and leave 3+ reps in reserve.",
    };
  }

  // ── Path A: the most recent session has RIR. Strongest signal available. ──
  if (recent.hasRIR) {
    const avgRIR = recent.avgRIR;
    if (belowRange && avgRIR <= 1) {
      return {
        action: "back_off",
        weight: down(topSet.w, 0.95),
        lastWeight: topSet.w, lastDate,
        reason: `Last time: ${topSet.r} reps at RIR ${recent.lastSetRIR}, under the ${range.min} to ${range.max} target. Ease the load and rebuild reps.`,
      };
    }
    // Top of the range earns the jump whatever the RIR: reps left in the tank at
    // the top of the range only means the load is even more clearly too light.
    if (hitTopOfRange) {
      const over = range ? Math.max(...recent.sets.map(x => x.r)) - range.max : 0;
      const tail = avgRIR <= 1
        ? " Add weight."
        : ` That was with about ${avgRIR.toFixed(1)} reps left per set, so the load is light. Add weight.`;
      const overNote = over >= 2 ? ` You went ${over} past the ${range.max} rep ceiling.` : "";
      return {
        action: "add_weight",
        weight: rl(topSet.w + bump),
        lastWeight: topSet.w, lastDate,
        reason: (type === "compound"
          ? `Last time: ${topSet.r} reps at RIR ${recent.lastSetRIR}, top of range.`
          : `Last time: ${accessoryProgressNote}.`) + overNote + tail,
      };
    }
    if (avgRIR >= 2) {
      return {
        action: "add_reps",
        weight: topSet.w, lastWeight: topSet.w, lastDate,
        reason: `Averaged RIR ${avgRIR.toFixed(1)} last time, so there is room to push. Same weight, more reps.`,
      };
    }
    return {
      action: "hold",
      weight: topSet.w, lastWeight: topSet.w, lastDate,
      reason: !range
        ? `Hold ${topSet.w} and progress reps before adding load.`
        : type === "compound"
          ? (hitTopOfRange ? `Hold ${topSet.w} and progress reps before adding load.` : `Hold ${topSet.w} and work toward ${range.max} reps before adding load.`)
          : `Hold ${topSet.w}. ${accessoryProgressNote} so far, work toward ${accessoryNeed} before adding load.`,
    };
  }

  // ── Path B: no RIR on the most recent session. Look further back for one. ──
  const lastWithRIR = sessions.find(s => s.hasRIR);

  // ── Path C: read the rep trend across sessions at comparable load. ──
  // This is what makes the engine useful before RIR data exists at all.
  const prior = sessions.find(s => s.date !== recent.date);
  const trendNote = lastWithRIR
    ? ` Last RIR on file is from ${fmtDate(lastWithRIR.date)} (avg ${lastWithRIR.avgRIR.toFixed(1)}).`
    : " Log RIR today for sharper advice.";

  if (hitTopOfRange) {
    // Top of the range without RIR: still the clearest earned-the-jump signal,
    // but bump conservatively since we cannot see how hard it actually was.
    return {
      action: "add_weight",
      weight: rl(topSet.w + bump),
      lastWeight: topSet.w, lastDate,
      reason: type === "compound"
        ? `Last time: ${topSet.r} reps at ${topSet.w}, the top of your ${range.min} to ${range.max} range. That earns a jump.${trendNote}`
        : `Last time: ${accessoryProgressNote} at ${topSet.w}. That earns a jump.${trendNote}`,
    };
  }

  if (belowRange) {
    return {
      action: "back_off",
      weight: down(topSet.w, 0.95),
      lastWeight: topSet.w, lastDate,
      reason: `Last time: ${topSet.r} reps at ${topSet.w}, under the ${range.min} rep floor. Ease the load and rebuild reps.${trendNote}`,
    };
  }

  if (prior && prior.topSet.w === topSet.w) {
    const repDelta = recent.totalReps - prior.totalReps;
    if (repDelta > 0) {
      return {
        action: "add_reps",
        weight: topSet.w, lastWeight: topSet.w, lastDate,
        reason: `Reps improved at ${topSet.w} since ${fmtDate(prior.date)} (${prior.totalReps} to ${recent.totalReps} total). Keep the load and keep adding reps.${trendNote}`,
      };
    }
    if (repDelta < 0) {
      return {
        action: "hold",
        weight: topSet.w, lastWeight: topSet.w, lastDate,
        reason: `Total reps dropped at ${topSet.w} since ${fmtDate(prior.date)} (${prior.totalReps} to ${recent.totalReps}). Hold the load and rebuild before progressing.${trendNote}`,
      };
    }
  }

  return {
    action: "hold",
    weight: topSet.w, lastWeight: topSet.w, lastDate,
    reason: range
      ? `Last time: ${topSet.r} reps at ${topSet.w}. Work toward ${range.max} reps before adding load.${trendNote}`
      : `Hold ${topSet.w} and progress reps before adding load.${trendNote}`,
  };
}

// Get all unique movement names across entries
export function allMovementNames(entries) {
  const names = new Set();
  entries.forEach(e => e.movements.forEach(mv => { if (mv.name) names.add(mv.name); }));
  return [...names].sort();
}

// Personal records per movement
export function getPersonalRecords(entries) {
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
export function isNewPR(entry, mv, allEntries) {
  const best = bestSetForMovement(mv);
  if (!best) return false;
  const prevEntries = allEntries.filter(e => e.date < entry.date);
  const prior = movementHistory(prevEntries, mv.name);
  const prevBest = prior.length ? prior.reduce((a, b) => (b.e1rm > a.e1rm ? b : a)) : null;
  return !prevBest || best.e1rm > prevBest.e1rm;
}

// Detailed PR info for a single movement in a session — used by the Complete Workout
// summary to show exactly what improved (weight, reps, or estimated 1RM) and by how much.
export function detailedPRForMovement(entry, mv, allEntries) {
  const best = bestSetForMovement(mv);
  if (!best || !mv.name) return null;
  const prevEntries = allEntries.filter(e => e.date < entry.date);
  const priorHistory = movementHistory(prevEntries, mv.name);
  if (priorHistory.length === 0) return null; // first time doing this movement — not a "record" yet, just a first entry
  // Best-ever prior performance (by e1RM), not just the last session
  const priorBest = priorHistory.reduce((a, b) => (b.e1rm > a.e1rm ? b : a));
  if (best.e1rm <= priorBest.e1rm) return null;

  // Determine what actually improved: weight PR (heavier at same or better reps),
  // rep PR (same weight, more reps), or just an estimated-1RM PR (mixed change)
  let type = "1RM";
  if (best.w > priorBest.w && best.r >= priorBest.r) type = "weight";
  else if (best.w === priorBest.w && best.r > priorBest.r) type = "reps";

  return {
    name: mv.name,
    type,
    newWeight: best.w, newReps: best.r, newE1RM: best.e1rm,
    prevWeight: priorBest.w, prevReps: priorBest.r, prevE1RM: priorBest.e1rm, prevDate: priorBest.date,
    weightDelta: best.w - priorBest.w,
    repDelta: best.r - priorBest.r,
    e1rmDelta: best.e1rm - priorBest.e1rm,
  };
}


// ── SMART COACHING: plateaus, set counts, recovery, PR forecast ─────────────
// Strength score for one parsed session (movementSessions shape): best estimated
// 1RM across its sets, RIR included. Bodyweight work with no added load scores by reps.
export function sessionScore(sess) {
  let best = 0;
  for (const st of sess.sets) {
    const v = st.w > 0 ? st.w * (1 + (st.r + (st.rir ?? 0)) / 30) : st.r;
    if (v > best) best = v;
  }
  return best;
}
// Deload-week sessions are light on purpose; they never count toward a stall or a
// set-count change.
export function isDeloadDate(date) {
  const d = daysBetween(BLOCK_START, date);
  if (d < 0) return false;
  return Math.floor(d / 7) % MESO_LENGTH === MESO_LENGTH - 1;
}
export function workingSessions(entries, mvName, o = {}) {
  const all = movementSessions(entries, mvName, o.excludeEntryId ?? null, !!o.bodyweight, o.location ?? null);
  const out = all.filter(x => x.date >= BLOCK_START && !isDeloadDate(x.date));
  out.crossGym = !!all.crossGym;
  return out;
}
export const PLATEAU_SESSIONS = 3;
// A lift has stalled when its last 3 or more sessions at this gym (this block, no
// deload weeks) failed to beat its best. The fix depends on how hard those sets were.
export function detectPlateau(entries, mvName, o = {}) {
  if (o.isDeloadWeek) return null;
  const sess = workingSessions(entries, mvName, o);
  if (sess.crossGym || sess.length < PLATEAU_SESSIONS + 1) return null;
  const chrono = [...sess].reverse();
  let best = -1, bestIdx = 0;
  chrono.forEach((x, i) => { const v = sessionScore(x); if (v > best + 0.5) { best = v; bestIdx = i; } });
  const n = chrono.length - 1 - bestIdx;
  if (n < PLATEAU_SESSIONS) return null;
  const stalled = chrono.slice(bestIdx + 1);
  const rirs = stalled.map(x => x.avgRIR).filter(v => v != null);
  const avgRIR = rirs.length ? rirs.reduce((a, b) => a + b, 0) / rirs.length : null;
  const top = sess[0].topSet.w;
  let alt = null;
  if (o.entry && o.mv) alt = slotAlternatives(o.entry, o.mv)[0]?.name ?? null;
  let kind, fix, weight = null;
  if (avgRIR != null && avgRIR <= 0.75) {
    kind = "reset";
    weight = top > 0 ? roundLoad(top * 0.9, o.type ?? "isolation", o.loadStep ?? null) : null;
    fix = weight
      ? `You are grinding every set (average RIR ${avgRIR.toFixed(1)}). Drop to ${weight} for one session, build reps back up, then climb past ${top}.`
      : `You are grinding every set (average RIR ${avgRIR.toFixed(1)}). Do one easier session, stop 2 reps short, then push again.`;
  } else if (avgRIR != null && avgRIR >= 2) {
    kind = "push";
    fix = `Your sets end with about ${avgRIR.toFixed(1)} reps left. Take the last set to RIR 0 or 1 before changing anything else.`;
  } else if (n >= 5 && alt) {
    kind = "swap";
    fix = `${n} sessions without a new best. Swap to ${alt} for the rest of the block; a new angle restarts progress.`;
  } else {
    kind = "reps";
    fix = top > 0
      ? `Stay at ${top} and add one rep to a single set each session. Small wins break a stall.${avgRIR == null ? " Log RIR so the app can tell fatigue from effort." : ""}`
      : `Add one rep to a single set each session. Small wins break a stall.`;
  }
  return { sessions: n, since: chrono[bestIdx].date, best: Math.round(best), kind, fix, weight };
}
// Proposes one more or one fewer working set, from the last two sessions at this gym.
//   add: every prescribed set done, the final set still ended at RIR 2+, and reps
//        held up from first set to last (the muscle can recover from more)
//   cut: the final set fell under the rep floor or lost 30%+ of the first set's reps,
//        at RIR 0 (that set is fatigue, not growth)
export function suggestSetCount(entries, mvName, o = {}) {
  const target = o.setsTarget;
  if (o.isDeloadWeek || !target) return null;
  const range = parseRepRange(o.repsTarget);
  if (!range) return null;
  const sess = workingSessions(entries, mvName, o);
  if (sess.crossGym || sess.length < 2) return null;
  const last2 = sess.slice(0, 2);
  const fin = x => x.sets[x.sets.length - 1];
  const drop = x => { const a = x.sets[0].r, b = fin(x).r; return a > 0 ? (a - b) / a : 0; };
  const easy = last2.every(x => x.sets.length >= target && fin(x).rir != null && fin(x).rir >= 2 && drop(x) <= 0.1 && fin(x).r >= range.min);
  if (easy && target < 5) {
    return { dir: "add", to: target + 1, reason: `Your last set ended at RIR ${fin(last2[0]).rir} with reps holding steady, two sessions running. You can recover from one more set.` };
  }
  const hard = last2.every(x => x.sets.length === target && (fin(x).rir == null || fin(x).rir <= 0) && (fin(x).r < range.min || drop(x) >= 0.3));
  if (hard && target > 2) {
    return { dir: "cut", to: target - 1, reason: `Your last set has fallen apart two sessions running (${fin(last2[0]).r} reps vs ${last2[0].sets[0].r} on set 1). Drop it and put that effort into the sets that count.` };
  }
  return null;
}
// Recovery check-in at the start of a session: sleep and soreness, one tap each.
export const READINESS_SLEEP = [["poor", "Poor"], ["ok", "OK"], ["good", "Good"]];
export const READINESS_SORE = [["very", "Very sore"], ["some", "A bit"], ["none", "Fresh"]];
export function readinessLevel(r) {
  if (!r || !r.sleep || !r.soreness) return null;
  const pts = ({ poor: 2, ok: 1, good: 0 })[r.sleep] + ({ very: 2, some: 1, none: 0 })[r.soreness];
  return pts >= 3 ? "low" : pts === 2 ? "moderate" : "good";
}
export const READINESS_TEXT = {
  good: "Recovered. Chase every jump the app suggests.",
  moderate: "Partly recovered. Hold your weights today; no new jumps.",
  low: "Under-recovered. Hold your weights and skip the last set of each accessory.",
};
// A low or moderate check-in turns any weight jump into a hold at last time's load.
export function applyReadiness(sug, level) {
  if (!sug || !level || level === "good" || sug.action !== "add_weight") return sug;
  return {
    ...sug,
    action: sug.lastWeight > 0 ? "hold" : "add_reps",
    weight: sug.lastWeight,
    readiness: level,
    reason: sug.lastWeight > 0
      ? `You earned a jump, but recovery is ${level} today. Match ${sug.lastWeight} and take the jump next session.`
      : `You earned more load, but recovery is ${level} today. Match last time and take the jump next session.`,
  };
}
// The fewest reps at `weight` (assuming RIR 1) that beat the all-time best estimated
// 1RM. Returned only when it is within reach: no more than 2 reps past the range top.
export function prForecast(entries, mvName, weight, repsTarget, excludeEntryId = null) {
  const w = parseFloat(weight);
  if (!mvName || !(w > 0)) return null;
  const hist = movementHistory(entries.filter(e => e.id !== excludeEntryId), mvName);
  if (hist.length < 2) return null;
  const best = hist.reduce((a, b) => (b.e1rm > a.e1rm ? b : a));
  const range = parseRepRange(repsTarget);
  const cap = (range?.max ?? 12) + 2;
  for (let r = 1; r <= cap; r++) {
    if (estimateOneRM(w, r, 1) > best.e1rm) {
      return { weight: w, reps: r, best: best.e1rm, bestW: best.w, bestR: best.r, bestDate: best.date };
    }
  }
  return null;
}

// Collect all PRs achieved across every movement in a completed session
export function collectSessionPRs(entry, allEntries) {
  return entry.movements
    .map(mv => detailedPRForMovement(entry, mv, allEntries))
    .filter(Boolean);
}

// Session completion heatmap — last 10 weeks
export function sessionHeatmap(entries) {
  const map = {};
  entries.forEach(e => { map[e.date] = (map[e.date] || 0) + 1; });
  return map;
}

// Push/pull balance — sets per category over last cycle
export function pushPullBalance(entries) {
  const PUSH_MUSCLES = new Set(["Chest", "Shoulders", "Triceps"]);
  const PULL_MUSCLES = new Set(["Back", "Biceps"]);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 8);
  const cutoffStr = localDateStr(cutoff);
  let push = 0, pull = 0, legs = 0;
  const LEG_MUSCLES = new Set(["Quads", "Hamstrings", "Glutes", "Calves"]);
  entries.filter(e => e.date >= cutoffStr).forEach(e => {
    e.movements.forEach(mv => {
      let muscle = mv.muscle;
      if (!muscle && e.programDay && mv.programRef) {
        const progEx = programExFor(e, mv) ?? programExByName(mv.name);
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
export function findRepeatPairs(entries) {
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
export function topSetWeight(mv) {
  const weights = mv.sets.filter(s => s.w && s.r).map(s => parseFloat(s.w));
  return weights.length ? Math.max(...weights) : null;
}
export function summarizeSets(mv) {
  return mv.sets.filter(s => s.r).map(s => `${s.w || "BW"}x${s.r}`).join(", ");
}
