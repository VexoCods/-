/**
 * Site header: transparent over the hero, opaque once scrolled, with a
 * full-screen mobile drawer.
 */

import { SITE, currentPage } from "../data/site.js";
import { icon, brandMark } from "./icons.js";
import { $, $$, lockScroll, focusable, onFrame } from "../lib/dom.js";
import { saved } from "../lib/store.js";

const SOLID_AFTER = 40;

function navItems(page, className, withIndex = false) {
  return SITE.nav
    .map((item, index) => {
      const current = item.href === page ? ' aria-current="page"' : "";
      const style = withIndex ? ` style="--i:${index}"` : "";
      const tail = withIndex
        ? `<span class="mobile-nav__index">${String(index + 1).padStart(2, "0")}</span>`
        : "";
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
          <span class="brand__name">Horizon</span>
          <span class="brand__sub">Properties</span>
        </span>
      </a>

      <nav class="header__nav" aria-label="Primary">
        <ul class="nav">${navItems(page, "nav__link")}</ul>
      </nav>

      <div class="header__actions">
        <a class="header__phone" href="${SITE.phoneHref}">
          ${icon("phone")}
          <span>${SITE.phone}</span>
        </a>
        <a class="saved-link" href="favorites.html" aria-label="Saved properties">
          ${icon("heart")}
          <span class="saved-link__count" hidden>0</span>
        </a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">
          <span class="menu-toggle__bars"><span></span><span></span><span></span></span>
        </button>
      </div>
    </div>
  `;

  const drawer = document.createElement("div");
  drawer.className = "mobile-nav";
  drawer.id = "mobile-nav";
  drawer.innerHTML = `
    <nav aria-label="Mobile">
      <ul class="mobile-nav__list">${navItems(page, "mobile-nav__link", true)}</ul>
    </nav>
    <div></div>
    <div class="mobile-nav__foot">
      <div>
        <a href="${SITE.phoneHref}">${SITE.phone}</a><br>
        <a href="mailto:${SITE.email}">${SITE.email}</a>
      </div>
      <div class="mobile-nav__actions">
        <a class="btn btn--gold btn--sm" href="properties.html">Browse properties</a>
        <a class="btn btn--ghost btn--sm" href="favorites.html">Saved (<span data-saved-count>0</span>)</a>
      </div>
      <div class="socials">
        ${SITE.social
          .map(
            (item) =>
              `<a href="${item.href}" target="_blank" rel="noreferrer" aria-label="${item.name}">${icon(item.icon)}</a>`,
          )
          .join("")}
      </div>
    </div>
  `;
  document.body.appendChild(drawer);

  const toggle = $(".menu-toggle", target);

  /* --- scroll state ------------------------------------------------------ */

  const updateHeader = onFrame(() => {
    const solid = !overHero || window.scrollY > SOLID_AFTER;
    target.classList.toggle("is-solid", solid);
  });

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
  window.addEventListener("resize", updateHeader);

  /* --- saved count ------------------------------------------------------- */

  const renderSaved = () => {
    const total = saved.count();
    $$("[data-saved-count], .saved-link__count", document).forEach((node) => {
      node.textContent = String(total);
      if (node.classList.contains("saved-link__count")) node.hidden = total === 0;
    });
  };

  renderSaved();
  saved.subscribe(renderSaved);

  /* --- mobile drawer ----------------------------------------------------- */

  const setOpen = (open) => {
    drawer.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    lockScroll(open);
    if (open) {
      const first = focusable(drawer)[0];
      first?.focus({ preventScroll: true });
    } else if (drawer.contains(document.activeElement)) {
      toggle.focus({ preventScroll: true });
    }
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
