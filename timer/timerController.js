import { currentScramble, displayScramble } from "../scramble/scrambleController.js";
import { eventObj, vis, timerWarnings } from "../event/eventController.js";
import { timerSettObj } from "../settings/settingsState.js";
import { delayFlagType } from "../settings/settingsController.js";
import { PHASE, timerObj, countdownObj } from "./timerState.js";
import { beginHold, cancelHold, resetTimerColor } from "./timerPhases.js";
import { inspection } from "./inspection.js";
import { getThemeVar } from "../settings/settingsController.js";
import { startTimer, stopTimer } from "./timer.js";
import { averageOfN, classicStats, formatDisplayTime } from "../average/avgController.js";
import { renderHistory } from "../render/renderController.js";
import { addAverageBlock } from "../session/sessionController.js";
import { saveSessions, getCurrentSession, getLastSolve } from "../session/sessionController.js";
import { formatTime } from "./timeFormatting.js";
import { timeInsertion, setTimeInsertion } from "../settings/settingsController.js";
import { plus2CounterObj } from "../topbar/topbarState.js";
import { startTimer2, stopTimer2 } from "./countdownTimer.js";


// Fewest Moves / Multi-Blind countdown: "Start attempt" starts (or stops) it, submitting a result stops it
const startBtn = document.getElementById("countdown");
const stopBtn = document.getElementById("submit-moves");

startBtn.addEventListener("click", () => startTimer2(countdownObj, timerWarnings));
stopBtn.addEventListener("click", () => stopTimer2(countdownObj));

// Whether the phone scramble picture is open (topbar/topbarController.js toggles it)
const timerDOMObj = {
    scrDisplayFlag: false
};

// Changes the timer's color ("color") or text ("time"); passed to the other timer files so they don't touch the DOM
function setTimerDisplay(colorOrTime, content) {
    if (colorOrTime === "color") {
        document.getElementById("timer").style.color = content;
    } else if (colorOrTime === "time") {
        document.getElementById("timer").textContent = content;
    }
}

// Shows the most recent solve on the timer, or "0.00" when there's none; FMC and Multi-Blind keep their countdown
function showLastSolve() {
    if (timerSettObj.untimedEvent) return;
    const last = getLastSolve();
    // A Fewest Moves or Multi-Blind solve in the session is moves / points, not a time
    const isTime = last && last.event !== "333fm" && last.event !== "r3ni";
    setTimerDisplay('time', isTime ? formatDisplayTime(last) : "0.00");
}

// Inspection for typed-in times: a plain seconds count, separate from the solve timer

// Seconds counted, the count's setInterval id, and whether it's running
let seconds = 0;
let interval = null;
let running = false;

// Starts the typed-time inspection count, or stops and resets it if it's running
function inspection2() {
        if (!running) {
        // Start: show 0, then count one second at a time
        running = true;
        setTimerDisplay('time', seconds);
        interval = setInterval(() => {
            seconds++;
                        setTimerDisplay('time', seconds);
                // WCA calls at 8 and 12 seconds; at 17 the count stops on its own
                if (seconds === 8)  new Audio("./audio/8seconds.mp3").play();
                if (seconds === 12) new Audio("./audio/12seconds.mp3").play();
                if (seconds === 17) {
                    running = false;
                    clearInterval(interval);
                    interval = null;
                    seconds = 0;
                    showLastSolve();
                }
        }, 1000);
    } else {
        // Stop: reset the count and the display
        running = false;
        clearInterval(interval);
        interval = null;
        seconds = 0;
        showLastSolve();
    }
}

// Focus mode while solving: hide everything but the timer and the touch overlay

// Adds .focus-hidden to every element that isn't the timer, the overlay, or one of their ancestors
function showOnlyTimerSafe() {
  const timer = document.getElementById("timer");
  const overlay = document.getElementById("touchOverlay"); // the invisible div

  if (!timer || !overlay) return;

  // Walks down the page: ancestors of the timer are kept and searched, everything else is hidden
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

// Shows everything again after the solve
function restoreUI() {
  document.querySelectorAll(".focus-hidden").forEach(el => {
    el.classList.remove("focus-hidden");
  });
}

// Phase transitions (shared by keyboard and touch)

// Space down / first finger down
function onPressStart() {
    switch (timerObj.timerPhase) {
        case PHASE.IDLE:
            // No inspection: go straight to the hold
            if (timerSettObj.inspectionType === "None") {
                beginHold(delayFlagType, timerObj, setTimerDisplay);
                return;
            }
            // "Press start" begins inspection now, "Press end" waits for the release
            timerObj.timerPhase = PHASE.INSPECTING;
            if (localStorage.getItem("inspectionStart") === "press-start") {
                inspection(timerSettObj.inspectionType, setTimerDisplay, timerObj);
            }
            return;
        case PHASE.INSPECTING:
            beginHold(delayFlagType, timerObj, setTimerDisplay);
            return;
        case PHASE.RUNNING:
            handleSplitOrStop();
            return;
        // HOLDING / READY: already pressed (extra finger, lost keyup), nothing to do
    }
}

// Space up / last finger up
function onPressEnd() {
    switch (timerObj.timerPhase) {
        case PHASE.HOLDING:
            // Let go too early: no start
            cancelHold(timerObj, setTimerDisplay, getThemeVar);
            return;
        case PHASE.READY:
            // Green and released: the solve starts
            timerObj.timerPhase = PHASE.RUNNING;
            startTimer(setTimerDisplay, getThemeVar, timerObj, formatTime);
            showOnlyTimerSafe();
            return;
        case PHASE.INSPECTING:
            // "Press end": the release of the first press begins inspection
            if (!timerObj.inspecting && localStorage.getItem("inspectionStart") === "press-end") {
                inspection(timerSettObj.inspectionType, setTimerDisplay, timerObj);
            }
            return;
    }
}

// The release will never come (touchcancel, tab hidden, window lost focus)
function onPressLost() {
    if (timerObj.timerPhase === PHASE.INSPECTING && !timerObj.inspecting) {
        timerObj.timerPhase = PHASE.IDLE; // press-end inspection never started
    }
    cancelHold(timerObj, setTimerDisplay, getThemeVar);
}

// Phone: a finger on the main area is a press
document.getElementById("touchOverlay").addEventListener("touchstart", (e) => {
    // If the touch originated inside an input or the typing UI, ignore it
    const touchTarget = e.target;
    if (touchTarget && touchTarget.closest && (touchTarget.closest('input') || touchTarget.closest('#typing-container'))) {
        return;
    }
    // Stops the browser from scrolling or zooming
    e.preventDefault();
    // Timer off (Typing mode, Fewest Moves, Multi-Blind)
    if (timerSettObj.timerFlag) return;
    // Only the first finger down counts as a press
    if (e.touches.length > e.changedTouches.length) return;

    // A tap while the phone scramble picture is open only closes it
    if (timerObj.timerPhase !== PHASE.RUNNING && timerDOMObj.scrDisplayFlag) {
        document.querySelector(".panel-cube2").style.display = "none";
        document.getElementById("scramble-button").style.justifySelf = "center";
        document.getElementById("scramble-button").innerHTML = "Scramble visualizer";
        timerDOMObj.scrDisplayFlag = false;
        return;
    }

    onPressStart();
});

// Escape cancels everything: inspection, hold or running solve, nothing is saved
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        clearInterval(timerObj.interval);
        clearTimeout(timerObj.holdTimeout);
        timerObj.inspecting = false;
        timerObj.inspection = 0;
        timerObj.timerPhase = PHASE.IDLE;
        timerObj.solvePhases = [];
        timerObj.currentSolvePhase = 0;
        timerObj.lastSplitTime = 0;
        showLastSolve();
        resetTimerColor(setTimerDisplay, getThemeVar);
        restoreUI();
    }
});

// Phone: lifting the fingers is a release
document.getElementById("touchOverlay").addEventListener("touchend", (e) => {
    // If the touch ended inside an input or the typing UI, ignore it
    const touchTarget = e.target;
    if (touchTarget && touchTarget.closest && (touchTarget.closest('input') || touchTarget.closest('#typing-container'))) {
        return;
    }
    e.preventDefault();
    // Only the last finger up counts as a release
    if (e.touches.length > 0) return;

    onPressEnd();
});

// Cases where the release never arrives
document.getElementById("touchOverlay").addEventListener("touchcancel", onPressLost);
window.addEventListener("blur", onPressLost);
document.addEventListener("visibilitychange", () => {
    if (document.hidden) onPressLost();
});

// Typing mode on a phone: a tap starts or stops the typed-time inspection (untimed events have none)
document.getElementById("touchOverlay").addEventListener("touchstart", () => {
    if (!timerSettObj.timerFlag) return;
    if (eventObj.event === "333fm" || eventObj.event === "r3ni") return;
    inspection2();
});

// Typing mode: the "Inspection (space)" button does the same
document.getElementById("inspection-btn").addEventListener("click", () => {
    if (!timerSettObj.timerFlag) return;
    if (eventObj.event === "333fm" || eventObj.event === "r3ni") return;
    inspection2();
});


// Typing mode: and so does the space bar
document.addEventListener("keydown", (e) => {
    if (!timerSettObj.timerFlag) return;
    if (e.code !== "Space" || e.repeat) return;
    if (eventObj.event === "333fm" || eventObj.event === "r3ni") return;
    inspection2();
});

// True when the focus is in a text field, so keys go to it and not to the timer
function isTyping() {
  const el = document.activeElement;
  return (
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.isContentEditable
  );
}

// Keyboard: key down is a press
document.addEventListener("keydown", (e) => {
    // A select left focused (closed without a change) would open or change with this key: the timer takes it
    if (document.activeElement.tagName === "SELECT" && (e.key === " " || timerObj.timerPhase === PHASE.RUNNING)) {
        e.preventDefault();
        document.activeElement.blur();
    }

    // Held-down key repeats, timer off, or typing in a field
    if (e.repeat || timerSettObj.timerFlag || isTyping()) return;

    // Any key but Tab (the Timer/Typing switch) splits/stops a running timer, only space drives the other phases
    if (e.key === " ") {
        e.preventDefault();
    } else if (timerObj.timerPhase !== PHASE.RUNNING || e.key === "Tab") {
        return;
    }

    onPressStart();
});

// Tab switches between Timer and Typing
document.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    e.preventDefault();
    // Fewest Moves and Multi-Blind have no timer to switch, and a running solve keeps its mode
    if (timerSettObj.untimedEvent || timerObj.timerPhase !== PHASE.IDLE) return;
    setTimeInsertion(timeInsertion === "Typing" ? "Timer" : "Typing");
});

// A press while running: ends the current phase, and on the last phase stops and saves the solve
function handleSplitOrStop() {

    const now = performance.now();
    const totalElapsed = (now - timerObj.startTime);

    // Calculate phase duration (difference from last split)
    const phaseTime = formatTime(totalElapsed - timerObj.lastSplitTime);

    // Save for next split
    timerObj.lastSplitTime = totalElapsed;

    timerObj.solvePhases.push(phaseTime);
    timerObj.currentSolvePhase++;


    // If NOT last phase → keep running
    if (timerObj.currentSolvePhase < timerObj.totalSolvePhases) {
        return;
    }

    // Last phase: reset the +2 button for the new solve, then stop
    plus2CounterObj.penalty = 0;
    document.getElementById("penaltyPlus2Btn").textContent = "+2";
    stopTimer(setTimerDisplay, getThemeVar, timerObj, formatTime);

    // The time as shown ("12.34" or "1: 02.50"), parsed again by averageOfN
    const finalTime = document.getElementById("timer").innerHTML;

    // Add the solve; a block comes back when it completes an average
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

    // Keep the session's copy of the classic rolling averages up to date
    const session = getCurrentSession();
    session.classicStats = structuredClone(classicStats);

    if (block) {
        addAverageBlock(block);
    }

    // Reset for next solve
    timerObj.solvePhases = [];
    timerObj.currentSolvePhase = 0;
    timerObj.lastSplitTime = 0;

    // Save, redraw, new scramble, and show the page again
    saveSessions();
    renderHistory();
    displayScramble(eventObj.event, vis);
    restoreUI();
}

// Keyboard: space up is a release
document.addEventListener("keyup", (e) => {
    // Only intercept Space key so typing in inputs isn't blocked
    if (e.key !== " ") return;
    e.preventDefault();
    if (e.repeat) return;

    onPressEnd();
});

export {
    setTimerDisplay,
    timerDOMObj,
    showLastSolve
};