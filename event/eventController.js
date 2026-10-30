import { getCurrentSession, addAverageBlock } from "../session/sessionController.js";
import { displayScramble, currentScramble } from "../scramble/scrambleController.js";
import { timerSettObj } from "../settings/settingsState.js";
import { timeInsertion } from "../settings/settingsController.js";
import { countdownObj } from "../timer/timerState.js";
import { averageOfN } from "../average/avgController.js";
import { renderHistory } from "../render/renderController.js";
import { applyScramble, applySolution, getLastMoveCount, checkSolved } from "../cubisz/api.js";
import { handleFMC as handleFMCWith } from "./FMC.js";
import { handleMBLD as handleMBLDWith, calculateMBLDPoints, renderMBLDGrid } from "./MBLD.js";
import { showTimerLayout, showTimeInsertion, setEventInspection } from "./eventLayout.js";

// The event in use (a csTimer code like "333", "333fm", "r3ni"), starting with the session's
const eventObj = {
    event: getCurrentSession().scrambleType || "333",
};

// Where scramble pictures go: the desktop corner, or the phone pop-up on narrow screens (checked once, on load)
let vis = null;
    if (window.innerWidth > 768) {
        vis = document.querySelector("#scrambleVis");
    } else {
        vis = document.querySelector("#scrambleVis2");
    }

// Timer or typing box for the starting event
showTimeInsertion(eventObj.event, timeInsertion, timerSettObj);

const eventSelect = document.getElementById("eventSelect");

// Fewest Moves

// True once a solution has been typed for the current scramble
let solutionFlag = false;
// Sets up the Fewest Moves layout and cube for the current scramble
function handleFMC(display = document.getElementById("timer")) {
    handleFMCWith(display, currentScramble, countdownObj);
    solutionFlag = false;
}

// Typing a solution applies it to the cube right away, so the cube shows where it leads
document.getElementById("fmc-solution").addEventListener("input", (e) => {
  if (eventObj.event !== "333fm") return;
    e.preventDefault();
    applySolution(e.target.value.trim());
    solutionFlag = true;
});

// Move count of the typed solution
let moveCount = null;

// "Test solution" (the form's submit): show the move count and whether it solves the cube, without saving
document.getElementById("fmc-form").addEventListener("submit", (e) => {
  if (eventObj.event !== "333fm") return;
  e.preventDefault();
  if (solutionFlag) {
    moveCount = getLastMoveCount();
      document.getElementById("fmc-move-count").innerHTML = `${moveCount} moves 
      <br>
      Result: ${checkSolved() ? "Solved" : "DNF"}`;
  } else {
    document.getElementById("fmc-move-count").innerHTML = `no moves`;
  }

});


// "Submit solution": save the attempt (its move count is the result), then load the next scramble on the cube
document.getElementById("submit-moves").addEventListener("click", async () => {
  if (eventObj.event !== "333fm") return;
  if (document.getElementById("fmc-solution").value !== "") {
    moveCount = getLastMoveCount();
  } else {
    alert("Submit needs a solution");
    return;
  }

  const fmcObj = {
    moveCount,
    solution: document.getElementById("fmc-solution").value,
    solved: checkSolved() // averageOfN makes an unsolved cube a DNF
  };

  // Fewest Moves has no inspection, so it passes 0 instead of the timer's last inspection time
  const block = averageOfN(fmcObj, currentScramble, 0, timerSettObj.inspectionType, true);
  if (block) addAverageBlock(block);
  renderHistory();
  await displayScramble(eventObj.event, vis);
  applyScramble(currentScramble);
  document.getElementById("fmc-solution").value = "";
});

// Multi-Blind

// Sets up the Multi-Blind layout
function handleMBLD(display) {
    handleMBLDWith(display, countdownObj);
}


// Pressing Enter in the result field and the Submit result button do the same
async function submitMBLD() {
  if (document.getElementById("fmc-solution").value === "") {
    alert("Submit needs a result");
    return;
  }

  // "solved/total" turned into points
  let result = null;
  try {
    result = calculateMBLDPoints(document.getElementById("fmc-solution").value);
  } catch (error) {
    // Bad input like "5/3" or "abc": say why instead of failing silently
    alert(`${error.message} (for example 4/5)`);
    return;
  }

  // Multi-Blind has no inspection, so it passes 0 instead of the timer's last inspection time
  const block = averageOfN(result, currentScramble, 0, timerSettObj.inspectionType, false, false, true);
  if (block) addAverageBlock(block);
  renderHistory();
  await displayScramble(eventObj.event, vis);
  document.getElementById("fmc-solution").value = "";
}

// Enter in the result field
document.getElementById("fmc-form").addEventListener("submit", async (e) => {
  if (eventObj.event !== "r3ni") return;
  e.preventDefault();
  await submitMBLD();
});

// The Submit result button
document.getElementById("submit-moves").addEventListener("click", async () => {
  if (eventObj.event !== "r3ni") return;
  await submitMBLD();
});

// Multi-Blind scrambles pop-up
const modal = document.getElementById("mbld-modal");
const grid = document.getElementById("mbld-grid");
const openBtn = document.getElementById("open-mbld-modal");
const closeBtn = document.getElementById("mbld-close");

const countInput = document.getElementById("mbld-count");

// "View Scrambles": new scrambles for the chosen number of cubes (at least 5), then the list
openBtn.addEventListener("click", async () => {
  if (eventObj.event !== "r3ni") return;

  const cubeCount = Number(countInput.value);

  // The event's default length is 5 cubes; more cubes need a longer scramble
  if (cubeCount > 5) {
    await displayScramble(eventObj.event, vis, cubeCount);
  } else {
    await displayScramble(eventObj.event, vis);
  }

  modal.style.display = "block";

  await renderMBLDGrid(grid, countInput, currentScramble);
});

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// New cube count: make that many scrambles and rebuild the list
countInput.addEventListener("input", async () => {
  let value = Number(countInput.value);

  if (value < 1) value = 1;

  // Regenerate scrambles if above current amount
  await displayScramble(eventObj.event, vis, value);

  await renderMBLDGrid(grid, countInput, currentScramble);
});

  // Timer warnings: one checkbox every 5 minutes from 55 down to 5 minutes left, saved in localStorage
  const TOTAL_MINUTES = 55;
  const STEP = 5;
  const STORAGE_KEY = "timerWarningConfig_v1";

  // Minutes left → whether that warning plays (read by timer/countdownTimer.js)
  const timerWarnings = {};

  const openBtn2 = document.getElementById("openConfig");
  const modal2 = document.getElementById("modal2");
  const overlay = document.getElementById("overlay");
  const warningContainer = document.getElementById("warningOptions");

  // Saving and loading the warnings

  // Saves the ticked warnings
  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timerWarnings));
  }

  // Loads the saved warnings into timerWarnings
  function loadFromStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(timerWarnings, parsed);
    }
  }

  // The warnings pop-up

  // Shows the pop-up and its backdrop
  function openModal() {
    modal2.style.display = "block";
    overlay.style.display = "block";
  }

  // Hides them
  function closeModal() {
    modal2.style.display = "none";
    overlay.style.display = "none";
  }

  // Builds one checkbox per warning time, ticked from timerWarnings
  function generateOptions() {
    warningContainer.innerHTML = "";

    for (let min = TOTAL_MINUTES; min > 0; min -= STEP) {
      const wrapper = document.createElement("div");
      wrapper.className = "minute-option";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = "warn_" + min;
      checkbox.checked = timerWarnings[min] || false;

      // Ticking a box saves right away, so Cancel doesn't undo it
      checkbox.addEventListener("change", () => {
        timerWarnings[min] = checkbox.checked;
        saveToStorage();
      });

      const label = document.createElement("label");
      label.htmlFor = checkbox.id;
      label.textContent = `${min} minutes left`;

      wrapper.appendChild(checkbox);
      wrapper.appendChild(label);
      warningContainer.appendChild(wrapper);
    }
  }

  // Every warning time starts off when it has never been saved
  function initializeDefaults() {
    for (let min = TOTAL_MINUTES; min > 0; min -= STEP) {
      if (timerWarnings[min] === undefined) {
        timerWarnings[min] = false;
      }
    }
  }

  // "Timer Warnings" button
  openBtn2.addEventListener("click", () => {
    generateOptions();
    openModal();
  });


  // Save, Cancel, or a click on the backdrop
  document.getElementById("saveConfig").addEventListener("click", () => {
  saveToStorage();
  closeModal();
});
  document.getElementById("closeModal").addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);

  // Load the saved warnings on startup

  loadFromStorage();
  initializeDefaults();

// First scramble (mainController calls this once the top bar has filled the selects)
async function initEvent() {
    // Start on the session's event, with its inspection type
    const session = getCurrentSession();
    eventObj.event = session.scrambleType || "333";
    eventSelect.value = eventObj.event;
    setEventInspection(eventObj.event, timerSettObj);

    await displayScramble(eventObj.event, vis);

    // Fewest Moves and Multi-Blind need their own layout on top
    const display = document.getElementById("timer");
    if (eventObj.event === "333fm") handleFMC(display);
    if (eventObj.event === "r3ni") handleMBLD(display);
}


export { eventObj, vis, handleFMC, handleMBLD, showTimerLayout, showTimeInsertion, setEventInspection, timerWarnings, initEvent };