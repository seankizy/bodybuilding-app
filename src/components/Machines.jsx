import { useState } from "react";
import { C, SAFE_TOP, SANS, TITLE } from "../theme.js";
import { MACHINES } from "../lib/machines.js";
import { LOCATIONS } from "../program.js";

// Machines reference: photo, name and starting weight for each machine, by gym.
export function MachinesScreen() {
  const [zoom, setZoom] = useState(null);
  const gyms = [...new Set(MACHINES.map(m => m.gym))];
  return (
    <>
      <div style={{ padding: "52px 18px 16px", paddingTop: SAFE_TOP, background: "transparent" }}>
        <div style={{ fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontFamily: SANS, marginBottom: 4 }}>Gym Reference</div>
        <div style={{ ...TITLE, color: C.text }}>Machines</div>
        <div style={{ fontSize: 12, color: C.textDim, marginTop: 6, fontFamily: SANS }}>Starting weight is the load before any plates.</div>
      </div>
      {gyms.map(g => (
        <div key={g} style={{ padding: "0 18px 120px" }}>
          <div style={{ fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontFamily: SANS, fontWeight: 600, margin: "6px 0 10px" }}>{LOCATIONS[g]?.label ?? LOCATIONS[g]?.short ?? g}</div>
          {MACHINES.filter(m => m.gym === g).map(m => (
            <div key={m.id} style={{ marginBottom: 14, borderRadius: 16, overflow: "hidden", background: C.surface, border: C.cardBorder }}>
              <img src={m.photo} alt={m.name} loading="lazy" onClick={() => setZoom(m)}
                style={{ width: "100%", height: 220, objectFit: "cover", display: "block", cursor: "zoom-in" }} />
              <div style={{ padding: "12px 14px 14px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: C.text, fontFamily: SANS }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS, marginTop: 2 }}>{m.brand} {m.model}</div>
                  {m.note && <div style={{ fontSize: 12, color: C.textMid, fontFamily: SANS, marginTop: 6, lineHeight: 1.45 }}>{m.note}</div>}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: C.text, fontFamily: SANS, fontVariantNumeric: "tabular-nums" }}>{m.startLb}<span style={{ fontSize: 13, fontWeight: 600, color: C.textDim }}> lb</span></div>
                  <div style={{ fontSize: 11, color: C.textDim, fontFamily: SANS }}>empty{m.maxLb ? ` · max ${m.maxLb}` : ""}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
      {zoom && (
        <div onClick={() => setZoom(null)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.94)", display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
          <img src={zoom.photo} alt={zoom.name} style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 12 }} />
        </div>
      )}
    </>
  );
}
