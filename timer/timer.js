import { PHASE } from "./timerState.js";

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
            setTimerDisplay('time', formatTime(performance.now() - startTime));
        }
    }, 10);
}

// Stops the solve: shows the exact final time (read back from the display by the caller) and goes back to idle
function stopTimer(setTimerDisplay, getThemeVar, timerObj, formatTime) {
    clearInterval(timerObj.interval);
    setTimerDisplay('time', formatTime(performance.now() - timerObj.startTime));
    timerObj.timerPhase = PHASE.IDLE;
}

export { startTimer, stopTimer };
