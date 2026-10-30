// Changes to the solves of a session; the session controller passes in the state and save function
import { computeAverage, formatSecondsToTime } from "../average/avgController.js";

// Gives an old session an averages list if it has none
function ensureSessionShape(getCurrentSession) {
    const session = getCurrentSession();
    if (!session.averages) session.averages = [];
}

// Saves a finished average at the start of the list (newest first)
function addAverageBlock(block, getCurrentSession, saveSessions) {
    ensureSessionShape(getCurrentSession);
    const session = getCurrentSession();
    session.averages.unshift(block);
    saveSessions();
}

// The session's finished averages, newest first
function getSessionAverages(getCurrentSession) {
    const session = getCurrentSession();
    return session.averages || [];
}

// Where the most recent solve is: { type: "current", solveIndex } or { type: "saved", blockIndex, solveIndex }, or null
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

// Sets a solve's penalty: in the average in progress (blockIndex -1), or in a saved average, which is then recomputed
function penalty2(blockIndex, solveIndex, penalty, averageObj, getCurrentSession, saveSessions) {
    // Solve of the average in progress: just change it (there are no stored numbers to recompute)
    if (blockIndex === -1) {
        averageObj.solvesArray[solveIndex].penalty = penalty;
        saveSessions();
        return;
    }

    const averages = getSessionAverages(getCurrentSession);
    const block = averages[blockIndex];

    block.solves[solveIndex].penalty = penalty;

    // A penalty changes the best, worst and σ too, not only the average (same fields as averageOfN)
    const avgObj = computeAverage(block.solves, block.mode);
    block.average = avgObj.avg === "DNF" ? "DNF" : formatSecondsToTime(avgObj.avg);
    block.best = formatSecondsToTime(avgObj.best);
    block.worst = formatSecondsToTime(avgObj.worst);
    block.sigma = formatSecondsToTime(avgObj.sigma);

    saveSessions();
}

// Removes a solve: from the average in progress (blockIndex -1), or from a saved average, which then reopens or goes away
function remove2(blockIndex, solveIndex, averageObj, getCurrentSession, saveSessions) {
    const averages = getSessionAverages(getCurrentSession);
    const modal = document.getElementById("detailsModal");

    // Solve of the average in progress: just remove it (no dialog)
    if (blockIndex === -1) {
        if (solveIndex < 0 || solveIndex >= averageObj.solvesArray.length) return;

        averageObj.solvesArray.splice(solveIndex, 1);
        averageObj.solveCounter--;

        if (averageObj.solveCounter < 0) averageObj.solveCounter = 0;

        return;
    }

    const block = averages[blockIndex];

    // Newest average and nothing in progress: reopen it without the solve, no question asked
    if (blockIndex === 0 && averageObj.solvesArray.length === 0) {
        const newSolves = block.solves.filter((_, i) => i !== solveIndex);

        averageObj.solvesArray = structuredClone(newSolves);
        averageObj.solveCounter = newSolves.length;

        averages.splice(blockIndex, 1);

        modal.classList.add("hidden");
        saveSessions();
        return;
    }

    // Older average: ask whether to reopen it or delete it whole
    const choice = confirm(
        "This solve belongs to a finished average.\n\n" +
        "OK = Replace this solve (reopen average)\n" +
        "Cancel = Delete the whole average"
    );

    // Reopen: its other solves become the average in progress, waiting for a replacement solve
    if (choice) {
        const newSolves = block.solves.filter((_, i) => i !== solveIndex);

        averageObj.solvesArray = structuredClone(newSolves);
        averageObj.solveCounter = newSolves.length;

        averages.splice(blockIndex, 1);

        modal.classList.add("hidden");
        saveSessions();
        return;
    }

    // Delete the whole average, after a second confirmation
    if (!confirm("Delete the entire average? This cannot be undone.")) return;

    averages.splice(blockIndex, 1);
    saveSessions();
}

// Sets the penalty of the most recent solve (penalty buttons under the timer)
function applyPenaltyToLast(penalty, averageObj, getCurrentSession, updateClassicStats, setPenalty) {
    const target = getLastSolveTarget(averageObj, getCurrentSession);
    if (!target) return;

    // In progress: change it directly and rebuild the rolling averages; saved: go through the modal's setPenalty
    if (target.type === "current") {
        averageObj.solvesArray[target.solveIndex].penalty = penalty;
        updateClassicStats(true);
    } else {
        setPenalty(target.blockIndex, target.solveIndex, penalty);
    }
}

// Removes the most recent solve (X button under the timer), through the modal's removeSolve
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
