// Server-side proxy to Anthropic so the API key never reaches the browser.
// Env: ANTHROPIC_API_KEY, APP_PASSCODE
const { checkPasscode } = require("./_auth");

const ALLOWED_MODELS = new Set(["claude-sonnet-4-5"]);
const MAX_TOKENS = 3000;

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: { message: "POST only" } });
  if (!checkPasscode(req, res)) return;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: { message: "ANTHROPIC_API_KEY is not set on the server." } });

  const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
  if (!ALLOWED_MODELS.has(body.model)) return res.status(400).json({ error: { message: "Model not allowed" } });
  body.max_tokens = Math.min(Number(body.max_tokens) || 1000, MAX_TOKENS);

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(body),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (e) {
    res.status(502).json({ error: { message: "Could not reach Anthropic" } });
  }
};
