import { timerWarnings } from "../MBLD";

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

    intervalId = setInterval(() => {
        document.getElementById("countdown").textContent = "Stop attempt";
        remainingTime --;

        if(remainingTime === 5 * 60 && timerWarnings["5"]) new Audio("./audio/5minutes.mp3").play();
        if(remainingTime === 10 * 60 && timerWarnings["10"]) new Audio("./audio/10minutes.mp3").play();
        if(remainingTime === 15 * 60 && timerWarnings["15"]) new Audio("./audio/15minutes.mp3").play();
        if(remainingTime === 20 * 60 && timerWarnings["20"]) new Audio("./audio/20minutes.mp3").play();
        if(remainingTime === 25 * 60 && timerWarnings["25"]) new Audio("./audio/25minutes.mp3").play();
        if(remainingTime === 30 * 60 && timerWarnings["30"]) new Audio("./audio/30minutes.mp3").play();
        if(remainingTime === 35 * 60 && timerWarnings["35"]) new Audio("./audio/35minutes.mp3").play();
        if(remainingTime === 40 * 60 && timerWarnings["40"]) new Audio("./audio/40minutes.mp3").play();
        if(remainingTime === 45 * 60 && timerWarnings["45"]) new Audio("./audio/45minutes.mp3").play();
        if(remainingTime === 50 * 60 && timerWarnings["50"]) new Audio("./audio/50minutes.mp3").play();
        if(remainingTime === 55 * 60 && timerWarnings["55"]) new Audio("./audio/55minutes.mp3").play();

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
