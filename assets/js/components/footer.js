/** Site footer: brand, navigation, visiting details and social links. */

import { SITE } from "../data/site.js";
import { brandMark, socialIcon } from "./icons.js";

export function mountFooter(target) {
  const year = new Date().getFullYear();

  target.className = "footer";
  target.innerHTML = `
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <a class="brand" href="index.html" aria-label="${SITE.name} — home">
            ${brandMark()}
            <span class="brand__text">
              <span class="brand__name">Caffeine</span>
              <span class="brand__sub">Cove</span>
            </span>
          </a>
          <p class="footer__tagline">${SITE.tagline}. ${SITE.blurb}</p>
          <div class="socials">
            ${SITE.social
              .map(
                (item) =>
                  `<a href="${item.href}" target="_blank" rel="noreferrer" aria-label="${item.name}">${socialIcon(item.icon)}</a>`,
              )
              .join("")}
          </div>
        </div>

        <div class="footer__col">
          <h3>Explore</h3>
          <ul class="footer__list">
            ${SITE.nav.map((item) => `<li><a href="${item.href}">${item.label}</a></li>`).join("")}
            <li><a href="cart.html">Your order</a></li>
          </ul>
        </div>

        <div class="footer__col">
          <h3>Visit</h3>
          <ul class="footer__list">
            <li>${SITE.address.join(", ")}</li>
            <li><a href="${SITE.phoneHref}">${SITE.phone}</a></li>
            <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
            ${SITE.hours.map((entry) => `<li>${entry.days} · ${entry.time}</li>`).join("")}
          </ul>
        </div>
      </div>

      <div class="footer__bottom">
        <span>© ${year} ${SITE.name}. All rights reserved.</span>
        <span>${SITE.tagline}.</span>
      </div>
    </div>`;
}
