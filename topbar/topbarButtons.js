import { eventObj, vis } from "./event.js";
import { getCurrentSession, saveSessions, clearAverages, changedSession } from "../session.js";
import { averageObj } from "../average";
import { renderHistory } from "../render";
import { displayScramble } from "../scramble.js";
import { openDetailsModal } from "./modal.js";
import { timerSettObj } from "../settings/timerSett";
import { previousInspectionType } from "../settings/timerSett";
import { renderStatsPage } from "../stats";
import { timerDOMObj } from "../timer/timerDOM.js";
import { applyPenaltyToLast } from "../solve.js";
import { handleFMC } from "../FMC.js";



eventSelect.addEventListener("change", async () => {
    const session = getCurrentSession();

    eventObj.event = eventSelect.value;

    session.scrambleType = eventObj.event;
    saveSessions();

    syncModeWithEvent(eventObj.event);   // ✅ AUTO FORCE MODE

    // Auto-set inspection to None for BLD events, restore for non-BLD
    if (eventObj.event.includes("bf")) {
    document.getElementById("penaltyOkBtn").style.display = "block";
    document.getElementById("penaltyPlus2Btn").style.display = "block";
    document.getElementById("penaltyDnfBtn").style.display = "block";
    document.getElementById("removeLastBtn").style.display = "block";
    document.getElementById("submit-moves").style.display = "none";
    document.getElementById("fmc-cube").style.display = "none";
    document.getElementById("fmc-solution").style.display = "none";
    document.getElementById("fmc-solution-test").style.display = "none";
    document.getElementById("fmc-move-count").style.display = "none";
    document.getElementById("fmc-form").style.display = "none"

        previousInspectionType = timerSettObj.inspectionType;
        timerSettObj.inspectionType = "None";
        document.getElementById("inspection-type").value = "None";
        localStorage.setItem("inspectionType", "None");
    } else if(eventObj.event === "333fm") {
        handleFMC();
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
    document.getElementById("fmc-form").style.display = "none"
        timerSettObj.inspectionType = previousInspectionType;
        document.getElementById("inspection-type").value = previousInspectionType;
        localStorage.setItem("inspectionType", previousInspectionType);
    }

    await displayScramble(eventObj.event, vis);
});

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

        // Reset current average buffer
        averageObj.solvesArray = [];
        averageObj.solveCounter = 0;

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
    const session = getCurrentSession();

    eventObj.event = session.scrambleType || "333";
    eventSelect.value = eventObj.event;

    if (eventObj.event === "333fm") {
        await displayScramble(eventObj.event, vis);
        handleFMC();
        return;
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