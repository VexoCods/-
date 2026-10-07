/** Team page. */

import { TEAM } from "../data/team.js";
import { teamCard } from "./home.js";
import { $ } from "../lib/dom.js";

export function initTeam() {
  const host = $("[data-team-grid]");
  if (host) host.innerHTML = TEAM.map(teamCard).join("");
}
