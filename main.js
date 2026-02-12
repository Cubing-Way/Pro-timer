import { currentScramble } from "./scramble.js";
import  "./timer/timerDOM.js";
import "./settings/layout.js";
import "./settings/settings.js";
import "./topbar/topbarButtons.js"
import { penalty2, remove2 } from "./solve.js";
import { saveSessions } from "./session.js";
import { renderHistory } from "./render.js";
import { averageObj } from "./average.js";
import { openDetailsModal, modal } from "./topbar/modal.js";



document.getElementById("scramble-button").addEventListener("click", () => {
    if (scrDisplayFlag) {
        document.querySelector(".panel-cube2").style.display = "none";
        document.getElementById("scramble-button").innerHTML = "Scramble visualizer";
        document.getElementById("scramble-button").style.justifySelf = "center";
        scrDisplayFlag = false;
        return;
    }
    scrDisplayFlag = true;
    document.querySelector(".panel-cube2").style.display = "grid";
    document.getElementById("scramble-button").style.justifySelf = "left";
    document.getElementById("scramble-button").innerHTML = "close";
});

window.setPenalty = function(blockIndex, solveIndex, penalty) {
    penalty2(blockIndex, solveIndex, penalty);
    saveSessions();
    renderHistory();

    if (!modal.classList.contains("hidden")) {
        openDetailsModal();
    }
};

window.removeSolve = function(blockIndex, solveIndex) {
    remove2(blockIndex, solveIndex)
    saveSessions();
    renderHistory();
    localStorage.setItem("cube_average_buffer", JSON.stringify(averageObj));
    if (!modal.classList.contains("hidden")) {
        openDetailsModal();
    }
};


export { currentScramble };
