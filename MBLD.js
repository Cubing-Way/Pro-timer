import { displayScramble, currentScramble } from "./scramble.js";
import { averageOfN } from "./average.js";
import { timerObj } from "./timer/timerState.js";
import { timerSettObj } from "./settings/timerSett.js";
import { renderHistory } from "./render.js";
import { eventObj, vis } from "./topbar/event.js";
import { addAverageBlock } from "./solve.js";
import { updateDisplay } from "./timer/countdownTimer.js";

function handleMBLD() {
    document.getElementById("penaltyOkBtn").style.display = "none";
    document.getElementById("penaltyPlus2Btn").style.display = "none";
    document.getElementById("penaltyDnfBtn").style.display = "none";
    document.getElementById("removeLastBtn").style.display = "none";
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


export { handleMBLD };