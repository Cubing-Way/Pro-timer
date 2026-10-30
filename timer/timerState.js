// Named timer phases (transitions in timerController.js and timerPhases.js)
const PHASE = Object.freeze({
    IDLE: "idle",             // waiting for the next solve
    INSPECTING: "inspecting", // inspection running (or armed to start on release)
    HOLDING: "holding",       // pressed, waiting out the hold delay (red)
    READY: "ready",           // hold delay done (green), release starts the timer
    RUNNING: "running",       // solve being timed
});

const timerObj = {
    timerPhase: PHASE.IDLE,
    interval: 0,
    holdTimeout: 0,
    inspecting: false,
    inspection: 0,
    solvePhases: [],
    currentSolvePhase: 0,
    totalSolvePhases: 1,
    splitTriggered: false,
    lastSplitTime: 0,
};

// 1-hour countdown used by Fewest Moves and Multi-Blind
const countdownObj = {
    remainingTime: 60 * 60, // 3600 seconds
    intervalId: null,
};

export { PHASE, timerObj, countdownObj };
