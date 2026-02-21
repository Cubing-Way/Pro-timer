import { averageObj } from "./average.js"


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

console.log(session.buffer)

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

    const session = getCurrentSession();
    session.averages = [];
    saveSessions();

    averageObj.solvesArray = [];
    averageObj.scramblesArray = [];
    averageObj.solveCounter = 0;
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

    averageObj.mode = session.buffer.mode;
    averageObj.solveCounter = session.buffer.solveCounter;
    averageObj.solvesArray = [...session.buffer.solvesArray];

    const sel = document.getElementById("modeSelect");
    if (sel) sel.value = averageObj.mode;
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
