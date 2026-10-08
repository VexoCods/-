/** Quantity stepper shared by the product dialog, the product page and cart lines. */

import { icon } from "./icons.js";

export function qtyMarkup(value = 1, { small = false } = {}) {
  return `<div class="qty${small ? " qty--sm" : ""}" data-qty>
    <button type="button" data-qty-step="-1" aria-label="Decrease quantity" ${value <= 1 ? "disabled" : ""}>${icon("minus")}</button>
    <span class="qty__value" data-qty-value aria-live="polite">${value}</span>
    <button type="button" data-qty-step="1" aria-label="Increase quantity">${icon("plus")}</button>
  </div>`;
}

/** Wires the stepper inside `root`; calls onChange(nextValue). */
export function bindQty(root, onChange) {
  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-qty-step]");
    if (!button || button.disabled) return;
    const current = Number(root.querySelector("[data-qty-value]")?.textContent) || 1;
    const next = Math.max(1, Math.min(20, current + Number(button.dataset.qtyStep)));
    if (next !== current) onChange(next);
  });
}

export function setQtyDom(root, value) {
  const output = root.querySelector("[data-qty-value]");
  if (output) output.textContent = String(value);
  const minus = root.querySelector('[data-qty-step="-1"]');
  if (minus) minus.disabled = value <= 1;
  const plus = root.querySelector('[data-qty-step="1"]');
  if (plus) plus.disabled = value >= 20;
}
