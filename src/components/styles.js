import { C, SANS, fill } from "../theme.js";

export const bigInput = { width: "100%", background: "transparent", border: "none", borderBottom: "1.5px solid rgba(255,255,255,0.08)", padding: "6px 0", fontSize: 16, fontWeight: 600, color: C.text, outline: "none", fontFamily: SANS, letterSpacing: 0, boxSizing: "border-box" };
export const ghostInput = { width: "100%", background: "transparent", border: "none", padding: "4px 0", outline: "none", fontFamily: SANS, boxSizing: "border-box", color: C.textMid };
export const noteArea = { width: "calc(100% - 36px)", margin: "0 18px", background: C.surface, border: C.cardBorder, borderRadius: 14, padding: "12px 14px", fontSize: 16, color: C.textMid, outline: "none", resize: "none", fontFamily: SANS, lineHeight: 1.6, boxSizing: "border-box" };
export const modalInput = { width: "100%", background: C.surface2, borderRadius: 10, padding: "11px 14px", fontSize: 16, color: C.text, outline: "none", fontFamily: SANS, boxSizing: "border-box" };
export const labelStyle = { fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontFamily: SANS, fontWeight: 600 };
export function btnStyle(bg, text) {
  return { padding: "7px 14px", borderRadius: 10, background: fill(bg), border: "none", color: text, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS };
}
