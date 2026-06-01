import { useState, useEffect, useRef } from "react";

// ── PROGRAM DATA ──────────────────────────────────────────────────────────────
const PROGRAM = {
  1: {
    title: "Heavy Squats & Legs",
    tag: "LEGS",
    color: "#4ade80",
    exercises: [
      { id: "A", name: "Barbell Squat (power rack)", sets: 4, reps: "8–12", rest: "2m 30s" },
      { id: "B", name: "Leg Press Machine", sets: 2, reps: "6–10", rest: "2m" },
      { id: "C", name: "Leg Extension", sets: 3, reps: "10–15", rest: "1m" },
      { id: "D", name: "DB Walking Lunge", sets: 2, reps: "10 each leg", rest: "1m" },
      { id: "E", name: "Seated Calf Raises (DB on knees)", sets: 4, reps: "10–15", rest: "1m" },
    ],
  },
  2: {
    title: "Heavy Bench & Chest",
    tag: "PUSH",
    color: "#60a5fa",
    exercises: [
      { id: "A", name: "Barbell Bench Press (power rack)", sets: 4, reps: "8–10", rest: "3m" },
      { id: "B", name: "Close Grip Barbell Bench Press", sets: 3, reps: "8–10", rest: "1m" },
      { id: "C", name: "DB Incline Chest Press", sets: 3, reps: "8–12", rest: "1m 30s" },
      { id: "D", name: "Tricep Overhead Extension (DB or EZ bar)", sets: 3, reps: "10–15", rest: "1m" },
      { id: "E", name: "Cable Pushdown (Carnelli)", sets: 3, reps: "10–15", rest: "1m" },
    ],
  },
  3: { title: "Rest Day", tag: "REST", color: "#6b7280", exercises: [] },
  4: {
    title: "Posterior Chain",
    tag: "PULL",
    color: "#f97316",
    exercises: [
      { id: "A", name: "Prone Hamstring Curl", sets: 4, reps: "2×10-12, 2×15-20", rest: "1m" },
      { id: "B", name: "Romanian Deadlift (barbell)", sets: 3, reps: "6–10", rest: "1m 30s" },
      { id: "C", name: "Barbell Hip Thrust (bench + barbell)", sets: 2, reps: "20–25", rest: "1m" },
      { id: "D", name: "Barbell Bent Over Row", sets: 3, reps: "6–10", rest: "1m 30s" },
      { id: "E", name: "Lat Pulldown (Carnelli)", sets: 3, reps: "8–12", rest: "1m 30s" },
    ],
  },
  5: { title: "Rest Day", tag: "REST", color: "#6b7280", exercises: [] },
  6: {
    title: "Secondary Lower Body",
    tag: "LEGS",
    color: "#a78bfa",
    exercises: [
      { id: "A", name: "Barbell Front Squat (power rack)", sets: 4, reps: "8–10", rest: "2m 30s" },
      { id: "B", name: "DB Bulgarian Split Squat", sets: 2, reps: "8–10", rest: "1m" },
      { id: "C", name: "Lat Pulldown (Carnelli)", sets: 3, reps: "10–12", rest: "1m" },
      { id: "D", name: "Cable Row (Carnelli low pulley)", sets: 3, reps: "10–12", rest: "1m" },
      { id: "E", name: "EZ Bar Curl", sets: 4, reps: "10–12", rest: "1m" },
      { id: "F", name: "DB Hammer Curl", sets: 3, reps: "10–12", rest: "1m" },
    ],
  },
  7: {
    title: "Overhead Press & Push",
    tag: "PUSH",
    color: "#f43f5e",
    exercises: [
      { id: "A", name: "DB Shoulder Press", sets: 4, reps: "5–8", rest: "2m" },
      { id: "B", name: "DB Lateral Raise (leaning)", sets: 4, reps: "10–15", rest: "1m" },
      { id: "C", name: "Incline Barbell Press (rack + bench)", sets: 3, reps: "8–12", rest: "1m" },
      { id: "D", name: "Reverse DB Rear Delt Fly", sets: 3, reps: "12–15", rest: "1m" },
      { id: "E", name: "Weighted Dips (belt or DB between legs)", sets: 3, reps: "10–12", rest: "1m" },
      { id: "F", name: "Tricep Pushdown EZ Bar (cable machine)", sets: 3, reps: "12–15", rest: "1m" },
    ],
  },
};

// ── HELPERS ──────────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function restToSeconds(restStr) {
  if (!restStr) return 60;
  const m = restStr.match(/(\d+)\s*m(?:\s*(\d+)\s*s)?/);
  if (m) return parseInt(m[1]) * 60 + (m[2] ? parseInt(m[2]) : 0);
  const s = restStr.match(/(\d+)\s*s/);
  if (s) return parseInt(s[1]);
  return 60;
}
function fmtDate(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}
function newEntry(dateStr) {
  return {
    id: Date.now(),
    date: dateStr,
    programDay: null,
    customTitle: "",
    note: "",
    movements: [],
    completedAt: null,
  };
}
function newMovement(name = "") {
  return { id: Date.now() + Math.random(), name, sets: [{ w: "", r: "" }], note: "" };
}

// ── SEED DATA — from original workout screenshots (May 7 2026) ───────────────
// Only used on first load if localStorage is empty.
const SEED_ENTRIES = [
  {
    id: 1000001, date: "2026-05-07", programDay: 1,
    customTitle: "Heavy Squats & Legs", note: "", completedAt: null,
    movements: [
      { id: 1000101, name: "Barbell Squat (power rack)", programRef: "A", setsTarget: 4, repsTarget: "8–12", rest: "2m 30s", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "47.5", r: "12" }, { w: "50", r: "12" }, { w: "52", r: "12" }, { w: "52", r: "9" }] },
      { id: 1000102, name: "Leg Press Machine", programRef: "B", setsTarget: 2, repsTarget: "6–10", rest: "2m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "199.5", r: "10" }, { w: "199.5", r: "9" }] },
      { id: 1000103, name: "Leg Extension", programRef: "C", setsTarget: 3, repsTarget: "10–15", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "32", r: "9" }, { w: "32", r: "10" }, { w: "32", r: "10" }] },
      { id: 1000104, name: "DB Walking Lunge", programRef: "D", setsTarget: 2, repsTarget: "10 each leg", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "32", r: "10" }, { w: "32", r: "7" }] },
      { id: 1000105, name: "Seated Calf Raises (DB on knees)", programRef: "E", setsTarget: 4, repsTarget: "10–15", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "68", r: "15" }, { w: "68", r: "15" }, { w: "68", r: "14" }, { w: "70.5", r: "14" }] },
    ],
  },
  {
    id: 1000002, date: "2026-05-07", programDay: 2,
    customTitle: "Heavy Bench & Chest", note: "", completedAt: null,
    movements: [
      { id: 1000201, name: "Barbell Bench Press (power rack)", programRef: "A", setsTarget: 4, repsTarget: "8–10", rest: "3m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "84", r: "10" }, { w: "84", r: "10" }, { w: "84", r: "12" }, { w: "86", r: "9" }] },
      { id: 1000202, name: "Close Grip Barbell Bench Press", programRef: "B", setsTarget: 3, repsTarget: "8–10", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "70.5", r: "8" }, { w: "70.5", r: "5" }, { w: "61", r: "8" }] },
      { id: 1000203, name: "DB Incline Chest Press", programRef: "C", setsTarget: 3, repsTarget: "8–12", rest: "1m 30s", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "27", r: "12" }, { w: "27", r: "9" }, { w: "27", r: "10" }] },
      { id: 1000204, name: "Tricep Overhead Extension (DB or EZ bar)", programRef: "D", setsTarget: 3, repsTarget: "10–15", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "18", r: "12" }, { w: "18", r: "10" }, { w: "18", r: "10" }] },
      { id: 1000205, name: "Cable Pushdown (Carnelli)", programRef: "E", setsTarget: 3, repsTarget: "10–15", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "18", r: "10" }, { w: "18", r: "11" }, { w: "18", r: "10" }] },
    ],
  },
  {
    id: 1000004, date: "2026-05-07", programDay: 4,
    customTitle: "Posterior Chain", note: "", completedAt: null,
    movements: [
      { id: 1000401, name: "Prone Hamstring Curl", programRef: "A", setsTarget: 4, repsTarget: "2×10-12, 2×15-20", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "32", r: "12" }, { w: "32", r: "8" }, { w: "22.5", r: "16" }, { w: "22.5", r: "13" }] },
      { id: 1000402, name: "Romanian Deadlift (barbell)", programRef: "B", setsTarget: 3, repsTarget: "6–10", rest: "1m 30s", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "70.5", r: "10" }, { w: "70.5", r: "10" }, { w: "70.5", r: "6" }] },
      { id: 1000403, name: "Barbell Hip Thrust (bench + barbell)", programRef: "C", setsTarget: 2, repsTarget: "20–25", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "61", r: "17" }, { w: "61", r: "13" }] },
      { id: 1000404, name: "Barbell Bent Over Row", programRef: "D", setsTarget: 3, repsTarget: "6–10", rest: "1m 30s", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "52", r: "10" }, { w: "52", r: "10" }, { w: "52", r: "" }] },
      { id: 1000405, name: "Lat Pulldown (Carnelli)", programRef: "E", setsTarget: 3, repsTarget: "8–12", rest: "1m 30s", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "54.5", r: "10" }, { w: "54.5", r: "11" }, { w: "54.5", r: "9" }] },
    ],
  },
  {
    id: 1000006, date: "2026-05-07", programDay: 6,
    customTitle: "Secondary Lower Body", note: "", completedAt: null,
    movements: [
      { id: 1000601, name: "Barbell Front Squat (power rack)", programRef: "A", setsTarget: 4, repsTarget: "8–10", rest: "2m 30s", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "50", r: "10" }, { w: "50", r: "10" }, { w: "55", r: "10" }, { w: "55", r: "9" }] },
      { id: 1000602, name: "DB Bulgarian Split Squat", programRef: "B", setsTarget: 2, repsTarget: "8–10", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "27", r: "9" }, { w: "27", r: "11" }] },
      { id: 1000603, name: "Lat Pulldown (Carnelli)", programRef: "C", setsTarget: 3, repsTarget: "10–12", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "59", r: "12" }, { w: "61", r: "10" }, { w: "61", r: "10" }] },
      { id: 1000604, name: "Cable Row (Carnelli low pulley)", programRef: "D", setsTarget: 3, repsTarget: "10–12", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "59", r: "12" }, { w: "59", r: "11" }, { w: "59", r: "9" }] },
      { id: 1000605, name: "EZ Bar Curl", programRef: "E", setsTarget: 4, repsTarget: "10–12", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "16", r: "12" }, { w: "16", r: "10" }, { w: "16", r: "11" }, { w: "16", r: "6" }] },
      { id: 1000606, name: "DB Hammer Curl", programRef: "F", setsTarget: 3, repsTarget: "10–12", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "10", r: "12" }, { w: "10", r: "12" }, { w: "10.5", r: "11" }] },
    ],
  },
  {
    id: 1000007, date: "2026-05-07", programDay: 7,
    customTitle: "Overhead Press & Push", note: "", completedAt: null,
    movements: [
      { id: 1000701, name: "DB Shoulder Press", programRef: "A", setsTarget: 4, repsTarget: "5–8", rest: "2m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "27", r: "8" }, { w: "27", r: "8" }, { w: "27", r: "7" }, { w: "27", r: "7" }] },
      { id: 1000702, name: "DB Lateral Raise (leaning)", programRef: "B", setsTarget: 4, repsTarget: "10–15", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "3.5", r: "15" }, { w: "3.5", r: "15" }, { w: "3.5", r: "10" }, { w: "3.5", r: "9" }] },
      { id: 1000703, name: "Incline Barbell Press (rack + bench)", programRef: "C", setsTarget: 3, repsTarget: "8–12", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "60", r: "10" }, { w: "60", r: "8" }, { w: "60", r: "8" }] },
      { id: 1000704, name: "Reverse DB Rear Delt Fly", programRef: "D", setsTarget: 3, repsTarget: "12–15", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "5.5", r: "13" }, { w: "5.5", r: "15" }, { w: "7", r: "12" }] },
      { id: 1000705, name: "Weighted Dips (belt or DB between legs)", programRef: "E", setsTarget: 3, repsTarget: "10–12", rest: "1m", note: "", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "BW", r: "10" }, { w: "BW", r: "10" }, { w: "BW", r: "9" }] },
      { id: 1000706, name: "Tricep Pushdown EZ Bar (cable machine)", programRef: "F", setsTarget: 3, repsTarget: "12–15", rest: "1m", note: "Tempo: 1-0-1-0", doneAt: null, lastSets: null, lastDate: null,
        sets: [{ w: "25", r: "10" }, { w: "25", r: "7" }, { w: "22.5", r: "8" }] },
    ],
  },
];
const SEED_WEIGHTS = [];
// ── STORAGE (localStorage — persists across deployments) ──────────────────
async function loadEntries() {
  try {
    const raw = localStorage.getItem("wj_entries");
    if (raw) { const p = JSON.parse(raw); if (Array.isArray(p) && p.length > 0) return p; }
  } catch {}
  return JSON.parse(JSON.stringify(SEED_ENTRIES));
}
async function saveEntries(entries) {
  try {
    const data = JSON.stringify(entries);
    localStorage.setItem("wj_entries", data);
    // Warn if storage is getting large (>4MB)
    const kb = Math.round(data.length / 1024);
    if (kb > 4096) console.warn(`[Journal] Storage at ${kb}KB — consider exporting CSV backup`);
  } catch (e) {
    if (e.name === "QuotaExceededError") {
      alert("Storage full — please export your data as CSV from the journal header, then contact support.");
    }
  }
}

async function loadWeights() {
  try {
    const raw = localStorage.getItem("wj_weights");
    if (raw) { const p = JSON.parse(raw); if (Array.isArray(p) && p.length > 0) return p; }
  } catch {}
  return JSON.parse(JSON.stringify(SEED_WEIGHTS));
}
async function saveWeights(weights) {
  try { localStorage.setItem("wj_weights", JSON.stringify(weights)); } catch {}
}

// ── CSV EXPORT ────────────────────────────────────────────────────────────────
function buildCSV(entries, weights) {
  const rows = [["TYPE","DATE","PROGRAM_DAY","WORKOUT_TITLE","EXERCISE","SET","WEIGHT_LBS","REPS","SESSION_NOTE","MOVEMENT_NOTE"]];
  for (const e of [...entries].sort((a,b) => a.date.localeCompare(b.date))) {
    if (!e.movements || e.movements.length === 0) {
      rows.push(["WORKOUT", e.date, e.programDay ?? "", e.customTitle, "", "", "", "", csvEsc(e.note), ""]);
      continue;
    }
    for (const mv of e.movements) {
      if (!mv.sets || mv.sets.length === 0) {
        rows.push(["WORKOUT", e.date, e.programDay ?? "", e.customTitle, mv.name, "", "", "", csvEsc(e.note), csvEsc(mv.note)]);
        continue;
      }
      for (let i = 0; i < mv.sets.length; i++) {
        const s = mv.sets[i];
        rows.push(["WORKOUT", e.date, e.programDay ?? "", e.customTitle, mv.name, i + 1, s.w ?? "", s.r ?? "", i === 0 ? csvEsc(e.note) : "", i === 0 ? csvEsc(mv.note) : ""]);
      }
    }
  }
  for (const w of [...weights].sort((a,b) => a.date.localeCompare(b.date))) {
    rows.push(["WEIGHT", w.date, "", "", "", "", "", "", `${w.weight} ${w.unit}`, w.note ?? ""]);
  }
  return rows.map(r => r.map(v => String(v ?? "")).join(",")).join("\n");
}
function csvEsc(v) {
  if (!v) return "";
  if (v.includes(",") || v.includes('"') || v.includes("\n")) return `"${v.replace(/"/g, '""')}"`;
  return v;
}
function downloadCSV(entries, weights) {
  const csv = buildCSV(entries, weights);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `workout_journal_${todayStr()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
function downloadJSON(entries, weights) {
  const payload = { version: 2, exportedAt: new Date().toISOString(), entries, weights };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `workout_backup_${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
function readJSONBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target.result);
        // Support both raw array and versioned object
        const entries = Array.isArray(parsed) ? parsed : (parsed.entries ?? []);
        const weights = Array.isArray(parsed) ? [] : (parsed.weights ?? []);
        resolve({ entries, weights });
      } catch { reject(new Error("Invalid JSON file")); }
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsText(file);
  });
}

function getLastSession(entries, programDay) {
  return [...entries]
    .filter(e => e.programDay === programDay)
    .sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [entries, setEntries] = useState([]);
  const [view, setView] = useState("journal");
  const [activeId, setActiveId] = useState(null);
  const [activeMvId, setActiveMvId] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newDate, setNewDate] = useState(todayStr());
  const [newProgramDay, setNewProgramDay] = useState(null);
  const [tab, setTab] = useState("journal");
  const [weightLog, setWeightLog] = useState([]);
  const [weightInput, setWeightInput] = useState("");
  const [weightDate, setWeightDate] = useState(todayStr());
  const [weightUnit, setWeightUnit] = useState("kg");
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timerState, setTimerState] = useState(null);
  // NEW: between-movement stopwatch
  const [showStopwatch, setShowStopwatch] = useState(false);
  const [stopwatchElapsed, setStopwatchElapsed] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  // Data tab state
  const [filterDay, setFilterDay] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const [importMsg, setImportMsg] = useState("");
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);
  const stopwatchRef = useRef(null);

  const activeEntry = entries.find(e => e.id === activeId);
  const activeMv = activeEntry?.movements.find(m => m.id === activeMvId);

  useEffect(() => {
    Promise.all([loadEntries(), loadWeights()]).then(([e, w]) => {
      setEntries(e);
      setWeightLog(w);
      setLoading(false);
    });
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!loading && entries.length > 0) saveEntries(entries);
  }, [entries, loading]);

  useEffect(() => {
    if (!loading) saveWeights(weightLog);
  }, [weightLog, loading]);

  function mutate(fn) {
    setEntries(prev => {
      const next = fn(JSON.parse(JSON.stringify(prev)));
      saveEntries(next);
      return next;
    });
  }

  // ── TIMER — timestamp-based so backgrounding doesn't desync ─────────────
  const timerDeadlineRef = useRef(null);

  function startTimer(setIdx, totalSeconds) {
    clearInterval(timerRef.current);
    const deadline = Date.now() + totalSeconds * 1000;
    timerDeadlineRef.current = deadline;
    setTimerState({ setIdx, total: totalSeconds, remaining: totalSeconds, running: true });
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((timerDeadlineRef.current - Date.now()) / 1000));
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        setTimerState(prev => prev ? { ...prev, remaining: 0, running: false, done: true } : null);
      } else {
        setTimerState(prev => prev ? { ...prev, remaining } : null);
      }
    }, 500);
  }
  function pauseTimer() {
    clearInterval(timerRef.current);
    setTimerState(prev => prev ? { ...prev, running: false } : null);
  }
  function resumeTimer() {
    if (!timerState || timerState.remaining <= 0) return;
    const deadline = Date.now() + timerState.remaining * 1000;
    timerDeadlineRef.current = deadline;
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((timerDeadlineRef.current - Date.now()) / 1000));
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        setTimerState(prev => prev ? { ...prev, remaining: 0, running: false, done: true } : null);
      } else {
        setTimerState(prev => prev ? { ...prev, remaining } : null);
      }
    }, 500);
    setTimerState(prev => prev ? { ...prev, running: true, done: false } : null);
  }
  function resetTimer(totalSeconds) {
    clearInterval(timerRef.current);
    timerDeadlineRef.current = null;
    setTimerState(prev => prev ? { ...prev, remaining: totalSeconds, running: false, done: false } : null);
  }
  function dismissTimer() {
    clearInterval(timerRef.current);
    timerDeadlineRef.current = null;
    setTimerState(null);
  }

  // ── STOPWATCH — also timestamp-based ──────────────────────────────────────
  const stopwatchStartRef = useRef(null);
  const stopwatchBaseRef = useRef(0);

  function startStopwatch() {
    stopwatchStartRef.current = Date.now();
    stopwatchBaseRef.current = 0;
    setStopwatchElapsed(0);
    setStopwatchRunning(true);
    clearInterval(stopwatchRef.current);
    stopwatchRef.current = setInterval(() => {
      const elapsed = stopwatchBaseRef.current + Math.round((Date.now() - stopwatchStartRef.current) / 1000);
      setStopwatchElapsed(elapsed);
    }, 500);
  }
  function toggleStopwatch() {
    if (stopwatchRunning) {
      clearInterval(stopwatchRef.current);
      stopwatchBaseRef.current = stopwatchBaseRef.current + Math.round((Date.now() - stopwatchStartRef.current) / 1000);
      setStopwatchRunning(false);
    } else {
      stopwatchStartRef.current = Date.now();
      stopwatchRef.current = setInterval(() => {
        const elapsed = stopwatchBaseRef.current + Math.round((Date.now() - stopwatchStartRef.current) / 1000);
        setStopwatchElapsed(elapsed);
      }, 500);
      setStopwatchRunning(true);
    }
  }
  function resetStopwatch() {
    clearInterval(stopwatchRef.current);
    stopwatchStartRef.current = null;
    stopwatchBaseRef.current = 0;
    setStopwatchElapsed(0);
    setStopwatchRunning(false);
  }
  function dismissStopwatch() {
    clearInterval(stopwatchRef.current);
    stopwatchStartRef.current = null;
    stopwatchBaseRef.current = 0;
    setShowStopwatch(false);
    setStopwatchElapsed(0);
    setStopwatchRunning(false);
  }

  function createEntry() {
    const prog = newProgramDay ? PROGRAM[newProgramDay] : null;
    const entry = newEntry(newDate);
    entry.programDay = newProgramDay;
    entry.customTitle = prog ? prog.title : "";
    if (prog) {
      const last = getLastSession(entries, newProgramDay);
      entry.movements = prog.exercises.map(ex => {
        const lastMv = last?.movements.find(m => m.programRef === ex.id) ?? null;
        const lastSets = lastMv?.sets ?? [];
        const seeded = Array.from({ length: ex.sets }, (_, i) => ({
          w: lastSets[i]?.w ?? "",
          r: lastSets[i]?.r ?? "",
        }));
        return {
          ...newMovement(ex.name),
          id: Date.now() + Math.random(),
          programRef: ex.id,
          setsTarget: ex.sets,
          repsTarget: ex.reps,
          rest: ex.rest,
          sets: seeded,
          lastSets: lastSets.length > 0 ? lastSets : null,
          lastDate: last?.date ?? null,
        };
      });
    }
    mutate(prev => [entry, ...prev]);
    setActiveId(entry.id);
    setView("entry");
    setShowNewModal(false);
    setNewProgramDay(null);
  }

  function deleteEntry(id) {
    mutate(prev => prev.filter(e => e.id !== id));
    setView("journal");
  }
  function updateEntry(id, patch) {
    mutate(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  }
  function addMovement(entryId) {
    const mv = newMovement();
    mutate(prev => prev.map(e => e.id === entryId ? { ...e, movements: [...e.movements, mv] } : e));
    setActiveMvId(mv.id);
    setView("movement");
  }
  function updateMovement(entryId, mvId, patch) {
    mutate(prev => prev.map(e => e.id === entryId
      ? { ...e, movements: e.movements.map(m => m.id === mvId ? { ...m, ...patch } : m) }
      : e));
  }
  function deleteMovement(entryId, mvId) {
    mutate(prev => prev.map(e => e.id === entryId
      ? { ...e, movements: e.movements.filter(m => m.id !== mvId) }
      : e));
    setView("entry");
  }
  function addSet(entryId, mvId) {
    mutate(prev => prev.map(e => e.id === entryId
      ? { ...e, movements: e.movements.map(m => m.id === mvId
          ? { ...m, sets: [...m.sets, { w: m.sets.at(-1)?.w ?? "", r: "" }] }
          : m) }
      : e));
  }
  function removeSet(entryId, mvId, si) {
    mutate(prev => prev.map(e => e.id === entryId
      ? { ...e, movements: e.movements.map(m => m.id === mvId
          ? { ...m, sets: m.sets.filter((_, i) => i !== si) }
          : m) }
      : e));
  }
  function updateSet(entryId, mvId, si, field, val) {
    mutate(prev => prev.map(e => e.id === entryId
      ? { ...e, movements: e.movements.map(m => m.id === mvId
          ? { ...m, sets: m.sets.map((s, i) => i === si ? { ...s, [field]: val } : s) }
          : m) }
      : e));
  }

  // Reorder movements via drag
  function reorderMovements(entryId, fromIdx, toIdx) {
    mutate(prev => prev.map(e => {
      if (e.id !== entryId) return e;
      const mvs = [...e.movements];
      const [moved] = mvs.splice(fromIdx, 1);
      mvs.splice(toIdx, 0, moved);
      return { ...e, movements: mvs };
    }));
  }

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  if (loading) {
    return (
      <Shell>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 12 }}>
          <div style={{ fontSize: 32 }}>🏋️</div>
          <div style={{ fontSize: 14, color: "#4b5563", fontFamily: "monospace", letterSpacing: 2 }}>LOADING…</div>
        </div>
      </Shell>
    );
  }

  // ── MOVEMENT DETAIL ───────────────────────────────────────────────────────
  if (view === "movement" && activeEntry && activeMv) {
    const prog = activeEntry.programDay ? PROGRAM[activeEntry.programDay] : null;
    const color = prog?.color ?? "#4ade80";
    const allMvs = activeEntry.movements;
    const curIdx = allMvs.findIndex(m => m.id === activeMv.id);
    const nextMv = allMvs[curIdx + 1] ?? null;
    const isLast = curIdx === allMvs.length - 1;
    const alreadyDone = !!activeMv.doneAt;

    function finishAndAdvance() {
      const ts = new Date().toISOString();
      updateMovement(activeEntry.id, activeMv.id, { doneAt: ts });
      dismissTimer();
      // Show stopwatch between movements
      if (nextMv) {
        startStopwatch();
        setShowStopwatch(true);
      } else {
        setView("entry");
      }
    }

    return (
      <Shell>
        <TopBar
          left={<BackBtn onClick={() => { setView("entry"); setShowStopwatch(false); resetStopwatch(); dismissTimer(); }} label={activeEntry.customTitle || "Entry"} />}
          right={
            <button onClick={() => { deleteMovement(activeEntry.id, activeMv.id); }}
              style={btnStyle("#7f1d1d", "#f87171")}>Delete</button>
          }
        />

        <div style={{ padding: "4px 18px 16px" }}>
          {activeMv.programRef && (
            <div style={{ fontSize: 11, letterSpacing: 2, color: "#6b7280", textTransform: "uppercase", marginBottom: 6, fontFamily: "monospace" }}>
              {prog?.title} · {activeMv.programRef}
            </div>
          )}
          {/* CHANGE 3: Editable movement name inline */}
          <input
            style={bigInput}
            value={activeMv.name}
            onChange={e => updateMovement(activeEntry.id, activeMv.id, { name: e.target.value })}
            placeholder="Movement name…"
          />
          {activeMv.repsTarget && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              <Pill color={color}>{activeMv.setsTarget} sets</Pill>
              <Pill color={color}>{activeMv.repsTarget} reps</Pill>
              {activeMv.rest && <Pill color="#6b7280">Rest {activeMv.rest}</Pill>}
            </div>
          )}
        </div>

        {activeMv.lastSets && activeMv.lastDate && (
          <div style={{ margin: "0 18px 14px", padding: "10px 14px", borderRadius: 12, background: "#0a1a10", border: "1px solid #1a3a22" }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: "#374151", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 6 }}>
              Last session · {fmtDate(activeMv.lastDate)}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {activeMv.lastSets.map((s, i) => (
                <span key={i} style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 700, padding: "4px 9px", borderRadius: 7, background: "#0d2318", border: "1px solid #1a3a22", color: "#4ade8088" }}>
                  {s.w ? `${s.w}lb` : "BW"}×{s.r || "?"}
                </span>
              ))}
            </div>
          </div>
        )}

        <SectionLabel>Set Log</SectionLabel>

        {/* CHANGE 1: Stopwatch between movements — shown after finishing a movement */}
        {showStopwatch && (
          <div style={{ margin: "0 18px 14px", padding: "16px", borderRadius: 14, background: "#0a1200", border: "2px solid #fbbf2466" }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: "#fbbf24", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 8 }}>⏱ Rest Before Next Movement</div>
            <div style={{ fontSize: 42, fontWeight: 900, color: "#fbbf24", fontFamily: "monospace", letterSpacing: 4, textAlign: "center" }}>
              {`${Math.floor(stopwatchElapsed / 60)}:${String(stopwatchElapsed % 60).padStart(2, "0")}`}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "center" }}>
              <button onClick={toggleStopwatch} style={{ ...btnStyle("#1a1200", "#fbbf24"), padding: "8px 16px" }}>
                {stopwatchRunning ? "⏸ Pause" : "▶ Resume"}
              </button>
              <button onClick={resetStopwatch} style={{ ...btnStyle("#1f2937", "#6b7280"), padding: "8px 14px" }}>↺</button>
              <button onClick={() => {
                dismissStopwatch();
                if (nextMv) { setActiveMvId(nextMv.id); setTimerState(null); }
                else setView("entry");
              }} style={{ ...btnStyle("#fbbf24", "#0a0f0d"), padding: "8px 16px", fontWeight: 800 }}>
                Next: {nextMv?.name?.split(" ")[0] || "Done"} →
              </button>
            </div>
          </div>
        )}

        {!showStopwatch && activeMv.sets.map((s, i) => {
          const restSecs = restToSeconds(activeMv.rest);
          const isTimerSet = timerState?.setIdx === i;
          const setDone = !!s.done;
          return (
            <div key={i}>
              <SetRow
                num={i + 1}
                weight={s.w} reps={s.r}
                repsTarget={activeMv.repsTarget ?? null}
                done={setDone}
                color={color}
                onW={v => updateSet(activeEntry.id, activeMv.id, i, "w", v)}
                onR={v => {
                  updateSet(activeEntry.id, activeMv.id, i, "r", v);
                  if (v && String(v) !== "0" && i < activeMv.sets.length - 1) {
                    startTimer(i, restSecs);
                  }
                }}
                onDelete={activeMv.sets.length > 1 ? () => removeSet(activeEntry.id, activeMv.id, i) : null}
                onDone={() => {
                  const ts = s.done ? null : new Date().toISOString();
                  updateSet(activeEntry.id, activeMv.id, i, "done", ts);
                  if (!s.done && i < activeMv.sets.length - 1) {
                    startTimer(i, restSecs);
                  }
                }}
              />
              {i < activeMv.sets.length - 1 && (
                <RestTimer
                  restSecs={restSecs}
                  restLabel={activeMv.rest}
                  color={color}
                  timerState={isTimerSet ? timerState : null}
                  onStart={() => startTimer(i, restSecs)}
                  onPause={pauseTimer}
                  onResume={resumeTimer}
                  onReset={() => resetTimer(restSecs)}
                  onDismiss={dismissTimer}
                />
              )}
            </div>
          );
        })}

        {!showStopwatch && <GhostBtn onClick={() => addSet(activeEntry.id, activeMv.id)}>+ Add Set</GhostBtn>}

        <SectionLabel>Notes</SectionLabel>
        <textarea
          style={noteArea}
          value={activeMv.note}
          onChange={e => updateMovement(activeEntry.id, activeMv.id, { note: e.target.value })}
          placeholder="Form cues, how it felt, adjustments…"
          rows={4}
        />

        {!showStopwatch && (
          <div style={{ padding: "16px 18px 48px" }}>
            {alreadyDone ? (
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => updateMovement(activeEntry.id, activeMv.id, { doneAt: null })}
                  style={{ flex: 1, padding: "13px", borderRadius: 14, background: "transparent", border: "1px solid #1f2937", color: "#4b5563", fontSize: 13, fontFamily: "monospace", fontWeight: 700, cursor: "pointer" }}>
                  ↩ Undo Done
                </button>
                {nextMv && (
                  <button onClick={() => { dismissTimer(); setActiveMvId(nextMv.id); }}
                    style={{ flex: 2, padding: "13px", borderRadius: 14, background: "#111827", border: "1px solid #1f2937", color: "#f9fafb", fontSize: 14, fontFamily: "monospace", fontWeight: 800, cursor: "pointer" }}>
                    Next: {nextMv.name || "Movement"} →
                  </button>
                )}
              </div>
            ) : (
              <button onClick={finishAndAdvance} style={{
                width: "100%", padding: "18px", borderRadius: 16,
                background: isLast
                  ? "linear-gradient(135deg, #4ade80, #22c55e)"
                  : `linear-gradient(135deg, ${color}, ${color}cc)`,
                border: "none", color: "#0a0f0d",
                fontSize: 15, fontWeight: 900, cursor: "pointer",
                fontFamily: "monospace", letterSpacing: 1,
                boxShadow: `0 4px 24px ${color}33`,
              }}>
                {isLast ? "✓ FINISH LAST MOVEMENT" : `✓ DONE · NEXT: ${(nextMv?.name || "Next").toUpperCase()}`}
              </button>
            )}
          </div>
        )}
      </Shell>
    );
  }

  // ── ENTRY DETAIL ──────────────────────────────────────────────────────────
  if (view === "entry" && activeEntry) {
    const prog = activeEntry.programDay ? PROGRAM[activeEntry.programDay] : null;
    const color = prog?.color ?? "#4ade80";
    const isRest = prog?.exercises?.length === 0;

    return (
      <Shell>
        <TopBar
          left={<BackBtn onClick={() => setView("journal")} label="Journal" />}
          right={
            <button onClick={() => deleteEntry(activeEntry.id)}
              style={btnStyle("#7f1d1d", "#f87171")}>Delete</button>
          }
        />
        <div style={{ padding: "4px 18px 0" }}>
          <input type="date" style={{ ...ghostInput, fontSize: 13, color: "#6b7280", marginBottom: 6 }}
            value={activeEntry.date}
            onChange={e => updateEntry(activeEntry.id, { date: e.target.value })} />
          <input style={bigInput} value={activeEntry.customTitle}
            onChange={e => updateEntry(activeEntry.id, { customTitle: e.target.value })}
            placeholder="Workout title…" />
          {prog && (
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              <Pill color={color}>Day {activeEntry.programDay}</Pill>
              <Pill color={color}>{prog.tag}</Pill>
            </div>
          )}
        </div>

        <SectionLabel>Session Notes</SectionLabel>
        <textarea style={noteArea} value={activeEntry.note}
          onChange={e => updateEntry(activeEntry.id, { note: e.target.value })}
          placeholder="How did today feel? Energy, sleep, PRs, anything…" rows={3} />

        {isRest ? (
          <div style={{ margin: "20px 18px", padding: "28px 20px", borderRadius: 16, background: "#111827", border: "1px solid #1f2937", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🌙</div>
            <div style={{ color: "#e5e7eb", fontWeight: 700, fontSize: 18 }}>Rest Day</div>
            <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>Recovery is part of the program</div>
          </div>
        ) : (
          <>
            <SectionLabel>{activeEntry.movements.length} Movement{activeEntry.movements.length !== 1 ? "s" : ""}</SectionLabel>
            {activeEntry.movements.map((mv, i) => {
              const mvDone = !!mv.doneAt;
              const canMoveUp = i > 0;
              const canMoveDown = i < activeEntry.movements.length - 1;
              return (
                <div key={mv.id}>
                  <MvCard color={mvDone ? "#4ade80" : color}
                    onClick={() => { setActiveMvId(mv.id); setView("movement"); setShowStopwatch(false); resetStopwatch(); }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div onClick={e => {
                        e.stopPropagation();
                        const ts = mv.doneAt ? null : new Date().toISOString();
                        updateMovement(activeEntry.id, mv.id, { doneAt: ts });
                      }} style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        background: mvDone ? "#4ade8022" : "#111827",
                        border: `2px solid ${mvDone ? "#4ade80" : "#1f2937"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, cursor: "pointer", transition: "all 0.15s",
                      }}>
                        {mvDone ? "✓" : <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 800, color: "#374151" }}>{mv.programRef ?? String(i + 1)}</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: mvDone ? "#4ade80" : "#f9fafb", lineHeight: 1.3,
                          textDecoration: mvDone ? "line-through" : "none", opacity: mvDone ? 0.7 : 1 }}>
                          {mv.name || <span style={{ color: "#4b5563" }}>Unnamed movement</span>}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>
                          {mv.repsTarget ? `${mv.setsTarget} sets · ${mv.repsTarget} reps` : `${mv.sets.length} sets logged`}
                          {mv.doneAt && <span style={{ color: "#4ade8077", marginLeft: 6 }}>· done {new Date(mv.doneAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
                          {mv.sets.map((s, si) => (
                            <span key={si} style={{
                              fontSize: 11, fontFamily: "monospace",
                              padding: "3px 7px", borderRadius: 6,
                              background: s.r ? `${color}22` : "#1f2937",
                              border: `1px solid ${s.r ? color + "44" : "#374151"}`,
                              color: s.r ? color : "#4b5563", fontWeight: 600,
                            }}>
                              {s.w ? `${s.w}×` : ""}{s.r || "–"}
                            </span>
                          ))}
                        </div>
                      </div>
                      {/* Up/down reorder buttons */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => canMoveUp && reorderMovements(activeEntry.id, i, i - 1)}
                          style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #1f2937", background: canMoveUp ? "#111827" : "transparent", color: canMoveUp ? "#9ca3af" : "#374151", fontSize: 14, cursor: canMoveUp ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>
                          ↑
                        </button>
                        <button
                          onClick={() => canMoveDown && reorderMovements(activeEntry.id, i, i + 1)}
                          style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #1f2937", background: canMoveDown ? "#111827" : "transparent", color: canMoveDown ? "#9ca3af" : "#374151", fontSize: 14, cursor: canMoveDown ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>
                          ↓
                        </button>
                      </div>
                    </div>
                  </MvCard>
                </div>
              );
            })}
            <GhostBtn onClick={() => addMovement(activeEntry.id)}>+ Add Movement</GhostBtn>
          </>
        )}

        {!isRest && (
          <div style={{ padding: "16px 18px 48px" }}>
            {activeEntry.completedAt ? (
              <div style={{ padding: "18px", borderRadius: 16, background: "#0a1f0a", border: "2px solid #4ade8066", textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>🏆</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#4ade80", fontFamily: "monospace" }}>WORKOUT COMPLETE</div>
                <div style={{ fontSize: 12, color: "#4b5563", marginTop: 4, fontFamily: "monospace" }}>
                  {new Date(activeEntry.completedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  {" · "}
                  {activeEntry.movements.filter(m => m.doneAt).length}/{activeEntry.movements.length} movements done
                </div>
                <button onClick={() => updateEntry(activeEntry.id, { completedAt: null })}
                  style={{ marginTop: 10, padding: "6px 16px", borderRadius: 8, background: "transparent", border: "1px solid #1f2937", color: "#4b5563", fontSize: 12, fontFamily: "monospace", cursor: "pointer" }}>
                  Undo
                </button>
              </div>
            ) : (
              <button onClick={() => {
                const ts = new Date().toISOString();
                mutate(prev => prev.map(e => e.id === activeEntry.id
                  ? { ...e, completedAt: ts, movements: e.movements.map(m => m.doneAt ? m : { ...m, doneAt: ts }) }
                  : e));
              }} style={{
                width: "100%", padding: "18px", borderRadius: 16,
                background: "linear-gradient(135deg, #4ade80, #22c55e)",
                border: "none", color: "#0a0f0d",
                fontSize: 16, fontWeight: 900, cursor: "pointer",
                fontFamily: "monospace", letterSpacing: 1,
                boxShadow: "0 4px 24px #4ade8033",
              }}>
                ✓ COMPLETE WORKOUT
              </button>
            )}
          </div>
        )}
      </Shell>
    );
  }

  // ── DATA TAB ─────────────────────────────────────────────────────────────
  if (tab === "data") {
    const sorted_all = [...entries].sort((a, b) => b.date.localeCompare(a.date));
    const filtered = filterDay === null ? sorted_all : sorted_all.filter(e => e.programDay === filterDay);
    const totalSets = entries.reduce((n, e) => n + e.movements.reduce((m, mv) => m + mv.sets.filter(s => s.r).length, 0), 0);
    const totalSessions = entries.length;

    async function handleImport(file) {
      try {
        const { entries: newEntries, weights: newWeights } = await readJSONBackup(file);
        if (!Array.isArray(newEntries)) throw new Error("No entries found in file");
        // Merge: keep existing entries not in backup, add all from backup
        const existingIds = new Set(entries.map(e => String(e.id)));
        const toAdd = newEntries.filter(e => !existingIds.has(String(e.id)));
        const merged = [...entries, ...toAdd].sort((a, b) => b.date.localeCompare(a.date));
        mutate(() => merged);
        if (newWeights.length > 0) {
          const existingWIds = new Set(weightLog.map(w => String(w.id)));
          const wToAdd = newWeights.filter(w => !existingWIds.has(String(w.id)));
          setWeightLog(prev => [...prev, ...wToAdd].sort((a, b) => b.date.localeCompare(a.date)));
        }
        setImportStatus("success");
        setImportMsg(`Imported ${toAdd.length} new session${toAdd.length !== 1 ? "s" : ""}${newWeights.length > 0 ? ` + ${newWeights.length} weight entries` : ""}`);
      } catch (err) {
        setImportStatus("error");
        setImportMsg(err.message || "Import failed");
      }
    }

    return (
      <Shell>
        <div style={{ padding: "52px 18px 20px", background: "linear-gradient(160deg,#0a0f0d 0%,#0f1a12 100%)" }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#374151", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 4 }}>Backup & History</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: "#f9fafb", lineHeight: 1, fontFamily: "'Georgia', serif", fontStyle: "italic" }}>Data</div>
          <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
            <div><div style={{ fontSize: 22, fontWeight: 900, color: "#4ade80", fontFamily: "monospace" }}>{totalSessions}</div><div style={{ fontSize: 10, color: "#4b5563", letterSpacing: 1, textTransform: "uppercase", fontFamily: "monospace" }}>Sessions</div></div>
            <div><div style={{ fontSize: 22, fontWeight: 900, color: "#60a5fa", fontFamily: "monospace" }}>{totalSets}</div><div style={{ fontSize: 10, color: "#4b5563", letterSpacing: 1, textTransform: "uppercase", fontFamily: "monospace" }}>Sets Logged</div></div>
            <div><div style={{ fontSize: 22, fontWeight: 900, color: "#f97316", fontFamily: "monospace" }}>{weightLog.length}</div><div style={{ fontSize: 10, color: "#4b5563", letterSpacing: 1, textTransform: "uppercase", fontFamily: "monospace" }}>Weigh-ins</div></div>
          </div>
        </div>

        {/* Export / Import */}
        <div style={{ padding: "16px 18px 8px" }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "#374151", textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700, marginBottom: 10 }}>Backup</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <button onClick={() => downloadJSON(entries, weightLog)} style={{ flex: 1, padding: "13px", borderRadius: 14, background: "#0a1f0a", border: "1.5px solid #4ade8044", color: "#4ade80", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "monospace" }}>
              ↓ Export JSON
            </button>
            <button onClick={() => downloadCSV(entries, weightLog)} style={{ flex: 1, padding: "13px", borderRadius: 14, background: "#0a0f1a", border: "1.5px solid #60a5fa44", color: "#60a5fa", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "monospace" }}>
              ↓ Export CSV
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept=".json" style={{ display: "none" }}
            onChange={e => { if (e.target.files[0]) handleImport(e.target.files[0]); e.target.value = ""; }} />
          <button onClick={() => { setImportStatus(null); fileInputRef.current?.click(); }}
            style={{ width: "100%", padding: "13px", borderRadius: 14, background: "#1a1200", border: "1.5px solid #fbbf2444", color: "#fbbf24", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "monospace" }}>
            ↑ Import JSON Backup
          </button>
          {importStatus && (
            <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, background: importStatus === "success" ? "#0a1f0a" : "#1a0a0a", border: `1px solid ${importStatus === "success" ? "#4ade8044" : "#f8717144"}`, color: importStatus === "success" ? "#4ade80" : "#f87171", fontSize: 13, fontFamily: "monospace" }}>
              {importStatus === "success" ? "✓ " : "✕ "}{importMsg}
            </div>
          )}
        </div>

        {/* Filter by day */}
        <div style={{ padding: "8px 18px 4px" }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "#374151", textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700, marginBottom: 8 }}>Session History · {filtered.length} shown</div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
            <button onClick={() => setFilterDay(null)} style={{ flexShrink: 0, padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "monospace", fontSize: 11, fontWeight: 700, background: filterDay === null ? "#4ade80" : "#1f2937", color: filterDay === null ? "#0a0f0d" : "#6b7280" }}>All</button>
            {Object.entries(PROGRAM).filter(([,d]) => d.exercises.length > 0).map(([dn, d]) => (
              <button key={dn} onClick={() => setFilterDay(filterDay === Number(dn) ? null : Number(dn))}
                style={{ flexShrink: 0, padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "monospace", fontSize: 11, fontWeight: 700, background: filterDay === Number(dn) ? d.color : "#1f2937", color: filterDay === Number(dn) ? "#0a0f0d" : d.color }}>
                Day {dn}
              </button>
            ))}
          </div>
        </div>

        {/* History list */}
        <div style={{ padding: "4px 18px 100px" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "#374151", fontSize: 13, fontFamily: "monospace" }}>No sessions found</div>
          ) : filtered.map(entry => {
            const prog = entry.programDay ? PROGRAM[entry.programDay] : null;
            const color = prog?.color ?? "#4b5563";
            const expanded = expandedId === entry.id;
            const entryProg = entry.programDay ? PROGRAM[entry.programDay] : null;
            const entryColor = entryProg?.color ?? "#4ade80";
            const totalVol = entry.movements.reduce((n, mv) =>
              n + mv.sets.reduce((s, set) => s + (parseFloat(set.w)||0) * (parseFloat(set.r)||0), 0), 0);
            return (
              <div key={entry.id} style={{ marginBottom: 8, borderRadius: 14, overflow: "hidden", background: "#0d1117", border: `1.5px solid ${expanded ? color + "66" : "#1f2937"}` }}>
                <div style={{ height: 3, background: prog ? color : "#1f2937" }} />
                <div onClick={() => setExpandedId(expanded ? null : entry.id)}
                  style={{ padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "monospace", letterSpacing: 1, marginBottom: 2 }}>
                      {fmtDate(entry.date)}{entry.programDay ? ` · DAY ${entry.programDay}` : ""}
                      {entry.completedAt && <span style={{ color: "#4ade80", marginLeft: 6 }}>✓</span>}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#f9fafb" }}>{entry.customTitle || "Custom Session"}</div>
                    <div style={{ fontSize: 11, color: "#4b5563", fontFamily: "monospace", marginTop: 2 }}>
                      {entry.movements.length} movements
                      {totalVol > 0 && <span style={{ color: "#6b7280", marginLeft: 8 }}>{Math.round(totalVol).toLocaleString()} lbs total vol</span>}
                    </div>
                  </div>
                  <div style={{ color: "#374151", fontSize: 14, fontFamily: "monospace", transition: "transform 0.2s", transform: expanded ? "rotate(90deg)" : "none" }}>›</div>
                </div>
                {expanded && (
                  <div style={{ borderTop: "1px solid #1f2937", padding: "10px 14px 14px" }}>
                    {entry.note && <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10, fontStyle: "italic" }}>{entry.note}</div>}
                    {entry.movements.map(mv => (
                      <div key={mv.id} style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", marginBottom: 4, fontFamily: "monospace" }}>
                          {mv.programRef ? `${mv.programRef}. ` : ""}{mv.name}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          {mv.sets.map((s, si) => (
                            <span key={si} style={{ fontSize: 11, fontFamily: "monospace", padding: "3px 8px", borderRadius: 6, background: s.r ? entryColor + "22" : "#1f2937", border: `1px solid ${s.r ? entryColor + "44" : "#374151"}`, color: s.r ? entryColor : "#4b5563" }}>
                              {s.w ? `${s.w}×` : "BW×"}{s.r || "–"}
                            </span>
                          ))}
                          {mv.note && <span style={{ fontSize: 10, color: "#4b5563", fontStyle: "italic", alignSelf: "center", marginLeft: 4 }}>{mv.note}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <BottomNav tab={tab} setTab={setTab} />
      </Shell>
    );
  }

  // ── WEIGHT TRACKER ────────────────────────────────────────────────────────
  if (tab === "weight") {
    const sorted_w = [...weightLog].sort((a, b) => b.date.localeCompare(a.date));
    const chartData = [...weightLog].sort((a, b) => a.date.localeCompare(b.date));
    const vals = chartData.map(w => parseFloat(w.weight));
    const minV = vals.length ? Math.min(...vals) : 0;
    const maxV = vals.length ? Math.max(...vals) : 1;
    const range = maxV - minV || 1;
    const latest = sorted_w[0];
    const prev = sorted_w[1];
    const diff = latest && prev ? (parseFloat(latest.weight) - parseFloat(prev.weight)).toFixed(1) : null;
    const totalDiff = sorted_w.length > 1
      ? (parseFloat(sorted_w[0].weight) - parseFloat(sorted_w[sorted_w.length - 1].weight)).toFixed(1)
      : null;
    function addWeight() {
      if (!weightInput || isNaN(parseFloat(weightInput))) return;
      const entry = { id: Date.now(), date: weightDate, weight: weightInput, unit: weightUnit, note: "" };
      setWeightLog(prev => [entry, ...prev.filter(w => w.date !== weightDate)]);
      setWeightInput("");
      setShowWeightForm(false);
    }
    const CHART_H = 140, CHART_W = 340;
    return (
      <Shell>
        <div style={{ padding: "52px 18px 16px", background: "linear-gradient(160deg,#0a0f0d 0%,#0f1a12 100%)" }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#374151", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 4 }}>Body Weight</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: "#f9fafb", lineHeight: 1, fontFamily: "'Georgia', serif", fontStyle: "italic" }}>Weight Tracker</div>
          {latest && (
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 8 }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: "#4ade80", fontFamily: "monospace" }}>{latest.weight}</span>
              <span style={{ fontSize: 16, color: "#4b5563", fontFamily: "monospace" }}>{latest.unit}</span>
              {diff !== null && (
                <span style={{ fontSize: 14, fontFamily: "monospace", fontWeight: 700, color: parseFloat(diff) < 0 ? "#4ade80" : parseFloat(diff) > 0 ? "#f87171" : "#6b7280" }}>
                  {parseFloat(diff) > 0 ? "+" : ""}{diff} vs last
                </span>
              )}
            </div>
          )}
          {totalDiff !== null && (
            <div style={{ fontSize: 12, color: "#4b5563", fontFamily: "monospace", marginTop: 4 }}>
              Total change: {parseFloat(totalDiff) > 0 ? "+" : ""}{totalDiff} {sorted_w[0]?.unit} over {weightLog.length} entries
            </div>
          )}
        </div>
        {chartData.length >= 2 && (
          <div style={{ margin: "16px 18px 0", padding: "16px", borderRadius: 16, background: "#0d1117", border: "1px solid #1f2937", overflowX: "auto" }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: "#374151", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 10 }}>Progress</div>
            <svg width="100%" viewBox={`0 0 ${CHART_W} ${CHART_H + 20}`} style={{ display: "block", overflow: "visible" }}>
              {[0, 0.25, 0.5, 0.75, 1].map(p => {
                const y = CHART_H - p * CHART_H;
                const val = (minV + p * range).toFixed(1);
                return (
                  <g key={p}>
                    <line x1="30" y1={y} x2={CHART_W} y2={y} stroke="#1f2937" strokeWidth="1" strokeDasharray="3,4" />
                    <text x="26" y={y + 4} fontSize="9" fill="#374151" textAnchor="end" fontFamily="monospace">{val}</text>
                  </g>
                );
              })}
              {vals.length >= 2 && (
                <polyline
                  points={vals.map((v, i) => {
                    const x = 30 + (i / (vals.length - 1)) * (CHART_W - 30);
                    const y = CHART_H - ((v - minV) / range) * CHART_H;
                    return `${x},${y}`;
                  }).join(" ")}
                  fill="none" stroke="#4ade80" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
                />
              )}
              {vals.map((v, i) => {
                const x = 30 + (i / Math.max(vals.length - 1, 1)) * (CHART_W - 30);
                const y = CHART_H - ((v - minV) / range) * CHART_H;
                return <circle key={i} cx={x} cy={y} r="3.5" fill="#4ade80" stroke="#0d1117" strokeWidth="1.5" />;
              })}
            </svg>
          </div>
        )}
        <div style={{ padding: "14px 18px 4px" }}>
          <button onClick={() => { setWeightDate(todayStr()); setWeightInput(""); setShowWeightForm(true); }}
            style={{ width: "100%", padding: "14px", borderRadius: 14, background: "#4ade80", border: "none", color: "#0a0f0d", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "monospace" }}>
            + LOG WEIGHT
          </button>
        </div>
        <div style={{ padding: "8px 18px 4px" }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "#374151", textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700 }}>History · {weightLog.length} entries</div>
        </div>
        {sorted_w.length === 0 ? (
          <div style={{ margin: "20px 18px", padding: "32px 20px", borderRadius: 16, background: "#0d1117", border: "1px solid #1f2937", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⚖️</div>
            <div style={{ color: "#6b7280", fontSize: 14 }}>No weight entries yet</div>
          </div>
        ) : (
          <div style={{ padding: "4px 18px 100px" }}>
            {sorted_w.map((w, i) => {
              const prevW = sorted_w[i + 1];
              const d = prevW ? (parseFloat(w.weight) - parseFloat(prevW.weight)).toFixed(1) : null;
              return (
                <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, background: "#0d1117", border: "1px solid #1f2937", marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "#4b5563", fontFamily: "monospace" }}>{fmtDate(w.date)}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 22, fontWeight: 900, color: "#f9fafb", fontFamily: "monospace" }}>{w.weight}</span>
                      <span style={{ fontSize: 12, color: "#4b5563", fontFamily: "monospace" }}>{w.unit}</span>
                      {d !== null && (
                        <span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: parseFloat(d) < 0 ? "#4ade80" : parseFloat(d) > 0 ? "#f87171" : "#6b7280" }}>
                          {parseFloat(d) > 0 ? "+" : ""}{d}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setWeightLog(prev => prev.filter(x => x.id !== w.id))}
                    style={{ width: 30, height: 30, borderRadius: 8, background: "#1a0a0a", border: "1px solid #3b1515", color: "#dc2626", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                </div>
              );
            })}
          </div>
        )}
        {showWeightForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-end", zIndex: 100 }}
            onClick={() => setShowWeightForm(false)}>
            <div style={{ background: "#0d1117", width: "100%", borderRadius: "24px 24px 0 0", padding: "24px 18px 48px", border: "1.5px solid #1f2937", borderBottom: "none" }}
              onClick={e => e.stopPropagation()}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "#374151", margin: "0 auto 20px" }} />
              <div style={{ fontSize: 18, fontWeight: 800, color: "#f9fafb", marginBottom: 16, fontFamily: "monospace" }}>Log Weight</div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Date</label>
                <input type="date" style={modalInput} value={weightDate} onChange={e => setWeightDate(e.target.value)} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={labelStyle}>Weight</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["lbs", "kg"].map(u => (
                      <button key={u} onClick={() => setWeightUnit(u)} style={{ padding: "4px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "monospace", fontSize: 12, fontWeight: 700, background: weightUnit === u ? "#4ade80" : "#1f2937", color: weightUnit === u ? "#0a0f0d" : "#6b7280" }}>{u}</button>
                    ))}
                  </div>
                </div>
                <input type="number" inputMode="decimal" style={{ ...modalInput, fontSize: 28, fontWeight: 900, textAlign: "center", padding: "14px" }}
                  value={weightInput} onChange={e => setWeightInput(e.target.value)} placeholder="0.0" autoFocus />
              </div>
              <button onClick={addWeight} style={{ width: "100%", padding: "15px", borderRadius: 14, background: "#4ade80", border: "none", color: "#0a0f0d", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "monospace" }}>
                SAVE →
              </button>
            </div>
          </div>
        )}
        <BottomNav tab={tab} setTab={setTab} />
      </Shell>
    );
  }

  // ── JOURNAL HOME ──────────────────────────────────────────────────────────
  return (
    <Shell>
      <div style={{ padding: "52px 18px 20px", background: "linear-gradient(160deg,#0a0f0d 0%,#0f1a12 100%)" }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#374151", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 4 }}>Training Journal</div>
        <div style={{ fontSize: 30, fontWeight: 900, color: "#f9fafb", lineHeight: 1, fontFamily: "'Georgia', serif", fontStyle: "italic" }}>My Workouts</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
          <div style={{ fontSize: 13, color: "#4b5563" }}>{entries.length} session{entries.length !== 1 ? "s" : ""} logged</div>
          <button onClick={() => setTab("data")}
            style={{ padding: "4px 12px", borderRadius: 8, background: "transparent", border: "1px solid #1f2937", color: "#4b5563", fontSize: 11, fontFamily: "monospace", fontWeight: 700, cursor: "pointer" }}>
            🗄️ Data
          </button>
        </div>
      </div>

      <div style={{ padding: "12px 0 4px" }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: "#374151", textTransform: "uppercase", fontFamily: "monospace", padding: "0 18px", marginBottom: 8 }}>Program Days</div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "2px 18px 8px", scrollbarWidth: "none" }}>
          {Object.entries(PROGRAM).map(([dn, d]) => (
            <div key={dn} style={{ flexShrink: 0, padding: "8px 12px", borderRadius: 12, background: "#111827", border: `1.5px solid ${d.color}33`, cursor: "pointer", minWidth: 60, textAlign: "center" }}
              onClick={() => { setNewProgramDay(Number(dn)); setNewDate(todayStr()); setShowNewModal(true); }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: d.color, fontFamily: "monospace" }}>{dn}</div>
              <div style={{ fontSize: 9, letterSpacing: 1.5, color: "#4b5563", textTransform: "uppercase", marginTop: 2 }}>{d.tag}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "4px 18px 8px" }}>
        <button onClick={() => { setNewProgramDay(null); setNewDate(todayStr()); setShowNewModal(true); }}
          style={{ width: "100%", padding: "14px", borderRadius: 14, background: "#4ade80", border: "none", color: "#0a0f0d", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "monospace", letterSpacing: 1 }}>
          + LOG TODAY'S SESSION
        </button>
      </div>

      {sorted.length === 0 ? (
        <div style={{ margin: "40px 18px", textAlign: "center", color: "#374151" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#6b7280" }}>No sessions yet</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Tap a program day above or log a new session</div>
        </div>
      ) : (
        <div style={{ padding: "4px 18px 100px" }}>
          {sorted.map(entry => {
            const prog = entry.programDay ? PROGRAM[entry.programDay] : null;
            const color = prog?.color ?? "#4b5563";
            const isRest = prog?.exercises?.length === 0;
            const mvDone = entry.movements.filter(m => m.sets.some(s => s.r)).length;
            return (
              <div key={entry.id}
                onClick={() => { setActiveId(entry.id); setView("entry"); }}
                style={{ marginBottom: 12, borderRadius: 18, overflow: "hidden", background: "#0d1117", border: `1.5px solid #1f2937`, cursor: "pointer" }}>
                <div style={{ height: 4, background: isRest ? "#1f2937" : color }} />
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: "#4b5563", fontFamily: "monospace", letterSpacing: 1, marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}>
                        {fmtDate(entry.date)}{prog ? ` · DAY ${entry.programDay}` : ""}
                        {entry.completedAt && <span style={{ color: "#4ade80", fontWeight: 800 }}>✓</span>}
                      </div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: "#f9fafb", lineHeight: 1.2 }}>{entry.customTitle || "Untitled Session"}</div>
                      {entry.note ? (
                        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 5, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{entry.note}</div>
                      ) : null}
                    </div>
                    <div style={{ fontSize: 20, color: "#1f2937" }}>›</div>
                  </div>
                  {!isRest && entry.movements.length > 0 && (
                    <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {entry.movements.slice(0, 5).map(mv => (
                        <span key={mv.id} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 7, background: "#111827", border: "1px solid #1f2937", color: "#6b7280", fontFamily: "monospace" }}>
                          {mv.programRef ? `${mv.programRef}. ` : ""}{mv.name || "–"}
                        </span>
                      ))}
                      {entry.movements.length > 5 && (
                        <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 7, background: "#111827", border: "1px solid #1f2937", color: "#4b5563" }}>
                          +{entry.movements.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                  {!isRest && (
                    <div style={{ marginTop: 8, fontSize: 11, color: "#4b5563", fontFamily: "monospace" }}>
                      {entry.movements.length} movement{entry.movements.length !== 1 ? "s" : ""}
                      {mvDone > 0 && ` · ${mvDone} logged`}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showNewModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-end", zIndex: 100 }}
          onClick={() => setShowNewModal(false)}>
          <div style={{ background: "#0d1117", width: "100%", borderRadius: "24px 24px 0 0", padding: "24px 18px 44px", border: "1.5px solid #1f2937", borderBottom: "none", boxSizing: "border-box", overflow: "hidden" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "#374151", margin: "0 auto 20px" }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: "#f9fafb", marginBottom: 16, fontFamily: "monospace" }}>Log Session</div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Date</label>
              <div style={{ position: "relative" }}>
                <div style={{ ...modalInput, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                  <span>{newDate ? new Date(newDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "Select date"}</span>
                  <span style={{ fontSize: 11, color: "#6b7280" }}>tap to change</span>
                </div>
                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                  style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }} />
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Program Day (optional)</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                <div onClick={() => setNewProgramDay(null)} style={{ padding: "7px 14px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "monospace", background: newProgramDay === null ? "#4ade80" : "#111827", color: newProgramDay === null ? "#0a0f0d" : "#6b7280", border: `1.5px solid ${newProgramDay === null ? "#4ade80" : "#1f2937"}` }}>Custom</div>
                {Object.entries(PROGRAM).map(([dn, d]) => (
                  <div key={dn} onClick={() => setNewProgramDay(Number(dn))} style={{ padding: "7px 14px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "monospace", background: newProgramDay === Number(dn) ? d.color : "#111827", color: newProgramDay === Number(dn) ? "#0a0f0d" : d.color, border: `1.5px solid ${newProgramDay === Number(dn) ? d.color : d.color + "33"}` }}>Day {dn}</div>
                ))}
              </div>
              {newProgramDay && (() => {
                const last = getLastSession(entries, newProgramDay);
                return (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 12, color: "#4b5563", fontFamily: "monospace" }}>→ {PROGRAM[newProgramDay].title} · {PROGRAM[newProgramDay].exercises.length} exercises pre-loaded</div>
                    {last ? (
                      <div style={{ fontSize: 12, color: "#4ade8077", fontFamily: "monospace", marginTop: 4 }}>✓ Last session {fmtDate(last.date)} · weights carried forward</div>
                    ) : (
                      <div style={{ fontSize: 12, color: "#374151", fontFamily: "monospace", marginTop: 4 }}>No previous session found · sets will start blank</div>
                    )}
                  </div>
                );
              })()}
            </div>
            <button onClick={createEntry} style={{ width: "100%", padding: "15px", borderRadius: 14, background: "#4ade80", border: "none", color: "#0a0f0d", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "monospace" }}>
              CREATE SESSION →
            </button>
          </div>
        </div>
      )}
      <BottomNav tab={tab} setTab={setTab} />
    </Shell>
  );
}

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────
function RestTimer({ restSecs, restLabel, color, timerState, onStart, onPause, onResume, onReset, onDismiss }) {
  const active = timerState && (timerState.running || timerState.remaining < timerState.total);
  const remaining = timerState?.remaining ?? restSecs;
  const total = timerState?.total ?? restSecs;
  const running = timerState?.running ?? false;
  const done = timerState?.done ?? false;
  const pct = total > 0 ? remaining / total : 1;
  const R = 22, circ = 2 * Math.PI * R;
  const dash = circ * pct;
  const mins = Math.floor(remaining / 60), secs = remaining % 60;
  const timeStr = mins > 0 ? `${mins}:${String(secs).padStart(2, "0")}` : `${secs}s`;
  return (
    <div style={{ margin: "2px 18px 8px", padding: "10px 14px", borderRadius: 14, background: done ? "#0a1f0a" : "#0a0f0d", border: `1px solid ${done ? color + "66" : "#1f2937"}`, display: "flex", alignItems: "center", gap: 12, transition: "background 0.3s, border-color 0.3s" }}>
      <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0 }}>
        <svg width="52" height="52" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="26" cy="26" r={R} fill="none" stroke="#1f2937" strokeWidth="3" />
          <circle cx="26" cy="26" r={R} fill="none" stroke={done ? color : running ? color : "#374151"} strokeWidth="3" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.9s linear, stroke 0.3s" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: remaining >= 60 ? 11 : 13, fontWeight: 800, fontFamily: "monospace", color: done ? color : running ? "#f9fafb" : "#4b5563" }}>
          {done ? "✓" : timeStr}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "monospace", color: done ? color : "#4b5563", fontWeight: 700, marginBottom: 6 }}>
          {done ? "Rest complete" : `Rest · ${restLabel}`}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {!active && !done && <button onClick={onStart} style={timerBtn(color, true)}>▶ Start</button>}
          {active && running && <button onClick={onPause} style={timerBtn("#374151", false)}>⏸ Pause</button>}
          {active && !running && !done && <button onClick={onResume} style={timerBtn(color, true)}>▶ Resume</button>}
          {active && <button onClick={onReset} style={timerBtn("#1f2937", false)}>↺</button>}
          {done && <button onClick={onDismiss} style={timerBtn(color, true)}>Next set →</button>}
        </div>
      </div>
    </div>
  );
}
function timerBtn(bg, bright) {
  return { padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: bg, color: bright ? "#0a0f0d" : "#9ca3af", fontSize: 12, fontWeight: 700, fontFamily: "monospace" };
}
function BottomNav({ tab, setTab }) {
  const tabs = [{ id: "journal", label: "Journal", icon: "📋" }, { id: "weight", label: "Weight", icon: "⚖️" }, { id: "data", label: "Data", icon: "🗄️" }];
  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#0d1117", borderTop: "1px solid #1f2937", display: "flex", padding: "8px 0 24px", zIndex: 50 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "6px 0" }}>
          <span style={{ fontSize: 20 }}>{t.icon}</span>
          <span style={{ fontSize: 10, letterSpacing: 1.5, fontFamily: "monospace", textTransform: "uppercase", color: tab === t.id ? "#4ade80" : "#374151", fontWeight: tab === t.id ? 800 : 500 }}>{t.label}</span>
          {tab === t.id && <div style={{ width: 18, height: 2, borderRadius: 1, background: "#4ade80" }} />}
        </button>
      ))}
    </div>
  );
}
function Shell({ children }) {
  return <div style={{ background: "#080c0a", minHeight: "100vh", color: "#f9fafb", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", maxWidth: 430, margin: "0 auto", overflowX: "hidden" }}>{children}</div>;
}
function TopBar({ left, right }) {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "52px 18px 8px" }}>{left}{right}</div>;
}
function BackBtn({ onClick, label }) {
  return <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", color: "#4ade80", fontSize: 15, fontWeight: 700, padding: 0, fontFamily: "monospace", display: "flex", alignItems: "center", gap: 4 }}>← {label}</button>;
}
function SectionLabel({ children }) {
  return <div style={{ padding: "16px 18px 6px", fontSize: 11, letterSpacing: 2, color: "#374151", textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700 }}>{children}</div>;
}
function Pill({ color, children }) {
  return <span style={{ padding: "4px 12px", borderRadius: 20, background: color + "22", border: `1px solid ${color}44`, fontSize: 12, fontWeight: 700, color, fontFamily: "monospace" }}>{children}</span>;
}
function MvCard({ children, color, onClick }) {
  return <div onClick={onClick} style={{ margin: "0 18px 10px", padding: "14px 16px", borderRadius: 16, background: "#0d1117", border: `1.5px solid #1f2937`, cursor: "pointer" }}>{children}</div>;
}
function GhostBtn({ onClick, children }) {
  return <button onClick={onClick} style={{ display: "block", width: "calc(100% - 36px)", margin: "4px 18px", padding: "13px", borderRadius: 14, background: "transparent", border: "1.5px dashed #1f2937", color: "#374151", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "monospace" }}>{children}</button>;
}

// CHANGE 2: Fixed rep feedback — below range = go lighter, above = go heavier
function SetRow({ num, weight, reps, repsTarget, done, color, onW, onR, onDelete, onDone }) {
  const repRange = (() => {
    if (!repsTarget) return null;
    const m = repsTarget.match(/(\d+)\s*[–\-]\s*(\d+)/);
    if (m) return { min: parseInt(m[1]), max: parseInt(m[2]) };
    const single = repsTarget.match(/^(\d+)/);
    if (single) return { min: parseInt(single[1]), max: parseInt(single[1]) };
    return null;
  })();
  const repVal = parseFloat(reps);
  const inRange = repRange && !isNaN(repVal) && repVal >= repRange.min && repVal <= repRange.max;
  // FIXED: below range = weight too heavy → go lighter; above range = weight too easy → go heavier
  const belowRange = repRange && !isNaN(repVal) && repVal < repRange.min;  // couldn't get min reps = too heavy
  const aboveRange = repRange && !isNaN(repVal) && repVal > repRange.max;  // got more than max = too light

  return (
    <div style={{ margin: "0 18px 4px", padding: "12px 14px", borderRadius: 14, background: done ? "#0a1a10" : "#0d1117", border: `1px solid ${done ? color + "44" : "#1f2937"}`, display: "flex", alignItems: "center", gap: 10, transition: "background 0.2s, border-color 0.2s", opacity: done ? 0.75 : 1 }}>
      <div style={{ width: 26, height: 26, borderRadius: 7, background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#4b5563", fontFamily: "monospace", flexShrink: 0 }}>{num}</div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        <div style={{ fontSize: 10, letterSpacing: 1.5, color: "#374151", textTransform: "uppercase", fontFamily: "monospace" }}>Weight</div>
        <input type="number" inputMode="decimal" value={weight} onChange={e => onW(e.target.value)} placeholder="0" style={setInput(color)} />
        <div style={{ fontSize: 10, color: "#374151", fontFamily: "monospace" }}>kg</div>
      </div>
      <div style={{ color: "#1f2937", fontSize: 16, fontWeight: 300 }}>×</div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        <div style={{ fontSize: 10, letterSpacing: 1.5, color: "#374151", textTransform: "uppercase", fontFamily: "monospace" }}>
          Reps{repRange ? ` ${repRange.min}–${repRange.max}` : ""}
        </div>
        <input type="number" inputMode="numeric" value={reps} onChange={e => onR(e.target.value)}
          placeholder={repRange ? `${repRange.min}–${repRange.max}` : "0"}
          style={{ ...setInput(color), borderColor: inRange ? color : belowRange ? "#f97316" : aboveRange ? "#60a5fa" : undefined }} />
        <div style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, color: inRange ? color : belowRange ? "#f97316" : aboveRange ? "#60a5fa" : "#374151" }}>
          {inRange ? "✓ in range" : belowRange ? "↑ go heavier" : aboveRange ? "↓ go lighter" : "reps"}
        </div>
      </div>
      <button onClick={onDone} style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: done ? color : "#111827", border: `2px solid ${done ? color : "#1f2937"}`, color: done ? "#0a0f0d" : "#374151", fontSize: done ? 18 : 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", fontWeight: 900 }}>✓</button>
      {onDelete && (
        <button onClick={onDelete} style={{ width: 28, height: 28, borderRadius: 8, background: "#1a0a0a", border: "1px solid #3b1515", color: "#dc2626", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
      )}
    </div>
  );
}

function setInput(color) {
  return { width: "100%", background: "#111827", border: `1.5px solid #1f2937`, borderRadius: 10, padding: "8px 6px", fontSize: 20, fontWeight: 800, color: "#f9fafb", textAlign: "center", outline: "none", WebkitAppearance: "none", fontFamily: "monospace" };
}
const bigInput = { width: "100%", background: "transparent", border: "none", borderBottom: "1.5px solid #1f2937", padding: "6px 0", fontSize: 22, fontWeight: 800, color: "#f9fafb", outline: "none", fontFamily: "'Georgia', serif", fontStyle: "italic", boxSizing: "border-box" };
const ghostInput = { width: "100%", background: "transparent", border: "none", padding: "4px 0", outline: "none", fontFamily: "monospace", boxSizing: "border-box", color: "#6b7280" };
const noteArea = { width: "calc(100% - 36px)", margin: "0 18px", background: "#0d1117", border: "1.5px solid #1f2937", borderRadius: 14, padding: "12px 14px", fontSize: 14, color: "#d1d5db", outline: "none", resize: "none", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, boxSizing: "border-box" };
const modalInput = { width: "100%", background: "#111827", border: "1.5px solid #1f2937", borderRadius: 10, padding: "11px 14px", fontSize: 15, color: "#f9fafb", outline: "none", fontFamily: "monospace", boxSizing: "border-box" };
const labelStyle = { fontSize: 11, letterSpacing: 2, color: "#4b5563", textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700 };
function btnStyle(bg, text) {
  return { padding: "7px 14px", borderRadius: 10, background: bg, border: "none", color: text, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "monospace" };
}
