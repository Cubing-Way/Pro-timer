const overlay = document.getElementById("settingsOverlay");
const openBtn = document.getElementById("settingsBtn");
const closeBtn = document.getElementById("closeSettings");

openBtn.addEventListener("click", () => {
    overlay.classList.add("open");
});

closeBtn.addEventListener("click", () => {
    overlay.classList.remove("open");
});