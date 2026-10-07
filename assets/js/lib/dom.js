/** Tiny DOM helpers shared by every component. */

export const $ = (selector, scope = document) => scope.querySelector(selector);

export const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return map[character];
  });
}

export function debounce(callback, wait = 150) {
  let timer;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => callback(...args), wait);
  };
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Trailing-edge throttle via requestAnimationFrame. */
export function onFrame(callback) {
  let queued = false;
  return (...args) => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(() => {
      queued = false;
      callback(...args);
    });
  };
}

/** Focusable elements inside a container, for dialog focus management. */
export function focusable(scope) {
  return $$(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    scope,
  ).filter((element) => element.offsetParent !== null);
}

export function lockScroll(locked) {
  document.body.classList.toggle("is-locked", locked);
}
