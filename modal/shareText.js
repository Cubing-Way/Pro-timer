// Text for sharing an average or a solve, and sending it to a phone's share sheet or the clipboard (modal/modalController.js uses it)
import { getNeededSolves } from "../average/avgController.js";
import { formatStatValue } from "../render/renderController.js";
import { getCurrentSession } from "../session/sessionController.js";
import { getEventName } from "../scramble/scrambleController.js";

// HTML as plain text: tags dropped, entities like &sigma; turned into their character, line breaks and indents into single spaces
function htmlToText(html) {
    // DOMParser builds an inert document, so nothing in the HTML runs or loads
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent.replace(/\s+/g, " ").trim();
}

// Date and time without seconds or time zone, in the browser's language ("01/11/2026, 09:22"); "-" for old solves without one
function shortDate(ms) {
    if (ms == null) return "-";
    // 2-digit day, month, hour and minute, full year
    return new Date(ms).toLocaleString(undefined, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

// Indexes of the solves a finished ao average drops (best and worst 5%, rounded up, like computeAverage: 1 each for ao5), shown in parentheses
function droppedIndexes(solves, mode) {
    // Only ao averages drop solves, and only once they're full (classic, mo3, bo3, bo5 and FMC's ao3 drop none)
    if (!mode.startsWith("ao") || solves.length < getNeededSolves(mode)) return new Set();

    // How many to drop on each side
    const trimCount = Math.ceil(solves.length * 0.05);
    // Each solve's final value: time plus penalty, Infinity for a DNF
    const values = solves.map(s => {
        if (s.penalty === "DNF") return Infinity;
        if (typeof s.penalty === "number") return s.time + s.penalty;
        return s.time;
    });
    // Solve indexes from fastest to slowest (two DNFs give NaN, counted as a tie)
    const order = solves.map((s, i) => i).sort((a, b) => (values[a] - values[b]) || 0);
    // The fastest and the slowest ones
    return new Set([...order.slice(0, trimCount), ...order.slice(-trimCount)]);
}

// First line of a share: the app and the solve's event ("Pro Timer · 3x3x3"); solves saved before solves had an event use the session's
function introLine(s) {
    return `Pro Timer · ${getEventName(s?.event ?? getCurrentSession().scrambleType)}`;
}

// A solve's lines: firstLine (its number and time), then every detail the modal shows
function solveLines(s, firstLine) {
    const lines = [
        firstLine,
        `Scramble: ${s.scramble}`,
        `Inspection: ${s.inspection}`,
        `Date: ${shortDate(s.createdAt)}`
    ];
    // Only for solves that have them, like the modal
    if (s.doneAt) lines.push(`Done at: ${s.doneAt}`);
    if (s.doneWith) lines.push(`With: ${s.doneWith}`);
    // A solution checked on Cubisz, with its result
    if (s.solution) {
        lines.push(`Solution: ${s.solution}`);
        lines.push(`Status: ${s.status || "-"} | Moves: ${s.moves || "-"} | TPS: ${s.tps ? s.tps.toFixed(2) : "-"}`);
    }
    return lines.join("\n");
}

// An average as text: intro, the card's header and stats (HTML, as the modal shows them), then each solve with all its details
function averageShareText(titleHtml, statsHtml, solves, mode) {
    const dropped = droppedIndexes(solves, mode);
    // Intro, header and stats on their own lines (classic's card has no stats)
    const header = [introLine(solves[0]), htmlToText(titleHtml), htmlToText(statsHtml)].filter(Boolean).join("\n");
    // Numbered like the modal, dropped times in parentheses
    const solveTexts = solves.map((s, i) => {
        const time = htmlToText(formatStatValue(s));
        return solveLines(s, `${i + 1}. ${dropped.has(i) ? `(${time})` : time}`);
    });
    // A blank line between the header and each solve
    return [header, ...solveTexts].join("\n\n");
}

// One solve as text: intro, then its time and every detail
function solveShareText(s) {
    return solveLines(s, `${introLine(s)}\n${htmlToText(formatStatValue(s))}`);
}

// Copies text; true when it worked
async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // No navigator.clipboard outside https and localhost (like the dev server opened from a phone): the old copy command still works there
        const box = document.createElement("textarea");
        box.value = text;
        // Fixed and invisible, so adding it doesn't scroll or flash the page
        box.style.position = "fixed";
        box.style.opacity = "0";
        document.body.appendChild(box);
        box.select();
        const copied = document.execCommand("copy");
        box.remove();
        return copied;
    }
}

// Phones and tablets open the share sheet (WhatsApp, Discord…), computers copy; returns "shared", "copied", "cancelled" or "failed"
async function shareOrCopy(text) {
    // A finger as the main pointer means a phone or tablet (a touch-screen laptop's main pointer is still the mouse)
    const isTouchDevice = matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice && navigator.share) {
        try {
            await navigator.share({ text });
            return "shared";
        } catch (err) {
            // Closing the share sheet isn't a failure
            if (err.name === "AbortError") return "cancelled";
            // Any other error falls back to copying
        }
    }
    return (await copyText(text)) ? "copied" : "failed";
}

export { shortDate, droppedIndexes, averageShareText, solveShareText, shareOrCopy };
