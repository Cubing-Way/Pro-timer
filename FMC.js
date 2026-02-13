import { mountCube, setSize, setView, applyScramble, applySolution, getLastMoveCount, checkSolved } from "./cubisz/api.js";
import { currentScramble } from "./scramble.js";

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
    document.getElementById("fmc-form").style.display = "block"

    mountCube(document.getElementById("fmc-cube"));
    setSize(28);
    setView("3d");
    applyScramble(currentScramble);
    solutionFlag = false;
}

document.getElementById("fmc-solution").addEventListener("input", (e) => {
    e.preventDefault();
    applySolution(e.target.value.trim());
    solutionFlag = true;
});

document.getElementById("fmc-form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (solutionFlag) {
      document.getElementById("fmc-move-count").innerHTML = `${getLastMoveCount()} moves 
      <br>
      Result: ${checkSolved() ? "Solved" : "DNF"}`;
  } else {
    document.getElementById("fmc-move-count").innerHTML = `no moves`;
  }

});


export { handleFMC };