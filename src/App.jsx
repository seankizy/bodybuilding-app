import { useState, useEffect, useRef } from "react";
import { Camera, Check, ChevronLeft, ChevronRight, ClipboardList, Dumbbell, Flame, Moon, Pencil, Play, Plus, Scale, Search, Trophy, Utensils, X } from "./icons.jsx";
import { C, LAKE, SANS, MONO, STONE, INK, fill, inkOn, TITLE, HERO, shadow } from "./theme.js";
import { BLOCK_START, COACH_NOTES, COACH_SINCE, COACH_TARGETS, GYM_SUBS, LOCATIONS, MESO_LENGTH, PROGRAM, canonName, coachOrder, libFind, loggedSince, nameKey, programExFor, resolveExercise, saveSetOverride, searchLibrary } from "./program.js";
import { buildSwappedMovement, lastMovementByName, migrateNames } from "./lib/movements.js";
import { fmtDate, localDateStr, newEntry, newMovement, restToSeconds, todayStr } from "./lib/utils.js";
import { apiFetch, appHeaders, backupFromStorage, daysSinceBackup, downloadCSV, downloadJSON, getLastSession, isMacroOnlyBackup, loadEntries, loadWeights, readJSONBackup, saveBackupFile, saveEntries, saveWeights } from "./lib/storage.js";
import { CYCLE_DAYS, READINESS_SLEEP, READINESS_SORE, READINESS_TEXT, VOLUME_LANDMARKS, allMovementNames, applyReadiness, bestSetForMovement, collectSessionPRs, cycleVolume, detailedPRForMovement, detectPlateau, estimateOneRM, getPersonalRecords, isNewPR, movementHistory, prForecast, pushPullBalance, readinessLevel, segmentPastCycles, sessionHeatmap, suggestProgression, suggestSetCount, volumeStatus } from "./lib/training.js";
import { downloadCoachPDF } from "./lib/coachReport.js";
import { addDays, checkinSchedule, daysBetween, surplusAdvice, weightTrend } from "./lib/checkins.js";
import { buildDailyBrief, todayPlan } from "./lib/dailyBrief.js";
import { mesocycleWeek } from "./lib/mesocycle.js";
import { driveListPhotos } from "./lib/photos.js";
import { backupToDrive, driveConnect, fetchDriveBackup, fmtLastBackup, listDriveBackups, useAutoDriveBackup, useDriveStatus } from "./lib/driveBackup.js";
import { cueFor, deloadNow, deloadNutrition, deloadPlanFor, deloadStatus, loadDeload, nextBlockTarget, nextCycleStart, saveDeload, scheduleDeload } from "./lib/deload.js";
import { CueLine, DeloadBanner, DeloadPlanLine, DeloadToday } from "./components/Deload.jsx";
import { DEFAULT_MACRO_TARGETS, dayTotals, extractMacroTargets, loadMacroTargets, loadMacros, macroCals, migrateMacroBackup, saveMacroTargetsLS, saveMacrosLS } from "./lib/macros.js";
import { RestTimer } from "./components/RestTimer.jsx";
import { MacroChefModal } from "./components/MacroChefModal.jsx";
import { CompletionSummary } from "./components/CompletionSummary.jsx";
import { BottomNav, MoreMenu, ResumeBar } from "./components/Nav.jsx";
import { FoodSearchSheet } from "./components/FoodSearchSheet.jsx";
import { DailyBrief } from "./components/DailyBrief.jsx";
import { PhotoWeightCaption, SliderCompare } from "./components/PhotoCompare.jsx";
import { BackBtn, GhostBtn, MvCard, Pill, SectionLabel, Shell, SwapSheet, TopBar, WarmupItem } from "./components/ui.jsx";
import { SetRow } from "./components/SetRow.jsx";
import { bigInput, btnStyle, ghostInput, labelStyle, modalInput, noteArea } from "./components/styles.js";

// ── MAIN APP ──────────────────────────────────────────────────────────────────
// Shows the daily brief on top of the app. The app itself reports when a brief
// is due (first open each day, or coming back to it on a new day).
export default function App() {
  const [brief, setBrief] = useState(null);
  useAutoDriveBackup();
  return (
    <>
      <AppInner onBrief={setBrief} />
      <BackupNudge />
      <DeloadBanner />
      {brief && (
        <DailyBrief brief={brief} onClose={() => {
          try { localStorage.setItem("wj_brief_seen", brief.today); } catch {}
          setBrief(null);
        }} />
      )}
    </>
  );
}

function BackupNudge() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const check = () => {
      let snoozed = null, hasData = false;
      try {
        snoozed = localStorage.getItem("wj_backup_snooze");
        hasData = (JSON.parse(localStorage.getItem("wj_entries") || "[]") || []).length > 0;
      } catch {}
      setShow(hasData && daysSinceBackup() >= 7 && snoozed !== todayStr());
    };
    check();
    const onVis = () => { if (document.visibilityState === "visible") check(); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);
  if (!show) return null;
  const days = daysSinceBackup();
  return (
    <div style={{ position: "fixed", top: "calc(env(safe-area-inset-top) + 10px)", left: "50%", transform: "translateX(-50%)", width: "calc(100% - 36px)", maxWidth: 394, background: "#161616", borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, zIndex: 60, boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${LAKE.sky}33`, fontFamily: SANS }}>
      <div style={{ flex: 1, fontSize: 12, color: C.text }}>
        {days === Infinity ? "Your journal has never been backed up." : `Last backup ${Math.floor(days)} days ago.`} Save a copy to Drive.
      </div>
      <button onClick={async () => { if (await backupToDrive({ force: true }) || await saveBackupFile(backupFromStorage())) setShow(false); }} style={{ padding: "7px 12px", borderRadius: 10, border: "none", background: STONE.primary, color: C.ink, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>Back up</button>
      <button onClick={() => { try { localStorage.setItem("wj_backup_snooze", todayStr()); } catch {} setShow(false); }} style={{ width: 26, height: 26, borderRadius: 8, background: C.surface3, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <X size={13} color={C.textMid} strokeWidth={2.5} />
      </button>
    </div>
  );
}

// Data tab card: automatic Google Drive backup status, Back up now, and restore.
function DriveBackupCard({ onRestore }) {
  const st = useDriveStatus();
  const [files, setFiles] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const btn = { flex: 1, padding: "12px", borderRadius: 12, border: "none", background: "rgba(215,212,216,0.13)", color: C.text, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS };
  const line = {
    ok: `Last backed up ${fmtLastBackup(st.last)}`,
    saving: "Backing up now…",
    idle: st.last ? `Last backed up ${fmtLastBackup(st.last)}` : "Waiting for the first backup",
    offline: st.last ? `Last backed up ${fmtLastBackup(st.last)}. Offline, will retry.` : "Offline, will retry.",
    not_configured: "Drive backup is not connected yet.",
    needs_passcode: "Enter your app passcode once to turn this on.",
    error: st.message || "Last attempt failed. Will retry.",
  }[st.state] || "";
  const bad = ["error", "not_configured", "needs_passcode"].includes(st.state);
  async function openRestore() {
    setErr(""); setBusy(true);
    try { setFiles(await listDriveBackups()); } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }
  async function restore(f) {
    if (!window.confirm(`Restore your full history from Drive? Anything missing on this phone is added back. Nothing here is deleted.`)) return;
    setBusy(true); setErr("");
    try { onRestore(await fetchDriveBackup(f.id), f.name); setFiles(null); } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }
  return (
    <div style={{ padding: "16px 18px 4px" }}>
      <div style={{ fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontFamily: SANS, fontWeight: 600, marginBottom: 10 }}>Google Drive</div>
      <div style={{ background: C.surface2, borderRadius: 14, padding: "14px" }}>
        <div style={{ fontSize: 13, color: bad ? C.alert : C.text, fontFamily: SANS, marginBottom: 4 }}>{line}</div>
        <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS, marginBottom: 12 }}>Saves on its own to one history file in Bodybuilding App on Drive. It only grows: nothing on Drive is ever lost.</div>
        <div style={{ display: "flex", gap: 10 }}>
          {st.state === "not_configured"
            ? <button onClick={() => driveConnect().catch(e => alert(e.message))} style={btn}>Connect Drive</button>
            : <button disabled={st.state === "saving"} onClick={() => backupToDrive({ force: true })} style={btn}>Back up now</button>}
          <button disabled={busy} onClick={files ? () => setFiles(null) : openRestore} style={btn}>{files ? "Close" : busy ? "Loading…" : "Restore"}</button>
        </div>
        {err && <div style={{ marginTop: 10, fontSize: 12, color: C.alert, fontFamily: SANS }}>{err}</div>}
        {files && (
          <div style={{ marginTop: 12, maxHeight: 260, overflowY: "auto" }}>
            {files.length === 0 && <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS }}>No Drive backups yet.</div>}
            {files.map(f => (
              <div key={f.id} onClick={() => !busy && restore(f)} style={{ display: "flex", justifyContent: "space-between", padding: "10px 2px", borderTop: `1px solid ${C.line}`, cursor: "pointer", fontFamily: SANS }}>
                <span style={{ fontSize: 13, color: C.text }}>Full history · saved {fmtLastBackup(f.modifiedTime)}</span>
                <span style={{ fontSize: 12, color: C.textDim }}>{f.size ? `${Math.max(1, Math.round(f.size / 1024))} KB` : ""}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Deload info for one movement in a session: the planned prescription while the
// deload runs, and the next-block cue (a preview during it, the target after it).
function deloadInfo(entries, entry, mv) {
  const d = loadDeload();
  if (!d || !mv?.name) return null;
  const st = deloadStatus(d, entries, entry?.date ?? todayStr());
  if (st.status === "off" || st.status === "scheduled") return null;
  const cue = cueFor(d, mv.name);
  if (st.status === "active") {
    const plan = mv.deloadPlan ?? (entry?.programDay ? deloadPlanFor(entries, d, entry.programDay, mv.name, entry.location ?? "equinox") : null);
    return { active: true, plan, cue, label: "Next block" };
  }
  // After the deload, keep cues up for the first full cycle of the new block.
  if (entry?.date && st.end && entry.date <= addDays(st.end, 10)) return { active: false, plan: null, cue, label: "Target" };
  return null;
}

function AppInner({ onBrief }) {
  const [entries, setEntries] = useState([]);
  const [, setDeloadRev] = useState(0);
  const [view, setView] = useState("journal");
  const [activeId, setActiveId] = useState(null);
  const [activeMvId, setActiveMvId] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showSwap, setShowSwap] = useState(false);
  const nameAtFocus = useRef("");
  const [newDate, setNewDate] = useState(todayStr());
  const [newProgramDay, setNewProgramDay] = useState(null);
  const [newLocation, setNewLocation] = useState(() => {
    try { return localStorage.getItem("wj_last_location") || "equinox"; } catch { return "equinox"; }
  });
  const [tab, setTab] = useState("journal");
  const [weightLog, setWeightLog] = useState([]);
  const [weightInput, setWeightInput] = useState("");
  const [weightDate, setWeightDate] = useState(todayStr());
  const [weightUnit, setWeightUnit] = useState("lbs");
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mesoOverride, setMesoOverride] = useState(null); // { anchorDate, weekAtAnchor }
  const [cycleAnchor, setCycleAnchor] = useState(null); // ISO date string — manual cycle reset
  // Macro tracking state
  const [macros, setMacros] = useState({});
  const [macroTargets, setMacroTargets] = useState(DEFAULT_MACRO_TARGETS);
  // Visual confirmation when a past food is re-added with "+": the tapped row flashes
  // and the new entry in today's list glows briefly.
  const [macroFlashKey, setMacroFlashKey] = useState(null);
  const [macroHighlightId, setMacroHighlightId] = useState(null);
  const macroFlashTimer = useRef(null);
  // PR moments: a toast + haptic the first time a logged set beats the movement's
  // previous best e1RM. Tracked per entry+movement so the same PR never toasts twice.
  const [prToast, setPrToast] = useState(null);
  const prToastTimer = useRef(null);
  const prToastShown = useRef({});
  const [checkinsDone, setCheckinsDone] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wj_checkins_done") || "[]"); } catch { return []; }
  });
  function markCheckinDone(date) {
    setCheckinsDone(prev => {
      const next = prev.includes(date) ? prev : [...prev, date];
      try { localStorage.setItem("wj_checkins_done", JSON.stringify(next)); } catch {}
      return next;
    });
  }
  const [macroDate, setMacroDate] = useState(todayStr());
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showTargetsModal, setShowTargetsModal] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [foodP, setFoodP] = useState("");
  const [foodC, setFoodC] = useState("");
  const [foodF, setFoodF] = useState("");
  const [aiDescription, setAiDescription] = useState("");
  const [aiPendingReview, setAiPendingReview] = useState(null); // { name, p, c, f, cal } awaiting confirm
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [dayTypeOverride, setDayTypeOverride] = useState(null); // per-date manual override stored in day data
  const [foodPhoto, setFoodPhoto] = useState(null); // { dataUrl, mediaType }
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [macroSearchQuery, setMacroSearchQuery] = useState("");
  const [showMacroSearch, setShowMacroSearch] = useState(false);
  const [showChef, setShowChef] = useState(false);
  const [showMesoEdit, setShowMesoEdit] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedCycleIdx, setSelectedCycleIdx] = useState(null); // null = current cycle; index into pastCycles otherwise
  const [scrubIdx, setScrubIdx] = useState(null); // index into weight chart data being scrubbed, null = not scrubbing
  const weightChartRef = useRef(null);
  // Attach scrubber touch listeners natively with { passive: false }. React's JSX onTouch*
  // props attach as PASSIVE listeners, so preventDefault() inside them is a silent no-op and
  // iOS keeps the gesture for page scrolling — the same reason in-app pinch-zoom did nothing
  // until it was rewritten this way. Keyed to weightLog so it rebinds when the chart changes.
  useEffect(() => {
    const el = weightChartRef.current;
    if (!el) return;
    const CHART_W_LOCAL = 340, CHART_LEFT_LOCAL = 30;
    const points = [...weightLog].sort((a, b) => a.date.localeCompare(b.date));
    if (points.length < 2) return;

    function idxFromClientX(clientX) {
      const rect = el.getBoundingClientRect();
      if (!rect.width) return null;
      const scale = CHART_W_LOCAL / rect.width;
      const xInView = (clientX - rect.left) * scale;
      const usable = CHART_W_LOCAL - CHART_LEFT_LOCAL;
      const frac = Math.max(0, Math.min(1, (xInView - CHART_LEFT_LOCAL) / usable));
      return Math.round(frac * (points.length - 1));
    }
    function onMove(e) {
      const touch = e.touches?.[0];
      if (!touch) return;
      e.preventDefault();
      const i = idxFromClientX(touch.clientX);
      if (i !== null) setScrubIdx(i);
    }
    function onEnd() { setScrubIdx(null); }

    el.addEventListener("touchstart", onMove, { passive: false });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: false });
    el.addEventListener("touchcancel", onEnd, { passive: false });
    return () => {
      el.removeEventListener("touchstart", onMove);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [weightLog, tab]);
  const [completionSummary, setCompletionSummary] = useState(null); // { entry, prs: [...] } shown right after completing a workout
  const [drivePhotos, setDrivePhotos] = useState(null); // null = not loaded yet, [] = loaded but empty
  const [drivePhotosError, setDrivePhotosError] = useState("");
  const [drivePhotosLoading, setDrivePhotosLoading] = useState(false);
  const [photoSlotA, setPhotoSlotA] = useState(null); // selected photo object for left slot
  const [photoSlotB, setPhotoSlotB] = useState(null); // selected photo object for right slot
  const [photoCompareMode, setPhotoCompareMode] = useState("side"); // "side" | "slider"
  const [photoPickerSlot, setPhotoPickerSlot] = useState(null); // "A" | "B" | null — which slot is being picked
  const [dismissedResumeIds, setDismissedResumeIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wj_dismissed_resume") || "[]"); } catch { return []; }
  });
  function dismissResume(id) {
    setDismissedResumeIds(prev => {
      const next = [...prev, id];
      try { localStorage.setItem("wj_dismissed_resume", JSON.stringify(next)); } catch {}
      return next;
    });
  }
  const [showAnchorEdit, setShowAnchorEdit] = useState(false);
  const [anchorEditValue, setAnchorEditValue] = useState("");
  const [timerState, setTimerState] = useState(null);
  // NEW: between-movement stopwatch
  const [showStopwatch, setShowStopwatch] = useState(false);
  const [stopwatchElapsed, setStopwatchElapsed] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  // Data tab state
  const [filterDay, setFilterDay] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [importMsg, setImportMsg] = useState("");
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);
  const stopwatchRef = useRef(null);

  const activeEntry = entries.find(e => e.id === activeId);
  const activeMv = activeEntry?.movements.find(m => m.id === activeMvId);

  useEffect(() => {
    // One-time migration for the start of the lean bulk block. Saved settings in
    // localStorage override the defaults, so changing DEFAULT_MACRO_TARGETS alone would
    // never reach an existing install. This writes the new targets and resets the
    // mesocycle to Week 1 at BLOCK_START exactly once, then never touches them again,
    // so later manual edits in the app are respected.
    try {
      if (!localStorage.getItem("wj_migration_bulk_2026_09")) {
        localStorage.setItem("wj_macro_targets", JSON.stringify(DEFAULT_MACRO_TARGETS));
        localStorage.setItem("wj_meso", JSON.stringify({ anchorDate: BLOCK_START, weekAtAnchor: 1 }));
        localStorage.setItem("wj_migration_bulk_2026_09", "1");
      }
      // Sep 29, 2026 program review: new macro targets. Runs once; later manual
      // edits to targets are never overwritten.
      if (!localStorage.getItem("wj_migration_macros_2026_09_29")) {
        localStorage.setItem("wj_macro_targets", JSON.stringify(DEFAULT_MACRO_TARGETS));
        // Re-pin the block to Week 1 = Sep 21. The block got longer (7 weeks), and an
        // install still carrying the old June anchor would otherwise land in a deload.
        localStorage.setItem("wj_meso", JSON.stringify({ anchorDate: BLOCK_START, weekAtAnchor: 1 }));
        localStorage.setItem("wj_migration_macros_2026_09_29", "1");
      }
    } catch {}
    Promise.all([loadEntries(), loadWeights()]).then(([e0, w]) => {
      let e = e0;
      try {
        if (!localStorage.getItem("wj_migration_names_2026_10_08")) {
          const cutoff = localDateStr(new Date(Date.now() - 2 * 86400000));
          const r = migrateNames(e0, cutoff);
          if (r.changed) { e = r.entries; saveEntries(e); }
          localStorage.setItem("wj_migration_names_2026_10_08", "1");
        }
      } catch {}
      setEntries(e);
      setWeightLog(w);
      setLoading(false);
    });
    try {
      const raw = localStorage.getItem("wj_meso");
      if (raw) setMesoOverride(JSON.parse(raw));
    } catch {}
    try {
      const ca = localStorage.getItem("wj_cycle_anchor");
      if (ca) setCycleAnchor(ca);
    } catch {}
    setMacros(loadMacros());
    setMacroTargets(loadMacroTargets());
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  function saveMesoOverride(o) {
    setMesoOverride(o);
    try { localStorage.setItem("wj_meso", JSON.stringify(o)); } catch {}
  }
  function saveCycleAnchor(date) {
    setCycleAnchor(date);
    try {
      if (date) localStorage.setItem("wj_cycle_anchor", date);
      else localStorage.removeItem("wj_cycle_anchor");
    } catch {}
  }
  function mutateMacros(fn) {
    setMacros(prev => {
      const next = fn(JSON.parse(JSON.stringify(prev)));
      saveMacrosLS(next);
      return next;
    });
  }
  function saveMacroTargets(t) {
    setMacroTargets(t);
    saveMacroTargetsLS(t);
  }
  // Is the given date a training day? Auto-detect from workout journal, honoring manual override.
  function detectDayType(dateStr) {
    const day = macros[dateStr];
    const trained = trainedOn(dateStr);
    // A logged training session always makes it a training day. A manual "rest"
    // tag set earlier in the day (before the session was logged) was leaving
    // lifting days on the lower target. Manual overrides still apply to days
    // with no session, e.g. marking a day training before you get to the gym.
    if (trained) return "training";
    if (day?.dayTypeManual) return day.dayType;
    return "rest";
  }
  function trainedOn(dateStr) {
    return entries.some(e => e.date === dateStr && e.programDay && PROGRAM[e.programDay]?.exercises.length > 0
      && e.movements.some(m => m.sets.some(s => s.r !== "" && s.r != null)));
  }

  // Keep the stored day type in step with the journal, so history, exports and
  // averages see lifting days as training days (fixes days like Sep 23 and 25 that
  // were saved as "rest" before the session was logged).
  useEffect(() => {
    if (loading) return;
    const fixes = Object.keys(macros).filter(d => macros[d]?.dayType !== "training" && trainedOn(d));
    if (fixes.length === 0) return;
    setMacros(prev => {
      const next = { ...prev };
      for (const d of fixes) next[d] = { ...next[d], dayType: "training", dayTypeManual: false };
      saveMacrosLS(next);
      return next;
    });
  }, [entries, loading, macros]);

  useEffect(() => {
    if (!loading) saveEntries(entries);
  }, [entries, loading]);

  // Daily brief: due on the first open each day and when returning to the app on a
  // new day. Reads the latest state through a ref so it always sees current data.
  const briefCtx = useRef(null);
  briefCtx.current = { entries, weightLog, macros, macroTargets, mesoOverride, location: newLocation };
  useEffect(() => {
    if (loading || !onBrief) return;
    const check = () => {
      const today = todayStr();
      let seen = null;
      try { seen = localStorage.getItem("wj_brief_seen"); } catch {}
      if (seen === today) return;
      try { onBrief(buildDailyBrief({ ...briefCtx.current, today })); } catch (err) { console.warn("[Journal] daily brief failed", err); }
    };
    check();
    const onVis = () => { if (document.visibilityState === "visible") check(); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [loading]);

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
    entry.location = newLocation;
    if (prog) {
      const last = getLastSession(entries, newProgramDay, newLocation);
      // Resolve each slot to either its normal Equinox exercise or, when this session
      // is flagged for the apartment gym, its GYM_SUBS substitute. The resolved list
      // still has one entry per PROGRAM slot id, so slot letters and programRef never
      // shift between locations.
      const resolvedExercises = prog.exercises.map(ex => resolveExercise(newProgramDay, ex.id, newLocation) ?? ex);
      entry.movements = coachOrder(newProgramDay, resolvedExercises, entries).map(ex => {
        // Match by programRef first (the normal case); if that fails, fall back to matching
        // by exercise name. This handles sessions where a movement's programRef is missing
        // or null (e.g. it was manually renamed/re-added at some point and lost its slot
        // reference) — without this fallback, "last session" seeding silently comes up empty
        // even though a clearly-matching recent session exists.
        // Note: matching by programRef alone would wrongly carry Equinox weights onto an
        // apartment substitute (different equipment, different load). Requiring the name
        // to also match keeps the two locations' loads separate for the same slot.
        const exactSameDay = last?.movements.find(m => m.programRef === ex.id && m.name && ex.name && nameKey(m.name) === nameKey(ex.name)) ?? null;
        // Exercise moved days (e.g. hip thrust from Pull day to Lower A): find its most
        // recent logged instance by exact name, or a known older name, on any day.
        const crossDay = exactSameDay ? null : lastMovementByName(entries, ex.name, newLocation);
        const lastMv = exactSameDay
          ?? crossDay?.mv
          ?? last?.movements.find(m => {
            if (!m.name || !ex.name) return false;
            const exHasVariant = ex.name.includes(" (");
            if (exHasVariant) {
              // Exercise has a specific grip/equipment qualifier (e.g. two different Lat
              // Pulldown variants on different days) — require an exact name match so
              // distinct variants never get confused with each other.
              return m.name.toLowerCase().trim() === ex.name.toLowerCase().trim();
            }
            // No variant qualifier — allow fuzzy matching (e.g. "Leg Press" logged manually
            // once vs the program's "Leg Press Machine") since there's no ambiguity to protect against.
            const a = m.name.toLowerCase().trim(), b = ex.name.toLowerCase().trim();
            return a.includes(b) || b.includes(a);
          })
          ?? null;
        const lastSets = lastMv?.sets ?? [];
        // Block starting weight: applies only until this movement is logged once in
        // the current block. Reps start blank since last block's reps were at a
        // different load and would be misleading.
        const useStartWeight = ex.startWeight != null && !loggedSince(entries, ex.name, BLOCK_START);
        const coachT = COACH_TARGETS[ex.name];
        const useCoach = !!coachT && !loggedSince(entries, ex.name, COACH_SINCE);
        // Planned deload: exact sets and weight. After it, next-block restart targets.
        const dl = loadDeload();
        const dlPlan = deloadStatus(dl, entries, newDate).status === "active" ? deloadPlanFor(entries, dl, newProgramDay, ex.name, newLocation) : null;
        const nb = dlPlan ? null : nextBlockTarget(entries, ex.name, newDate);
        const nSets = dlPlan ? dlPlan.sets : ex.sets;
        const seeded = Array.from({ length: nSets }, (_, i) => ({
          w: dlPlan ? (dlPlan.weight ? String(dlPlan.weight) : "") : nb ? String(nb.weight) : useCoach ? String(coachT.weight) : useStartWeight ? String(ex.startWeight) : (lastSets[i]?.w ?? ""),
          r: (dlPlan || nb || useCoach || useStartWeight) ? "" : (lastSets[i]?.r ?? ""),
          rir: "",
        }));
        return {
          ...newMovement(ex.name),
          id: Date.now() + Math.random(),
          programRef: ex.id,
          setsTarget: nSets,
          repsTarget: ex.reps,
          deloadPlan: dlPlan ?? null,
          rest: ex.rest,
          type: ex.type ?? "compound",
          muscle: ex.muscle ?? "",
          cue: ex.cue ?? "",
          bodyweight: !!ex.bodyweight,
          loadStep: ex.loadStep ?? null,
          substituted: !!ex.substituted,
          sets: seeded,
          lastSets: lastSets.length > 0 ? lastSets : null,
          lastDate: (crossDay && lastMv === crossDay.mv) ? crossDay.date : (last?.date ?? null),
          lastLocation: (crossDay && lastMv === crossDay.mv) ? crossDay.location : (last?.location ?? "equinox"),
        };
      });
    }
    try { localStorage.setItem("wj_last_location", newLocation); } catch {}
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
  function toggleWarmup(entryId, key) {
    mutate(prev => prev.map(e => e.id === entryId
      ? { ...e, warmup: { ...(e.warmup ?? { stretchBefore: false, treadmill: false, stretchAfter: false }), [key]: !((e.warmup ?? {})[key]) } }
      : e));
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
  function swapMovementTo(entryId, mvId, ex, reason) {
    mutate(prev => {
      const entry = prev.find(e => e.id === entryId);
      if (!entry) return prev;
      return prev.map(e => e.id === entryId
        ? { ...e, movements: e.movements.map(m => m.id === mvId ? buildSwappedMovement(m, entry, prev, ex, reason) : m) }
        : e);
    });
    setShowSwap(false);
  }
  // Leaving the name box: a typed name that is in the library becomes its official
  // name and takes that exercise's history; an unknown name just refreshes history.
  function finishNameEdit(entry, mv) {
    const typed = (mv.name ?? "").trim();
    if (!typed || typed === nameAtFocus.current.trim()) return;
    const ex = libFind(typed);
    if (ex) { swapMovementTo(entry.id, mv.id, ex, "Renamed"); return; }
    const h = lastMovementByName(entries.filter(e => e.id !== entry.id), typed, entry.location ?? "equinox");
    if (h) updateMovement(entry.id, mv.id, { lastSets: h.mv.sets, lastDate: h.date, lastLocation: h.location });
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
          ? { ...m, sets: [...m.sets, { w: m.sets.at(-1)?.w ?? "", r: "", rir: "" }] }
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

  const today = todayStr();
  // Resumable session = the most recent incomplete session, whenever it was started.
  // (Separate from the journal list filter below, which only *displays* today's incomplete
  // session to avoid clutter — but a workout started days ago and never finished should
  // still be resumable.)
  const incompleteSessions = entries.filter(e => !e.completedAt && !dismissedResumeIds.includes(e.id)).sort((a, b) => b.date.localeCompare(a.date));
  const inProgressSession = incompleteSessions[0] ?? null;
  const sorted = [...entries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter(e => {
      // Always show completed sessions
      if (e.completedAt) return true;
      // Show today's incomplete session (in-progress)
      if (e.date === today) return true;
      // Hide all older incomplete sessions
      return false;
    });

  if (loading) {
    return (
      <Shell>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 12 }}>
          <div style={{ fontSize: 32 }}>🏋️</div>
          <div style={{ fontSize: 15, color: C.textDim, fontFamily: SANS, letterSpacing: 0.2 }}>Loading…</div>
        </div>
      </Shell>
    );
  }

  function checkSetPR(entry, mv, set) {
    if (!mv?.name || !set) return;
    const e1 = estimateOneRM(set.w, set.r, set.rir);
    if (!e1) return;
    const prior = movementHistory(entries.filter(e => e.date < entry.date), mv.name);
    if (prior.length === 0) return; // first time on this movement is a baseline, not a PR
    const priorBest = Math.max(...prior.map(p => p.e1rm));
    const key = `${entry.id}|${mv.id}`;
    const already = prToastShown.current[key] ?? 0;
    if (e1 <= priorBest || e1 <= already) return;
    prToastShown.current[key] = e1;
    try { navigator.vibrate?.([20, 40, 20]); } catch {}
    setPrToast({ id: Date.now(), text: `New PR: ${set.w} x ${set.r}, e1RM ${e1}` });
    clearTimeout(prToastTimer.current);
    prToastTimer.current = setTimeout(() => setPrToast(null), 2800);
  }

  // ── MOVEMENT DETAIL ───────────────────────────────────────────────────────
  if (view === "movement" && activeEntry && activeMv) {
    const prog = activeEntry.programDay ? PROGRAM[activeEntry.programDay] : null;
    const color = prog?.color ?? C.text;
    const allMvs = activeEntry.movements;
    const curIdx = allMvs.findIndex(m => m.id === activeMv.id);
    const nextMv = allMvs[curIdx + 1] ?? null;
    const isLast = curIdx === allMvs.length - 1;
    const alreadyDone = !!activeMv.doneAt;
    // Previous session's sets for this movement (same gym first), used as ghost
    // placeholders in the set inputs. Falls back to the lastSets seeded at creation.
    const ghostSets = (() => {
      const prior = entries.filter(e => e.id !== activeEntry.id && e.date <= activeEntry.date);
      const h = lastMovementByName(prior, activeMv.name, activeEntry.location ?? "equinox");
      return h?.mv?.sets ?? activeMv.lastSets ?? [];
    })();

    function finishAndAdvance() {
      const hasLoggedReps = activeMv.sets.some(s => s.r && String(s.r).trim() !== "");
      if (!hasLoggedReps) {
        alert("Log at least one set's reps before completing this movement.");
        return;
      }
      const ts = new Date().toISOString();
      const best = bestSetForMovement(activeMv);
      if (best) checkSetPR(activeEntry, activeMv, activeMv.sets[best.setIdx]);
      updateMovement(activeEntry.id, activeMv.id, { doneAt: ts });
      dismissTimer();
      if (nextMv) {
        // Jump straight to next movement and auto-start a 90s rest timer at the top
        setActiveMvId(nextMv.id);
        setShowStopwatch(false);
        startTimer("movement", 90); // 1.5 min between-movement rest, auto-starts
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
              style={{ ...btnStyle(C.alertWash, C.alert), border: "1px solid rgba(212,154,184,0.35)" }}>Delete</button>
          }
        />

        {/* Sticky top timer — only for between-MOVEMENT rest (auto-started on Done·Next) */}
        {timerState && timerState.setIdx === "movement" && !showStopwatch && (() => {
          const remaining = timerState.remaining;
          const running = timerState.running;
          const done = timerState.done;
          const total = timerState.total || 90;
          const pct = total > 0 ? remaining / total : 0;
          const R = 18; const circ = 2 * Math.PI * R;
          const mins = Math.floor(remaining / 60), secs = remaining % 60;
          const timeStr = mins > 0 ? `${mins}:${String(secs).padStart(2,"0")}` : `${secs}s`;
          return (
            <div style={{ position: "sticky", top: 0, zIndex: 20, margin: "0 0 4px", padding: "10px 18px", background: done ? C.surface2 : C.surface, borderBottom: `2px solid ${done ? color + "88" : color + "44"}`, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
                <svg width="44" height="44" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="22" cy="22" r={R} fill="none" stroke={C.textFaint} strokeWidth="3" />
                  <circle cx="22" cy="22" r={R} fill="none" stroke={color} strokeWidth="3"
                    strokeDasharray={`${circ * pct} ${circ}`} strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 0.5s linear" }} />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, fontFamily: SANS, color: done ? color : C.text }}>
                  {done ? "GO" : timeStr}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, letterSpacing: 0.2, color: done ? color : C.textMid, fontFamily: SANS, marginBottom: 4 }}>
                  {done ? "✓ Rest complete — start!" : "Rest before this movement · 1m 30s"}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {!done && running && <button onClick={pauseTimer} style={{ ...btnStyle(C.surface3, C.textMid), padding: "4px 10px", fontSize: 12 }}>⏸</button>}
                  {!done && !running && <button onClick={resumeTimer} style={{ ...btnStyle(color + "22", color), padding: "4px 10px", fontSize: 12 }}>▶</button>}
                  <button onClick={() => resetTimer(90)} style={{ ...btnStyle(C.surface3, C.textMid), padding: "4px 10px", fontSize: 12 }}>↺</button>
                  {done && <button onClick={dismissTimer} style={{ ...btnStyle(color, C.ink), padding: "4px 14px", fontSize: 12, fontWeight: 600 }}>Dismiss</button>}
                </div>
              </div>
            </div>
          );
        })()}

        <div style={{ padding: "4px 18px 16px" }}>
          {activeMv.programRef && (
            <div style={{ fontSize: 12, letterSpacing: 0.2, color: C.textMid, marginBottom: 6, fontFamily: SANS, display: "flex", alignItems: "center", gap: 8 }}>
              <span>{prog?.title} · {activeMv.programRef}</span>
              {activeMv.substituted && <span style={{ color: C.warn, letterSpacing: 0.2 }}>· apartment swap</span>}
            </div>
          )}
          {(() => {
            const pr = detailedPRForMovement(activeEntry, activeMv, entries);
            const best = pr ? bestSetForMovement(activeMv) : null;
            return pr && best ? (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 8, padding: "4px 10px", borderRadius: 8, background: STONE.rosa }}>
                <Trophy size={13} color={INK.rosa} strokeWidth={2.2} />
                <span style={{ fontSize: 12, fontWeight: 600, color: INK.rosa, fontFamily: SANS, letterSpacing: 0.2 }}>PR this session · {best.w} x {best.r} · e1RM {best.e1rm}</span>
              </div>
            ) : null;
          })()}
          {/* CHANGE 3: Editable movement name inline */}
          <input
            style={bigInput}
            value={activeMv.name}
            onFocus={() => { nameAtFocus.current = activeMv.name ?? ""; }}
            onBlur={() => finishNameEdit(activeEntry, activeMv)}
            onChange={e => updateMovement(activeEntry.id, activeMv.id, { name: e.target.value })}
            placeholder="Movement name…"
          />
          {activeMv.swappedFrom && (
            <div style={{ marginTop: 6, fontSize: 12, color: C.warn, fontFamily: SANS, letterSpacing: 0.3 }}>
              swapped from {activeMv.swappedFrom}{activeMv.swapReason && activeMv.swapReason !== "Renamed" ? ` (${activeMv.swapReason.toLowerCase()})` : ""}
            </div>
          )}
          {(() => {
            const t = (activeMv.name ?? "").trim();
            if (t.length < 3 || libFind(t)) return null;
            const sg = searchLibrary(t, 3);
            if (!sg.length) return null;
            return (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                {sg.map(ex => (
                  <button key={ex.name} onMouseDown={e => e.preventDefault()} onClick={() => swapMovementTo(activeEntry.id, activeMv.id, ex, "Renamed")}
                    style={{ ...btnStyle(C.surface3, C.text), padding: "5px 10px", fontSize: 12, fontWeight: 600 }}>{ex.name}</button>
                ))}
              </div>
            );
          })()}
          <button onClick={() => setShowSwap(true)}
            style={{ ...btnStyle(C.surface3, color), padding: "6px 12px", fontSize: 12, fontWeight: 600, marginTop: 10 }}>⇄ Swap exercise</button>
          {showSwap && <SwapSheet entry={activeEntry} mv={activeMv} color={color} onClose={() => setShowSwap(false)}
            onPick={(ex, reason) => swapMovementTo(activeEntry.id, activeMv.id, ex, reason)} />}
          {activeMv.repsTarget && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              <Pill color={color}>{activeMv.setsTarget} sets</Pill>
              <Pill color={color}>{activeMv.repsTarget} reps</Pill>
              {activeMv.rest && <Pill color={C.textMid}>Rest {activeMv.rest}</Pill>}
            </div>
          )}
          {(() => {
            const cue = activeMv.cue || programExFor(activeEntry, activeMv)?.cue;
            return cue ? (
              <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 10, background: C.surface2, fontSize: 12, color: C.textMid, fontFamily: SANS, lineHeight: 1.5 }}>
                <span style={{ fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontWeight: 600, marginRight: 6 }}>Cue</span>
                {cue}
              </div>
            ) : null;
          })()}
        </div>

        {activeMv.lastSets && activeMv.lastDate && (
          <div style={{ margin: "0 18px 14px", padding: "10px 14px", borderRadius: 12, background: C.surface }}>
            <div style={{ fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontFamily: SANS, marginBottom: 6 }}>
              Last session · {fmtDate(activeMv.lastDate)}{activeMv.lastLocation ? ` · ${LOCATIONS[activeMv.lastLocation]?.short ?? ""}` : ""}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {activeMv.lastSets.map((s, i) => (
                <span key={i} style={{ fontSize: 12, fontFamily: SANS, fontWeight: 600, padding: "4px 9px", borderRadius: 7, background: C.surface2, color: "rgba(238,233,224,0.53)" }}>
                  {s.w ? `${s.w}lbs` : "BW"}×{s.r || "?"}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Autoregulated progression suggestion — advisory only, never auto-applied */}
        {(() => {
          const meso = mesocycleWeek(entries, mesoOverride);
          // Read exercise settings from the program so sessions created before a program
          // change still get the right step size, bodyweight handling, and start weight.
          const progEx = programExFor(activeEntry, activeMv);
          const sug0 = suggestProgression(
            entries, activeMv.name, activeMv.repsTarget,
            progEx?.type ?? activeMv.type ?? "isolation",
            {
              isDeloadWeek: deloadNow(entries, activeEntry.date, meso.isDeload), excludeEntryId: activeEntry.id,
              loadStep: progEx?.loadStep ?? activeMv.loadStep ?? null,
              bodyweight: !!(progEx?.bodyweight ?? activeMv.bodyweight),
              startWeight: progEx?.startWeight ?? null,
              location: activeEntry.location ?? "equinox",
              setsTarget: activeMv.setsTarget ?? progEx?.sets ?? null,
            }
          );
          const di = deloadInfo(entries, activeEntry, activeMv);
          const sug = di?.plan
            ? { action: "deload", weight: di.plan.weight ?? 0, reason: `Deload plan: ${di.plan.text}. ${di.plan.note}` }
            : applyReadiness(sug0, readinessLevel(activeEntry.readiness));
          if (!sug) return (di?.cue ? <div style={{ margin: "0 18px 14px" }}><CueLine cue={di.cue} label={di.label} /></div> : null);
          const LABEL = {
            add_weight: "Add weight", add_reps: "Chase reps",
            hold: sug.calibrate ? "Calibrate" : "Hold steady", back_off: "Ease off", deload: "Deload",
            block_start: "Block start", coach: "Coach target",
          };
          // Emphasize only when the suggestion is a real change from last time
          const isChange = sug.action === "add_weight" || sug.action === "back_off" || sug.action === "deload" || sug.action === "block_start" || sug.action === "coach";
          const accent = isChange ? LAKE.sky : C.textDim;
          const alreadyApplied = activeMv.sets.length > 0 && String(activeMv.sets[0].w) === String(sug.weight);
          return (
            <div style={{ margin: "0 18px 14px", padding: "12px 14px", borderRadius: 12, background: isChange ? LAKE.sky + "14" : C.surface }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                <div style={{ fontSize: 12, letterSpacing: 0.2, color: accent, fontFamily: SANS, fontWeight: 600 }}>
                  Suggested · {LABEL[sug.action]}
                </div>
                {sug.weight > 0 && (
                  <div style={{ fontSize: 15, fontWeight: 600, color: accent, fontFamily: MONO, fontVariantNumeric: "tabular-nums" }}>
                    {sug.weight} lbs
                  </div>
                )}
              </div>
              <div style={{ fontSize: 12, color: C.textMid, fontFamily: SANS, lineHeight: 1.5 }}>
                {sug.reason}
              </div>
              {COACH_NOTES[canonName(activeMv.name)] && sug.action !== "coach" && !loggedSince(entries.filter(e => e.id !== activeEntry.id), activeMv.name, COACH_SINCE) && (
                <div style={{ fontSize: 12, color: C.warn, fontFamily: SANS, lineHeight: 1.5, marginTop: 6 }}>
                  {COACH_NOTES[canonName(activeMv.name)]}
                </div>
              )}
              {sug.weight > 0 && !alreadyApplied && (
                <button
                  onClick={() => {
                    const next = activeMv.sets.map(s => (s.done ? s : { ...s, w: String(sug.weight) }));
                    updateMovement(activeEntry.id, activeMv.id, { sets: next });
                  }}
                  style={{ marginTop: 10, padding: "8px 14px", borderRadius: 9, background: accent, border: "none", color: C.ink, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                  Apply {sug.weight} lbs to unlogged sets
                </button>
              )}
              {di?.cue && <CueLine cue={di.cue} label={di.label} />}
            </div>
          );
        })()}

        {/* Smart coaching: PR forecast, plateau, set count. Advisory only. */}
        {(() => {
          const meso = mesocycleWeek(entries, mesoOverride);
          const progEx = programExFor(activeEntry, activeMv);
          const o = {
            excludeEntryId: activeEntry.id, location: activeEntry.location ?? "equinox",
            bodyweight: !!(progEx?.bodyweight ?? activeMv.bodyweight), isDeloadWeek: deloadNow(entries, activeEntry.date, meso.isDeload),
            type: progEx?.type ?? activeMv.type ?? "isolation", loadStep: progEx?.loadStep ?? activeMv.loadStep ?? null,
            repsTarget: activeMv.repsTarget, setsTarget: activeMv.setsTarget ?? progEx?.sets ?? null,
            entry: activeEntry, mv: activeMv,
          };
          const plateau = detectPlateau(entries, activeMv.name, o);
          const setSug = suggestSetCount(entries, activeMv.name, o);
          const firstW = activeMv.sets.find(st => parseFloat(st.w) > 0)?.w;
          const pr = deloadNow(entries, activeEntry.date, meso.isDeload) ? null : prForecast(entries, activeMv.name, firstW, activeMv.repsTarget, activeEntry.id);
          const level = readinessLevel(activeEntry.readiness);
          const slotKey = activeEntry.programDay && activeMv.programRef ? `${activeEntry.programDay}.${activeMv.programRef}` : null;
          const card = (accent, label, body, extra) => (
            <div style={{ margin: "0 18px 14px", padding: "12px 14px", borderRadius: 12, background: accent + "14" }}>
              <div style={{ fontSize: 12, letterSpacing: 0.2, color: accent, fontFamily: SANS, fontWeight: 600, marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 12, color: C.textMid, fontFamily: SANS, lineHeight: 1.5 }}>{body}</div>
              {extra}
            </div>
          );
          const applySets = (to, forward) => {
            const logged = st => st.r !== "" && st.r != null;
            let sets = [...activeMv.sets];
            if (to > sets.length) while (sets.length < to) sets.push({ w: sets.at(-1)?.w ?? "", r: "", rir: "" });
            else while (sets.length > to && !logged(sets.at(-1))) sets.pop();
            updateMovement(activeEntry.id, activeMv.id, { setsTarget: to, sets });
            if (forward && slotKey && progEx) saveSetOverride(slotKey, activeMv.name, to === (progEx.programSets ?? -1) ? null : to);
          };
          const smallBtn = (txt, onClick, filled) => (
            <button onClick={onClick} style={{ ...btnStyle(filled ? STONE.venato : C.surface3, filled ? C.ink : C.text), padding: "7px 12px", fontSize: 12, fontWeight: 600, marginTop: 10, marginRight: 8 }}>{txt}</button>
          );
          return (
            <>
              {level && level !== "good" && card(C.warn, `Recovery · ${level}`, READINESS_TEXT[level])}
              {pr && card(C.text, "PR in reach", `${pr.weight} × ${pr.reps} beats your best ever (${pr.bestW} × ${pr.bestR}, ${fmtDate(pr.bestDate)}).`)}
              {plateau && card(C.warn, `Stalled · ${plateau.sessions} sessions`, `No new best since ${fmtDate(plateau.since)}. ${plateau.fix}`,
                plateau.kind === "reset" && plateau.weight ? smallBtn(`Use ${plateau.weight} today`, () => updateMovement(activeEntry.id, activeMv.id, { sets: activeMv.sets.map(st => (st.r !== "" && st.r != null) ? st : { ...st, w: String(plateau.weight) }) }), true) : null)}
              {setSug && card(C.warn, setSug.dir === "add" ? `Add a set · ${setSug.to} sets` : `Drop a set · ${setSug.to} sets`, setSug.reason,
                <div>
                  {smallBtn("Today only", () => applySets(setSug.to, false), false)}
                  {slotKey && progEx && smallBtn("From now on", () => applySets(setSug.to, true), true)}
                </div>)}
              {progEx?.programSets != null && progEx.programSets !== progEx.sets && (
                <div style={{ margin: "-6px 18px 14px", fontSize: 12, color: C.textMid, fontFamily: SANS }}>
                  You set this slot to {progEx.sets} sets (program: {progEx.programSets}).{" "}
                  <span onClick={() => { saveSetOverride(slotKey, activeMv.name, null); applySets(progEx.programSets, false); }} style={{ color: C.warn, cursor: "pointer", fontWeight: 600 }}>Reset to program</span>
                </div>
              )}
            </>
          );
        })()}

        <SectionLabel>Set Log</SectionLabel>

        {/* CHANGE 1: Stopwatch between movements — shown after finishing a movement */}
        {showStopwatch && (
          <div style={{ margin: "0 18px 14px", padding: "16px", borderRadius: 14, background: "rgba(215,212,216,0.13)" }}>
            <div style={{ fontSize: 12, letterSpacing: 0.2, color: C.text, fontFamily: SANS, marginBottom: 8 }}>Rest Before Next Movement</div>
            <div style={{ ...HERO, color: C.text, textAlign: "center" }}>
              {`${Math.floor(stopwatchElapsed / 60)}:${String(stopwatchElapsed % 60).padStart(2, "0")}`}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "center" }}>
              <button onClick={toggleStopwatch} style={{ ...btnStyle(C.surface2, C.text), padding: "8px 16px" }}>
                {stopwatchRunning ? "⏸ Pause" : "▶ Resume"}
              </button>
              <button onClick={resetStopwatch} style={{ ...btnStyle(C.surface3, C.textMid), padding: "8px 14px" }}>↺</button>
              <button onClick={() => {
                dismissStopwatch();
                if (nextMv) { setActiveMvId(nextMv.id); setTimerState(null); }
                else setView("entry");
              }} style={{ ...btnStyle(STONE.carrara, C.ink), padding: "8px 16px", fontWeight: 600 }}>
                Next: {nextMv?.name?.split(" ")[0] || "Done"} →
              </button>
            </div>
          </div>
        )}

        {!showStopwatch && activeMv.sets.map((s, i) => {
          const restSecs = restToSeconds(activeMv.rest);
          const setDone = !!s.done;
          const isTimerSet = timerState?.setIdx === i; // between-set timer for this set
          return (
            <div key={i}>
              <SetRow
                num={i + 1}
                ghost={ghostSets[i] ?? null}
                weight={s.w} reps={s.r} rir={s.rir ?? ""}
                repsTarget={activeMv.repsTarget ?? null}
                type={activeMv.type ?? (activeEntry.programDay && activeMv.programRef ? (programExFor(activeEntry, activeMv)?.type ?? "compound") : "compound")}
                isLastSet={i === activeMv.sets.length - 1}
                done={setDone}
                color={color}
                onW={v => updateSet(activeEntry.id, activeMv.id, i, "w", v)}
                onR={v => {
                  updateSet(activeEntry.id, activeMv.id, i, "r", v);
                  if (v && String(v) !== "0" && i < activeMv.sets.length - 1) {
                    startTimer(i, restSecs);
                  }
                }}
                onRIR={v => updateSet(activeEntry.id, activeMv.id, i, "rir", v)}
                onDelete={activeMv.sets.length > 1 ? () => removeSet(activeEntry.id, activeMv.id, i) : null}
                onDone={() => {
                  const ts = s.done ? null : new Date().toISOString();
                  updateSet(activeEntry.id, activeMv.id, i, "done", ts);
                  if (!s.done) checkSetPR(activeEntry, activeMv, s);
                  if (!s.done && i < activeMv.sets.length - 1) {
                    startTimer(i, restSecs);
                  }
                }}
              />
              {/* Inline rest timer between sets (not after the last set) */}
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
          <div style={{ padding: "16px 18px 120px" }}>
            {alreadyDone ? (
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => updateMovement(activeEntry.id, activeMv.id, { doneAt: null })}
                  style={{ flex: 1, padding: "13px", borderRadius: 14, background: "transparent", color: C.textDim, fontSize: 12, fontFamily: SANS, fontWeight: 600, cursor: "pointer" }}>
                  ↩ Undo Done
                </button>
                {nextMv && (
                  <button onClick={() => { dismissTimer(); setActiveMvId(nextMv.id); }}
                    style={{ flex: 2, padding: "13px", borderRadius: 14, background: C.surface2, color: C.text, fontSize: 15, fontFamily: SANS, fontWeight: 600, cursor: "pointer" }}>
                    Next: {nextMv.name || "Movement"} →
                  </button>
                )}
              </div>
            ) : (
              <button onClick={finishAndAdvance} style={{
                width: "100%", padding: "18px", borderRadius: 16,
                background: STONE.primary,
                border: "none", color: C.ink,
                fontSize: 15, fontWeight: 600, cursor: "pointer",
                fontFamily: SANS, letterSpacing: 0.2,
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.3), 0 4px 18px rgba(0,0,0,0.35)",
              }}>
                {isLast ? "✓ Finish last movement" : `✓ Done · next: ${nextMv?.name || "Next"}`}
              </button>
            )}
          </div>
        )}
        {prToast && (
          <div key={prToast.id} onClick={() => setPrToast(null)} role="status"
            style={{ position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", zIndex: 300, display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderRadius: 14, background: STONE.rosa, color: INK.rosa, boxShadow: "0 8px 30px rgba(0,0,0,0.5)", fontFamily: SANS, fontSize: 15, fontWeight: 600, whiteSpace: "nowrap", animation: "wjToast 2800ms ease-out forwards" }}>
            <Trophy size={18} color={INK.rosa} strokeWidth={2.4} /> {prToast.text}
          </div>
        )}
        <BottomNav tab={tab} setTab={t => { setTab(t); if (t !== "journal") setView("journal"); }} onOpenMenu={() => setShowMoreMenu(true)} />
        <MoreMenu open={showMoreMenu} onClose={() => setShowMoreMenu(false)} onSelect={(id) => { setShowMoreMenu(false); setTab(id); setView("journal"); }} />
      </Shell>
    );
  }

  // ── ENTRY DETAIL ──────────────────────────────────────────────────────────
  if (view === "entry" && activeEntry) {
    const prog = activeEntry.programDay ? PROGRAM[activeEntry.programDay] : null;
    const color = prog?.color ?? C.text;
    const isRest = prog?.exercises?.length === 0;

    return (
      <Shell>
        <TopBar
          left={<BackBtn onClick={() => setView("journal")} label="Journal" />}
          right={
            <button onClick={() => deleteEntry(activeEntry.id)}
              style={{ ...btnStyle(C.alertWash, C.alert), border: "1px solid rgba(212,154,184,0.35)" }}>Delete</button>
          }
        />
        <div style={{ padding: "4px 18px 0" }}>
          <input type="date" style={{ ...ghostInput, fontSize: 16, color: C.textMid, marginBottom: 6 }}
            value={activeEntry.date}
            onChange={e => updateEntry(activeEntry.id, { date: e.target.value })} />
          <input style={bigInput} value={activeEntry.customTitle}
            onChange={e => updateEntry(activeEntry.id, { customTitle: e.target.value })}
            placeholder="Workout title…" />
          {prog && (
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
              <Pill color={color}>Day {activeEntry.programDay}</Pill>
              <Pill color={color}>{prog.tag}</Pill>
              {!isRest && (
                <div onClick={() => updateEntry(activeEntry.id, { location: activeEntry.location === "apartment" ? "equinox" : "apartment" })}
                  style={{ cursor: "pointer", padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, fontFamily: SANS, letterSpacing: 0.2, background: activeEntry.location === "apartment" ? "rgba(218,214,211,0.13)" : C.surface2, color: activeEntry.location === "apartment" ? C.warn : C.textMid, border: `1px solid ${activeEntry.location === "apartment" ? "rgba(201,166,190,0.33)" : C.line}` }}>
                  {LOCATIONS[activeEntry.location ?? "equinox"]?.short ?? "Equinox"} · tap to switch
                </div>
              )}
            </div>
          )}
        </div>

        {prog && !isRest && (() => {
          const r = activeEntry.readiness ?? {};
          const level = readinessLevel(r);
          const setR = (k, v) => updateEntry(activeEntry.id, { readiness: { ...r, [k]: r[k] === v ? null : v } });
          const row = (label, k, opts) => (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <div style={{ width: 64, fontSize: 12, color: C.textMid, fontFamily: SANS }}>{label}</div>
              {opts.map(([v, t]) => (
                <button key={v} onClick={() => setR(k, v)}
                  style={{ ...btnStyle(r[k] === v ? color : C.surface2, r[k] === v ? C.ink : C.textMid), flex: 1, padding: "8px 0", fontSize: 12, fontWeight: 600 }}>{t}</button>
              ))}
            </div>
          );
          return (
            <>
              <SectionLabel>Recovery Check-in</SectionLabel>
              <div style={{ margin: "0 18px 6px" }}>
                {row("Sleep", "sleep", READINESS_SLEEP)}
                {row("Soreness", "soreness", READINESS_SORE)}
                {level && <div style={{ fontSize: 12, color: level === "good" ? C.textMid : C.warn, fontFamily: SANS, lineHeight: 1.5, marginTop: 2 }}>{READINESS_TEXT[level]}</div>}
              </div>
            </>
          );
        })()}

        <SectionLabel>Session Notes</SectionLabel>
        <textarea style={noteArea} value={activeEntry.note}
          onChange={e => updateEntry(activeEntry.id, { note: e.target.value })}
          placeholder="How did today feel? Energy, sleep, PRs, anything…" rows={3} />

        {isRest ? (
          <div style={{ margin: "20px 18px", padding: "28px 20px", borderRadius: 16, background: C.surface2, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}><Moon size={34} color={C.textMid} strokeWidth={1.8} /></div>
            <div style={{ color: C.text, fontWeight: 600, fontSize: 15 }}>Rest Day</div>
            <div style={{ color: C.textMid, fontSize: 12, marginTop: 4 }}>Recovery is part of the program</div>
          </div>
        ) : (
          <>
            <SectionLabel>Warm-up</SectionLabel>
            <WarmupItem
              label="Stretching"
              checked={!!activeEntry.warmup?.stretchBefore}
              onToggle={() => toggleWarmup(activeEntry.id, "stretchBefore")}
            />
            <WarmupItem
              label="Incline Treadmill (10 min)"
              checked={!!activeEntry.warmup?.treadmill}
              onToggle={() => toggleWarmup(activeEntry.id, "treadmill")}
            />

            <SectionLabel>{activeEntry.movements.length} Movement{activeEntry.movements.length !== 1 ? "s" : ""}</SectionLabel>
            {activeEntry.movements.map((mv, i) => {
              const mvDone = !!mv.doneAt;
              const canMoveUp = i > 0;
              const isPR = isNewPR(activeEntry, mv, entries);
              const canMoveDown = i < activeEntry.movements.length - 1;
              return (
                <div key={mv.id}>
                  <MvCard color={mvDone ? C.text : color}
                    onClick={() => { setActiveMvId(mv.id); setView("movement"); setShowStopwatch(false); resetStopwatch(); }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div onClick={e => {
                        e.stopPropagation();
                        const hasLoggedReps = mv.sets.some(s => s.r && String(s.r).trim() !== "");
                        if (!mv.doneAt && !hasLoggedReps) {
                          alert("Log at least one set's reps before marking this movement done.");
                          return;
                        }
                        const ts = mv.doneAt ? null : new Date().toISOString();
                        updateMovement(activeEntry.id, mv.id, { doneAt: ts });
                      }} style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        background: mvDone ? STONE.primary : C.surface2,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 15, cursor: "pointer", transition: "all 0.15s",
                      }}>
                        {mvDone ? <span style={{ color: C.ink }}>✓</span> : <span style={{ fontSize: 12, fontFamily: SANS, fontWeight: 600, color: C.textDim }}>{mv.programRef ?? String(i + 1)}</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 15, color: mvDone ? C.text : C.text, lineHeight: 1.3, textDecoration: mvDone ? "line-through" : "none", opacity: mvDone ? 0.7 : 1, display: "flex", alignItems: "center", gap: 6 }}>
                          {mv.name || <span style={{ color: C.textDim }}>Unnamed movement</span>}
                          {isPR && <span style={{ fontSize: 12, fontWeight: 600, color: INK.rosa, background: STONE.rosa, padding: "2px 6px", borderRadius: 4, letterSpacing: 0.2, flexShrink: 0 }}>PR</span>}
                          {mv.substituted && <span style={{ fontSize: 12, fontWeight: 600, color: C.textMid, background: C.surface3, padding: "2px 6px", borderRadius: 4, letterSpacing: 0.2, flexShrink: 0 }}>Swap</span>}
                        </div>
                        <div style={{ fontSize: 12, color: C.textMid, marginTop: 3 }}>
                          {mv.repsTarget ? `${mv.setsTarget} sets · ${mv.repsTarget} reps` : `${mv.sets.length} sets logged`}
                          {mv.doneAt && <span style={{ color: "rgba(238,233,224,0.47)", marginLeft: 6 }}>· done {new Date(mv.doneAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
                          {mv.sets.map((s, si) => (
                            <span key={si} style={{
                              fontSize: 12, fontFamily: SANS,
                              padding: "3px 7px", borderRadius: 6,
                              background: s.r ? STONE.cipollino : C.surface3,
                              color: s.r ? INK.cipollino : C.textDim, fontWeight: 600,
                            }}>
                              {s.w ? `${s.w}×` : ""}{s.r || "–"}
                            </span>
                          ))}
                        </div>
                        {(() => { const di = deloadInfo(entries, activeEntry, mv); return di ? (<>
                          {di.plan && <DeloadPlanLine plan={di.plan} />}
                          <CueLine cue={di.cue} label={di.label} />
                        </>) : null; })()}
                      </div>
                      {/* Up/down reorder buttons */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => canMoveUp && reorderMovements(activeEntry.id, i, i - 1)}
                          style={{ width: 32, height: 32, borderRadius: 8, border: C.cardBorder, background: canMoveUp ? C.surface2 : "transparent", color: canMoveUp ? C.textMid : C.textDim, fontSize: 15, cursor: canMoveUp ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS }}>
                          ↑
                        </button>
                        <button
                          onClick={() => canMoveDown && reorderMovements(activeEntry.id, i, i + 1)}
                          style={{ width: 32, height: 32, borderRadius: 8, border: C.cardBorder, background: canMoveDown ? C.surface2 : "transparent", color: canMoveDown ? C.textMid : C.textDim, fontSize: 15, cursor: canMoveDown ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS }}>
                          ↓
                        </button>
                      </div>
                    </div>
                  </MvCard>
                </div>
              );
            })}
            <GhostBtn onClick={() => addMovement(activeEntry.id)}>+ Add Movement</GhostBtn>

            <SectionLabel>Cool-down</SectionLabel>
            <WarmupItem
              label="Stretching"
              checked={!!activeEntry.warmup?.stretchAfter}
              onToggle={() => toggleWarmup(activeEntry.id, "stretchAfter")}
            />
          </>
        )}

        {!isRest && (
          <div style={{ padding: "16px 18px 120px" }}>
            {activeEntry.completedAt ? (
              <div style={{ padding: "18px", borderRadius: 16, background: "rgba(215,212,216,0.13)", textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><Trophy size={30} color={C.accent} strokeWidth={2} /></div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: SANS }}>Workout complete</div>
                <div style={{ fontSize: 12, color: C.textDim, marginTop: 4, fontFamily: SANS }}>
                  {new Date(activeEntry.completedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  {" · "}
                  {activeEntry.movements.filter(m => m.doneAt).length}/{activeEntry.movements.length} movements done
                </div>
                <button onClick={() => updateEntry(activeEntry.id, { completedAt: null })}
                  style={{ marginTop: 10, padding: "6px 16px", borderRadius: 8, background: "transparent", color: C.textDim, fontSize: 12, fontFamily: SANS, cursor: "pointer" }}>
                  Undo
                </button>
              </div>
            ) : (
              <button onClick={() => {
                const ts = new Date().toISOString();
                // Compute PRs BEFORE mutating — comparison must be against history that
                // doesn't yet include this session's own numbers.
                const sessionPRs = collectSessionPRs(activeEntry, entries);
                mutate(prev => {
                  const updated = prev.map(e => e.id === activeEntry.id
                    ? { ...e, completedAt: ts, movements: e.movements.map(m => m.doneAt ? m : { ...m, doneAt: ts }) }
                    : e);
                  // Check if this completion finishes all 5 training days in the current cycle.
                  // IMPORTANT: only count sessions on/after the current cycleAnchor (if one exists).
                  // Without this boundary, an old session from a previous cycle with a day-number
                  // that hasn't repeated yet gets falsely counted as part of the current cycle,
                  // triggering a premature reset (the bug that reset the cycle to 0/5 after only
                  // 2 of the 5 days were actually done this time).
                  const trainingDayNums = Object.entries(PROGRAM)
                    .filter(([, d]) => d.exercises.length > 0)
                    .map(([dn]) => Number(dn));
                  const anchor = cycleAnchor;
                  const completedSessions = [...updated]
                    .filter(e => e.completedAt && e.programDay && trainingDayNums.includes(e.programDay) && (!anchor || e.date >= anchor))
                    .sort((a, b) => b.date.localeCompare(a.date) || b.completedAt.localeCompare(a.completedAt));
                  const completedInCycle = new Set();
                  if (anchor) {
                    // The anchor already bounds the cycle, so count every distinct day in it.
                    // Stopping at the first repeated day here is wrong: a day logged twice
                    // (e.g. Posterior Chain on two consecutive dates) cut the walk short before
                    // it reached earlier days, so the tracker read 5/5 but never rolled over.
                    for (const e of completedSessions) completedInCycle.add(e.programDay);
                  } else {
                    // No anchor to bound the cycle: fall back to stopping at the first repeat.
                    for (const e of completedSessions) {
                      if (completedInCycle.has(e.programDay)) break;
                      completedInCycle.add(e.programDay);
                    }
                  }
                  // If all 5 training days are now accounted for since the current cycle anchor, start a new one.
                  // IMPORTANT: anchor to the day AFTER this completion, not today's date itself —
                  // otherwise this very session (the one that just finished the OLD cycle) is not
                  // strictly before the new anchor, so it gets counted as already-done in the NEW
                  // cycle too. That's exactly the bug where the last session of a finished cycle
                  // (e.g. Push II) still showed as complete under the brand new cycle.
                  if (trainingDayNums.every(dn => completedInCycle.has(dn))) {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    saveCycleAnchor(localDateStr(tomorrow));
                  }
                  return updated;
                });
                setCompletionSummary({ entry: activeEntry, prs: sessionPRs });
              }} style={{
                width: "100%", padding: "18px", borderRadius: 16,
                background: STONE.primary,
                border: "none", color: C.ink,
                fontSize: 15, fontWeight: 600, cursor: "pointer",
                fontFamily: SANS, letterSpacing: 0.2,
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.3), 0 4px 18px rgba(0,0,0,0.35)",
              }}>
                ✓ Complete workout
              </button>
            )}
          </div>
        )}
        <BottomNav tab={tab} setTab={t => { setTab(t); if (t !== "journal") setView("journal"); }} onOpenMenu={() => setShowMoreMenu(true)} />
        <MoreMenu open={showMoreMenu} onClose={() => setShowMoreMenu(false)} onSelect={(id) => { setShowMoreMenu(false); setTab(id); setView("journal"); }} />
        <CompletionSummary summary={completionSummary} onClose={() => setCompletionSummary(null)} />
      </Shell>
    );
  }

  // ── MACROS TAB ───────────────────────────────────────────────────────────
  if (tab === "macros") {
    const day = macros[macroDate] ?? { entries: [] };
    const dType = detectDayType(macroDate);
    const targets = macroTargets[dType] ?? DEFAULT_MACRO_TARGETS.training;
    const targetCals = macroCals(targets.p, targets.c, targets.f);
    const totals = dayTotals(day);
    const isToday = macroDate === todayStr();
    const trainedToday = trainedOn(macroDate);

    function shiftDate(delta) {
      const d = new Date(macroDate + "T12:00:00");
      d.setDate(d.getDate() + delta);
      const next = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      if (next <= todayStr()) setMacroDate(next);
    }
    function toggleDayType() {
      if (trainedToday) return; // a logged session locks the day to training
      mutateMacros(prev => {
        const d = prev[macroDate] ?? { entries: [] };
        const newType = dType === "training" ? "rest" : "training";
        prev[macroDate] = { ...d, dayType: newType, dayTypeManual: true };
        return prev;
      });
    }
    function addFood() {
      if (!foodName.trim() && !foodP && !foodC && !foodF) return;
      const p = parseFloat(foodP) || 0, c = parseFloat(foodC) || 0, f = parseFloat(foodF) || 0;
      if (editingFoodId) {
        // Update the existing entry in place, keep its original id/time
        mutateMacros(prev => {
          const d = prev[macroDate];
          if (!d) return prev;
          prev[macroDate] = {
            ...d,
            entries: d.entries.map(e => e.id === editingFoodId
              ? { ...e, name: foodName.trim() || "Food", p, c, f, cal: macroCals(p, c, f) }
              : e),
          };
          return prev;
        });
        setEditingFoodId(null);
      } else {
        const entry = {
          id: Date.now(),
          name: foodName.trim() || "Food",
          p, c, f,
          cal: macroCals(p, c, f),
          time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        };
        mutateMacros(prev => {
          const d = prev[macroDate] ?? { entries: [], dayType: dType };
          prev[macroDate] = { ...d, entries: [...(d.entries ?? []), entry] };
          return prev;
        });
      }
      setFoodName(""); setFoodP(""); setFoodC(""); setFoodF("");
      setShowFoodModal(false);
    }
    function startEditFood(entry) {
      setEditingFoodId(entry.id);
      setFoodName(entry.name || "");
      setFoodP(entry.p ? String(entry.p) : "");
      setFoodC(entry.c ? String(entry.c) : "");
      setFoodF(entry.f ? String(entry.f) : "");
      setAiDescription(""); setFoodPhoto(null); setAiError("");
      setShowFoodModal(true);
    }
    function deleteFood(id) {
      mutateMacros(prev => {
        const d = prev[macroDate];
        if (!d) return prev;
        prev[macroDate] = { ...d, entries: d.entries.filter(e => e.id !== id) };
        return prev;
      });
    }
    function logAgain(entry) {
      const newId = Date.now();
      const { date: _searchDate, ...clean } = entry; // search results carry a display-only date
      mutateMacros(prev => {
        const d = prev[todayStr()] ?? { entries: [] };
        prev[todayStr()] = { ...d, entries: [...(d.entries ?? []), { ...clean, id: newId, time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) }] };
        return prev;
      });
      return newId;
    }
    // "+" with feedback: flash the tapped row, check-mark the button, glow the new
    // entry in today's list, and a short haptic tap where the browser supports it.
    function logAgainWithFeedback(entry, flashKey, after) {
      const newId = logAgain(entry);
      try { navigator.vibrate?.(15); } catch {}
      setMacroFlashKey(flashKey);
      setMacroHighlightId(newId);
      clearTimeout(macroFlashTimer.current);
      macroFlashTimer.current = setTimeout(() => {
        setMacroFlashKey(null);
        if (after) after();
      }, 650);
      setTimeout(() => setMacroHighlightId(h => (h === newId ? null : h)), 1800);
    }
    async function aiLogFoodPhoto() {
      if (!foodPhoto) return;
      setAiLoading(true); setAiError("");
      try {
        const base64Data = foodPhoto.dataUrl.split(",")[1];
        const resp = await apiFetch("/api/claude", {
          method: "POST",
          headers: appHeaders(),
          body: JSON.stringify({
            model: "claude-sonnet-4-5",
            max_tokens: 3000,
            tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }],
            messages: [{
              role: "user",
              content: [
                { type: "image", source: { type: "base64", media_type: foodPhoto.mediaType, data: base64Data } },
                { type: "text", text: (aiDescription.trim()
                    ? `Log macros for the food shown in this photo. IMPORTANT: the person has given this note about what they actually ate, and it overrides what you would guess from the image alone (for example "half of this" or "2 of the 4 pieces" means calculate that actual portion, not the full plate shown). Note: "${aiDescription.trim()}". `
                    : `Log macros for the food shown in this photo, for the full portion visible. `)
                    + `If the photo does NOT show identifiable food (blank, unrelated, too unclear), respond with ONLY: {"unidentifiable": true} and skip everything below.

Break what you see into its individual components. A bowl or plate with several parts is MULTIPLE items: count each protein, base, sauce, and topping separately.

For each component:
- If a brand, package or restaurant is identifiable, use web_search to find that specific item's published nutrition data. Search efficiently, one query per component at most, and skip searching for generic whole foods where you already know standard values.
- Judge the visible portion size and scale accordingly.

Cooking oil, dressings and sauces are real calories. Include them as their own line item when the dish would realistically contain them.

Respond with ONLY this JSON object as your final message, no markdown, no other text before or after it. Keep item names to a few words:
{"name": "short meal name", "items": [{"n": "item name", "p": protein g, "c": carbs g, "f": fat g}], "p": total protein g, "c": total carbs g, "f": total fat g}

The totals MUST equal the sum of the items. Do not let the totals disagree with the breakdown.` },
              ],
            }],
          }),
        });
        const data = await resp.json();
        if (data.error) throw new Error(data.error.message || "API error");
        if (data.stop_reason === "max_tokens") {
          setAiError("The response was too long and got cut off (hit the token limit). Try a simpler description, or use manual entry below.");
          setAiLoading(false);
          return;
        }
        const textBlocks = (data.content ?? []).filter(b => b.type === "text").map(b => b.text);
        const text = textBlocks.length ? textBlocks[textBlocks.length - 1] : "";
        const clean = text.replace(/```json|```/g, "").trim();
        const jsonMatch = clean.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          setAiError(`AI didn't return a usable answer. Raw response: "${clean.slice(0, 150)}" — try again, or use manual entry below.`);
          setAiLoading(false);
          return;
        }
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.unidentifiable) {
          setAiError("Couldn't identify food in that photo — try a clearer shot, or use manual entry below.");
          setAiLoading(false);
          return;
        }
        // Code-level check: totals must equal the sum of the component breakdown.
        // When they disagree, trust the breakdown over the headline total.
        let items = Array.isArray(parsed.items) ? parsed.items : [];
        let corrected = false;
        if (items.length > 0) {
          const sum = k => items.reduce((n, it) => n + (parseFloat(it[k]) || 0), 0);
          const sp = sum("p"), sc = sum("c"), sf = sum("f");
          const gp = parseFloat(parsed.p) || 0, gc = parseFloat(parsed.c) || 0, gf = parseFloat(parsed.f) || 0;
          const off = (a, b) => b > 0 && Math.abs(a - b) / b > 0.1;
          if (off(gp, sp) || off(gc, sc) || off(gf, sf)) {
            parsed.p = Math.round(sp);
            parsed.c = Math.round(sc);
            parsed.f = Math.round(sf);
            corrected = true;
          }
        }
        // Show for review/confirmation rather than logging immediately
        setAiPendingReview({
          name: parsed.name || "Food (photo)",
          p: parseFloat(parsed.p) || 0,
          c: parseFloat(parsed.c) || 0,
          f: parseFloat(parsed.f) || 0,
          source: items.length
            ? items.map(it => `${it.n}: ${Math.round(parseFloat(it.p) || 0)}p/${Math.round(parseFloat(it.c) || 0)}c/${Math.round(parseFloat(it.f) || 0)}f`).join(" · ")
              + (corrected ? " (totals corrected to match breakdown)" : "")
            : null,
        });
      } catch (err) {
        const isTruncated = err instanceof SyntaxError;
        setAiError(isTruncated
          ? "The AI's answer got cut off before finishing — this can happen when a search takes a while. Try again, or use manual entry below."
          : (err.message || "AI photo estimate failed — use manual entry."));
      } finally {
        setAiLoading(false);
      }
    }
    function handlePhotoSelect(file) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => setFoodPhoto({ dataUrl: e.target.result, mediaType: file.type || "image/jpeg" });
      reader.readAsDataURL(file);
    }
    async function aiLogFood() {
      if (!aiDescription.trim()) return;
      setAiLoading(true); setAiError("");
      try {
        const resp = await apiFetch("/api/claude", {
          method: "POST",
          headers: appHeaders(),
          body: JSON.stringify({
            model: "claude-sonnet-4-5",
            max_tokens: 3000,
            tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 5 }],
            messages: [{ role: "user", content: `Log macros for this food: "${aiDescription}"

If this text does NOT describe an identifiable food or meal (gibberish, random letters, empty, unrelated to food), respond with ONLY: {"unidentifiable": true} and skip everything below.

Break the description into its individual components. A restaurant bowl or a plate with several parts is MULTIPLE items: count each protein, base, sauce, and topping separately, and respect the stated quantity of each (for example "two servings of chicken" is 2x one serving).

For each component, get per-serving macros:
- If a brand or restaurant is named, use web_search to find that specific item's published nutrition data. Search efficiently, one query per component at most, and skip searching for generic whole foods like plain rice or chicken breast where you already know standard values.
- Scale each component by the number of servings stated.

Cooking oil, dressings and sauces are real calories. Include them as their own line item when the dish would realistically contain them.

Respond with ONLY this JSON object as your final message, no markdown, no other text before or after it. Keep item names to a few words:
{"name": "short meal name", "items": [{"n": "item name", "p": protein g, "c": carbs g, "f": fat g}], "p": total protein g, "c": total carbs g, "f": total fat g}

The totals MUST equal the sum of the items. Do not let the totals disagree with the breakdown.` }],
          }),
        });
        const data = await resp.json();
        if (data.error) throw new Error(data.error.message || "API error");
        if (data.stop_reason === "max_tokens") {
          setAiError("The response was too long and got cut off (hit the token limit). Try a simpler description, or use manual entry below.");
          setAiLoading(false);
          return;
        }
        // A search-enabled turn returns multiple content blocks (text explaining the search,
        // tool_use/tool_result blocks, and the final answer). Only the text blocks matter here;
        // the final JSON is the last text block in the response.
        const textBlocks = (data.content ?? []).filter(b => b.type === "text").map(b => b.text);
        const text = textBlocks.length ? textBlocks[textBlocks.length - 1] : "";
        const clean = text.replace(/```json|```/g, "").trim();
        const jsonMatch = clean.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          setAiError(`AI didn't return a usable answer. Raw response: "${clean.slice(0, 150)}" — try again, or use manual entry below.`);
          setAiLoading(false);
          return;
        }
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.unidentifiable) {
          setAiError("Couldn't identify a food in that description — try rephrasing, or use manual entry below.");
          setAiLoading(false);
          return;
        }
        // Code-level check: the stated totals must equal the sum of the component
        // breakdown. Models routinely produce a confident headline total that
        // contradicts their own itemized table. When they disagree, trust the
        // breakdown, since that is the part with visible per-item reasoning.
        let items = Array.isArray(parsed.items) ? parsed.items : [];
        let corrected = false;
        if (items.length > 0) {
          const sum = k => items.reduce((n, it) => n + (parseFloat(it[k]) || 0), 0);
          const sp = sum("p"), sc = sum("c"), sf = sum("f");
          const gp = parseFloat(parsed.p) || 0, gc = parseFloat(parsed.c) || 0, gf = parseFloat(parsed.f) || 0;
          const off = (a, b) => b > 0 && Math.abs(a - b) / b > 0.1;
          if (off(gp, sp) || off(gc, sc) || off(gf, sf)) {
            parsed.p = Math.round(sp);
            parsed.c = Math.round(sc);
            parsed.f = Math.round(sf);
            corrected = true;
          }
        }
        // Show for review/confirmation rather than logging immediately —
        // catches cases where the estimate looks obviously wrong before it's saved.
        setAiPendingReview({
          name: parsed.name || aiDescription.slice(0, 40),
          p: parseFloat(parsed.p) || 0,
          c: parseFloat(parsed.c) || 0,
          f: parseFloat(parsed.f) || 0,
          source: items.length
            ? items.map(it => `${it.n}: ${Math.round(parseFloat(it.p) || 0)}p/${Math.round(parseFloat(it.c) || 0)}c/${Math.round(parseFloat(it.f) || 0)}f`).join(" · ")
              + (corrected ? " (totals corrected to match breakdown)" : "")
            : null,
        });
      } catch (err) {
        const isTruncated = err instanceof SyntaxError;
        setAiError(isTruncated
          ? "The AI's answer got cut off before finishing — this can happen when a search takes a while. Try again, or use manual entry below."
          : (err.message || "AI estimate failed — use manual entry."));
      } finally {
        setAiLoading(false);
      }
    }

    // All tracks share one grams scale: the track width is target / largest target,
    // so carbs is full width and protein and fat are visibly shorter. The empty gap
    // on the right of each fill is what is left to eat. The "left" amount sits in the
    // row above the bar so a short bar never has to carry text.
    const macroBar = (label, val, target, barColor, scaleMax) => {
      const over = val > target;
      const left = Math.max(0, target - val);
      const trackPct = scaleMax > 0 ? Math.min(100, (target / scaleMax) * 100) : 100;
      const fillPct = Math.min(100, target > 0 ? (val / target) * 100 : 0);
      return (
        <div key={label} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
            <span style={{ fontSize: 12, color: C.textMid, fontFamily: SANS, fontWeight: 600 }}>
              {label} <span style={{ fontFamily: MONO, fontVariantNumeric: "tabular-nums", fontWeight: 400, color: over ? C.red : C.textDim }}>{Math.round(val)} / {target}g</span>
            </span>
            <span style={{ fontSize: 12, fontFamily: MONO, fontVariantNumeric: "tabular-nums", fontWeight: 600, color: over ? C.red : barColor }}>
              {over ? `${Math.round(val - target)}g over` : `${Math.round(left)}g left`}
            </span>
          </div>
          <div style={{ width: `${trackPct}%`, height: 10, borderRadius: 5, background: C.surface2, overflow: "hidden" }}>
            <div style={{ width: `${fillPct}%`, height: "100%", background: fill(over ? C.red : barColor), borderRadius: 5, transition: "width 0.3s" }} />
          </div>
        </div>
      );
    };

    // Calories left, split by macro: each segment is the kcal still to come from that
    // macro (protein and carbs 4 per gram, fat 9). Grams inside the segments, kcal under.
    const remainingSplit = () => {
      const rem = [
        { key: "Protein", g: Math.max(0, targets.p - totals.p), kcal: Math.max(0, targets.p - totals.p) * 4, color: C.low },
        { key: "Carbs", g: Math.max(0, targets.c - totals.c), kcal: Math.max(0, targets.c - totals.c) * 4, color: C.success },
        { key: "Fat", g: Math.max(0, targets.f - totals.f), kcal: Math.max(0, targets.f - totals.f) * 9, color: C.pr },
      ];
      const sumKcal = rem.reduce((n, r) => n + r.kcal, 0);
      const calLeft = targetCals - totals.cal;
      return (
        <div style={{ marginTop: 6, paddingTop: 14, borderTop: `1px solid ${C.surface2}` }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: C.textMid, fontFamily: SANS, fontWeight: 600 }}>Left to eat</span>
            <span style={{ fontFamily: MONO, fontVariantNumeric: "tabular-nums", fontSize: 12, fontWeight: 600, color: calLeft < 0 ? C.red : C.text }}>
              {calLeft < 0 ? `${Math.abs(calLeft)} kcal over` : `${calLeft} kcal left`}
            </span>
          </div>
          {sumKcal <= 0 ? (
            <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS }}>All three macro targets are hit.</div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 2, height: 30, borderRadius: 8, overflow: "hidden" }}>
                {rem.filter(r => r.kcal > 0).map(r => (
                  <div key={r.key} style={{ flex: r.kcal, minWidth: 0, background: fill(r.color), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, fontFamily: MONO, fontVariantNumeric: "tabular-nums", color: inkOn(r.color), whiteSpace: "nowrap" }}>
                    {r.kcal / sumKcal > 0.12 ? `${Math.round(r.g)}g` : ""}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 2, marginTop: 6 }}>
                {rem.filter(r => r.kcal > 0).map(r => (
                  <div key={r.key} style={{ flex: r.kcal, minWidth: 0, textAlign: "center", fontSize: 12, fontFamily: MONO, fontVariantNumeric: "tabular-nums", color: C.textDim, whiteSpace: "nowrap" }}>
                    {r.kcal / sumKcal > 0.12 ? `${Math.round(r.kcal)} kcal` : `${Math.round(r.kcal)}`}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                {rem.filter(r => r.kcal > 0).map(r => (
                  <div key={r.key} style={{ flex: r.kcal, minWidth: 0, textAlign: "center", fontSize: 12, fontFamily: SANS, color: C.textDim, whiteSpace: "nowrap" }}>
                    {r.kcal / sumKcal > 0.12 ? r.key : r.key[0]}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      );
    };

    return (
      <Shell>
        <div style={{ padding: "52px 18px 16px", background: "transparent" }}>
          <div style={{ fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontFamily: SANS, marginBottom: 4 }}>Nutrition</div>
          <div style={{ ...TITLE, color: C.text }}>Macros</div>
          {/* Date navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
            <button onClick={() => shiftDate(-1)} style={{ background: C.surface2, borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><ChevronLeft size={16} color={C.textMid} /></button>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: SANS, flex: 1, textAlign: "center" }}>
              {isToday ? "Today" : fmtDate(macroDate)}
            </div>
            <button onClick={() => shiftDate(1)} disabled={isToday} style={{ background: C.surface2, borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: isToday ? "default" : "pointer", opacity: isToday ? 0.3 : 1 }}><ChevronRight size={16} color={C.textMid} /></button>
          </div>
        </div>

        {/* Day type banner — auto-detected from workout journal */}
        <div onClick={toggleDayType} style={{ margin: "12px 18px 4px", padding: "12px 16px", borderRadius: 14, cursor: "pointer",
          background: dType === "training" ? `linear-gradient(rgba(12,12,12,0.6), rgba(12,12,12,0.6)), ${STONE.bardiglio}` : C.surface, border: C.cardBorder,
          
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: dType === "training" ? C.text : C.textMid, letterSpacing: 0.2, fontFamily: SANS }}>
              {dType === "training" ? "Training Day" : "Rest Day"}
            </div>
            <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS, marginTop: 2 }}>
              {trainedToday ? "Auto: session logged, locked to training" : macros[macroDate]?.dayTypeManual ? "Manually set · tap to switch" : "Auto: no session yet · tap to override"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, fontFamily: MONO, fontVariantNumeric: "tabular-nums", fontWeight: 600, color: totals.cal > targetCals ? C.red : C.text }}>
              {totals.cal} <span style={{ color: C.textDim, fontWeight: 400 }}>/ {targetCals}</span>
            </div>
            <div style={{ fontSize: 12, fontFamily: MONO, fontVariantNumeric: "tabular-nums", color: C.textDim, marginTop: 1 }}>
              {Math.max(0, targetCals - totals.cal)} left
            </div>
          </div>
        </div>

        {/* Calorie summary, macro tracks on one shared grams scale, then calories left split by macro */}
        <div style={{ margin: "10px 18px", padding: "16px", borderRadius: 18, background: C.surface, border: C.cardBorder, boxShadow: shadow }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: SANS }}>Calories</span>
            <span style={{ fontFamily: MONO, fontVariantNumeric: "tabular-nums" }}>
              <span style={{ ...HERO, color: totals.cal > targetCals ? C.red : C.text }}>{totals.cal}</span>
              <span style={{ fontSize: 12, color: C.textDim }}> / {targetCals}</span>
            </span>
          </div>
          {(() => {
            const scaleMax = Math.max(targets.p, targets.c, targets.f);
            return (
              <>
                {macroBar("Protein", totals.p, targets.p, C.low, scaleMax)}
                {macroBar("Carbs", totals.c, targets.c, C.success, scaleMax)}
                {macroBar("Fat", totals.f, targets.f, C.pr, scaleMax)}
              </>
            );
          })()}
          {remainingSplit()}
        </div>

        <div style={{ display: "flex", gap: 10, padding: "0 18px 8px" }}>
          <button onClick={() => { setAiError(""); setAiPendingReview(null); setEditingFoodId(null); setFoodName(""); setFoodP(""); setFoodC(""); setFoodF(""); setShowFoodModal(true); }}
            style={{ flex: 2, padding: "14px", borderRadius: 14, background: STONE.primary, border: "none", color: C.ink, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: SANS, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Plus size={16} strokeWidth={2.5} /> Log Food
          </button>
          <button onClick={() => setShowChef(true)}
            style={{ padding: "14px", borderRadius: 14, background: C.surface2, color: LAKE.forest, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Macro Chef">
            <Utensils size={16} strokeWidth={2} />
          </button>
          <button onClick={() => setShowMacroSearch(s => !s)}
            style={{ padding: "14px", borderRadius: 14, background: showMacroSearch ? LAKE.sky + "33" : C.surface2, color: showMacroSearch ? LAKE.sky : C.textMid, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Search food history">
            <Search size={16} strokeWidth={2} />
          </button>
          <button onClick={() => setShowTargetsModal(true)}
            style={{ padding: "14px", borderRadius: 14, background: C.surface2, color: C.textMid, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Targets
          </button>
        </div>

        {/* Food search across all history: a full-screen sheet sized to the space above the
            keyboard, with the field pinned on top so matches always show right under it. */}
        {showMacroSearch && (
          <FoodSearchSheet
            query={macroSearchQuery}
            setQuery={setMacroSearchQuery}
            onClose={() => { setShowMacroSearch(false); setMacroSearchQuery(""); }}
            results={(() => {
              const q = macroSearchQuery.trim().toLowerCase();
              if (!q) return [];
              const results = [];
              Object.keys(macros).sort((a, b) => b.localeCompare(a)).forEach(dateKey => {
                (macros[dateKey]?.entries ?? []).forEach(e => {
                  if (e.name?.toLowerCase().includes(q)) results.push({ ...e, date: dateKey });
                });
              });
              return results.slice(0, 30);
            })()}
            renderRow={r => {
              const fk = `search-${r.date}-${r.id}`;
              const flashing = macroFlashKey === fk;
              return (
                <div key={`${r.date}-${r.id}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: C.surface, border: C.cardBorder, marginBottom: 6, animation: flashing ? "wjFlash 650ms ease-out" : "none" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: C.textDim, fontFamily: MONO, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>{fmtDate(r.date)} · {r.cal} kcal · {Math.round(r.p)}p/{Math.round(r.c)}c/{Math.round(r.f)}f</div>
                  </div>
                  <button onClick={() => { if (macroFlashKey) return; logAgainWithFeedback(r, fk, () => { setShowMacroSearch(false); setMacroSearchQuery(""); }); }}
                    aria-label="Add to today"
                    style={{ width: 40, height: 40, borderRadius: 10, background: flashing ? STONE.cipollino : C.surface2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s", flexShrink: 0 }}>
                    {flashing
                      ? <span style={{ display: "flex", animation: "wjPop 300ms ease-out" }}><Check size={16} color={C.ink} strokeWidth={3} /></span>
                      : <Plus size={16} color={LAKE.sky} strokeWidth={2.5} />}
                  </button>
                </div>
              );
            }}
          />
        )}

        {/* Entries list */}
        <div style={{ padding: "8px 18px 4px" }}>
          <div style={{ fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontFamily: SANS, fontWeight: 600 }}>
            {(day.entries ?? []).length} entr{(day.entries ?? []).length === 1 ? "y" : "ies"}
          </div>
        </div>
        <div style={{ padding: "4px 18px 180px" }}>
          {(day.entries ?? []).length === 0 ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: C.textDim, fontSize: 12, fontFamily: SANS }}>Nothing logged {isToday ? "yet today" : "this day"}</div>
          ) : [...day.entries].reverse().map(e => {
            const fk = `list-${e.id}`;
            const flashing = macroFlashKey === fk;
            const isNew = macroHighlightId === e.id;
            return (
            <div key={e.id} onClick={() => isToday && startEditFood(e)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, background: C.surface, border: C.cardBorder, marginBottom: 8, cursor: isToday ? "pointer" : "default", animation: isNew ? "wjHighlight 1800ms ease-out" : flashing ? "wjFlash 650ms ease-out" : "none" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</div>
                <div style={{ fontSize: 12, color: C.textDim, fontFamily: MONO, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>
                  {e.cal || 0} kcal · {Math.round(e.p) || 0}p / {Math.round(e.c) || 0}c / {Math.round(e.f) || 0}f{e.time ? ` · ${e.time}` : ""}
                </div>
              </div>
              {isToday && (
                <button onClick={(ev) => { ev.stopPropagation(); startEditFood(e); }} title="Edit"
                  style={{ width: 30, height: 30, borderRadius: 8, background: C.surface2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Pencil size={13} color={C.textMid} strokeWidth={2} />
                </button>
              )}
              <button onClick={(ev) => { ev.stopPropagation(); if (macroFlashKey) return; logAgainWithFeedback(e, fk); }} title="Log again today"
                style={{ width: 30, height: 30, borderRadius: 8, background: flashing ? STONE.cipollino : C.surface2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}>
                {flashing
                  ? <span style={{ display: "flex", animation: "wjPop 300ms ease-out" }}><Check size={14} color={C.ink} strokeWidth={3} /></span>
                  : <Plus size={14} color={LAKE.sky} strokeWidth={2.5} />}
              </button>
              <button onClick={(ev) => { ev.stopPropagation(); deleteFood(e.id); }}
                style={{ width: 30, height: 30, borderRadius: 8, background: C.alertWash, border: "1px solid rgba(212,154,184,0.25)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={14} color={C.red} strokeWidth={2.5} />
              </button>
            </div>
            );
          })}
        </div>

        {/* Log Food modal */}
        {showFoodModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "flex-end", zIndex: 100 }}
            onClick={() => { setShowFoodModal(false); setFoodPhoto(null); setAiError(""); setAiPendingReview(null); setEditingFoodId(null); setFoodName(""); setFoodP(""); setFoodC(""); setFoodF(""); }}>
            <div style={{ background: C.sheet, width: "100%", borderRadius: "24px 24px 0 0", padding: "24px 18px 44px", borderBottom: "none", boxSizing: "border-box", maxHeight: "85vh", overflowY: "auto" }}
              onClick={e => e.stopPropagation()}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: C.line, margin: "0 auto 20px" }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 16, fontFamily: SANS }}>{editingFoodId ? "Edit Entry" : aiPendingReview ? "Review Estimate" : "Log Food"}</div>

              {aiPendingReview && (
                <div style={{ marginBottom: 18, padding: "16px", borderRadius: 14, background: C.surface2 }}>
                  <div style={{ fontSize: 12, letterSpacing: 0.2, color: LAKE.ochre, fontFamily: SANS, fontWeight: 600, marginBottom: 10 }}>Check before logging</div>
                  <input value={aiPendingReview.name} onChange={e => setAiPendingReview({ ...aiPendingReview, name: e.target.value })}
                    style={{ width: "100%", background: C.surface3, borderRadius: 10, padding: "11px 14px", fontSize: 16, fontWeight: 600, color: C.text, outline: "none", fontFamily: SANS, boxSizing: "border-box", marginBottom: 10, border: "none" }} />
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    {[["Protein", "p"], ["Carbs", "c"], ["Fat", "f"]].map(([lbl, key]) => (
                      <div key={key} style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontFamily: SANS, marginBottom: 4, textAlign: "center" }}>{lbl} g</div>
                        <input type="number" inputMode="decimal" value={aiPendingReview[key]}
                          onChange={e => setAiPendingReview({ ...aiPendingReview, [key]: parseFloat(e.target.value) || 0 })}
                          style={{ width: "100%", background: C.surface3, borderRadius: 10, padding: "11px 6px", fontSize: 16, fontWeight: 600, color: C.text, textAlign: "center", outline: "none", fontFamily: MONO, fontVariantNumeric: "tabular-nums", boxSizing: "border-box", border: "none" }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: C.textMid, fontFamily: MONO, fontVariantNumeric: "tabular-nums", textAlign: "center", marginBottom: 14 }}>
                    = {macroCals(aiPendingReview.p, aiPendingReview.c, aiPendingReview.f)} kcal
                  </div>
                  {aiPendingReview.source && (
                    <div style={{ fontSize: 12, color: LAKE.sky, fontFamily: SANS, marginBottom: 10, lineHeight: 1.5, padding: "8px 10px", background: C.surface3, borderRadius: 8, maxHeight: 120, overflowY: "auto", wordBreak: "break-word" }}>
                      Breakdown: {aiPendingReview.source}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS, marginBottom: 14, lineHeight: 1.5 }}>
                    Does this look right for what you actually ate? Adjust the numbers above if not, then confirm.
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => { setAiPendingReview(null); setAiDescription(""); setFoodPhoto(null); }}
                      style={{ flex: 1, padding: "14px", borderRadius: 12, background: C.surface3, color: C.textMid, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: SANS, border: "none" }}>
                      Discard
                    </button>
                    <button onClick={() => {
                      const entry = {
                        id: Date.now(),
                        name: aiPendingReview.name || "Food",
                        p: aiPendingReview.p, c: aiPendingReview.c, f: aiPendingReview.f,
                        cal: macroCals(aiPendingReview.p, aiPendingReview.c, aiPendingReview.f),
                        time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
                      };
                      mutateMacros(prev => {
                        const d = prev[macroDate] ?? { entries: [], dayType: dType };
                        prev[macroDate] = { ...d, entries: [...(d.entries ?? []), entry] };
                        return prev;
                      });
                      setAiPendingReview(null); setAiDescription(""); setFoodPhoto(null);
                      setShowFoodModal(false);
                    }} style={{ flex: 2, padding: "14px", borderRadius: 12, background: STONE.primary, color: C.ink, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: SANS, border: "none" }}>
                      Confirm & Log
                    </button>
                  </div>
                </div>
              )}

              {!editingFoodId && !aiPendingReview && (
              <>
              {/* Photo logging */}
              <div style={{ marginBottom: 14, padding: "14px", borderRadius: 14, background: C.surface2 }}>
                <div style={{ fontSize: 12, letterSpacing: 0.2, color: LAKE.forest, fontFamily: SANS, fontWeight: 600, marginBottom: 8 }}>Snap a Photo — AI estimates</div>
                {foodPhoto ? (
                  <div style={{ position: "relative", marginBottom: 8 }}>
                    <img src={foodPhoto.dataUrl} alt="Food" style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 10 }} />
                    <button onClick={() => setFoodPhoto(null)}
                      style={{ position: "absolute", top: 6, right: 6, width: 26, height: 26, borderRadius: 8, background: "rgba(0,0,0,0.7)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <X size={14} color={C.text} strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "18px", borderRadius: 10, border: `1.5px dashed ${C.line}`, cursor: "pointer", color: C.textMid, fontSize: 12, fontFamily: SANS }}>
                    <input type="file" accept="image/*" style={{ display: "none" }}
                      onChange={e => handlePhotoSelect(e.target.files[0])} />
                    Take Photo or Choose Image
                  </label>
                )}
                {foodPhoto && (
                  <>
                    <textarea value={aiDescription} onChange={e => setAiDescription(e.target.value)} rows={2}
                      placeholder="Optional: correct the portion — e.g. &quot;I only ate half of this&quot; or &quot;2 of the 4 pieces&quot; — tap the mic on your keyboard to speak this"
                      style={{ width: "100%", marginTop: 10, background: C.surface3, borderRadius: 10, padding: "10px 12px", fontSize: 16, color: C.text, outline: "none", resize: "none", fontFamily: SANS, boxSizing: "border-box" }} />
                    <button onClick={aiLogFoodPhoto} disabled={aiLoading}
                      style={{ width: "100%", marginTop: 8, padding: "11px", borderRadius: 10, background: aiLoading ? C.surface : STONE.primary, border: "none", color: aiLoading ? C.textDim : C.ink, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                      {aiLoading ? "Searching for nutrition data…" : "Estimate & Log from Photo"}
                    </button>
                  </>
                )}
              </div>

              {/* AI describe (text only, no photo) — hidden once a photo is attached, since the photo section above already has its own note field and action button */}
              {!foodPhoto && (
              <div style={{ marginBottom: 18, padding: "14px", borderRadius: 14, background: C.surface2 }}>
                <div style={{ fontSize: 12, letterSpacing: 0.2, color: LAKE.sky, fontFamily: SANS, fontWeight: 600, marginBottom: 8 }}>Describe It — AI estimates</div>
                <div style={{ fontSize: 12, color: C.textDim, marginBottom: 8, fontFamily: SANS }}>No photo — type it, or tap the mic on your keyboard to speak it.</div>
                <textarea value={aiDescription} onChange={e => setAiDescription(e.target.value)} rows={2}
                  placeholder="e.g. 1.5 scoops whey with oat milk and a banana"
                  style={{ width: "100%", background: C.surface3, borderRadius: 10, padding: "10px 12px", fontSize: 16, color: C.text, outline: "none", resize: "none", fontFamily: SANS, boxSizing: "border-box" }} />
                <button onClick={aiLogFood} disabled={aiLoading}
                  style={{ width: "100%", marginTop: 8, padding: "11px", borderRadius: 10, background: aiLoading ? C.surface : STONE.primary, border: "none", color: aiLoading ? C.textDim : C.ink, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                  {aiLoading ? "Searching for nutrition data…" : "Estimate & Log"}
                </button>
                {aiError && <div style={{ marginTop: 8, fontSize: 12, color: C.red, fontFamily: SANS }}>{aiError}</div>}
              </div>
              )}
              </>
              )}

              {!aiPendingReview && !foodPhoto && (
              <>
              {/* Manual entry (always shown when not reviewing — this is the edit form too) */}
              <div style={{ fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontFamily: SANS, fontWeight: 600, marginBottom: 8 }}>{editingFoodId ? "Edit Details" : "Or Enter Manually"}</div>
              <input value={foodName} onChange={e => setFoodName(e.target.value)} placeholder="Food name"
                style={{ width: "100%", background: C.surface2, borderRadius: 10, padding: "11px 14px", fontSize: 16, color: C.text, outline: "none", fontFamily: SANS, boxSizing: "border-box", marginBottom: 10 }} />
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                {[["Protein", foodP, setFoodP], ["Carbs", foodC, setFoodC], ["Fat", foodF, setFoodF]].map(([lbl, val, setter]) => (
                  <div key={lbl} style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontFamily: SANS, marginBottom: 4, textAlign: "center" }}>{lbl} g</div>
                    <input type="number" inputMode="decimal" value={val} onChange={e => setter(e.target.value)} placeholder="0"
                      style={{ width: "100%", background: C.surface2, borderRadius: 10, padding: "11px 6px", fontSize: 16, fontWeight: 600, color: C.text, textAlign: "center", outline: "none", fontFamily: MONO, fontVariantNumeric: "tabular-nums", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: C.textMid, fontFamily: MONO, fontVariantNumeric: "tabular-nums", textAlign: "center", marginBottom: 14 }}>
                = {macroCals(foodP, foodC, foodF)} kcal
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {editingFoodId && (
                  <button onClick={() => { setAiPendingReview(null); setEditingFoodId(null); setFoodName(""); setFoodP(""); setFoodC(""); setFoodF(""); setShowFoodModal(false); }}
                    style={{ flex: 1, padding: "14px", borderRadius: 12, background: C.surface2, color: C.textMid, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                    Cancel
                  </button>
                )}
                <button onClick={addFood}
                  style={{ flex: editingFoodId ? 2 : 1, padding: "14px", borderRadius: 12, background: STONE.primary, border: "none", color: C.ink, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                  {editingFoodId ? "Save Changes" : "Add Entry"}
                </button>
              </div>
              </>
              )}
            </div>
          </div>
        )}

        {/* Macro Chef modal */}
        {showChef && (
          <MacroChefModal
            remaining={{ calories: Math.max(0, targetCals - totals.cal), protein: Math.max(0, targets.p - totals.p), carbs: Math.max(0, targets.c - totals.c), fat: Math.max(0, targets.f - totals.f) }}
            onResult={(entry) => {
              mutateMacros(prev => {
                const d = prev[macroDate] ?? { entries: [], dayType: dType };
                prev[macroDate] = { ...d, entries: [...(d.entries ?? []), { ...entry, id: Date.now(), time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) }] };
                return prev;
              });
              setShowChef(false);
            }}
            onClose={() => setShowChef(false)}
          />
        )}

        {/* Targets modal */}
        {showTargetsModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "flex-end", zIndex: 100 }}
            onClick={() => setShowTargetsModal(false)}>
            <div style={{ background: C.sheet, width: "100%", borderRadius: "24px 24px 0 0", padding: "24px 18px 44px", borderBottom: "none", boxSizing: "border-box" }}
              onClick={e => e.stopPropagation()}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: C.line, margin: "0 auto 20px" }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 16, fontFamily: SANS }}>Macro Targets</div>
              {["training", "rest"].map(dt => (
                <div key={dt} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: dt === "training" ? LAKE.forest : C.textMid, letterSpacing: 0.2, fontFamily: SANS, marginBottom: 8 }}>
                    {dt === "training" ? "Training Day" : "Rest Day"} · {macroCals(macroTargets[dt].p, macroTargets[dt].c, macroTargets[dt].f)} kcal
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[["p", "Protein"], ["c", "Carbs"], ["f", "Fat"]].map(([key, lbl]) => (
                      <div key={key} style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontFamily: SANS, marginBottom: 4, textAlign: "center" }}>{lbl}</div>
                        <input type="number" inputMode="numeric" value={macroTargets[dt][key]}
                          onChange={e => saveMacroTargets({ ...macroTargets, [dt]: { ...macroTargets[dt], [key]: parseFloat(e.target.value) || 0 } })}
                          style={{ width: "100%", background: C.surface2, borderRadius: 10, padding: "10px 6px", fontSize: 16, fontWeight: 600, color: C.text, textAlign: "center", outline: "none", fontFamily: MONO, fontVariantNumeric: "tabular-nums", boxSizing: "border-box" }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS, lineHeight: 1.5 }}>
                The day type auto-switches based on whether you've logged a workout — no more forgetting which targets apply.
              </div>
            </div>
          </div>
        )}

        <ResumeBar session={inProgressSession && activeId !== inProgressSession?.id ? inProgressSession : null} onResume={() => { setActiveId(inProgressSession.id); setTab("journal"); setView("entry"); }} onDismiss={() => dismissResume(inProgressSession.id)} />
        <BottomNav tab={tab} setTab={setTab} onOpenMenu={() => setShowMoreMenu(true)} />
        <MoreMenu open={showMoreMenu} onClose={() => setShowMoreMenu(false)} onSelect={(id) => { setShowMoreMenu(false); setTab(id); setView("journal"); }} />
      </Shell>
    );
  }

  // ── VOLUME TAB ───────────────────────────────────────────────────────────
  if (tab === "volume") {
    const pastCycles = segmentPastCycles(entries);
    // selectedCycleIdx: null = current (live) cycle; otherwise index into pastCycles
    const viewingPast = selectedCycleIdx !== null && pastCycles[selectedCycleIdx];
    const vol = viewingPast
      ? cycleVolume(entries, viewingPast.start, viewingPast.end)
      : cycleVolume(entries, cycleAnchor);
    const allMuscles = Object.keys(VOLUME_LANDMARKS);
    const cycleLabel = viewingPast
      ? `${fmtDate(viewingPast.start)} – ${fmtDate(viewingPast.end)}`
      : (cycleAnchor ? new Date(cycleAnchor + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "cycle start");
    return (
      <Shell>
        <div style={{ padding: "52px 18px 20px", background: "transparent" }}>
          <div style={{ fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontFamily: SANS, marginBottom: 4 }}>Sets Per Muscle</div>
          <div style={{ ...TITLE, color: C.text }}>Volume</div>
          <div style={{ fontSize: 12, color: C.textDim, marginTop: 6, fontFamily: SANS }}>
            {viewingPast ? cycleLabel : `Since ${cycleLabel} · resets with each new cycle`}
          </div>
        </div>

        {/* Cycle selector */}
        {pastCycles.length > 0 && (
          <div style={{ padding: "12px 18px 0" }}>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              <button onClick={() => setSelectedCycleIdx(null)} style={{
                flexShrink: 0, padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontFamily: SANS,
                fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
                background: !viewingPast ? STONE.carrara : C.surface2,
                color: !viewingPast ? C.ink : C.textMid,
              }}>
                Current Cycle
              </button>
              {pastCycles.map((c, i) => (
                <button key={i} onClick={() => setSelectedCycleIdx(i)} style={{
                  flexShrink: 0, padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontFamily: SANS,
                  fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
                  background: selectedCycleIdx === i ? STONE.carrara : C.surface2,
                  color: selectedCycleIdx === i ? C.ink : C.textMid,
                }}>
                  {fmtDate(c.start)} – {fmtDate(c.end)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Deload guidance banner — only relevant for the current cycle */}
        {!viewingPast && (() => {
          const meso = mesocycleWeek(entries, mesoOverride);
          if (!meso.isDeload) return null;
          return (
            <div style={{ margin: "12px 18px 4px", padding: "14px 16px", borderRadius: 14, background: STONE.venato, color: INK.stone }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: INK.stone, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Flame size={14} color={INK.stone} strokeWidth={2} /> Deload week: volume targets
              </div>
              {Object.entries(VOLUME_LANDMARKS).map(([muscle, lm]) => (
                <div key={muscle} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                  <span style={{ fontSize: 12, color: INK.stone, fontFamily: SANS }}>{muscle}</span>
                  <span style={{ fontSize: 12, fontFamily: MONO, fontVariantNumeric: "tabular-nums", color: INK.stone }}>
                    {Math.round(lm.mev * 0.5)}–{Math.round(lm.mev * 0.6)} sets · 60% weight · 3–4 RIR
                  </span>
                </div>
              ))}
            </div>
          );
        })()}
        {/* Overview: sets per muscle as horizontal bars over MEV / MAV / MRV bands */}
        {(() => {
          const rowH = 26, labelW = 78, numW = 30, W = 340;
          const barW = W - labelW - numW;
          const H = allMuscles.length * rowH + 18;
          return (
            <div style={{ margin: "12px 18px 0", padding: "16px", borderRadius: 18, background: C.surface, border: C.cardBorder, boxShadow: shadow }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>Sets per muscle</div>
                <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS }}>{viewingPast ? "that cycle" : "this 8-day cycle"}</div>
              </div>
              <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
                {allMuscles.map((muscle, idx) => {
                  const lm = VOLUME_LANDMARKS[muscle];
                  const sets = vol[muscle] || 0;
                  const st = volumeStatus(sets, muscle);
                  // Each row is scaled to its own landmarks so every muscle reads the same way
                  const maxX = Math.max(lm.mrv * 1.25, sets + 1);
                  const sx = v => labelW + (Math.min(v, maxX) / maxX) * barW;
                  const y = idx * rowH + 4;
                  return (
                    <g key={muscle}>
                      <text x={0} y={y + 13} fontSize="12" fill={C.textMid} fontFamily={SANS}>{muscle}</text>
                      <rect x={labelW} y={y + 3} width={sx(lm.mev) - labelW} height={14} fill={C.surface2} rx="3" />
                      <rect x={sx(lm.mev)} y={y + 3} width={sx(lm.mav) - sx(lm.mev)} height={14} fill={C.green} opacity="0.16" />
                      <rect x={sx(lm.mav)} y={y + 3} width={sx(lm.mrv) - sx(lm.mav)} height={14} fill={C.amber} opacity="0.16" />
                      <rect x={sx(lm.mrv)} y={y + 3} width={labelW + barW - sx(lm.mrv)} height={14} fill={C.red} opacity="0.10" />
                      <rect x={labelW} y={y + 7} width={Math.max(0, sx(sets) - labelW)} height={6} fill={st.color} rx="3" />
                      <text x={W} y={y + 14} fontSize="12" fill={st.color} textAnchor="end" fontFamily={MONO} fontWeight="600">{sets}</text>
                    </g>
                  );
                })}
                <g fontSize="12" fontFamily={SANS} fill={C.textDim}>
                  <rect x={labelW} y={H - 10} width="8" height="8" fill={C.green} opacity="0.5" rx="1" /><text x={labelW + 11} y={H - 3}>MEV to MAV</text>
                  <rect x={labelW + 92} y={H - 10} width="8" height="8" fill={C.amber} opacity="0.5" rx="1" /><text x={labelW + 103} y={H - 3}>MAV to MRV</text>
                  <rect x={labelW + 184} y={H - 10} width="8" height="8" fill={C.red} opacity="0.4" rx="1" /><text x={labelW + 195} y={H - 3}>over MRV</text>
                </g>
              </svg>
            </div>
          );
        })()}
        <div style={{ padding: "12px 18px 100px" }}>
          {allMuscles.map(muscle => {
            const sets = vol[muscle] || 0;
            const lm = VOLUME_LANDMARKS[muscle];
            const status = volumeStatus(sets, muscle);
            const pct = Math.min(100, (sets / lm.mrv) * 100);
            const mevPct = (lm.mev / lm.mrv) * 100;
            const mavPct = (lm.mav / lm.mrv) * 100;
            return (
              <div key={muscle} style={{ marginBottom: 12, padding: "16px 18px", borderRadius: 18, background: C.surface, border: C.cardBorder, boxShadow: shadow }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.text, letterSpacing: 0 }}>{muscle}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: status.color, fontFamily: MONO, fontVariantNumeric: "tabular-nums" }}>{sets}</span>
                    <span style={{ fontSize: 12, color: C.textDim, fontFamily: SANS, fontWeight: 600, letterSpacing: 0.2 }}>{status.label}</span>
                  </div>
                </div>
                {/* Volume bar with MEV/MAV/MRV markers */}
                <div style={{ position: "relative", height: 12, borderRadius: 6, background: `linear-gradient(90deg, ${C.surface2} 0 ${mevPct}%, ${C.green}29 ${mevPct}% ${mavPct}%, ${C.amber}29 ${mavPct}% 100%)`, overflow: "hidden" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: fill(status.color), borderRadius: 6, transition: "width 0.4s ease" }} />
                  <div style={{ position: "absolute", left: `${mevPct}%`, top: 0, bottom: 0, width: 1.5, background: "rgba(255,255,255,0.25)" }} />
                  <div style={{ position: "absolute", left: `${mavPct}%`, top: 0, bottom: 0, width: 1.5, background: "rgba(255,255,255,0.25)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 12, color: C.textDim, fontFamily: MONO, fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                  <span>MEV {lm.mev}</span>
                  <span>MAV {lm.mav}</span>
                  <span>MRV {lm.mrv}</span>
                </div>
              </div>
            );
          })}
          <div style={{ padding: "8px 4px", fontSize: 12, color: C.textDim, fontFamily: SANS, lineHeight: 1.6 }}>
            MEV = minimum effective volume · MAV = max adaptive (the productive zone) · MRV = max recoverable. Stay in the green band for growth; back off if you're over MRV repeatedly.
          </div>
        </div>
        <ResumeBar session={inProgressSession && activeId !== inProgressSession?.id ? inProgressSession : null} onResume={() => { setActiveId(inProgressSession.id); setTab("journal"); setView("entry"); }} onDismiss={() => dismissResume(inProgressSession.id)} />
        <BottomNav tab={tab} setTab={setTab} onOpenMenu={() => setShowMoreMenu(true)} />
        <MoreMenu open={showMoreMenu} onClose={() => setShowMoreMenu(false)} onSelect={(id) => { setShowMoreMenu(false); setTab(id); setView("journal"); }} />
      </Shell>
    );
  }

  // ── PROGRESS TAB ─────────────────────────────────────────────────────────
  if (tab === "progress") {
    const prs = getPersonalRecords(entries);
    const mvNames = allMovementNames(entries);
    const selMv = selectedMovement || mvNames[0] || null;
    const history = selMv ? movementHistory(entries, selMv) : [];
    const heatmap = sessionHeatmap(entries);
    const balance = pushPullBalance(entries);
    const meso = mesocycleWeek(entries, mesoOverride);

    // Heatmap — last 70 days (10 weeks)
    const heatDays = [];
    for (let i = 69; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const str = localDateStr(d);
      heatDays.push({ date: str, count: heatmap[str] || 0 });
    }
    const completedSessions = heatDays.filter(d => d.count > 0).length;

    // Inline SVG e1RM chart for the selected lift: gridlines with values, a point per
    // session (best set by estimateOneRM via movementHistory), the all-time best in green.
    function LineChart({ data, color }) {
      if (data.length < 2) return (
        <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", color: C.textDim, fontSize: 12, fontFamily: SANS }}>
          Need 2+ sessions to show trend
        </div>
      );
      const vals = data.map(d => d.e1rm);
      const rawMin = Math.min(...vals), rawMax = Math.max(...vals);
      const padV = Math.max(2, Math.round((rawMax - rawMin) * 0.1));
      const min = rawMin - padV, max = rawMax + padV;
      const range = max - min || 1;
      const W = 340, H = 150, L = 34, R = 8, T = 10, B = 20;
      const bestIdx = vals.lastIndexOf(rawMax);
      const pts = vals.map((v, i) => {
        const x = L + (i / (vals.length - 1)) * (W - L - R);
        const y = T + (1 - (v - min) / range) * (H - T - B);
        return [x, y];
      });
      const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
      const area = path + ` L${pts[pts.length-1][0]},${H - B} L${L},${H - B} Z`;
      const ticks = [0, 0.5, 1].map(f => min + f * range);
      return (
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {ticks.map((v, i) => {
            const y = T + (1 - (v - min) / range) * (H - T - B);
            return (
              <g key={i}>
                <line x1={L} y1={y} x2={W - R} y2={y} stroke={C.line} strokeWidth="1" strokeDasharray="3,4" />
                <text x={L - 5} y={y + 3} fontSize="12" fill={C.textDim} textAnchor="end" fontFamily={MONO}>{Math.round(v)}</text>
              </g>
            );
          })}
          <path d={area} fill="url(#lg)" />
          <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {pts.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i === bestIdx ? 4.5 : 3} fill={i === bestIdx ? C.pr : color} stroke={C.surface} strokeWidth="1.5" />
          ))}
          <text x={pts[bestIdx][0]} y={Math.max(9, pts[bestIdx][1] - 8)} fontSize="12" fill={C.pr} textAnchor={bestIdx === pts.length - 1 ? "end" : bestIdx === 0 ? "start" : "middle"} fontFamily={MONO} fontWeight="600">PR {rawMax}</text>
          <text x={pts[0][0]} y={H - 4} fontSize="12" fill={C.textDim} textAnchor="start" fontFamily={MONO}>{data[0].date.slice(5)}</text>
          <text x={pts[pts.length-1][0]} y={H - 4} fontSize="12" fill={C.textDim} textAnchor="end" fontFamily={MONO}>{data[data.length-1].date.slice(5)}</text>
        </svg>
      );
    }

    return (
      <Shell>
        <div style={{ padding: "52px 18px 20px", background: "transparent" }}>
          <div style={{ fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontFamily: SANS, marginBottom: 4 }}>Performance</div>
          <div style={{ ...TITLE, color: C.text }}>Progress</div>
        </div>

        <div style={{ padding: "0 18px 16px" }}>

          {/* ── SESSION HEATMAP ── */}
          <div style={{ marginBottom: 14, padding: "16px", borderRadius: 18, background: C.surface, border: C.cardBorder, boxShadow: shadow }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>Consistency</div>
              <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS }}>{completedSessions}/70 days trained</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 3 }}>
              {heatDays.map((d, i) => (
                <div key={i} title={d.date} style={{ aspectRatio: "1", borderRadius: 3, background: d.count > 0 ? STONE.carrara : C.surface2, opacity: d.count > 0 ? 1 : 0.5 }} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: C.textDim, fontFamily: SANS }}>
              <span>10 weeks ago</span><span>Today</span>
            </div>
          </div>

          {/* ── PUSH/PULL BALANCE ── */}
          <div style={{ marginBottom: 14, padding: "16px", borderRadius: 18, background: C.surface, border: C.cardBorder, boxShadow: shadow }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 12 }}>Push / Pull Balance <span style={{ fontSize: 12, color: C.textDim, fontWeight: 400 }}>last 8 days</span></div>
            {[
              { label: "Push", val: balance.push, color: C.text },
              { label: "Pull", val: balance.pull, color: C.textMid },
              { label: "Legs", val: balance.legs, color: C.text },
            ].map(({ label, val, color }) => {
              const total = balance.push + balance.pull + balance.legs || 1;
              const pct = Math.round((val / total) * 100);
              const ratio = balance.pull > 0 ? (balance.push / balance.pull).toFixed(2) : "—";
              return (
                <div key={label} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: C.textMid, fontFamily: SANS }}>{label}</span>
                    <span style={{ fontSize: 12, fontFamily: MONO, fontVariantNumeric: "tabular-nums", color }}>{val} sets · {pct}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: C.surface2, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: fill(color), borderRadius: 3, transition: "width 0.3s" }} />
                  </div>
                </div>
              );
            })}
            {balance.push > 0 && balance.pull > 0 && (
              <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS, marginTop: 6 }}>
                Push:Pull ratio {(balance.push / balance.pull).toFixed(2)}:1
                {balance.push / balance.pull > 1.3 ? " — consider more pulling" : balance.push / balance.pull < 0.7 ? " — consider more pushing" : " — well balanced"}
              </div>
            )}
          </div>

          {/* ── PER-LIFT PROGRESSION ── */}
          <div style={{ marginBottom: 14, padding: "16px", borderRadius: 18, background: C.surface, border: C.cardBorder, boxShadow: shadow }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 10 }}>Lift Progression <span style={{ fontSize: 12, color: C.textDim, fontWeight: 400 }}>estimated 1RM per session</span></div>
            <select value={selMv || ""} onChange={e => setSelectedMovement(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, background: C.surface2, color: C.text, fontSize: 12, fontFamily: SANS, marginBottom: 12, outline: "none" }}>
              {mvNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            {history.length > 0 && (
              <>
                <LineChart data={history} color={C.text} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: C.textDim, letterSpacing: 0.2, fontFamily: SANS }}>First</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.textMid, fontFamily: MONO, fontVariantNumeric: "tabular-nums" }}>{history[0].e1rm}lbs</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: C.textDim, letterSpacing: 0.2, fontFamily: SANS }}>Best</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.pr, fontFamily: MONO, fontVariantNumeric: "tabular-nums" }}>{Math.max(...history.map(h => h.e1rm))}lbs</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: C.textDim, letterSpacing: 0.2, fontFamily: SANS }}>Sessions</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.textMid, fontFamily: MONO, fontVariantNumeric: "tabular-nums" }}>{history.length}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: C.textDim, letterSpacing: 0.2, fontFamily: SANS }}>Change</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: history[history.length-1].e1rm >= history[0].e1rm ? C.green : C.red, fontFamily: MONO, fontVariantNumeric: "tabular-nums" }}>
                      {history[history.length-1].e1rm >= history[0].e1rm ? "+" : ""}{history[history.length-1].e1rm - history[0].e1rm}lbs
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS, marginTop: 8 }}>Estimated 1RM via Epley formula (adjusted for RIR)</div>
              </>
            )}
          </div>

          {/* ── PERSONAL RECORDS ── */}
          <div style={{ marginBottom: 14, padding: "16px", borderRadius: 18, background: C.surface, border: C.cardBorder, boxShadow: shadow }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 12 }}>Personal Records</div>
            {Object.entries(prs).length === 0 ? (
              <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS }}>Log some sets to see PRs</div>
            ) : Object.entries(prs).sort((a, b) => b[1].maxE1RM - a[1].maxE1RM).map(([name, pr]) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${C.lineSoft}` }}>
                <Trophy size={14} color={C.pr} strokeWidth={2} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                  <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS, marginTop: 2 }}>{pr.date} · {pr.maxWeight}lbs × {pr.reps}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.pr, fontFamily: MONO, fontVariantNumeric: "tabular-nums" }}>~{pr.maxE1RM}lbs</div>
                  <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS }}>e1RM</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: 20 }} />
        </div>
        <ResumeBar session={inProgressSession && activeId !== inProgressSession?.id ? inProgressSession : null} onResume={() => { setActiveId(inProgressSession.id); setTab("journal"); setView("entry"); }} onDismiss={() => dismissResume(inProgressSession.id)} />
        <BottomNav tab={tab} setTab={setTab} onOpenMenu={() => setShowMoreMenu(true)} />
        <MoreMenu open={showMoreMenu} onClose={() => setShowMoreMenu(false)} onSelect={(id) => { setShowMoreMenu(false); setTab(id); setView("journal"); }} />
      </Shell>
    );
  }

  // ── PHOTOS TAB ───────────────────────────────────────────────────────────
  if (tab === "photos") {
    async function loadPhotos() {
      setDrivePhotosLoading(true);
      setDrivePhotosError("");
      try {
        const photos = await driveListPhotos();
        setDrivePhotos(photos);
      } catch (err) {
        setDrivePhotosError(err.message || "Could not load photos from Drive.");
      } finally {
        setDrivePhotosLoading(false);
      }
    }
    // Auto-load on first visit to this tab
    if (drivePhotos === null && !drivePhotosLoading && !drivePhotosError) {
      loadPhotos();
    }

    const photosByDate = {};
    (drivePhotos ?? []).forEach(p => {
      (photosByDate[p.date] = photosByDate[p.date] ?? []).push(p);
    });
    const dates = Object.keys(photosByDate).sort((a, b) => b.localeCompare(a));

    function ZoomableImage({ fileId, alt }) {
      const containerRef = useRef(null);
      const [scale, setScale] = useState(1);
      const [translate, setTranslate] = useState({ x: 0, y: 0 });
      const [blobUrl, setBlobUrl] = useState(null);
      const [loadError, setLoadError] = useState("");
      const stateRef = useRef({ scale: 1, translate: { x: 0, y: 0 } });
      stateRef.current.scale = scale;
      stateRef.current.translate = translate;
      const gestureRef = useRef({
        startDist: 0, startScale: 1,
        startTranslate: { x: 0, y: 0 }, startMid: { x: 0, y: 0 },
        panning: false, lastPan: { x: 0, y: 0 },
        lastTapTime: 0,
      });

      // Fetch the image via JS fetch() rather than a raw <img src="...">. Google Drive's
      // alt=media endpoint has known CORS/redirect quirks when hit directly by an <img> tag
      // (307 redirect to a googleusercontent.com URL that browsers don't always follow
      // cleanly for image requests) — this was the actual cause of the broken-image icons.
      // fetch() handles the redirect properly; we then convert the response to a blob URL.
      useEffect(() => {
        let cancelled = false;
        let localBlobUrl = null;
        setBlobUrl(null);
        setLoadError("");
        (async () => {
          try {
            const resp = await apiFetch(`/api/photos?id=${encodeURIComponent(fileId)}`, { headers: appHeaders() });
            if (!resp.ok) throw new Error(`Drive fetch failed (${resp.status})`);
            const blob = await resp.blob();
            if (cancelled) return;
            localBlobUrl = URL.createObjectURL(blob);
            setBlobUrl(localBlobUrl);
          } catch (err) {
            if (!cancelled) setLoadError(err.message || "Could not load photo");
          }
        })();
        return () => {
          cancelled = true;
          if (localBlobUrl) URL.revokeObjectURL(localBlobUrl);
        };
      }, [fileId]);

      function dist(touches) {
        const [a, b] = touches;
        return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      }
      function midpoint(touches) {
        const [a, b] = touches;
        return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
      }
      function clampTranslate(t, s) {
        const el = containerRef.current;
        if (!el) return t;
        const maxX = (el.clientWidth * (s - 1)) / 2;
        const maxY = (el.clientHeight * (s - 1)) / 2;
        return { x: Math.max(-maxX, Math.min(maxX, t.x)), y: Math.max(-maxY, Math.min(maxY, t.y)) };
      }

      // IMPORTANT: attach touch listeners natively with { passive: false }, not via React's
      // onTouchMove prop. React attaches touch handlers as PASSIVE listeners by default (for
      // scroll performance), which means calling e.preventDefault() inside a JSX onTouchMove
      // silently does nothing in modern React + Safari — the browser has already committed to
      // its native gesture before the handler runs. This was the actual reason pinch-zoom
      // appeared to do "nothing at all": the code ran, but preventDefault() was a no-op, so
      // neither our zoom nor the browser's own zoom (blocked separately by user-scalable=no)
      // took effect.
      useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        function onTouchStart(e) {
          const g = gestureRef.current;
          if (e.touches.length === 2) {
            g.startDist = dist(e.touches);
            g.startScale = stateRef.current.scale;
            g.startMid = midpoint(e.touches);
            g.startTranslate = stateRef.current.translate;
            g.panning = false;
          } else if (e.touches.length === 1) {
            const now = Date.now();
            if (now - g.lastTapTime < 280) {
              setScale(1); setTranslate({ x: 0, y: 0 });
              g.lastTapTime = 0;
              return;
            }
            g.lastTapTime = now;
            if (stateRef.current.scale > 1) {
              g.panning = true;
              g.lastPan = { x: e.touches[0].clientX, y: e.touches[0].clientY };
              g.startTranslate = stateRef.current.translate;
            }
          }
        }
        function onTouchMove(e) {
          const g = gestureRef.current;
          if (e.touches.length === 2 && g.startDist > 0) {
            e.preventDefault();
            const newDist = dist(e.touches);
            const nextScale = Math.max(1, Math.min(4, g.startScale * (newDist / g.startDist)));
            setScale(nextScale);
            setTranslate(clampTranslate(g.startTranslate, nextScale));
          } else if (e.touches.length === 1 && g.panning) {
            e.preventDefault();
            const dx = e.touches[0].clientX - g.lastPan.x;
            const dy = e.touches[0].clientY - g.lastPan.y;
            setTranslate(clampTranslate({ x: g.startTranslate.x + dx, y: g.startTranslate.y + dy }, stateRef.current.scale));
          }
        }
        function onTouchEnd(e) {
          const g = gestureRef.current;
          if (e.touches.length < 2) g.startDist = 0;
          if (e.touches.length === 0) g.panning = false;
          if (stateRef.current.scale <= 1.02) { setScale(1); setTranslate({ x: 0, y: 0 }); }
        }

        el.addEventListener("touchstart", onTouchStart, { passive: false });
        el.addEventListener("touchmove", onTouchMove, { passive: false });
        el.addEventListener("touchend", onTouchEnd, { passive: false });
        el.addEventListener("touchcancel", onTouchEnd, { passive: false });
        return () => {
          el.removeEventListener("touchstart", onTouchStart);
          el.removeEventListener("touchmove", onTouchMove);
          el.removeEventListener("touchend", onTouchEnd);
          el.removeEventListener("touchcancel", onTouchEnd);
        };
      }, []);

      if (loadError) {
        return (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: C.red, fontFamily: SANS }}>{loadError}</div>
          </div>
        );
      }
      if (!blobUrl) {
        return (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS }}>Loading…</div>
          </div>
        );
      }
      return (
        <div ref={containerRef} style={{ width: "100%", height: "100%", overflow: "hidden", touchAction: "none" }}>
          <img src={blobUrl} alt={alt} draggable={false} style={{
            width: "100%", height: "100%", objectFit: "cover",
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: "center center",
            transition: scale === 1 && translate.x === 0 && translate.y === 0 ? "transform 0.2s ease-out" : "none",
            willChange: "transform",
          }} />
        </div>
      );
    }

    function PhotoSlot({ label, photo, onPick }) {
      return (
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontFamily: SANS, fontWeight: 600, marginBottom: 8, textAlign: "center" }}>{label}</div>
          <div style={{
            aspectRatio: "3/4", borderRadius: 16, background: C.surface2,
            display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
            border: photo ? "none" : `1.5px dashed ${C.line}`, position: "relative",
          }}>
            {photo ? (
              <ZoomableImage key={photo.id} fileId={photo.id} alt={photo.name} />
            ) : (
              <div onClick={onPick} style={{ textAlign: "center", padding: 16, cursor: "pointer", width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <Camera size={26} color={C.textDim} strokeWidth={1.6} />
                <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS, marginTop: 8 }}>Tap to choose</div>
              </div>
            )}
          </div>
          {photo && (
            <>
              <div style={{ textAlign: "center", marginTop: 8, fontSize: 12, fontWeight: 600, color: C.text, fontFamily: SANS }}>
                {fmtDate(photo.date)}
              </div>
              <PhotoWeightCaption weightLog={weightLog} date={photo.date} />
              <button onClick={onPick} style={{
                display: "block", width: "100%", marginTop: 8, padding: "10px", borderRadius: 10,
                background: LAKE.sky + "22", border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 600, color: LAKE.sky, fontFamily: SANS,
              }}>
                Change Photo
              </button>
            </>
          )}
        </div>
      );
    }

    return (
      <Shell>
        <div style={{ padding: "52px 18px 20px", background: "transparent" }}>
          <div style={{ fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontFamily: SANS, marginBottom: 4 }}>Compare Dates</div>
          <div style={{ ...TITLE, color: C.text }}>Progress Photos</div>
          <div style={{ fontSize: 12, color: C.textDim, marginTop: 6, fontFamily: SANS }}>From your Google Drive folder</div>
        </div>

        <div style={{ padding: "0 18px 24px" }}>
          {drivePhotosLoading && (
            <div style={{ textAlign: "center", padding: "40px 0", color: C.textDim, fontSize: 12, fontFamily: SANS }}>Loading photos…</div>
          )}
          {drivePhotosError && (
            <div style={{ padding: "16px", borderRadius: 14, background: C.alertWash, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: C.red, fontFamily: SANS, marginBottom: 10 }}>{drivePhotosError}</div>
              <button onClick={loadPhotos} style={{ padding: "10px 16px", borderRadius: 10, background: C.surface2, border: "none", color: C.text, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                Try Again
              </button>
            </div>
          )}
          {!drivePhotosLoading && !drivePhotosError && drivePhotos && (
            <>
              {photoSlotA && photoSlotB && (
                <div style={{ display: "flex", gap: 6, padding: 4, borderRadius: 12, background: C.surface2, marginBottom: 14 }}>
                  {[["side", "Side by side"], ["slider", "Slider"]].map(([m, label]) => (
                    <button key={m} onClick={() => setPhotoCompareMode(m)} style={{
                      flex: 1, padding: "10px", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 12, fontWeight: 600,
                      background: photoCompareMode === m ? STONE.carrara : "transparent", color: photoCompareMode === m ? C.ink : C.textMid,
                    }}>{label}</button>
                  ))}
                </div>
              )}
              {photoSlotA && photoSlotB && photoCompareMode === "slider" ? (
                <div style={{ marginBottom: 20 }}>
                  <SliderCompare a={photoSlotA} b={photoSlotB} />
                  <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                    {[["A", photoSlotA], ["B", photoSlotB]].map(([slot, ph]) => (
                      <div key={slot} style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: SANS }}>{slot} · {fmtDate(ph.date)}</div>
                        <PhotoWeightCaption weightLog={weightLog} date={ph.date} />
                        <button onClick={() => setPhotoPickerSlot(slot)} style={{
                          display: "block", width: "100%", marginTop: 8, padding: "10px", borderRadius: 10,
                          background: LAKE.sky + "22", border: "none", cursor: "pointer",
                          fontSize: 12, fontWeight: 600, color: LAKE.sky, fontFamily: SANS,
                        }}>Change {slot}</button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                  <PhotoSlot label="Slot A" photo={photoSlotA} onPick={() => setPhotoPickerSlot("A")} />
                  <PhotoSlot label="Slot B" photo={photoSlotB} onPick={() => setPhotoPickerSlot("B")} />
                </div>
              )}
              {photoSlotA && photoSlotB && (
                <div style={{ textAlign: "center", padding: "12px 16px", borderRadius: 12, background: C.surface2, fontSize: 12, color: C.textMid, fontFamily: SANS }}>
                  {fmtDate(photoSlotA.date)} → {fmtDate(photoSlotB.date)}
                  {" · "}
                  {Math.abs(Math.round((new Date(photoSlotB.date) - new Date(photoSlotA.date)) / 86400000))} days apart
                </div>
              )}
              {dates.length === 0 && (
                <div style={{ textAlign: "center", padding: "20px 0", color: C.textDim, fontSize: 12, fontFamily: SANS }}>
                  No photos found in your Drive folder.
                </div>
              )}
            </>
          )}
        </div>

        {/* Date/photo picker sheet */}
        {photoPickerSlot && (
          <div onClick={() => setPhotoPickerSlot(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "flex-end", zIndex: 150 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: C.sheet, width: "100%", borderRadius: "24px 24px 0 0", padding: "20px 18px 40px", boxSizing: "border-box", maxWidth: 430, margin: "0 auto", maxHeight: "80vh", overflowY: "auto" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: C.line, margin: "0 auto 18px" }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 16, fontFamily: SANS }}>Choose a Photo</div>
              {dates.map(date => (
                <div key={date} style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.textMid, fontFamily: SANS, marginBottom: 8 }}>{fmtDate(date)}</div>
                  <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                    {photosByDate[date].map(photo => (
                      <div key={photo.id} onClick={() => {
                        if (photoPickerSlot === "A") setPhotoSlotA(photo); else setPhotoSlotB(photo);
                        setPhotoPickerSlot(null);
                      }} style={{ flexShrink: 0, width: 90, height: 120, borderRadius: 10, overflow: "hidden", cursor: "pointer", background: C.surface2 }}>
                        <img src={photo.thumb} alt={photo.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <BottomNav tab={tab} setTab={setTab} onOpenMenu={() => setShowMoreMenu(true)} />
        <MoreMenu open={showMoreMenu} onClose={() => setShowMoreMenu(false)} onSelect={(id) => { setShowMoreMenu(false); setTab(id); setView("journal"); }} />
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
        const result = await readJSONBackup(file);
        const { entries: newEntries, weights: newWeights, mesoOverride: newMeso, cycleAnchor: newAnchor, macros: newMacros, raw } = result;

        // Case 1: this is a standalone MacroTracker-app backup (date-keyed, no .entries)
        if (isMacroOnlyBackup(raw)) {
          const migrated = migrateMacroBackup(raw);
          const importedTargets = extractMacroTargets(raw);
          let addedDays = 0, addedEntries = 0, repairedEntries = 0;
          mutateMacros(prev => {
            Object.keys(migrated).forEach(dateKey => {
              const incoming = migrated[dateKey];
              const existing = prev[dateKey] ?? { entries: [], dayType: incoming.dayType };
              const existingById = new Map((existing.entries ?? []).map(e => [String(e.id), e]));
              let dayChanged = false;
              (incoming.entries ?? []).forEach(e => {
                const key = String(e.id);
                const already = existingById.get(key);
                // Overwrite if new, or if the existing entry has broken/missing macro data (repairs old bad imports)
                const isBroken = already && (already.p === undefined || already.c === undefined || already.f === undefined || isNaN(already.p) || isNaN(already.c) || isNaN(already.f));
                if (!already) { addedEntries++; dayChanged = true; }
                else if (isBroken) { repairedEntries++; dayChanged = true; }
                if (!already || isBroken) existingById.set(key, e);
              });
              if (dayChanged || !prev[dateKey]) addedDays++;
              prev[dateKey] = { ...existing, entries: [...existingById.values()] };
            });
            return prev;
          });
          if (importedTargets) saveMacroTargets(importedTargets);
          setImportStatus("success");
          const repairNote = repairedEntries > 0 ? ` · ${repairedEntries} repaired` : "";
          setImportMsg(`Imported macro history: ${addedDays} days, ${addedEntries} new entries${repairNote}${importedTargets ? " · targets restored" : ""}`);
          return;
        }

        // Case 2: normal workout backup (may also contain merged macros from this app's own export)
        if (!Array.isArray(newEntries)) throw new Error("No entries found in file");
        const existingIds = new Set(entries.map(e => String(e.id)));
        const toAdd = newEntries.filter(e => !existingIds.has(String(e.id)));
        const merged = [...entries, ...toAdd].sort((a, b) => b.date.localeCompare(a.date));
        mutate(() => merged);
        if (newWeights.length > 0) {
          const existingWIds = new Set(weightLog.map(w => String(w.id)));
          const wToAdd = newWeights.filter(w => !existingWIds.has(String(w.id)));
          setWeightLog(prev => [...prev, ...wToAdd].sort((a, b) => b.date.localeCompare(a.date)));
        }
        if (newMeso) saveMesoOverride(newMeso);
        if (raw?.deload?.startDate && !loadDeload()) { saveDeload(raw.deload); setDeloadRev(n => n + 1); }
        if (newAnchor) saveCycleAnchor(newAnchor);
        let macroNote = "";
        if (newMacros && Object.keys(newMacros).length > 0) {
          let addedEntries = 0;
          mutateMacros(prev => {
            Object.keys(newMacros).forEach(dateKey => {
              const incoming = newMacros[dateKey];
              const existing = prev[dateKey] ?? { entries: [], dayType: incoming.dayType };
              const existingIds2 = new Set((existing.entries ?? []).map(e => String(e.id)));
              const toAddF = (incoming.entries ?? []).filter(e => !existingIds2.has(String(e.id)));
              addedEntries += toAddF.length;
              prev[dateKey] = { ...existing, entries: [...(existing.entries ?? []), ...toAddF] };
            });
            return prev;
          });
          macroNote = ` + ${addedEntries} food entries`;
        }
        const stateRestored = newMeso || newAnchor ? " · mesocycle & cycle state restored" : "";
        setImportStatus("success");
        setImportMsg(`Imported ${toAdd.length} new session${toAdd.length !== 1 ? "s" : ""}${newWeights.length > 0 ? ` + ${newWeights.length} weight entries` : ""}${macroNote}${stateRestored}`);
      } catch (err) {
        setImportStatus("error");
        setImportMsg(err.message || "Import failed");
      }
    }

    return (
      <Shell>
        <div style={{ padding: "52px 18px 20px", background: "transparent" }}>
          <div style={{ fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontFamily: SANS, marginBottom: 4 }}>Backup & History</div>
          <div style={{ ...TITLE, color: C.text }}>Data</div>
          <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
            <div><div style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: SANS }}>{totalSessions}</div><div style={{ fontSize: 12, color: C.textDim, letterSpacing: 0.2, fontFamily: SANS }}>Sessions</div></div>
            <div><div style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: SANS }}>{totalSets}</div><div style={{ fontSize: 12, color: C.textDim, letterSpacing: 0.2, fontFamily: SANS }}>Sets Logged</div></div>
            <div><div style={{ fontSize: 15, fontWeight: 600, color: C.alert, fontFamily: SANS }}>{weightLog.length}</div><div style={{ fontSize: 12, color: C.textDim, letterSpacing: 0.2, fontFamily: SANS }}>Weigh-ins</div></div>
          </div>
        </div>

        <DriveBackupCard onRestore={(data, name) => handleImport(new File([JSON.stringify(data)], name, { type: "application/json" }))} />

        {/* Export / Import + Coach Export */}
        <div style={{ padding: "16px 18px 8px" }}>
          <div style={{ fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontFamily: SANS, fontWeight: 600, marginBottom: 10 }}>Backup</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <button onClick={() => downloadJSON(entries, weightLog, mesoOverride, cycleAnchor, macros, macroTargets)} style={{ flex: 1, padding: "13px", borderRadius: 14, background: "rgba(215,212,216,0.13)", color: C.text, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
              Export JSON
            </button>
            <button onClick={() => downloadCSV(entries, weightLog)} style={{ flex: 1, padding: "13px", borderRadius: 14, background: "rgba(215,212,216,0.13)", color: C.text, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
              Export CSV
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept=".json" style={{ display: "none" }}
            onChange={e => { if (e.target.files[0]) handleImport(e.target.files[0]); e.target.value = ""; }} />
          <button onClick={() => { setImportStatus(null); fileInputRef.current?.click(); }}
            style={{ width: "100%", padding: "13px", borderRadius: 14, background: "rgba(215,212,216,0.13)", color: C.text, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS, marginBottom: 10 }}>
            Import JSON Backup
          </button>
          <button onClick={async () => {
            setPdfLoading(true);
            try {
              await downloadCoachPDF(entries, weightLog, mesocycleWeek(entries, mesoOverride));
            } catch (err) {
              alert(err.message || "Could not generate PDF — check your connection and try again.");
            } finally {
              setPdfLoading(false);
            }
          }} disabled={pdfLoading} style={{ width: "100%", padding: "13px", borderRadius: 14, background: C.surface2, color: pdfLoading ? C.textDim : C.text, fontSize: 12, fontWeight: 600, cursor: pdfLoading ? "default" : "pointer", fontFamily: SANS, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Trophy size={15} color={pdfLoading ? C.textDim : C.accent} strokeWidth={2} /> {pdfLoading ? "Generating PDF…" : "Coach Report (PDF)"}
          </button>
          {importStatus && (
            <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, background: importStatus === "success" ? "rgba(215,212,216,0.13)" : "rgba(201,166,190,0.13)", color: importStatus === "success" ? C.text : C.alert, fontSize: 12, fontFamily: SANS }}>
              {importStatus === "success" ? "✓ " : "✕ "}{importMsg}
            </div>
          )}
        </div>

        {/* Session search */}
        <div style={{ padding: "8px 18px 4px" }}>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search sessions, movements, notes…"
            style={{ width: "100%", padding: "11px 14px", borderRadius: 12, background: C.surface2, color: C.text, fontSize: 16, fontFamily: SANS, outline: "none", boxSizing: "border-box" }} />
        </div>

        {/* Filter by day */}
        <div style={{ padding: "8px 18px 4px" }}>
          <div style={{ fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontFamily: SANS, fontWeight: 600, marginBottom: 8 }}>Session History · {filtered.filter(e => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return e.customTitle?.toLowerCase().includes(q) || e.note?.toLowerCase().includes(q) || e.movements.some(m => m.name?.toLowerCase().includes(q) || m.note?.toLowerCase().includes(q));
          }).length} shown</div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
            <button onClick={() => setFilterDay(null)} style={{ flexShrink: 0, padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 12, fontWeight: 600, background: filterDay === null ? STONE.carrara : C.surface3, color: filterDay === null ? C.ink : C.textMid }}>All</button>
            {Object.entries(PROGRAM).filter(([,d]) => d.exercises.length > 0).map(([dn, d]) => (
              <button key={dn} onClick={() => setFilterDay(filterDay === Number(dn) ? null : Number(dn))}
                style={{ flexShrink: 0, padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 12, fontWeight: 600, background: filterDay === Number(dn) ? fill(d.color) : C.surface3, color: filterDay === Number(dn) ? C.ink : d.color }}>
                Day {dn}
              </button>
            ))}
          </div>
        </div>

        {/* History list */}
        {(() => {
          const displayed = filtered.filter(e => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return e.customTitle?.toLowerCase().includes(q) || e.note?.toLowerCase().includes(q) || e.movements.some(m => m.name?.toLowerCase().includes(q) || m.note?.toLowerCase().includes(q));
          });
          return (
            <div style={{ padding: "4px 18px 100px" }}>
              {displayed.length === 0 ? (
                <div style={{ padding: "40px 0", textAlign: "center", color: C.textDim, fontSize: 12, fontFamily: SANS }}>No sessions found</div>
              ) : displayed.map(entry => {
                const prog = entry.programDay ? PROGRAM[entry.programDay] : null;
                const color = prog?.color ?? C.textDim;
                const expanded = expandedId === entry.id;
                const entryColor = prog?.color ?? C.text;
                const totalVol = entry.movements.reduce((n, mv) =>
                  n + mv.sets.reduce((s, set) => s + (parseFloat(set.w)||0) * (parseFloat(set.r)||0), 0), 0);
                return (
                  <div key={entry.id} style={{ marginBottom: 8, borderRadius: 14, overflow: "hidden", background: expanded ? color + "14" : C.surface }}>
                    <div style={{ height: 3, background: prog ? fill(color) : C.surface3 }} />
                    <div onClick={() => setExpandedId(expanded ? null : entry.id)}
                      style={{ padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS, letterSpacing: 0.2, marginBottom: 2 }}>
                          {fmtDate(entry.date)}{entry.programDay ? ` · Day ${entry.programDay}` : ""}
                          {entry.completedAt && <span style={{ color: C.text, marginLeft: 6 }}>✓</span>}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{entry.customTitle || "Custom Session"}</div>
                        <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS, marginTop: 2 }}>
                          {entry.movements.length} movements
                          {totalVol > 0 && <span style={{ color: C.textMid, marginLeft: 8 }}>{Math.round(totalVol).toLocaleString()} lbs total vol</span>}
                        </div>
                      </div>
                      <div style={{ color: C.textDim, fontSize: 15, fontFamily: SANS, transition: "transform 0.2s", transform: expanded ? "rotate(90deg)" : "none" }}>›</div>
                    </div>
                    {expanded && (
                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "10px 14px 14px" }}>
                        {entry.note && <div style={{ fontSize: 12, color: C.textMid, marginBottom: 10, fontStyle: "italic" }}>{entry.note}</div>}
                        {entry.movements.map(mv => (
                          <div key={mv.id} style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: C.textMid, marginBottom: 4, fontFamily: SANS }}>
                              {mv.programRef ? `${mv.programRef}. ` : ""}{mv.name}
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                              {mv.sets.map((s, si) => (
                                <span key={si} style={{ fontSize: 12, fontFamily: SANS, padding: "3px 8px", borderRadius: 6, background: s.r ? entryColor + "22" : C.surface3, color: s.r ? entryColor : C.textDim }}>
                                  {s.w ? `${s.w}×` : "BW×"}{s.r || "–"}
                                </span>
                              ))}
                              {mv.note && <span style={{ fontSize: 12, color: C.textDim, fontStyle: "italic", alignSelf: "center", marginLeft: 4 }}>{mv.note}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}
        <ResumeBar session={inProgressSession && activeId !== inProgressSession?.id ? inProgressSession : null} onResume={() => { setActiveId(inProgressSession.id); setTab("journal"); setView("entry"); }} onDismiss={() => dismissResume(inProgressSession.id)} />
        <BottomNav tab={tab} setTab={setTab} onOpenMenu={() => setShowMoreMenu(true)} />
        <MoreMenu open={showMoreMenu} onClose={() => setShowMoreMenu(false)} onSelect={(id) => { setShowMoreMenu(false); setTab(id); setView("journal"); }} />
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
      setWeightLog(prev => {
        const updated = [entry, ...prev.filter(w => w.date !== weightDate)];
        saveWeights(updated); // save directly — don't rely solely on useEffect
        return updated;
      });
      setWeightInput("");
      setShowWeightForm(false);
    }
    const CHART_H = 140, CHART_W = 340;
    return (
      <Shell>
        <div style={{ padding: "52px 18px 16px", background: "transparent" }}>
          <div style={{ fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontFamily: SANS, marginBottom: 4 }}>Body Weight</div>
          <div style={{ ...TITLE, color: C.text }}>Weight Tracker</div>
          {latest && (
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 8 }}>
              <span style={{ ...HERO, color: C.text }}>{latest.weight}</span>
              <span style={{ fontSize: 15, color: C.textDim, fontFamily: SANS }}>{latest.unit}</span>
              {diff !== null && (
                <span style={{ fontSize: 15, fontFamily: SANS, fontWeight: 600, color: parseFloat(diff) < 0 ? C.text : parseFloat(diff) > 0 ? C.alert : C.textMid }}>
                  {parseFloat(diff) > 0 ? "+" : ""}{diff} vs last
                </span>
              )}
            </div>
          )}
          {totalDiff !== null && (
            <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS, marginTop: 4 }}>
              Total change: {parseFloat(totalDiff) > 0 ? "+" : ""}{totalDiff} {sorted_w[0]?.unit} over {weightLog.length} entries
            </div>
          )}
        </div>
        {chartData.length >= 2 && (() => {
          const CHART_LEFT = 30;
          const active = scrubIdx !== null && chartData[scrubIdx] ? chartData[scrubIdx] : null;
          const activeX = scrubIdx !== null ? CHART_LEFT + (scrubIdx / Math.max(vals.length - 1, 1)) * (CHART_W - CHART_LEFT) : null;
          const activeY = scrubIdx !== null && vals[scrubIdx] !== undefined
            ? CHART_H - ((vals[scrubIdx] - minV) / range) * CHART_H
            : null;
          return (
          <div style={{ margin: "16px 18px 0", padding: "16px", borderRadius: 16, background: C.surface }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontFamily: SANS }}>Progress</div>
              {active ? (
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: MONO, fontVariantNumeric: "tabular-nums" }}>{active.weight}</span>
                  <span style={{ fontSize: 12, color: C.textMid, fontFamily: SANS }}>{fmtDate(active.date)}</span>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS }}>Touch & drag to scrub</div>
              )}
            </div>
            <svg
              ref={weightChartRef}
              width="100%" viewBox={`0 0 ${CHART_W} ${CHART_H + 20}`}
              style={{ display: "block", overflow: "visible", touchAction: "none" }}
            >
              {[0, 0.5, 1].map(p => {
                const y = CHART_H - p * CHART_H;
                const val = Math.round(minV + p * range);
                return (
                  <g key={p}>
                    <line x1="30" y1={y} x2={CHART_W} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                    <text x="24" y={y + 4} fontSize="11" fill={C.textDim} textAnchor="end" fontFamily={SANS}>{val}</text>
                  </g>
                );
              })}
              {(() => {
                const pts = vals.map((v, i) => [30 + (i / Math.max(vals.length - 1, 1)) * (CHART_W - 30), CHART_H - ((v - minV) / range) * CHART_H]);
                const lastPt = pts[pts.length - 1];
                const fmtShort = d => new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
                return (
                  <g>
                    <defs>
                      <linearGradient id="wjArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EEE9E0" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#EEE9E0" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={`M${pts[0][0]},${CHART_H} ` + pts.map(([x, y]) => `L${x},${y}`).join(" ") + ` L${lastPt[0]},${CHART_H} Z`} fill="url(#wjArea)" />
                    <polyline points={pts.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke={C.text} strokeOpacity="0.9" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
                    <circle cx={lastPt[0]} cy={lastPt[1]} r="4.5" fill={C.text} />
                    <text x="30" y={CHART_H + 16} fontSize="11" fill={C.textDim} fontFamily={SANS}>{fmtShort(chartData[0].date)}</text>
                    <text x={CHART_W} y={CHART_H + 16} fontSize="11" fill={C.textDim} textAnchor="end" fontFamily={SANS}>{fmtShort(chartData[chartData.length - 1].date)}</text>
                  </g>
                );
              })()}
              {/* Scrubber: vertical line + emphasized point at the touched index */}
              {activeX !== null && (
                <g pointerEvents="none">
                  <line x1={activeX} y1={0} x2={activeX} y2={CHART_H} stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
                  <circle cx={activeX} cy={activeY} r="6" fill={C.text} stroke="#0b0b0b" strokeWidth="2" />
                </g>
              )}
              {/* Invisible wide hit area so the whole chart height is touchable, not just the line */}
              <rect x={CHART_LEFT} y={0} width={CHART_W - CHART_LEFT} height={CHART_H} fill="transparent" />
            </svg>
          </div>
          );
        })()}
        {/* ── 7-DAY AVERAGE: daily weigh-ins as dots, rolling 7-day mean as a line ── */}
        {chartData.length >= 2 && (() => {
          const toLb = w => (w.unit === "kg" ? parseFloat(w.weight) * 2.20462 : parseFloat(w.weight));
          const pts = chartData.map(w => ({ date: w.date, v: toLb(w) })).filter(p => !isNaN(p.v));
          if (pts.length < 2) return null;
          const avgIn = (from, to) => {
            const xs = pts.filter(p => p.date >= from && p.date <= to).map(p => p.v);
            return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
          };
          const today = todayStr();
          const lastDate = pts[pts.length - 1].date;
          // Anchor on today; if there's no weigh-in this week, anchor on the latest one.
          const end = avgIn(addDays(today, -6), today) != null ? today : lastDate;
          const curAvg = avgIn(addDays(end, -6), end);
          const prevAvg = avgIn(addDays(end, -13), addDays(end, -7));
          const delta = curAvg != null && prevAvg != null ? curAvg - prevAvg : null;
          // Plot the last 60 days of weigh-ins (or all of them if fewer)
          const startDate = addDays(lastDate, -59);
          const shown = pts.filter(p => p.date >= startDate);
          const rolling = shown.map(p => ({ date: p.date, v: avgIn(addDays(p.date, -6), p.date) }));
          const W = 340, H = 130, L = 34, T = 8, B = 18;
          const all = shown.map(p => p.v).concat(rolling.map(r => r.v));
          const lo = Math.floor(Math.min(...all) - 0.5), hi = Math.ceil(Math.max(...all) + 0.5);
          const span = Math.max(1, daysBetween(shown[0].date, lastDate));
          const x = d => L + (daysBetween(shown[0].date, d) / span) * (W - L - 4);
          const y = v => T + (1 - (v - lo) / Math.max(hi - lo, 1)) * (H - T - B);
          const line = rolling.map((r, i) => `${i === 0 ? "M" : "L"}${x(r.date).toFixed(1)},${y(r.v).toFixed(1)}`).join(" ");
          const fmtD = d => new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
          return (
            <div style={{ margin: "12px 18px 0", padding: "16px", borderRadius: 16, background: C.surface }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontFamily: SANS }}>7-Day Average</div>
                <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS }}>dots = weigh-ins · line = 7-day avg</div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
                <span style={{ ...HERO, color: C.text }}>{curAvg != null ? curAvg.toFixed(1) : "–"}</span>
                <span style={{ fontSize: 12, color: C.textDim, fontFamily: SANS }}>lbs</span>
                <span style={{ fontSize: 12, fontFamily: MONO, fontVariantNumeric: "tabular-nums", fontWeight: 600, color: delta == null ? C.textDim : C.textMid }}>
                  {delta == null ? "not enough data for last week" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)} vs previous 7 days`}
                </span>
              </div>
              <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
                {[0, 0.5, 1].map(f => {
                  const v = lo + f * (hi - lo);
                  return (
                    <g key={f}>
                      <line x1={L} y1={y(v)} x2={W} y2={y(v)} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                      <text x={L - 4} y={y(v) + 3} fontSize="12" fill={C.handle} textAnchor="end" fontFamily={MONO}>{v.toFixed(0)}</text>
                    </g>
                  );
                })}
                {shown.map((p, i) => <circle key={i} cx={x(p.date)} cy={y(p.v)} r="2.4" fill={C.handle} />)}
                <path d={line} fill="none" stroke={C.text} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                <text x={L} y={H - 4} fontSize="12" fill={C.handle} fontFamily={MONO}>{fmtD(shown[0].date)}</text>
                <text x={W} y={H - 4} fontSize="12" fill={C.handle} textAnchor="end" fontFamily={MONO}>{fmtD(lastDate)}</text>
              </svg>
            </div>
          );
        })()}
        <div style={{ padding: "14px 18px 4px" }}>
          <button onClick={() => { setWeightDate(todayStr()); setWeightInput(""); setShowWeightForm(true); }}
            style={{ width: "100%", padding: "14px", borderRadius: 14, background: STONE.primary, border: "none", color: C.ink, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
            + Log weight
          </button>
        </div>
        <div style={{ padding: "8px 18px 4px" }}>
          <div style={{ fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontFamily: SANS, fontWeight: 600 }}>History · {weightLog.length} entries</div>
        </div>
        {sorted_w.length === 0 ? (
          <div style={{ margin: "20px 18px", padding: "32px 20px", borderRadius: 16, background: C.surface, border: C.cardBorder, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}><Scale size={30} color={C.textDim} strokeWidth={1.8} /></div>
            <div style={{ color: C.textMid, fontSize: 15 }}>No weight entries yet</div>
          </div>
        ) : (
          <div style={{ padding: "4px 18px 100px" }}>
            {sorted_w.map((w, i) => {
              const prevW = sorted_w[i + 1];
              const d = prevW ? (parseFloat(w.weight) - parseFloat(prevW.weight)).toFixed(1) : null;
              return (
                <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, background: C.surface, border: C.cardBorder, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS }}>{fmtDate(w.date)}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: SANS }}>{w.weight}</span>
                      <span style={{ fontSize: 12, color: C.textDim, fontFamily: SANS }}>{w.unit}</span>
                      {d !== null && (
                        <span style={{ fontSize: 12, fontFamily: SANS, fontWeight: 600, color: parseFloat(d) < 0 ? C.text : parseFloat(d) > 0 ? C.alert : C.textMid }}>
                          {parseFloat(d) > 0 ? "+" : ""}{d}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setWeightLog(prev => { const updated = prev.filter(x => x.id !== w.id); saveWeights(updated); return updated; })}
                    style={{ width: 30, height: 30, borderRadius: 8, background: C.alertWash, border: "1px solid rgba(212,154,184,0.25)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} strokeWidth={2.5} color={C.red} /></button>
                </div>
              );
            })}
          </div>
        )}
        {showWeightForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-end", zIndex: 100 }}
            onClick={() => setShowWeightForm(false)}>
            <div style={{ background: C.sheet, width: "100%", borderRadius: "24px 24px 0 0", padding: "24px 18px 48px", borderBottom: "none" }}
              onClick={e => e.stopPropagation()}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: C.handle, margin: "0 auto 20px" }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 16, fontFamily: SANS }}>Log Weight</div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Date</label>
                <input type="date" style={modalInput} value={weightDate} onChange={e => setWeightDate(e.target.value)} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={labelStyle}>Weight</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["lbs"].map(u => (
                      <button key={u} onClick={() => setWeightUnit(u)} style={{ padding: "4px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 12, fontWeight: 600, background: weightUnit === u ? STONE.carrara : C.surface3, color: weightUnit === u ? C.ink : C.textMid }}>{u}</button>
                    ))}
                  </div>
                </div>
                <input type="number" inputMode="decimal" style={{ ...modalInput, ...HERO, textAlign: "center", padding: "10px 14px" }}
                  value={weightInput} onChange={e => setWeightInput(e.target.value)} placeholder="0.0" autoFocus />
              </div>
              <button onClick={addWeight} style={{ width: "100%", padding: "15px", borderRadius: 14, background: STONE.primary, border: "none", color: C.ink, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                Save →
              </button>
            </div>
          </div>
        )}
        <ResumeBar session={inProgressSession && activeId !== inProgressSession?.id ? inProgressSession : null} onResume={() => { setActiveId(inProgressSession.id); setTab("journal"); setView("entry"); }} onDismiss={() => dismissResume(inProgressSession.id)} />
        <BottomNav tab={tab} setTab={setTab} onOpenMenu={() => setShowMoreMenu(true)} />
        <MoreMenu open={showMoreMenu} onClose={() => setShowMoreMenu(false)} onSelect={(id) => { setShowMoreMenu(false); setTab(id); setView("journal"); }} />
      </Shell>
    );
  }

  // ── JOURNAL HOME ──────────────────────────────────────────────────────────
  return (
    <Shell>
      <div style={{ padding: "52px 18px 20px", background: "transparent" }}>
        <div style={{ fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontFamily: SANS, marginBottom: 4 }}>Training Journal</div>
        <div style={{ ...TITLE, color: C.text }}>My Workouts</div>
        <div style={{ marginTop: 6 }}>
          <div style={{ fontSize: 12, color: C.textDim }}>{entries.filter(e => e.completedAt).length} session{entries.filter(e => e.completedAt).length !== 1 ? "s" : ""} logged</div>
        </div>
      </div>

      {/* ── TODAY card: what today is in the 8-day cycle, plus a one-tap Start/Resume ── */}
      {(() => {
        // Reuses todayPlan (8-day cycle walk from the last completed session) and
        // mesocycleWeek; no program logic is duplicated here.
        const plan = todayPlan(entries, today);
        const cycleDay = plan.kind === "done" ? plan.doneDay
          : plan.kind === "train" ? plan.day
          : ((((plan.day - 1 - daysBetween(today, plan.due)) % CYCLE_DAYS) + CYCLE_DAYS) % CYCLE_DAYS) + 1;
        const meso0 = mesocycleWeek(entries, mesoOverride);
        const dl = loadDeload();
        const dlSt = deloadStatus(dl, entries, today);
        const meso = { ...meso0, isDeload: deloadNow(entries, today, meso0.isDeload) };
        const dlDay = plan.kind === "done" ? null : plan.day;
        const dlLines = dl && dlDay && (dlSt.status === "active" || (dlSt.status === "scheduled" && dlSt.daysAway <= 3))
          ? (dl.plans?.[newLocation ?? "equinox"]?.[dlSt.status === "scheduled" ? 1 : dlDay] ?? []) : null;
        const nextProg = PROGRAM[plan.day];
        const todaysOpen = entries.find(e => !e.completedAt && e.date === today);
        const resumeTarget = todaysOpen ?? inProgressSession;
        const doneEntry = plan.kind === "done"
          ? entries.find(e => e.date === today && e.completedAt && e.programDay === plan.doneDay) ?? null
          : null;
        const title = plan.kind === "done" ? (PROGRAM[plan.doneDay]?.title ?? "Session")
          : plan.kind === "train" ? (nextProg?.title ?? "Training")
          : "Rest Day";
        const sub = plan.kind === "done" ? "Done for today. Nice work."
          : plan.kind === "train" ? (plan.overdue > 0 ? `${plan.overdue} day${plan.overdue !== 1 ? "s" : ""} overdue, do it today` : "Scheduled for today")
          : `Next: ${nextProg?.title ?? "training"} on ${new Date(plan.due + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`;
        const startToday = () => { setNewProgramDay(plan.day); setNewDate(today); setShowNewModal(true); };
        const bigBtn = { width: "100%", marginTop: 14, padding: "16px", borderRadius: 14, border: "none", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: SANS, letterSpacing: 0.3, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 };
        return (
          <div style={{ margin: "4px 18px 4px", padding: "16px 16px 16px", borderRadius: 18, background: C.surface, border: C.cardBorder, boxShadow: shadow }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div style={{ fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontFamily: SANS, fontWeight: 600 }}>Today</div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 12, fontFamily: MONO, fontVariantNumeric: "tabular-nums", color: C.textMid }}>Day {cycleDay} of {CYCLE_DAYS}</span>
                <span style={{ fontSize: 12, color: C.textDim }}>·</span>
                <span style={{ fontSize: 12, fontFamily: MONO, fontVariantNumeric: "tabular-nums", color: meso.isDeload ? C.amber : C.textMid, fontWeight: meso.isDeload ? 600 : 400 }}>
                  Week {meso.week}{meso.isDeload ? " · Deload" : ""}
                </span>
              </div>
            </div>
            <div style={{ ...TITLE, color: C.text, marginTop: 8 }}>{title}</div>
            <div style={{ fontSize: 12, color: plan.kind === "done" ? C.green : C.textMid, fontFamily: SANS, marginTop: 4 }}>{sub}</div>
            {resumeTarget ? (
              <button onClick={() => { setActiveId(resumeTarget.id); setView("entry"); }}
                style={{ ...bigBtn, background: STONE.primary, color: C.ink }}>
                <Play size={16} strokeWidth={2.4} /> Resume{resumeTarget.date !== today ? ` (${fmtDate(resumeTarget.date)})` : ""}
              </button>
            ) : plan.kind === "train" ? (
              <button onClick={startToday} style={{ ...bigBtn, background: STONE.primary, color: C.ink }}>
                <Dumbbell size={18} strokeWidth={2.2} /> Start
              </button>
            ) : plan.kind === "done" && doneEntry ? (
              <button onClick={() => { setActiveId(doneEntry.id); setView("entry"); }}
                style={{ ...bigBtn, background: C.surface2, color: C.text, fontSize: 15 }}>
                View today's session
              </button>
            ) : plan.kind === "rest" ? (
              <button onClick={startToday} style={{ ...bigBtn, background: C.surface2, color: C.textMid, fontSize: 15, padding: "13px" }}>
                Start {nextProg?.tag ?? "next session"} early
              </button>
            ) : null}
            <DeloadToday status={dlSt.status} startDate={dl?.startDate} suggestedStart={nextCycleStart(entries, today)}
              day={dlSt.status === "scheduled" ? 1 : dlDay} lines={dlLines}
              onOn={() => {
                const start = nextCycleStart(entries, today);
                const pick = window.prompt("Deload starts on (YYYY-MM-DD). This is your next Day 1:", start);
                if (!pick || !/^\d{4}-\d{2}-\d{2}$/.test(pick.trim())) return;
                scheduleDeload(entries, today, pick.trim()); setDeloadRev(n => n + 1);
              }}
              onOff={() => { if (window.confirm("Turn off the deload cycle?")) { saveDeload(null); setDeloadRev(n => n + 1); } }} />
          </div>
        );
      })()}

      {/* Coach check-in reminder */}
      {(() => {
        const today = todayStr();
        const { latest, next } = checkinSchedule(today);
        const due = latest && !checkinsDone.includes(latest);
        const meso = mesocycleWeek(entries, mesoOverride);
        const blockReview = meso.week >= meso.total - 1;
        const fmtShort = d => new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        if (!due) {
          return (
            <div style={{ margin: "12px 18px 0", fontSize: 12, color: C.textDim, fontFamily: SANS }}>
              Next coach check-in with Claude: {fmtShort(next)}
            </div>
          );
        }
        const trend = weightTrend(weightLog, today);
        const advice = surplusAdvice(trend.rate);
        const btn = { flex: 1, padding: "11px 8px", borderRadius: 12, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS };
        return (
          <div style={{ margin: "12px 18px 4px", padding: "14px 16px", borderRadius: 14, background: "rgba(218,214,211,0.08)", border: "1px solid rgba(201,166,190,0.27)" }}>
            <div style={{ fontSize: 12, letterSpacing: 0.2, color: C.warn, fontFamily: SANS, fontWeight: 600, marginBottom: 6 }}>
              {blockReview ? "Block review due" : "Check-in due"} · {fmtShort(latest)}
            </div>
            <div style={{ fontSize: 12, color: C.text, fontFamily: SANS, lineHeight: 1.5 }}>
              {trend.now != null && <div style={{ marginBottom: 4 }}>7-day avg weight: <b>{trend.now.toFixed(1)} lb</b>{trend.before != null ? ` (was ${trend.before.toFixed(1)} two weeks ago)` : ""}</div>}
              <div>{advice.text}</div>
              <div style={{ marginTop: 8, color: C.textMid, fontSize: 12 }}>
                Export the coach report and backup, then send both to Claude in the Bodybuilding project with a line on energy, sleep, digestion and anything that felt off.
                {blockReview ? " This one is the end-of-block review: bring progress photos too, and we'll plan the next block and deload." : ""}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => downloadCoachPDF(entries, weightLog, meso)} style={{ ...btn, background: C.surface2, color: C.text }}>Coach PDF</button>
              <button onClick={() => downloadJSON(entries, weightLog, mesoOverride, cycleAnchor, macros, macroTargets)} style={{ ...btn, background: C.surface2, color: C.text }}>Backup JSON</button>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              {(advice.action === "add" || advice.action === "remove") && (
                <button onClick={() => {
                  const bump = t => ({ ...t, c: Math.max(0, t.c + advice.carbs) });
                  saveMacroTargets({ training: bump(macroTargets.training), rest: bump(macroTargets.rest) });
                  markCheckinDone(latest);
                }} style={{ ...btn, background: STONE.venato, color: C.ink }}>
                  {advice.action === "add" ? "Add" : "Remove"} 38g carbs & done
                </button>
              )}
              <button onClick={() => markCheckinDone(latest)} style={{ ...btn, background: STONE.carrara, color: C.ink }}>Mark done</button>
            </div>
          </div>
        );
      })()}

      {/* Mesocycle banner */}
      {(() => {
        const meso = mesocycleWeek(entries, mesoOverride);
        const dimColor = INK.stone;
        return (
          <div onClick={() => setShowMesoEdit(true)} style={{ margin: "12px 18px 4px", padding: "14px 16px", borderRadius: 14, background: STONE.venato, cursor: "pointer", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 12, letterSpacing: 0.2, color: dimColor, fontFamily: SANS, fontWeight: 600 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Flame size={13} strokeWidth={2.2} /> Mesocycle {meso.cycle} · Week {meso.week} of {meso.total}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: INK.stone, fontFamily: SANS, fontWeight: meso.isDeload ? 600 : 500 }}>{meso.isDeload ? "Deload" : "Accumulation"}</span>
                <Pencil size={12} color={INK.stone} strokeWidth={2} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              {Array.from({ length: meso.total }, (_, i) => {
                const wk = i + 1;
                const isCurrent = wk === meso.week;
                return (
                  <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: isCurrent ? INK.stone : wk < meso.week ? "rgba(26,26,26,0.4)" : "rgba(26,26,26,0.12)" }} />
                );
              })}
            </div>
            {meso.isDeload && (
              <div style={{ fontSize: 12, color: INK.stone, fontWeight: 600, fontFamily: SANS, marginTop: 8 }}>
                Deload week: drop volume ~50%, keep weights, leave 3–4 RIR
              </div>
            )}
            {!meso.isDeload && meso.week >= 3 && (
              <div style={{ fontSize: 12, color: INK.stone, fontFamily: SANS, marginTop: 8 }}>
                Add a set to lagging muscles this week · deload in {meso.total - meso.week} wk{meso.total - meso.week !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        );
      })()}

      {/* ── THIS CYCLE tracker ──────────────────────────────────────────── */}
      {(() => {
        const trainingDays = Object.entries(PROGRAM).filter(([, d]) => d.exercises.length > 0);
        const allDayNums = trainingDays.map(([dn]) => Number(dn));

        // If a manual cycle anchor exists, only look at sessions from that date forward
        // Otherwise use the completion-based cycle detection
        let completedDays;
        if (cycleAnchor) {
          completedDays = new Set(
            entries
              .filter(e => e.completedAt && e.date >= cycleAnchor && e.programDay && allDayNums.includes(e.programDay))
              .map(e => e.programDay)
          );
        } else {
          // Walk backwards: collect sessions until we hit a repeated day
          const completedSessions = [...entries]
            .filter(e => e.completedAt && e.programDay && allDayNums.includes(e.programDay))
            .sort((a, b) => b.date.localeCompare(a.date) || b.completedAt.localeCompare(a.completedAt));
          completedDays = new Set();
          for (const e of completedSessions) {
            if (completedDays.has(e.programDay)) break;
            completedDays.add(e.programDay);
          }
        }

        const doneCount = completedDays.size;
        const remaining = trainingDays.filter(([dn]) => !completedDays.has(Number(dn)));

        return (
          <div style={{ margin: "0 18px 12px", padding: "14px 16px", borderRadius: 16, background: C.surface }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textMid, letterSpacing: 0.2, fontFamily: SANS }}>This Cycle</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 12, fontFamily: MONO, fontVariantNumeric: "tabular-nums", color: doneCount === trainingDays.length ? C.green : C.textMid }}>
                  {doneCount}/{trainingDays.length} done
                </div>
                <button onClick={() => { setAnchorEditValue(todayStr()); setShowAnchorEdit(true); }}
                  style={{ fontSize: 12, fontWeight: 600, color: LAKE.sky, background: LAKE.sky + "22", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontFamily: SANS, letterSpacing: 0.3 }}>
                  New Cycle
                </button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {trainingDays.map(([dn, d]) => {
                const done = completedDays.has(Number(dn));
                return (
                  <div key={dn} onClick={() => { setNewProgramDay(Number(dn)); setNewDate(todayStr()); setShowNewModal(true); }}
                    style={{ flex: 1, borderRadius: 10, padding: "8px 4px", textAlign: "center", cursor: "pointer",
                      background: done ? d.color + "22" : C.surface2,
                      
                      opacity: done ? 0.7 : 1,
                    }}>
                    <div style={{ fontSize: 15, fontWeight: 600, fontFamily: MONO, fontVariantNumeric: "tabular-nums", color: done ? d.color : C.text }}>
                      {done ? "✓" : dn}
                    </div>
                    <div style={{ fontSize: 12, letterSpacing: 0.2, color: done ? d.color + "aa" : C.textDim, marginTop: 2, fontFamily: SANS }}>{d.tag}</div>
                  </div>
                );
              })}
            </div>
            {remaining.length > 0 && (
              <div style={{ marginTop: 10, fontSize: 12, color: C.textDim, fontFamily: SANS }}>
                Remaining: {remaining.map(([, d]) => d.title.split("&")[0].trim()).join(" · ")}
              </div>
            )}
          </div>
        );
      })()}

      {showAnchorEdit && (
        <div onClick={() => setShowAnchorEdit(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "flex-end", zIndex: 100 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.sheet, width: "100%", borderRadius: "24px 24px 0 0", padding: "20px 18px 40px", boxSizing: "border-box", maxWidth: 430, margin: "0 auto" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: C.line, margin: "0 auto 18px" }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6, fontFamily: SANS }}>Set Cycle Start Date</div>
            <div style={{ fontSize: 12, color: C.textDim, marginBottom: 16, fontFamily: SANS, lineHeight: 1.5 }}>
              Only sessions completed on or after this date count toward the current cycle. Use this to correct the tracker if it ever gets out of sync, or set it to today to deliberately start fresh.
            </div>
            <input type="date" value={anchorEditValue} onChange={e => setAnchorEditValue(e.target.value)}
              style={{ width: "100%", background: C.surface2, borderRadius: 10, padding: "12px 14px", fontSize: 16, color: C.text, outline: "none", fontFamily: SANS, boxSizing: "border-box", marginBottom: 16, border: "none" }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowAnchorEdit(false)}
                style={{ flex: 1, padding: "14px", borderRadius: 12, background: C.surface2, color: C.textMid, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                Cancel
              </button>
              <button onClick={() => { saveCycleAnchor(anchorEditValue); setShowAnchorEdit(false); }}
                style={{ flex: 2, padding: "14px", borderRadius: 12, background: STONE.primary, color: C.ink, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: "4px 18px 8px" }}>
        <button onClick={() => { setNewProgramDay(null); setNewDate(todayStr()); setShowNewModal(true); }}
          style={{ width: "100%", padding: "15px", borderRadius: 14, background: STONE.primary, border: "none", color: C.ink, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: SANS, letterSpacing: 0.2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 20px rgba(184,212,232,0.2)" }}>
          <Dumbbell size={18} strokeWidth={2.2} /> Log Today's Session
        </button>
      </div>

      {sorted.length === 0 ? (
        <div style={{ margin: "40px 18px", textAlign: "center", color: C.textDim }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}><ClipboardList size={30} color={C.textDim} strokeWidth={1.8} /></div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.textMid }}>No sessions yet</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Tap a program day above or log a new session</div>
        </div>
      ) : (
        <div style={{ padding: "4px 18px 100px" }}>
          {sorted.map(entry => {
            const prog = entry.programDay ? PROGRAM[entry.programDay] : null;
            const color = prog?.color ?? C.textDim;
            const isRest = prog?.exercises?.length === 0;
            const mvDone = entry.movements.filter(m => m.sets.some(s => s.r)).length;
            const inProgress = !entry.completedAt && entry.date === today;
            return (
              <div key={entry.id}
                onClick={() => { setActiveId(entry.id); setView("entry"); }}
                style={{ marginBottom: 12, borderRadius: 18, overflow: "hidden", background: inProgress ? LAKE.sky + "14" : C.surface, border: C.cardBorder, cursor: "pointer", opacity: inProgress ? 0.9 : 1 }}>
                <div style={{ height: 4, background: inProgress ? LAKE.sky + "66" : isRest ? C.surface3 : color }} />
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS, letterSpacing: 0.2, marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}>
                        {fmtDate(entry.date)}{prog ? ` · DAY ${entry.programDay}` : ""}
                        {entry.completedAt && <span style={{ color: C.text, fontWeight: 600 }}>✓</span>}
                        {entry.location === "apartment" && (
                          <span style={{ fontSize: 12, fontWeight: 600, color: C.warn, background: "rgba(218,214,211,0.13)", padding: "2px 7px", borderRadius: 4, letterSpacing: 0.2 }}>
                            Apartment
                          </span>
                        )}
                        {inProgress && (
                          <span style={{ fontSize: 12, fontWeight: 600, color: C.ink, background: STONE.carrara, padding: "2px 7px", borderRadius: 4, letterSpacing: 0.2 }}>
                            In Progress
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: C.text, lineHeight: 1.2 }}>{entry.customTitle || "Untitled Session"}</div>
                      {entry.note ? (
                        <div style={{ fontSize: 12, color: C.textMid, marginTop: 5, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{entry.note}</div>
                      ) : null}
                    </div>
                    <div style={{ fontSize: 15, color: C.textFaint }}>›</div>
                  </div>
                  {!isRest && entry.movements.length > 0 && (
                    <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {entry.movements.slice(0, 5).map(mv => (
                        <span key={mv.id} style={{ fontSize: 12, padding: "3px 9px", borderRadius: 7, background: C.surface2, color: C.textMid, fontFamily: SANS }}>
                          {mv.programRef ? `${mv.programRef}. ` : ""}{mv.name || "–"}
                        </span>
                      ))}
                      {entry.movements.length > 5 && (
                        <span style={{ fontSize: 12, padding: "3px 9px", borderRadius: 7, background: C.surface2, color: C.textDim }}>
                          +{entry.movements.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                  {!isRest && (
                    <div style={{ marginTop: 8, fontSize: 12, color: C.textDim, fontFamily: SANS }}>
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

      {showMesoEdit && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "flex-end", zIndex: 100 }}
          onClick={() => setShowMesoEdit(false)}>
          <div style={{ background: C.sheet, width: "100%", borderRadius: "24px 24px 0 0", padding: "24px 18px 44px", borderBottom: "none", boxSizing: "border-box" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: C.surface3, margin: "0 auto 20px" }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6, fontFamily: SANS }}>Set Mesocycle Week</div>
            <div style={{ fontSize: 12, color: C.textMid, marginBottom: 18, fontFamily: SANS, lineHeight: 1.5 }}>
              Which week of the {MESO_LENGTH}-week block are you in right now? It'll count forward from today.
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {Array.from({ length: MESO_LENGTH }, (_, i) => {
                const wk = i + 1;
                const isDeloadWk = wk === MESO_LENGTH;
                const current = mesocycleWeek(entries, mesoOverride).week === wk;
                return (
                  <button key={wk} onClick={() => { saveMesoOverride({ anchorDate: todayStr(), weekAtAnchor: wk }); setShowMesoEdit(false); }}
                    style={{ flex: 1, padding: "16px 0", borderRadius: 12, background: current ? STONE.carrara : C.surface2, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, fontFamily: MONO, fontVariantNumeric: "tabular-nums", color: current ? C.ink : C.text }}>{wk}</span>
                    <span style={{ fontSize: 12, fontFamily: SANS, fontWeight: 600, letterSpacing: 0.2, color: current ? C.ink : C.textDim }}>{isDeloadWk ? "Deload" : "Wk"}</span>
                  </button>
                );
              })}
            </div>
            <button onClick={() => { saveMesoOverride(null); setShowMesoEdit(false); }}
              style={{ width: "100%", padding: "12px", borderRadius: 12, background: "transparent", color: C.textMid, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
              Reset to automatic
            </button>
          </div>
        </div>
      )}

      {showNewModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-end", zIndex: 100 }}
          onClick={() => setShowNewModal(false)}>
          <div style={{ background: C.sheet, width: "100%", borderRadius: "24px 24px 0 0", padding: "24px 18px 44px", borderBottom: "none", boxSizing: "border-box", overflow: "hidden" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: C.handle, margin: "0 auto 20px" }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 16, fontFamily: SANS }}>Log Session</div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Date</label>
              <div style={{ position: "relative" }}>
                <div style={{ ...modalInput, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                  <span>{newDate ? new Date(newDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "Select date"}</span>
                  <span style={{ fontSize: 12, color: C.textMid }}>tap to change</span>
                </div>
                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                  style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }} />
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Program Day (optional)</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                <div onClick={() => setNewProgramDay(null)} style={{ padding: "7px 14px", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: SANS, background: newProgramDay === null ? STONE.carrara : C.surface2, color: newProgramDay === null ? C.ink : C.textMid }}>Custom</div>
                {Object.entries(PROGRAM).map(([dn, d]) => (
                  <div key={dn} onClick={() => setNewProgramDay(Number(dn))} style={{ padding: "8px 12px", borderRadius: 10, cursor: "pointer", fontFamily: SANS, background: newProgramDay === Number(dn) ? fill(d.color) : C.surface2, color: newProgramDay === Number(dn) ? C.ink : d.color, textAlign: "center", minWidth: 56 }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{dn}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.2, marginTop: 2, opacity: 0.85 }}>
                      {d.tag}
                    </div>
                  </div>
                ))}
              </div>
              {newProgramDay && (() => {
                const last = getLastSession(entries, newProgramDay);
                const subCount = PROGRAM[newProgramDay].exercises.filter(ex => GYM_SUBS[`${newProgramDay}.${ex.id}`]).length;
                return (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS }}>→ {PROGRAM[newProgramDay].title} · {PROGRAM[newProgramDay].exercises.length} exercises pre-loaded</div>
                    {last ? (
                      <div style={{ fontSize: 12, color: "rgba(238,233,224,0.47)", fontFamily: SANS, marginTop: 4 }}>✓ Last session {fmtDate(last.date)} · weights carried forward</div>
                    ) : (
                      <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS, marginTop: 4 }}>No previous session found · sets will start blank</div>
                    )}
                    {newLocation !== "equinox" && subCount > 0 && (
                      <div style={{ fontSize: 12, color: C.warn, fontFamily: SANS, marginTop: 4 }}>⇄ {subCount} exercise{subCount !== 1 ? "s" : ""} swapped for apartment equipment</div>
                    )}
                  </div>
                );
              })()}
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Location</label>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                {Object.entries(LOCATIONS).map(([key, loc]) => (
                  <div key={key} onClick={() => setNewLocation(key)}
                    style={{ flex: 1, padding: "10px 12px", borderRadius: 10, cursor: "pointer", fontFamily: SANS, fontSize: 12, fontWeight: 600, textAlign: "center", background: newLocation === key ? STONE.carrara : C.surface2, color: newLocation === key ? C.ink : C.textMid }}>
                    {loc.label}
                  </div>
                ))}
              </div>
              {newLocation !== "equinox" && (
                <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS, marginTop: 6, lineHeight: 1.4 }}>
                  Exercises with no apartment-friendly equivalent stay as programmed. Edit any movement name in-session if the swap still doesn't fit.
                </div>
              )}
            </div>
            <button onClick={createEntry} style={{ width: "100%", padding: "15px", borderRadius: 14, background: STONE.primary, border: "none", color: C.ink, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
              Create session →
            </button>
          </div>
        </div>
      )}
      <ResumeBar session={inProgressSession && activeId !== inProgressSession?.id ? inProgressSession : null} onResume={() => { setActiveId(inProgressSession.id); setTab("journal"); setView("entry"); }} onDismiss={() => dismissResume(inProgressSession.id)} />
      <BottomNav tab={tab} setTab={setTab} onOpenMenu={() => setShowMoreMenu(true)} />
        <MoreMenu open={showMoreMenu} onClose={() => setShowMoreMenu(false)} onSelect={(id) => { setShowMoreMenu(false); setTab(id); setView("journal"); }} />
    </Shell>
  );
}
