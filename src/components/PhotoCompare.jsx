import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "../icons.jsx";
import { C, SANS, MONO, STONE } from "../theme.js";
import { fmtDate } from "../lib/utils.js";
import { apiFetch, appHeaders } from "../lib/storage.js";
import { daysBetween } from "../lib/checkins.js";

// ── PHOTO COMPARE HELPERS ────────────────────────────────────────────────────
// Body weight logged nearest to a photo date (either side), for the compare captions.
export function nearestWeight(weightLog, date) {
  if (!date) return null;
  let best = null;
  for (const w of weightLog ?? []) {
    if (isNaN(parseFloat(w.weight))) continue;
    const off = Math.abs(daysBetween(w.date, date));
    if (!best || off < best.daysOff) best = { weight: w.weight, unit: w.unit || "lbs", date: w.date, daysOff: off };
  }
  return best;
}
// The day the photo was taken, labeled as the photo date. Exact only when it came
// from the photo's own capture info; otherwise marked approximate with its source.
const SRC = { filename: "from file name", "drive:createdTime": "upload date", "drive:modifiedTime": "file changed date" };
export function photoTakenLabel(photo, { short = false } = {}) {
  if (!photo?.date) return "Date unknown";
  const d = new Date(photo.date + "T12:00:00");
  const txt = short ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : fmtDate(photo.date);
  if (!photo.dateApprox) return txt;
  return short ? `~${txt}` : `~${txt} (approx., ${SRC[photo.dateSource] || "no photo date"})`;
}
export function PhotoTakenLine({ photo, slot }) {
  return (
    <div style={{ textAlign: "center", marginTop: 8, fontSize: 12, fontWeight: 600, color: photo?.date && !photo.dateApprox ? C.text : C.textMid, fontFamily: SANS }}>
      {slot ? `${slot} · ` : ""}{photoTakenLabel(photo)}
    </div>
  );
}
export function PhotoWeightCaption({ weightLog, date }) {
  const nw = nearestWeight(weightLog, date);
  const rel = nw && date ? daysBetween(date, nw.date) : 0;
  return (
    <div style={{ textAlign: "center", marginTop: 3, fontSize: 12, color: C.textMid, fontFamily: SANS }}>
      {nw ? (
        <>
          <span style={{ fontFamily: MONO, fontVariantNumeric: "tabular-nums", fontWeight: 600, color: C.text }}>{nw.weight} {nw.unit}</span>
          <span style={{ color: C.textDim }}>{nw.daysOff === 0 ? " · weighed same day" : ` · weighed ${fmtDate(nw.date)}, ${Math.abs(rel)} day${Math.abs(rel) !== 1 ? "s" : ""} ${rel > 0 ? "after" : "before"} the photo`}</span>
        </>
      ) : <span style={{ color: C.textDim }}>{date ? "No weigh-in logged" : "Photo date unknown"}</span>}
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
        <div style={{ ...tag, left: 10 }}>A · {photoTakenLabel(a, { short: true })}</div>
        <div style={{ ...tag, right: 10 }}>B · {photoTakenLabel(b, { short: true })}</div>
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

// Pinch to zoom (up to 4x), drag to pan once zoomed, double tap to reset.
// Lives at module scope so a parent re-render never remounts it (which used to
// drop the zoom and refetch the photo). Touch listeners attach natively with
// { passive: false } once the image is on screen: the old version attached them
// on first render, while the "Loading" placeholder had no ref, so they never ran.
export function ZoomableImage({ fileId, alt, fit = "cover" }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [blobUrl, setBlobUrl] = useState(null);
  const [loadError, setLoadError] = useState("");
  const st = useRef({ scale: 1, translate: { x: 0, y: 0 } });
  st.current = { scale, translate };
  const g = useRef({ startDist: 0, startScale: 1, startMid: { x: 0, y: 0 }, startT: { x: 0, y: 0 }, panning: false, lastPan: { x: 0, y: 0 }, lastTap: 0 });

  useEffect(() => {
    let cancelled = false, local = null;
    setBlobUrl(null); setLoadError(""); setScale(1); setTranslate({ x: 0, y: 0 });
    if (!fileId) return;
    (async () => {
      try {
        const resp = await apiFetch(`/api/photos?id=${encodeURIComponent(fileId)}`, { headers: appHeaders() });
        if (!resp.ok) throw new Error(`Drive fetch failed (${resp.status})`);
        const blob = await resp.blob();
        if (cancelled) return;
        local = URL.createObjectURL(blob);
        setBlobUrl(local);
      } catch (err) { if (!cancelled) setLoadError(err.message || "Could not load photo"); }
    })();
    return () => { cancelled = true; if (local) URL.revokeObjectURL(local); };
  }, [fileId]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !blobUrl) return;
    const dist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const mid = t => ({ x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 });
    const clamp = (t, s) => {
      const maxX = (el.clientWidth * (s - 1)) / 2, maxY = (el.clientHeight * (s - 1)) / 2;
      return { x: Math.max(-maxX, Math.min(maxX, t.x)), y: Math.max(-maxY, Math.min(maxY, t.y)) };
    };
    const reset = () => { setScale(1); setTranslate({ x: 0, y: 0 }); };
    function onStart(e) {
      const r = g.current;
      if (e.touches.length === 2) {
        e.preventDefault();
        r.startDist = dist(e.touches); r.startScale = st.current.scale;
        r.startMid = mid(e.touches); r.startT = st.current.translate; r.panning = false;
      } else if (e.touches.length === 1) {
        const now = Date.now();
        if (now - r.lastTap < 280) { e.preventDefault(); reset(); r.lastTap = 0; return; }
        r.lastTap = now;
        if (st.current.scale > 1) {
          r.panning = true;
          r.lastPan = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          r.startT = st.current.translate;
        }
      }
    }
    function onMove(e) {
      const r = g.current;
      if (e.touches.length === 2 && r.startDist > 0) {
        e.preventDefault();
        const s = Math.max(1, Math.min(4, r.startScale * (dist(e.touches) / r.startDist)));
        const m = mid(e.touches);
        setScale(s);
        setTranslate(clamp({ x: r.startT.x + (m.x - r.startMid.x), y: r.startT.y + (m.y - r.startMid.y) }, s));
      } else if (e.touches.length === 1 && r.panning) {
        e.preventDefault();
        const dx = e.touches[0].clientX - r.lastPan.x, dy = e.touches[0].clientY - r.lastPan.y;
        setTranslate(clamp({ x: r.startT.x + dx, y: r.startT.y + dy }, st.current.scale));
      }
    }
    function onEnd(e) {
      const r = g.current;
      if (e.touches.length < 2) r.startDist = 0;
      if (e.touches.length === 1 && st.current.scale > 1) {
        r.panning = true;
        r.lastPan = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        r.startT = st.current.translate;
      }
      if (e.touches.length === 0) r.panning = false;
      if (st.current.scale <= 1.02) reset();
    }
    el.addEventListener("touchstart", onStart, { passive: false });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: false });
    el.addEventListener("touchcancel", onEnd, { passive: false });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [blobUrl]);

  const center = { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, textAlign: "center", boxSizing: "border-box" };
  if (loadError) return <div style={center}><div style={{ fontSize: 12, color: C.red, fontFamily: SANS }}>{loadError}</div></div>;
  if (!blobUrl) return <div style={center}><div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS }}>Loading…</div></div>;
  const resting = scale === 1 && translate.x === 0 && translate.y === 0;
  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", overflow: "hidden", touchAction: "none", userSelect: "none", WebkitUserSelect: "none" }}>
      <img src={blobUrl} alt={alt} draggable={false} style={{
        width: "100%", height: "100%", objectFit: fit, pointerEvents: "none",
        transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
        transformOrigin: "center center", transition: resting ? "transform 0.2s ease-out" : "none", willChange: "transform",
      }} />
    </div>
  );
}

// Full screen viewer for one photo: pinch, pan, double tap to reset.
export function PhotoFullscreen({ photo, onClose }) {
  if (!photo) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#000", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "absolute", top: "max(env(safe-area-inset-top), 12px)", left: 0, right: 0, zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: SANS, background: "rgba(0,0,0,0.6)", padding: "4px 10px", borderRadius: 8 }}>{photoTakenLabel(photo, { short: true })}</div>
        <button onClick={onClose} style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: STONE.carrara, color: C.ink, fontSize: 12, fontWeight: 600, fontFamily: SANS, cursor: "pointer" }}>Done</button>
      </div>
      <div style={{ flex: 1 }}>
        <ZoomableImage fileId={photo.id} alt={photo.name} fit="contain" />
      </div>
      <div style={{ position: "absolute", bottom: "max(env(safe-area-inset-bottom), 16px)", left: 0, right: 0, textAlign: "center", fontSize: 12, color: C.textDim, fontFamily: SANS, pointerEvents: "none" }}>Pinch to zoom, drag to move, double tap to reset</div>
    </div>
  );
}
