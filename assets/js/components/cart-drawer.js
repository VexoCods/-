/**
 * Slide-over cart. One instance, created on first use, re-rendered from the
 * cart store whenever it changes.
 */

import { cart, findProduct, totals } from "../lib/cart.js";
import { money } from "../lib/format.js";
import { escapeHtml, lockScroll, focusable } from "../lib/dom.js";
import { icon } from "./icons.js";
import { qtyMarkup } from "./qty.js";
import { describeSelection } from "../data/menu.js";

let drawer = null;
let lastFocused = null;

function cartLines() {
  return cart
    .items()
    .map((item) => {
      const product = findProduct(item.productId);
      if (!product) return "";
      const options = describeSelection(product, item.selection);
      return `<div class="cart-line" data-line="${escapeHtml(item.key)}">
        <div class="cart-line__media"><img src="${product.image}" alt="" loading="lazy" width="66" height="66"></div>
        <div>
          <p class="cart-line__name">${escapeHtml(product.name)}</p>
          ${options ? `<p class="cart-line__opts">${escapeHtml(options)}</p>` : ""}
          <div class="cart-line__row">
            <div data-line-qty>${qtyMarkup(item.qty, { small: true })}</div>
            <button class="cart-line__remove" type="button" data-remove>Remove</button>
          </div>
        </div>
        <span class="cart-line__price">${money(item.unitPrice * item.qty)}</span>
      </div>`;
    })
    .join("");
}

function render() {
  if (!drawer) return;
  const body = drawer.querySelector("[data-cart-body]");
  const foot = drawer.querySelector("[data-cart-foot]");
  const count = drawer.querySelector("[data-cart-count]");

  if (count) count.textContent = String(cart.count());

  if (cart.count() === 0) {
    body.innerHTML = `<div class="empty-state">
      ${icon("bag")}
      <p>Your order is empty.</p>
      <a class="btn btn--ghost btn--sm" href="menu.html">Browse the menu</a>
    </div>`;
    foot.innerHTML = "";
    return;
  }

  body.innerHTML = cartLines();

  const { subtotal, tax, total } = totals();
  foot.innerHTML = `
    <div class="totals">
      <div class="totals__row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
      <div class="totals__row"><span>Tax (8%)</span><span>${money(tax)}</span></div>
      <div class="totals__row totals__row--total"><span>Total</span><span>${money(total)}</span></div>
    </div>
    <a class="btn btn--primary btn--block" href="cart.html">Continue to checkout</a>`;
}

function ensure() {
  if (drawer) return drawer;

  drawer = document.createElement("div");
  drawer.className = "drawer";
  drawer.setAttribute("role", "dialog");
  drawer.setAttribute("aria-modal", "true");
  drawer.setAttribute("aria-label", "Your order");
  drawer.innerHTML = `
    <div class="drawer__scrim" data-close></div>
    <div class="drawer__panel">
      <div class="drawer__head">
        <h2 class="drawer__title">Your order <span class="text-faint small" data-cart-count>0</span></h2>
        <button class="icon-btn" type="button" data-close aria-label="Close cart">${icon("close")}</button>
      </div>
      <div class="drawer__body" data-cart-body></div>
      <div class="drawer__foot" data-cart-foot></div>
    </div>`;

  document.body.appendChild(drawer);

  drawer.addEventListener("click", (event) => {
    if (event.target.closest("[data-close]")) {
      closeCartDrawer();
      return;
    }

    const line = event.target.closest("[data-line]");
    if (!line) return;
    const key = line.dataset.line;

    const step = event.target.closest("[data-qty-step]");
    if (step) {
      const item = cart.items().find((entry) => entry.key === key);
      if (item) cart.setQty(key, item.qty + Number(step.dataset.qtyStep));
      return;
    }

    if (event.target.closest("[data-remove]")) cart.remove(key);
  });

  document.addEventListener("keydown", (event) => {
    if (!drawer.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      closeCartDrawer();
      return;
    }
    if (event.key !== "Tab") return;
    const items = focusable(drawer);
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

  cart.subscribe(render);
  render();
  return drawer;
}

export function openCartDrawer() {
  const node = ensure();
  lastFocused = document.activeElement;
  render();
  node.classList.add("is-open");
  lockScroll(true);
  focusable(node)[0]?.focus({ preventScroll: true });
}

export function closeCartDrawer() {
  if (!drawer) return;
  drawer.classList.remove("is-open");
  lockScroll(false);
  if (lastFocused instanceof HTMLElement) lastFocused.focus({ preventScroll: true });
}
