// Length of a Fewest Moves or Multi-Blind attempt; the countdown state is countdownObj in timerState.js
const ONE_HOUR = 60 * 60; // 3600 seconds

// Seconds as "hh:mm:ss"
function formatCountdown(seconds) {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
}

// Writes the time left on the timer
function updateDisplay(countdownObj, display = document.getElementById("timer")) {
    if (!display) return;
    display.textContent = formatCountdown(countdownObj.remainingTime);
}

// "Start attempt": counts down one second at a time, playing the chosen warnings; a second click stops it
function startTimer2(countdownObj, timerWarnings) {
    // If timer is running → stop it
    if (countdownObj.intervalId !== null) {
        stopTimer2(countdownObj);
        return;
    }

    countdownObj.intervalId = setInterval(() => {
        document.getElementById("countdown").textContent = "Stop attempt";
        countdownObj.remainingTime --;

        // A warning plays when that many minutes are left and its box is ticked in the Timer Warnings pop-up
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

        // Time's up
        if (countdownObj.remainingTime <= 0) {
            stopTimer2(countdownObj);
        }
    }, 1000);
}


// Ends the attempt: resets the countdown to one hour and the button to "Start attempt"
function stopTimer2(countdownObj) {
    document.getElementById("countdown").textContent = "Start attempt";
    countdownObj.remainingTime = ONE_HOUR;
    updateDisplay(countdownObj);
    clearInterval(countdownObj.intervalId);
    countdownObj.intervalId = null;
}

export { updateDisplay, startTimer2, stopTimer2 };
