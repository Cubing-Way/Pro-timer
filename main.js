import { displayScramble, currentScramble } from "./scramble.js";
import { timerObj, timerPhases, wcaDelayFlag, inspection, startTimer, stopTimer, inspection2 } from "./timer.js";
import { addAverageBlock, applyPenaltyToLast, removeLastSolve, penalty2, remove2 } from "./solve.js";
import { getCurrentSession, saveSessions, toggleMode, clearAverages, changedSession } from "./session.js";
import { renderHistory } from "./render.js";
import { averageOfN, averageObj, parseTimeToSeconds, formatSecondsToTime } from "./average.js";
import { openDetailsModal, modal } from "./modal.js";
import { renderStatsPage } from "./stats.js";

function bindVisibilityToggle(selectId, targetId) {
    const select = document.getElementById(selectId);
    const target = document.querySelectorAll(`.${targetId}`);

    if (!select || !target) return;

    function apply() {
        target.forEach(el => {
            el.style.display = select.value === "show" ? "" : "none";
        });
    }

    select.addEventListener("change", apply);
    apply(); // run once on load
}

bindVisibilityToggle("toggle-scramble-visualizer", "panel-cube");
bindVisibilityToggle("toggle-statistics", "right-sidebar");
bindVisibilityToggle("toggle-session-history", "left-sidebar");
bindVisibilityToggle("toggle-scramble-text", "scramble-container");
bindVisibilityToggle("toggle-penalty-bar", "penalty-bar");
bindVisibilityToggle("toggle-average-preview", "main-footer");

let inspectionType = localStorage.getItem("inspectionType") || "WCA";
let previousInspectionType = inspectionType;
document.getElementById("inspection-type").value = inspectionType;
document.getElementById("inspection-type").addEventListener("change", () => {
    previousInspectionType = inspectionType;
    inspectionType = document.getElementById("inspection-type").value;
    localStorage.setItem("inspectionType", inspectionType);
});

let delayFlagType = localStorage.getItem("delayFlagType") || "WCA";
document.getElementById("delay-flag").value = delayFlagType;
document.getElementById("delay-flag").addEventListener("change", () => {
    delayFlagType = document.getElementById("delay-flag").value;
    localStorage.setItem("delayFlagType", delayFlagType);
});

// Time insertion setting (Timer or Typing)
let timeInsertion = localStorage.getItem("timeInsertion") || "Timer";
let timerFlag = false;
    if (timeInsertion === "Typing") {
        timerFlag = true;
    } else {
        timerFlag = false;
    }
document.getElementById("time-insertion").value = timeInsertion;
document.getElementById("time-insertion").addEventListener("change", () => {
    timeInsertion = document.getElementById("time-insertion").value;
    if (timeInsertion === "Typing") {
        timerFlag = true;
    } else {
        timerFlag = false;
    }
    localStorage.setItem("timeInsertion", timeInsertion);
    updateTypingUI();
});

function updateTypingUI() {
    const container = document.getElementById("typing-container");
    if (!container) return;
    if (timeInsertion === "Typing") {
        container.style.display = "block";
        const input = document.getElementById("typed-time");
        if (input) input.focus();
    } else {
        container.style.display = "none";
    }
}


let lastTime = null;
// Handle typed time submission
document.addEventListener("DOMContentLoaded", () => {
    updateTypingUI();
    const addBtn = document.getElementById("typed-time-add");
    const input = document.getElementById("typed-time");
    const inspectionLeaveBtn = document.getElementById("inspection-leave-btn");

    if (addBtn && input) {
        addBtn.addEventListener("click", () => {
            const raw = input.value.trim().replace(',', '.');
            if (!raw) return;
            const seconds = parseTimeToSeconds(raw);
            if (!Number.isFinite(seconds)) {
                input.style.border = '2px solid #e74c3c';
                input.focus();
                setTimeout(() => input.style.border = '', 1500);
                return;
            }
            lastTime = formatSecondsToTime(seconds);
            document.getElementById("timer").textContent = lastTime;
            const block = averageOfN(seconds, currentScramble, timerObj.inspection, inspectionType);
            if (block) addAverageBlock(block);
            renderHistory();
            displayScramble(event, vis);
            input.value = "";
        });

        input.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter") {
                ev.preventDefault();
                addBtn.click();
            }
        });
    }
});

const overlay = document.getElementById("settingsOverlay");
const openBtn = document.getElementById("settingsBtn");
const closeBtn = document.getElementById("closeSettings");

openBtn.addEventListener("click", () => {
    overlay.classList.add("open");
});

closeBtn.addEventListener("click", () => {
    overlay.classList.remove("open");
});



// ===============================
// Event select
// ===============================

const eventSelect = document.getElementById("eventSelect");
let event = getCurrentSession().scrambleType || "333";
let vis = null;
    if (window.innerWidth > 768) {
        vis = document.querySelector("#scrambleVis");
    } else {
        vis = document.querySelector("#scrambleVis2");
    }
// Default scramble
// Init scramble from session
const session = getCurrentSession();
event = session.scrambleType || "333";
eventSelect.value = event;

syncModeWithEvent(event);   // ✅

displayScramble(event, vis);

eventSelect.addEventListener("change", () => {
    const session = getCurrentSession();

    event = eventSelect.value;

    session.scrambleType = event;
    saveSessions();

    syncModeWithEvent(event);   // ✅ AUTO FORCE MODE

    // Auto-set inspection to None for BLD events, restore for non-BLD
    if (event.includes("bf")) {
        previousInspectionType = inspectionType;
        inspectionType = "None";
        document.getElementById("inspection-type").value = "None";
        localStorage.setItem("inspectionType", "None");
    } else {
        inspectionType = previousInspectionType;
        document.getElementById("inspection-type").value = previousInspectionType;
        localStorage.setItem("inspectionType", previousInspectionType);
    }

    displayScramble(event, vis);
});

document.addEventListener("sessionChanged", () => {
    const session = getCurrentSession();

    event = session.scrambleType || "333";
    eventSelect.value = event;

    syncModeWithEvent(event);   // ✅ AUTO FIX MODE

    displayScramble(event, vis);
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


let scrDisplayFlag = false;


document.getElementById("touchOverlay").addEventListener("touchstart", (e) => {
    // If the touch originated inside an input or the typing UI, ignore it
    const touchTarget = e.target;
    if (touchTarget && touchTarget.closest && (touchTarget.closest('input') || touchTarget.closest('#typing-container'))) {
        return;
    }
    e.preventDefault();
    if (e.repeat || timerFlag) return;

    if (scrDisplayFlag) {
        document.querySelector(".panel-cube2").style.display = "none";
        document.getElementById("scramble-button").style.justifySelf = "center";
        document.getElementById("scramble-button").innerHTML = "Scramble visualizer";
        scrDisplayFlag = false;
        return;
    }
    if (timerObj.timerPhase === 0 && inspectionType === "None") {
        timerObj.timerPhase = 1; // skip inspection
    }

    timerPhases(delayFlagType);

    if (timerObj.timerPhase === 1 && !timerObj.inspecting && inspectionType !== "None") {
        inspection(inspectionType);
    }

    if (timerObj.timerPhase === 3) {
        stopTimer();
        const block = averageOfN(document.getElementById("timer").innerHTML, currentScramble, timerObj.inspection, inspectionType);
        
        if (block) {
            addAverageBlock(block);
        }

        renderHistory();
        displayScramble(event, vis);
        restoreUI();
    }
});

document.getElementById("touchOverlay").addEventListener("touchend", (e) => {
    // If the touch ended inside an input or the typing UI, ignore it
    const touchTarget = e.target;
    if (touchTarget && touchTarget.closest && (touchTarget.closest('input') || touchTarget.closest('#typing-container'))) {
        return;
    }
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

document.getElementById("touchOverlay").addEventListener("touchstart", () => {
    if (!timerFlag) return;
    inspection2();
});

document.getElementById("inspection-btn").addEventListener("click", () => {
    if (!timerFlag) return;
    inspection2();
});


document.addEventListener("keydown", (e) => {
    if (!timerFlag) return;
    if (e.code !== "Space" || e.repeat) return;
    inspection2();
});




document.addEventListener("keydown", (e) => {
    if (e.key === " ") {
    e.preventDefault();
    if (e.repeat || timerFlag) return;


    if (timerObj.timerPhase === 0 && inspectionType === "None") {
        timerObj.timerPhase = 1; // skip inspection
    }
    
    timerPhases(delayFlagType);

    }

    if (e.key === " " && timerObj.timerPhase === 1 && !timerObj.inspecting && inspectionType !== "None") {
        inspection(inspectionType);
    }

    if (e.key === " " && timerObj.timerPhase === 3) {
        stopTimer();
        const block = averageOfN(document.getElementById("timer").innerHTML, currentScramble, timerObj.inspection, inspectionType);
        
        if (block) {
            addAverageBlock(block);
            console.log(block)
        }

        renderHistory();
        displayScramble(event, vis);
        restoreUI();
    }
});

document.addEventListener("keyup", (e) => {
    // Only intercept Space key so typing in inputs isn't blocked
    if (e.key !== " ") return;
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

    const desiredMode = getDefaultModeForEvent(event);

    if (averageObj.mode !== desiredMode) {
        averageObj.mode = desiredMode;
        session.mode = desiredMode;

        const sel = document.getElementById("modeSelect");
        if (sel) sel.value = desiredMode;

        // Reset current average buffer
        averageObj.solvesArray = [];
        averageObj.solveCounter = 0;

        saveSessions();
    }
}

function getDefaultModeForEvent(event) {
    // BLD events: specific modes
    if (event === "333bf") return "bo5"; // 3x3 blindfolded: best of 5
    if (event === "444bf") return "bo3"; // 4x4 blindfolded: best of 3
    if (event === "555bf") return "bo3"; // 5x5 blindfolded: best of 3
    
    // Other events that force mo3
    if (["666", "777"].includes(event)) return "mo3";
    
    // Default to ao5
    return "ao5";
}

// ===============================
// Buttons
// ===============================

const modeSelectEl = document.getElementById("modeSelect");
if (modeSelectEl) {
    modeSelectEl.addEventListener("change", (ev) => {
        const val = ev.target.value;
        const session = getCurrentSession();
        averageObj.mode = val;
        session.mode = val;
        saveSessions();

        renderHistory();
    });
}

document.getElementById("scramble-button").addEventListener("click", () => {
    if (scrDisplayFlag) {
        document.querySelector(".panel-cube2").style.display = "none";
        document.getElementById("scramble-button").innerHTML = "Scramble visualizer";
        document.getElementById("scramble-button").style.justifySelf = "center";
        scrDisplayFlag = false;
        return;
    }
    scrDisplayFlag = true;
    document.querySelector(".panel-cube2").style.display = "grid";
    document.getElementById("scramble-button").style.justifySelf = "left";
    document.getElementById("scramble-button").innerHTML = "close";
});

// ===============================
// State
// ===============================

const avgObj = {
    modeSelect: document.getElementById("modeSelect"),
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

export { setTimerDisplay, currentScramble, lastTime, timerFlag };
