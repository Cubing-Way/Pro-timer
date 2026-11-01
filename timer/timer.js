import { PHASE } from "./timerState.js";
import { timerSettObj } from "../settings/settingsState.js";

// Starts timing a solve: resets the timer color and updates the display every 10 ms
function startTimer(setTimerDisplay, getThemeVar, timerObj, formatTime) {

    // Back to the "Main text" color after the red / green of the hold
    setTimerDisplay('color', `${getThemeVar(`theme-text-${localStorage.getItem("times-color")}`, '--text-main')}`)
    // Stops the inspection count, which used the same interval slot
    clearInterval(timerObj.interval);
    timerObj.inspecting = false;
    // performance.now() is a precise clock that doesn't jump when the system time changes
    const startTime = performance.now();
    timerObj.startTime = startTime;

    timerObj.interval = setInterval(() =>{
        // "Timer display" setting: hide the running time behind "Solving"
        const displayMode = document.getElementById("timer-display")?.value;

        if (displayMode === "Hide") {
            setTimerDisplay("time", "Solving");
        } else {
            setTimerDisplay('time', formatTime(performance.now() - startTime, timerSettObj.timerDecimals));
        }
    }, 10);
}

// Stops the solve: shows the final time (ms measured at the press) with the chosen decimals and goes back to idle
function stopTimer(setTimerDisplay, getThemeVar, timerObj, formatTime, elapsed) {
    clearInterval(timerObj.interval);
    // Same ms as the saved time, so the timer and the history never disagree
    setTimerDisplay('time', formatTime(elapsed, timerSettObj.timerDecimals));
    timerObj.timerPhase = PHASE.IDLE;
}

export { startTimer, stopTimer };
