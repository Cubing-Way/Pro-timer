import { generate3x3Scramble, displayScramble, currentScramble } from "./scramble.js";
import "./node_modules/scramble-display/dist/esm/index.js";
import { timerObj, timerPhases, wcaDelayFlag, inspection, startTimer, stopTimer } from "./timer.js";
import { addAverageBlock, applyPenaltyToLast, removeLastSolve, penalty2, remove2 } from "./solve.js";
import { getCurrentSession, saveSessions, toggleMode, clearAverages, changedSession } from "./session.js";
import { renderHistory } from "./render.js";
import { averageOfN, averageObj } from "./average.js";
import { openDetailsModal, modal } from "./modal.js";
import { renderStatsPage } from "./stats.js";

// ===============================
// Event select
// ===============================

const eventSelect = document.getElementById("eventSelect");
let event = getCurrentSession().scrambleType || "333";
// Default scramble
// Init scramble from session
const session = getCurrentSession();
event = session.scrambleType || "333";
eventSelect.value = event;

syncModeWithEvent(event);   // ✅

displayScramble(event);

eventSelect.addEventListener("change", () => {
    const session = getCurrentSession();

    event = eventSelect.value;

    session.scrambleType = event;
    saveSessions();

    syncModeWithEvent(event);   // ✅ AUTO FORCE MODE

    displayScramble(event);
});

document.addEventListener("sessionChanged", () => {
    const session = getCurrentSession();

    event = session.scrambleType || "333";
    eventSelect.value = event;

    syncModeWithEvent(event);   // ✅ AUTO FIX MODE

    displayScramble(event);
});

// ===============================
// Timer display helper
// ===============================

function setTimerDisplay(colorOrTime, content) {
    if (colorOrTime === "color") {
        document.getElementById("timer").style.color = content;
    } else if (colorOrTime === "time") {
        document.getElementById("timer").textContent = content;
    }
}

// ===============================
// Keyboard handling
// ===============================

function showOnlyTimerSafe() {
  const timer = document.getElementById("timer");
  const overlay = document.getElementById("touchOverlay"); // the invisible div

  if (!timer || !overlay) return;

  function hideRecursively(element) {
    // Skip the timer and the overlay
    if (element === timer || element === overlay) return;

    // If element contains timer somewhere, recurse
    if (element.contains(timer)) {
      [...element.children].forEach(hideRecursively);
    } else {
      element.classList.add("focus-hidden");
    }
  }

  hideRecursively(document.body);
}


function restoreUI() {
  document.querySelectorAll(".focus-hidden").forEach(el => {
    el.classList.remove("focus-hidden");
  });
}

document.getElementById("touchOverlay").addEventListener("touchstart", (e) => {

        e.preventDefault();
        if (e.repeat) return;

        timerPhases();


    if (timerObj.timerPhase === 1 && !timerObj.inspecting) {
        inspection();
    }

    if (timerObj.timerPhase === 3) {
        stopTimer();
        const block = averageOfN(document.getElementById("timer").innerHTML, currentScramble, timerObj.inspection);
        
        if (block) {
            addAverageBlock(block);
            console.log(block)
        }

        renderHistory();
        displayScramble(event);
        restoreUI();
    }
});

document.getElementById("touchOverlay").addEventListener("touchend", (e) => {
    e.preventDefault();
    if (e.repeat) return;

    if (timerObj.timerPhase === 1) {
        wcaDelayFlag();
    }

    if (timerObj.timerPhase === 2) {
        startTimer();
        showOnlyTimerSafe();
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === " ") {
        e.preventDefault();
        if (e.repeat) return;

        timerPhases();
    }

    if (e.key === " " && timerObj.timerPhase === 1 && !timerObj.inspecting) {
        inspection();
    }

    if (e.key === " " && timerObj.timerPhase === 3) {
        stopTimer();
        const block = averageOfN(document.getElementById("timer").innerHTML, currentScramble, timerObj.inspection);
        
        if (block) {
            addAverageBlock(block);
            console.log(block)
        }

        renderHistory();
        displayScramble(event);
        restoreUI();
    }
});

document.addEventListener("keyup", (e) => {
    e.preventDefault();
    if (e.repeat) return;

    if (e.key === " " && timerObj.timerPhase === 1) {
        wcaDelayFlag();
    }

    if (e.key === " " && timerObj.timerPhase === 2) {
        startTimer();
        showOnlyTimerSafe();
    }
});

const statsPage = document.getElementById("stats-page");
const openStatsBtn = document.getElementById("open-stats-btn");
const closeStatsBtn = document.getElementById("close-stats-btn");

openStatsBtn.addEventListener("click", () => {
  renderStatsPage();
  statsPage.classList.add("open");
});

closeStatsBtn.addEventListener("click", () => {
  statsPage.classList.remove("open");
});

function syncModeWithEvent(event) {
    const session = getCurrentSession();

    const mustBeMo3 = shouldForceMo3(event);
    const desiredMode = mustBeMo3 ? "mo3" : "ao5";

    if (averageObj.mode !== desiredMode) {
        averageObj.mode = desiredMode;
        session.mode = desiredMode;

        document.getElementById("modeBtn").textContent = "Mode: " + desiredMode;

        // Reset current average buffer
        averageObj.solvesArray = [];
        averageObj.solveCounter = 0;

        saveSessions();
    }
}

function shouldForceMo3(event) {
    return [
        "333bf",
        "444bf",
        "555bf",
        "666",
        "777"
    ].includes(event);
}

async function preloadCubingEvents() {
    const events = ["333", "444", "555", "222", "666"];
    for (const e of events) {
        await generate3x3Scramble(e); // generates but you can discard it
    }
}

preloadCubingEvents(); // call this on page load

// ===============================
// Buttons
// ===============================

document.getElementById("modeBtn").addEventListener("click", () => {
    toggleMode();
    renderHistory();
});

// ===============================
// State
// ===============================

const avgObj = {
    modeBtn: document.getElementById("modeBtn"),
    clearBtn: document.getElementById("clearBtn"),
    openSessionBtn: document.getElementById("modal-button"),
    penaltyOkBtn: document.getElementById("penaltyOkBtn"),
    penaltyPlus2Btn: document.getElementById("penaltyPlus2Btn"),
    penaltyDnfBtn: document.getElementById("penaltyDnfBtn"),
    removeLastBtn: document.getElementById("removeLastBtn")
};

document.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
        btn.blur();
    });
});

document.querySelectorAll("select").forEach(select => {
    select.addEventListener("change", () => {
        select.blur();
    });
});


// ===============================
// Penalty logic
// ===============================

window.setPenalty = function(blockIndex, solveIndex, penalty) {
    penalty2(blockIndex, solveIndex, penalty);
    saveSessions();
    renderHistory();

    if (!modal.classList.contains("hidden")) {
        openDetailsModal();
    }
};

window.removeSolve = function(blockIndex, solveIndex) {
    remove2(blockIndex, solveIndex)
    saveSessions();
    renderHistory();

    if (!modal.classList.contains("hidden")) {
        openDetailsModal();
    }
};

// ===============================
// Session change listener
// ===============================

document.addEventListener("sessionChanged", () => {
    changedSession();
    renderHistory();
});

avgObj.clearBtn.onclick = () => {
    clearAverages();
    renderHistory();
}

avgObj.openSessionBtn.onclick = openDetailsModal;

avgObj.penaltyOkBtn.onclick = () => {
    applyPenaltyToLast(null);
    renderHistory();
}

avgObj.penaltyPlus2Btn.onclick = () => {
    applyPenaltyToLast("+2");
    renderHistory();
}

avgObj.penaltyDnfBtn.onclick = () => {
    applyPenaltyToLast("DNF");
    renderHistory();
}

avgObj.removeLastBtn.onclick = () => removeLastSolve();

renderHistory();

// ===============================
// Exports
// ===============================

export { setTimerDisplay, currentScramble };
