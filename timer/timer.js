import { setTimerDisplay } from "./timerDOM";
import { timerObj } from "./timerState";
import { formatTime } from "./timeFormatting";
import { getThemeVar } from "../settings/timerSett";

function startTimer(param) {

    setTimerDisplay('color', `${getThemeVar(`theme-text-${localStorage.getItem("times-color")}`, '--text-main')}`)
    clearInterval(timerObj.interval);
    timerObj.inspecting = false;
    if (param) {
        timerObj.timerPhase = 0;
        return;
    }
    const startTime = performance.now();
    timerObj.startTime = startTime;

    timerObj.interval = setInterval(() =>{
        const displayMode = document.getElementById("timer-display")?.value;
        
        if (displayMode === "Hide") {
            setTimerDisplay("time", "Solving");
        } else {
            setTimerDisplay('time', formatTime(performance.now() - startTime));
        }
    }, 10);
}

function stopTimer() {
    clearInterval(timerObj.interval);
    setTimerDisplay('time', formatTime(performance.now() - timerObj.startTime));
    timerObj.timerPhase = 0;
}

export { startTimer, stopTimer };

