import { timerObj } from "./timerState.js";
import { setTimerDisplay } from "./timerDOM.js";
import { getThemeVar } from "../settings/timerSett.js";

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
        console.log("a")
        // Released too early
       setTimerDisplay('color', `${getThemeVar(`theme-text-${localStorage.getItem("times-color")}`, '--text-main')}`)
    }
console.log("b")
    clearInterval(timerObj.wcaInterval);
    timerObj.wcaDelayCount = 0;
}

export { startWcaDelay, resolveWcaDelay };