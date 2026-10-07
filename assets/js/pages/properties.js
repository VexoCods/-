/**
 * Properties page: search, filters, sorting and the results grid.
 * State lives in the URL query string, so any view can be linked or shared.
 */

import {
  CITIES,
  PRICE_BANDS,
  PROPERTIES,
  SORTS,
  TYPES,
  queryProperties,
} from "../data/properties.js";
import { propertyCard } from "../components/property-card.js";
import { icon } from "../components/icons.js";
import { $, $$, escapeHtml, debounce } from "../lib/dom.js";
import { saved } from "../lib/store.js";

const BED_OPTIONS = [
  { value: "any", label: "Beds — any" },
  { value: "2", label: "2+ beds" },
  { value: "3", label: "3+ beds" },
  { value: "4", label: "4+ beds" },
  { value: "5", label: "5+ beds" },
  { value: "6", label: "6+ beds" },
];

const BATH_OPTIONS = [
  { value: "any", label: "Baths — any" },
  { value: "2", label: "2+ baths" },
  { value: "3", label: "3+ baths" },
  { value: "4", label: "4+ baths" },
  { value: "5", label: "5+ baths" },
  { value: "6", label: "6+ baths" },
];

const DEFAULTS = {
  search: "",
  city: "any",
  type: "any",
  price: "any",
  bedrooms: "any",
  bathrooms: "any",
  sort: "featured",
  saved: "0",
};

const SELECTS = [
  { name: "city", label: "Location", options: () => [{ value: "any", label: "Any location" }, ...CITIES.map((city) => ({ value: city, label: city }))] },
  { name: "type", label: "Property type", options: () => [{ value: "any", label: "Any type" }, ...TYPES.map((type) => ({ value: type, label: type }))] },
  { name: "price", label: "Price range", options: () => PRICE_BANDS.map((band) => ({ value: band.value, label: band.label.replace("Price — ", "Price: ") })) },
  { name: "bedrooms", label: "Bedrooms", options: () => BED_OPTIONS },
  { name: "bathrooms", label: "Bathrooms", options: () => BATH_OPTIONS },
  { name: "sort", label: "Sort by", options: () => SORTS.map((sort) => ({ value: sort.value, label: sort.label.replace("Sort — ", "Sort: ") })) },
];

function optionsMarkup(options) {
  return options.map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`).join("");
}

export function initProperties() {
  const form = $("[data-filters-form]");
  const grid = $("[data-results]");
  if (!form || !grid) return;

  const countEl = $("[data-results-count]");
  const chipsEl = $("[data-active-filters]");
  const emptyEl = $("[data-empty-state]");
  const savedToggle = $("[data-saved-only]");
  const filters = $("[data-filters]");

  const state = { ...DEFAULTS };

  /* --- hydrate from the URL ---------------------------------------------- */

  const params = new URLSearchParams(window.location.search);
  Object.keys(DEFAULTS).forEach((key) => {
    if (params.has(key)) state[key] = params.get(key) ?? DEFAULTS[key];
  });

  /* --- build the controls from data --------------------------------------- */

  SELECTS.forEach(({ name, label, options }) => {
    const select = form.elements[name];
    if (!select) return;
    select.setAttribute("aria-label", label);
    select.innerHTML = optionsMarkup(options());
    select.value = state[name] ?? DEFAULTS[name];
  });

  if (form.elements.search) form.elements.search.value = state.search;

  const setSavedOnly = (on) => {
    state.saved = on ? "1" : "0";
    savedToggle?.setAttribute("aria-pressed", String(on));
    savedToggle?.classList.toggle("is-active", on);
  };

  setSavedOnly(state.saved === "1");

  /* --- rendering ---------------------------------------------------------- */

  const isDefault = (key) => state[key] === DEFAULTS[key] || state[key] === "";

  const activeFilterChips = () => {
    const chips = [];

    const push = (key, label) => {
      chips.push(
        `<button class="chip-removable" type="button" data-clear-filter="${key}">
          <span>${escapeHtml(label)}</span>${icon("close")}
        </button>`,
      );
    };

    if (state.search.trim()) push("search", `“${state.search.trim()}”`);
    if (state.city !== "any") push("city", state.city);
    if (state.type !== "any") push("type", state.type);
    if (state.price !== "any") push("price", PRICE_BANDS.find((band) => band.value === state.price)?.label ?? state.price);
    if (state.bedrooms !== "any") push("bedrooms", `${state.bedrooms}+ beds`);
    if (state.bathrooms !== "any") push("bathrooms", `${state.bathrooms}+ baths`);
    if (state.saved === "1") push("saved", "Shortlist only");

    return chips.join("");
  };

  const syncUrl = () => {
    const next = new URLSearchParams();
    Object.entries(state).forEach(([key, value]) => {
      if (value === DEFAULTS[key] || value === "" ) return;
      next.set(key, value);
    });
    const query = next.toString();
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  };

  const render = () => {
    const results = queryProperties({
      search: state.search,
      city: state.city,
      type: state.type,
      price: state.price,
      bedrooms: state.bedrooms,
      bathrooms: state.bathrooms,
      sort: state.sort,
      savedIds: state.saved === "1" ? saved.ids() : undefined,
    });

    grid.innerHTML = results.map((property) => propertyCard(property)).join("");
    grid.hidden = results.length === 0;

    if (countEl) {
      countEl.innerHTML = `<strong>${results.length}</strong> ${results.length === 1 ? "property" : "properties"}${
        results.length === PROPERTIES.length ? "" : ` of ${PROPERTIES.length}`
      }`;
    }

    if (chipsEl) {
      const chips = activeFilterChips();
      chipsEl.innerHTML = chips;
      chipsEl.hidden = chips.length === 0;
    }

    if (emptyEl) {
      emptyEl.hidden = results.length > 0;
      const emptyTitle = $("[data-empty-title]", emptyEl);
      if (emptyTitle) {
        emptyTitle.textContent =
          state.saved === "1" ? "Your shortlist is empty" : "No properties match those filters";
      }
    }

    syncUrl();
  };

  /* --- events ------------------------------------------------------------- */

  // Controls are bound individually so that ones living outside the <form>
  // (e.g. the sort select in the results bar) work just the same.
  const debouncedSearch = debounce(() => {
    state.search = form.elements.search?.value ?? "";
    render();
  }, 180);

  Object.keys(DEFAULTS).forEach((name) => {
    const control = form.elements[name];
    if (!control) return;

    if (name === "search") {
      control.addEventListener("input", debouncedSearch);
      control.addEventListener("search", debouncedSearch);
      return;
    }

    control.addEventListener("change", () => {
      state[name] = control.value;
      render();
    });
  });

  form.addEventListener("submit", (event) => event.preventDefault());

  const resetAll = () => {
    Object.assign(state, DEFAULTS);
    setSavedOnly(false);
    Object.entries(DEFAULTS).forEach(([name, value]) => {
      const control = form.elements[name];
      if (control) control.value = value;
    });
    render();
  };

  form.addEventListener("reset", (event) => {
    event.preventDefault();
    resetAll();
  });

  savedToggle?.addEventListener("click", () => {
    setSavedOnly(state.saved !== "1");
    render();
  });

  chipsEl?.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-clear-filter]");
    if (!chip) return;
    const key = chip.dataset.clearFilter;
    if (key === "saved") setSavedOnly(false);
    else if (key === "search") form.elements.search.value = "";

    state[key] = DEFAULTS[key];
    if (form.elements[key]) form.elements[key].value = DEFAULTS[key];
    render();
  });

  $("[data-clear-all]")?.addEventListener("click", resetAll);

  $("[data-filters-toggle]")?.addEventListener("click", (event) => {
    const open = filters?.classList.toggle("is-open");
    event.currentTarget.setAttribute("aria-expanded", String(Boolean(open)));
  });

  // Keep a "shortlist only" view honest when a card is unsaved.
  document.addEventListener("horizon:saved-change", () => {
    if (state.saved === "1") render();
  });

  render();
}
