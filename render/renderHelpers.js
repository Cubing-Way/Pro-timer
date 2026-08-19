function wrapTimesValue(value) {
    return `<span class="times-color-number">${value}</span>`;
}

function formatStatValue(value, getCurrentSession) {
    if (value === undefined || value === null) return wrapTimesValue("-");
    if (value === Infinity || value === -Infinity || value === "DNF" || value.penalty === "DNF") return wrapTimesValue("DNF");

    if (value.time && getCurrentSession().scrambleType === "r3ni") return wrapTimesValue(`${value.result} (${value.time} pts)`);

    if (value.time && getCurrentSession().scrambleType === "333fm") return wrapTimesValue(`${value.time} moves`);

    if (getCurrentSession().scrambleType === "r3ni") {
        const num = Number(value);

        if (!Number.isFinite(num)) return wrapTimesValue("DNF");

        return wrapTimesValue(`${Number.isInteger(num) ? num : num.toFixed(2)} pts`);
    }

    if (getCurrentSession().scrambleType === "333fm") {
        const num = Number(value);

        if (!Number.isFinite(num)) return wrapTimesValue("DNF");

        return wrapTimesValue(`${num} moves`);
    }

    if (value.time && value.solvePhases) {
        const base = formatDisplayTime(value);
        const phases = value.solvePhases.length > 1
            ? " | " + value.solvePhases
                .map((phase, index) => wrapTimesValue(index + 1) + ": " + phase)
                .join(" | ")
            : "";
        return wrapTimesValue(base) + phases;
    } else if (value.time) {
        return wrapTimesValue(formatDisplayTime(value));
    }
    return wrapTimesValue(formatSecondsToTime(value));
}

export { wrapTimesValue, formatStatValue };