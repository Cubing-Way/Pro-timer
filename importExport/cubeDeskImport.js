// Reading CubeDesk's "Export data" file: its sessions and solves in Pro Timer's shape
import { importedSolve, toHundredths } from "./importSolves.js";

// CubeDesk's events as [Pro Timer event, name]; events it doesn't list here (custom ones) import as 3x3
const CUBEDESK_EVENTS = {
    "222": ["222so", "2x2"],
    "333": ["333", "3x3"],
    "444": ["444wca", "4x4"],
    "555": ["555wca", "5x5"],
    "666": ["666wca", "6x6"],
    "777": ["777wca", "7x7"],
    sq1: ["sqrs", "Square-1"],
    pyram: ["pyrso", "Pyraminx"],
    pyraminx: ["pyrso", "Pyraminx"],    // what CubeDesk's own csTimer import saves
    clock: ["clkwca", "Clock"],
    skewb: ["skbso", "Skewb"],
    minx: ["mgmp", "Megaminx"],
    "333mirror": ["333", "3x3 Mirror"],
    "222oh": ["222so", "2x2 One-Handed"],
    "333oh": ["333oh", "3x3 One-Handed"],
    "333bl": ["333ni", "3x3 Blind"],
    other: ["333", "Other"]
};

// The order of a solve's values in CubeDesk's old export, where each solve is a list instead of an object
const LEGACY_FIELDS = ["time", "raw_time", "event_type", "scramble", "session_id", "started_at", "ended_at", "id", "dnf", "plus_two"];

// The file's { sessions, solves }, also for CubeDesk's old export ({ timer: { sessionMap: { id: { name, solves: { event: [lists] } } } } })
function cubeDeskData(data) {
    if (!data.timer?.sessionMap) return { sessions: data.sessions, solves: data.solves };

    const sessions = [];
    const solves = [];
    Object.entries(data.timer.sessionMap).forEach(([id, session]) => {
        sessions.push({ id, name: session.name, order: session.order });
        // Every solve of the session, whatever its event, as an object
        Object.values(session.solves || {}).flat().forEach(values => {
            const solve = Object.fromEntries(LEGACY_FIELDS.map((field, i) => [field, values[i]]));
            solves.push({ ...solve, session_id: id });
        });
    });
    return { sessions, solves };
}

// When a solve was done: when it ended, else when it started, else when it was saved (ms since 1970)
function cubeDeskDate(solve) {
    return [solve.ended_at, solve.started_at, Date.parse(solve.created_at)]
        // Dates can come as text, since CubeDesk saves them as big numbers
        .filter(value => value != null)
        .map(Number)
        .find(ms => Number.isFinite(ms) && ms > 0) ?? Date.now();
}

// One CubeDesk solve as a Pro Timer solve; CubeDesk saves seconds, with the +2 added in "time" but not in "raw_time"
function convertCubeDeskSolve(solve, event) {
    // The time without its penalty (a DNF's "time" is -1, so it needs raw_time)
    const raw = solve.raw_time ?? (solve.plus_two ? solve.time - 2 : solve.time);
    return importedSolve({
        time: toHundredths(Math.max(0, raw)),
        penalty: solve.dnf ? "DNF" : solve.plus_two ? 2 : null,
        scramble: solve.scramble || "",
        event,
        createdAt: cubeDeskDate(solve),
        doneAt: "CubeDesk"      // where it was done: the app it came from
    });
}

// The sessions of a CubeDesk file as [{ name, event, solves }]; a session with several events becomes one session per event ("Main 3x3", "Main 4x4")
function readCubeDeskFile(data) {
    const { sessions, solves } = cubeDeskData(data);

    // CubeDesk's own session order
    const ordered = [...(sessions || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    // Each session's solves by CubeDesk event, the sessions in order
    const bySession = new Map(ordered.map(session => [session.id, new Map()]));

    (solves || []).forEach(solve => {
        const events = bySession.get(solve.session_id);
        // Trainer solves, and solves of a session missing from the file, belong to no session
        if (!events) return;
        // Exports from before CubeDesk renamed cube_type to event_type
        const type = solve.event_type ?? solve.cube_type ?? "333";
        if (!events.has(type)) events.set(type, []);
        events.get(type).push(solve);
    });

    return ordered.flatMap(session => {
        const events = bySession.get(session.id);
        return [...events].map(([type, eventSolves]) => {
            const [event, label] = CUBEDESK_EVENTS[type] ?? ["333", type];
            return {
                // The event's name is only added when the session has more than one event
                name: events.size > 1 ? `${session.name} ${label}` : String(session.name),
                event,
                solves: eventSolves.map(solve => convertCubeDeskSolve(solve, event))
            };
        });
    });
}

export { readCubeDeskFile, convertCubeDeskSolve };
