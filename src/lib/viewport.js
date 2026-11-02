import { useEffect, useState } from "react";

// iOS keyboard awareness. When the on-screen keyboard opens, iOS Safari and
// home-screen apps shrink the *visual* viewport but leave position:fixed
// elements pinned to the layout viewport, so a bottom bar ends up floating
// in the middle of the screen over the content. These helpers let fixed
// chrome hide itself while typing, and let full-screen sheets size
// themselves to the area the keyboard leaves visible.

function isTextField(el) {
  if (!el) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag !== "INPUT") return false;
  const type = (el.type || "text").toLowerCase();
  return !["button", "checkbox", "radio", "range", "file", "submit", "reset", "color", "image"].includes(type);
}

function readViewport() {
  const vv = typeof window !== "undefined" ? window.visualViewport : null;
  const inner = typeof window !== "undefined" ? window.innerHeight : 800;
  const height = vv ? vv.height : inner;
  const offsetTop = vv ? vv.offsetTop : 0;
  const focused = typeof document !== "undefined" && isTextField(document.activeElement);
  // Keyboard counts as open when a text field has focus and the visible
  // area has lost a real chunk of height (or focus alone, when there is no
  // visualViewport API to measure with).
  const keyboardOpen = focused && (!vv || height < inner * 0.85);
  return { height, offsetTop, keyboardOpen, focused };
}

export function useViewport() {
  const [state, setState] = useState(readViewport);
  useEffect(() => {
    const vv = window.visualViewport;
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setState(readViewport()));
    };
    const onFocusOut = () => {
      // Give iOS a beat to start closing the keyboard, then re-measure and
      // nudge the layout so fixed bars snap back to the true bottom.
      setTimeout(() => {
        update();
        if (!isTextField(document.activeElement)) window.scrollTo(window.scrollX, window.scrollY);
      }, 60);
    };
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      cancelAnimationFrame(raf);
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);
  return state;
}

// True while the user is typing (keyboard up). Bottom bars hide on this.
export function useKeyboardOpen() {
  const { keyboardOpen, focused } = useViewport();
  return keyboardOpen || focused;
}

// Stops the page behind a full-screen sheet from scrolling while it is open.
export function useLockBodyScroll(active = true) {
  useEffect(() => {
    if (!active) return;
    const { body, documentElement } = document;
    const y = window.scrollY;
    const prev = { position: body.style.position, top: body.style.top, width: body.style.width, overflow: documentElement.style.overflow };
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.width = "100%";
    documentElement.style.overflow = "hidden";
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      documentElement.style.overflow = prev.overflow;
      window.scrollTo(0, y);
    };
  }, [active]);
}

// Height of the area the keyboard leaves visible, for full-screen sheets.
export function useVisibleHeight() {
  return useViewport().height;
}

// One-time global fix: when the keyboard closes, iOS can leave fixed bars
// stranded mid-screen until the page scrolls. Re-anchor them on focusout,
// and expose the visible height as a CSS variable (--vvh) for any styles.
export function installViewportFix() {
  if (typeof window === "undefined" || window.__wjViewportFix) return;
  window.__wjViewportFix = true;
  const root = document.documentElement;
  const setVar = () => root.style.setProperty("--vvh", `${window.visualViewport ? window.visualViewport.height : window.innerHeight}px`);
  setVar();
  window.visualViewport?.addEventListener("resize", setVar);
  window.addEventListener("resize", setVar);
  document.addEventListener("focusout", () => {
    setTimeout(() => {
      setVar();
      if (isTextField(document.activeElement)) return;
      // A 1px round trip makes Safari recompute where fixed bars belong.
      window.scrollBy(0, 1);
      requestAnimationFrame(() => window.scrollBy(0, -1));
    }, 80);
  });
}
