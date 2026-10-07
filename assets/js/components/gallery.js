/**
 * Property image gallery with a full-screen viewer.
 * The mosaic is keyboard operable; the viewer supports arrows, Escape,
 * thumbnail navigation and focus trapping.
 */

import { $, $$, lockScroll, focusable } from "../lib/dom.js";
import { icon } from "./icons.js";
import { escapeHtml } from "../lib/dom.js";

const MAX_TILES = 5;

/**
 * @param {HTMLElement} target
 * @param {{images: {large:string, small:string, alt:string}[], title: string}} options
 */
export function mountGallery(target, { images, title }) {
  if (!images || images.length === 0) return;

  const tiles = images.slice(0, MAX_TILES);

  target.classList.add("gallery");
  target.innerHTML = `
    <div class="gallery__grid">
      ${tiles
        .map(
          (image, index) => `
            <button class="gallery__cell" type="button" data-gallery-open="${index}" aria-label="Open photo ${index + 1} of ${images.length}: ${escapeHtml(image.alt)}">
              <img src="${image.small}" alt="${escapeHtml(image.alt)}" width="1400" height="1050" loading="${index === 0 ? "eager" : "lazy"}" decoding="async">
            </button>`,
        )
        .join("")}
    </div>
    <button class="btn btn--light gallery__more" type="button" data-gallery-open="0">
      ${icon("expand")}<span>All ${images.length} photos</span>
    </button>
  `;

  const lightbox = ensureLightbox();
  const stageImage = $("[data-lb-image]", lightbox);
  const counter = $("[data-lb-count]", lightbox);
  const thumbs = $("[data-lb-thumbs]", lightbox);

  $("[data-lb-title]", lightbox).textContent = title;
  thumbs.innerHTML = images
    .map(
      (image, index) => `
        <button class="lightbox__thumb" type="button" data-lb-thumb="${index}" aria-label="Photo ${index + 1}" aria-current="${index === 0}">
          <img src="${image.small}" alt="" width="420" height="315" loading="lazy" decoding="async">
        </button>`,
    )
    .join("");

  let current = 0;
  let lastFocus = null;

  const render = (nextIndex) => {
    current = (nextIndex + images.length) % images.length;
    const image = images[current];

    stageImage.classList.remove("is-loaded");
    stageImage.src = image.large;
    stageImage.alt = image.alt;
    if (stageImage.complete) stageImage.classList.add("is-loaded");
    else stageImage.addEventListener("load", () => stageImage.classList.add("is-loaded"), { once: true });

    counter.textContent = `${current + 1} / ${images.length}`;

    $$("[data-lb-thumb]", lightbox).forEach((thumb, index) => {
      const active = index === current;
      thumb.setAttribute("aria-current", String(active));
      if (active) thumb.scrollIntoView({ block: "nearest", inline: "center" });
    });
  };

  const open = (index) => {
    lastFocus = document.activeElement;
    render(index);
    lightbox.classList.add("is-open");
    lockScroll(true);
    $("[data-lb-close]", lightbox).focus({ preventScroll: true });
  };

  const close = () => {
    lightbox.classList.remove("is-open");
    lockScroll(false);
    if (lastFocus instanceof HTMLElement) lastFocus.focus({ preventScroll: true });
  };

  target.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-gallery-open]");
    if (!trigger) return;
    open(Number(trigger.dataset.galleryOpen) || 0);
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target.closest("[data-lb-close]")) return close();
    if (event.target.closest("[data-lb-prev]")) return render(current - 1);
    if (event.target.closest("[data-lb-next]")) return render(current + 1);

    const thumb = event.target.closest("[data-lb-thumb]");
    if (thumb) return render(Number(thumb.dataset.lbThumb));

    if (event.target === $("[data-lb-stage]", lightbox)) close();
  });

  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      render(current + 1);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      render(current - 1);
      return;
    }

    if (event.key !== "Tab") return;

    const items = focusable(lightbox);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

function ensureLightbox() {
  const existing = document.getElementById("lightbox");
  if (existing) return existing;

  const lightbox = document.createElement("div");
  lightbox.id = "lightbox";
  lightbox.className = "lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Property photo viewer");
  lightbox.innerHTML = `
    <div class="lightbox__bar">
      <p class="lightbox__title" data-lb-title></p>
      <div class="lightbox__bar" style="gap:.85rem">
        <span class="lightbox__count" data-lb-count>1 / 1</span>
        <button class="icon-btn icon-btn--lg" type="button" data-lb-close aria-label="Close photo viewer">
          ${icon("close")}
        </button>
      </div>
    </div>
    <div class="lightbox__stage" data-lb-stage>
      <button class="lightbox__nav lightbox__nav--prev" type="button" data-lb-prev aria-label="Previous photo">${icon("chevronLeft")}</button>
      <img data-lb-image src="" alt="">
      <button class="lightbox__nav lightbox__nav--next" type="button" data-lb-next aria-label="Next photo">${icon("chevronRight")}</button>
    </div>
    <div class="lightbox__thumbs" data-lb-thumbs></div>
  `;

  document.body.appendChild(lightbox);
  return lightbox;
}
