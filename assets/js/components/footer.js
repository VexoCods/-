/** Site footer, including the newsletter sign-up. */

import { SITE } from "../data/site.js";
import { icon, brandMark } from "./icons.js";
import { $, lockScroll } from "../lib/dom.js";
import { subscribers } from "../lib/store.js";
import { showToast } from "./toast.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export function mountFooter(target) {
  const [address1, address2, address3] = SITE.address;

  target.className = "footer";
  target.innerHTML = `
    <div class="container">
      <div class="footer__top">
        <div class="footer__brand">
          <a class="brand" href="index.html" aria-label="${SITE.name} — home">
            ${brandMark()}
            <span class="brand__text">
              <span class="brand__name">Horizon</span>
              <span class="brand__sub">Properties</span>
            </span>
          </a>
          <p class="footer__blurb">${SITE.blurb}</p>
          <div class="socials">
            ${SITE.social
              .map(
                (item) =>
                  `<a href="${item.href}" target="_blank" rel="noreferrer" aria-label="${item.name}">${icon(item.icon)}</a>`,
              )
              .join("")}
          </div>
        </div>

        <div>
          <h2 class="footer__title">Navigate</h2>
          <ul class="footer__list">
            ${SITE.nav.map((item) => `<li><a href="${item.href}">${item.label}</a></li>`).join("")}
            <li><a href="favorites.html">Saved properties</a></li>
          </ul>
        </div>

        <div>
          <h2 class="footer__title">Services</h2>
          <ul class="footer__list">
            <li><a href="services.html#luxury-home-sales">Luxury Home Sales</a></li>
            <li><a href="services.html#property-investment">Property Investment</a></li>
            <li><a href="services.html#property-marketing">Property Marketing</a></li>
            <li><a href="services.html#real-estate-advisory">Real Estate Advisory</a></li>
            <li><a href="services.html#property-valuation">Property Valuation</a></li>
            <li><a href="services.html#relocation-services">Relocation Services</a></li>
          </ul>
        </div>

        <div class="footer__contact">
          <h2 class="footer__title">Contact</h2>
          <p class="footer__contact-row">${icon("phone")}<a href="${SITE.phoneHref}">${SITE.phone}</a></p>
          <p class="footer__contact-row">${icon("mail")}<a href="mailto:${SITE.email}">${SITE.email}</a></p>
          <p class="footer__contact-row">
            ${icon("mapPin")}
            <address>${address1}<br>${address2}<br>${address3}</address>
          </p>
          <p class="footer__contact-row">${icon("clock")}<span>${SITE.hours}</span></p>
        </div>
      </div>

      <div class="footer__top" style="grid-template-columns: minmax(0,1fr) minmax(0,1fr); padding-bottom: 2rem;">
        <div>
          <h2 class="footer__title">Market notes</h2>
          <p class="footer__blurb">One considered email a month: new instructions, off-market houses and where we think values are moving.</p>
        </div>
        <form class="newsletter" data-newsletter novalidate>
          <label class="visually-hidden" for="newsletter-email">Email address</label>
          <div class="newsletter__row">
            <input class="input" id="newsletter-email" name="email" type="email" placeholder="Email address" autocomplete="email" required>
            <button class="btn btn--gold" type="submit">Subscribe</button>
          </div>
          <p class="newsletter__note" data-newsletter-note>We never share your details. Unsubscribe in one click.</p>
        </form>
      </div>

      <div class="footer__bottom">
        <p>© ${new Date().getFullYear()} ${SITE.name}. All rights reserved.</p>
        <ul class="footer__legal">
          <li><a href="contact.html">Privacy</a></li>
          <li><a href="contact.html">Terms</a></li>
          <li><a href="contact.html">Cookies</a></li>
        </ul>
      </div>
    </div>
  `;

  const form = $("[data-newsletter]", target);
  const note = $("[data-newsletter-note]", target);
  const input = $("#newsletter-email", form);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value.trim();

    if (!EMAIL_PATTERN.test(value)) {
      input.setAttribute("aria-invalid", "true");
      note.textContent = "Please enter a valid email address.";
      input.focus();
      return;
    }

    input.removeAttribute("aria-invalid");
    subscribers.add(value);
    form.reset();
    note.textContent = "Thank you — you are on the list.";
    showToast("Subscribed to market notes");
  });

  // The footer lives below the fold; make sure any open drawer has released the scroll lock.
  lockScroll(false);
}
