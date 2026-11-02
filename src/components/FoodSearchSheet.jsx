import { useEffect, useRef } from "react";
import { Search, X } from "../icons.jsx";
import { C, SANS } from "../theme.js";
import { useVisibleHeight } from "../lib/viewport.js";

// Full-screen search over food history. It is sized to the part of the screen the
// keyboard leaves visible, the field stays pinned at the top, and the results list
// scrolls back to the top on every keystroke, so matches always sit right under
// what you are typing. The page behind it is locked so it can't drift.
export function FoodSearchSheet({ query, setQuery, results, renderRow, onClose }) {
  const height = useVisibleHeight();
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const y = window.scrollY;
    const body = document.body.style;
    const prev = { position: body.position, top: body.top, width: body.width };
    body.position = "fixed"; body.top = `-${y}px`; body.width = "100%";
    inputRef.current?.focus({ preventScroll: true });
    return () => {
      body.position = prev.position; body.top = prev.top; body.width = prev.width;
      window.scrollTo(0, y);
    };
  }, []);

  useEffect(() => { listRef.current?.scrollTo({ top: 0 }); }, [query]);

  const q = query.trim();
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height, zIndex: 110, background: "rgba(8,8,8,0.97)", display: "flex", flexDirection: "column", fontFamily: SANS }}>
      <div style={{ maxWidth: 430, width: "100%", margin: "0 auto", padding: "calc(env(safe-area-inset-top) + 12px) 18px 10px", display: "flex", gap: 10, alignItems: "center", boxSizing: "border-box", flexShrink: 0 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "0 14px", borderRadius: 12, background: C.surface3, border: C.cardBorder }}>
          <Search size={16} color={C.textDim} strokeWidth={2} />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search food history…"
            enterKeyHint="search" autoCorrect="off" autoCapitalize="none" spellCheck={false}
            style={{ flex: 1, minWidth: 0, padding: "12px 0", background: "none", border: "none", color: C.text, fontSize: 16, fontFamily: SANS, outline: "none" }} />
          {query && (
            <button onClick={() => { setQuery(""); inputRef.current?.focus({ preventScroll: true }); }} aria-label="Clear"
              style={{ background: "none", border: "none", padding: 4, cursor: "pointer", display: "flex" }}>
              <X size={14} color={C.textDim} strokeWidth={2.5} />
            </button>
          )}
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: C.text, fontSize: 15, fontWeight: 600, cursor: "pointer", padding: "8px 2px", fontFamily: SANS }}>Done</button>
      </div>
      <div ref={listRef} style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", overscrollBehavior: "contain", maxWidth: 430, width: "100%", margin: "0 auto", padding: "4px 18px 24px", boxSizing: "border-box" }}>
        {!q ? (
          <div style={{ padding: "24px 0", textAlign: "center", color: C.textDim, fontSize: 12 }}>Type a food you've logged before</div>
        ) : results.length === 0 ? (
          <div style={{ padding: "24px 0", textAlign: "center", color: C.textDim, fontSize: 12 }}>No matches</div>
        ) : results.map(renderRow)}
      </div>
    </div>
  );
}
