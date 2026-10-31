import { buildAverageBlock, getNeededSolves } from "../average/avgController.js";
// Reading an imported file: which app made it, and its sessions in Pro Timer's shape

// The file's text as an object, or null when it isn't JSON
function parseJSON(text) {
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

// Which app made a JSON file: "protimer", "cstimer", "wcif", "cubedesk", or null when it's none of them
function detectFormat(data) {
    // Not an object (a number, a list, null): no app exports that
    if (!data || typeof data !== "object" || Array.isArray(data)) return null;

    // Pro Timer's export has its tag and a sessions object
    if (data.app === "Pro Timer" && data.sessions && typeof data.sessions === "object") return "protimer";

    // csTimer's export has keys like "session1", "session2"…
    if (Object.keys(data).some(key => /^session\d+$/.test(key))) return "cstimer";

    // A competition's WCIF (WCA Live, the WCA website) has a format version, its competitors and its events
    if (typeof data.formatVersion === "string" && Array.isArray(data.persons) && Array.isArray(data.events)) return "wcif";

    // CubeDesk's export has a list of sessions and a list of solves (its old export kept them in timer.sessionMap)
    if ((Array.isArray(data.sessions) && Array.isArray(data.solves)) || data.timer?.sessionMap) return "cubedesk";

    return null;
}

// Which kind of text file it is, from its first line: "twistytimer", "cstimercsv", or "timelist" (anything else is read as a list of times)
function detectTextFormat(text) {
    // The header line, without the byte order mark some editors add at the start
    const firstLine = text.replace(/^﻿/, "").split(/\r?\n/, 1)[0].trim();

    // Twisty Timer's backup starts with its column names, separated by commas (its solve lines use ";")
    if (firstLine.startsWith("Puzzle,Category,Time(millis)")) return "twistytimer";

    // csTimer's "Export CSV" of a session starts with its column names, separated by ";"
    if (firstLine.startsWith("No.;Time;")) return "cstimercsv";

    return "timelist";
}

// The rows of a CSV text as lists of fields; quoted fields can hold the separator, newlines and doubled quotes ("")
function parseCsv(text, separator) {
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;    // inside "…", where separators and newlines are part of the field

    // Read character by character, since a quoted field can span lines
    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (quoted) {
            // "" is a quote inside the field; a lone " closes it
            if (char === '"' && text[i + 1] === '"') {
                field += '"';
                i++;
            } else if (char === '"') {
                quoted = false;
            } else {
                field += char;
            }
        } else if (char === '"') {
            quoted = true;
        } else if (char === separator) {
            row.push(field);
            field = "";
        } else if (char === "\n" || char === "\r") {
            // End of the row; the "\n" of "\r\n" then ends an empty row, which is skipped
            row.push(field);
            if (row.length > 1 || row[0] !== "") rows.push(row);
            row = [];
            field = "";
        } else {
            field += char;
        }
    }

    // The last row, when the text doesn't end with a newline
    row.push(field);
    if (row.length > 1 || row[0] !== "") rows.push(row);
    return rows;
}

// Milliseconds as seconds cut to hundredths, like the timer saves them (12345 → 12.34)
function msToSeconds(ms) {
    return Math.floor(ms / 10) / 100;
}

// Seconds with more decimals cut to hundredths; going through whole ms first keeps 10.05 from becoming 10.04
function toHundredths(seconds) {
    return msToSeconds(Math.round(seconds * 1000));
}

// A Pro Timer solve from another app; what other apps don't save is filled in like a typed time
function importedSolve({ time, penalty = null, scramble = "", event, createdAt, result, solvePhases, doneAt }) {
    const solve = {
        time,                   // seconds, moves for FMC, points for Multi-Blind
        penalty,                // null, seconds added (2) or "DNF"
        scramble,
        event,
        inspection: 0,          // no app saves it in its export
        createdAt,              // ms since 1970
        solution: null          // only Pro Timer's own FMC solves have one
    };
    // Multi-Blind's "solved / total", and each phase's time, only when the app saved them
    if (result != null) solve.result = result;
    if (solvePhases) solve.solvePhases = solvePhases;
    // Where it was done: the app's name, or the competition's; a list of times has none
    if (doneAt) solve.doneAt = doneAt;
    return solve;
}

// The sessions of a Pro Timer file as [{ name, session }]; throws when a newer Pro Timer made the file
function readProTimerFile(data) {
    // A newer version may save solves in a shape this one doesn't understand
    if (data.version > 1) {
        throw new Error("This file was made by a newer version of Pro Timer.");
    }

    return Object.entries(data.sessions)
        // Skip anything that isn't a session object (a damaged file)
        .filter(([, session]) => session && typeof session === "object")
        // An old session may have no averages list, and the rest of the code expects one
        .map(([name, session]) => ({ name, session: { ...session, averages: session.averages || [] } }));
}

// Every solve of a session: its finished averages, then the average in progress
function sessionSolves(session) {
    return [
        ...session.averages.flatMap(block => block.solves || []),
        ...(session.buffer?.solvesArray || [])
    ];
}

// How many solves a session holds
function countSolves(session) {
    return sessionSolves(session).length;
}

// The name itself when it's free, else the first free "name (2)", "name (3)"…
function uniqueSessionName(name, sessions) {
    if (!sessions[name]) return name;

    let n = 2;
    // Count up until a name isn't taken
    while (sessions[`${name} (${n})`]) n++;
    return `${name} (${n})`;
}

// A Pro Timer session from loose solves: whole blocks of the mode are finished averages, the rest is the average in progress
function buildSession(solves, event, mode, category) {
    // Oldest first, the order the timer adds solves in
    const sorted = [...solves].sort((a, b) => a.createdAt - b.createdAt);
    const size = getNeededSolves(mode);

    // Cut whole blocks off the oldest solves, like averageOfN does as solves come in
    const averages = [];
    let rest = sorted;
    while (rest.length >= size) {
        averages.push(buildAverageBlock(rest.slice(0, size), mode));
        rest = rest.slice(size);
    }

    return {
        averages: averages.reverse(),                                    // newest first, like every session
        buffer: { mode, solveCounter: rest.length, solvesArray: rest },  // the leftover solves wait for more
        category,                                                        // so the top bar finds the event
        scrambleType: event,
        mode
    };
}

// When a block's newest solve was done
function newestSolveDate(block) {
    return Math.max(...block.solves.map(s => s.createdAt));
}

// A Pro Timer session from competition rounds ([{ mode, solves }]): a round with a mode is its own average, the others' solves are grouped like buildSession
function buildRoundsSession(rounds, event, mode, category) {
    // Solves of rounds with no full average (a missed cutoff, a best of 1…), cut into the session's mode by date
    const session = buildSession(rounds.filter(r => !r.mode).flatMap(r => r.solves), event, mode, category);

    // Every full round as a finished average in its own mode (a bo3 round stays a bo3 in a bo5 session)
    rounds.filter(r => r.mode).forEach(r => session.averages.push(buildAverageBlock(r.solves, r.mode)));

    // Newest first, the rounds placed by date among the grouped solves
    session.averages.sort((a, b) => newestSolveDate(b) - newestSolveDate(a));
    return session;
}

export {
    parseJSON,
    detectFormat,
    detectTextFormat,
    parseCsv,
    msToSeconds,
    toHundredths,
    importedSolve,
    readProTimerFile,
    sessionSolves,
    countSolves,
    uniqueSessionName,
    buildSession,
    buildRoundsSession
};
