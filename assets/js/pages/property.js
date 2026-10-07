/** Property detail page: gallery, specification, agent panel and similar houses. */

import { PROPERTIES, getProperty, resolveGallery, similarProperties } from "../data/properties.js";
import { getAgent } from "../data/team.js";
import { mountGallery } from "../components/gallery.js";
import { carouselMarkup, initCarousel } from "../components/carousel.js";
import { propertyCard } from "../components/property-card.js";
import { icon } from "../components/icons.js";
import { $, escapeHtml } from "../lib/dom.js";
import { priceShort, usd, count, beds, baths } from "../lib/format.js";
import { saved } from "../lib/store.js";
import { showToast } from "../components/toast.js";
import { openEnquiry } from "../components/enquiry-dialog.js";

export function initProperty() {
  const id = new URLSearchParams(window.location.search).get("id");
  const property = id ? getProperty(id) : null;

  if (!property) {
    renderNotFound();
    return;
  }

  const agent = getAgent(property.agentId);
  const images = resolveGallery(property);

  document.title = `${property.name} — ${property.location} | Horizon Properties`;

  /* --- head --------------------------------------------------------------- */

  const head = $("[data-detail-head]");
  const isSaved = saved.has(property.id);

  head.innerHTML = `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="index.html">Home</a><span>/</span>
      <a href="properties.html">Properties</a><span>/</span>
      <span aria-current="page">${escapeHtml(property.name)}</span>
    </nav>

    <div class="detail-head">
      <div>
        <p class="label">${escapeHtml(property.type)} · ${escapeHtml(property.status)}</p>
        <h1 class="detail-head__title">${escapeHtml(property.name)}</h1>
        <div class="detail-head__meta">
          <span class="card__location">${icon("mapPin")}${escapeHtml(property.location)}</span>
          <span class="pill">${icon("bed")}${escapeHtml(beds(property.bedrooms))}</span>
          <span class="pill">${icon("bath")}${escapeHtml(baths(property.bathrooms))}</span>
          <span class="pill">${icon("area")}${count(property.area)} sq ft</span>
        </div>
      </div>
      <div class="detail-head__price">
        <span>Guide price</span>
        <strong>${priceShort(property.price)}</strong>
        <div class="detail-head__actions">
          <button
            class="icon-btn"
            type="button"
            data-saved-toggle="${property.id}"
            aria-pressed="${isSaved}"
            aria-label="${isSaved ? "Remove from saved" : "Save"} ${escapeHtml(property.name)}"
          >${icon("heart")}</button>
          <button class="icon-btn" type="button" data-share aria-label="Share this property">${icon("arrowUpRight")}</button>
        </div>
      </div>
    </div>
  `;

  $("[data-share]", head).addEventListener("click", async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: property.name, text: property.tagline, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard");
    } catch {
      showToast("Copy the address bar to share", "arrowUpRight");
    }
  });

  /* --- gallery ------------------------------------------------------------ */

  mountGallery($("[data-detail-gallery]"), { images, title: property.name });

  /* --- content ------------------------------------------------------------ */

  $("[data-detail-content]").innerHTML = `
    <section class="detail-section">
      <h2 class="detail-section__title">About this property</h2>
      <p class="quote">${escapeHtml(property.tagline)}</p>
      <div class="prose" style="margin-top:1rem">
        ${property.description.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
      </div>
    </section>

    <section class="detail-section">
      <div class="key-specs">
        <div class="key-spec"><span class="key-spec__value">${property.bedrooms}</span><span class="key-spec__label">Bedrooms</span></div>
        <div class="key-spec"><span class="key-spec__value">${property.bathrooms}</span><span class="key-spec__label">Bathrooms</span></div>
        <div class="key-spec"><span class="key-spec__value">${count(property.area)}</span><span class="key-spec__label">Sq ft</span></div>
        <div class="key-spec"><span class="key-spec__value">${property.year}</span><span class="key-spec__label">Built</span></div>
      </div>
    </section>

    <section class="detail-section">
      <h2 class="detail-section__title">Key features</h2>
      <ul class="feature-grid">
        ${property.features.map((feature) => `<li>${icon("check")}<span>${escapeHtml(feature)}</span></li>`).join("")}
      </ul>
    </section>

    <section class="detail-section">
      <h2 class="detail-section__title">Amenities</h2>
      <ul class="chip-list">
        ${property.amenities.map((amenity) => `<li class="pill">${escapeHtml(amenity)}</li>`).join("")}
      </ul>
    </section>
  `;

  /* --- aside -------------------------------------------------------------- */

  $("[data-detail-aside]").innerHTML = `
    <div class="agent-card">
      <p class="label">Listing advisor</p>
      <div class="agent-card__head">
        <span class="agent-card__avatar">
          <img src="${agent.photo}" alt="Portrait of ${escapeHtml(agent.name)}" width="800" height="1000" loading="lazy" decoding="async">
        </span>
        <div>
          <p class="agent-card__name">${escapeHtml(agent.name)}</p>
          <p class="agent-card__role">${escapeHtml(agent.role)}</p>
        </div>
      </div>
      <div class="agent-card__contact">
        <a href="${agent.phone.replace(/[^\d+]/g, "") ? `tel:${agent.phone.replace(/[^\d+]/g, "")}` : "#"}">${icon("phone")} ${escapeHtml(agent.phone)}</a>
        <a href="mailto:${agent.email}">${icon("mail")} ${escapeHtml(agent.email)}</a>
      </div>
      <div class="agent-card__actions">
        <button class="btn btn--block" type="button" data-enquiry data-enquiry-mode="viewing">
          <span>Schedule a viewing</span>${icon("arrowRight", { className: "btn__icon" })}
        </button>
        <button class="btn btn--outline btn--block" type="button" data-enquiry>
          <span>Contact agent</span>
        </button>
      </div>
    </div>

    <div class="agent-card">
      <p class="label">Specification</p>
      <dl class="facts">
        <div class="facts__row"><dt>Reference</dt><dd>HP-${property.id.slice(0, 3).toUpperCase()}${property.year}</dd></div>
        <div class="facts__row"><dt>Property type</dt><dd>${escapeHtml(property.type)}</dd></div>
        <div class="facts__row"><dt>Guide price</dt><dd>${usd(property.price)}</dd></div>
        <div class="facts__row"><dt>Plot</dt><dd>${escapeHtml(property.lot)}</dd></div>
        <div class="facts__row"><dt>Year built</dt><dd>${property.year}</dd></div>
        <div class="facts__row"><dt>Location</dt><dd>${escapeHtml(property.city)}</dd></div>
      </dl>
    </div>
  `;

  /* --- similar properties ------------------------------------------------- */

  const similar = similarProperties(property, 6);
  const similarHost = $("[data-similar-carousel]");

  if (similarHost && similar.length > 0) {
    similarHost.innerHTML = carouselMarkup({
      id: "similar-properties",
      label: "similar properties",
      bleed: false,
      slideWidth: "clamp(260px, 28vw, 380px)",
      slides: similar.map((entry) => propertyCard(entry)),
    });
    initCarousel($("[data-carousel]", similarHost));
  } else {
    $("[data-similar-section]")?.setAttribute("hidden", "hidden");
  }

  /* --- mobile action bar -------------------------------------------------- */

  const bar = $("[data-mobile-cta]");
  if (bar) {
    bar.innerHTML = `
      <span class="mobile-cta__price">
        <strong>${priceShort(property.price)}</strong>
        <span>${escapeHtml(property.type)} · ${escapeHtml(property.city)}</span>
      </span>
      <button class="btn btn--outline btn--sm" type="button" data-saved-toggle="${property.id}" aria-pressed="${isSaved}" aria-label="Save ${escapeHtml(property.name)}">
        ${icon("heart")}<span>Save</span>
      </button>
      <button class="btn btn--sm" type="button" data-enquiry data-enquiry-mode="viewing">Viewing</button>
    `;
    document.body.classList.add("has-mobile-cta");

    const observer = new IntersectionObserver(
      ([entry]) => bar.classList.toggle("is-visible", !entry.isIntersecting),
      { rootMargin: "-120px 0px 0px 0px" },
    );
    observer.observe(head);
  }

  // Enquiry dialogs on this page always carry the property + its agent.
  document.addEventListener(
    "click",
    (event) => {
      const trigger = event.target.closest("[data-enquiry]");
      if (!trigger) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      openEnquiry({
        mode: trigger.dataset.enquiryMode === "viewing" ? "viewing" : "contact",
        property,
        agent,
      });
    },
    { capture: true },
  );
}

function renderNotFound() {
  const main = $("[data-detail-head]")?.closest("main") ?? document.querySelector("main");
  document.title = "Property not found | Horizon Properties";
  if (!main) return;

  main.innerHTML = `
    <div class="container">
      <div class="empty-state">
        <span class="empty-state__icon">${icon("home", { strokeWidth: 1.2 })}</span>
        <h1 class="h2">We could not find that property</h1>
        <p class="muted" style="max-width:34rem">
          The listing may have been withdrawn or the link may be incomplete. Browse the current portfolio below.
        </p>
        <a class="btn" href="properties.html">${icon("arrowRight", { className: "btn__icon" })}<span>Browse all ${PROPERTIES.length} properties</span></a>
      </div>
    </div>
  `;
}
