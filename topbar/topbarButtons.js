import { eventObj, vis } from "./event.js";
import { getCurrentSession, saveSessions, clearAverages, changedSession } from "../session.js";
import { averageObj } from "../average.js";
import { renderHistory } from "../render.js";
import { displayScramble, currentScramble } from "../scramble.js";
import { openDetailsModal } from "./modal.js";
import { timerSettObj } from "../settings/timerSetObj.js";
import { renderStatsPage } from "../stats";
import { timerDOMObj } from "../timer/timerDOM.js";
import { applyPenaltyToLast, removeLastSolve } from "../solve.js";
import { handleFMC } from "../FMC.js";
import { timeInsertion } from "../settings/timerSett";
import { timerObj } from "../timer/timerState.js";
import { scrdata } from "./scrData.js";
import { averageOfN } from "../average.js";
import { addAverageBlock } from "../solve.js";
import { handleMBLD } from "../MBLD.js";

let restoringSession = false;

const categorySelect = document.getElementById("categorySelect");
const eventSelect = document.getElementById("eventSelect");


// ===== Populate eventSelect from csTimer scrdata =====


// ===== Populate category select =====

// Remove divider categories like ===WCA===
const validCategories = scrdata.filter(
  ([name]) => !name.startsWith("===")
);

// Clear selects
categorySelect.innerHTML = "";
eventSelect.innerHTML = "";

// Fill category select
validCategories.forEach(([categoryName]) => {
  const option = document.createElement("option");
  option.value = categoryName;
  option.textContent = categoryName;
  categorySelect.appendChild(option);
});

function restoreSelectorsFromSession() {
    const session = getCurrentSession();

    // ---------- Restore Category ----------
    if (session.category) {
        categorySelect.value = session.category;
    } else {
        categorySelect.selectedIndex = 0;
    }

    // Trigger category change to rebuild event list
    categorySelect.dispatchEvent(new Event("change"));

    // ---------- Restore Event ----------
    if (session.scrambleType) {
        eventSelect.value = session.scrambleType;
    }

    // Trigger event logic
    eventSelect.dispatchEvent(new Event("change"));
}

categorySelect.addEventListener("change", () => {
  const session = getCurrentSession();
  session.category = categorySelect.value;
  if (!restoringSession) {
      saveSessions();
  }

  eventSelect.innerHTML = "";

  const category = validCategories.find(
    ([name]) => name === categorySelect.value
  );

  if (!category) return;

  const [, scrambles] = category;

  scrambles.forEach(([label, code]) => {
    if (code === "blank") return;

    const option = document.createElement("option");
    option.value = code;
    option.textContent = label;
    eventSelect.appendChild(option);
  });

      // Trigger event logic
    eventSelect.dispatchEvent(new Event("change"));
});



// 👇 FORCE INITIAL LOAD
restoringSession = true;
restoreSelectorsFromSession();
restoringSession = false;

eventSelect.addEventListener("change", async () => {
    const session = getCurrentSession();
    session.event = eventSelect.value;
    eventObj.event = eventSelect.value;

    if (eventObj.event === "333fm" || eventObj.event === "r3ni") {
        timerSettObj.timerFlag = true;
        document.getElementById("typing-container").style.display = "none";
        document.querySelector(".timerOpt").style.display = "none";
    } else {
        document.querySelector(".timerOpt").style.display = "block";
        if (timeInsertion === "Typing") {
            document.getElementById("typing-container").style.display = "block";
            timerObj.timerFlag = true;
        } else {
            timerSettObj.timerFlag = false;
        }
    }

    session.scrambleType = eventObj.event;

    if (!restoringSession) {
        saveSessions();
    }

    syncModeWithEvent(eventObj.event);   // ✅ AUTO FORCE MODE

    // Auto-set inspection to None for BLD events, restore for non-BLD
    if (["333ni", "444bld", "555bld"].includes(eventObj.event)) { //no longer includes bf, check scrData.js
        document.getElementById("penaltyOkBtn").style.display = "block";
        document.getElementById("penaltyPlus2Btn").style.display = "block";
        document.getElementById("penaltyDnfBtn").style.display = "block";
        document.getElementById("removeLastBtn").style.display = "block";
        document.getElementById("submit-moves").style.display = "none";
        document.getElementById("fmc-cube").style.display = "none";
        document.getElementById("fmc-solution").style.display = "none";
        document.getElementById("fmc-solution-test").style.display = "none";
        document.getElementById("fmc-move-count").style.display = "none";
        document.getElementById("fmc-form").style.display = "none";
        document.getElementById("countdown").style.display = "none";
        document.getElementById("touchOverlay").style.display = "block";
        document.getElementById("typing-container").style.display = "none";
        document.getElementById("timerins").style.marginTop = "0px";
        document.getElementById("touchOverlay").style.display = "none";
        
        if (vis === document.querySelector("#scrambleVis")) {
            document.getElementById("timer").style.fontSize = "140px";
        } else {
            document.getElementById("timer").style.fontSize = "72px";
        }

        document.getElementById("timer").textContent = "0.00";

        timerSettObj.previousInspectionType = timerSettObj.inspectionType;
        timerSettObj.inspectionType = "None";
        document.getElementById("inspection-type").value = "None";
        localStorage.setItem("inspectionType", "None");
    } else {
        document.getElementById("penaltyOkBtn").style.display = "block";
        document.getElementById("penaltyPlus2Btn").style.display = "block";
        document.getElementById("penaltyDnfBtn").style.display = "block";
        document.getElementById("removeLastBtn").style.display = "block";
        document.getElementById("submit-moves").style.display = "none";
        document.getElementById("fmc-cube").style.display = "none";
        document.getElementById("fmc-solution").style.display = "none";
        document.getElementById("fmc-solution-test").style.display = "none";
        document.getElementById("fmc-move-count").style.display = "none";
        document.getElementById("fmc-form").style.display = "none";
        document.getElementById("countdown").style.display = "none";
        document.getElementById("touchOverlay").style.display = "block";
        document.getElementById("typing-container").style.display = "none";
        document.getElementById("timerins").style.marginTop = "0px";
        document.getElementById("touchOverlay").style.display = "none";
        if (vis === document.querySelector("#scrambleVis")) {
            document.getElementById("timer").style.fontSize = "140px";
        } else {
            document.getElementById("timer").style.fontSize = "72px";
        }
        
        document.getElementById("timer").textContent = "0.00";
        timerSettObj.inspectionType = timerSettObj.previousInspectionType;
        document.getElementById("inspection-type").value = timerSettObj.previousInspectionType;
        localStorage.setItem("inspectionType", timerSettObj.previousInspectionType);
    }

    await displayScramble(eventObj.event, vis);
    if (eventObj.event === "333fm") handleFMC();
    if (eventObj.event === "r3ni") handleMBLD();
});

const modeSelectEl = document.getElementById("modeSelect");
let modeFlag = false;
if (modeSelectEl) {
    modeSelectEl.addEventListener("change", (ev) => {
        const val = ev.target.value;
        const session = getCurrentSession();
        averageObj.mode = val;
        session.mode = val;
        saveSessions();
        modeFlag = true;
        const block = averageOfN(
            document.getElementById("timer").innerHTML, 
            currentScramble, 
            timerObj.inspection, 
            timerSettObj.inspectionType, 
            false, 
            true
        );
        
        if (block) {
            addAverageBlock(block);
        }
        renderHistory();
    });
    modeFlag = false;
}

function getDefaultModeForEvent(event) {
    // BLD events: specific modes
    if (event === "333bf") return "bo5"; // 3x3 blindfolded: best of 5
    if (event === "444bf") return "bo3"; // 4x4 blindfolded: best of 3
    if (event === "555bf") return "bo3"; // 5x5 blindfolded: best of 3
    
    // Other events that force mo3
    if (["666", "777"].includes(event)) return "mo3";

    if (event === "333fm") return "fmc3"; // FMC: average of 3 attempts
    
    // Default to ao5
    return "ao5";
}

function syncModeWithEvent(event) {
    const session = getCurrentSession();
    const desiredMode = getDefaultModeForEvent(event);

    if (averageObj.mode !== desiredMode) {

        averageObj.mode = desiredMode;
        session.mode = desiredMode;

        const sel = document.getElementById("modeSelect");
        if (sel) sel.value = desiredMode;

        // 🔥 ONLY reset if user changed event manually
        if (!restoringSession) {
            averageObj.solvesArray = [];
            averageObj.solveCounter = 0;
        }

        saveSessions();
    }
}
const modal = document.getElementById("detailsModal");
const modalBody = document.getElementById("modalBody");
const closeModalBtn = document.getElementById("closeModalBtn");

closeModalBtn.onclick = () => modal.classList.add("hidden");
modal.onclick = e => {
    if (e.target === modal) modal.classList.add("hidden");
};

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

document.addEventListener("sessionChanged", async () => {
        // 🔥 FIRST restore buffer
    changedSession();
const session = getCurrentSession();

    if (session.category) {
        categorySelect.value = session.category;
        categorySelect.dispatchEvent(new Event("change"));
    }

    
    eventObj.event = session.scrambleType || "333";
    eventSelect.value = session.event || "333";
    eventSelect.dispatchEvent(new Event("change"));

    renderHistory();

    if (eventObj.event === "333fm") {
        await displayScramble(eventObj.event, vis);
        handleFMC();
        return;
    } else if (eventObj.event === "r3ni"){
        handleMBLD();
    } else {
        document.getElementById("penaltyOkBtn").style.display = "block";
        document.getElementById("penaltyPlus2Btn").style.display = "block";
        document.getElementById("penaltyDnfBtn").style.display = "block";
        document.getElementById("removeLastBtn").style.display = "block";
        document.getElementById("submit-moves").style.display = "none";
        document.getElementById("fmc-cube").style.display = "none";
        document.getElementById("fmc-solution").style.display = "none";
        document.getElementById("fmc-solution-test").style.display = "none";
        document.getElementById("fmc-move-count").style.display = "none";
        document.getElementById("fmc-form").style.display = "none";
        document.getElementById("countdown").style.display = "none";
        document.getElementById("touchOverlay").style.display = "block";
        if (vis === document.querySelector("#scrambleVis")) {
            document.getElementById("timer").style.fontSize = "140px";
        } else {
            document.getElementById("timer").style.fontSize = "72px";
        }
        
        document.getElementById("timer").textContent = "0.00";
    }

    await displayScramble(eventObj.event, vis);
});

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


document.getElementById("scramble-button").addEventListener("click", () => {
    if (timerDOMObj.scrDisplayFlag) {
        document.querySelector(".panel-cube2").style.display = "none";
        document.getElementById("scramble-button").innerHTML = "Scramble visualizer";
        document.getElementById("scramble-button").style.justifySelf = "center";
        timerDOMObj.scrDisplayFlag = false;
        return;
    }
    timerDOMObj.scrDisplayFlag = true;
    document.querySelector(".panel-cube2").style.display = "grid";
    document.getElementById("scramble-button").style.justifySelf = "left";
    document.getElementById("scramble-button").innerHTML = "close";
});

export { modal, syncModeWithEvent };