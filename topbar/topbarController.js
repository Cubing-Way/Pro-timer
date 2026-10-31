import { eventObj, vis, showTimerLayout, showTimeInsertion, setEventInspection } from "../event/eventController.js";
import { getCurrentSession, saveSessions, clearAverages, changedSession } from "../session/sessionController.js";
import { averageObj } from "../average/avgController.js";
import { renderHistory } from "../render/renderController.js";
import { displayScramble, currentScramble } from "../scramble/scrambleController.js";
import { openDetailsModal, setPenalty, removeSolve } from "../modal/modalController.js";
import { timerSettObj } from "../settings/settingsState.js";
import { timerDOMObj, showLastSolve } from "../timer/timerController.js";
import { applyPenaltyToLast, removeLastSolve } from "../session/sessionController.js";
import { handleFMC } from "../event/eventController.js";
import { timeInsertion } from "../settings/settingsController.js";
import { timerObj, countdownObj } from "../timer/timerState.js";
import { stopTimer2 } from "../timer/countdownTimer.js";
import { scrdata } from "../scramble/scrData.js";
import { averageOfN } from "../average/avgController.js";
import { addAverageBlock } from "../session/sessionController.js";
import { handleMBLD } from "../event/eventController.js";
import { plus2CounterObj } from "./topbarState.js";

// True while the selects are set from a saved session, so those changes aren't saved back or re-run
let restoringSession = false;

const categorySelect = document.getElementById("categorySelect");
const eventSelect = document.getElementById("eventSelect");
const modeSelect = document.getElementById("modeSelect");


// Category select, filled from csTimer's scramble list (scramble/scrData.js)

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

// Sets the category, event and average mode selects to the current session's, running their change handlers
function restoreSelectorsFromSession() {
    const session = getCurrentSession();

    // Category: the session's, or the first one
    if (session.category) {
        categorySelect.value = session.category;
    } else {
        categorySelect.selectedIndex = 0;
    }

    // Trigger category change to rebuild event list
    categorySelect.dispatchEvent(new Event("change"));

    // Event: the session's, if it has one
    if (session.scrambleType) {
        eventSelect.value = session.scrambleType;
    }

    // Trigger event logic
    eventSelect.dispatchEvent(new Event("change"));

    // Average mode: the session's, if it has one
    if (session.mode) {
        modeSelect.value = session.mode;
    }


}

// New category: save it in the session and list its events
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

  // Each category is [name, [[label, code, length], …]]
  const [, scrambles] = category;

  // One option per scramble type, skipping csTimer's "blank" placeholders
  scrambles.forEach(([label, code]) => {
    if (code === "blank") return;

    const option = document.createElement("option");
    option.value = code;
    option.textContent = label;
    eventSelect.appendChild(option);
  });

  // Picking a category by hand also picks its first event
if (!restoringSession) {
    eventSelect.dispatchEvent(new Event("change"));
}
});



// Set the selects from the saved session once on load
restoringSession = true;
restoreSelectorsFromSession();
restoringSession = false;

// New event: save it, set the layout, inspection and average mode for it, then show a scramble
eventSelect.addEventListener("change", async (e) => {
    const session = getCurrentSession();
    session.scrambleType = eventSelect.value;
    eventObj.event = eventSelect.value;

    // Timer or typing box, depending on the event and the Time insertion setting
    showTimeInsertion(eventObj.event, timeInsertion, timerSettObj);

    session.scrambleType = eventObj.event;

    if (!restoringSession) {
        saveSessions();
    }

    // A restored session keeps its own average mode
    if (!restoringSession) {
        syncModeWithEvent(eventObj.event);
    }

    // A running Fewest Moves / Multi-Blind attempt ends with its event, or its countdown keeps writing over the timer
    if (countdownObj.intervalId !== null) stopTimer2(countdownObj);

    // Fewest Moves and Multi-Blind switch to their own layout after the scramble below
    showTimerLayout(vis);

    // Inspection to None for BLD events, the saved inspection type for the others
    setEventInspection(eventObj.event, timerSettObj);

    await displayScramble(eventObj.event, vis);
    if (eventObj.event === "333fm") handleFMC();
    if (eventObj.event === "r3ni") handleMBLD();
});

// New average mode: save it and recount the solves in progress with it
const modeSelectEl = document.getElementById("modeSelect");
if (modeSelectEl) {
    modeSelectEl.addEventListener("change", (ev) => {
        const val = ev.target.value;
        const session = getCurrentSession();
        averageObj.mode = val;
        session.mode = val;
        saveSessions();
        // modeFlag (true) adds no solve: it only checks whether the solves in progress now complete an average
        const block = averageOfN(
            document.getElementById("timer").innerHTML,
            currentScramble,
            timerObj.inspection,
            timerSettObj.inspectionType,
            false,
            true
        );

        // e.g. 3 solves done in ao5 make a full mo3 after switching
        if (block) {
            addAverageBlock(block);
        }
        renderHistory();
    });
}

// The average mode the WCA uses for an event
function getDefaultModeForEvent(event) {
    // BLD events: specific modes
    if (event === "333ni") return "bo5"; // 3x3 blindfolded: best of 5
    if (event === "444bld") return "bo3"; // 4x4 blindfolded: best of 3
    if (event === "555bld") return "bo3"; // 5x5 blindfolded: best of 3
    if (event === "r3ni") return "bo3"; // Multi-Blind: best of 3

    // Other events that force mo3
    if (["666wca", "777wca"].includes(event)) return "mo3";

    if (event === "333fm") return "fmc3"; // FMC: average of 3 attempts

    // Default to ao5
    return "ao5";
}

// Switches the average mode (and its select) to the event's WCA mode, and saves it
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

// Another session was picked (session/sessionController.js fires "sessionChanged")
document.addEventListener("sessionChanged", () => {
    // Load the new session's solves in progress first, without saving the select changes back
    restoringSession = true;

    changedSession();
    const session = getCurrentSession();

    // A new session has no category yet: WCA, or the old category's events stay and may not include "333"
    categorySelect.value = session.category || validCategories[0][0];
    categorySelect.dispatchEvent(new Event("change"));

    const ev = session.scrambleType || "333";
    eventObj.event = ev;
    eventSelect.value = ev;
    // The event change does the layout, the inspection type, the scramble and the FMC / MBLD setup
    eventSelect.dispatchEvent(new Event("change"));

    restoringSession = false;

    renderHistory();
    // The new session's last solve on the timer, over the "0.00" the event layout just wrote
    showLastSolve();
});

// Top bar and penalty bar buttons
const avgObj = {
    modeSelect: document.getElementById("modeSelect"),
    clearBtn: document.getElementById("clearBtn"),
    openSessionBtn: document.getElementById("modal-button"),
    penaltyOkBtn: document.getElementById("penaltyOkBtn"),
    penaltyPlus2Btn: document.getElementById("penaltyPlus2Btn"),
    penaltyDnfBtn: document.getElementById("penaltyDnfBtn"),
    removeLastBtn: document.getElementById("removeLastBtn")
};

// Take the focus off a clicked button, so the space bar starts the timer instead of clicking it again
document.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
        btn.blur();
    });
});

// Same for selects, so the space bar doesn't open them
document.querySelectorAll("select").forEach(select => {
    select.addEventListener("change", () => {
        select.blur();
    });
});

// Clear: delete the session's averages (after asking) and redraw
avgObj.clearBtn.onclick = () => {
    clearAverages();
    renderHistory();
}

// Open Session: the session's averages in the details pop-up
avgObj.openSessionBtn.onclick = () => openDetailsModal();

// OK: remove the last solve's penalty and reset the +2 button
avgObj.penaltyOkBtn.onclick = () => {
    applyPenaltyToLast(null, setPenalty);
    plus2CounterObj.penalty = 0;
    document.getElementById("penaltyPlus2Btn").textContent = `+${plus2CounterObj.penalty + 2}`
    renderHistory();
}



// +2: each click adds 2 more seconds to the last solve (+2, +4 … +12), then goes back to no penalty
avgObj.penaltyPlus2Btn.onclick = () => {
    if (plus2CounterObj.penalty === 12) {
        plus2CounterObj.penalty = 0;
        applyPenaltyToLast(null, setPenalty);
    } else {
        plus2CounterObj.penalty += 2;
        applyPenaltyToLast(plus2CounterObj.penalty, setPenalty);
    }

    // The button shows what the next click gives
    document.getElementById("penaltyPlus2Btn").textContent = `+${plus2CounterObj.penalty + 2}`

    renderHistory();
};

// DNF: mark the last solve as did not finish
avgObj.penaltyDnfBtn.onclick = () => {
    applyPenaltyToLast("DNF", setPenalty);
    renderHistory();
}

// X: delete the last solve
avgObj.removeLastBtn.onclick = () => removeLastSolve(removeSolve);

// First draw of the history, footer and sidebars
renderHistory();


// Phone "Scramble visualizer" button: opens the scramble picture, then closes it
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

export {
    syncModeWithEvent, 
    plus2CounterObj, 
    getDefaultModeForEvent 
};