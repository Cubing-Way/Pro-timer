function parseTimeToSeconds(str) {
    if (str == null) {
        return null;
    };   // 🔥 prevents crash
    if (typeof str === "number") return str;
    if (str.includes(":")) {
        const [m, s] = str.split(":");
        return parseInt(m, 10) * 60 + parseFloat(s);
    }
    return parseFloat(str);
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

    if (sec >= 60) {
        const m = Math.floor(sec / 60);
        const s = (sec % 60).toFixed(2).padStart(5, "0");
        return `${m}:${s}`;
    }

    return manageTime(sec);
}

export {
    parseTimeToSeconds,
    manageTime,
    formatDisplayTime,
    formatSecondsToTime
};