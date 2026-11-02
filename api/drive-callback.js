// Google sends Sean back here after the one-time Connect step.
// Shows the refresh token once so he can paste it into Vercel as GOOGLE_OAUTH_REFRESH_TOKEN.
// Only reachable with a state signed by APP_PASSCODE in the last 15 minutes.
const g = require("./_google");

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const page = (title, body) => `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>body{background:#0d0d0d;color:#EEE9E0;font:15px/1.5 -apple-system,Inter,sans-serif;padding:32px 22px;max-width:520px;margin:auto}
h1{font:400 26px Georgia,serif;margin:0 0 14px}code{display:block;word-break:break-all;background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:12px;font-size:13px;margin:12px 0}
button{background:#D7D4D8;color:#111;border:0;border-radius:10px;padding:11px 16px;font-weight:600;font-size:14px}ol{padding-left:20px}p,li{color:#c9c5bf}</style></head><body>${body}</body></html>`;

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  if (!g.verifyState(req.query.state)) return res.status(400).send(page("Expired", "<h1>Link expired</h1><p>Start again from Data in the app.</p>"));
  if (req.query.error || !req.query.code) return res.status(400).send(page("Not connected", `<h1>Not connected</h1><p>${esc(req.query.error || "No code returned")}</p>`));

  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: req.query.code,
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      redirect_uri: g.redirectUri(req),
      grant_type: "authorization_code",
    }),
  });
  const data = await r.json();
  if (!r.ok || !data.refresh_token) {
    return res.status(400).send(page("Not connected", `<h1>Not connected</h1><p>${esc(data.error_description || data.error || "Google did not return a refresh token. Try again.")}</p>`));
  }
  return res.status(200).send(page("Drive connected", `<h1>Drive connected</h1>
<p>Last step: copy this and add it in Vercel as <b>GOOGLE_OAUTH_REFRESH_TOKEN</b>, then redeploy. Keep it private.</p>
<code id="t">${esc(data.refresh_token)}</code>
<button onclick="navigator.clipboard.writeText(document.getElementById('t').textContent).then(()=>this.textContent='Copied')">Copy</button>`));
};
