import { averageObj } from "./average.js";
import { clearSessionAverages } from "./solve.js";

// ===============================
// Session state
// ===============================

// ===============================
// Init
// ===============================

const sessionsObj = {
    sessions: JSON.parse(localStorage.getItem("sessions")) || {
        "Default": { averages: [] }
    },
    currentSession: localStorage.getItem("currentSession") || "Default",
    selectEl: document.getElementById("sessionSelect")
};

// Now it's safe:
const session = getCurrentSession();
averageObj.mode = session.mode || "ao5";
const modeSel = document.getElementById("modeSelect");
if (modeSel) modeSel.value = averageObj.mode;


// ===============================
// Helpers
// ===============================

function saveSessions() {
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

function switchSession(name) {
    sessionsObj.currentSession = name;
    saveSessions();
    renderSessionSelect();

    // Tell averages module to refresh
    document.dispatchEvent(new CustomEvent("sessionChanged"));
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

        delete sessionsObj.sessions[sessionsObj.currentSession];
        const first = Object.keys(sessionsObj.sessions)[0];
        switchSession(first);
        return;
    }

    // ---- Normal switch ----
    switchSession(val);
};

// ===============================
// Init
// ===============================

renderSessionSelect();

function toggleMode() {
    const session = getCurrentSession();
    const event = session.scrambleType || "333";

    // Define mode cycles for each event/category
    let availableModes = ["ao5", "mo3"]; // default

    if (event === "333bf") {
        availableModes = ["bo5", "ao5", "mo3"];
    } else if (event === "444bf" || event === "555bf") {
        availableModes = ["bo3", "ao5", "mo3"];
    } else if (["666", "777"].includes(event)) {
        availableModes = ["mo3", "ao5"];
    }

    // Find current mode index and cycle to next
    const currentIndex = availableModes.indexOf(averageObj.mode);
    const nextIndex = (currentIndex + 1) % availableModes.length;
    averageObj.mode = availableModes[nextIndex];

    session.mode = averageObj.mode;   // ✅ STORE IN SESSION

    saveSessions();

    const sel = document.getElementById("modeSelect");
    if (sel) sel.value = averageObj.mode;

    // Reset current average buffer
    averageObj.solvesArray = [];
    averageObj.scramblesArray = [];
    averageObj.solveCounter = 0;
}

function clearAverages() {
    if (!confirm("Delete all averages in this session?")) return;

    clearSessionAverages();

    averageObj.solvesArray = [];
    averageObj.scramblesArray = [];
    averageObj.solveCounter = 0;
    localStorage.setItem("cube_average_buffer", JSON.stringify(averageObj));
}

function changedSession() {
    const session = getCurrentSession();

    // Load mode from session
    averageObj.mode = session.mode || "ao5";
    const sel = document.getElementById("modeSelect");
    if (sel) sel.value = averageObj.mode;

    // Reset current average buffer
    averageObj.solvesArray = [];
    averageObj.scramblesArray = [];
    averageObj.solveCounter = 0;
}

// ===============================
// Exports
// ===============================

export {
    getCurrentSession,
    saveSessions,
    sessionsObj,
    renderSessionSelect,
    toggleMode, 
    clearAverages,
    changedSession
};
