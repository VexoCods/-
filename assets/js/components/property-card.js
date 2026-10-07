/**
 * The reusable property card — used by the homepage carousel, the results grid,
 * the saved list and the "similar properties" row.
 */

import { icon } from "./icons.js";
import { priceShort, count } from "../lib/format.js";
import { escapeHtml } from "../lib/dom.js";
import { saved } from "../lib/store.js";

/**
 * @param {object} property
 * @param {{variant?: ""|"card--wide", showMeta?: boolean}} [options]
 */
export function propertyCard(property, { variant = "", showMeta = true } = {}) {
  const isSaved = saved.has(property.id);
  const badge = property.badge
    ? `<span class="badge card__badge">${escapeHtml(property.badge)}</span>`
    : "";

  const meta = showMeta
    ? `<span class="card__meta">
          <span>${icon("bed")}${property.bedrooms}</span>
          <span>${icon("bath")}${property.bathrooms}</span>
          <span>${icon("area")}${count(property.area)} sq ft</span>
        </span>`
    : "";

  return `
    <article class="card ${variant}" data-property="${property.id}">
      <a class="card__media" href="property.html?id=${property.id}" tabindex="-1" aria-hidden="true">
        <img src="assets/images/covers/${property.id}-sm.jpg" alt="" width="760" height="540" loading="lazy" decoding="async">
        ${badge}
      </a>
      <button
        class="card__fav"
        type="button"
        data-saved-toggle="${property.id}"
        aria-pressed="${isSaved}"
        aria-label="${isSaved ? "Remove from saved" : "Save"} ${escapeHtml(property.name)}"
      >${icon("heart")}</button>

      <div class="card__body">
        <p class="card__eyebrow">${escapeHtml(property.type)} · ${escapeHtml(property.status)}</p>
        <h3 class="card__name"><a href="property.html?id=${property.id}">${escapeHtml(property.name)}</a></h3>
        <p class="card__location">${icon("mapPin")}${escapeHtml(property.location)}</p>
        <div class="card__foot">
          <span class="card__price">${priceShort(property.price)}</span>
          ${meta}
        </div>
      </div>
    </article>
  `;
}

/** Render a list of properties into a container. */
export function renderPropertyCards(container, properties, options = {}) {
  container.innerHTML = properties.map((property) => propertyCard(property, options)).join("");
}

/** Keep every save button on the page in sync with stored state. */
export function syncSavedButtons(scope = document) {
  scope.querySelectorAll("[data-saved-toggle]").forEach((button) => {
    const id = button.dataset.savedToggle;
    const isSaved = saved.has(id);
    button.setAttribute("aria-pressed", String(isSaved));
    const name = button.closest(".card")?.querySelector(".card__name")?.textContent.trim() ?? "property";
    button.setAttribute("aria-label", `${isSaved ? "Remove from saved" : "Save"} ${name}`);
  });
}
