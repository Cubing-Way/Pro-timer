import { timerObj } from "./timerState.js";
import { setTimerDisplay } from "./timerDOM.js";

function startWcaDelay() {
    // Reset counter
    timerObj.wcaDelayCount = 0;

    // Show red immediately
    setTimerDisplay("color", "red");

    timerObj.wcaInterval = setInterval(() => {
        setTimerDisplay("color", "limeGreen");
        timerObj.wcaDelayCount++;
    }, 300);
}

function resolveWcaDelay() {
    if (timerObj.wcaDelayCount >= 1) {
        // Successful delay
        timerObj.timerPhase++;
    } else {
        // Released too early
        setTimerDisplay("color", "#eaeaf0");
    }

    clearInterval(timerObj.wcaInterval);
    timerObj.wcaDelayCount = 0;
}

export { startWcaDelay, resolveWcaDelay };