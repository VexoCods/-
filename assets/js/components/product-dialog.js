/**
 * Quick-view product dialog.
 *
 * Opens as a bottom sheet on phones and a centred panel on larger screens
 * (handled purely in CSS). One instance is reused for every product.
 */

import { priceFor, defaultSelection } from "../data/menu.js";
import { cart } from "../lib/cart.js";
import { money } from "../lib/format.js";
import { escapeHtml, lockScroll, focusable } from "../lib/dom.js";
import { icon } from "./icons.js";
import { qtyMarkup, bindQty, setQtyDom } from "./qty.js";
import { optionsMarkup, readSelection, bindOptions } from "./product-options.js";
import { showToast } from "./toast.js";

let dialog = null;
let lastFocused = null;
let product = null;
let quantity = 1;

function ensure() {
  if (dialog) return dialog;

  dialog = document.createElement("div");
  dialog.className = "dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "product-dialog-title");
  dialog.innerHTML = `
    <div class="dialog__scrim" data-close></div>
    <div class="dialog__panel">
      <button class="dialog__close" type="button" data-close aria-label="Close">${icon("close")}</button>
      <div class="dialog__media"><img alt="" width="800" height="500"></div>
      <div class="dialog__body">
        <div class="dialog__title-row">
          <h2 class="dialog__title" id="product-dialog-title"></h2>
          <span class="dialog__price" data-price></span>
        </div>
        <p class="dialog__desc" data-desc></p>
        <div data-options></div>
        <div class="dialog__foot">
          <div data-qty-slot></div>
          <button class="btn btn--primary btn--lg btn--block" type="button" data-confirm></button>
        </div>
      </div>
    </div>`;

  document.body.appendChild(dialog);

  dialog.addEventListener("click", (event) => {
    if (event.target.closest("[data-close]")) close();
  });

  dialog.querySelector("[data-qty-slot]").innerHTML = qtyMarkup(1);
  const qtyRoot = dialog.querySelector("[data-qty]");
  bindQty(qtyRoot, (next) => {
    quantity = next;
    setQtyDom(qtyRoot, quantity);
    updateConfirmLabel();
  });

  dialog.querySelector("[data-confirm]").addEventListener("click", confirmAdd);

  document.addEventListener("keydown", (event) => {
    if (!dialog.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      close();
      return;
    }
    if (event.key !== "Tab") return;

    const items = focusable(dialog);
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

  return dialog;
}

function updateConfirmLabel() {
  if (!product) return;
  const total = priceFor(product, readSelection(dialog, product)) * quantity;
  dialog.querySelector("[data-confirm]").innerHTML = `Add to order · ${money(total)}`;
}

function confirmAdd() {
  if (!product) return;
  const selection = readSelection(dialog, product);
  cart.add({
    productId: product.id,
    qty: quantity,
    selection,
    unitPrice: priceFor(product, selection),
  });
  showToast(`${product.name} added to your order`);
  close();
}

function close() {
  if (!dialog) return;
  dialog.classList.remove("is-open");
  lockScroll(false);
  if (lastFocused instanceof HTMLElement) lastFocused.focus({ preventScroll: true });
}

export function openProductDialog(item) {
  const node = ensure();
  product = item;
  quantity = 1;

  const selection = defaultSelection(item);
  node.querySelector(".dialog__media img").src = item.image;
  node.querySelector(".dialog__media img").alt = item.name;
  node.querySelector(".dialog__title").textContent = item.name;
  node.querySelector("[data-desc]").textContent = item.description;

  const optionsRoot = node.querySelector("[data-options]");
  optionsRoot.innerHTML = optionsMarkup(item, selection);
  bindOptions(optionsRoot, item, updateConfirmLabel);

  const qtyRoot = node.querySelector("[data-qty]");
  setQtyDom(qtyRoot, quantity);

  lastFocused = document.activeElement;
  updateConfirmLabel();
  node.classList.add("is-open");
  lockScroll(true);
  node.querySelector("[data-confirm]")?.focus({ preventScroll: true });
}
