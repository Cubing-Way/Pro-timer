// Named timer phases (transitions in timerController.js and timerPhases.js)
const PHASE = Object.freeze({
    IDLE: "idle",             // waiting for the next solve
    INSPECTING: "inspecting", // inspection running (or armed to start on release)
    HOLDING: "holding",       // pressed, waiting out the hold delay (red)
    READY: "ready",           // hold delay done (green), release starts the timer
    RUNNING: "running",       // solve being timed
});

// State of the main timer, shared by timer/, settings/, topbar/, event/ and importExport/ (WCA sync)
const timerObj = {
    timerPhase: PHASE.IDLE,   // current phase, one of PHASE
    interval: 0,              // setInterval id of the running timer or inspection
    holdTimeout: 0,           // setTimeout id of the hold delay
    inspecting: false,        // true while the inspection count is running
    inspection: 0,            // seconds of inspection used (15+ is +2, 17+ is DNF in WCA inspection)
    solvePhases: [],          // time of each phase of the solve in progress
    currentSolvePhase: 0,     // how many phases of the solve in progress are done
    totalSolvePhases: 1,      // phases per solve ("Timer Phases" setting)
    splitTriggered: false,    // not used
    lastSplitTime: 0,         // ms from the start of the solve to the last phase split
};

// 1-hour countdown used by Fewest Moves and Multi-Blind
const countdownObj = {
    remainingTime: 60 * 60, // 3600 seconds
    intervalId: null,       // setInterval id while an attempt is running, null otherwise
};

export { PHASE, timerObj, countdownObj };
