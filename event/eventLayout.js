// Layout for every event timed with the timer (Fewest Moves and Multi-Blind have handleFMC and handleMBLD instead)
function showTimerLayout(vis) {
    // Penalty buttons on, Fewest Moves / Multi-Blind controls off, touch timing on
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
    // The typed-time box is left to showTimeInsertion, which knows the Typing setting
    document.getElementById("timerins").style.marginTop = "0px";
    document.getElementById("open-mbld-modal").style.display = "none";
    document.getElementById("openConfig").style.display = "none";

    // Full-size timer again (Fewest Moves and Multi-Blind shrink it): big on desktop, smaller on phones
    if (vis === document.querySelector("#scrambleVis")) {
        document.getElementById("timer").style.fontSize = "140px";
    } else {
        document.getElementById("timer").style.fontSize = "72px";
    }

    document.getElementById("timer").textContent = "0.00";
}

// Typed-in times or the timer: Fewest Moves and Multi-Blind never use the timer
function showTimeInsertion(event, timeInsertion, timerSettObj) {
    timerSettObj.untimedEvent = event === "333fm" || event === "r3ni";
    const typing = timeInsertion === "Typing" && !timerSettObj.untimedEvent;

    // The timer options don't apply to Fewest Moves and Multi-Blind
    document.querySelector(".timerOpt").style.display = timerSettObj.untimedEvent ? "none" : "block";
    document.getElementById("typing-container").style.display = typing ? "block" : "none";
    // Timer off for untimed events and in Typing mode
    timerSettObj.timerFlag = timerSettObj.untimedEvent || typing;
}

// BLD events get no inspection; the other events use the inspection type saved in the settings
function setEventInspection(event, timerSettObj) {
    if (["333ni", "444bld", "555bld"].includes(event)) { // Multi-Blind (r3ni) isn't here: it has no timer
        timerSettObj.inspectionType = "None";
    } else {
        timerSettObj.inspectionType = localStorage.getItem("inspectionType") || "WCA";
    }
    document.getElementById("inspection-type").value = timerSettObj.inspectionType;
}

export { showTimerLayout, showTimeInsertion, setEventInspection };
