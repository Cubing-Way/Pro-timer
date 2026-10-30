function parseTimeToSeconds(str) {
    if (str == null) {
        return null;
    };   // 🔥 prevents crash
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

function manageTime(time) {
    const t = Number(time);
    if (!Number.isFinite(t)) return "-";
    return t.toFixed(2);
}

function formatDisplayTime(solveObj) {
    if (solveObj.time == null) return "-";   // ✅ safety

    if (solveObj.penalty === "DNF") return "DNF";
    if (typeof solveObj.penalty === "number") {
        return formatSecondsToTime(solveObj.time + solveObj.penalty) + ` (+${solveObj.penalty})`;
    }
    return formatSecondsToTime(solveObj.time);
}

function formatSecondsToTime(sec) {
    if (sec === "DNF") return "DNF";
    sec = Number(sec);               // 🔥 normalize here

    if (!Number.isFinite(sec)) return "DNF";

    // Round to hundredths first, so 59.999 becomes "1:00.00" and not "60.00"
    sec = Math.round(sec * 100) / 100;

    if (sec >= 3600) {
        const h = Math.floor(sec / 3600);
        const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
        const s = (sec % 60).toFixed(2).padStart(5, "0");
        return `${h}:${m}:${s}`;
    }

    if (sec >= 60) {
        const m = Math.floor(sec / 60);
        const s = (sec % 60).toFixed(2).padStart(5, "0");
        return `${m}:${s}`;
    }

    return manageTime(sec);
}

export {
    parseTimeToSeconds,
    isPointsSolves,
    manageTime,
    formatDisplayTime,
    formatSecondsToTime
};