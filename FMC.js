import { 
  mountCube, 
  setSize, 
  setView, 
  applyScramble, 
  applySolution, 
  getLastMoveCount, 
  checkSolved 
} from "./cubisz/api.js";
import { displayScramble, currentScramble } from "./scramble.js";
import { averageOfN } from "./average.js";
import { timerObj } from "./timer/timerState.js";
import { timerSettObj } from "./settings/timerSett.js";
import { renderHistory } from "./render.js";
import { eventObj, vis } from "./topbar/event.js";
import { addAverageBlock } from "./solve.js";
import { updateDisplay } from "./timer/countdownTimer.js";

let solutionFlag = false;
function handleFMC() {
    document.getElementById("penaltyOkBtn").style.display = "none";
    document.getElementById("penaltyPlus2Btn").style.display = "none";
    document.getElementById("penaltyDnfBtn").style.display = "none";
    document.getElementById("removeLastBtn").style.display = "none";
    document.getElementById("submit-moves").style.display = "block";
    document.getElementById("fmc-cube").style.display = "block";
    document.getElementById("fmc-solution").style.display = "block";
    document.getElementById("fmc-solution-test").style.display = "block";
    document.getElementById("fmc-move-count").style.display = "block";
    document.getElementById("fmc-form").style.display = "flex";
    document.getElementById("countdown").style.display = "block";
    document.getElementById("typing-container").style.display = "none";
    document.getElementById("fmc-label-form").textContent = "Solution: ";

    
    document.getElementById("timer").style.fontSize = "50px";
    document.getElementById("touchOverlay").style.display = "none";
    updateDisplay();
    mountCube(document.getElementById("fmc-cube"));
    setSize(28);
    setView("3d");
    applyScramble(currentScramble);
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


export { handleFMC };