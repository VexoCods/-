/**
 * Site header: transparent over the hero, solid once scrolled, with a
 * full-screen mobile drawer and a cart button that opens the slide-over.
 */

import { SITE, currentPage } from "../data/site.js";
import { brandMark, icon, socialIcon } from "./icons.js";
import { $, $$, lockScroll, focusable, onFrame } from "../lib/dom.js";
import { cart } from "../lib/cart.js";
import { openCartDrawer } from "./cart-drawer.js";

const SOLID_AFTER = 24;

function navItems(page, className, withIndex = false) {
  return SITE.nav
    .map((item, index) => {
      const current = item.href === page ? ' aria-current="page"' : "";
      const style = withIndex ? ` style="--i:${index}"` : "";
      const tail = withIndex ? `<span class="mobile-nav__index">0${index + 1}</span>` : "";
      return `<li><a class="${className}" href="${item.href}"${current}${style}><span>${item.label}</span>${tail}</a></li>`;
    })
    .join("");
}

export function mountHeader(target) {
  const page = currentPage();
  const overHero = Boolean(document.querySelector("[data-hero]"));

  target.className = "header";
  target.innerHTML = `
    <div class="container header__inner">
      <a class="brand" href="index.html" aria-label="${SITE.name} — home">
        ${brandMark()}
        <span class="brand__text">
          <span class="brand__name">Caffeine</span>
          <span class="brand__sub">Cove</span>
        </span>
      </a>

      <nav class="header__nav" aria-label="Primary">
        <ul class="nav">${navItems(page, "nav__link")}</ul>
      </nav>

      <div class="header__actions">
        <a class="btn btn--primary btn--sm header__cta" href="menu.html">Order online</a>
        <button class="cart-button" type="button" data-cart-open aria-label="Open your order">
          ${icon("cart")}
          <span class="cart-button__count" data-cart-count-badge>0</span>
        </button>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">
          <span class="menu-toggle__bars"><span></span><span></span><span></span></span>
        </button>
      </div>
    </div>`;

  const drawer = document.createElement("div");
  drawer.className = "mobile-nav";
  drawer.id = "mobile-nav";
  drawer.innerHTML = `
    <nav aria-label="Mobile">
      <ul class="mobile-nav__list">${navItems(page, "mobile-nav__link", true)}</ul>
    </nav>
    <div class="mobile-nav__foot">
      <div class="mobile-nav__actions">
        <a class="btn btn--primary" href="menu.html">Order online</a>
        <a class="btn btn--ghost" href="cart.html">Your order (<span data-cart-count>0</span>)</a>
      </div>
      <div class="socials">
        ${SITE.social
          .map(
            (item) =>
              `<a href="${item.href}" target="_blank" rel="noreferrer" aria-label="${item.name}">${socialIcon(item.icon)}</a>`,
          )
          .join("")}
      </div>
    </div>`;
  document.body.appendChild(drawer);

  const toggle = $(".menu-toggle", target);
  const cartButton = $("[data-cart-open]", target);
  const badge = $("[data-cart-count-badge]", target);

  /* --- scroll state ------------------------------------------------------ */

  const updateHeader = onFrame(() => {
    const solid = !overHero || window.scrollY > SOLID_AFTER;
    target.classList.toggle("is-solid", solid);
  });
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
  window.addEventListener("resize", updateHeader);

  /* --- cart -------------------------------------------------------------- */

  cartButton.addEventListener("click", openCartDrawer);

  let lastCount = cart.count();
  const renderCount = () => {
    const total = cart.count();
    $$("[data-cart-count], [data-cart-count-badge]", document).forEach((node) => {
      node.textContent = String(total);
    });
    if (badge) badge.classList.toggle("is-active", total > 0);
    if (total > lastCount) {
      cartButton.classList.remove("is-bumped");
      void cartButton.offsetWidth;
      cartButton.classList.add("is-bumped");
    }
    lastCount = total;
  };
  renderCount();
  cart.subscribe(renderCount);

  /* --- mobile drawer ----------------------------------------------------- */

  const setOpen = (open) => {
    drawer.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    lockScroll(open);
    if (open) focusable(drawer)[0]?.focus({ preventScroll: true });
    else if (drawer.contains(document.activeElement)) toggle.focus({ preventScroll: true });
  };

  toggle.addEventListener("click", () => setOpen(!drawer.classList.contains("is-open")));
  drawer.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (!drawer.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      setOpen(false);
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

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024 && drawer.classList.contains("is-open")) setOpen(false);
  });

  return { refresh: updateHeader };
}
