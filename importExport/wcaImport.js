// Reading a competitor's official results from the WCA website: one session per event, one average per round
import { importedSolve } from "./importSolves.js";

// The WCA's public API (no sign-in needed; it answers pages on other sites too)
const WCA_API = "https://www.worldcubeassociation.org/api/v0";

// A WCA ID: the year of the first competition, 4 letters of the name, then 2 digits ("2009ZEMD01")
const WCA_ID = /^\d{4}[A-Z]{4}\d{2}$/;

// Each WCA event as [WCA id, Pro Timer event, name], in the WCA's order; Magic, Master Magic and old Multi-Blind aren't in Pro Timer, so they're left out
const WCA_EVENTS = [
    ["333", "333", "3x3x3"],
    ["222", "222so", "2x2x2"],
    ["444", "444wca", "4x4x4"],
    ["555", "555wca", "5x5x5"],
    ["666", "666wca", "6x6x6"],
    ["777", "777wca", "7x7x7"],
    ["333bf", "333ni", "3x3 Blindfolded"],
    ["333fm", "333fm", "Fewest Moves"],
    ["333oh", "333oh", "3x3 One-Handed"],
    ["clock", "clkwca", "Clock"],
    ["minx", "mgmp", "Megaminx"],
    ["pyram", "pyrso", "Pyraminx"],
    ["skewb", "skbso", "Skewb"],
    ["sq1", "sqrs", "Square-1"],
    ["444bf", "444bld", "4x4 Blindfolded"],
    ["555bf", "555bld", "5x5 Blindfolded"],
    ["333mbf", "r3ni", "Multi-Blind"],
    ["333ft", "333ft", "3x3 With Feet"]
];

// Round types in the order they're held: qualification, first, second, semi final, B final, final (a combined round sits next to its plain one)
const ROUND_ORDER = ["0", "h", "1", "d", "2", "e", "3", "g", "b", "c", "f"];

// Time steps used to make up when each attempt was done
const SECOND = 1000;
const MINUTE = 60 * SECOND;

// The WCA ID as typed, cleaned up ("2009zemd01 " → "2009ZEMD01"), or null when it isn't one
function cleanWcaId(text) {
    const id = text.trim().toUpperCase();
    return WCA_ID.test(id) ? id : null;
}

// One part of a competitor's data from the API; throws an Error with a message for the user
async function fetchPersonData(wcaId, part) {
    let response;
    try {
        response = await fetch(`${WCA_API}/persons/${wcaId}/${part}`);
    } catch {
        // fetch only throws when the request never got an answer (offline, blocked)
        throw new Error("Couldn't reach the WCA website. Check your internet connection and try again.");
    }
    if (response.status === 404) throw new Error(`There's no WCA competitor with the ID ${wcaId}.`);
    if (!response.ok) throw new Error(`The WCA website answered with an error (${response.status}). Try again later.`);
    return response.json();
}

// A competitor's results (one per round they competed in) and competitions (for the dates), fetched together
async function fetchWcaPerson(wcaId) {
    const [results, competitions] = await Promise.all([
        fetchPersonData(wcaId, "results"),
        fetchPersonData(wcaId, "competitions")
    ]);
    return { results, competitions };
}

// WCA's Multi-Blind number 0DDTTTTTMM: DD is 99 minus the points and MM the cubes missed (TTTTT, the seconds, isn't kept)
function decodeMultiBlind(value) {
    const points = 99 - Math.floor(value / 10000000) % 100;
    const missed = value % 100;
    const solved = points + missed;
    return { points, result: `${solved} / ${solved + missed}` };
}

// One attempt as a Pro Timer solve; value is centiseconds, moves for FMC or WCA's Multi-Blind number, -1 DNF and -2 DNS; doneAt is the competition's name
function convertWcaAttempt(value, wcaEvent, event, createdAt, doneAt) {
    // A DNS counts as a DNF, like in WCA averages; WCA doesn't keep the time of either
    if (value < 0) {
        return importedSolve({ time: 0, penalty: "DNF", event, createdAt, doneAt, result: wcaEvent === "333mbf" ? "DNF" : null });
    }

    // Multi-Blind: points, and DNF under 1 point like Pro Timer's own Multi-Blind
    if (wcaEvent === "333mbf") {
        const { points, result } = decodeMultiBlind(value);
        return importedSolve({ time: points, penalty: points <= 0 ? "DNF" : null, event, createdAt, doneAt, result });
    }

    // FMC saves moves as they are; every other event saves centiseconds
    return importedSolve({ time: wcaEvent === "333fm" ? value : value / 100, event, createdAt, doneAt });
}

// The Pro Timer average a round fills, or null when it has no full one (a missed cutoff, a best of 1 or 2, a new format)
function roundMode(formatId, attemptCount) {
    if (formatId === "a" && attemptCount === 5) return "ao5";
    if (formatId === "m" && attemptCount === 3) return "mo3";   // also FMC: the WCA mean, where one DNF makes it DNF
    if (formatId === "3" && attemptCount === 3) return "bo3";
    if (formatId === "5" && attemptCount === 5) return "bo5";
    return null;
}

// When an attempt counts as done: the WCA keeps no times of day, so it's the competition's first day at 8:00, then 20 minutes per event, a minute per round and a second per attempt (no two attempts share a date)
function attemptDate(startDate, eventIndex, roundType, attemptIndex) {
    // "2009-07-18T08:00:00", without a time zone, is 8:00 local time
    const day = new Date(`${startDate}T08:00:00`).getTime();
    return day + eventIndex * 20 * MINUTE + Math.max(0, ROUND_ORDER.indexOf(roundType)) * MINUTE + attemptIndex * SECOND;
}

// The competitor's results as [{ name, event, rounds: [{ mode, solves }] }], one entry per event, in the WCA's order
function readWcaResults(results, competitions) {
    // Each competition's first day ("2009-07-18"), by its id
    const startDates = new Map(competitions.map(c => [c.id, c.start_date]));
    // Each competition's short name ("New Zealand Champs 2009"), the solves' "done at", by its id
    const names = new Map(competitions.map(c => [c.id, c.short_name || c.name]));

    return WCA_EVENTS
        .map(([wcaEvent, event, name], eventIndex) => {
            const rounds = results
                .filter(result => result.event_id === wcaEvent)
                .map(result => {
                    // 0 is an attempt not done (after a missed cutoff), so it isn't a solve
                    const attempts = result.attempts.filter(value => value !== 0);
                    // A competition missing from the list (shouldn't happen) counts as today
                    const startDate = startDates.get(result.competition_id) ?? new Date().toISOString().slice(0, 10);
                    // Its name, else its id ("NewZealandChamps2009")
                    const competition = names.get(result.competition_id) ?? result.competition_id;
                    return {
                        mode: roundMode(result.format_id, attempts.length),
                        solves: attempts.map((value, i) =>
                            convertWcaAttempt(value, wcaEvent, event, attemptDate(startDate, eventIndex, result.round_type_id, i), competition))
                    };
                });
            return { name: `WCA ${name}`, event, rounds };
        })
        // Events the competitor never did
        .filter(({ rounds }) => rounds.length > 0);
}

export { WCA_EVENTS, cleanWcaId, fetchWcaPerson, readWcaResults, convertWcaAttempt, decodeMultiBlind, roundMode };
