import { wrapTimesValue } from "./renderHelpers.js";

// HTML of a right sidebar panel ("All time" or "Today"): best single, best average, mean, σ and solve count
function renderStats(stats, formatStatValue) {
    return `
        Best single: ${stats.bestTime !== Infinity ? formatStatValue(stats.bestTime) : wrapTimesValue("-")}
        <br>
        Best avg: ${stats.bestAvg !== Infinity ? formatStatValue(stats.bestAvg) : wrapTimesValue("-")}
        <br>
        Session Mean: ${stats.mean ? formatStatValue(stats.mean) : wrapTimesValue("-")}
        <br>
        Session &sigma;: ${stats.sigma ? formatStatValue(stats.sigma) : wrapTimesValue("-")}
        <br>
        Solves: ${stats.solveCounter ? wrapTimesValue(stats.solveCounter) : wrapTimesValue("-")}
    `;
}

export { renderStats };