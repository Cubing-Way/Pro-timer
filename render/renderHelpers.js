import { formatDisplayTime, formatSecondsToTime } from "../average/avgController.js";

// Wraps a value in a span drawn in the "Main text" color (.times-color-number)
function wrapTimesValue(value) {
    return `<span class="times-color-number">${value}</span>`;
}

// A solve or a number as display HTML: "-", "DNF", points, moves, or a time with its penalty and phases
function formatStatValue(value, getCurrentSession) {
    // Nothing yet
    if (value === undefined || value === null) return wrapTimesValue("-");
    // Infinity is how averages count a DNF
    if (value === Infinity || value === -Infinity || value === "DNF" || value.penalty === "DNF") return wrapTimesValue("DNF");

    // A solve shows as its own event (FMC moves, MBLD points); older solves without one use the session's event
    const solveEvent = value.event ?? getCurrentSession().scrambleType;

    // Multi-Blind solve: its result and points
    if (value.time && solveEvent === "r3ni") return wrapTimesValue(`${value.result} (${value.time} pts)`);

    // Fewest Moves solve: its move count
    if (value.time && solveEvent === "333fm") return wrapTimesValue(`${value.time} moves`);

    // A plain number in a Multi-Blind session is points
    if (getCurrentSession().scrambleType === "r3ni") {
        const num = Number(value);

        if (!Number.isFinite(num)) return wrapTimesValue("DNF");

        return wrapTimesValue(`${Number.isInteger(num) ? num : num.toFixed(2)} pts`);
    }

    // A plain number in a Fewest Moves session is moves
    if (getCurrentSession().scrambleType === "333fm") {
        const num = Number(value);

        if (!Number.isFinite(num)) return wrapTimesValue("DNF");

        return wrapTimesValue(`${num} moves`);
    }

    // Solve with timer phases: the time, then each phase's time when there's more than one
    if (value.time && value.solvePhases) {
        const base = formatDisplayTime(value);
        const phases = value.solvePhases.length > 1
            ? " | " + value.solvePhases
                .map((phase, index) => wrapTimesValue(index + 1) + ": " + phase)
                .join(" | ")
            : "";
        return wrapTimesValue(base) + phases;
    } else if (value.time) { // Solve without phases: just the time
        return wrapTimesValue(formatDisplayTime(value));
    }
    // A plain number of seconds
    return wrapTimesValue(formatSecondsToTime(value));
}

export { wrapTimesValue, formatStatValue };