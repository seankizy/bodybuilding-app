import { COACH_TARGETS, PROGRAM, coachOrder, resolveExercise } from "../program.js";
import { lastMovementByName } from "./movements.js";
import { CYCLE_DAYS, detectPlateau, parseRepRange, prForecast, suggestProgression } from "./training.js";
import { addDays, daysBetween } from "./checkins.js";
import { mesocycleWeek } from "./mesocycle.js";
import { macroCals } from "./macros.js";
import { cueFor, deloadNow, deloadNutrition, deloadPlanFor, deloadStatus, loadDeload } from "./deload.js";
import { weightTrend } from "./checkins.js";

// ── DAILY BRIEF ──────────────────────────────────────────────────────────────
// A popup on the first open each day, built to get you moving. On a training day
// it shows today's whole session: every exercise with sets, reps, your last top
// set and a target to beat. On a rest day it prescribes active rest and previews
// the next session. Both carry a motivation line, a quote, and the last 7 days.

// General quotes. A plain string is an original line; an object carries an author.
export const BRIEF_QUOTES = [
  { q: "The last three or four reps is what makes the muscle grow.", by: "Arnold Schwarzenegger" },
  { q: "Yeah buddy! Light weight, baby!", by: "Ronnie Coleman" },
  { q: "I hated every minute of training, but I said, Don't quit. Suffer now and live the rest of your life as a champion.", by: "Muhammad Ali" },
  { q: "The impediment to action advances action. What stands in the way becomes the way.", by: "Marcus Aurelius" },
  { q: "Discipline is the bridge between goals and accomplishment.", by: "Jim Rohn" },
  "Today is a deposit. Every rep you log compounds into the physique you want.",
  "Heavy, controlled, logged. Do that and the mirror takes care of itself.",
  "You already did the hard part: you showed up. Now make the first set count.",
  "Progressive overload is the whole game. Beat your last log by one rep or one plate.",
  "Big chest, capped shoulders, strong glutes. Build them one honest set at a time.",
  "The bar does not care how you feel. Your log does not lie. Go get the numbers.",
  "Leave one or two reps in the tank on the big lifts. Take the last set of isolations to the edge.",
  "Muscle bear season. Eat big, lift heavy, sleep deep.",
  "Your future self is going to be so glad you did not skip today.",
  "Warm up like you mean it, then attack the first working set.",
  "Stop negotiating. Start your first set.",
  "Slow negatives. Hard squeezes. Full stretch. That is how it grows.",
  "Nobody hands you a bigger chest. You take it, three minutes of rest at a time.",
  "Small jumps, every session. That is how a frame changes.",
  "Consistency beats intensity. Show up again tomorrow, too.",
  "The surplus is part of the workout. Eat what the plan says.",
  "Train like the person you are becoming.",
  "You do not need motivation. You need the first warm-up set.",
  "Every plate you add is a vote for the physique you are building.",
  "Earn the pump, then earn the next rep.",
  "Discipline now, freedom in the mirror later.",
  "Be patient with the scale and relentless with the bar.",
  "Log it. What gets tracked gets stronger.",
  "Your only competition is last session's numbers.",
  "Own the eccentric. Control the weight, do not let it control you.",
  "Rest between sets is part of the plan. Take it and come back stronger.",
  "A great session is not luck. It is sleep, food, and showing up.",
  "Break the record on one lift today. Just one.",
  "You are one workout away from a better mood.",
  "The weights are honest. Give them your best and they give it back.",
  "A lean bulk takes patience. Trust the process and keep lifting heavy.",
  "Be the person who trains when it is inconvenient.",
  "Chase the burn in the last two reps, not the first eight.",
  "Form first, load second, ego never.",
  "Feed the machine, train the machine, rest the machine.",
  "Stack good weeks. The physique is just the receipt.",
  "The barbell is waiting. Go say hello.",
  "Strong glutes, wide shoulders, thick chest, big arms. Pick your target and hit it.",
  "Turn the intensity up on the set that scares you a little.",
  "Nothing about today's plan is optional, and all of it is doable.",
  "Push the muscle, not the ego. Feel the target working every rep.",
  "Every session you finish is a session nobody can take from you.",
  "Sweat now, thank yourself in the mirror in six months.",
  "The plan is written. Your job is to execute.",
  "Hard training, real food, deep sleep. Repeat until different.",
  "Go beat the version of you that logged those numbers last time.",
  "Be relentless about the reps and gentle about the rest.",
  "You are building something that takes months. Today is one more brick.",
  "Tight core, proud chest, hard squeeze. Own every rep.",
  "Feel it in the target muscle, or lower the weight until you do.",
  "Fatigue is a signal, not a stop sign. Check your RIR and keep going.",
  "You are allowed to be tired and still lift well.",
  "Beat yesterday's excuses with today's reps.",
  "Get the work in and the food in. The results are automatic.",
  "There is a bigger version of you waiting on the other side of this session.",
  "Show me a log with one more rep in it.",
  "Push through the middle of the workout. That is where the growth is.",
  "Confidence is built in the gym, one completed session at a time.",
  "Your body adapts to what you demand of it. Demand more.",
  "Trust the process, trust the program, trust the reps.",
  "Big lifts first while you are fresh, then attack the accessories with control.",
  "Every rep with intent.",
  "Say it out loud: today I get stronger.",
];

// Hype lines for each training day. Nine per day (coprime with the 8-day cycle) so
// the same day does not land on the same line every cycle.
export const BRIEF_DAY_LINES = {
  1: [
    "Lower A. Glutes and hamstrings are on the menu. Squeeze at the top of every thrust.",
    "Hip thrusts first. Prime the glutes, pause at the top, and make 12 reps hard.",
    "Romanian deadlifts: hips back, hamstrings loaded, spine long. Feel the stretch.",
    "Build a lower body that fills out every pair of jeans.",
    "Glute bridge primer, then drive. Wake them up before you load them.",
    "Heavy legs day. The hardest sessions build the biggest change.",
    "Strong glutes and hamstrings fix posture and build a physique.",
    "Hamstrings and glutes are where a strong back half is built. Own the eccentric.",
    "Lower A is a long session. Take your rest, hit every rep, finish strong.",
  ],
  2: [
    "Heavy chest day. Three full minutes of rest on the press. Earn every rep.",
    "Chest is the priority. Big incline first, then flat, then finish with the fly.",
    "Press with intent, control the descent, drive up hard. Build that shelf.",
    "Take the rest. Your chest ran out of recovery before, not strength. Fix it today.",
    "Upper A: heavy press, sharp laterals, arms to finish. Stack it.",
    "Shoulder blades back, chest up, bar path smooth. Let the chest do the work.",
    "This is your heaviest push day. Add weight if last time earned it.",
    "Fly at the end: full stretch, hands meet, squeeze the chest.",
    "Thick chest, wide shoulders. The muscle bear shape starts on days like this.",
  ],
  4: [
    "Pull day. Build the width that makes your shoulders look capped and your waist look small.",
    "Pulldowns: elbows to the hips, chest up, feel the lats. Wide back, wide frame.",
    "Rows next. Brace hard, pull to the belly, squeeze the shoulder blades.",
    "Side delts and rear delts today. Small weights, strict form, huge payoff.",
    "Lateral raises: 12 to 20 reps, hold the top, control the way down.",
    "Biceps to finish. Full stretch at the bottom, hard squeeze at the top.",
    "A thick back and round delts make everything else look bigger.",
    "Pull day builds the V. Every lat rep is a brick in it.",
    "Rear delts, curls, pump. Finish the pull day strong.",
  ],
  6: [
    "Squat day. Three minutes rest, brace, sit down between your hips, drive up.",
    "Lower B: quads and glutes. Squat first while you are fresh, then press deep.",
    "Leg press feet high and wide. Feel the glutes at the bottom.",
    "Heavy squats build more than legs. They build belief.",
    "Squat with control, own the depth, and leave one or two reps in the tank.",
    "Extension and abduction to finish. Chase the burn without chasing the ego.",
    "Big legs, strong glutes. This is how the lower half catches up to the upper.",
    "Calves and abs to close. Small muscles, big finish.",
    "Squat day is the hardest day of the cycle. Win it and the rest is easy.",
  ],
  7: [
    "Upper B: shoulders, chest, arms. Everything that makes a t-shirt fit better.",
    "Shoulder press first. Fresh delts, heavy dumbbells, drive them up.",
    "Chest work after the shoulders. Full range, full control on every press and dip.",
    "Four sets of laterals today. Round, capped shoulders are built here.",
    "Fly, curl, extend. Finish with a huge arm pump.",
    "Second chest day of the cycle. Twice a cycle is how it grows.",
    "Press, dip, fly, raise, curl, extend. Simple work, big physique.",
    "Arms are the finishing touch. Keep every rep strict and slow.",
    "Last hard day of the cycle. Empty the tank, then recover like a pro.",
  ],
};

// Rest day lines. Seventeen, coprime with the 8-day cycle.
export const BRIEF_REST_LINES = [
  "Rest day. Active rest is still work: walk, stretch, eat, sleep.",
  "Growth happens while you recover. Do your recovery like you do your sets.",
  "Rest does not mean off. Move easy, eat your full target, sleep deep.",
  "The muscle you trained is rebuilding right now. Feed it.",
  "A 30 minute walk today makes tomorrow's session better.",
  "Recovery is a skill. Practice it with the same discipline you bring to lifting.",
  "No heavy lifting today. Just move, breathe, and refuel.",
  "Sleep is the strongest supplement you own. Protect it tonight.",
  "Mobilize your hips and upper back today. Your lifts will thank you.",
  "Strong people rest on purpose.",
  "Eat like it is a training day. Muscle is built on rest days, too.",
  "Easy movement, big meals, early bedtime. That is the whole plan.",
  "You earned this day. Use it to come back harder.",
  "Rest today so you can hit new numbers next session.",
  "Walk, foam roll, stretch, hydrate. Boring and effective.",
  "Recovery is where the training turns into muscle.",
  "Stay loose, stay fed, stay patient. The next session is coming.",
];

export const BRIEF_SESSION_TARGET = 4; // sessions per 7 days (5 training days per 8-day cycle)

export function briefPick(list, dayIndex) {
  return list[((dayIndex % list.length) + list.length) % list.length];
}
export function briefDayType(macros, entries, date) {
  const trained = entries.some(e => e.date === date && e.programDay && PROGRAM[e.programDay]?.exercises.length > 0
    && e.movements.some(m => m.sets.some(s => s.r !== "" && s.r != null)));
  if (trained) return "training";
  const day = macros[date];
  if (day?.dayTypeManual) return day.dayType === "training" ? "training" : "rest";
  return "rest";
}
export function briefDayCals(macros, date) {
  const list = macros[date]?.entries;
  if (!Array.isArray(list)) return 0;
  return list.reduce((s, e) => s + (parseFloat(e.cal) || 0), 0);
}
// Average weight over [from, to], needing at least 2 weigh-ins.
export function briefAvgWeight(weightLog, from, to) {
  const toLb = w => (w.unit === "kg" ? parseFloat(w.weight) * 2.20462 : parseFloat(w.weight));
  const pts = weightLog.filter(w => w.date >= from && w.date <= to).map(toLb).filter(n => !isNaN(n));
  return pts.length >= 2 ? pts.reduce((s, n) => s + n, 0) / pts.length : null;
}
export function isTrainingDay(n) {
  return !!PROGRAM[n] && PROGRAM[n].exercises.length > 0;
}
// What today is. Walks the 8-day cycle forward from the last completed session to
// the next training day and the date it falls due:
//   done  = a session was already completed today
//   train = today is that training day (or it is overdue, so do it today)
//   rest  = the next training day is still ahead, so today is an active rest day
export function todayPlan(entries, today) {
  const trainingDays = Object.keys(PROGRAM).map(Number).filter(isTrainingDay).sort((a, b) => a - b);
  const done = entries
    .filter(e => e.completedAt && trainingDays.includes(e.programDay))
    .sort((a, b) => b.date.localeCompare(a.date) || String(b.completedAt).localeCompare(String(a.completedAt)));
  if (done.length === 0) return { kind: "train", day: trainingDays[0], overdue: 0 };
  const last = done[0];
  let pos = last.programDay, gap = 0;
  do { pos = (pos % CYCLE_DAYS) + 1; gap++; } while (!isTrainingDay(pos) && gap <= CYCLE_DAYS);
  const due = addDays(last.date, gap);
  if (daysBetween(last.date, today) <= 0) return { kind: "done", doneDay: last.programDay, day: pos, due };
  if (today >= due) return { kind: "train", day: pos, overdue: daysBetween(due, today) };
  return { kind: "rest", day: pos, due };
}
export function briefLift(entries, ex, isDeload, location = null) {
  const last = lastMovementByName(entries, ex.name, location);
  let top = null;
  if (last) {
    const sets = last.mv.sets
      .map(s => ({ w: parseFloat(s.w), r: parseFloat(s.r) }))
      .filter(s => !isNaN(s.r));
    if (sets.length) top = sets.reduce((a, b) => ((b.w || 0) > (a.w || 0) || ((b.w || 0) === (a.w || 0) && b.r > a.r)) ? b : a);
  }
  const range = parseRepRange(ex.reps);
  const sug = suggestProgression(entries, ex.name, ex.reps, ex.type, {
    isDeloadWeek: isDeload, loadStep: ex.loadStep ?? null, bodyweight: !!ex.bodyweight, startWeight: ex.startWeight ?? null, location, setsTarget: ex.sets ?? null,
  });
  const w = sug?.weight;
  let target;
  if (!sug) target = top ? "Match it, then add a rep" : "No history yet. Find a working weight.";
  else if (sug.action === "add_weight") target = `Go up to ${w}, aim for ${range?.min ?? ""}+ reps`;
  else if (sug.action === "add_reps") target = w > 0 ? `Stay at ${w}, beat ${top?.r ?? ""} reps` : `Beat ${top?.r ?? ""} reps`;
  else if (sug.action === "coach") target = `Coach target: ${w}. ${COACH_TARGETS[ex.name]?.note.replace(/^Coach: /, "") ?? ""}`;
  else if (sug.calibrate) target = `New machine here. Start near ${w}, find the load that fits ${ex.reps}`;
  else if (sug.action === "hold") target = w > 0 ? `Stay at ${w}, build toward ${range?.max ?? ""} reps` : `Build toward ${range?.max ?? ""} reps`;
  else if (sug.action === "back_off") target = `Ease back to ${w}`;
  else if (sug.action === "deload") target = w > 0 ? `Deload week, use ${w}` : "Deload week, 2 easy sets";
  else if (sug.action === "block_start") target = `Start at ${w}, log RIR every set`;
  else target = "Match it, then add a rep";
  const plateau = detectPlateau(entries, ex.name, { bodyweight: !!ex.bodyweight, location, isDeloadWeek: isDeload, type: ex.type, loadStep: ex.loadStep ?? null });
  const pr = !isDeload && sug?.action !== "back_off" ? prForecast(entries, ex.name, w ?? top?.w, ex.reps) : null;
  return {
    plateau: plateau ? `Stalled ${plateau.sessions} sessions. ${plateau.fix}` : null,
    pr: pr ? `PR in reach: ${pr.weight} x ${pr.reps} beats your best (${pr.bestW} x ${pr.bestR})` : null,
    name: ex.name, sets: ex.sets, reps: ex.reps, rest: ex.rest, muscle: ex.muscle,
    last: top ? ((top.w || 0) > 0 ? `${top.w} x ${top.r}` : `${top.r} reps`) : null,
    lastDate: last?.date ?? null,
    target,
  };
}
export function buildDailyBrief({ entries, weightLog, macros, macroTargets, mesoOverride, location, today }) {
  const dayIndex = daysBetween("2026-01-01", today);
  const plan = todayPlan(entries, today);
  const quote = briefPick(BRIEF_QUOTES, dayIndex);
  const isDeload = deloadNow(entries, today, mesocycleWeek(entries, mesoOverride).isDeload);
  const dl = loadDeload();
  const dlSt = deloadStatus(dl, entries, today);
  // During a planned deload each lift shows its exact prescription; the next-block cue rides along.
  const withDeload = (day, l) => {
    if (dlSt.status !== "active") return l;
    const p = deloadPlanFor(entries, dl, day, l.name, location ?? "equinox");
    const cue = cueFor(dl, l.name);
    return p ? { ...l, sets: p.sets, target: `Deload: ${p.text}. RIR 3 to 4, no sets to failure.`, plateau: null, pr: null, cue: cue ? `Next block: ${cue.short}` : null } : l;
  };
  const exercisesFor = day => coachOrder(day, PROGRAM[day].exercises.map(ex => resolveExercise(day, ex.id, location) ?? ex), entries);

  let headline, session = null, recovery = null, upcoming = null;
  if (plan.kind === "train") {
    const exs = exercisesFor(plan.day);
    headline = briefPick(BRIEF_DAY_LINES[plan.day] ?? BRIEF_QUOTES.filter(q => typeof q === "string"), dayIndex);
    session = {
      day: plan.day, title: PROGRAM[plan.day].title, tag: PROGRAM[plan.day].tag,
      overdue: plan.overdue, isDeload,
      exercises: exs.map(ex => withDeload(plan.day, briefLift(entries, ex, isDeload, location))),
      muscles: [...new Set(exs.map(ex => ex.muscle).filter(Boolean))],
    };
  } else {
    headline = briefPick(BRIEF_REST_LINES, dayIndex);
    const t = macroTargets?.[plan.kind === "done" ? "training" : "rest"];
    const away = daysBetween(today, plan.due);
    recovery = {
      done: plan.kind === "done",
      doneTitle: plan.kind === "done" ? PROGRAM[plan.doneDay]?.title : null,
      cal: t ? macroCals(t.p, t.c, t.f) : null,
      protein: t ? Math.round(parseFloat(t.p) || 0) : null,
    };
    upcoming = {
      day: plan.day, title: PROGRAM[plan.day].title,
      when: away <= 1 ? "Tomorrow" : `In ${away} days`,
      isDeload,
      lifts: exercisesFor(plan.day).slice(0, 2).map(ex => withDeload(plan.day, briefLift(entries, ex, isDeload, location))),
    };
  }

  // Last 7 days: the 7 full days before today.
  const from = addDays(today, -7), to = addDays(today, -1);
  const trainingDays = Object.keys(PROGRAM).map(Number).filter(isTrainingDay);
  const sessions = entries.filter(e => e.completedAt && trainingDays.includes(e.programDay) && e.date >= from && e.date <= to).length;
  let fedDays = 0;
  for (let i = 1; i <= 7; i++) {
    const d = addDays(today, -i);
    const t = macroTargets?.[briefDayType(macros, entries, d)];
    if (!t) continue;
    const target = macroCals(t.p, t.c, t.f);
    if (target > 0 && briefDayCals(macros, d) >= 0.9 * target) fedDays++;
  }
  const now = briefAvgWeight(weightLog, from, to);
  const prev = briefAvgWeight(weightLog, addDays(today, -14), addDays(today, -8));
  let weight = { now, prev, delta: null, status: null };
  if (now != null && prev != null) {
    const delta = now - prev;
    weight = { now, prev, delta, status: delta < 0.4 ? "Under pace" : delta <= 1.1 ? "On pace" : "Above pace" };
  }

  if (session) session.totalSets = session.exercises.reduce((n, l) => n + (l.sets || 0), 0);
  const nutrition = dlSt.status === "active" ? deloadNutrition(weightTrend(weightLog, today).rate) : null;
  return {
    today, kind: plan.kind, headline, quote, nutrition,
    session, recovery, upcoming,
    week: { sessions, sessionTarget: BRIEF_SESSION_TARGET, fedDays, weight },
  };
}
