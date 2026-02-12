import { timerObj } from "./timerState.js";
import { setTimerDisplay } from "./timerDOM.js";

function timerPhases(delayFlagType) {
    if (timerObj.timerPhase !== 1) {
        timerObj.timerPhase++;
    } else if (timerObj.timerPhase === 1) {
        // Skip delay flag if delay flag type is None
        if (delayFlagType === "None") {
            setTimerDisplay('color', 'limeGreen');
            timerObj.timerPhase++;
        } else {
            setTimerDisplay('color', 'red');
            timerObj.wcaInterval = setInterval(() =>{
                setTimerDisplay('color', 'limeGreen');
                timerObj.wcaDelayCount++;
            }, 300);
        }
    }
}

function wcaDelayFlag() {
    if (timerObj.wcaDelayCount >= 1) {
        timerObj.timerPhase++;
        timerObj.wcaDelayCount = 0;
        clearInterval(timerObj.wcaInterval);
    } else {
        setTimerDisplay('color', '#eaeaf0')
        timerObj.wcaDelayCount = 0;
        clearInterval(timerObj.wcaInterval);          
    }
}

export { timerPhases, wcaDelayFlag };