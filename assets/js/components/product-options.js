/**
 * Product option groups: markup, reading the current selection back out of the
 * DOM, and wiring the choice buttons. Shared by the quick-view dialog and the
 * dedicated product page so both behave identically.
 */

import { defaultSelection } from "../data/menu.js";
import { money } from "../lib/format.js";
import { escapeHtml } from "../lib/dom.js";

export function optionsMarkup(product, selection = defaultSelection(product)) {
  if (!product.options || product.options.length === 0) return "";

  return product.options
    .map((group) => {
      const value = selection[group.id];
      const choices = group.choices
        .map((choice) => {
          const selected = Array.isArray(value) ? value.includes(choice.id) : value === choice.id;
          const delta = choice.delta
            ? `<span class="opt__delta">${choice.delta > 0 ? "+" : "−"}${money(Math.abs(choice.delta))}</span>`
            : "";
          return `<button class="opt" type="button" data-group="${group.id}" data-choice="${choice.id}"
            aria-pressed="${selected}" aria-label="${escapeHtml(`${choice.label} ${choice.delta ? `plus ${money(choice.delta)}` : ""}`.trim())}"
            >${escapeHtml(choice.label)}${delta}</button>`;
        })
        .join("");

      const note = group.type === "multi" ? '<span class="opt-group__note">Optional</span>' : "";

      return `<div class="opt-group" data-opt-group="${group.id}">
        <div class="opt-group__head">
          <span class="opt-group__label">${escapeHtml(group.label)}</span>
          ${note}
        </div>
        <div class="opts" role="group" aria-label="${escapeHtml(group.label)}">${choices}</div>
      </div>`;
    })
    .join("");
}

/** Reads the current selection out of a rendered option block. */
export function readSelection(root, product) {
  const selection = {};
  for (const group of product.options ?? []) {
    const pressed = Array.from(
      root.querySelectorAll(`[data-opt-group="${group.id}"] [data-choice][aria-pressed="true"]`),
    ).map((button) => button.dataset.choice);
    selection[group.id] = group.type === "multi" ? pressed : (pressed[0] ?? group.choices[0].id);
  }
  return selection;
}

/** Wires choice buttons; onChange() fires after every selection change. */
export function bindOptions(root, product, onChange) {
  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-choice]");
    if (!button || !root.contains(button)) return;
    const group = product.options.find((entry) => entry.id === button.dataset.group);
    if (!group) return;

    if (group.type === "multi") {
      button.setAttribute("aria-pressed", button.getAttribute("aria-pressed") === "true" ? "false" : "true");
    } else {
      root
        .querySelectorAll(`[data-opt-group="${group.id}"] [data-choice]`)
        .forEach((other) => other.setAttribute("aria-pressed", String(other === button)));
    }
    onChange();
  });
}
