// Layout for the events timed with the timer: everything but Fewest Moves
// (handleFMC in FMC.js) and Multi-Blind (handleMBLD in MBLD.js)
function showTimerLayout(vis) {
    document.getElementById("penaltyOkBtn").style.display = "block";
    document.getElementById("penaltyPlus2Btn").style.display = "block";
    document.getElementById("penaltyDnfBtn").style.display = "block";
    document.getElementById("removeLastBtn").style.display = "block";
    document.getElementById("submit-moves").style.display = "none";
    document.getElementById("fmc-cube").style.display = "none";
    document.getElementById("fmc-solution").style.display = "none";
    document.getElementById("fmc-solution-test").style.display = "none";
    document.getElementById("fmc-move-count").style.display = "none";
    document.getElementById("fmc-form").style.display = "none";
    document.getElementById("countdown").style.display = "none";
    document.getElementById("touchOverlay").style.display = "block";
    document.getElementById("typing-container").style.display = "none";
    document.getElementById("timerins").style.marginTop = "0px";
    document.getElementById("open-mbld-modal").style.display = "none";
    document.getElementById("openConfig").style.display = "none";

    if (vis === document.querySelector("#scrambleVis")) {
        document.getElementById("timer").style.fontSize = "140px";
    } else {
        document.getElementById("timer").style.fontSize = "72px";
    }

    document.getElementById("timer").textContent = "0.00";
}

// Typed-in times or the timer: Fewest Moves and Multi-Blind never use the timer
function showTimeInsertion(event, timeInsertion, timerSettObj) {
    if (event === "333fm" || event === "r3ni") {
        timerSettObj.timerFlag = true;
        document.getElementById("typing-container").style.display = "none";
        document.querySelector(".timerOpt").style.display = "none";
    } else {
        document.querySelector(".timerOpt").style.display = "block";
        if (timeInsertion === "Typing") {
            document.getElementById("typing-container").style.display = "block";
            timerSettObj.timerFlag = true;
        } else {
            timerSettObj.timerFlag = false;
        }
    }
}

export { showTimerLayout, showTimeInsertion };
