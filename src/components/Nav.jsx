import { BarChart3, Camera, ChevronRight, ClipboardList, Database, MoreHorizontal, Scale, TrendingUp, Utensils, X } from "../icons.jsx";
import { C, LAKE, SANS } from "../theme.js";
import { fmtDate, todayStr } from "../lib/utils.js";

export function MoreMenu({ open, onClose, onSelect }) {
  if (!open) return null;
  const items = [
    { id: "volume", label: "Volume", Icon: BarChart3, desc: "Sets per muscle vs MEV/MAV/MRV" },
    { id: "progress", label: "Progress", Icon: TrendingUp, desc: "Consistency, lifts, PRs, balance" },
    { id: "photos", label: "Progress Photos", Icon: Camera, desc: "Compare two dates side by side" },
    { id: "data", label: "Data & Backup", Icon: Database, desc: "Export, import, session history" },
  ];
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "flex-end", zIndex: 100 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.surface, width: "100%", borderRadius: "24px 24px 0 0", padding: "10px 18px 40px", boxSizing: "border-box", maxWidth: 430, margin: "0 auto" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.line, margin: "0 auto 18px" }} />
        {items.map(item => (
          <button key={item.id} onClick={() => onSelect(item.id)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 4px",
            background: "none", border: "none", cursor: "pointer", textAlign: "left",
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: C.surface2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <item.Icon size={19} color={C.text} strokeWidth={1.8} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: SANS }}>{item.label}</div>
              <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS, marginTop: 1 }}>{item.desc}</div>
            </div>
            <ChevronRight size={18} color={C.textDim} strokeWidth={2} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ResumeBar({ session, onResume, onDismiss }) {
  if (!session) return null;
  const mvTotal = session.movements.length;
  const mvDone = session.movements.filter(m => m.doneAt).length;
  const isToday = session.date === todayStr();
  const dateLabel = isToday ? "" : ` · ${fmtDate(session.date)}`;
  return (
    <div style={{
      position: "fixed", bottom: 72, left: "50%", transform: "translateX(-50%)",
      width: "calc(100% - 36px)", maxWidth: 394,
      background: "linear-gradient(135deg, #1c1c1c, #161616)",
      borderRadius: 16, padding: "11px 16px",
      display: "flex", alignItems: "center", gap: 12,
      zIndex: 49,
      boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${LAKE.sky}22`,
    }}>
      <div onClick={onResume} style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0, cursor: "pointer" }}>
        {/* Animated pulse dot */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: LAKE.sky }} />
          <div style={{ position: "absolute", inset: -3, borderRadius: "50%", border: `1.5px solid ${LAKE.sky}55`, animation: "pulse 2s infinite" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: LAKE.sky, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {session.customTitle || "Session in progress"}{dateLabel}
          </div>
          <div style={{ fontSize: 11, color: "#c4c4c4", fontFamily: SANS, marginTop: 1 }}>
            {mvDone}/{mvTotal} movements done · tap to resume
          </div>
        </div>
        <div style={{ fontSize: 18, color: LAKE.sky, flexShrink: 0 }}>›</div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); if (window.confirm("Dismiss this in-progress session? It stays in your history — this just stops the reminder.")) onDismiss(); }}
        style={{ width: 26, height: 26, borderRadius: 8, background: "#2a2a2a", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <X size={13} color="#c4c4c4" strokeWidth={2.5} />
      </button>
    </div>
  );
}

export function BottomNav({ tab, setTab, onOpenMenu }) {
  const tabs = [
    { id: "journal", label: "Journal", Icon: ClipboardList },
    { id: "macros", label: "Macros", Icon: Utensils },
    { id: "weight", label: "Weight", Icon: Scale },
  ];
  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "rgba(13,13,15,0.94)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", display: "flex", padding: "12px 0 28px", zIndex: 50 }}>
      {tabs.map(t => {
        const active = tab === t.id;
        return (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", padding: "6px 0", transition: "transform 0.15s", transform: active ? "translateY(-1px)" : "none" }}>
            <t.Icon size={26} strokeWidth={active ? 2.4 : 1.8} color={active ? C.accent : C.textDim} />
            <span style={{ fontSize: 11, letterSpacing: 0.3, fontFamily: SANS, color: active ? C.accent : C.textDim, fontWeight: active ? 700 : 500 }}>{t.label}</span>
          </button>
        );
      })}
      <button onClick={onOpenMenu} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", padding: "6px 0" }}>
        <MoreHorizontal size={26} strokeWidth={1.8} color={C.textDim} />
        <span style={{ fontSize: 11, letterSpacing: 0.3, fontFamily: SANS, color: C.textDim, fontWeight: 500 }}>More</span>
      </button>
    </div>
  );
}
