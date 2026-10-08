/**
 * Caffeine Cove — application entry point.
 * Mounts the shared chrome, wires global interactions, then hands off to the
 * module for the current page (declared with `data-page` on <body>).
 */

import { mountHeader } from "./components/header.js";
import { mountFooter } from "./components/footer.js";
import { initReveal } from "./components/reveal.js";
import { openProductDialog } from "./components/product-dialog.js";
import { PRODUCTS } from "./data/menu.js";

import { initHome } from "./pages/home.js";
import { initMenuPage } from "./pages/menu.js";
import { initProduct } from "./pages/product.js";
import { initGallery } from "./pages/gallery.js";
import { initContact } from "./pages/contact.js";
import { initCartPage } from "./pages/cart.js";

const PAGES = {
  home: initHome,
  menu: initMenuPage,
  product: initProduct,
  gallery: initGallery,
  contact: initContact,
  cart: initCartPage,
};

/** Quick-add is global: any "Add" button, on any page, opens the dialog. */
function bindQuickAdd() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-product]");
    if (!button) return;
    event.preventDefault();
    const product = PRODUCTS.find((entry) => entry.id === button.dataset.addProduct);
    if (product) openProductDialog(product);
  });
}

async function boot() {
  const headerTarget = document.querySelector("[data-header]");
  if (headerTarget) mountHeader(headerTarget);

  const footerTarget = document.querySelector("[data-footer]");
  if (footerTarget) mountFooter(footerTarget);

  bindQuickAdd();

  const page = document.body.dataset.page;
  const init = PAGES[page];
  if (init) {
    try {
      await init();
    } catch (error) {
      console.error(`[cove] failed to initialise the "${page}" page`, error);
    }
  }

  initReveal();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
