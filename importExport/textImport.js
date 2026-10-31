// Reading text files of times: csTimer's CSV export of a session, and plain lists of times
import { parseCsv, importedSolve, toHundredths } from "./importSolves.js";

// These files don't say which event the times are for, so they import as 3x3
const TEXT_EVENT = "333";

// "12.34", "1:02.34" or "1:02:03.45" as seconds, or null when it isn't a time (decimals are required, so "3" or "2026" don't count)
function clockToSeconds(text) {
    if (!/^(\d+:){0,2}\d+\.\d+$/.test(text)) return null;
    // Each part before the last is worth 60 of the next one
    return toHundredths(text.split(":").reduce((total, part) => total * 60 + parseFloat(part), 0));
}

// A time as timers write it, as { time, penalty }, or null when the text isn't one: "12.34", "DNF", "DNF(12.34)", or "14.34+" (csTimer's +2, already added)
function parseTimeText(text) {
    const t = text.trim();

    // A DNF, with or without the time it stopped at
    const dnf = t.match(/^DNF(?:\((.*)\))?$/i);
    if (dnf) return { time: clockToSeconds(dnf[1] ?? "") ?? 0, penalty: "DNF" };

    // A "+" at the end is a +2 already counted in the time
    const plusTwo = t.endsWith("+");
    const seconds = clockToSeconds(plusTwo ? t.slice(0, -1) : t);
    if (seconds == null) return null;
    return plusTwo ? { time: toHundredths(seconds - 2), penalty: 2 } : { time: seconds, penalty: null };
}

// A date as written in the file, in ms, or null when there's none or it can't be read ("2026-10-31 14:07:09", ISO dates…)
function parseDate(text) {
    if (!text) return null;
    const trimmed = text.trim();
    // "2026-10-31 14:07:09" (csTimer) needs a "T" between the day and the time for every browser to read it, as local time
    const ms = Date.parse(/^\d{4}-\d{2}-\d{2} \d/.test(trimmed) ? trimmed.replace(" ", "T") : trimmed);
    return Number.isNaN(ms) ? null : ms;
}

// Solves without a date get one: a second apart in the file's order, the last one just now
function fillMissingDates(solves) {
    const now = Date.now();
    solves.forEach((solve, i) => {
        if (solve.createdAt == null) solve.createdAt = now - (solves.length - i) * 1000;
    });
}

// csTimer's "Export CSV" of one session (No.;Time;Comment;Scramble;Date;P.1;P.2…) as [{ name, event, solves }]
function readCsTimerCsv(text, name) {
    const [header, ...rows] = parseCsv(text.replace(/^﻿/, ""), ";");
    // Where the phase columns start, when the session had phases (-1 when it didn't)
    const firstPhase = header.indexOf("P.1");

    const solves = rows
        .map(row => {
            const parsed = parseTimeText(row[1] ?? "");
            // Not a solve row
            if (!parsed) return null;
            // Each phase's time as csTimer wrote it, only kept when there's more than one
            const phases = firstPhase === -1 ? [] : row.slice(firstPhase).filter(phase => phase !== "");
            return importedSolve({
                ...parsed,
                scramble: row[3] ?? "",
                event: TEXT_EVENT,
                createdAt: parseDate(row[4]),
                solvePhases: phases.length > 1 ? phases : null,
                doneAt: "csTimer"       // where it was done: the app it came from
            });
        })
        .filter(Boolean);

    fillMissingDates(solves);
    return solves.length ? [{ name, event: TEXT_EVENT, solves }] : [];
}

// The solves of one line of a time list: "time;scramble;date[;DNF]" (Twisty Timer's single-puzzle export, spreadsheets), "time, time, time", or "[1.] time [scramble]" (csTimer's copied list)
function lineSolves(line) {
    // Fields split by ";" or a tab: the time, the scramble, the date, and an optional "DNF" (Twisty Timer)
    if (/[;\t]/.test(line)) {
        const [fields = []] = parseCsv(line, line.includes(";") ? ";" : "\t");
        const parsed = parseTimeText(fields[0] ?? "");
        if (!parsed) return [];
        if (fields[3]?.trim().toUpperCase() === "DNF") parsed.penalty = "DNF";
        return [importedSolve({ ...parsed, scramble: fields[1]?.trim() ?? "", event: TEXT_EVENT, createdAt: parseDate(fields[2]) })];
    }

    // Several times on the line, separated by commas
    if (line.includes(",")) {
        return line.split(",")
            .map(parseTimeText)
            .filter(Boolean)
            .map(parsed => importedSolve({ ...parsed, event: TEXT_EVENT, createdAt: null }));
    }

    // An optional number ("12." or "12)"), the time, then the scramble, if any
    const [, timeText = "", scramble = ""] = line.trim().replace(/^\d+[.)]\s+/, "").match(/^(\S+)\s*(.*)$/) ?? [];
    const parsed = parseTimeText(timeText);
    return parsed ? [importedSolve({ ...parsed, scramble, event: TEXT_EVENT, createdAt: null })] : [];
}

// A plain list of times as [{ name, event, solves }]; lines that aren't times (titles, stats) are skipped
function readTimeList(text, name) {
    const solves = text.replace(/^﻿/, "").split(/\r?\n/).flatMap(lineSolves);
    fillMissingDates(solves);
    return solves.length ? [{ name, event: TEXT_EVENT, solves }] : [];
}

export { readCsTimerCsv, readTimeList, parseTimeText, parseDate };
