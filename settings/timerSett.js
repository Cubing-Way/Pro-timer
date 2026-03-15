import { timerSettObj } from "./timerSetObj.js";
import { timerObj } from "../timer/timerState.js";

localStorage.setItem("inspectionStart", null);
document.getElementById("timer").style.color = "green";
let inspectionStart = document.getElementById("inspection-start").value;
localStorage.setItem("inspectionStart", inspectionStart);
document.getElementById("inspection-start").value = inspectionStart;
document.getElementById("inspection-start").addEventListener("change", () => {
    inspectionStart = document.getElementById("inspection-start").value;
    localStorage.setItem("inspectionStart", inspectionStart);
});

let timerDisplay = localStorage.getItem("timerDisplay") || "Show";
document.getElementById("timer-display").value = timerDisplay;
document.getElementById("timer-display").addEventListener("change", () => {
    timerDisplay = document.getElementById("timer-display").value;
    localStorage.setItem("timerDisplay", timerDisplay);
});

const phaseInput = document.getElementById("phase-count");

// Set default value from state
phaseInput.value = timerObj.totalSolvePhases;

phaseInput.addEventListener("input", (e) => {
    const value = Number(e.target.value);

    if (!Number.isInteger(value) || value < 1) return;

    timerObj.totalSolvePhases = value;

    console.log("Total solve phases set to:", value);

    // Optional: persist
    localStorage.setItem("totalSolvePhases", value);
});

const savedPhases = Number(localStorage.getItem("totalSolvePhases"));

if (Number.isInteger(savedPhases) && savedPhases > 0) {
    timerObj.totalSolvePhases = savedPhases;
    document.getElementById("phase-count").value = savedPhases;
}

document.getElementById("inspection-type").value = timerSettObj.inspectionType;
document.getElementById("inspection-type").addEventListener("change", () => {
    timerSettObj.previousInspectionType = timerSettObj.inspectionType;
    timerSettObj.inspectionType = document.getElementById("inspection-type").value;
    localStorage.setItem("inspectionType", timerSettObj.inspectionType);
});

let delayFlagType = localStorage.getItem("delayFlagType") || "WCA";
document.getElementById("delay-flag").value = delayFlagType;
document.getElementById("delay-flag").addEventListener("change", () => {
    delayFlagType = document.getElementById("delay-flag").value;
    localStorage.setItem("delayFlagType", delayFlagType);
});

// Time insertion setting (Timer or Typing)
let timeInsertion = localStorage.getItem("timeInsertion") || "Timer";
    if (timeInsertion === "Typing") {
        timerSettObj.timerFlag = true;
    } else {
        timerSettObj.timerFlag = false;
    }
    
document.getElementById("time-insertion").value = timeInsertion;
document.getElementById("time-insertion").addEventListener("change", () => {
    timeInsertion = document.getElementById("time-insertion").value;
    if (timeInsertion === "Typing") {
        timerSettObj.timerFlag = true;
    } else {
        timerSettObj.timerFlag = false;
    }
    localStorage.setItem("timeInsertion", timeInsertion);
    updateTypingUI();
});

function updateTypingUI() {
    const container = document.getElementById("typing-container");
    if (!container) return;
    if (localStorage.getItem("timeInsertion") === "Typing") {
        container.style.display = "block";
        const input = document.getElementById("typed-time");
        if (input) input.focus();
    } else {
        container.style.display = "none";
    }
}

export { 
    delayFlagType, 
    timeInsertion, 
    updateTypingUI,
    timerSettObj
};