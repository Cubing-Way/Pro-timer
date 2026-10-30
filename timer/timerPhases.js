import { PHASE } from "./timerState.js";

const HOLD_DELAY_MS = 300; // WCA: hold 0.3s before the timer may start

// Puts the timer back in the "Main text" color
function resetTimerColor(setTimerDisplay, getThemeVar) {
    setTimerDisplay('color', `${getThemeVar(`theme-text-${localStorage.getItem("times-color")}`, '--text-main')}`);
}

// Pressed while idle or inspecting: red until the hold delay passes, then green
function beginHold(delayFlagType, timerObj, setTimerDisplay) {
    // One timeout slot, always cleared first, so a repeated press can't leave a stray timer behind
    clearTimeout(timerObj.holdTimeout);

    // Skip delay flag if delay flag type is None
    if (delayFlagType === "None") {
        timerObj.timerPhase = PHASE.READY;
        setTimerDisplay('color', 'limeGreen');
        return;
    }

    timerObj.timerPhase = PHASE.HOLDING;
    setTimerDisplay('color', 'red');
    timerObj.holdTimeout = setTimeout(() => {
        // Released in the meantime: cancelHold already changed the phase
        if (timerObj.timerPhase !== PHASE.HOLDING) return;
        timerObj.timerPhase = PHASE.READY;
        setTimerDisplay('color', 'limeGreen');
    }, HOLD_DELAY_MS);
}

// Released (or press lost) before the timer started: back to inspection or idle
function cancelHold(timerObj, setTimerDisplay, getThemeVar) {
    if (timerObj.timerPhase !== PHASE.HOLDING && timerObj.timerPhase !== PHASE.READY) return;

    clearTimeout(timerObj.holdTimeout);
    timerObj.timerPhase = timerObj.inspecting ? PHASE.INSPECTING : PHASE.IDLE;
    resetTimerColor(setTimerDisplay, getThemeVar);
}

export { beginHold, cancelHold, resetTimerColor };
