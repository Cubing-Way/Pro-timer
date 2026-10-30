import { updateDisplay } from "../timer/countdownTimer.js";
import { csTimer } from "../main/cstimer.js";


function handleMBLD(display, countdownObj) {
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
    updateDisplay(countdownObj, display);
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

function parseMBLDScramble(scrambleText) {
  return scrambleText
    .split(/\d+\)/g)        // split at "1)", "2)", etc
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

async function renderMBLDGrid(grid, countInput, currentScramble) {
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

export { handleMBLD, calculateMBLDPoints, parseMBLDScramble, renderMBLDGrid };
