import { averageObj, classicStats, updateClassicStats } from "../average/avgController.js";
import { sessionsObj } from "./sessionState.js";
import * as solve from "./solve.js";

// Startup: use the saved session's average mode


// getCurrentSession is a function declaration, so it can be called before the line that defines it
const session = getCurrentSession();
averageObj.mode = session.mode || "ao5";
const modeSel = document.getElementById("modeSelect");
if (modeSel) modeSel.value = averageObj.mode;


// Saving and reading sessions

// Copies the average in progress into the current session and saves every session to localStorage
function saveSessions() {

    const session = sessionsObj.sessions[sessionsObj.currentSession];

    // The solves of the average in progress are kept as the session's "buffer"
    session.buffer = {
        mode: averageObj.mode,
        solveCounter: averageObj.solveCounter,
        solvesArray: averageObj.solvesArray
    };

    localStorage.setItem("sessions", JSON.stringify(sessionsObj.sessions));
    localStorage.setItem("currentSession", sessionsObj.currentSession);
    localStorage.setItem("sessionOrder", JSON.stringify(getSessionOrder()));
}

// Session names in the select's order: the saved order without deleted sessions, then any new ones (New, imports)
function getSessionOrder() {
    const names = Object.keys(sessionsObj.sessions);
    // Drop the names of sessions that are gone (deleted, renamed)
    const kept = sessionsObj.order.filter(name => names.includes(name));
    // Sessions the order doesn't have yet go at the end
    const added = names.filter(name => !kept.includes(name));
    sessionsObj.order = [...kept, ...added];
    return sessionsObj.order;
}

// The session in use, created empty if it doesn't exist yet
function getCurrentSession() {
    if (!sessionsObj.sessions[sessionsObj.currentSession]) {
        sessionsObj.sessions[sessionsObj.currentSession] = { averages: [] };
    }
    return sessionsObj.sessions[sessionsObj.currentSession];
}

// Session select

// Fills the select: one option per session, a divider, then New, Rename, Move up, Move down and Delete
function renderSessionSelect() {
    const select = sessionsObj.selectEl;
    select.innerHTML = "";
    const order = getSessionOrder();

    // Sessions
    order.forEach(name => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        if (name === sessionsObj.currentSession) opt.selected = true;
        select.appendChild(opt);
    });

    // Separator
    const sep = document.createElement("option");
    sep.disabled = true;
    sep.textContent = "────────────";
    select.appendChild(sep);

    // Actions
    select.appendChild(new Option("➕ New session...", "__new__"));
    select.appendChild(new Option("✏ Rename current...", "__rename__"));

    // Move up / down, greyed out when the current session is already first or last
    const upOpt = new Option("▲ Move current up", "__up__");
    upOpt.disabled = order[0] === sessionsObj.currentSession;
    select.appendChild(upOpt);
    const downOpt = new Option("▼ Move current down", "__down__");
    downOpt.disabled = order[order.length - 1] === sessionsObj.currentSession;
    select.appendChild(downOpt);

    select.appendChild(new Option("🗑 Delete current...", "__delete__"));
}

// Moves the current session one place up (step -1) or down (step 1) in the select, and saves the new order
function moveSession(step) {
    const order = getSessionOrder();
    const from = order.indexOf(sessionsObj.currentSession);
    const to = from + step;

    // Swap places with the session next to it, unless it's already at the top or the bottom of the list
    if (to >= 0 && to < order.length) {
        [order[from], order[to]] = [order[to], order[from]];
        saveSessions();
    }

    // Redraw, which also puts the select back on the current session
    renderSessionSelect();
}

// Session actions

// Saves the old session (unless skipSave), makes name the current one, and tells the top bar with "sessionChanged"
function switchSession(name, skipSave = false) {
    if (!skipSave) {
        saveSessions();
    }

    sessionsObj.currentSession = name;
    renderSessionSelect();
    sessionsObj.selectEl.value = name;

    document.dispatchEvent(new CustomEvent("sessionChanged"));
    localStorage.setItem("currentSession", sessionsObj.currentSession);
}

// A pick in the session select: an action option, or another session
sessionsObj.selectEl.onchange = () => {
    const val = sessionsObj.selectEl.value;

    // New: ask for a name; an empty or taken name cancels
    if (val === "__new__") {
        const name = prompt("New session name:");
        if (!name || sessionsObj.sessions[name]) {
            renderSessionSelect();
            return;
        }
        sessionsObj.sessions[name] = { averages: [] };
        switchSession(name);
        return;
    }

    // Rename: ask for the new name; empty, unchanged or taken cancels
    if (val === "__rename__") {
        const oldName = sessionsObj.currentSession;
        const newName = prompt("Rename session:", oldName);
        if (!newName || newName === oldName || sessionsObj.sessions[newName]) {
            renderSessionSelect();
            return;
        }

        // The renamed session keeps its place in the select (before the rebuild, or getSessionOrder drops the old name)
        sessionsObj.order = getSessionOrder().map(name => name === oldName ? newName : name);
        // Rebuild the sessions so the renamed one also keeps its place in the saved sessions (and the backup file)
        sessionsObj.sessions = Object.fromEntries(
            Object.entries(sessionsObj.sessions).map(([name, data]) => [name === oldName ? newName : name, data])
        );
        // Point at the new name before switchSession saves, or saveSessions looks for the old, gone one
        sessionsObj.currentSession = newName;
        switchSession(newName);
        return;
    }

    // Move up / down: the current session swaps places with the one above or below it
    if (val === "__up__" || val === "__down__") {
        moveSession(val === "__up__" ? -1 : 1);
        return;
    }

    // Delete: never the last session, and only after asking
    if (val === "__delete__") {
        if (Object.keys(sessionsObj.sessions).length === 1) {
            alert("You must have at least one session.");
            renderSessionSelect();
            return;
        }

        if (!confirm("Delete current session?")) {
            renderSessionSelect();
            return;
        }

        // Save first, so the other sessions' latest state is stored
        saveSessions();

        const old = sessionsObj.currentSession;
        delete sessionsObj.sessions[old];

        // Move to the first session left in the select
        const first = getSessionOrder()[0];

        // Skip saving because we already deleted old session
        switchSession(first, true);

        // Now save, with the new session's solves in progress loaded, or the deleted one comes back on reload
        saveSessions();

        return;
    }

    // Normal switch: another session was picked
    switchSession(val);
};

// Startup: fill the select and load the current session's state

renderSessionSelect();
changedSession();

// Clear button: deletes the session's averages and the solves in progress, after asking
function clearAverages() {
    if (!confirm("Delete all averages in this session?")) return;

    const session = getCurrentSession();

    // Clear everything first
    session.averages = [];
    averageObj.solvesArray = [];
    averageObj.solveCounter = 0;

    // Classic mode: rebuild (now empty) rolling averages, and store them in the session
    if(averageObj.mode === "classic") updateClassicStats(true);
    session.classicStats = structuredClone(classicStats);

    saveSessions(); // also saves the now empty buffer
}

// Loads the current session's average in progress and classic stats into the shared state
function changedSession() {
    const session = getCurrentSession();

    // A session that has never been saved has no buffer yet
    if (!session.buffer) {
        session.buffer = {
            mode: session.mode || "ao5",
            solveCounter: 0,
            solvesArray: []
        };
    }

    // Copies, so changes don't touch the session until the next save
    if (session.classicStats) {
        classicStats.current = structuredClone(session.classicStats.current);
        classicStats.best = structuredClone(session.classicStats.best);
        classicStats.history = structuredClone(session.classicStats.history);
    } else {
        // A session without classic stats (like a new one) must not show the previous session's
        classicStats.current = { mo3: null, ao5: null, ao12: null, ao100: null };
        classicStats.best = { mo3: null, ao5: null, ao12: null, ao100: null };
        classicStats.history = { mo3: [], ao5: [], ao12: [], ao100: [] };
    }

    averageObj.mode = session.buffer.mode;
    averageObj.solveCounter = session.buffer.solveCounter;
    averageObj.solvesArray = [...session.buffer.solvesArray];

    // No saved classic stats but classic mode: rebuild them from the buffer's solves
    if (!session.classicStats && averageObj.mode === "classic") updateClassicStats(true);

    const sel = document.getElementById("modeSelect");
    if (sel) sel.value = averageObj.mode;
}

// Solves (solve.js gets the session state from here)

// Saves a finished average at the top of the session
function addAverageBlock(block) {
    solve.addAverageBlock(block, getCurrentSession, saveSessions);
}

// The session's finished averages, newest first
function getSessionAverages() {
    return solve.getSessionAverages(getCurrentSession);
}

// Sets the penalty of a solve (blockIndex -1: in the average in progress) and recomputes its average
function penalty2(blockIndex, solveIndex, penalty) {
    solve.penalty2(blockIndex, solveIndex, penalty, averageObj, getCurrentSession, saveSessions);
}

// Removes a solve (blockIndex -1: from the average in progress)
function remove2(blockIndex, solveIndex) {
    solve.remove2(blockIndex, solveIndex, averageObj, getCurrentSession, saveSessions);
}

// setPenalty and removeSolve come from the modal controller (they also refresh the history and the modal)
function applyPenaltyToLast(penalty, setPenalty) {
    solve.applyPenaltyToLast(penalty, averageObj, getCurrentSession, updateClassicStats, setPenalty);
}

// Removes the most recent solve
function removeLastSolve(removeSolve) {
    solve.removeLastSolve(averageObj, getCurrentSession, removeSolve);
}

// The most recent solve, or null when the session has none
function getLastSolve() {
    return solve.getLastSolve(averageObj, getCurrentSession);
}

// The two most recent solves, oldest first ([previous, last])
function getLastTwoSolves() {
    return solve.getLastTwoSolves(averageObj, getCurrentSession);
}

// Adds imported solves to the current session in its average mode; returns how many were new
function addSolvesToSession(solves) {
    return solve.addSolvesToSession(solves, averageObj, getCurrentSession);
}

// Adds competition rounds to the session called name, current or not; returns how many solves were new
function addRoundsToSession(name, rounds) {
    // The current session's solves in progress live in averageObj, and its rolling averages in classicStats
    if (name === sessionsObj.currentSession) {
        const added = solve.addRoundsToSession(rounds, averageObj, getCurrentSession);
        // Classic mode recounts its rolling averages, and the session keeps a copy (like a file import)
        if (averageObj.mode === "classic") updateClassicStats(true);
        getCurrentSession().classicStats = structuredClone(classicStats);
        return added;
    }

    const session = sessionsObj.sessions[name];
    // Any other session keeps its solves in progress in its buffer (one never opened may not have one yet)
    if (!session.buffer) session.buffer = { mode: session.mode || "ao5", solveCounter: 0, solvesArray: [] };
    const added = solve.addRoundsToSession(rounds, session.buffer, () => session);
    // Its copy of the rolling averages is out of date; without it, opening the session rebuilds them (changedSession)
    if (session.buffer.mode === "classic") delete session.classicStats;
    return added;
}

export {
    getCurrentSession,
    saveSessions,
    sessionsObj,
    renderSessionSelect,
    switchSession,
    clearAverages,
    changedSession,
    addAverageBlock,
    getSessionAverages,
    penalty2,
    remove2,
    applyPenaltyToLast,
    removeLastSolve,
    getLastSolve,
    getLastTwoSolves,
    addSolvesToSession,
    addRoundsToSession
};
