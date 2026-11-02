// Automatic journal backups to Google Drive (Sean's "Bodybuilding App" folder).
// Everything is behind APP_PASSCODE, and every read or delete is limited to that folder.
//   GET  /api/backup                 -> { configured, files: [the history file] }
//   GET  /api/backup?id=FILE_ID      -> the backup JSON (for restore)
//   POST /api/backup  {journal JSON} -> merges into workout-journal-history.json (cumulative, never shrinks)
//   GET  /api/backup?op=connect (passcode header) -> { url } for the one-time Google sign-in
const { checkPasscode } = require("./_auth");
const g = require("./_google");

// One cumulative file. Each save merges what the phone sends into what Drive already
// holds, so history only ever grows: a session, weigh-in, or food entry that is missing
// on the phone (cleared storage, new phone) is never lost from Drive.
const FILE = "workout-journal-history.json";

async function findFile() {
  const q = encodeURIComponent(`'${g.folderId()}' in parents and name = '${FILE}' and trashed = false`);
  const fields = encodeURIComponent("files(id,name,modifiedTime,size)");
  const data = await g.drive(`/drive/v3/files?q=${q}&fields=${fields}&pageSize=5`);
  return (data.files || [])[0] || null;
}
const byId = (oldList, newList) => {
  const m = new Map();
  (Array.isArray(oldList) ? oldList : []).forEach(x => m.set(String(x.id), x));
  (Array.isArray(newList) ? newList : []).forEach(x => m.set(String(x.id), x)); // phone wins for the same item
  return [...m.values()].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
};
function mergeJournal(prev, next) {
  if (!prev) return next;
  const macros = { ...(prev.macros || {}) };
  Object.entries(next.macros || {}).forEach(([day, v]) => {
    const old = macros[day];
    macros[day] = old ? { ...old, ...v, entries: byId(old.entries, v.entries) } : v;
  });
  return { ...prev, ...next, entries: byId(prev.entries, next.entries), weights: byId(prev.weights, next.weights), macros };
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "private, no-store");
  if (!checkPasscode(req, res)) return;

  if (req.query.op === "connect") {
    if (!g.clientReady()) return res.status(503).json({ error: { code: "not_configured", message: "Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in Vercel first, then redeploy." } });
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
    return res.status(200).json({ url });
  }

  if (!g.isConfigured()) {
    return res.status(503).json({ configured: false, error: { code: "not_configured", message: "Drive backup is not set up on the server yet." } });
  }

  try {
    if (req.method === "GET" && !req.query.id) {
      const f = await findFile();
      return res.status(200).json({ configured: true, files: f ? [f] : [] });
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
      const existing = await findFile();
      const prev = existing ? await g.drive(`/drive/v3/files/${existing.id}?alt=media`).catch(() => null) : null;
      const merged = mergeJournal(prev, body);
      merged.savedAt = new Date().toISOString();
      const json = JSON.stringify(merged);

      const boundary = "wjbackup" + Date.now();
      const meta = existing ? { name: FILE } : { name: FILE, parents: [g.folderId()], mimeType: "application/json" };
      const multipart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n` +
        `--${boundary}\r\nContent-Type: application/json\r\n\r\n${json}\r\n--${boundary}--`;
      const path = existing
        ? `/upload/drive/v3/files/${existing.id}?uploadType=multipart&fields=id,name,modifiedTime,size`
        : `/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime,size`;
      const saved = await g.drive(path, { method: existing ? "PATCH" : "POST", headers: { "Content-Type": `multipart/related; boundary=${boundary}` }, body: multipart });
      return res.status(200).json({ ok: true, file: saved, sessions: merged.entries.length });
    }

    return res.status(405).json({ error: { message: "GET or POST only" } });
  } catch (e) {
    return res.status(e.code === "reconnect" ? 401 : 502).json({ error: { code: e.code || "drive", message: e.message || "Drive backup failed" } });
  }
};
