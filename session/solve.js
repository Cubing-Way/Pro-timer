// solves.js
import { computeAverage, formatSecondsToTime } from "../average/avgController.js";

function ensureSessionShape(getCurrentSession) {
    const session = getCurrentSession();
    if (!session.averages) session.averages = [];
}

function addAverageBlock(block, getCurrentSession, saveSessions) {
    ensureSessionShape(getCurrentSession);
    const session = getCurrentSession();
    session.averages.unshift(block);
    saveSessions();
}

function getSessionAverages(getCurrentSession) {
    const session = getCurrentSession();
    return session.averages || [];
}

function getLastSolveTarget(averageObj, getCurrentSession) {
    // 1) Current in-progress solves always win
    if (averageObj.solvesArray.length > 0) {
        return {
            type: "current",
            solveIndex: averageObj.solvesArray.length - 1
        };
    }

    // 2) Otherwise, newest saved average (index 0!)
    const averages = getSessionAverages(getCurrentSession);
    if (averages.length === 0) return null;

    const newestBlockIndex = 0;
    const newestBlock = averages[0];

    if (!newestBlock || newestBlock.solves.length === 0) return null;

    return {
        type: "saved",
        blockIndex: newestBlockIndex,
        solveIndex: newestBlock.solves.length - 1
    };
}

function penalty2(blockIndex, solveIndex, penalty, getCurrentSession, saveSessions) {
    const averages = getSessionAverages(getCurrentSession);
    const block = averages[blockIndex];

    block.solves[solveIndex].penalty = penalty;

    const newAvg = computeAverage(block.solves, block.mode).avg;
    block.average = newAvg === "DNF" ? "DNF" : formatSecondsToTime(newAvg);

    saveSessions();
}

function remove2(blockIndex, solveIndex, averageObj, getCurrentSession, saveSessions) {
    const averages = getSessionAverages(getCurrentSession);
    const modal = document.getElementById("detailsModal");

    // =========================
    // CURRENT (no dialog)
    // =========================
    if (blockIndex === -1) {
        if (solveIndex < 0 || solveIndex >= averageObj.solvesArray.length) return;

        averageObj.solvesArray.splice(solveIndex, 1);
        averageObj.solveCounter--;

        if (averageObj.solveCounter < 0) averageObj.solveCounter = 0;

        return;
    }

    const block = averages[blockIndex];

    // =========================
    // Special case: newest block and current buffer empty
    // =========================
    if (blockIndex === 0 && averageObj.solvesArray.length === 0) {
        const newSolves = block.solves.filter((_, i) => i !== solveIndex);

        averageObj.solvesArray = structuredClone(newSolves);
        averageObj.solveCounter = newSolves.length;

        averages.splice(blockIndex, 1);

        modal.classList.add("hidden");
        saveSessions();
        return;
    }

    const choice = confirm(
        "This solve belongs to a finished average.\n\n" +
        "OK = Replace this solve (reopen average)\n" +
        "Cancel = Delete the whole average"
    );

    // =========================
    // REPLACE (reopen)
    // =========================
    if (choice) {
        const newSolves = block.solves.filter((_, i) => i !== solveIndex);

        averageObj.solvesArray = structuredClone(newSolves);
        averageObj.solveCounter = newSolves.length;

        averages.splice(blockIndex, 1);

        modal.classList.add("hidden");
        saveSessions();
        return;
    }

    // =========================
    // DELETE AVERAGE
    // =========================
    if (!confirm("Delete the entire average? This cannot be undone.")) return;

    averages.splice(blockIndex, 1);
    saveSessions();
}

function applyPenaltyToLast(penalty, averageObj, getCurrentSession, updateClassicStats, setPenalty) {
    const target = getLastSolveTarget(averageObj, getCurrentSession);
    if (!target) return;

    if (target.type === "current") {
        averageObj.solvesArray[target.solveIndex].penalty = penalty;
        updateClassicStats(true);
    } else {
        setPenalty(target.blockIndex, target.solveIndex, penalty);
    }
}

function removeLastSolve(averageObj, getCurrentSession, removeSolve) {
    const target = getLastSolveTarget(averageObj, getCurrentSession);
    if (!target) return;

    if (target.type === "current") {
        removeSolve(-1, target.solveIndex);
    } else {
        removeSolve(target.blockIndex, target.solveIndex);
    }
}

export {
    addAverageBlock,
    getSessionAverages,
    getLastSolveTarget,
    penalty2,
    remove2,
    applyPenaltyToLast,
    removeLastSolve
};
