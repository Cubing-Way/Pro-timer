import {
    parseTimeToSeconds,
    isPointsSolves,
    formatSecondsToTime,
    formatDisplayTime,
    getNeededSolves
} from "./avgHelper.js";

import { updateClassicStats as updateClassicStatsWith } from "./classicAvgs.js";
import { averageObj, classicStats } from "./avgState.js";
import { computeAverage, buildAverageBlock } from "./avgComput.js";
import { currentScrambleEvent } from "../scramble/scrambleController.js";
import { deviceSettObj } from "../settings/settingsState.js";

// Updates classic mode's rolling averages with this folder's state (recomputeBest rebuilds them from scratch)
function updateClassicStats(recomputeBest = false) {
    updateClassicStatsWith(recomputeBest, averageObj, classicStats);
}

// Adds a solve to the average in progress; returns a finished average block once there are enough solves, else null
function averageOfN(
    time,               // "12.34" or seconds; for FMC { moveCount, solved, solution }, for Multi-Blind { points, result }
    scramble,
    inspection,         // seconds of inspection used
    inspectionType,     // WCA, Free or None
    isFMC = false,
    modeFlag = false,   // true: only the mode changed, add no solve
    isMBLD = false,
    solvePhases         // time of each timer phase
) {

    // WCA inspection: 15 s or more is +2, 17 s or more is DNF
    let inspecPenalty = null;

    if (inspectionType === "WCA") {
        if (inspection >= 15) inspecPenalty = 2;
        if (inspection >= 17) inspecPenalty = "DNF";
    }

    // The solve's value: moves for FMC, points for Multi-Blind, seconds for the rest
    let seconds = null;
    if (isFMC) {
        seconds = time.moveCount;
        // A solution that doesn't solve the cube is a DNF
        if (!time.solved) inspecPenalty = "DNF";
    } else if (isMBLD) {
        seconds = time.points;
        // Zero or negative points is a DNF
        if (seconds <= 0) {
            inspecPenalty = "DNF";
        }
        } else {
            seconds = parseTimeToSeconds(time);
    }

    // FMC keeps the solution that was submitted
    const solution = time.solution ? time.solution : null;

    // Save the solve in the average in progress (skipped on a mode change)
    if (!modeFlag) {
        averageObj.solvesArray.push({
            time: seconds,
            result: time.result,
            penalty: inspecPenalty ? inspecPenalty : null,
            scramble: scramble,
            event: currentScrambleEvent, // event the scramble was made for (the modal and history use it)
            inspection,
            createdAt: Date.now(),
            solution,
            solvePhases,
            doneAt: deviceSettObj.name || deviceSettObj.detected // where it was done: the typed device name, else the detected model or type
        });

        averageObj.solveCounter++;
    }

    // Classic mode (rolling ao5): no blocks, only rolling averages

    if (averageObj.mode === "classic") {
        // Switching to classic rebuilds the rolling averages from the solves already in the buffer
        updateClassicStats(modeFlag);
        return null;
    }

    // How many solves this mode needs
    const neededSolves = getNeededSolves(averageObj.mode);

    // Enough solves: turn the first neededSolves into a finished block
    if (averageObj.solveCounter >= neededSolves) {

        const relevantSolves = averageObj.solvesArray.slice(0, neededSolves);

        // The saved average, its numbers already formatted for display
        const block = buildAverageBlock(relevantSolves, averageObj.mode);

        // remove only used solves
        averageObj.solvesArray = averageObj.solvesArray.slice(neededSolves);
        averageObj.solveCounter = averageObj.solvesArray.length;

        return block;
    }
    return null;
}


export {
    parseTimeToSeconds,
    isPointsSolves,
    formatSecondsToTime,
    computeAverage,
    buildAverageBlock,
    formatDisplayTime,
    getNeededSolves,
    updateClassicStats,
    averageObj,
    averageOfN,
    classicStats
};