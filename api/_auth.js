// Shared passcode check for every /api route.
// Set APP_PASSCODE in Vercel > Settings > Environment Variables.
const crypto = require("crypto");

function checkPasscode(req, res) {
  const expected = process.env.APP_PASSCODE || "";
  const given = String(req.headers["x-app-passcode"] || req.query?.k || "");
  const ok = expected.length > 0 && given.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected));
  if (!ok) {
    res.status(401).json({ error: { message: expected ? "Wrong passcode. Try again and the app will ask for it." : "APP_PASSCODE is not set on the server." } });
    return false;
  }
  return true;
}

module.exports = { checkPasscode };
