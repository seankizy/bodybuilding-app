// Google Drive write access for automatic journal backups.
// Uses an OAuth refresh token for Sean's own Google account (a service account
// cannot write into a personal Drive: it has no storage quota there).
// Env (Vercel only, never in the browser):
//   GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET  from Google Cloud > Credentials (Web client)
//   GOOGLE_OAUTH_REFRESH_TOKEN                          from the one-time Connect step (/api/backup?op=connect)
//   DRIVE_BACKUP_FOLDER_ID                              optional, defaults to the "Bodybuilding App" folder
const crypto = require("crypto");

const DEFAULT_FOLDER = "1hkW_EB4HBPeLF_s8n7UCukbPHChV6LJS";
const SCOPE = "https://www.googleapis.com/auth/drive";
const CALLBACK_PATH = "/api/drive-callback";

const folderId = () => process.env.DRIVE_BACKUP_FOLDER_ID || DEFAULT_FOLDER;
const clientReady = () => !!(process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET);
const isConfigured = () => clientReady() && !!process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

function redirectUri(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `https://${host}${CALLBACK_PATH}`;
}

// State for the OAuth round trip: signed with the passcode so only someone who
// knows it can start a connect, and expires after 15 minutes.
function signState() {
  const t = String(Date.now());
  const sig = crypto.createHmac("sha256", process.env.APP_PASSCODE || "").update(t).digest("hex");
  return `${t}.${sig}`;
}
function verifyState(state) {
  const [t, sig] = String(state || "").split(".");
  if (!t || !sig || Date.now() - Number(t) > 15 * 60 * 1000) return false;
  const expected = crypto.createHmac("sha256", process.env.APP_PASSCODE || "").update(t).digest("hex");
  return sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

let cached = { token: null, exp: 0 };
async function accessToken() {
  if (cached.token && Date.now() < cached.exp - 60000) return cached.token;
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  const data = await r.json();
  if (!r.ok) {
    const e = new Error(data.error === "invalid_grant" ? "Google sign-in expired. Reconnect Drive in Data." : (data.error_description || "Google token refresh failed"));
    e.code = data.error === "invalid_grant" ? "reconnect" : "google";
    throw e;
  }
  cached = { token: data.access_token, exp: Date.now() + (data.expires_in || 3600) * 1000 };
  return cached.token;
}

async function drive(path, opts = {}) {
  const token = await accessToken();
  const r = await fetch(`https://www.googleapis.com${path}`, { ...opts, headers: { Authorization: `Bearer ${token}`, ...(opts.headers || {}) } });
  if (r.status === 204) return {};
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error?.message || `Drive error ${r.status}`);
  return data;
}

module.exports = { SCOPE, folderId, clientReady, isConfigured, redirectUri, signState, verifyState, drive };
