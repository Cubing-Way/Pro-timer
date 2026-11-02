// Solve metrics: asks Cubisz for a solve's metrics, keeps track of the reviews under way, and saves the answers on their solves
import { requestMetrics, analysisLink } from "./metricsClient.js";
import { metricsHtml, metricsNoteHtml } from "./metricsView.js";
import { saveSessions } from "../session/sessionController.js";
import { sessionsObj } from "../session/sessionState.js";
import { averageObj } from "../average/avgController.js";
import { reviewSettObj } from "../settings/settingsState.js";

// Reviews under way, by solve key: { solution, method, note }, where note says how it's going
const reviews = new Map();
// Why a solve's last review failed, by solve key
const failures = new Map();

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

// Starts a solve's review; onChange(key) hears every change, so the page can redraw it
function startReview(solve, solution, onChange) {
    const key = solveKey(solve);
    const method = reviewSettObj.method;
    // Whether this is still the review the solve wants (a newer solution or method replaces it)
    const isCurrent = () => isUnderWay(key, solution, method);

    reviews.set(key, { solution, method, note: "Waiting for the review…" });
    requestMetrics({ scramble: solve.scramble, solution, time: solve.time, method }, ({ run, runs }) => {
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

export { solveKey, findSolve, metricsAreCurrent, updateMetrics, metricsRowHtml };
