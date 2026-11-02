// Automatic backup of the journal to Google Drive through /api/backup.
// Runs on its own: when the app opens, every few minutes while it is open, and when it goes
// to the background. It only uploads when something changed since the last upload, and the
// server keeps one file per day (the last 30 days) in the "Bodybuilding App" Drive folder.
import { useEffect, useState } from "react";
import { apiFetch, backupFromStorage } from "./storage.js";

const LS = { last: "wj_last_backup", hash: "wj_backup_hash", status: "wj_drive_status" };
const INTERVAL_MS = 5 * 60 * 1000;
const listeners = new Set();
let running = null;

function hash(str) { // small, fast fingerprint so unchanged journals are not re-uploaded
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return String(h >>> 0) + ":" + str.length;
}
function storedPasscode() { try { return localStorage.getItem("wj_passcode") || ""; } catch { return ""; } }

export function driveStatus() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(LS.status) || "{}"); } catch {}
  let last = null;
  try { last = localStorage.getItem(LS.last); } catch {}
  return { state: s.state || "idle", message: s.message || "", where: s.where || null, last };
}
function setStatus(next) {
  try { localStorage.setItem(LS.status, JSON.stringify(next)); } catch {}
  listeners.forEach(fn => fn(driveStatus()));
}

// force: upload even if nothing changed (the "Back up now" button).
export async function backupToDrive({ force = false } = {}) {
  if (running) return running;
  running = (async () => {
    const code = storedPasscode();
    if (!code) { setStatus({ state: "needs_passcode", message: "Enter your passcode once (AI or photos) to turn on Drive backup." }); return false; }
    const payload = backupFromStorage();
    const { exportedAt, ...content } = payload;
    const fp = hash(JSON.stringify(content));
    let prev = null;
    try { prev = localStorage.getItem(LS.hash); } catch {}
    if (!force && prev === fp) return true;
    if (!force && (!content.entries || content.entries.length === 0)) return false; // nothing worth saving yet
    setStatus({ ...driveStatus(), state: "saving" });
    try {
      const resp = await apiFetch("/api/backup", { method: "POST", headers: { "Content-Type": "application/json", "x-app-passcode": code }, body: JSON.stringify(payload) });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        const notSetUp = data.error?.code === "not_configured";
        setStatus({ state: notSetUp ? "not_configured" : "error", message: data.error?.message || "Drive backup failed" });
        return false;
      }
      try { localStorage.setItem(LS.last, new Date().toISOString()); localStorage.setItem(LS.hash, fp); } catch {}
      setStatus({ state: "ok", message: "", where: data.file?.name || null });
      return true;
    } catch {
      setStatus({ ...driveStatus(), state: "offline", message: "Offline. Will retry automatically." });
      return false;
    }
  })();
  try { return await running; } finally { running = null; }
}

export async function listDriveBackups() {
  const resp = await apiFetch("/api/backup", { headers: { "x-app-passcode": storedPasscode() } });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.error?.message || "Could not list Drive backups");
  return data.files || [];
}
export async function fetchDriveBackup(id) {
  const resp = await apiFetch(`/api/backup?id=${encodeURIComponent(id)}`, { headers: { "x-app-passcode": storedPasscode() } });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.error?.message || "Could not read that backup");
  return data;
}
export function driveConnectUrl() {
  return `/api/backup?op=connect&k=${encodeURIComponent(storedPasscode())}`;
}

// Mount once at the app root.
export function useAutoDriveBackup() {
  useEffect(() => {
    const run = () => { backupToDrive(); };
    const first = setTimeout(run, 3000);
    const timer = setInterval(run, INTERVAL_MS);
    const onVis = () => run();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("online", run);
    return () => { clearTimeout(first); clearInterval(timer); document.removeEventListener("visibilitychange", onVis); window.removeEventListener("online", run); };
  }, []);
}
export function useDriveStatus() {
  const [s, setS] = useState(driveStatus());
  useEffect(() => { listeners.add(setS); return () => listeners.delete(setS); }, []);
  return s;
}
export function fmtLastBackup(iso) {
  if (!iso) return "never";
  const d = new Date(iso), now = new Date();
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const sameDay = d.toDateString() === now.toDateString();
  const yest = new Date(now); yest.setDate(now.getDate() - 1);
  if (sameDay) return `today at ${time}`;
  if (d.toDateString() === yest.toDateString()) return `yesterday at ${time}`;
  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} at ${time}`;
}
