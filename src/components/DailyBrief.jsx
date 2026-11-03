import { C, SANS, STONE } from "../theme.js";

export function DailyBrief({ brief, onClose }) {
  const label = { fontSize: 12, letterSpacing: 0.2, color: C.textDim, fontFamily: SANS, fontWeight: 600, marginBottom: 8 };
  const tile = { flex: 1, padding: "12px 10px", borderRadius: 12, background: C.surface2, textAlign: "center" };
  const big = { fontSize: 15, fontWeight: 600, color: C.text, fontFamily: SANS, lineHeight: 1.1 };
  const small = { fontSize: 12, color: C.textMid, fontFamily: SANS, marginTop: 4, lineHeight: 1.3 };
  const warnTint = C.warn;
  const { week, session, recovery, upcoming } = brief;
  const wt = week.weight;
  const dateLabel = new Date(brief.today + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const quoteText = typeof brief.quote === "string" ? brief.quote : brief.quote.q;
  const quoteBy = typeof brief.quote === "string" ? null : brief.quote.by;
  const shortDate = d => new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const liftRow = (l, i, first) => (
    <div key={i} style={{ padding: "11px 0", borderTop: first ? "none" : "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: SANS, minWidth: 0 }}>{l.name}</div>
        {l.sets ? <div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: SANS, flexShrink: 0 }}>{l.sets} x {l.reps}</div> : null}
      </div>
      <div style={{ fontSize: 12, color: C.textMid, fontFamily: SANS, marginTop: 3 }}>
        {l.last ? `Last: ${l.last}${l.lastDate ? " (" + shortDate(l.lastDate) + ")" : ""}` : "No history yet"}
        {l.rest ? ` · Rest ${l.rest}` : ""}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: warnTint, fontFamily: SANS, marginTop: 3 }}>{l.target}</div>
      {l.cue && <div style={{ fontSize: 12, color: C.textMid, fontFamily: SANS, marginTop: 3 }}>{l.cue}</div>}
      {l.pr && <div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: SANS, marginTop: 3 }}>{l.pr}</div>}
      {l.plateau && <div style={{ fontSize: 12, color: C.warn, fontFamily: SANS, marginTop: 3, lineHeight: 1.4 }}>{l.plateau}</div>}
    </div>
  );
  const bullet = (lead, text) => (
    <div style={{ padding: "8px 0", fontSize: 12, color: C.textMid, fontFamily: SANS, lineHeight: 1.45 }}>
      <span style={{ fontWeight: 600, color: C.text }}>{lead}. </span>{text}
    </div>
  );
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "flex-end", zIndex: 300 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.sheet, width: "100%", maxHeight: "92vh", overflowY: "auto", borderRadius: "24px 24px 0 0", padding: "22px 18px 34px", boxSizing: "border-box" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.handle, margin: "0 auto 18px" }} />
        <div style={{ fontSize: 12, color: C.textMid, fontFamily: SANS, marginBottom: 10 }}>{dateLabel}</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: SANS, lineHeight: 1.3, marginBottom: 14 }}>{brief.headline}</div>
        <div style={{ padding: "12px 14px", borderRadius: 12, background: C.surface2, borderLeft: `3px solid ${warnTint}`, marginBottom: 22 }}>
          <div style={{ fontSize: 15, fontStyle: "italic", color: C.text, fontFamily: SANS, lineHeight: 1.45 }}>{quoteBy ? `"${quoteText}"` : quoteText}</div>
          {quoteBy && <div style={{ fontSize: 12, color: C.textMid, fontFamily: SANS, marginTop: 6, letterSpacing: 0.2 }}>{quoteBy}</div>}
        </div>

        {session && (
          <>
            <div style={label}>Today's workout</div>
            <div style={{ padding: "14px 14px 4px", borderRadius: 14, background: C.surface2, marginBottom: 22 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: SANS }}>Day {session.day} · {session.title}</div>
              <div style={{ fontSize: 12, color: C.textMid, fontFamily: SANS, marginTop: 4 }}>
                {session.totalSets} working sets · {session.muscles.join(", ")}
              </div>
              {session.isDeload && <div style={{ fontSize: 12, fontWeight: 600, color: warnTint, fontFamily: SANS, marginTop: 8 }}>Deload. Every lift below has its exact weight. RIR 3 to 4, nothing to failure.</div>}
              {session.overdue > 0 && <div style={{ fontSize: 12, fontWeight: 600, color: warnTint, fontFamily: SANS, marginTop: 8 }}>This session was due {session.overdue} day{session.overdue !== 1 ? "s" : ""} ago. Pick it up today.</div>}
              <div style={{ marginTop: 6 }}>
                {session.exercises.map((l, i) => liftRow(l, i, i === 0))}
              </div>
            </div>
          </>
        )}

        {recovery && (
          <>
            <div style={label}>{recovery.done ? "Session done, now recover" : "Active rest day"}</div>
            <div style={{ padding: "8px 14px", borderRadius: 14, background: C.surface2, marginBottom: 22 }}>
              {recovery.done
                ? bullet("Cool down", "Easy 10 minute walk and stretch what you trained.")
                : bullet("Move", "20 to 40 minutes of easy walking, bike or incline walk. Stay conversational.")}
              {!recovery.done && bullet("Mobility", "10 minutes: hip flexor stretch, glute bridges, dead bugs, upper back openers.")}
              {recovery.cal ? bullet("Fuel", `Hit ${recovery.done ? "your training day" : "your rest day"} target: ${recovery.cal.toLocaleString()} kcal and ${recovery.protein}g protein. Muscle is built on these days.`) : null}
              {bullet("Sleep", "Aim for 7.5 hours tonight.")}
            </div>
            {upcoming && (
              <>
                <div style={label}>{upcoming.when}</div>
                <div style={{ padding: "14px 14px 4px", borderRadius: 14, background: C.surface2, marginBottom: 22 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: SANS }}>
                    Day {upcoming.day} · {upcoming.title}{upcoming.isDeload ? " · Deload cycle" : ""}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    {upcoming.lifts.map((l, i) => liftRow({ ...l, sets: null, rest: null }, i, i === 0))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {brief.nutrition && (
          <>
            <div style={label}>Deload nutrition</div>
            <div style={{ padding: "8px 14px", borderRadius: 14, background: C.surface2, marginBottom: 22 }}>
              {brief.nutrition.map((t, i) => (
                <div key={i} style={{ padding: "6px 0", fontSize: 12, color: i === 0 ? C.text : C.textMid, fontFamily: SANS, lineHeight: 1.45, fontWeight: i === 0 ? 600 : 400 }}>{t}</div>
              ))}
            </div>
          </>
        )}

        <div style={label}>Last 7 days</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
          <div style={tile}>
            <div style={big}>{week.sessions}<span style={{ fontSize: 15, color: C.textDim }}>/{week.sessionTarget}</span></div>
            <div style={small}>sessions</div>
          </div>
          <div style={tile}>
            <div style={big}>{week.fedDays}<span style={{ fontSize: 15, color: C.textDim }}>/7</span></div>
            <div style={small}>days at 90%+ of calories</div>
          </div>
          <div style={tile}>
            <div style={big}>{wt.now != null ? wt.now.toFixed(1) : "–"}</div>
            <div style={small}>{wt.now != null ? "avg lb" : "need 2+ weigh-ins"}</div>
          </div>
        </div>
        {wt.delta != null && (
          <div style={{ fontSize: 12, color: C.textMid, fontFamily: SANS, marginBottom: 4 }}>
            Weight {wt.delta >= 0 ? "+" : ""}{wt.delta.toFixed(1)} lb vs the prior week. <span style={{ color: wt.status === "On pace" ? C.text : warnTint, fontWeight: 600 }}>{wt.status}</span> (goal +0.5 to +1 per week).
          </div>
        )}

        <button onClick={onClose} style={{ width: "100%", marginTop: 20, padding: "15px", borderRadius: 14, background: STONE.primary, border: "none", color: C.ink, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
          {brief.kind === "train" ? "Let's go" : "Got it"}
        </button>
      </div>
    </div>
  );
}
