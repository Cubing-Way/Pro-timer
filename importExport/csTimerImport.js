// Reading csTimer's "Export to file": its sessions and solves in Pro Timer's shape
import { parseJSON } from "./importSolves.js";
import { formatTime } from "../timer/timerController.js";
import { getCategoryOfEvent } from "../scramble/scrambleController.js";

// csTimer events that Pro Timer saves as moves or points; csTimer has clock times there, so they import as 3x3
const CLOCK_TIME_ONLY = ["333fm", "r3ni"];

// csTimer saves some values as JSON text inside the JSON: parse those, keep the rest as they are
function unwrapJSON(value) {
    return typeof value === "string" ? parseJSON(value) : value;
}

// csTimer's scramble type as a Pro Timer event: "333" when it's missing, FM / Multi-Blind, or not in Pro Timer's list
function proTimerEvent(scrType) {
    if (!scrType || CLOCK_TIME_ONLY.includes(scrType) || !getCategoryOfEvent(scrType)) return "333";
    return scrType;
}

// Each phase's time as the timer saves it ("12.34"); times is csTimer's [total, end of phase n-1, …, end of phase 1]
function csTimerPhases(times) {
    // When each phase ended, first phase first (the last phase ends at the total)
    const ends = [...times].reverse();
    // A phase runs from the end of the one before it (0 for the first) to its own end
    return ends.map((end, i) => formatTime(end - (i === 0 ? 0 : ends[i - 1])));
}

// One csTimer solve, [[penalty, ms, …splits], scramble, comment, unixSeconds], as a Pro Timer solve
function convertCsTimerSolve(record, event) {
    // The penalty and times, the scramble, (the comment, skipped) and the date
    const [[penalty, ...times], scramble, , unixSeconds] = record;
    return {
        time: Math.floor(times[0] / 10) / 100,                                // seconds cut to hundredths, like the timer
        penalty: penalty === -1 ? "DNF" : penalty > 0 ? penalty / 1000 : null, // -1 is DNF, 2000 is +2 (ms added)
        scramble: scramble || "",
        event,
        inspection: 0,                                                        // csTimer doesn't save it, like typed times
        createdAt: unixSeconds * 1000,                                        // csTimer saves seconds, Pro Timer ms
        solution: null,
        solvePhases: csTimerPhases(times)
    };
}

// The sessions of a csTimer file as [{ name, event, solves }]; sessions with no solves are left out
function readCsTimerFile(data) {
    // Each session's name and options, by session number ({ "1": { name, opt: { scrType } }, … })
    const sessionData = unwrapJSON(data.properties?.sessionData) || {};

    return Object.keys(data)
        // Only the "session1", "session2"… keys hold solves
        .filter(key => /^session\d+$/.test(key))
        .map(key => {
            // "session3" → "3", its key in sessionData
            const number = key.slice("session".length);
            const info = sessionData[number] || {};
            const event = proTimerEvent(info.opt?.scrType);
            // A list of solves, or the same list as JSON text
            const records = unwrapJSON(data[key]);
            return {
                name: String(info.name ?? number),  // a session never renamed is named by its number
                event,
                solves: (Array.isArray(records) ? records : [])
                    // Skip anything that isn't a solve record (a damaged file)
                    .filter(record => Array.isArray(record) && Array.isArray(record[0]))
                    .map(record => convertCsTimerSolve(record, event))
            };
        })
        // csTimer always has a session1, even an empty one
        .filter(session => session.solves.length > 0);
}

export { readCsTimerFile, convertCsTimerSolve, csTimerPhases };