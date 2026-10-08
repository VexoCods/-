/** Home page: renders the Signature Favorites grid. */

import { featuredProducts } from "../data/menu.js";
import { productCard } from "../components/product-card.js";

export function initHome() {
  const grid = document.querySelector("[data-featured]");
  if (!grid) return;

  grid.innerHTML = featuredProducts()
    .map((product) => productCard(product, { variant: "feature" }))
    .join("");
}
