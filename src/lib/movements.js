import { BLOCK_START, COACH_SINCE, COACH_TARGETS, canonName, loggedSince, nameKey, resolveExercise, setIsLogged } from "../program.js";

// Pure: the movement `m` of `entry` turned into library exercise `ex`. The slot keeps
// its prescription (sets, reps, rest); the exercise supplies type, muscle, cue and load
// step. Logged sets are never touched; unlogged ones are reseeded from this exercise's
// own history at this gym, so a swap never inherits another machine's weights.
export function buildSwappedMovement(m, entry, entries, ex, reason) {
  const loc = entry.location ?? "equinox";
  const hasSlot = !!(m.programRef && entry.programDay);
  const base = hasSlot ? resolveExercise(entry.programDay, m.programRef, loc) : null;
  const setsTarget = hasSlot ? (m.setsTarget ?? base?.sets ?? ex.sets) : ex.sets;
  const repsTarget = hasSlot ? (m.repsTarget ?? base?.reps ?? ex.reps) : ex.reps;
  const rest = hasSlot ? (m.rest ?? base?.rest ?? ex.rest) : ex.rest;
  const others = entries.filter(e => e.id !== entry.id);
  const hist = lastMovementByName(others, ex.name, loc);
  const histSets = hist?.mv.sets ?? [];
  const useCoach = !!COACH_TARGETS[ex.name] && !loggedSince(others, ex.name, COACH_SINCE);
  const useStart = ex.startWeight != null && !loggedSince(others, ex.name, BLOCK_START);
  const seed = i => ({
    w: useCoach ? String(COACH_TARGETS[ex.name].weight) : useStart ? String(ex.startWeight) : (histSets[i]?.w ?? ""),
    r: (useCoach || useStart) ? "" : (histSets[i]?.r ?? ""),
    rir: "",
  });
  const kept = (m.sets ?? []).filter(setIsLogged);
  const total = Math.max(setsTarget || 0, kept.length);
  const sets = [];
  for (let i = 0; i < total; i++) {
    const cur = m.sets?.[i];
    sets.push(setIsLogged(cur) ? cur : seed(i));
  }
  const backToBase = !!base && nameKey(ex.name) === nameKey(base.name);
  return {
    ...m,
    name: ex.name,
    setsTarget, repsTarget, rest,
    type: ex.type ?? "isolation",
    muscle: ex.muscle ?? "",
    cue: ex.cue ?? "",
    bodyweight: !!ex.bodyweight,
    loadStep: ex.loadStep ?? null,
    substituted: backToBase ? !!base.substituted : false,
    swappedFrom: backToBase ? null : (m.swappedFrom ?? base?.name ?? m.name ?? null),
    swapReason: backToBase ? null : (reason ?? null),
    sets,
    lastSets: histSets.length > 0 ? histSets : null,
    lastDate: hist?.date ?? null,
    lastLocation: hist?.location ?? null,
  };
}
// One-time clean-up: every stored movement name becomes its official name (exact
// normalized and alias matches only), and recent sessions get their "last session"
// box rebuilt from history before that session, so a renamed lift picks up its numbers.
export function migrateNames(entries, recentCutoff) {
  let changed = false;
  const out = entries.map(e => ({ ...e, movements: (e.movements ?? []).map(m => {
    const c = canonName(m.name);
    if (c !== m.name) { changed = true; return { ...m, name: c }; }
    return m;
  }) }));
  const res = out.map(e => {
    if (e.date < recentCutoff) return e;
    const prior = out.filter(o => o.date < e.date);
    return { ...e, movements: e.movements.map(m => {
      if (!m.name) return m;
      const h = lastMovementByName(prior, m.name, e.location ?? "equinox");
      if (!h) return m;
      const same = JSON.stringify(m.lastSets ?? null) === JSON.stringify(h.mv.sets) && m.lastDate === h.date;
      if (same) return m;
      changed = true;
      return { ...m, lastSets: h.mv.sets, lastDate: h.date, lastLocation: h.location };
    }) };
  });
  return { entries: res, changed };
}

// Most recent logged instance of a movement by exact name (or alias), on ANY
// program day. Used when an exercise has moved to a different day, so its weights
// still carry forward. Only counts movements with at least one logged set.
// When a location is given, history from that same gym wins; only if there is none
// does it fall back to the other gym (machines differ, so same-gym numbers are the
// trustworthy ones).
export function lastMovementByName(entries, name, location = null) {
  if (!name) return null;
  const want = nameKey(name);
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const passes = location ? [e => (e.location ?? "equinox") === location, () => true] : [() => true];
  for (const ok of passes) {
    for (const e of sorted) {
      if (!ok(e)) continue;
      const mv = e.movements.find(m => m.name && nameKey(m.name) === want && m.sets.some(s => (s.w !== "" && s.w != null) || (s.r !== "" && s.r != null)));
      if (mv) return { mv, date: e.date, location: e.location ?? "equinox", crossGym: !!location && (e.location ?? "equinox") !== location };
    }
  }
  return null;
}
