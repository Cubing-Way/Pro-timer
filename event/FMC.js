import {
  mountCube,
  setSize,
  setView,
  applyScramble,
  setFMC
} from "../cubisz/api.js";

import { updateDisplay } from "../timer/countdownTimer.js";

function handleFMC(display, currentScramble, countdownObj) {
    document.getElementById("penaltyOkBtn").style.display = "none";
    document.getElementById("penaltyPlus2Btn").style.display = "none";
    document.getElementById("penaltyDnfBtn").style.display = "none";
    document.getElementById("removeLastBtn").style.display = "block";
    document.getElementById("submit-moves").style.display = "block";
    document.getElementById("fmc-cube").style.display = "block";
    document.getElementById("fmc-solution").style.display = "block";
    document.getElementById("fmc-solution-test").style.display = "block";
    document.getElementById("fmc-move-count").style.display = "block";
    document.getElementById("fmc-form").style.display = "flex";
    document.getElementById("countdown").style.display = "block";
    document.getElementById("typing-container").style.display = "none";
    document.getElementById("fmc-label-form").textContent = "Solution: ";
    document.getElementById("open-mbld-modal").style.display = "none";

    document.getElementById("openConfig").style.display = "block";


    document.getElementById("timer").style.fontSize = "50px";
    document.getElementById("touchOverlay").style.display = "none";
    updateDisplay(countdownObj, display);
    mountCube(document.getElementById("fmc-cube"));
    setSize(28);
    setView("3d");
    applyScramble(currentScramble);
    setFMC(true);
}

export { handleFMC };
