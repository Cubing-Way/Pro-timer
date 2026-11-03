// Solve metrics: asks Cubisz for a solve's metrics, keeps track of the reviews under way, and saves the answers on their solves
import { requestMetrics, analysisLink } from "./metricsClient.js";
import { metricsHtml, metricsNoteHtml } from "./metricsView.js";
import { saveSessions } from "../session/sessionController.js";
import { sessionsObj } from "../session/sessionState.js";
import { averageObj } from "../average/avgController.js";
import { reviewSettObj } from "../settings/settingsState.js";
import { isMetricsEvent } from "../scramble/scrambleController.js";

// Failures in a row that stop a batch, since they mean something a next solve won't fix (offline, say)
const BATCH_FAILURE_LIMIT = 3;
// Characters localStorage holds in most browsers, and the room a batch leaves for new solves (about 2,500 of them)
const STORAGE_LIMIT = 5000000;
const STORAGE_ROOM = 500000;

// Reviews under way, by solve key: { solution, method, note }, where note says how it's going
const reviews = new Map();
// Why a solve's last review failed, by solve key
const failures = new Map();
// The batch under way: { at, total, note, stopping }, where at is the solve it's on and note says how that's going (null = none)
let batch = null;
// How the last batch ended, in words ("" = none yet)
let batchResult = "";
// What follows a batch, each told the key of the solve that changed (null = only the batch itself)
const batchListeners = [];

// What finds a solve again later (the same as the modal's rows): a finished average copies its solves, so holding on to the solve itself isn't enough
function solveKey(solve) {
    return `${solve.createdAt}|${solve.time}`;
}

// The solve with this key, wherever it is by now: the average in progress, a saved average, or another session (null = it was removed)
function findSolve(key) {
    const lists = [averageObj.solvesArray];
    Object.values(sessionsObj.sessions).forEach((session) => {
        session.averages?.forEach((average) => lists.push(average.solves ?? []));
        if (session.buffer) lists.push(session.buffer.solvesArray);
    });
    return lists.flat().find((solve) => solveKey(solve) === key) ?? null;
}

// Whether a review of this solution with this method is under way for the solve
function isUnderWay(key, solution, method) {
    const review = reviews.get(key);
    return review?.solution === solution && review.method === method;
}

// Whether a solve already has metrics for this solution and the method picked now
function metricsAreCurrent(solve, solution) {
    if (!solve.metrics || solve.solution !== solution) return false;
    // "" = no method was ever picked, so whichever it was reviewed with stands
    return !reviewSettObj.method || solve.metrics.method === reviewSettObj.method;
}

// Starts a solve's review, which ends with the returned promise; onChange(key) hears every change, so the page can redraw it; deviceOnly keeps it off Cubisz's server
function startReview(solve, solution, onChange, deviceOnly = false) {
    const key = solveKey(solve);
    const method = reviewSettObj.method;
    // Whether this is still the review the solve wants (a newer solution or method replaces it)
    const isCurrent = () => isUnderWay(key, solution, method);

    reviews.set(key, { solution, method, note: "Waiting for the review…" });
    return requestMetrics({ scramble: solve.scramble, solution, time: solve.time, method, deviceOnly }, ({ run, runs }) => {
        if (!isCurrent()) return;
        reviews.get(key).note = `Reviewing: engine run ${run} of ${runs}…`;
        onChange(key);
    }).then(
        (metrics) => {
            if (!isCurrent()) return;
            reviews.delete(key);
            const found = findSolve(key);
            // The solve can be gone by now
            if (found) {
                found.metrics = metrics;
                saveSessions();
            }
            onChange(key);
        },
        (error) => {
            if (!isCurrent()) return;
            reviews.delete(key);
            failures.set(key, error.message);
            onChange(key);
        },
    );
}

// Sets which solution a solve's metrics are for (null = none) and starts its review, unless that same one is already under way;
// keepOld leaves the old metrics until the new ones arrive (same solution with another method: they're still true, so a failed review doesn't lose them)
function updateMetrics(solve, solution, onChange, keepOld = false) {
    const key = solveKey(solve);
    if (solution && isUnderWay(key, solution, reviewSettObj.method)) return;
    reviews.delete(key);
    failures.delete(key);
    if (!keepOld) delete solve.metrics;
    if (solution) startReview(solve, solution, onChange);
    onChange(key);
}

// The solves a batch can review: a solved solution with no metrics yet, on an event reviews mean something for
function getBatchableSolves(solves, sessionEvent) {
    return solves.filter((solve) => solve.status === "Solved" && solve.solution && !solve.metrics && isMetricsEvent(solve.event ?? sessionEvent));
}

// Adds what hears a batch's changes
function onBatchChange(listener) {
    batchListeners.push(listener);
}

// Tells everything following the batch that it changed (key = the solve that changed, if one did)
function notifyBatch(key = null) {
    batchListeners.forEach((listener) => listener(key));
}

// Whether localStorage is too full for more metrics, which are about 3 KB per solve and could leave no room for new solves
function storageIsNearlyFull() {
    let used = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const name = localStorage.key(i);
        used += name.length + localStorage.getItem(name).length;
    }
    return used > STORAGE_LIMIT - STORAGE_ROOM;
}

// Reviews one solve of a batch; returns why it failed ("" = it didn't)
async function reviewBatchSolve(solve) {
    const key = solveKey(solve);
    failures.delete(key);
    const finished = startReview(solve, solve.solution, (changedKey) => {
        batch.note = reviews.get(changedKey)?.note ?? "";
        notifyBatch(changedKey);
    }, true);
    batch.note = reviews.get(key).note;
    notifyBatch(key);
    await finished;
    return failures.get(key) ?? "";
}

// Reviews these solves on this device, never on Cubisz's server, one at a time: a Submit in the meantime waits for one solve at most, and a stop takes effect after it
async function startBatch(solves) {
    // Solves are found again by key, since a finished average copies them
    const keys = solves.map(solveKey);
    let reviewed = 0;
    let failed = 0;
    let failedInARow = 0;
    // Why it ended early ("" = it went through them all)
    let stoppedBy = "";

    batch = { at: 0, total: keys.length, note: "", stopping: false };
    batchResult = "";

    try {
        for (const key of keys) {
            batch.at++;
            if (batch.stopping) {
                stoppedBy = "Stopped";
                break;
            }
            if (storageIsNearlyFull()) {
                stoppedBy = "Stopped because this browser's storage is nearly full";
                break;
            }
            // It can be gone by now, or Submit can have reviewed it, be reviewing it or changed it to an unsolved solution
            const solve = findSolve(key);
            if (!solve || solve.metrics || solve.status !== "Solved" || reviews.has(key)) continue;

            const failure = await reviewBatchSolve(solve);
            if (!failure) {
                reviewed++;
                failedInARow = 0;
                continue;
            }
            failed++;
            failedInARow++;
            if (failedInARow === BATCH_FAILURE_LIMIT) {
                stoppedBy = `Stopped after ${BATCH_FAILURE_LIMIT} failures in a row (${failure})`;
                break;
            }
        }
    } catch (error) {
        // Saving threw (a full localStorage), and the metrics of the solve under way are only in memory
        stoppedBy = `Stopped because the metrics couldn't be saved (${error.message})`;
    }

    // How it went, ending in how many were reviewed and how many failed
    const failedText = failed ? ` ${failed} failed, and Open Session says why under each.` : "";
    batchResult = `${stoppedBy ? `${stoppedBy}. ` : ""}Reviewed ${reviewed} of ${keys.length}.${failedText}`;
    batch = null;
    notifyBatch();
}

// Stops the batch after the solve under way, whose metrics are kept
function stopBatch() {
    if (!batch) return;
    batch.stopping = true;
    notifyBatch();
}

// The batch under way (null = none)
function getBatch() {
    return batch;
}

// How the last batch ended, in words ("" = none yet)
function getBatchResult() {
    return batchResult;
}

// HTML of a solve's metrics, with the link to the same review in full on Cubisz's site, rebuilt there from the engine runs saved with them
function savedMetricsHtml(solve) {
    if (!solve.metrics) return "";
    const { method, time, runs } = solve.metrics;
    const link = analysisLink({ scramble: solve.scramble, solution: solve.solution, time: time ?? solve.time, method, runs: JSON.stringify(runs) });
    return metricsHtml(solve.metrics, link);
}

// HTML of what a solve has to show: its review under way, why the last one failed, and its metrics (nothing = never reviewed)
function metricsRowHtml(solve) {
    const key = solveKey(solve);
    if (reviews.has(key)) return metricsNoteHtml(reviews.get(key).note);
    if (failures.has(key)) return metricsNoteHtml(`Couldn't review this solve: ${failures.get(key)}. Press Submit to try again.`) + savedMetricsHtml(solve);
    return savedMetricsHtml(solve);
}

export { solveKey, findSolve, metricsAreCurrent, updateMetrics, metricsRowHtml, getBatchableSolves, onBatchChange, startBatch, stopBatch, getBatch, getBatchResult };
