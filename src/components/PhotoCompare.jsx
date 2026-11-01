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
// Two photos stacked; drag anywhere on the image to move the divider. A shows on
// the left of the divider, B on the right.
export function SliderCompare({ a, b }) {
  const urlA = usePhotoBlob(a?.id), urlB = usePhotoBlob(b?.id);
  const [pos, setPos] = useState(50);
  const boxRef = useRef(null);
  const dragging = useRef(false);
  const setFromX = clientX => {
    const r = boxRef.current?.getBoundingClientRect();
    if (!r || r.width === 0) return;
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };
  const img = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" };
  const tag = { position: "absolute", top: 10, padding: "3px 8px", borderRadius: 6, background: "rgba(0,0,0,0.6)", color: C.text, fontSize: 12, fontWeight: 600, fontFamily: SANS, letterSpacing: 0.2 };
  return (
    <div ref={boxRef}
      onPointerDown={e => { dragging.current = true; try { e.currentTarget.setPointerCapture(e.pointerId); } catch {} setFromX(e.clientX); }}
      onPointerMove={e => { if (dragging.current) setFromX(e.clientX); }}
      onPointerUp={() => { dragging.current = false; }}
      onPointerCancel={() => { dragging.current = false; }}
      style={{ position: "relative", aspectRatio: "3/4", borderRadius: 16, overflow: "hidden", background: C.surface2, touchAction: "none", userSelect: "none", WebkitUserSelect: "none", cursor: "ew-resize" }}>
      {urlB && <img src={urlB} alt="B" draggable={false} style={img} />}
      {urlA && <img src={urlA} alt="A" draggable={false} style={{ ...img, clipPath: `inset(0 ${100 - pos}% 0 0)`, WebkitClipPath: `inset(0 ${100 - pos}% 0 0)` }} />}
      {(!urlA || !urlB) && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: C.textDim, fontFamily: SANS }}>Loading…</div>
      )}
      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${pos}%`, width: 2, marginLeft: -1, background: C.text, boxShadow: "0 0 6px rgba(0,0,0,0.6)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "50%", left: `${pos}%`, width: 34, height: 34, marginLeft: -17, marginTop: -17, borderRadius: 17, background: STONE.carrara, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.5)", pointerEvents: "none" }}>
        <ChevronLeft size={14} color={C.ink} strokeWidth={2.6} /><ChevronRight size={14} color={C.ink} strokeWidth={2.6} />
      </div>
      <div style={{ ...tag, left: 10 }}>A · {fmtDate(a.date)}</div>
      <div style={{ ...tag, right: 10 }}>B · {fmtDate(b.date)}</div>
    </div>
  );
}
