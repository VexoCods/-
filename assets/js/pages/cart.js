/** Cart page: line items, totals and a validated checkout form. */

import { cart, findProduct, totals } from "../lib/cart.js";
import { describeSelection } from "../data/menu.js";
import { money, pluralise } from "../lib/format.js";
import { escapeHtml } from "../lib/dom.js";
import { icon } from "../components/icons.js";
import { qtyMarkup } from "../components/qty.js";
import { rules, validate } from "../lib/forms.js";
import { showToast } from "../components/toast.js";

function lineMarkup(item) {
  const product = findProduct(item.productId);
  if (!product) return "";
  const options = describeSelection(product, item.selection);
  return `<div class="cart-line" data-line="${escapeHtml(item.key)}">
    <div class="cart-line__media"><img src="${product.image}" alt="" loading="lazy" width="66" height="66"></div>
    <div>
      <p class="cart-line__name"><a href="product.html?id=${product.id}">${escapeHtml(product.name)}</a></p>
      ${options ? `<p class="cart-line__opts">${escapeHtml(options)}</p>` : ""}
      <div class="cart-line__row">
        <div data-line-qty>${qtyMarkup(item.qty, { small: true })}</div>
        <button class="cart-line__remove" type="button" data-remove>Remove</button>
      </div>
    </div>
    <span class="cart-line__price">${money(item.unitPrice * item.qty)}</span>
  </div>`;
}

function renderLines() {
  const mount = document.querySelector("[data-cart-lines]");
  const empty = document.querySelector("[data-cart-empty]");
  const main = document.querySelector("[data-cart-main]");
  if (!mount) return;

  const items = cart.items();

  if (items.length === 0) {
    mount.innerHTML = "";
    if (empty) empty.hidden = false;
    if (main) main.hidden = true;
    return;
  }

  if (empty) empty.hidden = true;
  if (main) main.hidden = false;
  mount.innerHTML = items.map(lineMarkup).join("");
}

function renderTotals() {
  const mount = document.querySelector("[data-cart-totals]");
  if (!mount) return;
  const { subtotal, tax, total } = totals();
  mount.innerHTML = `
    <div class="totals__row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
    <div class="totals__row"><span>Tax (8%)</span><span>${money(tax)}</span></div>
    <div class="totals__row totals__row--total"><span>Total</span><span>${money(total)}</span></div>`;
}

function renderCount() {
  const mount = document.querySelector("[data-cart-count-label]");
  if (mount) mount.textContent = pluralise(cart.count(), "item");
}

function renderAll() {
  renderLines();
  renderTotals();
  renderCount();
}

function bindLineControls() {
  const mount = document.querySelector("[data-cart-lines]");
  if (!mount) return;

  mount.addEventListener("click", (event) => {
    const line = event.target.closest("[data-line]");
    if (!line) return;
    const key = line.dataset.line;

    const step = event.target.closest("[data-qty-step]");
    if (step) {
      const item = cart.items().find((entry) => entry.key === key);
      if (item) cart.setQty(key, item.qty + Number(step.dataset.qtyStep));
      return;
    }

    if (event.target.closest("[data-remove]")) {
      cart.remove(key);
      showToast("Item removed");
    }
  });
}

function bindCheckout() {
  const form = document.querySelector("[data-checkout-form]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (cart.count() === 0) {
      showToast("Your order is empty", "info");
      return;
    }

    const ok = validate(form, {
      name: rules.minLength(2, "Please tell us your name"),
      phone: rules.phone(),
      email: rules.email(),
    });
    if (!ok) return;

    const name = String(form.elements.name.value).trim().split(" ")[0];
    const reference = `CC-${String(Date.now()).slice(-5)}`;

    cart.clear();

    const success = document.querySelector("[data-checkout-success]");
    const main = document.querySelector("[data-cart-main]");
    const empty = document.querySelector("[data-cart-empty]");
    if (empty) empty.hidden = true;
    if (main) main.hidden = true;
    if (success) {
      success.hidden = false;
      success.innerHTML = `
        <div class="empty-state">
          ${icon("check")}
          <h2 class="menu-section__title">Order placed</h2>
          <p>Thanks ${escapeHtml(name)} — your order <strong>${reference}</strong> is with the bar. We'll have it ready shortly.</p>
          <a class="btn btn--primary" href="menu.html">Back to the menu</a>
        </div>`;
      success.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    showToast("Order placed — see you soon");
  });
}

/** "Continue to Checkout" reveals the pickup-details form. */
function bindContinue() {
  const button = document.querySelector("[data-continue]");
  const panel = document.querySelector("[data-checkout-panel]");
  if (!button || !panel) return;

  button.addEventListener("click", () => {
    panel.hidden = false;
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
    button.textContent = "Details added — place your order below";
    button.classList.remove("btn--primary");
    button.classList.add("btn--ghost");
  });
}

export function initCartPage() {
  if (!document.querySelector("[data-cart-lines]")) return;
  renderAll();
  bindLineControls();
  bindContinue();
  bindCheckout();
  cart.subscribe(renderAll);
}
