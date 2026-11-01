// Truncate (WCA-style) to the given number of decimals
function truncate(n, decimals) {
    // 10, 100 or 1000 for 1, 2 or 3 decimals
    const factor = 10 ** decimals;
    // The tiny extra stops float noise (1.13 * 100 is 112.99999999999999) from cutting a digit
    return (Math.floor(n * factor + 1e-6) / factor).toFixed(decimals);
}

// Running timer display: "s.cc", "m: ss.cc" or "h: mm: ss.cc"; 2 decimals unless the caller asks for 1 or 3
function formatTime(milisseconds, decimals = 2) {
    let seconds = (milisseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    // Under a minute: just seconds
    if (minutes < 1) {
        return truncate(seconds, decimals);
    }
    // Seconds left over after the whole minutes
    seconds = seconds - 60 * minutes;
    // Hours are checked before minutes, or the minutes case would catch them too
    if (hours >= 1) {
        minutes = minutes - 60 * hours;
        return `${hours}: ${minutes < 10 ? '0' : ''}${minutes}: ${seconds < 10 ? '0' : ''}${truncate(seconds, decimals)}`;
    }
    return `${minutes}: ${seconds < 10 ? '0' : ''}${truncate(seconds, decimals)}`;
}

// Saved seconds (12.34) in the timer's format; whole ms first, so the saved digits come back as they were
function formatSeconds(seconds, decimals) {
    return formatTime(Math.round(seconds * 1000), decimals);
}

// A saved solve on the timer: "DNF", "12.3 (+2)" with the penalty added, or just the time
function formatSolveTime(solveObj, decimals) {
    if (solveObj.time == null) return "-";   // no time saved
    if (solveObj.penalty === "DNF") return "DNF";
    // A +2 (or more) is a number of seconds added to the time
    if (typeof solveObj.penalty === "number") {
        return `${formatSeconds(solveObj.time + solveObj.penalty, decimals)} (+${solveObj.penalty})`;
    }
    return formatSeconds(solveObj.time, decimals);
}

export { formatTime, formatSeconds, formatSolveTime };
