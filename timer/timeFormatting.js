// Truncate (WCA-style) to 2 decimals
function truncate2(n) {
    return (Math.floor(n * 100) / 100).toFixed(2);
}

// Running timer display: "s.cc", "m: ss.cc" or "h: mm: ss.cc"
function formatTime(milisseconds) {
    let seconds = (milisseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    // Under a minute: just seconds
    if (minutes < 1) {
        return truncate2(seconds);
    }
    // Seconds left over after the whole minutes
    seconds = seconds - 60 * minutes;
    // Hours are checked before minutes, or the minutes case would catch them too
    if (hours >= 1) {
        minutes = minutes - 60 * hours;
        return `${hours}: ${minutes < 10 ? '0' : ''}${minutes}: ${seconds < 10 ? '0' : ''}${truncate2(seconds)}`;
    }
    return `${minutes}: ${seconds < 10 ? '0' : ''}${truncate2(seconds)}`;
}

export { formatTime };
