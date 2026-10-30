// ===============================
// Config
// ===============================
const ONE_HOUR = 60 * 60; // 3600 seconds

// ===============================
// State (countdownObj in timerState.js)
// ===============================



// ===============================
// Helpers
// ===============================
function formatCountdown(seconds) {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
}

function updateDisplay(countdownObj, display = document.getElementById("timer")) {
    if (!display) return;
    display.textContent = formatCountdown(countdownObj.remainingTime);
}

// ===============================
// Timer Logic
// ===============================
function startTimer2(countdownObj, timerWarnings) {
    // If timer is running → stop it
    if (countdownObj.intervalId !== null) {
        stopTimer2(countdownObj);
        return;
    }

    countdownObj.intervalId = setInterval(() => {
        document.getElementById("countdown").textContent = "Stop attempt";
        countdownObj.remainingTime --;

        if(countdownObj.remainingTime === 5 * 60 && timerWarnings["5"]) new Audio("./audio/5minutes.mp3").play();
        if(countdownObj.remainingTime === 10 * 60 && timerWarnings["10"]) new Audio("./audio/10minutes.mp3").play();
        if(countdownObj.remainingTime === 15 * 60 && timerWarnings["15"]) new Audio("./audio/15minutes.mp3").play();
        if(countdownObj.remainingTime === 20 * 60 && timerWarnings["20"]) new Audio("./audio/20minutes.mp3").play();
        if(countdownObj.remainingTime === 25 * 60 && timerWarnings["25"]) new Audio("./audio/25minutes.mp3").play();
        if(countdownObj.remainingTime === 30 * 60 && timerWarnings["30"]) new Audio("./audio/30minutes.mp3").play();
        if(countdownObj.remainingTime === 35 * 60 && timerWarnings["35"]) new Audio("./audio/35minutes.mp3").play();
        if(countdownObj.remainingTime === 40 * 60 && timerWarnings["40"]) new Audio("./audio/40minutes.mp3").play();
        if(countdownObj.remainingTime === 45 * 60 && timerWarnings["45"]) new Audio("./audio/45minutes.mp3").play();
        if(countdownObj.remainingTime === 50 * 60 && timerWarnings["50"]) new Audio("./audio/50minutes.mp3").play();
        if(countdownObj.remainingTime === 55 * 60 && timerWarnings["55"]) new Audio("./audio/55minutes.mp3").play();

        updateDisplay(countdownObj);

        if (countdownObj.remainingTime <= 0) {
            stopTimer2(countdownObj);
        }
    }, 1000);
}


function stopTimer2(countdownObj) {
    document.getElementById("countdown").textContent = "Start attempt";
    countdownObj.remainingTime = ONE_HOUR;
    updateDisplay(countdownObj);
    clearInterval(countdownObj.intervalId);
    countdownObj.intervalId = null;
}

// ===============================
// Event Listeners
// ===============================


// Initialize display
export { updateDisplay, startTimer2, stopTimer2 };
