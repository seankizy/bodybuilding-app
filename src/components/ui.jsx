import { useState } from "react";
import { Check, ChevronLeft } from "../icons.jsx";
import { C, SANS, STONE, INK, fill, shadow } from "../theme.js";
import { MUSCLES, SWAP_REASONS, addCustomExercise, libFind, nameKey, resolveExercise, searchLibrary, slotAlternatives } from "../program.js";
import { btnStyle } from "./styles.js";

export function Shell({ children }) {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: SANS, maxWidth: 430, margin: "0 auto", overflowX: "hidden" }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.5)} }
.wj-set-input::placeholder { color: #8c877f; opacity: 1; font-weight: 700; }
@keyframes wjFlash { 0% { background-color: rgba(185,199,180,0.45); } 100% { background-color: rgba(185,199,180,0); } }
@keyframes wjHighlight { 0% { box-shadow: inset 0 0 0 1.5px rgba(185,199,180,0.9); background-color: rgba(185,199,180,0.18); } 100% { box-shadow: inset 0 0 0 1.5px rgba(185,199,180,0); background-color: rgba(185,199,180,0); } }
@keyframes wjPop { 0% { transform: scale(0.6); } 60% { transform: scale(1.15); } 100% { transform: scale(1); } }
@keyframes wjToast { 0% { opacity: 0; transform: translate(-50%, -16px) scale(0.96); } 12% { opacity: 1; transform: translate(-50%, 0) scale(1.02); } 20% { transform: translate(-50%, 0) scale(1); } 85% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; transform: translate(-50%, -8px); } }`}</style>
      {children}
    </div>
  );
}
export function TopBar({ left, right }) {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "52px 18px 8px" }}>{left}{right}</div>;
}
export function BackBtn({ onClick, label }) {
  return <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", color: C.accent, fontSize: 15, fontWeight: 600, padding: 0, fontFamily: SANS, display: "flex", alignItems: "center", gap: 4 }}><ChevronLeft size={18} strokeWidth={2.4} /> {label}</button>;
}
export function SectionLabel({ children }) {
  return <div style={{ padding: "16px 18px 6px", fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontFamily: SANS, fontWeight: 600 }}>{children}</div>;
}
export function SwapSheet({ entry, mv, color, onPick, onClose }) {
  const [q, setQ] = useState("");
  const [reason, setReason] = useState(SWAP_REASONS[0]);
  const [muscle, setMuscle] = useState("");
  const alts = slotAlternatives(entry, mv);
  const typed = q.trim();
  const found = typed ? searchLibrary(typed, 8) : [];
  const list = typed ? found : alts;
  const exact = typed && libFind(typed);
  const row = (ex, tag) => (
    <div key={ex.name} onClick={() => onPick(ex, reason)}
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 14px", borderRadius: 12, background: C.surface2, marginBottom: 8, cursor: "pointer" }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: SANS }}>{ex.name}</div>
        <div style={{ fontSize: 12, color: C.textMid, fontFamily: SANS, marginTop: 2 }}>{ex.muscle || "Custom"} · {ex.type ?? "isolation"}</div>
      </div>
      {tag && <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.2, color: INK.stone, background: fill(color), padding: "2px 7px", borderRadius: 4, flexShrink: 0 }}>{tag}</span>}
    </div>
  );
  const baseName = (entry?.programDay && mv?.programRef) ? resolveExercise(entry.programDay, mv.programRef, entry.location)?.name : null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-end", zIndex: 120 }} onClick={onClose}>
      <div style={{ background: C.sheet, width: "100%", maxHeight: "85vh", overflowY: "auto", borderRadius: "24px 24px 0 0", padding: "20px 18px 40px", boxSizing: "border-box" }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.handle, margin: "0 auto 16px" }} />
        <div style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: SANS, marginBottom: 12 }}>Swap exercise</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {SWAP_REASONS.map(r => (
            <button key={r} onClick={() => setReason(r)}
              style={{ ...btnStyle(reason === r ? color : C.surface3, reason === r ? C.ink : C.textMid), padding: "6px 12px", fontSize: 12, fontWeight: 600 }}>{r}</button>
          ))}
        </div>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search all exercises…"
          style={{ width: "100%", boxSizing: "border-box", background: C.surface2, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "11px 12px", fontSize: 15, color: C.text, outline: "none", fontFamily: SANS, marginBottom: 12 }} />
        {!typed && alts.length > 0 && <div style={{ fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontFamily: SANS, marginBottom: 8 }}>Options for this slot</div>}
        {list.map(ex => row(ex, baseName && nameKey(ex.name) === nameKey(baseName) ? "Programmed" : null))}
        {typed && list.length === 0 && <div style={{ fontSize: 12, color: C.textMid, fontFamily: SANS, marginBottom: 10 }}>No match in the library.</div>}
        {typed && !exact && (
          <div style={{ padding: "12px 14px", borderRadius: 12, background: C.surface2, border: `1px dashed ${color}66` }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: SANS, marginBottom: 8 }}>Create "{typed}" as new exercise</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              {MUSCLES.map(m => (
                <button key={m} onClick={() => setMuscle(muscle === m ? "" : m)}
                  style={{ ...btnStyle(muscle === m ? color : C.surface3, muscle === m ? C.ink : C.textMid), padding: "5px 10px", fontSize: 12, fontWeight: 600 }}>{m}</button>
              ))}
            </div>
            <button onClick={() => { const ex = addCustomExercise({ name: typed, muscle: muscle || mv?.muscle || "", type: "isolation" }); if (ex) onPick(ex, reason); }}
              style={{ ...btnStyle(color, C.ink), padding: "9px 16px", fontSize: 12, fontWeight: 600 }}>Create and use</button>
          </div>
        )}
      </div>
    </div>
  );
}
export function Pill({ color, children }) {
  return <span style={{ padding: "5px 13px", borderRadius: 20, background: color + "2a", fontSize: 12, fontWeight: 600, color, fontFamily: SANS, letterSpacing: 0.2 }}>{children}</span>;
}
export function MvCard({ children, color, onClick }) {
  return <div onClick={onClick} style={{ margin: "0 18px 10px", padding: "16px 18px", borderRadius: 16, background: C.surface, border: C.cardBorder, boxShadow: shadow, cursor: "pointer", transition: "transform 0.12s, border-color 0.2s" }}>{children}</div>;
}
export function GhostBtn({ onClick, children }) {
  return <button onClick={onClick} style={{ display: "block", width: "calc(100% - 36px)", margin: "4px 18px", padding: "13px", borderRadius: 14, background: "transparent", border: `1.5px dashed ${C.line}`, color: C.textDim, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>{children}</button>;
}
export function WarmupItem({ label, checked, onToggle }) {
  return (
    <div onClick={onToggle} style={{ margin: "0 18px 8px", padding: "14px 16px", borderRadius: 14, background: checked ? `linear-gradient(rgba(12,12,12,0.62), rgba(12,12,12,0.62)), ${STONE.cipollino}` : C.surface, boxShadow: shadow, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: checked ? STONE.primary : C.surface2, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}>
        {checked && <Check size={15} strokeWidth={3} color={INK.cipollino} />}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: SANS, textDecoration: checked ? "line-through" : "none", opacity: checked ? 0.75 : 1 }}>
        {label}
      </div>
    </div>
  );
}
