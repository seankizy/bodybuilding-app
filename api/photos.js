// Reads progress photos from a Google Drive folder shared "Anyone with the link".
// The folder ID and the Drive API key live only here on the server, behind APP_PASSCODE,
// so the link never reaches a browser.
// Env: GOOGLE_DRIVE_API_KEY, DRIVE_PHOTOS_FOLDER_ID, APP_PASSCODE
//   GET /api/photos              -> { files: [{ id, name, createdTime }] }
//   GET /api/photos?id=FILE_ID   -> the image (add &thumb=1 for a small version)
const { checkPasscode } = require("./_auth");

module.exports = async (req, res) => {
  if (req.method !== "GET") return res.status(405).json({ error: { message: "GET only" } });
  if (!checkPasscode(req, res)) return;
  try {
    const key = process.env.GOOGLE_DRIVE_API_KEY;
    if (!key) throw new Error("GOOGLE_DRIVE_API_KEY is not set on the server.");
    const k = `key=${encodeURIComponent(key)}`;
    const id = req.query.id;

    if (!id) {
      const folder = process.env.DRIVE_PHOTOS_FOLDER_ID;
      if (!folder) throw new Error("DRIVE_PHOTOS_FOLDER_ID is not set on the server.");
      const q = encodeURIComponent(`'${folder}' in parents and mimeType contains 'image/' and trashed = false`);
      const fields = encodeURIComponent("files(id,name,createdTime)");
      const r = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=1000&${k}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error?.message || "Drive list failed");
      res.setHeader("Cache-Control", "private, no-store");
      return res.status(200).json({ files: data.files || [] });
    }

    if (!/^[A-Za-z0-9_-]+$/.test(id)) return res.status(400).json({ error: { message: "Bad id" } });
    let url = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&${k}`;
    if (req.query.thumb) {
      const meta = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?fields=thumbnailLink&${k}`).then(r => r.json());
      if (meta.thumbnailLink) url = meta.thumbnailLink.replace(/=s\d+$/, "=s400");
    }
    let img = await fetch(url);
    if (!img.ok && req.query.thumb) img = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media&${k}`);
    if (!img.ok) return res.status(img.status).json({ error: { message: `Drive fetch failed (${img.status})` } });
    res.setHeader("Content-Type", img.headers.get("content-type") || "image/jpeg");
    res.setHeader("Cache-Control", "private, max-age=86400");
    return res.status(200).send(Buffer.from(await img.arrayBuffer()));
  } catch (e) {
    return res.status(500).json({ error: { message: e.message || "Photos failed" } });
  }
};
