/** Homepage: featured carousel, services index, team preview. */

import { PROPERTIES } from "../data/properties.js";
import { SERVICES, STATS, TEAM, WHY_HORIZON } from "../data/team.js";
import { carouselMarkup, initCarousel } from "../components/carousel.js";
import { propertyCard } from "../components/property-card.js";
import { icon } from "../components/icons.js";
import { $, escapeHtml } from "../lib/dom.js";

export function initHome() {
  /* --- featured properties carousel -------------------------------------- */

  const carouselHost = $("[data-featured-carousel]");
  if (carouselHost) {
    const featured = PROPERTIES.filter((property) => property.featured);

    carouselHost.innerHTML = carouselMarkup({
      id: "featured-properties",
      label: "featured properties",
      bleed: true,
      slideWidth: "clamp(272px, 30vw, 424px)",
      slides: featured.map((property) => propertyCard(property)),
    });

    initCarousel($("[data-carousel]", carouselHost));
  }

  /* --- services index ----------------------------------------------------- */

  const servicesHost = $("[data-services-list]");
  if (servicesHost) {
    servicesHost.innerHTML = SERVICES.map(
      (service) => `
        <li>
          <a class="service-row" href="services.html#${service.id}">
            <span class="service-row__index">${service.index}</span>
            <span class="service-row__name">${escapeHtml(service.name)}</span>
            <span class="service-row__desc">${escapeHtml(service.short)}</span>
          </a>
        </li>`,
    ).join("");
  }

  /* --- why choose Horizon ------------------------------------------------- */

  const whyHost = $("[data-why-list]");
  if (whyHost) {
    whyHost.innerHTML = WHY_HORIZON.map(
      (item) => `
        <li class="feature-line">
          <span class="feature-line__index">${item.index}</span>
          <div>
            <h3 class="feature-line__title">${escapeHtml(item.title)}</h3>
            <p class="feature-line__text">${escapeHtml(item.text)}</p>
          </div>
        </li>`,
    ).join("");
  }

  /* --- team preview ------------------------------------------------------- */

  const teamHost = $("[data-team-preview]");
  if (teamHost) {
    teamHost.innerHTML = TEAM.map(teamCard).join("");
  }

  /* --- stats -------------------------------------------------------------- */

  const statsHost = $("[data-stats]");
  if (statsHost) {
    statsHost.innerHTML = STATS.map(
      (stat) => `
        <div class="stat">
          <span class="stat__value">${escapeHtml(stat.value)}</span>
          <span class="stat__label">${escapeHtml(stat.label)}</span>
        </div>`,
    ).join("");
  }
}

export function teamCard(member) {
  return `
    <article class="team-card">
      <div class="team-card__media">
        <img src="${member.photo}" alt="Portrait of ${escapeHtml(member.name)}, ${escapeHtml(member.role)}" width="800" height="1000" loading="lazy" decoding="async">
        <div class="team-card__socials">
          <a href="mailto:${member.email}" aria-label="Email ${escapeHtml(member.name)}">${icon("mail")}</a>
          <a href="${member.linkedin}" target="_blank" rel="noreferrer" aria-label="${escapeHtml(member.name)} on LinkedIn">${icon("linkedin")}</a>
          <a href="tel:${member.phone.replace(/[^\d+]/g, "")}" aria-label="Call ${escapeHtml(member.name)}">${icon("phone")}</a>
        </div>
      </div>
      <div>
        <h3 class="team-card__name">${escapeHtml(member.name)}</h3>
        <p class="team-card__role">${escapeHtml(member.role)}</p>
      </div>
      <p class="team-card__bio">${escapeHtml(member.bio)}</p>
    </article>
  `;
}
