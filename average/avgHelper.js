// Turns a time string ("12.34", "1:02.50") into seconds; numbers pass through and null stays null
function parseTimeToSeconds(str) {
    if (str == null) {
        return null;
    };   // nothing to parse, so callers get null instead of a crash
    if (typeof str === "number") return str;
    if (str.includes(":")) {
        // "m:ss.cc" or "h:mm:ss.cc": each part before the last is worth 60 of the next one
        return str.split(":").reduce((total, part) => total * 60 + parseFloat(part), 0);
    }
    return parseFloat(str);
}

// Multi-Blind solves are points, where more is better; only they have a result like "4 / 5"
function isPointsSolves(solves) {
    return solves.length > 0 && solves.every(s => s.result != null);
}

// Seconds with 2 decimals, or "-" when it isn't a number
function manageTime(time) {
    const t = Number(time);
    if (!Number.isFinite(t)) return "-";
    return t.toFixed(2);
}

// A solve as shown in lists: "DNF", "12.34 (+2)" with the penalty added, or just the time
function formatDisplayTime(solveObj) {
    if (solveObj.time == null) return "-";   // no time saved

    if (solveObj.penalty === "DNF") return "DNF";
    if (typeof solveObj.penalty === "number") {
        return formatSecondsToTime(solveObj.time + solveObj.penalty) + ` (+${solveObj.penalty})`;
    }
    return formatSecondsToTime(solveObj.time);
}

// Seconds as "s.cc", "m:ss.cc" or "h:mm:ss.cc"; "DNF" and anything that isn't a number become "DNF"
function formatSecondsToTime(sec) {
    if (sec === "DNF") return "DNF";
    sec = Number(sec);               // strings like "12.34" become numbers

    // Infinity is how a DNF is counted inside averages
    if (!Number.isFinite(sec)) return "DNF";

    // Round to hundredths first, so 59.999 becomes "1:00.00" and not "60.00"
    sec = Math.round(sec * 100) / 100;

    // An hour or more
    if (sec >= 3600) {
        const h = Math.floor(sec / 3600);
        const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
        const s = (sec % 60).toFixed(2).padStart(5, "0");
        return `${h}:${m}:${s}`;
    }

    // A minute or more
    if (sec >= 60) {
        const m = Math.floor(sec / 60);
        const s = (sec % 60).toFixed(2).padStart(5, "0");
        return `${m}:${s}`;
    }

    return manageTime(sec);
}

// How many solves finish a block average: 5 for ao5 and bo5, 12 for ao12, 3 for mo3, bo3 and ao3 (fmc3)
function getNeededSolves(mode) {
    if (mode === "ao5" || mode === "bo5") return 5;
    if (mode === "ao12") return 12;
    return 3;
}

export {
    parseTimeToSeconds,
    isPointsSolves,
    manageTime,
    formatDisplayTime,
    formatSecondsToTime,
    getNeededSolves
};