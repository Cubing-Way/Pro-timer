const timerObj = {
    timerPhase: 0,
    interval: 0,
    wcaInterval: 0,
    wcaDelayCount: false,
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

export { timerObj, countdownObj };