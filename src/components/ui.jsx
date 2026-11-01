import { useState } from "react";
import { Check, ChevronLeft } from "../icons.jsx";
import { C, SANS, shadow } from "../theme.js";
import { MUSCLES, SWAP_REASONS, addCustomExercise, libFind, nameKey, resolveExercise, searchLibrary, slotAlternatives } from "../program.js";
import { btnStyle } from "./styles.js";

export function Shell({ children }) {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: SANS, maxWidth: 430, margin: "0 auto", overflowX: "hidden" }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.5)} }
.wj-set-input::placeholder { color: #4a4a4a; opacity: 1; font-weight: 700; }
@keyframes wjFlash { 0% { background-color: rgba(76,195,138,0.45); } 100% { background-color: rgba(76,195,138,0); } }
@keyframes wjHighlight { 0% { box-shadow: inset 0 0 0 1.5px rgba(76,195,138,0.9); background-color: rgba(76,195,138,0.18); } 100% { box-shadow: inset 0 0 0 1.5px rgba(76,195,138,0); background-color: rgba(76,195,138,0); } }
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
  return <div style={{ padding: "16px 18px 6px", fontSize: 11, letterSpacing: 2, color: "#5c5c5c", textTransform: "uppercase", fontFamily: SANS, fontWeight: 700 }}>{children}</div>;
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
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 14px", borderRadius: 12, background: "#1c1c1c", marginBottom: 8, cursor: "pointer" }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#f2f2f2", fontFamily: SANS }}>{ex.name}</div>
        <div style={{ fontSize: 11, color: "#9a9a9a", fontFamily: SANS, marginTop: 2 }}>{ex.muscle || "Custom"} · {ex.type ?? "isolation"}</div>
      </div>
      {tag && <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.5, color: "#0a0a0a", background: color, padding: "2px 7px", borderRadius: 4, flexShrink: 0 }}>{tag}</span>}
    </div>
  );
  const baseName = (entry?.programDay && mv?.programRef) ? resolveExercise(entry.programDay, mv.programRef, entry.location)?.name : null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-end", zIndex: 120 }} onClick={onClose}>
      <div style={{ background: "#131313", width: "100%", maxHeight: "85vh", overflowY: "auto", borderRadius: "24px 24px 0 0", padding: "20px 18px 40px", boxSizing: "border-box" }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "#5c5c5c", margin: "0 auto 16px" }} />
        <div style={{ fontSize: 18, fontWeight: 800, color: "#f2f2f2", fontFamily: SANS, marginBottom: 12 }}>Swap exercise</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {SWAP_REASONS.map(r => (
            <button key={r} onClick={() => setReason(r)}
              style={{ ...btnStyle(reason === r ? color : "#2e2e2e", reason === r ? "#131313" : "#9a9a9a"), padding: "6px 12px", fontSize: 12, fontWeight: 700 }}>{r}</button>
          ))}
        </div>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search all exercises…"
          style={{ width: "100%", boxSizing: "border-box", background: "#1c1c1c", border: "1px solid #2e2e2e", borderRadius: 10, padding: "11px 12px", fontSize: 15, color: "#f2f2f2", outline: "none", fontFamily: SANS, marginBottom: 12 }} />
        {!typed && alts.length > 0 && <div style={{ fontSize: 10, letterSpacing: 2, color: "#5c5c5c", textTransform: "uppercase", fontFamily: SANS, marginBottom: 8 }}>Options for this slot</div>}
        {list.map(ex => row(ex, baseName && nameKey(ex.name) === nameKey(baseName) ? "PROGRAMMED" : null))}
        {typed && list.length === 0 && <div style={{ fontSize: 13, color: "#9a9a9a", fontFamily: SANS, marginBottom: 10 }}>No match in the library.</div>}
        {typed && !exact && (
          <div style={{ padding: "12px 14px", borderRadius: 12, background: "#1c1c1c", border: `1px dashed ${color}66` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f2f2f2", fontFamily: SANS, marginBottom: 8 }}>Create "{typed}" as new exercise</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              {MUSCLES.map(m => (
                <button key={m} onClick={() => setMuscle(muscle === m ? "" : m)}
                  style={{ ...btnStyle(muscle === m ? color : "#2e2e2e", muscle === m ? "#131313" : "#9a9a9a"), padding: "5px 10px", fontSize: 11, fontWeight: 700 }}>{m}</button>
              ))}
            </div>
            <button onClick={() => { const ex = addCustomExercise({ name: typed, muscle: muscle || mv?.muscle || "", type: "isolation" }); if (ex) onPick(ex, reason); }}
              style={{ ...btnStyle(color, "#131313"), padding: "9px 16px", fontSize: 13, fontWeight: 800 }}>Create and use</button>
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
  return <div onClick={onClick} style={{ margin: "0 18px 10px", padding: "16px 18px", borderRadius: 18, background: C.surface, boxShadow: shadow, cursor: "pointer", transition: "transform 0.12s, border-color 0.2s" }}>{children}</div>;
}
export function GhostBtn({ onClick, children }) {
  return <button onClick={onClick} style={{ display: "block", width: "calc(100% - 36px)", margin: "4px 18px", padding: "13px", borderRadius: 14, background: "transparent", border: `1.5px dashed ${C.line}`, color: C.textDim, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: SANS }}>{children}</button>;
}
export function WarmupItem({ label, checked, onToggle }) {
  return (
    <div onClick={onToggle} style={{ margin: "0 18px 8px", padding: "14px 16px", borderRadius: 14, background: checked ? "#e8e8e814" : C.surface, boxShadow: shadow, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: checked ? "#e8e8e8" : "#1c1c1c", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}>
        {checked && <Check size={15} strokeWidth={3} color="#131313" />}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: checked ? "#e8e8e8" : C.text, fontFamily: SANS, textDecoration: checked ? "line-through" : "none", opacity: checked ? 0.75 : 1 }}>
        {label}
      </div>
    </div>
  );
}
