import { apiFetch, appHeaders, getPasscode } from "./storage.js";

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
  return (data.files || []).map(f => ({ ...f, thumb: `/api/photos?id=${encodeURIComponent(f.id)}&thumb=1&k=${k}` }));
}
