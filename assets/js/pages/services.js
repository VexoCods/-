/** Services page: full service entries, the process, and FAQs. */

import { FAQS, PROCESS, SERVICES } from "../data/team.js";
import { icon } from "../components/icons.js";
import { $, escapeHtml } from "../lib/dom.js";

export function initServices() {
  const host = $("[data-services-detail]");
  if (host) {
    host.innerHTML = SERVICES.map(
      (service) => `
        <article class="detail-section" id="${service.id}">
          <div class="two-col">
            <div>
              <p class="label">${service.index}</p>
              <h2 class="detail-section__title" style="margin-top:.75rem">${escapeHtml(service.name)}</h2>
            </div>
            <div>
              <p class="lead" style="max-width:none">${escapeHtml(service.description)}</p>
              <ul class="feature-grid" style="margin-top:1.25rem">
                ${service.includes
                  .map((item) => `<li>${icon("check")}<span>${escapeHtml(item)}</span></li>`)
                  .join("")}
              </ul>
              <a class="link-arrow" href="contact.html" style="margin-top:1.5rem">
                Discuss ${escapeHtml(service.name.toLowerCase())} ${icon("arrowRight")}
              </a>
            </div>
          </div>
        </article>`,
    ).join("");
  }

  const processHost = $("[data-process]");
  if (processHost) {
    processHost.innerHTML = PROCESS.map(
      (step) => `
        <li class="feature-line">
          <span class="feature-line__index">${step.index}</span>
          <div>
            <h3 class="feature-line__title">${escapeHtml(step.title)}</h3>
            <p class="feature-line__text">${escapeHtml(step.text)}</p>
          </div>
        </li>`,
    ).join("");
  }

  const faqHost = $("[data-faqs]");
  if (faqHost) {
    faqHost.innerHTML = FAQS.map(
      (faq) => `
        <details class="faq">
          <summary class="faq__question">
            <span>${escapeHtml(faq.q)}</span>
            ${icon("chevronDown", { className: "faq__chevron" })}
          </summary>
          <p class="faq__answer">${escapeHtml(faq.a)}</p>
        </details>`,
    ).join("");
  }
}
