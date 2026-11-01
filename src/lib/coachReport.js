import { localDateStr, todayStr } from "./utils.js";
import { findRepeatPairs, getPersonalRecords, summarizeSets, topSetWeight } from "./training.js";

// ── COACH PDF (jsPDF, loaded from CDN at call time — no bundler dependency) ──
export async function loadJsPDF() {
  if (window.jspdf) return window.jspdf.jsPDF;
  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Could not load PDF library — check connection."));
    document.head.appendChild(script);
  });
  return window.jspdf.jsPDF;
}

export async function downloadCoachPDF(entries, weightLog, mesoInfo, windowDays = 35) {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ unit: "pt", format: "letter" });
  const PAGE_W = 612, PAGE_H = 792, MARGIN = 61;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  let y = MARGIN;

  const BLACK = "#111111", DARK = "#333333", MID = "#767676", LIGHTG = "#b8b8b8", FAINT = "#e8e8e8", PANEL = "#f5f5f5";

  function checkPageBreak(needed) {
    if (y + needed > PAGE_H - MARGIN) { doc.addPage(); y = MARGIN; }
  }
  function text(str, x, yy, opts = {}) {
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(opts.size || 10);
    doc.setTextColor(opts.color || DARK);
    doc.text(str, x, yy, { align: opts.align || "left" });
  }
  function hr(yy, color = FAINT, weight = 0.5) {
    doc.setDrawColor(color);
    doc.setLineWidth(weight);
    doc.line(MARGIN, yy, PAGE_W - MARGIN, yy);
  }

  // Header
  text("TRAINING SUMMARY", MARGIN, y, { size: 9, color: MID }); y += 24;
  text("Coach Report", MARGIN, y, { size: 28, bold: true, color: BLACK }); y += 20;
  const today = entries.length ? entries.map(e => e.date).sort().slice(-1)[0] : todayStr();
  const cutoff = new Date(today); cutoff.setDate(cutoff.getDate() - windowDays);
  const cutoffStr = localDateStr(cutoff);
  const fmtD = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
  text(`${fmtD(cutoffStr)} - ${fmtD(today)}, ${today.slice(0,4)}  ·  Generated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`, MARGIN, y, { size: 10.5, color: MID });
  y += 16; hr(y, BLACK, 1); y += 26;

  // Stats row
  const recent = [...entries].filter(e => e.date >= cutoffStr && e.completedAt).sort((a, b) => a.date.localeCompare(b.date));
  const recentWeights = [...weightLog].filter(w => w.date >= cutoffStr).sort((a, b) => a.date.localeCompare(b.date));
  const totalSets = recent.reduce((n, e) => n + e.movements.reduce((m, mv) => m + mv.sets.filter(s => s.r).length, 0), 0);
  let weightChange = null;
  if (recentWeights.length >= 2) {
    const sW = parseFloat(recentWeights[0].weight), eW = parseFloat(recentWeights[recentWeights.length-1].weight);
    if (!isNaN(sW) && !isNaN(eW)) weightChange = eW - sW;
  }
  const colW = CONTENT_W / 3;
  [[String(recent.length), "SESSIONS LOGGED"], [String(totalSets), "SETS COMPLETED"], [weightChange !== null ? `${weightChange>=0?"+":""}${weightChange.toFixed(1)}` : "-", "LBS CHANGE"]].forEach(([num, lbl], i) => {
    text(num, MARGIN + i * colW, y, { size: 22, bold: true, color: BLACK });
    text(lbl, MARGIN + i * colW, y + 14, { size: 8, color: MID });
  });
  y += 30; hr(y, FAINT); y += 24;

  // Body weight
  if (recentWeights.length) {
    checkPageBreak(50);
    text("BODY WEIGHT", MARGIN, y, { size: 12, bold: true, color: BLACK }); y += 16;
    doc.setFillColor(PANEL); doc.rect(MARGIN, y - 12, CONTENT_W, 30, "F");
    const fw = recentWeights[0], lw = recentWeights[recentWeights.length - 1];
    text(`${fw.weight} lbs`, MARGIN + 12, y + 6, { size: 10.5, bold: true });
    text(fmtD(fw.date), MARGIN + 80, y + 6, { size: 9, color: MID });
    text("->", MARGIN + 135, y + 6, { size: 9, color: LIGHTG });
    text(`${lw.weight} lbs`, MARGIN + 155, y + 6, { size: 10.5, bold: true });
    text(fmtD(lw.date), MARGIN + 225, y + 6, { size: 9, color: MID });
    if (weightChange !== null) text(`${weightChange>=0?"+":""}${weightChange.toFixed(1)} lbs`, PAGE_W - MARGIN - 12, y + 6, { size: 10.5, bold: true, align: "right" });
    y += 36;
  }

  // Week-over-week
  const repeatPairs = findRepeatPairs(entries);
  if (repeatPairs.length) {
    checkPageBreak(40);
    y += 10;
    text("WEEK-OVER-WEEK: WEIGHT & REPS", MARGIN, y, { size: 12, bold: true, color: BLACK }); y += 14;
    text("Comparing each program day's most recent two occurrences.", MARGIN, y, { size: 9, color: MID }); y += 18;

    repeatPairs.forEach(({ day, prev, curr }) => {
      checkPageBreak(60);
      text(`Day ${day} - ${curr.customTitle || "Session"}`, MARGIN, y, { size: 10.5, bold: true });
      text(`(${fmtD(prev.date)} -> ${fmtD(curr.date)})`, MARGIN + doc.getTextWidth(`Day ${day} - ${curr.customTitle || "Session"}`) + 8, y, { size: 9, color: MID });
      y += 14;
      const colX = [MARGIN, MARGIN + 140, MARGIN + 290, MARGIN + 420];
      ["MOVEMENT", `LAST (${fmtD(prev.date)})`, `THIS (${fmtD(curr.date)})`, "TOP SET"].forEach((h, i) => text(h, colX[i], y, { size: 7, color: MID, bold: true }));
      y += 6; hr(y, BLACK, 0.75); y += 12;
      const currByName = {}; curr.movements.forEach(mv => currByName[mv.name] = mv);
      const prevByName = {}; prev.movements.forEach(mv => prevByName[mv.name] = mv);
      Object.keys(currByName).forEach(name => {
        checkPageBreak(16);
        const cMv = currByName[name], pMv = prevByName[name];
        const cStr = summarizeSets(cMv), pStr = pMv ? summarizeSets(pMv) : "-";
        const cTop = topSetWeight(cMv), pTop = pMv ? topSetWeight(pMv) : null;
        let deltaStr = "-", deltaColor = LIGHTG;
        if (cTop !== null && pTop !== null) {
          const diff = cTop - pTop;
          if (Math.abs(diff) < 0.01) { deltaStr = "no change"; deltaColor = LIGHTG; }
          else if (diff > 0) { deltaStr = `+${diff}`; deltaColor = BLACK; }
          else { deltaStr = `${diff}`; deltaColor = MID; }
        }
        text(name.length > 22 ? name.slice(0, 21) + "…" : name, colX[0], y, { size: 8.5 });
        doc.setFont("courier", "normal"); doc.setFontSize(7.5); doc.setTextColor(MID);
        doc.text(pStr.length > 26 ? pStr.slice(0, 25) + "…" : pStr, colX[1], y);
        doc.setTextColor(DARK);
        doc.text(cStr.length > 26 ? cStr.slice(0, 25) + "…" : cStr, colX[2], y);
        text(deltaStr, colX[3], y, { size: 8.5, bold: true, color: deltaColor });
        y += 6; hr(y, FAINT, 0.3); y += 10;
      });
      y += 8;
    });
  }

  // All sessions
  if (recent.length) {
    checkPageBreak(40);
    y += 6;
    text("ALL SESSIONS THIS WINDOW", MARGIN, y, { size: 12, bold: true, color: BLACK }); y += 14;
    text(`${recent.length} completed sessions in the last ${windowDays} days`, MARGIN, y, { size: 9, color: MID }); y += 18;

    recent.forEach(e => {
      checkPageBreak(30);
      const dayLbl = e.programDay ? `Day ${e.programDay}` : "";
      text(`${fmtD(e.date)}  ${dayLbl}`, MARGIN, y, { size: 10.5, bold: true });
      text(e.customTitle || "Session", PAGE_W - MARGIN, y, { size: 9.5, color: MID, align: "right" });
      y += 14;
      e.movements.forEach(mv => {
        const sets = mv.sets.filter(s => s.w && s.r);
        if (!sets.length) return;
        checkPageBreak(14);
        const setStr = sets.map(s => `${s.w}x${s.r}${s.rir !== undefined && s.rir !== "" ? ` @${s.rir}` : ""}`).join("  ·  ");
        text(mv.name.length > 28 ? mv.name.slice(0,27)+"…" : mv.name, MARGIN, y, { size: 9 });
        doc.setFont("courier", "normal"); doc.setFontSize(8); doc.setTextColor(DARK);
        doc.text(setStr.length > 55 ? setStr.slice(0,54)+"…" : setStr, MARGIN + 165, y);
        y += 13; hr(y - 4, FAINT, 0.3);
      });
      y += 10;
    });
  }

  // Personal records
  const prs = getPersonalRecords(entries);
  const topPrs = Object.entries(prs).sort((a, b) => b[1].maxE1RM - a[1].maxE1RM).slice(0, 8);
  if (topPrs.length) {
    checkPageBreak(40);
    y += 6;
    text("PERSONAL RECORDS", MARGIN, y, { size: 12, bold: true, color: BLACK }); y += 14;
    text("Estimated one-rep max (Epley formula), all-time best per movement", MARGIN, y, { size: 9, color: MID }); y += 18;
    topPrs.forEach(([name, pr], i) => {
      checkPageBreak(20);
      text(String(i+1).padStart(2,"0"), MARGIN, y, { size: 9, bold: true, color: LIGHTG });
      text(name.length > 30 ? name.slice(0,29)+"…" : name, MARGIN + 24, y, { size: 10, bold: true });
      text(`${pr.maxWeight} lbs x ${pr.reps}  ·  ${fmtD(pr.date)}`, MARGIN + 24, y + 12, { size: 8.5, color: MID });
      text(`~${Math.round(pr.maxE1RM)} lbs`, PAGE_W - MARGIN, y + 4, { size: 12, bold: true, align: "right" });
      y += 24; hr(y - 6, FAINT, 0.3);
    });
  }

  // Footer
  checkPageBreak(30);
  y += 16; hr(y, FAINT); y += 12;
  text("Generated automatically from training log data.", MARGIN, y, { size: 8, color: LIGHTG });

  doc.save(`coach_report_${todayStr()}.pdf`);
}
