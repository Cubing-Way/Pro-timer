import { setTimerDisplay } from "./timerDOM";
import { timerObj } from "./timerState";
import { formatTime } from "./timeFormatting";

function startTimer(param) {
    setTimerDisplay('color', '#eaeaf0')
    clearInterval(timerObj.interval);
    timerObj.inspecting = false;
    if (param) {
        timerObj.timerPhase = 0;
        return;
    }
    const startTime = performance.now();
    timerObj.interval = setInterval(() =>{
        setTimerDisplay('time', formatTime(performance.now() - startTime));
    }, 10);
}

function stopTimer() {
    clearInterval(timerObj.interval);
    const endTime = document.getElementById('timer').innerHTML;
    timerObj.timerPhase = 0;
}

export { startTimer, stopTimer };

