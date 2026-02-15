// ===============================
// Config
// ===============================
const ONE_HOUR = 60 * 60; // 3600 seconds

// ===============================
// State
// ===============================
let remainingTime = ONE_HOUR;
let intervalId = null;

// ===============================
// Elements
// ===============================
const display = document.getElementById("timer");
const startBtn = document.getElementById("countdown");
const stopBtn = document.getElementById("submit-moves");

// ===============================
// Helpers
// ===============================
function formatTime(seconds) {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
}

function updateDisplay() {
    display.textContent = formatTime(remainingTime);
}

// ===============================
// Timer Logic
// ===============================
function startTimer2() {
    // If timer is running → stop it
    if (intervalId !== null) {
        stopTimer2();
        return;
    }

    // Otherwise start it
    intervalId = setInterval(() => {
        document.getElementById("countdown").textContent = "Stop attempt";
        remainingTime--;

        updateDisplay();

        if (remainingTime <= 0) {
            stopTimer2();
        }
    }, 1000);
}


function stopTimer2() {
    document.getElementById("countdown").textContent = "Start attempt";
    remainingTime = ONE_HOUR;
    updateDisplay();
    clearInterval(intervalId);
    intervalId = null;
}

// ===============================
// Event Listeners
// ===============================
startBtn.addEventListener("click", startTimer2);
stopBtn.addEventListener("click", stopTimer2);

// Initialize display
export { updateDisplay };
