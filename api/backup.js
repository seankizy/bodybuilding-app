// Automatic journal backups to Google Drive (Sean's "Bodybuilding App" folder).
// Everything is behind APP_PASSCODE, and every read or delete is limited to that folder.
//   GET  /api/backup                 -> { configured, files: [{ id, name, modifiedTime, size }] }  newest first
//   GET  /api/backup?id=FILE_ID      -> the backup JSON (for restore)
//   POST /api/backup  {journal JSON} -> saves today's file (one per day, overwritten through the day), prunes old copies
//   GET  /api/backup?op=connect&k=PASSCODE -> one-time Google sign-in to get the refresh token
const { checkPasscode } = require("./_auth");
const g = require("./_google");

const KEEP = 30;          // daily copies kept in Drive
const PREFIX = "workout-journal-";

const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date()); // YYYY-MM-DD

async function listBackups() {
  const q = encodeURIComponent(`'${g.folderId()}' in parents and name contains '${PREFIX}' and trashed = false`);
  const fields = encodeURIComponent("files(id,name,modifiedTime,size)");
  const data = await g.drive(`/drive/v3/files?q=${q}&fields=${fields}&orderBy=name desc&pageSize=200`);
  return (data.files || []).filter(f => f.name.startsWith(PREFIX) && f.name.endsWith(".json"));
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "private, no-store");
  if (!checkPasscode(req, res)) return;

  if (req.query.op === "connect") {
    if (!g.clientReady()) return res.status(503).send("Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in Vercel first, then redeploy.");
    const url = "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
      redirect_uri: g.redirectUri(req),
      response_type: "code",
      scope: g.SCOPE,
      access_type: "offline",
      prompt: "consent",
      login_hint: "seankizy@gmail.com",
      state: g.signState(),
    });
    res.statusCode = 302;
    res.setHeader("Location", url);
    return res.end();
  }

  if (!g.isConfigured()) {
    return res.status(503).json({ configured: false, error: { code: "not_configured", message: "Drive backup is not set up on the server yet." } });
  }

  try {
    if (req.method === "GET" && !req.query.id) {
      return res.status(200).json({ configured: true, files: await listBackups() });
    }

    if (req.method === "GET") {
      const id = String(req.query.id);
      if (!/^[A-Za-z0-9_-]+$/.test(id)) return res.status(400).json({ error: { message: "Bad id" } });
      const meta = await g.drive(`/drive/v3/files/${id}?fields=parents,name`);
      if (!(meta.parents || []).includes(g.folderId())) return res.status(404).json({ error: { message: "Not a journal backup" } });
      const data = await g.drive(`/drive/v3/files/${id}?alt=media`);
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
      if (!body || !Array.isArray(body.entries)) return res.status(400).json({ error: { message: "Backup must include entries" } });
      const name = `${PREFIX}${today()}.json`;
      const json = JSON.stringify(body);
      const existing = (await listBackups()).find(f => f.name === name);

      const boundary = "wjbackup" + Date.now();
      const meta = existing ? { name } : { name, parents: [g.folderId()], mimeType: "application/json" };
      const multipart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n` +
        `--${boundary}\r\nContent-Type: application/json\r\n\r\n${json}\r\n--${boundary}--`;
      const path = existing
        ? `/upload/drive/v3/files/${existing.id}?uploadType=multipart&fields=id,name,modifiedTime,size`
        : `/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime,size`;
      const saved = await g.drive(path, { method: existing ? "PATCH" : "POST", headers: { "Content-Type": `multipart/related; boundary=${boundary}` }, body: multipart });

      // Keep the newest KEEP daily copies; older ones go to Drive's trash (recoverable for 30 days).
      const all = await listBackups();
      for (const old of all.slice(KEEP)) {
        await g.drive(`/drive/v3/files/${old.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trashed: true }) }).catch(() => {});
      }
      return res.status(200).json({ ok: true, file: saved, kept: Math.min(all.length, KEEP) });
    }

    return res.status(405).json({ error: { message: "GET or POST only" } });
  } catch (e) {
    return res.status(e.code === "reconnect" ? 401 : 502).json({ error: { code: e.code || "drive", message: e.message || "Drive backup failed" } });
  }
};
