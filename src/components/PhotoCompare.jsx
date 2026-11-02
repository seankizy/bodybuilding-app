import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "../icons.jsx";
import { C, SANS, MONO, STONE } from "../theme.js";
import { fmtDate } from "../lib/utils.js";
import { apiFetch, appHeaders } from "../lib/storage.js";
import { daysBetween } from "../lib/checkins.js";

// ── PHOTO COMPARE HELPERS ────────────────────────────────────────────────────
// Body weight logged nearest to a photo date (either side), for the compare captions.
export function nearestWeight(weightLog, date) {
  let best = null;
  for (const w of weightLog ?? []) {
    if (isNaN(parseFloat(w.weight))) continue;
    const off = Math.abs(daysBetween(w.date, date));
    if (!best || off < best.daysOff) best = { weight: w.weight, unit: w.unit || "lbs", date: w.date, daysOff: off };
  }
  return best;
}
export function PhotoWeightCaption({ weightLog, date }) {
  const nw = nearestWeight(weightLog, date);
  return (
    <div style={{ textAlign: "center", marginTop: 3, fontSize: 12, color: C.textMid, fontFamily: SANS }}>
      {nw ? (
        <>
          <span style={{ fontFamily: MONO, fontVariantNumeric: "tabular-nums", fontWeight: 600, color: C.text }}>{nw.weight} {nw.unit}</span>
          <span style={{ color: C.textDim }}>{nw.daysOff === 0 ? " · same day" : ` · weighed ${fmtDate(nw.date)}`}</span>
        </>
      ) : <span style={{ color: C.textDim }}>No weigh-in logged</span>}
    </div>
  );
}
// Loads a Drive photo through the same passcode-protected /api/photos route the
// zoomable viewer uses, and returns a blob URL (revoked on change/unmount).
export function usePhotoBlob(fileId) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let cancelled = false, local = null;
    setUrl(null);
    if (!fileId) return;
    (async () => {
      try {
        const resp = await apiFetch(`/api/photos?id=${encodeURIComponent(fileId)}`, { headers: appHeaders() });
        if (!resp.ok) return;
        const blob = await resp.blob();
        if (cancelled) return;
        local = URL.createObjectURL(blob);
        setUrl(local);
      } catch {}
    })();
    return () => { cancelled = true; if (local) URL.revokeObjectURL(local); };
  }, [fileId]);
  return url;
}
// Saved alignment per photo: { x, y } offset in % of the frame and s scale.
// Each photo is aligned once against any other, and every pair it is in lines up.
const ALIGN_KEY = "wj_photo_align";
function loadAlign() { try { return JSON.parse(localStorage.getItem(ALIGN_KEY) || "{}"); } catch { return {}; } }
function saveAlignFor(id, t) {
  const all = loadAlign();
  if (!t || (t.x === 0 && t.y === 0 && t.s === 1)) delete all[id]; else all[id] = t;
  try { localStorage.setItem(ALIGN_KEY, JSON.stringify(all)); } catch {}
}
const NO_T = { x: 0, y: 0, s: 1 };
const tf = t => `translate(${t.x}%, ${t.y}%) scale(${t.s})`;

// Two photos stacked; drag anywhere on the image to move the divider. A shows on
// the left of the divider, B on the right. Align mode lays A over B at half
// opacity: drag to move A, pinch to resize it, and the fit is saved for that photo.
export function SliderCompare({ a, b }) {
  const urlA = usePhotoBlob(a?.id), urlB = usePhotoBlob(b?.id);
  const [pos, setPos] = useState(50);
  const [align, setAlign] = useState(false);
  const [tA, setTA] = useState(NO_T);
  const [tB, setTB] = useState(NO_T);
  const [grid, setGrid] = useState(false);
  useEffect(() => { const all = loadAlign(); setTA(all[a?.id] ?? NO_T); setTB(all[b?.id] ?? NO_T); }, [a?.id, b?.id]);
  const boxRef = useRef(null);
  const dragging = useRef(false);
  const pts = useRef(new Map());
  const gesture = useRef(null);
  const setFromX = clientX => {
    const r = boxRef.current?.getBoundingClientRect();
    if (!r || r.width === 0) return;
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };
  const startGesture = () => {
    const list = [...pts.current.values()];
    const cx = list.reduce((n, p) => n + p.x, 0) / list.length, cy = list.reduce((n, p) => n + p.y, 0) / list.length;
    const dist = list.length > 1 ? Math.hypot(list[0].x - list[1].x, list[0].y - list[1].y) : null;
    gesture.current = { cx, cy, dist, t: tA };
  };
  const moveGesture = () => {
    const g = gesture.current, r = boxRef.current?.getBoundingClientRect();
    if (!g || !r) return;
    const list = [...pts.current.values()];
    const cx = list.reduce((n, p) => n + p.x, 0) / list.length, cy = list.reduce((n, p) => n + p.y, 0) / list.length;
    const dist = list.length > 1 ? Math.hypot(list[0].x - list[1].x, list[0].y - list[1].y) : null;
    const s = g.dist && dist ? Math.max(0.5, Math.min(2.5, g.t.s * (dist / g.dist))) : g.t.s;
    setTA({ x: g.t.x + ((cx - g.cx) / r.width) * 100, y: g.t.y + ((cy - g.cy) / r.height) * 100, s });
  };
  const nudge = (dx, dy, ds = 0) => setTA(t => { const n = { x: t.x + dx, y: t.y + dy, s: Math.max(0.5, Math.min(2.5, t.s + ds)) }; saveAlignFor(a.id, n); return n; });
  const img = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none", transformOrigin: "50% 50%" };
  const tag = { position: "absolute", top: 10, padding: "3px 8px", borderRadius: 6, background: "rgba(0,0,0,0.6)", color: C.text, fontSize: 12, fontWeight: 600, fontFamily: SANS, letterSpacing: 0.2 };
  const pill = on => ({ padding: "8px 12px", borderRadius: 10, border: "none", background: on ? STONE.primary : C.surface2, color: on ? C.ink : C.text, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS });
  const sq = { width: 36, height: 34, borderRadius: 9, border: "none", background: C.surface2, color: C.text, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: SANS };

  const handlers = align ? {
    onPointerDown: e => { try { e.currentTarget.setPointerCapture(e.pointerId); } catch {} pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY }); startGesture(); },
    onPointerMove: e => { if (!pts.current.has(e.pointerId)) return; pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY }); moveGesture(); },
    onPointerUp: e => { pts.current.delete(e.pointerId); if (pts.current.size) startGesture(); else { gesture.current = null; setTA(t => { saveAlignFor(a.id, t); return t; }); } },
    onPointerCancel: e => { pts.current.delete(e.pointerId); gesture.current = null; setTA(t => { saveAlignFor(a.id, t); return t; }); },
  } : {
    onPointerDown: e => { dragging.current = true; try { e.currentTarget.setPointerCapture(e.pointerId); } catch {} setFromX(e.clientX); },
    onPointerMove: e => { if (dragging.current) setFromX(e.clientX); },
    onPointerUp: () => { dragging.current = false; },
    onPointerCancel: () => { dragging.current = false; },
  };

  return (
    <div>
      <div ref={boxRef} {...handlers}
        style={{ position: "relative", aspectRatio: "3/4", borderRadius: 16, overflow: "hidden", background: C.surface2, touchAction: "none", userSelect: "none", WebkitUserSelect: "none", cursor: align ? "move" : "ew-resize" }}>
        {urlB && <img src={urlB} alt="B" draggable={false} style={{ ...img, transform: tf(tB) }} />}
        {urlA && <img src={urlA} alt="A" draggable={false} style={align
          ? { ...img, transform: tf(tA), opacity: 0.5 }
          : { ...img, transform: tf(tA), clipPath: `inset(0 ${100 - pos}% 0 0)`, WebkitClipPath: `inset(0 ${100 - pos}% 0 0)` }} />}
        {(!urlA || !urlB) && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: C.textDim, fontFamily: SANS }}>Loading…</div>
        )}
        {(align || grid) && (
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "linear-gradient(rgba(238,233,224,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(238,233,224,0.28) 1px, transparent 1px)",
            backgroundSize: "25% 12.5%" }} />
        )}
        {!align && (
          <>
            <div style={{ position: "absolute", top: 0, bottom: 0, left: `${pos}%`, width: 2, marginLeft: -1, background: C.text, boxShadow: "0 0 6px rgba(0,0,0,0.6)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: "50%", left: `${pos}%`, width: 34, height: 34, marginLeft: -17, marginTop: -17, borderRadius: 17, background: STONE.carrara, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.5)", pointerEvents: "none" }}>
              <ChevronLeft size={14} color={C.ink} strokeWidth={2.6} /><ChevronRight size={14} color={C.ink} strokeWidth={2.6} />
            </div>
          </>
        )}
        <div style={{ ...tag, left: 10 }}>A · {fmtDate(a.date)}</div>
        <div style={{ ...tag, right: 10 }}>B · {fmtDate(b.date)}</div>
        {align && <div style={{ ...tag, top: "auto", bottom: 10, left: 10, right: 10, textAlign: "center" }}>Drag to move A, pinch to resize. Line up shoulders and hips.</div>}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => setAlign(v => !v)} style={pill(align)}>{align ? "Done aligning" : "Align"}</button>
        {!align && <button onClick={() => setGrid(v => !v)} style={pill(grid)}>Grid</button>}
        {align && (
          <>
            <button onClick={() => nudge(0, -0.5)} style={sq}>↑</button>
            <button onClick={() => nudge(0, 0.5)} style={sq}>↓</button>
            <button onClick={() => nudge(-0.5, 0)} style={sq}>←</button>
            <button onClick={() => nudge(0.5, 0)} style={sq}>→</button>
            <button onClick={() => nudge(0, 0, -0.01)} style={sq}>−</button>
            <button onClick={() => nudge(0, 0, 0.01)} style={sq}>+</button>
            <button onClick={() => { setTA(NO_T); saveAlignFor(a.id, null); }} style={pill(false)}>Reset</button>
          </>
        )}
      </div>
    </div>
  );
}
