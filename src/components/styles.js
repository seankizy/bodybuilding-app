import { SANS } from "../theme.js";

export const bigInput = { width: "100%", background: "transparent", border: "none", borderBottom: "1.5px solid #2e2e2e", padding: "6px 0", fontSize: 22, fontWeight: 800, color: "#f2f2f2", outline: "none", fontFamily: SANS, letterSpacing: -0.5, boxSizing: "border-box" };
export const ghostInput = { width: "100%", background: "transparent", border: "none", padding: "4px 0", outline: "none", fontFamily: SANS, boxSizing: "border-box", color: "#9a9a9a" };
export const noteArea = { width: "calc(100% - 36px)", margin: "0 18px", background: "#131313", borderRadius: 14, padding: "12px 14px", fontSize: 16, color: "#9a9a9a", outline: "none", resize: "none", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, boxSizing: "border-box" };
export const modalInput = { width: "100%", background: "#1c1c1c", borderRadius: 10, padding: "11px 14px", fontSize: 16, color: "#f2f2f2", outline: "none", fontFamily: SANS, boxSizing: "border-box" };
export const labelStyle = { fontSize: 11, letterSpacing: 2, color: "#5c5c5c", textTransform: "uppercase", fontFamily: SANS, fontWeight: 700 };
export function btnStyle(bg, text) {
  return { padding: "7px 14px", borderRadius: 10, background: bg, border: "none", color: text, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: SANS };
}
