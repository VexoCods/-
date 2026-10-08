/** Dedicated product page: renders the item, its options and related drinks. */

import { PRODUCTS, defaultSelection, priceFor, categoryLabel } from "../data/menu.js";
import { cart } from "../lib/cart.js";
import { money } from "../lib/format.js";
import { escapeHtml } from "../lib/dom.js";
import { icon } from "../components/icons.js";
import { productCard } from "../components/product-card.js";
import { optionsMarkup, readSelection, bindOptions } from "../components/product-options.js";
import { qtyMarkup, bindQty, setQtyDom } from "../components/qty.js";
import { showToast } from "../components/toast.js";

let product = null;
let quantity = 1;

function setMeta(item) {
  document.title = `${item.name} — Caffeine Cove`;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute("content", `${item.description} ${money(item.price)} at Caffeine Cove.`);
}

function renderMissing() {
  const main = document.querySelector("#main");
  main.innerHTML = `<section class="notfound container">
    <div class="notfound__inner">
      <p class="label label--plain">Not on the menu</p>
      <h1 class="page-hero__title" style="margin-top:1rem">We couldn't find that item.</h1>
      <p class="lead" style="margin-top:1rem">It may have sold out or been renamed. The rest of the menu is waiting.</p>
      <a class="btn btn--primary btn--lg" href="menu.html">Explore the menu</a>
    </div>
  </section>`;
}

function refreshPrice() {
  const optionsRoot = document.querySelector("[data-options]");
  const button = document.querySelector("[data-confirm]");
  if (!optionsRoot || !button || !product) return;
  const total = priceFor(product, readSelection(optionsRoot, product)) * quantity;
  button.innerHTML = `Add to order · ${money(total)}`;
}

function render(item) {
  const media = document.querySelector("[data-pdp-media]");
  const body = document.querySelector("[data-pdp-body]");
  const crumbs = document.querySelector("[data-breadcrumbs]");

  if (crumbs) {
    crumbs.innerHTML = `<a href="index.html">Home</a><span aria-hidden="true">/</span><a href="menu.html">Menu</a><span aria-hidden="true">/</span><span>${escapeHtml(item.name)}</span>`;
  }

  media.innerHTML = `<img src="${item.image}" alt="${escapeHtml(item.name)}" width="900" height="1125" fetchpriority="high" decoding="async">`;

  const badges = [
    item.badge ? `<span class="badge">${escapeHtml(item.badge)}</span>` : "",
    item.tags?.includes("vegan") ? '<span class="badge badge--vegan">Plant-based</span>' : "",
    `<span class="badge badge--neutral">${categoryLabel(item.category)}</span>`,
  ]
    .filter(Boolean)
    .join("");

  body.innerHTML = `
    <h1 class="pdp__title">${escapeHtml(item.name)}</h1>
    <p class="pdp__price" data-pdp-price>${money(item.price)}</p>
    <div class="pdp__meta">${badges}</div>
    <p class="pdp__desc lead">${escapeHtml(item.description)}</p>
    <div class="pdp__options" data-options></div>
    <div class="pdp__buy">
      <div data-qty-slot>${qtyMarkup(1)}</div>
      <button class="btn btn--primary btn--lg" type="button" data-confirm></button>
    </div>
    <p class="pdp__note">${icon("info")}<span>Made to order at the bar. Let us know about allergies and we'll adapt where we can.</span></p>`;

  const optionsRoot = body.querySelector("[data-options]");
  optionsRoot.innerHTML = optionsMarkup(item, defaultSelection(item));
  bindOptions(optionsRoot, item, refreshPrice);

  const qtyRoot = body.querySelector("[data-qty]");
  bindQty(qtyRoot, (next) => {
    quantity = next;
    setQtyDom(qtyRoot, quantity);
    refreshPrice();
  });

  body.querySelector("[data-confirm]").addEventListener("click", () => {
    const selection = readSelection(optionsRoot, item);
    cart.add({ productId: item.id, qty: quantity, selection, unitPrice: priceFor(item, selection) });
    showToast(`${item.name} added to your order`);
  });

  refreshPrice();

  // Related drinks from the same category.
  const related = PRODUCTS.filter((entry) => entry.category === item.category && entry.id !== item.id).slice(0, 3);
  const relatedMount = document.querySelector("[data-related]");
  const relatedSection = document.querySelector("[data-related-section]");
  if (relatedMount && relatedSection) {
    if (related.length === 0) {
      relatedSection.hidden = true;
    } else {
      relatedMount.innerHTML = related.map((entry) => productCard(entry)).join("");
    }
  }
}

export function initProduct() {
  const id = new URLSearchParams(window.location.search).get("id");
  product = PRODUCTS.find((entry) => entry.id === id) ?? null;

  if (!product) {
    setMeta({ name: "Not found", description: "That item is no longer on the menu.", price: 0 });
    renderMissing();
    return;
  }

  setMeta(product);
  render(product);
}
