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

// Which app made the file: "protimer", "cstimer", or null when it's neither
function detectFormat(data) {
    // Not an object (a number, a list, null): no app exports that
    if (!data || typeof data !== "object" || Array.isArray(data)) return null;

    // Pro Timer's export has its tag and a sessions object
    if (data.app === "Pro Timer" && data.sessions && typeof data.sessions === "object") return "protimer";

    // csTimer's export has keys like "session1", "session2"…
    if (Object.keys(data).some(key => /^session\d+$/.test(key))) return "cstimer";

    return null;
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

export { 
    parseJSON, 
    detectFormat, 
    readProTimerFile, 
    sessionSolves, 
    countSolves, 
    uniqueSessionName,
    buildSession
};