/* global __BUILD_SHA__, __BUILD_TIME__ */
// Which build this phone is running: commit, build time (ET), and the bundle file name.
export const BUILD_SHA = typeof __BUILD_SHA__ !== "undefined" ? __BUILD_SHA__ : "dev";
export const BUILD_TIME = typeof __BUILD_TIME__ !== "undefined" ? __BUILD_TIME__ : null;
export function bundleName() {
  try {
    const src = [...document.querySelectorAll('script[type="module"][src]')].map(s => s.getAttribute("src")).find(s => /index-/.test(s)) || "";
    return src.split("/").pop() || "dev";
  } catch { return "?"; }
}
export function buildLabel() {
  const t = BUILD_TIME ? new Date(BUILD_TIME).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "dev";
  return `Build ${BUILD_SHA} · ${t} ET · ${bundleName()}`;
}
