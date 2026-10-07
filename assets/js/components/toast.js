/** Small confirmation toast, reused by every form on the site. */

import { icon } from "./icons.js";

let element = null;
let timer = null;

function ensure() {
  if (element) return element;
  element = document.createElement("div");
  element.className = "toast";
  element.setAttribute("role", "status");
  element.setAttribute("aria-live", "polite");
  document.body.appendChild(element);
  return element;
}

export function showToast(message, iconName = "check") {
  const node = ensure();
  node.innerHTML = `${icon(iconName)}<span></span>`;
  node.querySelector("span").textContent = message;
  node.classList.add("is-visible");
  window.clearTimeout(timer);
  timer = window.setTimeout(() => node.classList.remove("is-visible"), 3600);
}
