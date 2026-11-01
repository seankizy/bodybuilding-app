import { Check, RotateCcw, X } from "../icons.jsx";
import { C, MONO, SANS } from "../theme.js";
import { rirFeedback } from "../lib/training.js";

// SetRow with weight, reps, RIR selector, and movement-type-aware feedback
export function SetRow({ num, weight, reps, rir, repsTarget, type, isLastSet, done, color, ghost, onW, onR, onRIR, onDelete, onDone }) {
  const repRange = (() => {
    if (!repsTarget) return null;
    // Handle split format: "2×10-12, 2×15-20" — pick the range for this set number
    const splitMatch = repsTarget.match(/(\d+)×(\d+)[–\-](\d+)/g);
    if (splitMatch) {
      let setCounter = 0;
      for (const chunk of splitMatch) {
        const cm = chunk.match(/(\d+)×(\d+)[–\-](\d+)/);
        if (!cm) continue;
        const count = parseInt(cm[1]);
        setCounter += count;
        if (num <= setCounter) {
          return { min: parseInt(cm[2]), max: parseInt(cm[3]) };
        }
      }
    }
    // Standard single range: "10–12"
    const m = repsTarget.match(/(\d+)\s*[–\-]\s*(\d+)/);
    if (m) return { min: parseInt(m[1]), max: parseInt(m[2]) };
    const single = repsTarget.match(/^(\d+)/);
    if (single) return { min: parseInt(single[1]), max: parseInt(single[1]) };
    return null;
  })();
  const repVal = parseFloat(reps);
  const inRange = repRange && !isNaN(repVal) && repVal >= repRange.min && repVal <= repRange.max;
  const belowRange = repRange && !isNaN(repVal) && repVal < repRange.min;
  const aboveRange = repRange && !isNaN(repVal) && repVal > repRange.max;
  const rirFb = rirFeedback(rir, type, isLastSet);
  // Ghost values: the previous session's numbers for this set, shown as placeholder
  // text while a field is empty. "Repeat" copies them into the empty fields.
  const has = v => v !== "" && v !== null && v !== undefined;
  const gW = ghost && has(ghost.w) ? String(ghost.w) : null;
  const gR = ghost && has(ghost.r) ? String(ghost.r) : null;
  const gRIR = ghost && has(ghost.rir) ? String(ghost.rir) : null;
  const canRepeat = (gW && !has(weight)) || (gR && !has(reps)) || (gRIR && !has(rir));
  function repeatLast() {
    if (gW && !has(weight)) onW(gW);
    if (gRIR && !has(rir)) onRIR(gRIR);
    if (gR && !has(reps)) onR(gR);
  }

  return (
    <div style={{ margin: "0 18px 4px", padding: "12px 14px", borderRadius: 14, background: done ? color + "14" : "#1c1c1c", transition: "background 0.2s", opacity: done ? 0.75 : 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: "#1c1c1c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, color: "#9a9a9a", fontFamily: SANS, flexShrink: 0 }}>{num}</div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{ fontSize: 10, letterSpacing: 1.5, color: "#5c5c5c", textTransform: "uppercase", fontFamily: SANS }}>Weight</div>
          <input className="wj-set-input" type="number" inputMode="decimal" value={weight} onChange={e => onW(e.target.value)} placeholder={gW ?? "0"} style={setInput(color)} />
          <div style={{ fontSize: 10, color: "#5c5c5c", fontFamily: SANS }}>lbs</div>
        </div>
        <div style={{ color: "#2e2e2e", fontSize: 16, fontWeight: 300 }}>×</div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{ fontSize: 10, letterSpacing: 1.5, color: "#5c5c5c", textTransform: "uppercase", fontFamily: SANS }}>
            Reps{repRange ? ` ${repRange.min}–${repRange.max}` : ""}
          </div>
          <input className="wj-set-input" type="number" inputMode="numeric" value={reps} onChange={e => onR(e.target.value)}
            placeholder={gR ?? (repRange ? `${repRange.min}–${repRange.max}` : "0")}
            style={{ ...setInput(color), borderColor: inRange ? C.green : belowRange ? C.red : aboveRange ? C.amber : undefined }} />
          <div style={{ fontSize: 10, fontFamily: SANS, fontWeight: 700, color: inRange ? C.green : belowRange ? C.red : aboveRange ? C.amber : "#5c5c5c" }}>
            {inRange ? "✓ in range" : belowRange ? "↓ go lighter" : aboveRange ? "↑ go heavier" : "reps"}
          </div>
        </div>
        <button onClick={onDone} style={{ width: 52, height: 52, borderRadius: 12, flexShrink: 0, background: done ? C.green : C.surface2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.12s, background 0.15s", transform: done ? "scale(1.05)" : "scale(1)" }}><Check size={20} strokeWidth={3} color={done ? C.bg : C.textDim} /></button>
        {onDelete && (
          <button onClick={onDelete} style={{ width: 36, height: 36, borderRadius: 10, background: "#2a1a18", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><X size={16} strokeWidth={2.5} color={C.red} /></button>
        )}
      </div>
      {/* RIR row: full-width 44px buttons; the feedback / Repeat line sits below in a fixed-height slot so nothing shifts */}
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #262626" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 10, letterSpacing: 1.5, color: "#5c5c5c", textTransform: "uppercase", fontFamily: SANS, flexShrink: 0, width: 26 }}>RIR</div>
          <div style={{ display: "flex", gap: 6, flex: 1 }}>
            {["0", "1", "2", "3", "4"].map(v => {
              const sel = String(rir) === v;
              const isGhost = !has(rir) && gRIR === v;
              return (
                <button key={v} onClick={() => onRIR(sel ? "" : v)} title={isGhost ? "Last session" : undefined} style={{
                  flex: 1, minWidth: 0, height: 44, borderRadius: 10, cursor: "pointer",
                  background: sel ? color : "#262626",
                  color: sel ? "#131313" : isGhost ? "#c9c9c9" : "#9a9a9a",
                  border: isGhost ? "1.5px dashed #5c5c5c" : "1.5px solid transparent", boxSizing: "border-box",
                  fontSize: 17, fontWeight: 800, fontFamily: SANS,
                }}>{v}</button>
              );
            })}
          </div>
        </div>
        <div style={{ minHeight: 30, marginTop: 8, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
          {canRepeat ? (
            <button onClick={repeatLast} title="Fill the empty fields with last session's numbers"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 30, padding: "6px 12px", borderRadius: 8, background: "#2a2a2a", border: "none", color: "#c9c9c9", fontSize: 12, fontWeight: 700, fontFamily: SANS, cursor: "pointer" }}>
              <RotateCcw size={13} strokeWidth={2.4} /> Repeat last
            </button>
          ) : rirFb ? (
            <div style={{ fontSize: 11, fontFamily: SANS, fontWeight: 700, color: rirFb.color, lineHeight: 1.2 }}>
              {rirFb.msg}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function setInput(color) {
  // Big tap targets for logging mid-set: 52px tall, 24px numbers. The transparent
  // border lets the reps field show its in-range / out-of-range color.
  return { width: "100%", minHeight: 52, boxSizing: "border-box", background: "#262626", borderRadius: 12, padding: "10px 6px", fontSize: 24, fontWeight: 800, color: "#f2f2f2", textAlign: "center", outline: "none", border: "1.5px solid transparent", WebkitAppearance: "none", fontFamily: MONO };
}
