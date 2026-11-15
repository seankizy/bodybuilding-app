// ── MACHINE REFERENCE ───────────────────────────────────────────────────────
// Sean's gym machines with their photo and the manufacturer's starting weight
// (the load before any plates). Photos live in public/machines/.
// To add one: drop a photo in public/machines/ and add a row here.
import { nameKey } from "../program.js";

export const MACHINES = [
  {
    id: "equinox-leg-press", gym: "equinox", name: "Leg Press",
    brand: "Hoist", model: "CF-3355 Angled Linear Leg Press",
    startLb: 140, maxLb: 1000, photo: "/machines/equinox-leg-press.jpg",
    matches: ["Leg Press Machine", "Leg Press", "Leg Press Calf Raise"],
    note: "Empty carriage is 140 lb. Total load is 140 lb plus your plates.",
  },
  {
    id: "equinox-hack-squat", gym: "equinox", name: "Hack Squat",
    brand: "Hoist", model: "CF-3356 Hack Squat",
    startLb: 88, maxLb: 630, photo: "/machines/equinox-hack-squat.jpg",
    matches: ["Hack Squat Machine", "Hack Squat"],
    note: "Plate loaded sled at 42 degrees. Total load is 88 lb plus your plates.",
  },
  {
    id: "equinox-hip-thrust", gym: "equinox", name: "Hip Thrust Machine",
    brand: "Technogym", model: "Pure Strength Hip Thrust (MG80)",
    startLb: 77, maxLb: 220, photo: "/machines/equinox-hip-thrust.jpg",
    matches: ["Hip Thrust Machine", "Machine Hip Thrust", "Plate Loaded Hip Thrust"],
    note: "Pelvic pad swivels open. Max load is 220 lb, so progress with reps and pauses past that.",
  },
];

export function machineFor(location, exerciseName) {
  if (!exerciseName) return null;
  const want = nameKey(exerciseName);
  return MACHINES.find(m => (!location || m.gym === location) && m.matches.some(n => nameKey(n) === want)) ?? null;
}
