import { timerSettObj } from "./timerSetObj.js";
import { timerObj } from "../timer/timerState.js";

function getThemeVar(themeClass, variable) {
  const temp = document.createElement('div');
  temp.className = themeClass;
  document.body.appendChild(temp);

  const value = getComputedStyle(temp).getPropertyValue(variable).trim();

  document.body.removeChild(temp);
  return value;
}

let mainBackground = localStorage.getItem("main-background") || "black";
document.getElementById("main-background").value = mainBackground;
const bgMain4 = getThemeVar(`theme-${mainBackground}`, '--bg-main');
document.documentElement.style.setProperty('--bg-main', bgMain4);

document.getElementById("main-background").addEventListener("change", () => {
    mainBackground = document.getElementById("main-background").value;
    localStorage.setItem("main-background", mainBackground);
    const bgMain = getThemeVar(`theme-${mainBackground}`, '--bg-main');
    document.documentElement.style.setProperty('--bg-main', bgMain);
});

let tertiaryBackgroumd = localStorage.getItem("tertiary-background") || "black";
document.getElementById("tertiary-background").value = tertiaryBackgroumd;
const bgMain3 = getThemeVar(`theme-${tertiaryBackgroumd}`, '--bg-secondary');
document.documentElement.style.setProperty('--bg-secondary', bgMain3);

document.getElementById("tertiary-background").addEventListener("change", () => {
    tertiaryBackgroumd = document.getElementById("tertiary-background").value;
    localStorage.setItem("tertiary-background", tertiaryBackgroumd);
    const bgMain = getThemeVar(`theme-${tertiaryBackgroumd}`, '--bg-secondary');
    document.documentElement.style.setProperty('--bg-secondary', bgMain);
});

let secondaryBackground = localStorage.getItem("secondary-background") || "black";
document.getElementById("secondary-background").value = secondaryBackground;
const bgMain2 = getThemeVar(`theme-${secondaryBackground}`, '--bg-tertiary');
document.documentElement.style.setProperty('--bg-tertiary', bgMain2);

document.getElementById("secondary-background").addEventListener("change", () => {
    secondaryBackground = document.getElementById("secondary-background").value;
    localStorage.setItem("secondary-background", secondaryBackground);
    const bgMain = getThemeVar(`theme-${secondaryBackground}`, '--bg-tertiary');
    document.documentElement.style.setProperty('--bg-tertiary', bgMain);
});

let buttonsBackground = localStorage.getItem("buttons-background") || "black";
document.getElementById("buttons-background").value = buttonsBackground;
const bgMain = getThemeVar(`theme-${buttonsBackground}`, '--border-main');
document.documentElement.style.setProperty('--border-main', bgMain);

document.getElementById("buttons-background").addEventListener("change", () => {
    buttonsBackground = document.getElementById("buttons-background").value;
    localStorage.setItem("buttons-background", buttonsBackground);
    const bgMain = getThemeVar(`theme-${buttonsBackground}`, '--border-main');
    document.documentElement.style.setProperty('--border-main', bgMain);
});



// usage
// const bgMain = getThemeVar('theme-blue', '--bg-main');
 
// apply only that variable
// document.documentElement.style.setProperty('--bg-main', bgMain);


let timesColor = localStorage.getItem("times-color") || "white";


document.documentElement.style.setProperty('--times-color', getThemeVar(`theme-text-${timesColor}`, '--text-main'));

function applyTimesColor(colorKey) {
    const colorValue = getThemeVar(`theme-text-${colorKey}`, '--text-main');
    document.documentElement.style.setProperty('--times-color', colorValue);
    document.getElementById('timer').style.color = colorValue;
    document.querySelectorAll("button").forEach(btn => btn.style.color = getThemeVar(`theme-text-${timesColor}`, '--text-main'));
    document.querySelectorAll("select").forEach(btn => btn.style.color = getThemeVar(`theme-text-${timesColor}`, '--text-main'));
    document.querySelectorAll("input").forEach(btn => btn.style.color = getThemeVar(`theme-text-${timesColor}`, '--text-main'));
    localStorage.setItem('times-color', colorKey);
}


document.getElementById("times-color").value = timesColor;
applyTimesColor(timesColor);

document.getElementById("times-color").addEventListener("change", (e) => {
    timesColor = e.target.value;
    applyTimesColor(timesColor);
});

let textColor = localStorage.getItem("text-color") || "white";

document.getElementById("text-color").value = textColor;
document.body.classList.remove(`theme-text-${textColor}`);
textColor = document.getElementById("text-color").value;
document.body.classList.add(`theme-text-${textColor}`);

document.getElementById("text-color").addEventListener("change", () => {
    document.body.classList.remove(`theme-text-${textColor}`);
    textColor = document.getElementById("text-color").value;
    document.body.classList.add(`theme-text-${textColor}`);
    localStorage.setItem("text-color", textColor);
});



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
    timerSettObj,
    getThemeVar
};