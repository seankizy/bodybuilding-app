

// ── INLINE ICONS (no external dependency) ─────────────────────────────────────
// Minimal SVG icons matching the lucide API (size, color, strokeWidth props).
export function Icon({ size = 20, color = "currentColor", strokeWidth = 2, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: "block", flexShrink: 0 }}>
      {children}
    </svg>
  );
}
export const ClipboardList = (p) => <Icon {...p}><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/></Icon>;
export const BarChart3 = (p) => <Icon {...p}><path d="M3 3v18h18"/><rect x="7" y="10" width="3" height="8"/><rect x="12" y="6" width="3" height="12"/><rect x="17" y="13" width="3" height="5"/></Icon>;
export const Scale = (p) => <Icon {...p}><path d="M12 3v18M7 7h10M5 21h14"/><path d="M7 7l-3 7h6zM17 7l-3 7h6z"/></Icon>;
export const Database = (p) => <Icon {...p}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></Icon>;
export const MoreHorizontal = (p) => <Icon {...p}><circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/></Icon>;
export const Dumbbell = (p) => <Icon {...p}><path d="M6.5 6.5l11 11M21 21l-1-1M3 3l1 1M18 22l4-4M2 6l4-4M7 17l-5 5M17 7l5-5"/></Icon>;
export const Timer = (p) => <Icon {...p}><path d="M10 2h4M12 14l3-3"/><circle cx="12" cy="14" r="8"/></Icon>;
export const Check = (p) => <Icon {...p}><path d="M20 6L9 17l-5-5"/></Icon>;
export const X = (p) => <Icon {...p}><path d="M18 6L6 18M6 6l12 12"/></Icon>;
export const Plus = (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>;
export const ChevronRight = (p) => <Icon {...p}><path d="M9 18l6-6-6-6"/></Icon>;
export const ChevronLeft = (p) => <Icon {...p}><path d="M15 18l-6-6 6-6"/></Icon>;
export const RotateCcw = (p) => <Icon {...p}><path d="M3 2v6h6"/><path d="M3 8a9 9 0 1 0 3-6.7L3 8"/></Icon>;
export const Pause = (p) => <Icon {...p}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></Icon>;
export const Play = (p) => <Icon {...p}><path d="M6 4l14 8-14 8z"/></Icon>;
export const TrendingUp = (p) => <Icon {...p}><path d="M22 7l-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/></Icon>;
export const Trophy = (p) => <Icon {...p}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z"/></Icon>;
export const Moon = (p) => <Icon {...p}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></Icon>;
export const Flame = (p) => <Icon {...p}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></Icon>;
export const ArrowDown = (p) => <Icon {...p}><path d="M12 5v14M19 12l-7 7-7-7"/></Icon>;
export const ArrowUp = (p) => <Icon {...p}><path d="M12 19V5M5 12l7-7 7 7"/></Icon>;
export const Download = (p) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></Icon>;
export const Upload = (p) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></Icon>;
export const Pencil = (p) => <Icon {...p}><path d="M17 3a2.83 2.83 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></Icon>;
export const Utensils = (p) => <Icon {...p}><path d="M3 2v7c0 1.1.9 2 2 2h1v11M6 2v9M9 2v9M17 2c-2.2 0-4 2.7-4 6s1.8 6 4 6v10"/></Icon>;
export const Search = (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></Icon>;
export const Camera = (p) => <Icon {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></Icon>;
export const Mic = (p) => <Icon {...p}><path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8"/></Icon>;
