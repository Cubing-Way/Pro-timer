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
}

// The session in use, created empty if it doesn't exist yet
function getCurrentSession() {
    if (!sessionsObj.sessions[sessionsObj.currentSession]) {
        sessionsObj.sessions[sessionsObj.currentSession] = { averages: [] };
    }
    return sessionsObj.sessions[sessionsObj.currentSession];
}

// Session select

// Fills the select: one option per session, a divider, then New, Rename and Delete
function renderSessionSelect() {
    const select = sessionsObj.selectEl;
    select.innerHTML = "";

    // Sessions
    Object.keys(sessionsObj.sessions).forEach(name => {
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
    select.appendChild(new Option("🗑 Delete current...", "__delete__"));
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

        // Rebuild the sessions so the renamed one keeps its place in the list
        sessionsObj.sessions = Object.fromEntries(
            Object.entries(sessionsObj.sessions).map(([name, data]) => [name === oldName ? newName : name, data])
        );
        // Point at the new name before switchSession saves, or saveSessions looks for the old, gone one
        sessionsObj.currentSession = newName;
        switchSession(newName);
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

        // Move to the first session left
        const first = Object.keys(sessionsObj.sessions)[0];

        // Skip saving because we already deleted old session
        switchSession(first, true);

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

// Sets the penalty of a solve in a saved average and recomputes the average
function penalty2(blockIndex, solveIndex, penalty) {
    solve.penalty2(blockIndex, solveIndex, penalty, getCurrentSession, saveSessions);
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

export {
    getCurrentSession,
    saveSessions,
    sessionsObj,
    renderSessionSelect,
    clearAverages,
    changedSession,
    addAverageBlock,
    getSessionAverages,
    penalty2,
    remove2,
    applyPenaltyToLast,
    removeLastSolve
};
