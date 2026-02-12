function bindVisibilityToggle(selectId, targetClass) {
    const select = document.getElementById(selectId);
    const targets = document.querySelectorAll(`.${targetClass}`);

    if (!select || targets.length === 0) return;

    const storageKey = `visibility-${selectId}`;

    // 1️⃣ Restore saved value (if exists)
    const savedValue = localStorage.getItem(storageKey);
    if (savedValue) {
        select.value = savedValue;
    }

    function apply() {
        const isShown = select.value === "show";

        targets.forEach(el => {
            el.style.display = isShown ? "" : "none";
        });

        // 2️⃣ Save current value
        localStorage.setItem(storageKey, select.value);
    }

    select.addEventListener("change", apply);

    // 3️⃣ Run once on load AFTER restoring value
    apply();
}


bindVisibilityToggle("toggle-scramble-visualizer", "panel-cube");
bindVisibilityToggle("toggle-statistics", "right-sidebar");
bindVisibilityToggle("toggle-session-history", "left-sidebar");
bindVisibilityToggle("toggle-scramble-text", "scramble-container");
bindVisibilityToggle("toggle-penalty-bar", "penalty-bar");
bindVisibilityToggle("toggle-average-preview", "main-footer");