import { Trophy } from "../icons.jsx";
import { C, LAKE, MONO, SANS } from "../theme.js";
import { fmtDate } from "../lib/utils.js";

export function CompletionSummary({ summary, onClose }) {
  if (!summary) return null;
  const { entry, prs } = summary;
  const totalSets = entry.movements.reduce((n, mv) => n + mv.sets.filter(s => s.r).length, 0);

  const typeLabel = { weight: "Weight PR", reps: "Rep PR", "1RM": "Est. 1RM PR" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "flex-end", zIndex: 200 }}>
      <div style={{ background: C.surface, width: "100%", borderRadius: "24px 24px 0 0", padding: "28px 18px 40px", boxSizing: "border-box", maxWidth: 430, margin: "0 auto", maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
            <Trophy size={40} color={prs.length > 0 ? LAKE.sky : C.textDim} strokeWidth={1.6} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text, fontFamily: SANS }}>Workout Complete</div>
          <div style={{ fontSize: 13, color: C.textDim, fontFamily: SANS, marginTop: 4 }}>
            {entry.customTitle || "Session"} · {entry.movements.length} movements · {totalSets} sets
          </div>
        </div>

        {prs.length > 0 ? (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, color: LAKE.sky, textAlign: "center", marginBottom: 14, fontFamily: SANS }}>
              {prs.length} PR{prs.length !== 1 ? "s" : ""} today
            </div>
            {prs.map((pr, i) => (
              <div key={i} style={{ marginBottom: 10, padding: "14px 16px", borderRadius: 14, background: C.surface2 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: SANS }}>{pr.name}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: LAKE.sky, background: LAKE.sky + "22", padding: "3px 8px", borderRadius: 6, fontFamily: SANS, letterSpacing: 0.3 }}>
                    {typeLabel[pr.type]}
                  </div>
                </div>
                <div style={{ fontSize: 13, fontFamily: MONO, color: C.textMid, marginBottom: 4 }}>
                  {pr.newWeight}×{pr.newReps} <span style={{ color: C.textDim }}>vs</span> {pr.prevWeight}×{pr.prevReps} <span style={{ color: C.textDim }}>on {fmtDate(pr.prevDate)}</span>
                </div>
                <div style={{ fontSize: 12, fontFamily: SANS, color: LAKE.sky, fontWeight: 600 }}>
                  {pr.type === "weight" && `+${pr.weightDelta}g heavier at ${pr.repDelta >= 0 ? "same or more" : "fewer"} reps`}
                  {pr.type === "reps" && `+${pr.repDelta} rep${pr.repDelta !== 1 ? "s" : ""} at the same weight`}
                  {pr.type === "1RM" && `est. 1RM up ${pr.prevE1RM} → ${pr.newE1RM} lbs (+${pr.e1rmDelta})`}
                </div>
              </div>
            ))}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "10px 20px 4px", color: C.textDim, fontSize: 13, fontFamily: SANS, lineHeight: 1.6 }}>
            No PRs this session — keep logging, they'll show up here the moment you beat a previous best.
          </div>
        )}

        <button onClick={onClose} style={{ width: "100%", marginTop: 20, padding: "15px", borderRadius: 14, background: LAKE.sky, border: "none", color: "#0a0a0a", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: SANS }}>
          Done
        </button>
      </div>
    </div>
  );
}
