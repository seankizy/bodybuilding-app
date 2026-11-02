import { useState, useEffect } from "react";
import { X } from "../icons.jsx";
import { C, SANS, MONO, STONE, LAKE } from "../theme.js";
import { todayStr } from "../lib/utils.js";
import { addDays } from "../lib/checkins.js";
import { deloadStatus, loadDeload } from "../lib/deload.js";

const fmtDay = d => new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

// Shows once when the deload starts, and once when it ends and the next-block targets go live.
export function DeloadBanner() {
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    const check = () => {
      const d = loadDeload();
      if (!d) return setMsg(null);
      let entries = [];
      try { entries = JSON.parse(localStorage.getItem("wj_entries") || "[]") || []; } catch {}
      const today = todayStr();
      const st = deloadStatus(d, entries, today);
      let seen = {};
      try { seen = JSON.parse(localStorage.getItem("wj_deload_seen") || "{}"); } catch {}
      if (st.status === "active" && seen.start !== d.startDate) {
        setMsg({ key: "start", text: `Deload cycle starts${today === d.startDate ? " today" : ""}. Each lift shows its exact weight x reps x sets. RIR 3 to 4, nothing to failure.` });
      } else if (st.status === "done" && seen.end !== d.startDate && today <= addDays(st.end, 10)) {
        setMsg({ key: "end", text: "Deload done. Next-block targets are now live on each exercise." });
      } else setMsg(null);
    };
    check();
    const onVis = () => { if (document.visibilityState === "visible") check(); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);
  if (!msg) return null;
  const close = () => {
    const d = loadDeload();
    let seen = {};
    try { seen = JSON.parse(localStorage.getItem("wj_deload_seen") || "{}"); } catch {}
    seen[msg.key] = d?.startDate;
    try { localStorage.setItem("wj_deload_seen", JSON.stringify(seen)); } catch {}
    setMsg(null);
  };
  return (
    <div style={{ position: "fixed", top: "calc(env(safe-area-inset-top) + 10px)", left: 18, right: 18, maxWidth: 394, margin: "0 auto", background: "#161616", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, zIndex: 61, boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${LAKE.sky}33`, fontFamily: SANS }}>
      <div style={{ flex: 1, fontSize: 12, color: C.text, lineHeight: 1.45 }}>{msg.text}</div>
      <button onClick={close} style={{ width: 26, height: 26, borderRadius: 8, background: C.surface3, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <X size={13} color={C.textMid} strokeWidth={2.5} />
      </button>
    </div>
  );
}

// One-line cue with the detail behind a tap. label: "Next block" (preview) or "Target".
export function CueLine({ cue, label = "Next block", style }) {
  const [open, setOpen] = useState(false);
  if (!cue) return null;
  return (
    <div onClick={e => { e.stopPropagation(); setOpen(v => !v); }} style={{ marginTop: 6, padding: "7px 10px", borderRadius: 9, background: C.surface2, cursor: "pointer", fontFamily: SANS, ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12 }}>
        <span style={{ color: C.text }}><span style={{ color: C.textDim, fontWeight: 600 }}>{label}: </span>{cue.short}</span>
        <span style={{ color: C.textDim, flexShrink: 0 }}>{open ? "Less" : "Why"}</span>
      </div>
      {open && cue.detail.map((t, i) => (
        <div key={i} style={{ fontSize: 12, color: C.textMid, lineHeight: 1.45, marginTop: 6 }}>{t}</div>
      ))}
    </div>
  );
}

// Planned line for a deload exercise: weight x reps x sets.
export function DeloadPlanLine({ plan }) {
  if (!plan) return null;
  return (
    <div style={{ marginTop: 6, fontSize: 12, fontFamily: SANS, color: C.text }}>
      <span style={{ fontWeight: 600, color: C.textDim }}>Deload: </span>
      <span style={{ fontFamily: MONO, fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{plan.text}</span>
      <span style={{ color: C.textMid }}> · RIR 3 to 4</span>
    </div>
  );
}

// Today card section: the toggle, and the day's full prescription during the deload.
export function DeloadToday({ status, startDate, suggestedStart, day, lines, onOn, onOff }) {
  const small = { padding: "6px 10px", borderRadius: 8, border: "none", background: C.surface2, color: C.text, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS };
  if (status === "off" || status === "done") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 12, fontSize: 12, color: C.textMid, fontFamily: SANS }}>
        <span>Deload next cycle, from {fmtDay(suggestedStart)}</span>
        <button onClick={onOn} style={small}>Plan deload</button>
      </div>
    );
  }
  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.line}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, fontSize: 12, fontFamily: SANS }}>
        <span style={{ color: C.text, fontWeight: 600 }}>
          {status === "scheduled" ? `Deload cycle starts ${fmtDay(startDate)}` : "Deload cycle"}
        </span>
        <button onClick={onOff} style={{ ...small, color: C.textMid }}>Turn off</button>
      </div>
      {lines && lines.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {status === "scheduled" && <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS, marginBottom: 4 }}>Day {day} preview</div>}
          {lines.map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "5px 0", fontSize: 12, fontFamily: SANS }}>
              <span style={{ color: C.textMid, minWidth: 0 }}>{p.name}</span>
              <span style={{ color: C.text, fontFamily: MONO, fontVariantNumeric: "tabular-nums", fontWeight: 600, flexShrink: 0 }}>{p.text}</span>
            </div>
          ))}
          <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS, marginTop: 4 }}>RIR 3 to 4 on every set. Nothing to failure.</div>
        </div>
      )}
    </div>
  );
}
