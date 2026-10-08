/** Contact page: directions link, opening-hours rendering and form validation. */

import { SITE } from "../data/site.js";
import { rules, validate } from "../lib/forms.js";
import { showToast } from "../components/toast.js";

export function initContact() {
  const directions = document.querySelector("[data-directions]");
  if (directions) {
    directions.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${SITE.name}, ${SITE.mapQuery}`,
    )}`;
  }

  const hours = document.querySelector("[data-hours]");
  if (hours) {
    hours.innerHTML = SITE.hours
      .map((entry) => `<li>${entry.days} · ${entry.time}</li>`)
      .join("");
  }

  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const ok = validate(form, {
      name: rules.minLength(2, "Please tell us your name"),
      email: rules.email(),
      message: rules.minLength(10, "A little more detail helps us help you"),
    });
    if (!ok) return;

    form.reset();
    showToast("Thanks — we'll be in touch shortly");
  });
}
