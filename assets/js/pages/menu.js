/**
 * Menu page: builds the sticky category bar and every category section, then
 * keeps the active category in sync while the page scrolls.
 */

import { CATEGORIES, productsInCategory, featuredProducts } from "../data/menu.js";
import { productCard } from "../components/product-card.js";
import { onFrame } from "../lib/dom.js";

const OFFSET = 150; // header + category bar

function renderCategoryBar() {
  const bar = document.querySelector("[data-catbar]");
  if (!bar) return;

  bar.innerHTML = CATEGORIES.map(
    (category) =>
      `<a class="catbar__link" href="#${category.id}" data-cat="${category.id}">${category.label}</a>`,
  ).join("");
}

function renderFeatured() {
  const grid = document.querySelector("[data-featured]");
  if (!grid) return;
  grid.innerHTML = featuredProducts()
    .map((product) => productCard(product, { variant: "feature" }))
    .join("");
}

function renderSections() {
  const mount = document.querySelector("[data-menu-sections]");
  if (!mount) return;

  mount.innerHTML = CATEGORIES.map((category) => {
    const items = productsInCategory(category.id);
    if (items.length === 0) return "";
    return `<section class="menu-section container" id="${category.id}" aria-labelledby="cat-${category.id}">
      <div class="menu-section__head">
        <h2 class="menu-section__title" id="cat-${category.id}">${category.label}</h2>
        <span class="menu-section__count">${items.length} items</span>
      </div>
      <div class="menu-list">${items.map((product) => productCard(product, { variant: "row" })).join("")}</div>
    </section>`;
  }).join("");
}

function syncActiveCategory() {
  const links = Array.from(document.querySelectorAll("[data-cat]"));
  const sections = CATEGORIES.map((category) => document.getElementById(category.id)).filter(Boolean);
  if (links.length === 0 || sections.length === 0) return;

  let active = sections[0].id;
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= OFFSET) active = section.id;
  }
  // Bottom of the page always highlights the last category.
  if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
    active = sections[sections.length - 1].id;
  }

  links.forEach((link) => {
    const isActive = link.dataset.cat === active;
    link.classList.toggle("is-active", isActive);
    link.setAttribute("aria-current", String(isActive));
    if (isActive) link.scrollIntoView({ block: "nearest", inline: "center" });
  });
}

export function initMenuPage() {
  renderCategoryBar();
  renderFeatured();
  renderSections();

  const update = onFrame(syncActiveCategory);
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  syncActiveCategory();
}
