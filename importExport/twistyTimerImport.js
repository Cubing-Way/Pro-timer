// Reading Twisty Timer's (Android) backup file: a header line, then "Puzzle";"Category";"Time(millis)";"Date(millis)";"Scramble";"Penalty";"Comment" lines
import { parseCsv, importedSolve, msToSeconds } from "./importSolves.js";

// Twisty Timer's puzzles as [Pro Timer event, name]
const TWISTY_PUZZLES = {
    "222": ["222so", "2x2"],
    "333": ["333", "3x3"],
    "444": ["444wca", "4x4"],
    "555": ["555wca", "5x5"],
    "666": ["666wca", "6x6"],
    "777": ["777wca", "7x7"],
    mega: ["mgmp", "Megaminx"],
    pyra: ["pyrso", "Pyraminx"],
    skewb: ["skbso", "Skewb"],
    clock: ["clkwca", "Clock"],
    sq1: ["sqrs", "Square-1"]
};

// Twisty Timer's penalties: 1 is a +2 (already added to the time), 2 is a DNF
const PLUS_TWO = 1;
const DNF = 2;

// One Twisty Timer solve line as a Pro Timer solve
function convertTwistySolve(millis, date, scramble, penalty, event) {
    return importedSolve({
        time: msToSeconds(penalty === PLUS_TWO ? millis - 2000 : millis),   // the time without the +2
        penalty: penalty === DNF ? "DNF" : penalty === PLUS_TWO ? 2 : null,
        scramble: scramble || "",
        event,
        createdAt: date,
        doneAt: "Twisty Timer"      // where it was done: the app it came from
    });
}

// The sessions of a Twisty Timer backup as [{ name, event, solves }], one per puzzle and category ("3x3 Normal", "3x3 OH")
function readTwistyTimerFile(text) {
    // The first row is the header
    const [, ...rows] = parseCsv(text, ";");
    // Sessions by name, in the order they first show up
    const sessions = new Map();

    rows.forEach(([puzzle, category = "", millis, date, scramble, penalty]) => {
        // A broken line (no puzzle or no time) is skipped
        if (!puzzle || !Number.isFinite(Number(millis))) return;

        const [event, label] = TWISTY_PUZZLES[puzzle] ?? ["333", puzzle];
        const name = `${label} ${category}`.trim();
        if (!sessions.has(name)) sessions.set(name, { name, event, solves: [] });

        sessions.get(name).solves.push(convertTwistySolve(Number(millis), Number(date), scramble, Number(penalty), event));
    });

    return [...sessions.values()];
}

export { readTwistyTimerFile, convertTwistySolve };
