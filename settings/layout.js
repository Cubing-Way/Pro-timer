// Makes a Display/None select show or hide every element with targetClass, and remembers the choice
function bindVisibilityToggle(selectId, targetClass) {
    const select = document.getElementById(selectId);
    const targets = document.querySelectorAll(`.${targetClass}`);

    if (!select || targets.length === 0) return;

    // One localStorage key per select
    const storageKey = `visibility-${selectId}`;

    // Restore the saved choice, if any
    const savedValue = localStorage.getItem(storageKey);
    if (savedValue) {
        select.value = savedValue;
    }

    // Show or hide the targets to match the select, and save the choice
    function apply() {
        const isShown = select.value === "show";

        // "" removes the inline style, so the CSS decides how it shows
        targets.forEach(el => {
            el.style.display = isShown ? "" : "none";
        });

        localStorage.setItem(storageKey, select.value);
    }

    select.addEventListener("change", apply);

    // Apply the restored choice right away
    apply();
}

export { bindVisibilityToggle };