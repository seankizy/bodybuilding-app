import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { installViewportFix } from "./lib/viewport.js";

installViewportFix();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register service worker for PWA / background timer support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" })
      .then(reg => { reg.update(); setInterval(() => reg.update().catch(() => {}), 10 * 60 * 1000); })
      .catch(() => {});
  });
}

// Auto-update: the home screen app on iOS can keep an old build alive for hours
// when it stays in the foreground (rest timer running, screen on at the gym), so a
// check that only runs on open can miss a deploy.
//  - On open, on return to the foreground, and on iOS page restores: reload straight
//    away if the live bundle differs.
//  - While the app stays open: check every 2 minutes and show a small "Update ready"
//    bar instead of reloading mid-set. Tapping it reloads; the journal is saved in
//    localStorage, so nothing logged is lost.
const currentBundle = () =>
  [...document.querySelectorAll('script[type="module"][src]')].map(s => s.getAttribute("src")).join("|");
let checking = false;
async function liveBundle() {
  const res = await fetch("/index.html?v=" + Date.now(), { cache: "no-store" });
  const html = await res.text();
  return [...html.matchAll(/<script[^>]+type="module"[^>]+src="([^"]+)"/g)].map(m => m[1]).join("|");
}
function showUpdateBar() {
  if (document.getElementById("wj-update-bar")) return;
  const bar = document.createElement("button");
  bar.id = "wj-update-bar";
  bar.textContent = "Update ready · Tap to reload";
  bar.setAttribute("style", "position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 8px);z-index:9999;padding:10px 16px;border-radius:999px;border:1px solid rgba(255,255,255,0.25);background:rgba(20,20,22,0.92);color:#eee9e0;font:600 13px -apple-system,system-ui,sans-serif;letter-spacing:0.2px;box-shadow:0 6px 20px rgba(0,0,0,0.4)");
  bar.onclick = () => window.location.reload();
  document.body.appendChild(bar);
}
async function checkForNewBuild(mode = "reload") {
  if (checking || !navigator.onLine) return;
  checking = true;
  try {
    const live = await liveBundle();
    if (live && live !== currentBundle()) {
      if (mode === "reload") window.location.reload();
      else showUpdateBar();
    }
  } catch { /* offline: keep running the cached build */ }
  checking = false;
}
window.addEventListener("load", () => checkForNewBuild("reload"));
window.addEventListener("pageshow", e => { if (e.persisted) checkForNewBuild("reload"); });
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") checkForNewBuild("reload");
});
setInterval(() => {
  if (document.visibilityState === "visible") checkForNewBuild("prompt");
}, 2 * 60 * 1000);
