/**
 * Enquiry / viewing-request dialog.
 * A real, validated form — submissions are recorded locally so nothing is a
 * dead end, and the same payload is ready to POST to an API later.
 */

import { $, lockScroll, focusable, escapeHtml } from "../lib/dom.js";
import { icon } from "./icons.js";
import { enquiries } from "../lib/store.js";
import { showToast } from "./toast.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

const INTERESTS = [
  "Buying a property",
  "Selling a property",
  "Investment advice",
  "Valuation",
  "Relocation",
  "Something else",
];

let lastFocus = null;

function ensureDialog() {
  const existing = document.getElementById("enquiry-dialog");
  if (existing) return existing;

  const dialog = document.createElement("div");
  dialog.id = "enquiry-dialog";
  dialog.className = "dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "enquiry-title");
  dialog.innerHTML = `
    <div class="dialog__panel" role="document">
      <button class="icon-btn dialog__close" type="button" data-enquiry-close aria-label="Close">
        ${icon("close")}
      </button>
      <div class="dialog__head">
        <p class="label" data-enquiry-label>Enquiry</p>
        <h2 class="h3" id="enquiry-title" data-enquiry-title>Get in touch</h2>
        <p class="muted" data-enquiry-sub style="font-size:var(--fs-sm)"></p>
      </div>
      <div data-enquiry-body></div>
    </div>
  `;

  document.body.appendChild(dialog);
  return dialog;
}

/** @param {{mode?: "contact"|"viewing", property?: object|null, agent?: object|null}} options */
export function openEnquiry({ mode = "contact", property = null, agent = null } = {}) {
  const dialog = ensureDialog();
  const title = $("[data-enquiry-title]", dialog);
  const sub = $("[data-enquiry-sub]", dialog);
  const label = $("[data-enquiry-label]", dialog);
  const body = $("[data-enquiry-body]", dialog);

  const isViewing = mode === "viewing";

  title.textContent = property
    ? isViewing
      ? `Schedule a viewing`
      : `Enquire about ${property.name}`
    : "Get in touch";

  label.textContent = property ? `${property.location} · ${property.type}` : "Contact";

  sub.textContent = property
    ? isViewing
      ? "Choose a preferred date and we will confirm by phone within one working day."
      : "Send a question about this property and the listing advisor will reply personally."
    : "Tell us what you are looking for and the right advisor will come back to you.";

  const agentBlock = agent
    ? `<p class="pill" style="margin-bottom:1rem">${icon("users")} Handled by ${escapeHtml(agent.name)} — ${escapeHtml(agent.role)}</p>`
    : "";

  body.innerHTML = `
    <form class="dialog__form" data-enquiry-form novalidate>
      ${agentBlock}
      <div class="dialog__row">
        <div class="field">
          <label class="field__label" for="enq-name">Name</label>
          <input class="input" id="enq-name" name="name" type="text" autocomplete="name" required>
          <p class="field__error" data-error-for="name" hidden></p>
        </div>
        <div class="field">
          <label class="field__label" for="enq-phone">Phone</label>
          <input class="input" id="enq-phone" name="phone" type="tel" autocomplete="tel">
          <p class="field__error" data-error-for="phone" hidden></p>
        </div>
      </div>
      <div class="field">
        <label class="field__label" for="enq-email">Email</label>
        <input class="input" id="enq-email" name="email" type="email" autocomplete="email" required>
        <p class="field__error" data-error-for="email" hidden></p>
      </div>
      ${
        isViewing
          ? `<div class="dialog__row">
              <div class="field">
                <label class="field__label" for="enq-date">Preferred date</label>
                <input class="input" id="enq-date" name="date" type="date" required>
                <p class="field__error" data-error-for="date" hidden></p>
              </div>
              <div class="field">
                <label class="field__label" for="enq-time">Preferred time</label>
                <select class="select" id="enq-time" name="time">
                  <option>Morning</option>
                  <option>Midday</option>
                  <option>Afternoon</option>
                  <option>Evening</option>
                </select>
              </div>
            </div>`
          : `<div class="field">
              <label class="field__label" for="enq-interest">I am interested in</label>
              <select class="select" id="enq-interest" name="interest">
                ${INTERESTS.map((item) => `<option>${item}</option>`).join("")}
              </select>
            </div>`
      }
      <div class="field">
        <label class="field__label" for="enq-message">Message</label>
        <textarea class="textarea" id="enq-message" name="message" required></textarea>
        <p class="field__error" data-error-for="message" hidden></p>
      </div>
      <button class="btn btn--block" type="submit">
        <span>${isViewing ? "Request viewing" : "Send enquiry"}</span>
        ${icon("arrowRight", { className: "btn__icon" })}
      </button>
      <p class="muted" style="font-size:var(--fs-xs)">
        By sending this enquiry you agree to be contacted about your request. We never sell your details.
      </p>
    </form>
  `;

  const form = $("[data-enquiry-form]", body);
  const message = $("#enq-message", form);

  if (!isViewing) {
    message.value = property ? `I would like more information about ${property.name}.` : "";
  } else {
    const dateInput = $("#enq-date", form);
    const tomorrow = new Date(Date.now() + 86_400_000);
    dateInput.min = tomorrow.toISOString().slice(0, 10);
  }

  const setError = (name, text) => {
    const field = $(`[data-error-for="${name}"]`, form);
    const input = form.elements[name];
    if (!field || !input) return;
    field.hidden = !text;
    field.textContent = text ?? "";
    if (text) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let firstInvalid = null;

    const values = Object.fromEntries(new FormData(form).entries());

    ["name", "email", "message", ...(isViewing ? ["date"] : [])].forEach((name) => {
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

    enquiries.add({
      mode,
      propertyId: property?.id ?? null,
      propertyName: property?.name ?? null,
      agentId: agent?.id ?? null,
      ...values,
    });

    body.innerHTML = `
      <div class="empty-state" style="padding-block:1.5rem">
        <span class="empty-state__icon">${icon("check", { strokeWidth: 1.2 })}</span>
        <h3 class="h3">Thank you, ${escapeHtml(String(values.name).split(" ")[0])}</h3>
        <p class="muted" style="font-size:var(--fs-sm); max-width:32rem">
          ${
            isViewing
              ? "Your viewing request has been received. We will confirm the appointment by phone within one working day."
              : "Your enquiry has been received. An advisor will reply within one working day."
          }
        </p>
        <button class="btn btn--outline" type="button" data-enquiry-close>Close</button>
      </div>
    `;

    showToast(isViewing ? "Viewing request sent" : "Enquiry sent");
  });

  lastFocus = document.activeElement;
  dialog.classList.add("is-open");
  lockScroll(true);
  window.requestAnimationFrame(() => {
    const first = $("#enq-name", form);
    first?.focus({ preventScroll: true });
  });

  const close = () => closeEnquiry();
  dialog.onclick = (event) => {
    if (event.target === dialog || event.target.closest("[data-enquiry-close]")) close();
  };

  dialog.onkeydown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const items = focusable(dialog);
    if (items.length === 0) return;
    const firstItem = items[0];
    const lastItem = items[items.length - 1];
    if (event.shiftKey && document.activeElement === firstItem) {
      event.preventDefault();
      lastItem.focus();
    } else if (!event.shiftKey && document.activeElement === lastItem) {
      event.preventDefault();
      firstItem.focus();
    }
  };
}

export function closeEnquiry() {
  const dialog = document.getElementById("enquiry-dialog");
  if (!dialog) return;
  dialog.classList.remove("is-open");
  lockScroll(false);
  if (lastFocus instanceof HTMLElement) lastFocus.focus({ preventScroll: true });
}

/**
 * Wire up every `[data-enquiry]` trigger inside `scope`.
 * @param {HTMLElement} scope
 * @param {() => object} getContext supplies the property/agent for this page
 */
export function bindEnquiryTriggers(scope, getContext = () => ({})) {
  scope.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-enquiry]");
    if (!trigger) return;
    event.preventDefault();
    openEnquiry({
      mode: trigger.dataset.enquiryMode === "viewing" ? "viewing" : "contact",
      ...getContext(),
    });
  });
}
