import { averageObj, classicStats, updateClassicStats } from "../average/avgController.js";
import { sessionsObj } from "./sessionState.js";
import * as solve from "./solve.js";

// ===============================
// Init
// ===============================


// Now it's safe:
const session = getCurrentSession();
averageObj.mode = session.mode || "ao5";
const modeSel = document.getElementById("modeSelect");
if (modeSel) modeSel.value = averageObj.mode;


// ===============================
// Helpers
// ===============================

function saveSessions() {

    const session = sessionsObj.sessions[sessionsObj.currentSession];

    // 🔥 Push global averageObj INTO session
    session.buffer = {
        mode: averageObj.mode,
        solveCounter: averageObj.solveCounter,
        solvesArray: averageObj.solvesArray
    };    

    localStorage.setItem("sessions", JSON.stringify(sessionsObj.sessions));
    localStorage.setItem("currentSession", sessionsObj.currentSession);
}

function getCurrentSession() {
    if (!sessionsObj.sessions[sessionsObj.currentSession]) {
        sessionsObj.sessions[sessionsObj.currentSession] = { averages: [] };
    }
    return sessionsObj.sessions[sessionsObj.currentSession];
}

// ===============================
// UI
// ===============================

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

// ===============================
// Actions
// ===============================

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

sessionsObj.selectEl.onchange = () => {
    const val = sessionsObj.selectEl.value;

    // ---- New ----
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

    // ---- Rename ----
    if (val === "__rename__") {
        const oldName = sessionsObj.currentSession;
        const newName = prompt("Rename session:", oldName);
        if (!newName || newName === oldName || sessionsObj.sessions[newName]) {
            renderSessionSelect();
            return;
        }

        sessionsObj.sessions[newName] = sessionsObj.sessions[oldName];
        delete sessionsObj.sessions[oldName];
        switchSession(newName);
        return;
    }

    // ---- Delete ----
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

        // 🔥 SAVE BEFORE deleting
        saveSessions();

        const old = sessionsObj.currentSession;
        delete sessionsObj.sessions[old];

        const first = Object.keys(sessionsObj.sessions)[0];

        // 🔥 Skip saving because we already deleted old session
        switchSession(first, true);

        return;
    }

    // ---- Normal switch ----
    switchSession(val);
};

// ===============================
// Init
// ===============================

renderSessionSelect();
changedSession();

function clearAverages() {
    if (!confirm("Delete all averages in this session?")) return;

    const session = getCurrentSession();

    // Clear everything first
    session.averages = [];
    averageObj.solvesArray = [];
    averageObj.solveCounter = 0;

    if(averageObj.mode === "classic") updateClassicStats(true);
    session.classicStats = structuredClone(classicStats);

    saveSessions(); // 🔥 now buffer is empty too
}

function changedSession() {
    const session = getCurrentSession();

    if (!session.buffer) {
        session.buffer = {
            mode: session.mode || "ao5",
            solveCounter: 0,
            solvesArray: []
        };
    }

    if (session.classicStats) {
        classicStats.current = structuredClone(session.classicStats.current);
        classicStats.best = structuredClone(session.classicStats.best);
        classicStats.history = structuredClone(session.classicStats.history);
    }

    averageObj.mode = session.buffer.mode;
    averageObj.solveCounter = session.buffer.solveCounter;
    averageObj.solvesArray = [...session.buffer.solvesArray];

    const sel = document.getElementById("modeSelect");
    if (sel) sel.value = averageObj.mode;
}

// ===============================
// Solves (solve.js gets the session state from here)
// ===============================

function addAverageBlock(block) {
    solve.addAverageBlock(block, getCurrentSession, saveSessions);
}

function getSessionAverages() {
    return solve.getSessionAverages(getCurrentSession);
}

function penalty2(blockIndex, solveIndex, penalty) {
    solve.penalty2(blockIndex, solveIndex, penalty, getCurrentSession, saveSessions);
}

function remove2(blockIndex, solveIndex) {
    solve.remove2(blockIndex, solveIndex, averageObj, getCurrentSession, saveSessions);
}

// setPenalty and removeSolve come from the modal controller (they also refresh the history and the modal)
function applyPenaltyToLast(penalty, setPenalty) {
    solve.applyPenaltyToLast(penalty, averageObj, getCurrentSession, updateClassicStats, setPenalty);
}

function removeLastSolve(removeSolve) {
    solve.removeLastSolve(averageObj, getCurrentSession, removeSolve);
}

// ===============================
// Exports
// ===============================

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
