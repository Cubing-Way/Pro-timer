// Truncate (WCA-style) to 2 decimals
function truncate2(n) {
    return (Math.floor(n * 100) / 100).toFixed(2);
}

function formatTime(milisseconds) {
    let seconds = (milisseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    if (minutes < 1) {
        return truncate2(seconds);
    } else if (minutes >= 1) {
        seconds = (seconds - 60 * minutes)
        return `${minutes}: ${seconds < 10 ? '0' : ''}${truncate2(seconds)}`;
    } else if (minutes >= 60) {
        minutes = (minutes - 60 * hours)
        return `${hours}: ${minutes < 10 ? '0' : ''}${minutes}: ${seconds < 10 ? '0' : ''}${truncate2(seconds)}`;
    }
}

export { formatTime };