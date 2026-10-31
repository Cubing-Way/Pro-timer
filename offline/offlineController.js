// Registers the service worker that vite-plugin-pwa writes at build time (dist/sw.js)
import { registerSW } from "virtual:pwa-register";

// The new version bar and its two buttons (offline/updateBanner.html)
const updateBanner = document.getElementById("updateBanner");
const updateReload = document.getElementById("updateReload");
const updateLater = document.getElementById("updateLater");

// Registers the service worker; updateSW() switches to a new version once one is waiting
const updateSW = registerSW({
  // A new version finished downloading: show the bar instead of reloading in the middle of a solve
  onNeedRefresh() {
    updateBanner.classList.add("open");
  },
});

// Reload: the waiting version takes over and the page reloads into it
updateReload.addEventListener("click", () => updateSW());

// Later: hide the bar; the new version starts once every tab of the app is closed
updateLater.addEventListener("click", () => updateBanner.classList.remove("open"));

// Ask the browser not to clear the saved solves and the cached app when the device runs low on space
navigator.storage?.persist?.();
