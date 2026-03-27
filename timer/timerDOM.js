import { currentScramble, displayScramble } from "../scramble.js";
import { eventObj, vis } from "../topbar/event.js";
import { timerSettObj, delayFlagType } from "../settings/timerSett.js";
import { timerObj } from "./timerState.js";
import { timerPhases } from "./timerPhases.js";
import { inspection, inspection2 } from "./inspection.js";
import { wcaDelayFlag } from "./timerPhases.js";
import { startTimer, stopTimer } from "./timer.js";
import { averageOfN, averageObj, classicStats } from "../average.js";
import { renderHistory } from "../render.js";
import { addAverageBlock } from "../solve.js";
import { saveSessions, getCurrentSession} from "../session.js";
import { formatTime } from "./timeFormatting.js";
import { updateTypingUI } from "../settings/timerSett.js";
import { plus2CounterObj } from "../topbar/topbarButtons.js";

const timerDOMObj = {
    scrDisplayFlag: false
};

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
    // If the touch originated inside an input or the typing UI, ignore it
    const touchTarget = e.target;
    if (touchTarget && touchTarget.closest && (touchTarget.closest('input') || touchTarget.closest('#typing-container'))) {
        return;
    }
    e.preventDefault();
    if (e.repeat || timerSettObj.timerFlag) return;

        // 🔥 If running → handle split here
    if (timerObj.timerPhase === 2) {

        handleSplitOrStop();
        return;
    }
    if (timerDOMObj.scrDisplayFlag) {
        document.querySelector(".panel-cube2").style.display = "none";
        document.getElementById("scramble-button").style.justifySelf = "center";
        document.getElementById("scramble-button").innerHTML = "Scramble visualizer";
        timerDOMObj.scrDisplayFlag = false;
        return;
    }
    if (timerObj.timerPhase === 0 && timerSettObj.inspectionType === "None") {
        timerObj.timerPhase = 1; // skip inspection
    }

    timerPhases(delayFlagType);

    if (
        timerObj.timerPhase === 1 && !timerObj.inspecting 
        && timerSettObj.inspectionType !== "None" 
        && localStorage.getItem("inspectionStart") === "press-start"
    ) {
        inspection(timerSettObj.inspectionType);
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

    if (
        timerObj.timerPhase === 1 && !timerObj.inspecting 
        && timerSettObj.inspectionType !== "None" 
        && localStorage.getItem("inspectionStart") === "press-end"
    ) {
        inspection(timerSettObj.inspectionType);
    }

    if (timerObj.timerPhase === 2) {
        startTimer();
        showOnlyTimerSafe();
    }
});

document.getElementById("touchOverlay").addEventListener("touchstart", () => {
    if (!timerSettObj.timerFlag) return;
    if (eventObj.event === "333fm" || eventObj.event === "r3ni") return;
    inspection2();
});

document.getElementById("inspection-btn").addEventListener("click", () => {
    if (!timerSettObj.timerFlag) return;
    if (eventObj.event === "333fm" || eventObj.event === "r3ni") return;
    inspection2();
});


document.addEventListener("keydown", (e) => {
    if (!timerSettObj.timerFlag) return;
    if (e.code !== "Space" || e.repeat) return;
    if (eventObj.event === "333fm" || eventObj.event === "r3ni") return;
    inspection2();
});

function isTyping() {
  const el = document.activeElement;
  return (
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.isContentEditable
  );
}

document.addEventListener("keydown", (e) => {
    if (e.repeat || timerSettObj.timerFlag || isTyping()) return;
   

    // 🔥 If running → handle split here
    if (timerObj.timerPhase === 2) {

        handleSplitOrStop();
        return;
    }

    // Normal phase logic
    if (timerObj.timerPhase === 0 && timerSettObj.inspectionType === "None" && e.key === " ") {
        e.preventDefault();
        timerObj.timerPhase = 1;
    }

    if (e.key === " ") {
        e.preventDefault();
        timerPhases(delayFlagType);
    }

    if (
        timerObj.timerPhase === 1 && !timerObj.inspecting 
        && timerSettObj.inspectionType !== "None" 
        && localStorage.getItem("inspectionStart") === "press-start"
        && e.key === " "
    ) {
        e.preventDefault();
        inspection(timerSettObj.inspectionType);
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
        e.preventDefault(); // optional
    // Time insertion setting (Timer or Typing)
    let timeInsertion = localStorage.getItem("timeInsertion") || "Timer";
    if (timeInsertion === "Typing") {
        timeInsertion = "Timer";
        timerSettObj.timerFlag = false;
    } else if (timeInsertion === "Timer") {
        timeInsertion = "Typing";
        timerSettObj.timerFlag = true;
    }
    localStorage.setItem("timeInsertion", timeInsertion);
    updateTypingUI();
  }
});

function handleSplitOrStop() {
    console.log("Before:", timerObj.currentSolvePhase);

    const now = performance.now();
    const totalElapsed = (now - timerObj.startTime);

    // 🔥 Calculate phase duration (difference from last split)
    const phaseTime = formatTime(totalElapsed - timerObj.lastSplitTime);

    // Save for next split
    timerObj.lastSplitTime = totalElapsed;

    timerObj.solvePhases.push(phaseTime);
    timerObj.currentSolvePhase++;

    console.log("Phase:", timerObj.currentSolvePhase, phaseTime);

    // If NOT last phase → keep running
    if (timerObj.currentSolvePhase < timerObj.totalSolvePhases) {
        return;
    }

    // 🔥 Last phase → stop
    plus2CounterObj.penalty = 0;
    document.getElementById("penaltyPlus2Btn").textContent = "+2";
    stopTimer();

    const finalTime = document.getElementById("timer").innerHTML;

    const block = averageOfN(
        finalTime,
        currentScramble,
        timerObj.inspection,
        timerSettObj.inspectionType,
        false,
        false,
        false,
        timerObj.solvePhases
    );

    const session = getCurrentSession();
    session.classicStats = structuredClone(classicStats);

    if (block) {
        addAverageBlock(block);
    }

    // Reset for next solve
    timerObj.solvePhases = [];
    timerObj.currentSolvePhase = 0;
    timerObj.lastSplitTime = 0;

    saveSessions();
    renderHistory();
    displayScramble(eventObj.event, vis);
    restoreUI();
}

document.addEventListener("keyup", (e) => {
    // Only intercept Space key so typing in inputs isn't blocked
    if (e.key !== " ") return;
    e.preventDefault();
    if (e.repeat) return;

    if (timerObj.timerPhase === 1) {
        wcaDelayFlag();
    }

    if (
        timerObj.timerPhase === 1 && !timerObj.inspecting 
        && timerSettObj.inspectionType !== "None" 
        && localStorage.getItem("inspectionStart") === "press-end"
    ) {
        inspection(timerSettObj.inspectionType);
    }

    if (timerObj.timerPhase === 2 && timerObj.currentSolvePhase === 0) {
        startTimer();
        showOnlyTimerSafe();
    }
});

export { setTimerDisplay, timerDOMObj };