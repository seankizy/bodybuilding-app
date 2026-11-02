// Reads progress photos from a Google Drive folder shared "Anyone with the link".
// The folder ID and the Drive API key live only here on the server, behind APP_PASSCODE,
// so the link never reaches a browser.
// Env: GOOGLE_DRIVE_API_KEY, DRIVE_PHOTOS_FOLDER_ID, APP_PASSCODE
//   GET /api/photos              -> { files: [{ id, name, createdTime, modifiedTime, takenAt, takenSource }] }
//     takenAt is the capture time as "YYYY-MM-DD HH:MM:SS" (camera local time) from the
//     photo's own EXIF (DateTimeOriginal, then CreateDate), else Drive's imageMediaMetadata.time.
//   GET /api/photos?id=FILE_ID   -> the image (add &thumb=1 for a small version)
const { checkPasscode } = require("./_auth");

// Minimal EXIF reader for JPEGs: returns { DateTimeOriginal, CreateDate, DateTime } as raw
// "YYYY:MM:DD HH:MM:SS" strings, from the first bytes of the file.
function readExifDates(buf) {
  const out = {};
  if (!buf || buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return out;
  let off = 2;
  while (off + 4 < buf.length) {
    if (buf[off] !== 0xff) break;
    const marker = buf[off + 1], len = buf.readUInt16BE(off + 2);
    if (marker === 0xe1 && buf.toString("ascii", off + 4, off + 10) === "Exif\0\0") {
      const t = off + 10; // TIFF header
      if (t + 8 > buf.length) break;
      const le = buf.toString("ascii", t, t + 2) === "II";
      const u16 = o => (le ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
      const u32 = o => (le ? buf.readUInt32LE(o) : buf.readUInt32BE(o));
      const str = (o, n) => buf.toString("ascii", o, o + n).replace(/\0+$/, "").trim();
      const walk = (ifd, cb) => {
        if (t + ifd + 2 > buf.length) return;
        const n = u16(t + ifd);
        for (let i = 0; i < n; i++) {
          const e = t + ifd + 2 + i * 12;
          if (e + 12 > buf.length) return;
          cb(u16(e), u16(e + 2), u32(e + 4), e + 8);
        }
      };
      let exifIfd = null;
      walk(u32(t + 4), (tag, type, count, vo) => {
        if (tag === 0x0132 && type === 2) out.DateTime = str(t + u32(vo), count);
        if (tag === 0x8769) exifIfd = u32(vo);
      });
      if (exifIfd != null) walk(exifIfd, (tag, type, count, vo) => {
        if (tag === 0x9003 && type === 2) out.DateTimeOriginal = str(t + u32(vo), count);
        if (tag === 0x9004 && type === 2) out.CreateDate = str(t + u32(vo), count);
      });
      break;
    }
    if (marker === 0xda) break; // image data starts, no EXIF before it
    off += 2 + len;
  }
  return out;
}
const VALID = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/;
function normExif(v) {
  const m = VALID.exec(String(v || "").trim());
  if (!m || m[1] === "0000" || m[2] === "00") return null;
  return `${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}:${m[6] || "00"}`;
}


const handler = async (req, res) => {
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
      const fields = encodeURIComponent("files(id,name,mimeType,createdTime,modifiedTime,imageMediaMetadata/time)");
      const r = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=1000&${k}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error?.message || "Drive list failed");
      // Read each JPEG's own EXIF (first 128 KB only), a few at a time.
      const files = data.files || [];
      const readOne = async f => {
        let exif = {};
        if (/jpe?g/i.test(f.mimeType || "") || /\.jpe?g$/i.test(f.name || "")) {
          try {
            const rr = await fetch(`https://www.googleapis.com/drive/v3/files/${f.id}?alt=media&${k}`, { headers: { Range: "bytes=0-131071" } });
            if (rr.ok || rr.status === 206) exif = readExifDates(Buffer.from(await rr.arrayBuffer()));
          } catch {}
        }
        const cands = [["exif:DateTimeOriginal", exif.DateTimeOriginal], ["exif:CreateDate", exif.CreateDate], ["drive:imageMediaMetadata.time", f.imageMediaMetadata?.time]];
        let takenAt = null, takenSource = null;
        for (const [src, v] of cands) { const n = normExif(v); if (n) { takenAt = n; takenSource = src; break; } }
        return { id: f.id, name: f.name, createdTime: f.createdTime, modifiedTime: f.modifiedTime, takenAt, takenSource };
      };
      const out = new Array(files.length);
      let next = 0;
      await Promise.all(Array.from({ length: Math.min(8, files.length) }, async () => {
        while (next < files.length) { const i = next++; out[i] = await readOne(files[i]); }
      }));
      res.setHeader("Cache-Control", "private, no-store");
      return res.status(200).json({ files: out });
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
module.exports = Object.assign(handler, { readExifDates, normExif });
