// Reads progress photos from a PRIVATE Google Drive folder with a service account.
// Env: GOOGLE_SERVICE_ACCOUNT_JSON (the whole key file), DRIVE_PHOTOS_FOLDER_ID, APP_PASSCODE
// Share the Drive folder with the service account's email (Viewer), then turn off link sharing.
//   GET /api/photos              -> { files: [{ id, name, createdTime }] }
//   GET /api/photos?id=FILE_ID   -> the image (add &thumb=1 for a small version)
const crypto = require("crypto");
const { checkPasscode } = require("./_auth");

let cachedToken = null;

async function getAccessToken() {
  if (cachedToken && cachedToken.exp > Date.now() + 60000) return cachedToken.token;
  const sa = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "{}");
  if (!sa.client_email || !sa.private_key) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not set on the server.");
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/drive.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now, exp: now + 3600,
  })}`;
  const sig = crypto.createSign("RSA-SHA256").update(unsigned).sign(sa.private_key, "base64url");
  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${sig}` }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error_description || "Google sign-in failed");
  cachedToken = { token: data.access_token, exp: Date.now() + data.expires_in * 1000 };
  return cachedToken.token;
}

module.exports = async (req, res) => {
  if (req.method !== "GET") return res.status(405).json({ error: { message: "GET only" } });
  if (!checkPasscode(req, res)) return;
  try {
    const token = await getAccessToken();
    const auth = { Authorization: `Bearer ${token}` };
    const id = req.query.id;

    if (!id) {
      const folder = process.env.DRIVE_PHOTOS_FOLDER_ID;
      if (!folder) throw new Error("DRIVE_PHOTOS_FOLDER_ID is not set on the server.");
      const q = encodeURIComponent(`'${folder}' in parents and mimeType contains 'image/' and trashed = false`);
      const fields = encodeURIComponent("files(id,name,createdTime)");
      const r = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=1000`, { headers: auth });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error?.message || "Drive list failed");
      res.setHeader("Cache-Control", "private, no-store");
      return res.status(200).json({ files: data.files || [] });
    }

    if (!/^[A-Za-z0-9_-]+$/.test(id)) return res.status(400).json({ error: { message: "Bad id" } });
    let url = `https://www.googleapis.com/drive/v3/files/${id}?alt=media`;
    if (req.query.thumb) {
      const meta = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?fields=thumbnailLink`, { headers: auth }).then(r => r.json());
      if (meta.thumbnailLink) url = meta.thumbnailLink.replace(/=s\d+$/, "=s400");
    }
    let img = await fetch(url, { headers: auth });
    if (!img.ok && req.query.thumb) img = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, { headers: auth });
    if (!img.ok) return res.status(img.status).json({ error: { message: `Drive fetch failed (${img.status})` } });
    res.setHeader("Content-Type", img.headers.get("content-type") || "image/jpeg");
    res.setHeader("Cache-Control", "private, max-age=86400");
    return res.status(200).send(Buffer.from(await img.arrayBuffer()));
  } catch (e) {
    return res.status(500).json({ error: { message: e.message || "Photos failed" } });
  }
};
