import { getCurrentSession, addAverageBlock } from "../session/sessionController.js";
import { displayScramble, currentScramble } from "../scramble/scrambleController.js";
import { timerSettObj } from "../settings/timerSetObj.js";
import { timeInsertion } from "../settings/settingsController.js";
import { timerObj, countdownObj } from "../timer/timerState.js";
import { averageOfN } from "../average/avgController.js";
import { renderHistory } from "../render/renderController.js";
import { applyScramble, applySolution, getLastMoveCount, checkSolved } from "../cubisz/api.js";
import { handleFMC as handleFMCWith } from "./FMC.js";
import { handleMBLD as handleMBLDWith, calculateMBLDPoints, parseMBLDScramble, renderMBLDGrid } from "./MBLD.js";

const eventObj = {
    event: getCurrentSession().scrambleType || "333", 
};

let vis = null;
    if (window.innerWidth > 768) {
        vis = document.querySelector("#scrambleVis");
    } else {
        vis = document.querySelector("#scrambleVis2");
    }
    

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

const eventSelect = document.getElementById("eventSelect");

// ===============================
// Fewest Moves
// ===============================

let solutionFlag = false;
function handleFMC(display = document.getElementById("timer")) {
    handleFMCWith(display, currentScramble, countdownObj);
    solutionFlag = false;
}

document.getElementById("fmc-solution").addEventListener("input", (e) => {
  if (eventObj.event !== "333fm") return;
    e.preventDefault();
    applySolution(e.target.value.trim());
    solutionFlag = true;
});

let moveCount = null;

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
    solution: document.getElementById("fmc-solution").value
  };

  timerObj.inspection = 0;
  if (!checkSolved()) timerObj.inspection = 17;

  const block = averageOfN(fmcObj, currentScramble, timerObj.inspection, timerSettObj.inspectionType, true);
  if (block) addAverageBlock(block);
  renderHistory();
  await displayScramble(eventObj.event, vis);
  applyScramble(currentScramble);
  document.getElementById("fmc-solution").value = "";
});

// ===============================
// Multi-Blind
// ===============================

function handleMBLD(display) {
    handleMBLDWith(display, countdownObj);
}


document.getElementById("fmc-form").addEventListener("submit", async (e) => {
  if (eventObj.event !== "r3ni") return;
  e.preventDefault();
  if (document.getElementById("fmc-solution").value !== "") {
  } else {
    alert("Submit needs a result");
    return;
  }

  const block = averageOfN(calculateMBLDPoints((document.getElementById("fmc-solution").value)), currentScramble, timerObj.inspection, timerSettObj.inspectionType, false, false, true);
  if (block) addAverageBlock(block);
  renderHistory();
  await displayScramble(eventObj.event, vis);
  document.getElementById("fmc-solution").value = "";
});


document.getElementById("submit-moves").addEventListener("click", async () => {
  if (eventObj.event !== "r3ni") return;
  if (document.getElementById("fmc-solution").value !== "") {
  } else {
    alert("Submit needs a result");
    return;
  }

  const result = calculateMBLDPoints((document.getElementById("fmc-solution").value));


  const block = averageOfN(result, currentScramble, timerObj.inspection, timerSettObj.inspectionType, false, false, true);
  if (block) addAverageBlock(block);
  renderHistory();
  await displayScramble(eventObj.event, vis);
  document.getElementById("fmc-solution").value = "";
});

const modal = document.getElementById("mbld-modal");
const grid = document.getElementById("mbld-grid");
const openBtn = document.getElementById("open-mbld-modal");
const closeBtn = document.getElementById("mbld-close");

const countInput = document.getElementById("mbld-count");

openBtn.addEventListener("click", async () => {
  if (eventObj.event !== "r3ni") return;

  const cubeCount = Number(countInput.value);

  if (cubeCount > 5) {
    await displayScramble(eventObj.event, vis, cubeCount);
  } else {
    await displayScramble(eventObj.event, vis);
  }

  modal.style.display = "block";

  const scrambles = parseMBLDScramble(currentScramble);

  await renderMBLDGrid(grid, countInput, currentScramble);
});

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

countInput.addEventListener("input", async () => {
  let value = Number(countInput.value);

  if (value < 1) value = 1;

  // 🔥 Regenerate scrambles if above current amount
  await displayScramble(eventObj.event, vis, value);

  await renderMBLDGrid(grid, countInput, currentScramble);
});

  const TOTAL_MINUTES = 55;
  const STEP = 5;
  const STORAGE_KEY = "timerWarningConfig_v1";

  const timerWarnings = {};

  const openBtn2 = document.getElementById("openConfig");
  const modal2 = document.getElementById("modal2");
  const overlay = document.getElementById("overlay");
  const warningContainer = document.getElementById("warningOptions");

  // ---------- STORAGE ----------

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timerWarnings));
  }

  function loadFromStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(timerWarnings, parsed);
    }
  }

  // ---------- MODAL ----------

  function openModal() {
    modal2.style.display = "block";
    overlay.style.display = "block";
  }

  function closeModal() {
    modal2.style.display = "none";
    overlay.style.display = "none";
  }

  function generateOptions() {
    warningContainer.innerHTML = "";

    for (let min = TOTAL_MINUTES; min > 0; min -= STEP) {
      const wrapper = document.createElement("div");
      wrapper.className = "minute-option";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = "warn_" + min;
      checkbox.checked = timerWarnings[min] || false;

      checkbox.addEventListener("change", () => {
        timerWarnings[min] = checkbox.checked;
        saveToStorage(); // 🔥 auto-save on change
      });

      const label = document.createElement("label");
      label.htmlFor = checkbox.id;
      label.textContent = `${min} minutes left`;

      wrapper.appendChild(checkbox);
      wrapper.appendChild(label);
      warningContainer.appendChild(wrapper);
    }
  }

  // ---------- INIT DEFAULTS ----------

  function initializeDefaults() {
    for (let min = TOTAL_MINUTES; min > 0; min -= STEP) {
      if (timerWarnings[min] === undefined) {
        timerWarnings[min] = false;
      }
    }
  }

  // ---------- EVENTS ----------

  openBtn2.addEventListener("click", () => {
    generateOptions();
    openModal();
  });


  document.getElementById("saveConfig").addEventListener("click", () => {
  saveToStorage();   
  closeModal();    
});
  document.getElementById("closeModal").addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);

  // ---------- STARTUP ----------

  loadFromStorage();
  initializeDefaults();

// ===============================
// First scramble (mainController calls this once the top bar has filled the selects)
// ===============================

async function initEvent() {
    // Default scramble
    // Init scramble from session
    const session = getCurrentSession();
    eventObj.event = session.scrambleType || "333";
    eventSelect.value = eventObj.event;


    await displayScramble(eventObj.event, vis);

    const display = document.getElementById("timer");
    if (eventObj.event === "333fm") handleFMC(display);
    if (eventObj.event === "r3ni") handleMBLD(display);
}


export { eventObj, vis, handleFMC, handleMBLD, timerWarnings, initEvent };
