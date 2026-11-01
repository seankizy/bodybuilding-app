import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register service worker for PWA / background timer support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" })
      .then(reg => reg.update())
      .catch(() => {});
  });
}

// Auto-update: the home screen app on iOS can keep an old build alive.
// Whenever the app opens or comes back to the foreground, compare the live
// index.html's script bundle with the one running now and reload if it changed.
const currentBundle = () =>
  [...document.querySelectorAll('script[type="module"][src]')].map(s => s.getAttribute("src")).join("|");
let checking = false;
async function checkForNewBuild() {
  if (checking || !navigator.onLine) return;
  checking = true;
  try {
    const res = await fetch("/index.html?v=" + Date.now(), { cache: "no-store" });
    const html = await res.text();
    const live = [...html.matchAll(/<script[^>]+type="module"[^>]+src="([^"]+)"/g)].map(m => m[1]).join("|");
    if (live && live !== currentBundle()) window.location.reload();
  } catch { /* offline: keep running the cached build */ }
  checking = false;
}
window.addEventListener("load", checkForNewBuild);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") checkForNewBuild();
});
