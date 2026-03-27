import { displayScramble, currentScramble } from "./scramble.js";
import { averageOfN } from "./average.js";
import { timerObj } from "./timer/timerState.js";
import { timerSettObj } from "./settings/timerSett.js";
import { renderHistory } from "./render.js";
import { eventObj, vis } from "./topbar/event.js";
import { addAverageBlock } from "./solve.js";
import { updateDisplay } from "./timer/countdownTimer.js";
import { csTimer } from "./cstimer.js";

function handleMBLD() {
    document.getElementById("penaltyOkBtn").style.display = "none";
    document.getElementById("penaltyPlus2Btn").style.display = "none";
    document.getElementById("penaltyDnfBtn").style.display = "none";
    document.getElementById("removeLastBtn").style.display = "block";
    document.getElementById("submit-moves").style.display = "block";
    document.getElementById("submit-moves").textContent = "Submit result";
    document.getElementById("fmc-cube").style.display = "none";
    document.getElementById("fmc-solution").style.display = "block";
    document.getElementById("fmc-solution-test").style.display = "none";
    document.getElementById("fmc-move-count").style.display = "none";
    document.getElementById("fmc-form").style.display = "flex";
    document.getElementById("countdown").style.display = "block";
    document.getElementById("typing-container").style.display = "none";
    document.getElementById("timer").style.fontSize = "50px";
    document.getElementById("timerins").style.marginTop = "75px";
    document.getElementById("touchOverlay").style.display = "none";
    document.getElementById("fmc-label-form").textContent = "Solved / Total: ";
    document.getElementById("open-mbld-modal").style.display = "block";
    document.getElementById("openConfig").style.display = "block";
    updateDisplay();
}

function calculateMBLDPoints(resultStr) {
  if (typeof resultStr !== "string") {
    throw new Error("Input must be a string in format 'solved/total'");
  }

  const parts = resultStr.split("/");

  if (parts.length !== 2) {
    throw new Error("Invalid format. Use 'solved/total'");
  }

  const solved = Number(parts[0]);
  const total = Number(parts[1]);

  if (
    !Number.isInteger(solved) ||
    !Number.isInteger(total) ||
    solved < 0 ||
    total < 0 ||
    solved > total
  ) {
    throw new Error("Invalid cube counts");
  }

  const unsolved = total - solved;
  const points = solved - unsolved;

  return {
    points,
    result: `${solved} / ${total}`
  };
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

function parseMBLDScramble(scrambleText) {
  return scrambleText
    .split(/\d+\)/g)        // split at "1)", "2)", etc
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

const modal = document.getElementById("mbld-modal");
const grid = document.getElementById("mbld-grid");
const openBtn = document.getElementById("open-mbld-modal");
const closeBtn = document.getElementById("mbld-close");

const countInput = document.getElementById("mbld-count");

async function renderMBLDGrid() {
  grid.innerHTML = "";

  const scrambles = parseMBLDScramble(currentScramble);
  const limit = Math.min(Number(countInput.value), scrambles.length);

  const images = await Promise.all(
    scrambles.slice(0, limit).map(s => csTimer.getImage(s, "333"))
  );

  for (let i = 0; i < limit; i++) {
    const indexEl = document.createElement("div");
    indexEl.className = "mbld-index mbld-row";
    indexEl.textContent = i + 1;

    const scrambleEl = document.createElement("div");
    scrambleEl.className = "mbld-scramble mbld-row";
    scrambleEl.textContent = scrambles[i];

    const visualEl = document.createElement("div");
    visualEl.className = "mbld-visual mbld-row";
    visualEl.innerHTML = images[i];
    visualEl.style.transformOrigin = "top)";
    visualEl.style.transform = "scale(0.5)";
    grid.appendChild(indexEl);
    grid.appendChild(scrambleEl);
    grid.appendChild(visualEl);
  }
}

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

  await renderMBLDGrid();
});

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

countInput.addEventListener("input", async () => {
  let value = Number(countInput.value);

  if (value < 1) value = 1;

  // 🔥 Regenerate scrambles if above current amount
  await displayScramble(eventObj.event, vis, value);

  await renderMBLDGrid();
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

export { handleMBLD, timerWarnings };