/**
 * Scroll-triggered entrance animation.
 * Elements opt in with `data-reveal` (and optionally `data-reveal-delay="120"`).
 */

import { $, $$, prefersReducedMotion } from "../lib/dom.js";

export function initReveal(scope = document) {
  const elements = $$("[data-reveal]", scope);
  if (elements.length === 0) return;

  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  elements.forEach((element) => {
    const delay = element.dataset.revealDelay;
    if (delay) element.style.setProperty("--reveal-delay", `${delay}ms`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
  );

  elements.forEach((element) => observer.observe(element));

  // Anything already framed should settle immediately rather than waiting on a scroll event.
  document.documentElement.classList.add("is-ready");
  void $("[data-reveal]", document);
}
