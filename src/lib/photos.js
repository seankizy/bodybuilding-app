import { apiFetch, appHeaders, getPasscode } from "./storage.js";
import { localDateStr } from "./utils.js";

// ── MACRO TRACKING ────────────────────────────────────────────────────────────
// Merged from MacroTracker app. Data model matches the old app so backups import cleanly:
//   wj_macros = { "YYYY-MM-DD": { entries: [{id, name, cal, p, c, f, time}], dayType } }
// ── PROGRESS PHOTOS (Google Drive, public read-only API) ─────────────────────
// Folder must be link-shared ("anyone with the link can view") for this to work
// without OAuth — confirmed already shared as of this build.

export async function driveListPhotos() {
  const resp = await apiFetch("/api/photos", { headers: appHeaders() });
  if (!resp.ok) {
    const body = await resp.json().catch(() => null);
    throw new Error(body?.error?.message || `Photos error (${resp.status})`);
  }
  const data = await resp.json();
  const k = encodeURIComponent(getPasscode());
  // <img> tags can't send headers, so thumbnails carry the passcode in the URL (same origin only).
  return (data.files || []).map(f => ({ ...f, ...photoDate(f), thumb: `/api/photos?id=${encodeURIComponent(f.id)}&thumb=1&k=${k}` }));
}

// The day a photo was taken, from its own info: EXIF capture time (read on the server),
// then a date in the file name, then when the file was created or changed on Drive.
// Returns { date: "YYYY-MM-DD" | null, dateSource, dateApprox }. Only the photo's own
// capture time counts as exact; a file name or Drive date is marked approximate.
export function photoDate(f) {
  const ok = (y, m, d) => {
    const Y = +y, M = +m, D = +d;
    if (Y < 2000 || Y > 2100 || M < 1 || M > 12 || D < 1 || D > 31) return null;
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  };
  const t = /^(\d{4})[-:](\d{2})[-:](\d{2})/.exec(f.takenAt || "");
  if (t) { const d = ok(t[1], t[2], t[3]); if (d) return { date: d, dateSource: f.takenSource || "exif", dateApprox: false }; }
  const n = /(20\d{2})[-_.]?(\d{2})[-_.]?(\d{2})/.exec(f.name || "");
  if (n) { const d = ok(n[1], n[2], n[3]); if (d) return { date: d, dateSource: "filename", dateApprox: true }; }
  for (const k of ["createdTime", "modifiedTime"]) {
    const dt = f[k] ? new Date(f[k]) : null;
    if (dt && !isNaN(dt)) return { date: localDateStr(dt), dateSource: `drive:${k}`, dateApprox: true };
  }
  return { date: null, dateSource: null, dateApprox: true };
}
