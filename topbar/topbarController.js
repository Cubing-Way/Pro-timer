import { eventObj, vis, showTimerLayout, showTimeInsertion } from "../event/eventController.js";
import { getCurrentSession, saveSessions, clearAverages, changedSession } from "../session/sessionController.js";
import { averageObj } from "../average/avgController.js";
import { renderHistory } from "../render/renderController.js";
import { displayScramble, currentScramble } from "../scramble/scrambleController.js";
import { openDetailsModal, setPenalty, removeSolve } from "../modal/modalController.js";
import { timerSettObj } from "../settings/settingsState.js";
import { timerDOMObj } from "../timer/timerController.js";
import { applyPenaltyToLast, removeLastSolve } from "../session/sessionController.js";
import { handleFMC } from "../event/eventController.js";
import { timeInsertion } from "../settings/settingsController.js";
import { timerObj } from "../timer/timerState.js";
import { scrdata } from "../scramble/scrData.js";
import { averageOfN } from "../average/avgController.js";
import { addAverageBlock } from "../session/sessionController.js";
import { handleMBLD } from "../event/eventController.js";
import { plus2CounterObj } from "./topbarState.js";

let restoringSession = false;

const categorySelect = document.getElementById("categorySelect");
const eventSelect = document.getElementById("eventSelect");
const modeSelect = document.getElementById("modeSelect");


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

    if (session.mode) {
        modeSelect.value = session.mode;
    }


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
if (!restoringSession) {
    eventSelect.dispatchEvent(new Event("change"));
}
});



// 👇 FORCE INITIAL LOAD
restoringSession = true;
restoreSelectorsFromSession();
restoringSession = false;

eventSelect.addEventListener("change", async (e) => {
    const session = getCurrentSession();
    session.scrambleType = eventSelect.value;
    eventObj.event = eventSelect.value;

    showTimeInsertion(eventObj.event, timeInsertion, timerSettObj);

    session.scrambleType = eventObj.event;

    if (!restoringSession) {
        saveSessions();
    }

    if (!restoringSession) {
        syncModeWithEvent(eventObj.event);
    }

    // Fewest Moves and Multi-Blind switch to their own layout after the scramble below
    showTimerLayout(vis);

    // Auto-set inspection to None for BLD events, restore for non-BLD
    if (["333ni", "444bld", "555bld"].includes(eventObj.event)) { //no longer includes bf, check scrData.js
        timerSettObj.previousInspectionType = timerSettObj.inspectionType;
        timerSettObj.inspectionType = "None";
        document.getElementById("inspection-type").value = "None";
        localStorage.setItem("inspectionType", "None");
    } else {
        timerSettObj.inspectionType = timerSettObj.previousInspectionType;
        document.getElementById("inspection-type").value = timerSettObj.previousInspectionType;
        localStorage.setItem("inspectionType", timerSettObj.previousInspectionType);
    }

    await displayScramble(eventObj.event, vis);
    if (eventObj.event === "333fm") handleFMC();
    if (eventObj.event === "r3ni") handleMBLD();
});

const modeSelectEl = document.getElementById("modeSelect");
if (modeSelectEl) {
    modeSelectEl.addEventListener("change", (ev) => {
        const val = ev.target.value;
        const session = getCurrentSession();
        averageObj.mode = val;
        session.mode = val;
        saveSessions();
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
}

function getDefaultModeForEvent(event) {
    // BLD events: specific modes
    if (event === "333ni") return "bo5"; // 3x3 blindfolded: best of 5
    if (event === "444bld") return "bo3"; // 4x4 blindfolded: best of 3
    if (event === "555bld") return "bo3"; // 5x5 blindfolded: best of 3
    if (event === "r3ni") return "bo3";
    
    // Other events that force mo3
    if (["666wca", "777wca"].includes(event)) return "mo3";

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

        saveSessions();
    }

}

document.addEventListener("sessionChanged", async () => {
    // 🔥 FIRST restore buffer
    restoringSession = true;

    changedSession();
    const session = getCurrentSession();

    if (session.category) {
        categorySelect.value = session.category;
        categorySelect.dispatchEvent(new Event("change"));
    }

    const ev = session.scrambleType || "333";
    eventObj.event = ev;
    eventSelect.value = ev;
    eventSelect.dispatchEvent(new Event("change"));

    restoringSession = false;

    renderHistory();

    if (eventObj.event === "333fm") {
        await displayScramble(eventObj.event, vis);
        handleFMC();
        return;
    } else if (eventObj.event === "r3ni"){
        handleMBLD();
    } else {
        showTimerLayout(vis);
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

avgObj.openSessionBtn.onclick = () => openDetailsModal();

avgObj.penaltyOkBtn.onclick = () => {
    applyPenaltyToLast(null, setPenalty);
    plus2CounterObj.penalty = 0;
    document.getElementById("penaltyPlus2Btn").textContent = `+${plus2CounterObj.penalty + 2}`
    renderHistory();
}



avgObj.penaltyPlus2Btn.onclick = () => {
    if (plus2CounterObj.penalty === 12) {
        plus2CounterObj.penalty = 0;
        applyPenaltyToLast(null, setPenalty);
    } else {
        plus2CounterObj.penalty += 2;
        applyPenaltyToLast(plus2CounterObj.penalty, setPenalty);
    }

    document.getElementById("penaltyPlus2Btn").textContent = `+${plus2CounterObj.penalty + 2}`

    renderHistory();
};

avgObj.penaltyDnfBtn.onclick = () => {
    applyPenaltyToLast("DNF", setPenalty);
    renderHistory();
}

avgObj.removeLastBtn.onclick = () => removeLastSolve(removeSolve);

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

export {syncModeWithEvent, plus2CounterObj };