import {
  mountCube,
  setSize,
  setView,
  applyScramble,
  setFMC
} from "../cubisz/api.js";

import { updateDisplay } from "../timer/countdownTimer.js";

// Fewest Moves layout: solution form, cubisz cube with the scramble applied, countdown on the timer
function handleFMC(display, currentScramble, countdownObj) {
    // Only the remove button among the penalties; submit, countdown and timer warnings appear
    document.getElementById("penaltyOkBtn").style.display = "none";
    document.getElementById("penaltyPlus2Btn").style.display = "none";
    document.getElementById("penaltyDnfBtn").style.display = "none";
    document.getElementById("removeLastBtn").style.display = "block";
    document.getElementById("submit-moves").style.display = "block";
    // Multi-Blind renames this button, so Fewest Moves sets its own text back
    document.getElementById("submit-moves").textContent = "Submit solution";
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
    // No difference to the previous solve: the timer shows the countdown, not a time
    document.getElementById("time-diff").style.display = "none";


    // Smaller timer showing the 1-hour countdown; no touch timing, so the form can be used
    document.getElementById("timer").style.fontSize = "50px";
    document.getElementById("touchOverlay").style.display = "none";
    updateDisplay(countdownObj, display);
    // Draw a 3D cubisz cube with the scramble applied, in FMC mode
    mountCube(document.getElementById("fmc-cube"));
    setSize(28);
    setView("3d");
    applyScramble(currentScramble);
    setFMC(true);
}

export { handleFMC };
