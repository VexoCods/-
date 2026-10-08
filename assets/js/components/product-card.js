/** Editorial product cards in three shapes: grid, feature and compact row. */

import { money } from "../lib/format.js";
import { escapeHtml } from "../lib/dom.js";
import { icon } from "./icons.js";

const BADGE_CLASS = { vegan: "badge--vegan" };

function badgeMarkup(product) {
  const badges = [];
  if (product.badge) badges.push(`<span class="badge">${escapeHtml(product.badge)}</span>`);
  if (product.tags?.includes("vegan")) badges.push('<span class="badge badge--vegan">Plant-based</span>');
  if (badges.length === 0) return "";
  return `<div class="pcard__badge">${badges.join("")}</div>`;
}

/**
 * @param {object} product
 * @param {{ variant?: "grid" | "feature" | "row", eager?: boolean }} options
 */
export function productCard(product, { variant = "grid", eager = false } = {}) {
  const loading = eager ? 'fetchpriority="high"' : 'loading="lazy"';
  const media = `<div class="pcard__media">
      <img src="${product.image}" alt="${escapeHtml(product.name)}" ${loading} decoding="async" width="800" height="600">
      ${badgeMarkup(product)}
    </div>`;

  const addButton = `<button class="add-btn" type="button" data-add-product="${product.id}" aria-label="Add ${escapeHtml(product.name)} to order">
      ${icon("plus")}<span>Add</span>
    </button>`;

  if (variant === "row") {
    return `<article class="pcard pcard--row">
      <a class="pcard__media" href="product.html?id=${product.id}" aria-label="${escapeHtml(product.name)}">${media}</a>
      <div class="pcard__body">
        <div class="pcard__top">
          <h3 class="pcard__name"><a href="product.html?id=${product.id}">${escapeHtml(product.name)}</a></h3>
          <span class="pcard__price">${money(product.price)}</span>
        </div>
        <p class="pcard__desc">${escapeHtml(product.description)}</p>
        <div class="pcard__foot">
          <a class="pcard__link" href="product.html?id=${product.id}">Details</a>
          ${addButton}
        </div>
      </div>
    </article>`;
  }

  const feature = variant === "feature" ? " pcard--feature" : "";

  return `<article class="pcard${feature}">
    <a class="pcard__media" href="product.html?id=${product.id}" aria-label="${escapeHtml(product.name)}">
      <img src="${product.image}" alt="${escapeHtml(product.name)}" ${loading} decoding="async" width="800" height="1000">
      ${badgeMarkup(product)}
    </a>
    <div class="pcard__body">
      <div class="pcard__top">
        <h3 class="pcard__name">${escapeHtml(product.name)}</h3>
        <span class="pcard__price">${money(product.price)}</span>
      </div>
      <p class="pcard__desc">${escapeHtml(product.description)}</p>
      <div class="pcard__foot">
        <a class="pcard__link" href="product.html?id=${product.id}">View</a>
        ${addButton}
      </div>
    </div>
  </article>`;
}

export function productCards(list, options = {}) {
  return list.map((product) => productCard(product, options)).join("");
}
