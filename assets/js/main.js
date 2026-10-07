/**
 * Horizon Properties — application entry point.
 * Mounts the shared chrome, then hands off to the module for the current page
 * (declared with `data-page` on <body>).
 */

import { mountHeader } from "./components/header.js";
import { mountFooter } from "./components/footer.js";
import { initReveal } from "./components/reveal.js";
import { syncSavedButtons } from "./components/property-card.js";
import { bindEnquiryTriggers } from "./components/enquiry-dialog.js";
import { showToast } from "./components/toast.js";
import { saved } from "./lib/store.js";

import { initHome } from "./pages/home.js";
import { initProperties } from "./pages/properties.js";
import { initProperty } from "./pages/property.js";
import { initAbout } from "./pages/about.js";
import { initServices } from "./pages/services.js";
import { initTeam } from "./pages/team.js";
import { initContact } from "./pages/contact.js";
import { initFavorites } from "./pages/favorites.js";

const PAGES = {
  home: initHome,
  properties: initProperties,
  property: initProperty,
  about: initAbout,
  services: initServices,
  team: initTeam,
  contact: initContact,
  favorites: initFavorites,
};

/** Saved-property toggles are global: they work from any card, on any page. */
function bindSavedToggles() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-saved-toggle]");
    if (!button) return;
    event.preventDefault();
    const isSaved = saved.toggle(button.dataset.savedToggle);
    showToast(
      isSaved ? "Added to your shortlist" : "Removed from your shortlist",
      isSaved ? "check" : "close",
    );
    document.dispatchEvent(new CustomEvent("horizon:saved-change"));
  });

  saved.subscribe(() => syncSavedButtons());
}

async function boot() {
  const headerTarget = document.querySelector("[data-header]");
  if (headerTarget) mountHeader(headerTarget);

  const footerTarget = document.querySelector("[data-footer]");
  if (footerTarget) mountFooter(footerTarget);

  bindSavedToggles();
  bindEnquiryTriggers(document);

  const page = document.body.dataset.page;
  const init = PAGES[page];

  if (init) {
    try {
      await init();
    } catch (error) {
      console.error(`[horizon] failed to initialise the "${page}" page`, error);
    }
  }

  syncSavedButtons();
  initReveal();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
