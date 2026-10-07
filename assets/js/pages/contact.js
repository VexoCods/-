/** Contact page: validated enquiry form backed by the shared enquiry store. */

import { $, $$ } from "../lib/dom.js";
import { enquiries } from "../lib/store.js";
import { showToast } from "../components/toast.js";
import { icon } from "../components/icons.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export function initContact() {
  const form = $("[data-contact-form]");
  if (!form) return;

  const status = $("[data-contact-status]");

  const setError = (name, text) => {
    const errorNode = $(`[data-error-for="${name}"]`, form);
    const input = form.elements[name];
    if (!errorNode || !input) return;
    errorNode.hidden = !text;
    errorNode.textContent = text ?? "";
    if (text) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const values = Object.fromEntries(new FormData(form).entries());
    let firstInvalid = null;

    ["name", "email", "message"].forEach((name) => {
      const value = (values[name] ?? "").toString().trim();
      if (value.length === 0) {
        setError(name, "This field is required.");
        firstInvalid ??= form.elements[name];
      } else if (name === "email" && !EMAIL_PATTERN.test(value)) {
        setError(name, "Please enter a valid email address.");
        firstInvalid ??= form.elements[name];
      } else {
        setError(name, "");
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    enquiries.add({ mode: "contact-page", ...values });

    $$("[data-error-for]", form).forEach((node) => {
      node.hidden = true;
    });

    form.reset();

    if (status) {
      status.hidden = false;
      status.innerHTML = `
        <span style="display:flex; gap:.6rem; align-items:flex-start">
          ${icon("check")}
          <span>Thank you — your message has been received. An advisor will reply within one working day.</span>
        </span>`;
    }

    showToast("Message sent");
  });
}
