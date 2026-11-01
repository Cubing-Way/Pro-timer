import { formatSecondsToTime } from "../average/avgController.js";

// A solve's time in seconds with its +2s added, or null when it can't be compared (no time, DNF, moves, points)
function comparableSeconds(solve) {
    if (solve.time == null || solve.penalty === "DNF") return null;
    // Fewest Moves and Multi-Blind solves are moves / points, not a time
    if (solve.event === "333fm" || solve.event === "r3ni") return null;
    return solve.time + (typeof solve.penalty === "number" ? solve.penalty : 0);
}

// HTML of the text beside the timer: how much slower ("+0.52", red) or faster ("-1.20", green) the last solve was than the previous one
function renderTimeDiff([previous, last]) {
    // Fewer than two solves: nothing to compare
    if (!previous || !last) return "";

    const prevSeconds = comparableSeconds(previous);
    const lastSeconds = comparableSeconds(last);
    if (prevSeconds === null || lastSeconds === null) return "";

    // Rounded to hundredths, so float leftovers like 0.00000001 don't count as slower
    const diff = Math.round((lastSeconds - prevSeconds) * 100) / 100;

    // Same time: no sign, no color
    if (diff === 0) return `<span class="time-diff-same">${formatSecondsToTime(0)}</span>`;

    // Slower is "+" in red, faster is "-" in green
    const sign = diff > 0 ? "+" : "-";
    const cssClass = diff > 0 ? "time-diff-slower" : "time-diff-faster";
    return `<span class="${cssClass}">${sign}${formatSecondsToTime(Math.abs(diff))}</span>`;
}

export { renderTimeDiff };
