/**
 * Horizontal carousel built on native scroll-snap: draggable with a mouse,
 * swipeable on touch, keyboard accessible, with wrapping arrows.
 */

import { $, $$, onFrame } from "../lib/dom.js";
import { icon } from "./icons.js";

/** Markup for a carousel; `slides` is an array of HTML strings. */
export function carouselMarkup({ id, label, slides, bleed = false, slideWidth = "" }) {
  const style = slideWidth ? ` style="--slide-w:${slideWidth}"` : "";

  return `
    <div class="carousel ${bleed ? "carousel--bleed" : ""}" data-carousel data-carousel-id="${id}">
      <div class="carousel__controls">
        <button class="icon-btn" type="button" data-carousel-prev aria-label="Previous ${label}">
          ${icon("chevronLeft")}
        </button>
        <button class="icon-btn" type="button" data-carousel-next aria-label="Next ${label}">
          ${icon("chevronRight")}
        </button>
      </div>
      <div
        class="carousel__viewport"
        data-carousel-viewport
        role="group"
        aria-roledescription="carousel"
        aria-label="${label}"
        tabindex="0"
      >
        ${slides
          .map(
            (slide, index) =>
              `<div class="carousel__slide"${style} role="group" aria-roledescription="slide" aria-label="${index + 1} of ${slides.length}">${slide}</div>`,
          )
          .join("")}
      </div>
      <div class="carousel__progress" aria-hidden="true"><span data-carousel-progress></span></div>
    </div>
  `;
}

export function initCarousel(root) {
  const viewport = $("[data-carousel-viewport]", root);
  if (!viewport) return;

  const slides = $$(".carousel__slide", viewport);
  if (slides.length === 0) return;

  const prev = $("[data-carousel-prev]", root);
  const next = $("[data-carousel-next]", root);
  const progress = $("[data-carousel-progress]", root);

  let index = 0;

  const gap = () => parseFloat(window.getComputedStyle(viewport).columnGap) || 0;
  const step = () => slides[0].getBoundingClientRect().width + gap();
  const maxIndex = () =>
    Math.max(0, slides.length - Math.max(1, Math.round(viewport.clientWidth / step())));

  const goTo = (target) => {
    const clamped = Math.min(Math.max(target, 0), maxIndex());
    index = clamped;
    viewport.scrollTo({ left: clamped * step(), behavior: "smooth" });
  };

  const update = () => {
    index = Math.round(viewport.scrollLeft / step());
    const scrollable = viewport.scrollWidth - viewport.clientWidth;
    const ratio = scrollable <= 0 ? 1 : viewport.scrollLeft / scrollable;
    if (progress) progress.style.setProperty("--progress", `${Math.max(0, Math.min(1, ratio)) * 100}%`);
  };

  const onScroll = onFrame(update);
  viewport.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onFrame(update));

  prev?.addEventListener("click", () => goTo(index <= 0 ? maxIndex() : index - 1));
  next?.addEventListener("click", () => goTo(index >= maxIndex() ? 0 : index + 1));

  viewport.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(maxIndex());
    }
  });

  /* --- pointer drag ------------------------------------------------------ */

  let dragging = false;
  let moved = 0;
  let startX = 0;
  let startScroll = 0;
  let pointerId = null;

  viewport.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") return; // native touch scrolling is better
    if (event.button !== 0) return;
    dragging = true;
    moved = 0;
    startX = event.clientX;
    startScroll = viewport.scrollLeft;
    pointerId = event.pointerId;
    viewport.classList.add("is-dragging");
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!dragging || event.pointerId !== pointerId) return;
    const delta = event.clientX - startX;
    moved = Math.max(moved, Math.abs(delta));
    if (moved > 5 && !viewport.hasPointerCapture(pointerId)) {
      viewport.setPointerCapture(pointerId);
    }
    viewport.scrollLeft = startScroll - delta;
  });

  const endDrag = (event) => {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove("is-dragging");
    if (pointerId !== null && viewport.hasPointerCapture(pointerId)) {
      viewport.releasePointerCapture(pointerId);
    }
    pointerId = null;

    if (moved > 5) {
      // Snap to the nearest slide after a real drag.
      const nearest = Math.round(viewport.scrollLeft / step());
      goTo(nearest);
      const swallow = (clickEvent) => clickEvent.preventDefault();
      viewport.addEventListener("click", swallow, { capture: true, once: true });
      window.setTimeout(() => viewport.removeEventListener("click", swallow, { capture: true }), 0);
    }

    if (event) void event;
  };

  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);
  viewport.addEventListener("pointerleave", endDrag);

  update();
}
