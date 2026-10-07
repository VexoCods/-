/** Saved properties (shortlist) page. */

import { PROPERTIES } from "../data/properties.js";
import { renderPropertyCards } from "../components/property-card.js";
import { icon } from "../components/icons.js";
import { $ } from "../lib/dom.js";
import { saved } from "../lib/store.js";
import { showToast } from "../components/toast.js";

export function initFavorites() {
  const grid = $("[data-saved-grid]");
  const empty = $("[data-saved-empty]");
  const countEl = $("[data-saved-page-count]");
  const clearButton = $("[data-clear-shortlist]");

  if (!grid) return;

  const render = () => {
    const ids = saved.ids();
    const list = ids
      .map((id) => PROPERTIES.find((property) => property.id === id))
      .filter(Boolean);

    renderPropertyCards(grid, list);
    grid.hidden = list.length === 0;
    if (empty) empty.hidden = list.length > 0;
    if (countEl) countEl.textContent = String(list.length);
    if (clearButton) clearButton.hidden = list.length === 0;
  };

  clearButton?.addEventListener("click", () => {
    saved.clear();
    render();
    showToast("Shortlist cleared", "close");
  });

  // Stay in sync when a card is unsaved from the grid itself.
  document.addEventListener("horizon:saved-change", render);

  render();
}
