/** About page: stats, principles and the team preview. */

import { STATS, TEAM, VALUES } from "../data/team.js";
import { teamCard } from "./home.js";
import { $, escapeHtml } from "../lib/dom.js";

export function initAbout() {
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

  const valuesHost = $("[data-values]");
  if (valuesHost) {
    valuesHost.innerHTML = VALUES.map(
      (value) => `
        <li class="feature-line">
          <span class="feature-line__index">${value.index}</span>
          <div>
            <h3 class="feature-line__title">${escapeHtml(value.title)}</h3>
            <p class="feature-line__text">${escapeHtml(value.text)}</p>
          </div>
        </li>`,
    ).join("");
  }

  const teamHost = $("[data-team-grid]");
  if (teamHost) teamHost.innerHTML = TEAM.map(teamCard).join("");
}
