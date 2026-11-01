// Makes an on/off switch (a checkbox) show or hide every element with targetClass, and remembers the choice
function bindVisibilityToggle(checkboxId, targetClass) {
    const checkbox = document.getElementById(checkboxId);
    const targets = document.querySelectorAll(`.${targetClass}`);

    if (!checkbox || targets.length === 0) return;

    // One localStorage key per switch
    const storageKey = `visibility-${checkboxId}`;

    // Restore the saved choice, if any; it's saved as "show" or "hide", like when these were selects, so old choices still load
    const savedValue = localStorage.getItem(storageKey);
    if (savedValue) {
        checkbox.checked = savedValue === "show";
    }

    // Show or hide the targets to match the switch, and save the choice
    function apply() {
        const isShown = checkbox.checked;

        // "" removes the inline style, so the CSS decides how it shows
        targets.forEach(el => {
            el.style.display = isShown ? "" : "none";
        });

        localStorage.setItem(storageKey, isShown ? "show" : "hide");
    }

    checkbox.addEventListener("change", () => {
        apply();
        // Take the focus off the switch, so the space bar starts the timer instead of flipping it again
        checkbox.blur();
    });

    // Apply the restored choice right away
    apply();
}

export { bindVisibilityToggle };
