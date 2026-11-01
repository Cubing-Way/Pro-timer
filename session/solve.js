// Changes to the solves of a session; the session controller passes in the state and save function
import { computeAverage, formatSecondsToTime, buildAverageBlock, getNeededSolves } from "../average/avgController.js";

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
    const buffer = averageObj.solvesArray;
    // Newest finished average (index 0), undefined when there's none
    const newestBlock = getSessionAverages(getCurrentSession)[0];

    // Last solve of each place, undefined when that place is empty
    const lastInBuffer = buffer[buffer.length - 1];
    const lastInBlock = newestBlock?.solves[newestBlock.solves.length - 1];

    // No solves anywhere
    if (!lastInBuffer && !lastInBlock) return null;

    // The block wins only if the buffer is empty or older (old solves without createdAt count as 0)
    const blockIsNewer = lastInBlock && (!lastInBuffer || (lastInBlock.createdAt ?? 0) > (lastInBuffer.createdAt ?? 0));

    if (blockIsNewer) {
        return { type: "saved", blockIndex: 0, solveIndex: newestBlock.solves.length - 1 };
    }
    return { type: "current", solveIndex: buffer.length - 1 };
}

// The most recent solve object, or null when the session has none
function getLastSolve(averageObj, getCurrentSession) {
    const target = getLastSolveTarget(averageObj, getCurrentSession);
    if (!target) return null;
    // In progress: it's in the buffer; saved: it's in that finished average
    if (target.type === "current") return averageObj.solvesArray[target.solveIndex];
    return getSessionAverages(getCurrentSession)[target.blockIndex].solves[target.solveIndex];
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

// Removes a solve: from the average in progress (blockIndex -1), which keeps waiting or is cleared, or from a saved average, which then reopens or goes away
function remove2(blockIndex, solveIndex, averageObj, getCurrentSession, saveSessions) {
    const averages = getSessionAverages(getCurrentSession);
    const modal = document.getElementById("detailsModal");

    // Solve of the average in progress: ask whether to remove only it or every solve in progress, like a finished average
    if (blockIndex === -1) {
        if (solveIndex < 0 || solveIndex >= averageObj.solvesArray.length) return;

        // The solves the second choice would delete (in classic, the whole buffer), like "all 3 solves in progress"
        const inProgressCount = averageObj.solvesArray.length;
        const inProgressText = inProgressCount === 1 ? "the 1 solve in progress" : `all ${inProgressCount} solves in progress`;
        const removeOnlyThis = confirm(
            "This solve belongs to the average in progress.\n\n" +
            "OK = Remove this solve\n" +
            `Cancel = Delete ${inProgressText}`
        );

        // Remove only it: the average in progress waits for a replacement solve
        if (removeOnlyThis) {
            averageObj.solvesArray.splice(solveIndex, 1);
            averageObj.solveCounter--;

            if (averageObj.solveCounter < 0) averageObj.solveCounter = 0;

            return;
        }

        // Delete every solve in progress, after a second confirmation
        if (!confirm(`Delete ${inProgressText}? This cannot be undone.`)) return;

        averageObj.solvesArray = [];
        averageObj.solveCounter = 0;
        return;
    }

    const block = averages[blockIndex];

    // With solves in progress, say they're kept and the reopened solves join them
    const inProgressCount = averageObj.solvesArray.length;
    let inProgressNote = "";
    if (inProgressCount === 1) inProgressNote = "\n\nThe 1 solve in progress is kept; the average's other solves join it by date.";
    if (inProgressCount > 1) inProgressNote = `\n\nThe ${inProgressCount} solves in progress are kept; the average's other solves join them by date.`;

    // Finished average (the newest one too): ask whether to reopen it or delete it whole
    const choice = confirm(
        "This solve belongs to a finished average.\n\n" +
        "OK = Replace this solve (reopen average)\n" +
        "Cancel = Delete the whole average" +
        inProgressNote
    );

    // Reopen: its other solves join the average in progress, which waits for a replacement solve
    if (choice) {
        const newSolves = block.solves.filter((_, i) => i !== solveIndex);

        averages.splice(blockIndex, 1);

        // Among the solves in progress by date instead of over them; a block that fills up closes as a finished average
        joinInProgress(structuredClone(newSolves), averageObj, getCurrentSession());

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

// Same solve: same date and same time (to skip solves a session already has)
function solveKey(solve) {
    return `${solve.createdAt}|${solve.time}`;
}

// Oldest first (old solves without createdAt count as 0)
function byDate(a, b) {
    return (a.createdAt ?? 0) - (b.createdAt ?? 0);
}

// When a block's newest solve was done, to keep the finished averages newest first
function blockDate(block) {
    return Math.max(...block.solves.map(s => s.createdAt ?? 0));
}

// Adds solves from elsewhere (an import) to the current session, in its average mode; returns how many were new
function addSolvesToSession(solves, averageObj, getCurrentSession) {
    ensureSessionShape(getCurrentSession);
    const session = getCurrentSession();

    // Every solve the session already has, finished or in progress
    const seen = new Set([
        ...session.averages.flatMap(block => block.solves),
        ...averageObj.solvesArray
    ].map(solveKey));

    // Keep only new solves (a solve twice in the file also counts once)
    const newSolves = solves.filter(solve => {
        const key = solveKey(solve);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    joinInProgress(newSolves, averageObj, session);
    return newSolves.length;
}

// Puts solves among the solves in progress by date (none is replaced); in a block mode, every whole block becomes a finished average
function joinInProgress(solves, averageObj, session) {
    // The solves join the average in progress, all in date order
    let inProgress = [...averageObj.solvesArray, ...solves].sort(byDate);

    // Block modes: every whole block, oldest first, becomes a finished average (classic keeps them all in progress)
    if (averageObj.mode !== "classic") {
        const size = getNeededSolves(averageObj.mode);
        while (inProgress.length >= size) {
            session.averages.push(buildAverageBlock(inProgress.slice(0, size), averageObj.mode));
            inProgress = inProgress.slice(size);
        }
        // Finished averages newest first, the new ones placed by date among the old ones
        session.averages.sort((a, b) => blockDate(b) - blockDate(a));
    }

    averageObj.solvesArray = inProgress;
    averageObj.solveCounter = inProgress.length;
}


// Adds competition rounds ([{ mode, solves }]) to a session, skipping solves it has: an all-new round with a mode is its own average, the other new solves join the session's mode; returns how many were new
function addRoundsToSession(rounds, averageObj, getSession) {
    ensureSessionShape(getSession);
    const session = getSession();

    // Every solve the session already has, finished or in progress
    const seen = new Set([
        ...session.averages.flatMap(block => block.solves),
        ...averageObj.solvesArray
    ].map(solveKey));

    // How many solves were new, and the new solves that can't be their own average
    let added = 0;
    const loose = [];

    rounds.forEach(round => {
        // The round's solves the session doesn't have yet
        const newSolves = round.solves.filter(solve => !seen.has(solveKey(solve)));
        // A full round the session has none of: its own average, in its own mode (like buildRoundsSession)
        if (round.mode && newSolves.length === round.solves.length) {
            session.averages.push(buildAverageBlock(round.solves, round.mode));
            added += newSolves.length;
        } else {
            // No mode, or part of it is already in the session: only its missing solves, grouped like any import
            loose.push(...newSolves);
        }
    });

    // The loose solves join the average in progress, cut into the session's mode by date
    added += addSolvesToSession(loose, averageObj, getSession);

    // Finished averages newest first, the new rounds placed by date (addSolvesToSession skips this in classic mode)
    session.averages.sort((a, b) => blockDate(b) - blockDate(a));
    return added;
}

export {
    addAverageBlock,
    getSessionAverages,
    getLastSolveTarget,
    getLastSolve,
    penalty2,
    remove2,
    applyPenaltyToLast,
    removeLastSolve,
    addSolvesToSession,
    addRoundsToSession
};
