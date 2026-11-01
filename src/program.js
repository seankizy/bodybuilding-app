

// ── PROGRAM DATA ──────────────────────────────────────────────────────────────
// type: "compound" (leave 1–2 RIR) or "isolation" (failure OK on last set)
// muscle: primary muscle group for weekly volume tracking
export const PROGRAM = {
  // Restructured Sep 29, 2026: chest and glutes each trained twice per cycle, side
  // delts up to ~11 sets, longer rest on heavy compounds. Exercise names match the
  // old program wherever the movement is the same, so history and the progression
  // engine carry straight over (seeding looks up the name across all days).
  1: {
    title: "Lower A: Glutes & Hamstrings",
    tag: "LOWER A",
    color: "#e8e8e8",
    exercises: [
      { id: "A", name: "Barbell Hip Thrust", sets: 4, reps: "8–12", rest: "2m 30s", type: "compound", muscle: "Glutes", loadStep: 10, cue: "Glute bridge primer first. Pause 1 second at the top with a posterior pelvic tilt. Load it so 12 is hard." },
      { id: "B", name: "Romanian Deadlift", sets: 3, reps: "6–10", rest: "2m 30s", type: "compound", muscle: "Hamstrings" },
      { id: "C", name: "Hack Squat Machine", sets: 3, reps: "8–10", rest: "2m 30s", type: "compound", muscle: "Quads" },
      { id: "D", name: "DB Bulgarian Split Squat", sets: 3, reps: "8–12 each leg", rest: "1m 30s", type: "compound", muscle: "Glutes", cue: "Long stride, torso leaning forward to bias the glutes." },
      { id: "E", name: "Seated Leg Curl Machine", sets: 3, reps: "10–15", rest: "1m", type: "isolation", muscle: "Hamstrings" },
      { id: "F", name: "Leg Press Calf Raise", sets: 4, reps: "10–15", rest: "1m", type: "isolation", muscle: "Calves", cue: "Knees straight, full stretch at the bottom, pause at the top." },
    ],
  },
  2: {
    title: "Upper A: Chest (Heavy)",
    tag: "UPPER A",
    color: "#f0f0f0",
    exercises: [
      { id: "A", name: "Smith Machine Incline Press", sets: 4, reps: "6–10", rest: "3m", type: "compound", muscle: "Chest", cue: "Take the full 3 minutes. Your chest was running out of recovery, not strength." },
      { id: "B", name: "Smith Machine Bench Press", sets: 3, reps: "6–10", rest: "3m", type: "compound", muscle: "Chest" },
      { id: "C", name: "Cable Fly", sets: 3, reps: "10–15", rest: "1m 30s", type: "isolation", muscle: "Chest" },
      { id: "D", name: "DB Lateral Raise", sets: 3, reps: "12–20", rest: "1m", type: "isolation", muscle: "Shoulders" },
      { id: "E", name: "EZ Bar Curl", sets: 3, reps: "8–12", rest: "1m 30s", type: "isolation", muscle: "Biceps" },
      { id: "F", name: "Cable Pushdown", sets: 3, reps: "10–15", rest: "1m", type: "isolation", muscle: "Triceps" },
    ],
  },
  3: { title: "Rest Day", tag: "REST", color: "#c4c4c4", exercises: [] },
  4: {
    title: "Pull, Delts & Biceps",
    tag: "PULL",
    color: "#c9c9c9",
    exercises: [
      { id: "A", name: "Lat Pulldown (Wide Overhand, Flat Bar)", sets: 3, reps: "8–12", rest: "2m", type: "compound", muscle: "Back", startWeight: 130 },
      { id: "B", name: "Barbell Bent Over Row", sets: 3, reps: "6–10", rest: "2m", type: "compound", muscle: "Back" },
      { id: "C", name: "Seated Cable Row", sets: 2, reps: "10–12", rest: "1m 30s", type: "compound", muscle: "Back" },
      { id: "D", name: "Cable Lateral Raise", sets: 4, reps: "12–20", rest: "1m", type: "isolation", muscle: "Shoulders" },
      { id: "E", name: "Reverse Pec Deck", sets: 3, reps: "12–20", rest: "1m", type: "isolation", muscle: "Shoulders" },
      { id: "F", name: "Incline DB Curl", sets: 3, reps: "10–12", rest: "1m", type: "isolation", muscle: "Biceps" },
      { id: "G", name: "DB Hammer Curl", sets: 3, reps: "10–12", rest: "1m", type: "isolation", muscle: "Biceps" },
    ],
  },
  5: { title: "Rest Day", tag: "REST", color: "#c4c4c4", exercises: [] },
  6: {
    title: "Lower B: Quads & Glutes",
    tag: "LOWER B",
    color: "#b8b8b8",
    exercises: [
      { id: "A", name: "Barbell Squat", sets: 4, reps: "6–10", rest: "3m", type: "compound", muscle: "Quads", startWeight: 110 },
      { id: "B", name: "Leg Press Machine", sets: 3, reps: "10–15", rest: "2m", type: "compound", muscle: "Glutes", cue: "Feet high and wide on the platform to bias the glutes." },
      { id: "C", name: "Glute-Bias 45° Back Extension", sets: 3, reps: "12–15", rest: "1m 30s", type: "isolation", muscle: "Glutes", cue: "Round the upper back, drive with the glutes, squeeze at the top. A lighter hip thrust works as a swap." },
      { id: "D", name: "Leg Extension Machine", sets: 2, reps: "12–15", rest: "1m", type: "isolation", muscle: "Quads" },
      { id: "E", name: "Hip Abduction Machine", sets: 3, reps: "15–20", rest: "1m", type: "isolation", muscle: "Glutes" },
      { id: "F", name: "Seated Calf Raise Machine", sets: 4, reps: "10–15", rest: "1m", type: "isolation", muscle: "Calves" },
      { id: "G", name: "Hanging Leg Raise", sets: 3, reps: "10–15", rest: "1m", type: "isolation", muscle: "Abs", bodyweight: true, cue: "Posterior pelvic tilt at the top. Curl the pelvis up, don't just lift the legs." },
    ],
  },
  7: {
    title: "Upper B: Chest, Shoulders & Arms",
    tag: "UPPER B",
    color: "#ffffff",
    exercises: [
      { id: "A", name: "DB Shoulder Press", sets: 3, reps: "6–10", rest: "2m 30s", type: "compound", muscle: "Shoulders" },
      { id: "B", name: "Decline Bench Press", sets: 3, reps: "8–12", rest: "2m 30s", type: "compound", muscle: "Chest", startWeight: 120, cue: "Flat DB Press is a fine swap if the decline bench is taken." },
      { id: "C", name: "Weighted Dip Machine", sets: 3, reps: "8–12", rest: "2m", type: "compound", muscle: "Chest" },
      { id: "D", name: "Pec Deck", sets: 3, reps: "12–15", rest: "1m", type: "isolation", muscle: "Chest" },
      { id: "E", name: "DB Lateral Raise", sets: 4, reps: "12–20", rest: "1m", type: "isolation", muscle: "Shoulders" },
      { id: "F", name: "Cable Curl", sets: 3, reps: "10–15", rest: "1m", type: "isolation", muscle: "Biceps" },
      { id: "G", name: "DB Overhead Tricep Extension", sets: 3, reps: "10–15", rest: "1m", type: "isolation", muscle: "Triceps" },
    ],
  },
};


// Mesocycle config: 6 training weeks then a deload week (week 7). That's a deload
// roughly every 5 to 6 eight-day cycles, per the Sep 29, 2026 program review.
export const MESO_LENGTH = 7; // weeks per block, last week is the deload
export const MESO_START = "2026-05-07"; // week 1 anchor (first logged session)

// Start of the current training block (lean bulk, Sep 2026). Exercises with a
// `startWeight` seed that load on their FIRST session on or after this date;
// once one session is logged in the block, normal last-session seeding and the
// progression engine take over. Change this date when starting a new block.
export const BLOCK_START = "2026-09-21";

// True if this movement already has a logged working set on or after `sinceDate`.
export function loggedSince(entries, mvName, sinceDate) {
  if (!mvName) return false;
  const target = nameKey(mvName);
  return entries.some(e =>
    e.date >= sinceDate &&
    e.movements.some(m =>
      m.name && nameKey(m.name) === target &&
      m.sets.some(s => s.w !== "" && s.w != null && s.r !== "" && s.r != null)
    )
  );
}

// ── COACH CHECK-IN, OCT 5 2026 ──────────────────────────────────────────────
// One-time weight targets for the next session of each movement, from the coach's
// review of the first full cycle on the new program. Each applies until that
// movement is logged on or after COACH_SINCE, then the normal engine takes over.
export const COACH_SINCE = "2026-10-05";
export const COACH_TARGETS = {
  "Smith Machine Incline Press": { weight: 135, note: "Coach: start all sets at 135. RIR 4, 3 and 2 on the first three sets last time means they were too light, and chest is the top priority." },
  "Cable Fly": { weight: 20, note: "Coach: use 20 on every set. 20 x 13 hit RIR 0 while 15 x 15 sat at RIR 4." },
  "Barbell Squat": { weight: 120, note: "Coach: go to 120. Three of your four sets at 115 had RIR 2 or more." },
  "Barbell Hip Thrust": { weight: 135, note: "Coach: all three working sets at 135, aim for 12 reps, then go to 145 next time. Keep the 65 and 115 sets as warm-ups." },
  "DB Lateral Raise": { weight: 17.5, note: "Coach: 15 x 20 at RIR 3 says you can move up. Use 17.5, or 20 if 17.5 feels easy." },
};
// Advisory notes shown on the suggestion card until the movement is logged again.
export const COACH_NOTES = {
  "Lat Pulldown (Wide Overhand, Flat Bar)": "Coach: if you hit 12 on the first set again, move to 135 or 140.",
  "Barbell Bent Over Row": "Coach: the dip to 6 reps on set 2 last time looked like a rest or setup issue, not strength. Take the full rest and set up the same way every set.",
  "Smith Machine Bench Press": "Coach: 175 has sat at 8 to 9 reps for two weeks because it follows four heavy incline sets. Bench and incline now swap order each cycle, so this is the cycle to go bench first when it shows up first.",
};
// Upper A alternates which press goes first each cycle. Starting with the next Upper A
// after the check-in, the Smith bench press leads, then incline leads, and so on.
export function coachOrder(day, exercises, entries) {
  if (day !== 2 || exercises.length < 2) return exercises;
  const n = entries.filter(e => e.programDay === 2 && e.date >= COACH_SINCE).length;
  if (n % 2 !== 0) return exercises;
  const out = [...exercises];
  [out[0], out[1]] = [out[1], out[0]];
  return out;
}

// ── TRAINING LOCATIONS ─────────────────────────────────────────────────────
// Sean trains at two spots: Equinox (full equipment, the default the PROGRAM
// above is written for) and his apartment building's gym (ARC). The apartment
// gym has a Smith machine (also usable as a free barbell cage), barbell, hex
// bar, dumbbell rack, flat and adjustable benches, a preacher bench, a lat
// pulldown, a seated chest press, a leg press with calf raise, a leg extension
// and curl machine, an assisted dip and pull-up machine, a captain's chair,
// pull-up bars, kettlebells, suspension straps, ab wheels and cardio. It has NO
// cable or pulley machine of any kind (no functional trainer, no cable row), and
// no hack squat, pec deck, reverse pec deck, hip abduction machine, standing or
// seated calf machine, or 45 degree
// back extension. Rather than
// hand-editing the session every time, a session can be flagged with a
// `location`, and GYM_SUBS below swaps in an apartment-friendly version of
// any exercise that needs one, keyed by program day + the exercise's slot id
// (so the slot letter, and therefore last-session seeding and volume
// tracking, never shifts). An exercise not listed here has no substitute and
// is used as-is at either location (e.g. DB and barbell work needs no swap).
//
// Each substitute carries its own name/sets/reps/rest/type/muscle/cue so it
// behaves exactly like a normal PROGRAM exercise once seeded onto a movement.
// Edit these entries directly as the apartment gym's equipment becomes
// better known — no other code needs to change.
export const LOCATIONS = {
  equinox: { label: "Equinox", short: "Equinox" },
  apartment: { label: "Apartment Gym", short: "Apartment" },
};
export const GYM_SUBS = {
  // Only slots the apartment gym cannot do as programmed are listed. Everything
  // else (leg press, leg extension and curl, lat pulldown, EZ bar, DB and barbell
  // lifts) runs as written. The apartment gym has no cables or pulleys (Sean,
  // Nov 1, 2026), so every cable slot is swapped too. Keyed to the Sep 29, 2026 program.
  // Day 1: Lower A
  "1.C": { name: "Smith Machine Squat (feet forward)", sets: 3, reps: "8–10", rest: "2m 30s", type: "compound", muscle: "Quads", cue: "Feet 6 to 12 inches in front of the bar, heels flat or on a plate, torso upright. Closest thing to a hack squat." },
  // Day 2: Upper A
  "2.C": { name: "Dumbbell Fly", sets: 3, reps: "10–15", rest: "1m 30s", type: "isolation", muscle: "Chest", cue: "Flat bench, slight bend in the elbows, deep stretch at the bottom, stop just short of the dumbbells touching." },
  "2.F": { name: "Skull Crusher (EZ Bar)", sets: 3, reps: "8–12", rest: "1m 30s", type: "isolation", muscle: "Triceps", cue: "Lower the bar behind the head, not to the forehead, elbows pointed up." },
  // Day 4: Pull
  "4.C": { name: "Dumbbell Row", sets: 2, reps: "10–12 each arm", rest: "1m 30s", type: "compound", muscle: "Back", cue: "Hand and knee on a flat bench, pull the dumbbell to the hip, pause at the top." },
  "4.D": { name: "DB Lateral Raise", sets: 4, reps: "12–20", rest: "1m", type: "isolation", muscle: "Shoulders", cue: "Lead with the elbows, stop at shoulder height, control the lowering." },
  "4.E": { name: "Rear Delt DB Fly (Bent-Over)", sets: 3, reps: "12–20", rest: "1m", type: "isolation", muscle: "Shoulders", cue: "Chest on an incline bench or hinged over, arms slightly bent, sweep out wide and pause." },
  // Day 6: Lower B
  "6.C": { name: "Smith Machine Hip Thrust", sets: 3, reps: "12–15", rest: "1m 30s", type: "compound", muscle: "Glutes", loadStep: 10, cue: "Lighter than Lower A. Pause 1 second at the top with a posterior pelvic tilt." },
  "6.E": { name: "Side-Lying Hip Abduction (weighted)", sets: 3, reps: "15–20", rest: "1m", type: "isolation", muscle: "Glutes", cue: "Lie on your side, light dumbbell or plate on the outer thigh, lift the top leg slightly behind the body." },
  "6.F": { name: "Seated DB Calf Raise (on bench)", sets: 4, reps: "10–15", rest: "1m", type: "isolation", muscle: "Calves", cue: "Dumbbell across the knees, toes on a plate, full stretch and pause. Bent knees keep the soleus working." },
  // Day 7: Upper B
  "7.B": { name: "Flat DB Press", sets: 3, reps: "8–12", rest: "2m 30s", type: "compound", muscle: "Chest" },
  "7.C": { name: "Captain's Chair Dip (weighted)", sets: 3, reps: "8–12", rest: "2m", type: "compound", muscle: "Chest", cue: "Lean the torso forward for chest. Squeeze a dumbbell between the feet to add load." },
  "7.D": { name: "Incline Dumbbell Fly", sets: 3, reps: "12–15", rest: "1m", type: "isolation", muscle: "Chest", cue: "Bench at about 30 degrees, slight elbow bend, stretch wide, squeeze the chest to bring them up." },
  "7.F": { name: "Preacher Curl (EZ Bar)", sets: 3, reps: "10–15", rest: "1m", type: "isolation", muscle: "Biceps", cue: "Full stretch at the bottom without bouncing, squeeze at the top." },
};


// Returns the exercise definition to use for this program day + slot id, given
// a session's location: the substitute if one exists and location is not
// Equinox, otherwise the normal PROGRAM exercise. Always keeps the original
// `id` (slot letter) so programRef never changes between locations.
export function resolveExercise(programDay, exId, location) {
  const r = resolveExerciseRaw(programDay, exId, location);
  // A set count you accepted from a set-count suggestion replaces the program's,
  // but only while the slot still holds the exercise it was accepted for.
  const ov = r ? setOverrides()[`${programDay}.${exId}`] : null;
  if (ov && exKey(ov.name) === exKey(r.name)) return { ...r, sets: ov.sets, programSets: r.sets };
  return r;
}
export let SET_OVERRIDES = null;
export function setOverrides() {
  if (!SET_OVERRIDES) {
    try { SET_OVERRIDES = JSON.parse(localStorage.getItem("wj_set_overrides") || "{}") || {}; } catch { SET_OVERRIDES = {}; }
  }
  return SET_OVERRIDES;
}
export function saveSetOverride(slotKey, name, sets) {
  const o = { ...setOverrides() };
  if (sets == null) delete o[slotKey]; else o[slotKey] = { name, sets };
  SET_OVERRIDES = o;
  try { localStorage.setItem("wj_set_overrides", JSON.stringify(o)); } catch {}
}
export function resolveExerciseRaw(programDay, exId, location) {
  const base = PROGRAM[programDay]?.exercises.find(x => x.id === exId);
  if (!base) return null;
  if (location && location !== "equinox") {
    const sub = GYM_SUBS[`${programDay}.${exId}`];
    if (sub) {
      // Start from the slot but clear the Equinox exercise's own starting weight,
      // load step, bodyweight flag and cue, so a swapped exercise never inherits
      // them (a DB press should not start at the decline bench's 120 lb).
      return { ...base, startWeight: undefined, loadStep: undefined, bodyweight: false, cue: "", ...sub, id: base.id, substituted: true };
    }
  }
  return base;
}

// The program definition for a logged movement, but only if it still describes
// the same exercise. Sessions logged before a program change keep their old slot
// letters, and without the name check an old "Day 1 slot A" (Barbell Squat) would
// pick up the new slot A's cue, type and load step (Hip Thrust).
export function programExFor(entry, mv) {
  if (!entry?.programDay || !mv?.programRef || !mv.name) return null;
  const ex = resolveExercise(entry.programDay, mv.programRef, entry.location);
  if (!ex) return null;
  return nameKey(ex.name) === nameKey(mv.name) ? ex : null;
}

// Any current program exercise (Equinox or apartment swap) with this exact name.
export function programExByName(name) {
  if (!name) return null;
  const n = name.toLowerCase().trim();
  for (const [dn, day] of Object.entries(PROGRAM)) {
    for (const ex of day.exercises) {
      if (ex.name.toLowerCase().trim() === n) return ex;
      const sub = GYM_SUBS[`${dn}.${ex.id}`];
      if (sub && sub.name.toLowerCase().trim() === n) return { ...ex, ...sub };
    }
  }
  return null;
}

// Older names for the same movement, so seeding can find the history when a
// program change renames an exercise.
export const NAME_ALIASES = {
  "DB Lateral Raise": ["DB Lateral Raise (leaning)"],
  "DB Overhead Tricep Extension": ["Tricep Overhead Extension", "Overhead Rope Extension"],
};


// ── EXERCISE LIBRARY ────────────────────────────────────────────────────────
// One official name per exercise. History, last-session weights, PRs and the
// progression engine all match on the OFFICIAL name, so a typed variant such as
// "Seated Calf Raise" resolves to "Seated Calf Raise Machine" instead of starting a
// second history. The library is built from the program, the apartment swaps, the
// extras below and any custom exercises added in the app.
export const MUSCLES = ["Chest", "Back", "Shoulders", "Biceps", "Triceps", "Quads", "Hamstrings", "Glutes", "Calves", "Abs"];
export const exKey = s => String(s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// Other names people type or older builds used, keyed by the official name.
export const LIB_ALIASES = {
  "Seated Calf Raise Machine": ["Seated Calf Raise", "Seated Calf Raises", "Seated Calf Machine", "Seated Calf"],
  "Standing Calf Raise Machine": ["Standing Calf Raise", "Standing Calf Raises", "Standing Calf Machine"],
  "Leg Press Calf Raise": ["Leg Press Calf Raises", "Calf Raise on Leg Press"],
  "Leg Press Machine": ["Leg Press"],
  "Hack Squat Machine": ["Hack Squat"],
  "Seated Leg Curl Machine": ["Seated Leg Curl", "Leg Curl"],
  "Leg Extension Machine": ["Leg Extension"],
  "Hip Abduction Machine": ["Hip Abduction"],
  "Lat Pulldown (Wide Overhand, Flat Bar)": ["Lat Pulldown", "Wide Lat Pulldown", "Wide Grip Lat Pulldown"],
  "Barbell Bent Over Row": ["Barbell Row", "Bent Over Row"],
  "Smith Machine Incline Press": ["Smith Incline Press", "Smith Incline", "Incline Smith Press"],
  "Smith Machine Bench Press": ["Smith Bench Press", "Smith Flat Bench", "Smith Bench"],
  "EZ Bar Curl": ["EZ Curl", "EZ Bar Curls"],
  "Cable Pushdown": ["Tricep Pushdown", "Triceps Pushdown", "Cable Tricep Pushdown"],
  "Decline Bench Press": ["Decline Bench"],
  "Weighted Dip Machine": ["Dip Machine"],
  "Pec Deck": ["Pec Deck Machine"],
};

// Sensible alternatives that are not in the program itself. Each carries its own
// defaults, used when it is picked from a swap menu or created by typing its name.
export const EXERCISE_EXTRAS = [
  { name: "Standing Calf Raise Machine", muscle: "Calves", type: "isolation", sets: 4, reps: "10–15", rest: "1m" },
  { name: "Smith Machine Calf Raise", muscle: "Calves", type: "isolation", sets: 4, reps: "10–15", rest: "1m" },
  { name: "Smith Machine Hip Thrust", muscle: "Glutes", type: "compound", sets: 4, reps: "8–12", rest: "2m 30s", loadStep: 10 },
  { name: "Hip Thrust Machine", muscle: "Glutes", type: "compound", sets: 4, reps: "8–12", rest: "2m 30s", loadStep: 10 },
  { name: "Dumbbell Romanian Deadlift", muscle: "Hamstrings", type: "compound", sets: 3, reps: "8–12", rest: "2m" },
  { name: "Smith Machine Romanian Deadlift", muscle: "Hamstrings", type: "compound", sets: 3, reps: "6–10", rest: "2m 30s" },
  { name: "Hex Bar Deadlift", muscle: "Hamstrings", type: "compound", sets: 3, reps: "5–8", rest: "3m" },
  { name: "Dumbbell Goblet Squat", muscle: "Quads", type: "compound", sets: 3, reps: "8–12", rest: "2m" },
  { name: "Dumbbell Walking Lunge", muscle: "Glutes", type: "compound", sets: 3, reps: "8–12 each leg", rest: "1m 30s" },
  { name: "Smith Machine Split Squat", muscle: "Glutes", type: "compound", sets: 3, reps: "8–12 each leg", rest: "1m 30s" },
  { name: "Lying Leg Curl Machine", muscle: "Hamstrings", type: "isolation", sets: 3, reps: "10–15", rest: "1m" },
  { name: "Nordic Hamstring Curl", muscle: "Hamstrings", type: "isolation", sets: 3, reps: "5–10", rest: "1m 30s", bodyweight: true },
  { name: "Incline Dumbbell Press", muscle: "Chest", type: "compound", sets: 4, reps: "6–10", rest: "3m" },
  { name: "Incline Barbell Press", muscle: "Chest", type: "compound", sets: 4, reps: "6–10", rest: "3m" },
  { name: "Incline Chest Press Machine", muscle: "Chest", type: "compound", sets: 4, reps: "8–12", rest: "2m 30s" },
  { name: "Barbell Bench Press", muscle: "Chest", type: "compound", sets: 3, reps: "6–10", rest: "3m" },
  { name: "Chest Press Machine", muscle: "Chest", type: "compound", sets: 3, reps: "8–12", rest: "2m 30s" },
  { name: "Decline Dumbbell Press", muscle: "Chest", type: "compound", sets: 3, reps: "8–12", rest: "2m 30s" },
  { name: "Dumbbell Fly", muscle: "Chest", type: "isolation", sets: 3, reps: "10–15", rest: "1m 30s" },
  { name: "Machine Lateral Raise", muscle: "Shoulders", type: "isolation", sets: 3, reps: "12–20", rest: "1m" },
  { name: "Barbell Curl", muscle: "Biceps", type: "isolation", sets: 3, reps: "8–12", rest: "1m 30s" },
  { name: "Preacher Curl (EZ Bar)", muscle: "Biceps", type: "isolation", sets: 3, reps: "8–12", rest: "1m 30s" },
  { name: "DB Curl", muscle: "Biceps", type: "isolation", sets: 3, reps: "8–12", rest: "1m" },
  { name: "Cable Rope Hammer Curl", muscle: "Biceps", type: "isolation", sets: 3, reps: "10–12", rest: "1m" },
  { name: "Rope Pushdown", muscle: "Triceps", type: "isolation", sets: 3, reps: "10–15", rest: "1m" },
  { name: "Overhead Cable Tricep Extension", muscle: "Triceps", type: "isolation", sets: 3, reps: "10–15", rest: "1m" },
  { name: "Skull Crusher (EZ Bar)", muscle: "Triceps", type: "isolation", sets: 3, reps: "8–12", rest: "1m 30s" },
  { name: "Close-Grip Lat Pulldown", muscle: "Back", type: "compound", sets: 3, reps: "8–12", rest: "2m" },
  { name: "Neutral-Grip Lat Pulldown", muscle: "Back", type: "compound", sets: 3, reps: "8–12", rest: "2m" },
  { name: "Assisted Pull-Up", muscle: "Back", type: "compound", sets: 3, reps: "6–10", rest: "2m" },
  { name: "Chest-Supported Row (Machine)", muscle: "Back", type: "compound", sets: 3, reps: "8–12", rest: "2m" },
  { name: "Dumbbell Row", muscle: "Back", type: "compound", sets: 3, reps: "8–12 each arm", rest: "1m 30s" },
  { name: "T-Bar Row", muscle: "Back", type: "compound", sets: 3, reps: "6–10", rest: "2m" },
  { name: "Rear Delt DB Fly (Bent-Over)", muscle: "Shoulders", type: "isolation", sets: 3, reps: "12–20", rest: "1m" },
  { name: "Front Squat", muscle: "Quads", type: "compound", sets: 4, reps: "6–10", rest: "3m" },
  { name: "Banded Lateral Walk", muscle: "Glutes", type: "isolation", sets: 3, reps: "15–20", rest: "1m" },
  { name: "Captain's Chair Leg Raise", muscle: "Abs", type: "isolation", sets: 3, reps: "10–15", rest: "1m", bodyweight: true },
  { name: "Cable Crunch", muscle: "Abs", type: "isolation", sets: 3, reps: "10–15", rest: "1m" },
  { name: "Ab Wheel Rollout", muscle: "Abs", type: "isolation", sets: 3, reps: "8–12", rest: "1m", bodyweight: true },
  { name: "Smith Machine Shoulder Press", muscle: "Shoulders", type: "compound", sets: 3, reps: "6–10", rest: "2m 30s" },
  { name: "Barbell Overhead Press", muscle: "Shoulders", type: "compound", sets: 3, reps: "6–10", rest: "2m 30s" },
  { name: "Machine Shoulder Press", muscle: "Shoulders", type: "compound", sets: 3, reps: "8–12", rest: "2m" },
  { name: "Assisted Dip Machine", muscle: "Chest", type: "compound", sets: 3, reps: "8–12", rest: "2m" },
];

// Which exercises make sense in each program slot ("day.slot"). The slot's own
// programmed exercise is always offered first, then these.
export const SLOT_ALTERNATIVES = {
  "1.A": ["Smith Machine Hip Thrust", "Hip Thrust Machine", "Cable Pull-Through (rope)"],
  "1.B": ["Dumbbell Romanian Deadlift", "Smith Machine Romanian Deadlift", "Hex Bar Deadlift"],
  "1.C": ["Smith Machine Squat (feet forward)", "Leg Press Machine", "Dumbbell Goblet Squat"],
  "1.D": ["Dumbbell Walking Lunge", "Smith Machine Split Squat"],
  "1.E": ["Lying Leg Curl Machine", "Nordic Hamstring Curl"],
  "1.F": ["Leg Press Calf Raise", "Seated Calf Raise Machine", "Standing Calf Raise Machine", "Smith Machine Calf Raise", "Seated DB Calf Raise (on bench)"],
  "2.A": ["Incline Dumbbell Press", "Incline Barbell Press", "Incline Chest Press Machine"],
  "2.B": ["Barbell Bench Press", "Flat DB Press", "Chest Press Machine"],
  "2.C": ["Pec Deck", "Cable Crossover Fly (high to low)", "Dumbbell Fly"],
  "2.D": ["Cable Lateral Raise", "Machine Lateral Raise"],
  "2.E": ["Barbell Curl", "Preacher Curl (EZ Bar)", "DB Curl", "Cable Curl"],
  "2.F": ["Rope Pushdown", "Overhead Cable Tricep Extension", "Skull Crusher (EZ Bar)"],
  "4.A": ["Close-Grip Lat Pulldown", "Neutral-Grip Lat Pulldown", "Assisted Pull-Up"],
  "4.B": ["Chest-Supported Row (Machine)", "Dumbbell Row", "T-Bar Row"],
  "4.C": ["Low Cable Row (functional trainer)", "Chest-Supported Row (Machine)", "Dumbbell Row"],
  "4.D": ["DB Lateral Raise", "Machine Lateral Raise"],
  "4.E": ["Cable Reverse Fly (high pulleys)", "Rear Delt DB Fly (Bent-Over)"],
  "4.F": ["DB Curl", "Preacher Curl (EZ Bar)", "Cable Curl"],
  "4.G": ["Cable Rope Hammer Curl", "DB Curl"],
  "6.A": ["Smith Machine Squat (feet forward)", "Hack Squat Machine", "Leg Press Machine", "Front Squat"],
  "6.B": ["Hack Squat Machine", "Smith Machine Squat (feet forward)"],
  "6.C": ["Cable Pull-Through (rope)", "Smith Machine Hip Thrust"],
  "6.D": [],
  "6.E": ["Cable Hip Abduction (ankle strap)", "Banded Lateral Walk"],
  "6.F": ["Seated DB Calf Raise (on bench)", "Standing Calf Raise Machine", "Leg Press Calf Raise"],
  "6.G": ["Captain's Chair Leg Raise", "Cable Crunch", "Ab Wheel Rollout"],
  "7.A": ["Smith Machine Shoulder Press", "Barbell Overhead Press", "Machine Shoulder Press"],
  "7.B": ["Flat DB Press", "Smith Machine Bench Press", "Decline Dumbbell Press"],
  "7.C": ["Captain's Chair Dip (weighted)", "Assisted Dip Machine"],
  "7.D": ["Cable Crossover Fly", "Cable Fly", "Dumbbell Fly"],
  "7.E": ["Cable Lateral Raise", "Machine Lateral Raise"],
  "7.F": ["EZ Bar Curl", "DB Curl", "Preacher Curl (EZ Bar)"],
  "7.G": ["Overhead Cable Tricep Extension", "Cable Pushdown", "Rope Pushdown"],
};
// One extra not otherwise defined: the cable crossover variant for chest day.
EXERCISE_EXTRAS.push({ name: "Incline Dumbbell Fly", muscle: "Chest", type: "isolation", sets: 3, reps: "12–15", rest: "1m" }, { name: "Side-Lying Hip Abduction (weighted)", muscle: "Glutes", type: "isolation", sets: 3, reps: "15–20", rest: "1m" });
EXERCISE_EXTRAS.push({ name: "Cable Crossover Fly (high to low)", muscle: "Chest", type: "isolation", sets: 3, reps: "10–15", rest: "1m 30s" });

export function loadCustomExercises() {
  try {
    const a = JSON.parse(localStorage.getItem("wj_custom_exercises") || "[]");
    return Array.isArray(a) ? a.filter(x => x && typeof x.name === "string" && x.name.trim()) : [];
  } catch { return []; }
}
export let CUSTOM_EXERCISES = loadCustomExercises();
export let LIB_CACHE = null;
export function buildLibrary() {
  const map = new Map();
  const add = ex => {
    const key = exKey(ex.name);
    if (!key || map.has(key)) return;
    const { id: _id, startWeight, ...rest } = ex;
    map.set(key, { sets: 3, reps: "10–12", rest: "1m 30s", type: "isolation", muscle: "", ...rest, ...(startWeight != null ? { startWeight } : {}) });
  };
  Object.values(PROGRAM).forEach(d => d.exercises.forEach(add));
  Object.values(GYM_SUBS).forEach(add);
  EXERCISE_EXTRAS.forEach(add);
  CUSTOM_EXERCISES.forEach(add);
  const index = new Map();
  map.forEach((ex, key) => index.set(key, ex.name));
  const addAliases = table => {
    for (const [official, alts] of Object.entries(table)) {
      const offKey = exKey(official);
      const target = map.has(offKey) ? map.get(offKey).name : null;
      if (!target) continue;
      alts.forEach(a => { const k2 = exKey(a); if (k2 && !index.has(k2)) index.set(k2, target); });
    }
  };
  addAliases(NAME_ALIASES);
  addAliases(LIB_ALIASES);
  LIB_CACHE = { map, index, list: [...map.values()] };
  return LIB_CACHE;
}
export function lib() { return LIB_CACHE ?? buildLibrary(); }
// The official name for anything typed or stored; unknown names come back trimmed.
export function canonName(raw) {
  const t = String(raw ?? "").trim();
  if (!t) return t;
  return lib().index.get(exKey(t)) ?? t;
}
export function nameKey(n) { return exKey(canonName(n)); }
export function libFind(name) { return lib().map.get(nameKey(name)) ?? null; }
// Library matches for what someone is typing: whole-phrase hits first, then
// exercises containing most of the words.
export function searchLibrary(q, limit = 6) {
  const qk = exKey(q);
  if (!qk) return [];
  const toks = qk.split(" ").filter(t => t.length > 1);
  const out = [];
  for (const ex of lib().list) {
    const k = exKey(ex.name);
    let score = 0;
    if (k === qk) score = 1000;
    else if (k.includes(qk) || qk.includes(k)) score = 100;
    else if (toks.length) {
      const hit = toks.filter(t => k.includes(t)).length;
      if (hit / toks.length >= 0.6) score = 10 * hit / toks.length;
    }
    if (score > 0) out.push({ ex, score });
  }
  const canon = lib().index.get(qk);
  if (canon) { const hit = out.find(o => o.ex.name === canon); if (hit) hit.score = 2000; }
  return out.sort((a, b) => b.score - a.score || a.ex.name.localeCompare(b.ex.name)).slice(0, limit).map(o => o.ex);
}
export function addCustomExercise(ex) {
  const name = ex.name.trim();
  if (!name || libFind(name)) return libFind(name) ?? null;
  CUSTOM_EXERCISES = [...CUSTOM_EXERCISES, { sets: 3, reps: "10–12", rest: "1m 30s", type: "isolation", muscle: "", ...ex, name }];
  try { localStorage.setItem("wj_custom_exercises", JSON.stringify(CUSTOM_EXERCISES)); } catch {}
  buildLibrary();
  return libFind(name);
}
// Alternatives for one slot of a session: its programmed exercise first, then the
// slot's list. A movement outside the program falls back to the same muscle.
export function slotAlternatives(entry, mv) {
  const out = [];
  const seen = new Set([nameKey(mv.name)]);
  // The apartment gym has no cables or pulleys (and no pec deck, hack squat, hip abduction,
  // calf machine or back extension), so those alternatives are hidden there.
  const noCables = entry?.location === "apartment";
  const push = name => {
    const ex = libFind(name);
    if (ex && noCables && /cable|rope pushdown|pec deck|hack squat|hip abduction machine|calf raise machine|back extension/i.test(ex.name)) return;
    if (ex && !seen.has(exKey(ex.name))) { seen.add(exKey(ex.name)); out.push(ex); }
  };
  if (entry?.programDay && mv?.programRef) {
    const base = resolveExercise(entry.programDay, mv.programRef, entry.location);
    if (base) push(base.name);
    (SLOT_ALTERNATIVES[`${entry.programDay}.${mv.programRef}`] ?? []).forEach(push);
  } else {
    const muscle = mv?.muscle || libFind(mv?.name)?.muscle;
    if (muscle) lib().list.filter(e => e.muscle === muscle).slice(0, 8).forEach(e => push(e.name));
  }
  return out;
}

export const SWAP_REASONS = ["Machine taken", "Not at this gym", "Preference"];
export function setIsLogged(st) { return !!st && st.r !== "" && st.r != null; }
