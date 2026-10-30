import { 
    parseTimeToSeconds, 
    formatSecondsToTime,
    formatDisplayTime
} from "./avgHelper.js";

import { updateClassicStats as updateClassicStatsWith } from "./classicAvgs.js";
import { averageObj, classicStats } from "./avgState.js";
import { computeAverage } from "./avgComput.js";

function updateClassicStats(recomputeBest = false) {
    updateClassicStatsWith(recomputeBest, averageObj, classicStats);
}

function averageOfN(
    time, 
    scramble, 
    inspection, 
    inspectionType, 
    isFMC = false, 
    modeFlag = false, 
    isMBLD = false,
    solvePhases
) {

    let inspecPenalty = null;

    if (inspectionType === "WCA" || averageObj.mode === "fmc3") {
        if (inspection >= 15) inspecPenalty = 2; 
        if (inspection >= 17) inspecPenalty = "DNF";
    }

    let seconds = null; 
    if (isFMC) {
        seconds = time.moveCount;
    } else if (isMBLD) {
        seconds = time.points;
        if (seconds <= 0) {
            inspecPenalty = "DNF";
        }
        } else {
            seconds = parseTimeToSeconds(time);
    }

    const solution = time.solution ? time.solution : null;

    if (!modeFlag) {
        averageObj.solvesArray.push({
            time: seconds,
            result: time.result, 
            penalty: inspecPenalty ? inspecPenalty : null,
            scramble: scramble,
            inspection,
            createdAt: Date.now(),
            solution,
            solvePhases
        });

        averageObj.solveCounter++;
    }

    // =========================
    // CLASSIC MODE (rolling ao5)
    // =========================

    if (averageObj.mode === "classic") {
        if (!modeFlag) updateClassicStats();
            return null;
    }
    // Determine how many solves needed for this mode
    let neededSolves = 3; // default for mo3 and bo3
    if (averageObj.mode === "ao5" || averageObj.mode === "bo5") {
        neededSolves = 5;
    } else if (averageObj.mode === "ao12") {
        neededSolves = 12;
    }

    if (averageObj.solveCounter >= neededSolves) {

        const relevantSolves = averageObj.solvesArray.slice(0, neededSolves);

        const avgObj = computeAverage(relevantSolves, averageObj.mode);

        const block = {
            mode: averageObj.mode,
            average: avgObj.avg === "DNF" ? "DNF" : formatSecondsToTime(avgObj.avg),
            worst: formatSecondsToTime(avgObj.worst),
            best: formatSecondsToTime(avgObj.best),
            sigma: formatSecondsToTime(avgObj.sigma),
            solves: structuredClone(relevantSolves)
        };

        // remove only used solves
        averageObj.solvesArray = averageObj.solvesArray.slice(neededSolves);
        averageObj.solveCounter = averageObj.solvesArray.length;

        return block;
    }
    return null;
}


export {
    parseTimeToSeconds,
    formatSecondsToTime,
    computeAverage,
    formatDisplayTime,
    updateClassicStats,
    averageObj,
    averageOfN,
    classicStats
};
