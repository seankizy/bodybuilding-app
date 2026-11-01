import { C, SANS, STONE, INK, fill } from "../theme.js";

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────
export function RestTimer({ restSecs, restLabel, color, timerState, onStart, onPause, onResume, onReset, onDismiss }) {
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
    <div style={{ margin: "2px 18px 8px", padding: "10px 14px", borderRadius: 14, background: done ? `linear-gradient(rgba(12,12,12,0.55), rgba(12,12,12,0.55)), ${STONE.carrara}` : C.surface, border: C.cardBorder, display: "flex", alignItems: "center", gap: 12, transition: "background 0.3s" }}>
      <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0 }}>
        <svg width="52" height="52" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="26" cy="26" r={R} fill="none" stroke={C.textFaint} strokeWidth="3" />
          <circle cx="26" cy="26" r={R} fill="none" stroke={done || running ? C.selected : C.textDim} strokeWidth="3" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.9s linear, stroke 0.3s" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, fontFamily: SANS, color: done ? C.selected : running ? C.text : C.textDim }}>
          {done ? "✓" : timeStr}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, letterSpacing: 0.2, fontFamily: SANS, color: done ? C.selected : C.textDim, fontWeight: 600, marginBottom: 6 }}>
          {done ? "Rest complete" : `Rest · ${restLabel}`}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {!active && !done && <button onClick={onStart} style={timerBtn(color, true)}>▶ Start</button>}
          {active && running && <button onClick={onPause} style={timerBtn(C.handle, false)}>⏸ Pause</button>}
          {active && !running && !done && <button onClick={onResume} style={timerBtn(color, true)}>▶ Resume</button>}
          {active && <button onClick={onReset} style={timerBtn(C.surface3, false)}>↺</button>}
          {done && <button onClick={onDismiss} style={timerBtn(color, true)}>Next set →</button>}
        </div>
      </div>
    </div>
  );
}
export function timerBtn(bg, bright) {
  return { padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: bright ? STONE.carrara : fill(bg), color: bright ? INK.stone : C.textMid, fontSize: 12, fontWeight: 600, fontFamily: SANS };
}
