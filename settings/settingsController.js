import { timerSettObj, deviceSettObj } from "./settingsState.js";
import { detectDeviceType, detectDeviceModel } from "./device.js";
import { timerObj } from "../timer/timerState.js";
import { bindVisibilityToggle } from "./layout.js";

// Settings panel: open and close it

const overlay = document.getElementById("settingsOverlay");
const openBtn = document.getElementById("settingsBtn");
const closeBtn = document.getElementById("closeSettings");

// The gear button opens the panel
openBtn.addEventListener("click", () => {
    overlay.classList.add("open");
});

// The close button hides it again
closeBtn.addEventListener("click", () => {
    overlay.classList.remove("open");
});

// Layout: each switch shows or hides every element with a class

bindVisibilityToggle("toggle-scramble-visualizer", "panel-cube");
bindVisibilityToggle("toggle-statistics", "right-sidebar");
bindVisibilityToggle("toggle-session-history", "left-sidebar");
bindVisibilityToggle("toggle-scramble-text", "scramble-container");
bindVisibilityToggle("toggle-penalty-bar", "penalty-bar");
bindVisibilityToggle("toggle-average-preview", "main-footer");
bindVisibilityToggle("toggle-time-diff", "time-diff");

// Reads one CSS variable from a theme class by putting a hidden element with that class on the page for a moment
function getThemeVar(themeClass, variable) {
  const temp = document.createElement('div');
  temp.className = themeClass;
  document.body.appendChild(temp);

  const value = getComputedStyle(temp).getPropertyValue(variable).trim();

  document.body.removeChild(temp);
  return value;
}

// Main background: load the saved color and set --bg-main on <html>, which overrides the default for the whole page
let mainBackground = localStorage.getItem("main-background") || "black";
document.getElementById("main-background").value = mainBackground;
const bgMain4 = getThemeVar(`theme-${mainBackground}`, '--bg-main');
document.documentElement.style.setProperty('--bg-main', bgMain4);

// Save and apply a new main background
document.getElementById("main-background").addEventListener("change", () => {
    mainBackground = document.getElementById("main-background").value;
    localStorage.setItem("main-background", mainBackground);
    const bgMain = getThemeVar(`theme-${mainBackground}`, '--bg-main');
    document.documentElement.style.setProperty('--bg-main', bgMain);
});

// Tertiary background (pop-ups, stats table header): drives --bg-secondary
let tertiaryBackgroumd = localStorage.getItem("tertiary-background") || "black";
document.getElementById("tertiary-background").value = tertiaryBackgroumd;
const bgMain3 = getThemeVar(`theme-${tertiaryBackgroumd}`, '--bg-secondary');
document.documentElement.style.setProperty('--bg-secondary', bgMain3);

// Save and apply a new tertiary background
document.getElementById("tertiary-background").addEventListener("change", () => {
    tertiaryBackgroumd = document.getElementById("tertiary-background").value;
    localStorage.setItem("tertiary-background", tertiaryBackgroumd);
    const bgMain = getThemeVar(`theme-${tertiaryBackgroumd}`, '--bg-secondary');
    document.documentElement.style.setProperty('--bg-secondary', bgMain);
});

// Secondary background (top bar, left sidebar, settings rows): drives --bg-tertiary
let secondaryBackground = localStorage.getItem("secondary-background") || "black";
document.getElementById("secondary-background").value = secondaryBackground;
const bgMain2 = getThemeVar(`theme-${secondaryBackground}`, '--bg-tertiary');
document.documentElement.style.setProperty('--bg-tertiary', bgMain2);
// Secondary text color, a .theme-text-* class on <body>
let textColor = localStorage.getItem("text-color") || "white";

// Save and apply a new secondary background, then fix the text color if it now matches the background
document.getElementById("secondary-background").addEventListener("change", () => {
    secondaryBackground = document.getElementById("secondary-background").value;
    localStorage.setItem("secondary-background", secondaryBackground);
    const bgMain = getThemeVar(`theme-${secondaryBackground}`, '--bg-tertiary');
    document.documentElement.style.setProperty('--bg-tertiary', bgMain);

  // Same base color (e.g. "red" and "red-light") would make the text unreadable
  const timesBase = getBaseColor(textColor);
  const bgBase = getBaseColor(secondaryBackground);

  if (timesBase === bgBase) {
    // Clash: switch the text to black on light backgrounds, white on dark ones
    const isLight =
      secondaryBackground.endsWith("-light") ||
      secondaryBackground.endsWith("-medium") ||
      secondaryBackground === "white";

    if (isLight) {
        document.body.classList.remove(`theme-text-${textColor}`);
        textColor = "black";
        document.body.classList.add(`theme-text-${textColor}`);
        localStorage.setItem("text-color", textColor);
        document.getElementById("text-color").value = textColor;
    } else {
            document.body.classList.remove(`theme-text-${textColor}`);
      textColor = "white";
        document.body.classList.add(`theme-text-${textColor}`);
        localStorage.setItem("text-color", textColor);
        document.getElementById("text-color").value = textColor;
    }
  } else {
    // No clash: keep the text color as it is
    document.body.classList.add(`theme-text-${textColor}`);
    localStorage.setItem("text-color", textColor);
    document.getElementById("text-color").value = textColor;
  }


});

// Buttons background: drives --border-main (buttons, selects, inputs and most borders)
let buttonsBackground = localStorage.getItem("buttons-background") || "black";
document.getElementById("buttons-background").value = buttonsBackground;
const bgMain = getThemeVar(`theme-${buttonsBackground}`, '--border-main');
document.documentElement.style.setProperty('--border-main', bgMain);

// Save and apply a new buttons background, then pick black or white times so they stay readable on it
document.getElementById("buttons-background").addEventListener("change", () => {
    buttonsBackground = document.getElementById("buttons-background").value;
    localStorage.setItem("buttons-background", buttonsBackground);
    const bgMain = getThemeVar(`theme-${buttonsBackground}`, '--border-main');
    document.documentElement.style.setProperty('--border-main', bgMain);

    // Light and medium shades (and white) count as light backgrounds
    const isLight =
      buttonsBackground.endsWith("-light") ||
      buttonsBackground.endsWith("-medium") ||
      buttonsBackground === "white";

    if (isLight) {
        timesColor = "black";
        applyTimesColor("black");
    } else {
        timesColor = "white";
        applyTimesColor("white");
    }
    }
);



// Main text color: used for times and numbers through --times-color
let timesColor = localStorage.getItem("times-color") || "white";


document.documentElement.style.setProperty('--times-color', getThemeVar(`theme-text-${timesColor}`, '--text-main'));

// Applies a main text color to --times-color, the timer, and every button, select and input, then saves it
function applyTimesColor(colorKey) {
    const colorValue = getThemeVar(`theme-text-${colorKey}`, '--text-main');
    document.documentElement.style.setProperty('--times-color', colorValue);
    document.getElementById('timer').style.color = colorValue;
    // Controls use timesColor (the variable), which callers set to colorKey before calling
    document.querySelectorAll("button").forEach(btn => btn.style.color = getThemeVar(`theme-text-${timesColor}`, '--text-main'));
    document.querySelectorAll("select").forEach(btn => btn.style.color = getThemeVar(`theme-text-${timesColor}`, '--text-main'));
    document.querySelectorAll("input").forEach(btn => btn.style.color = getThemeVar(`theme-text-${timesColor}`, '--text-main'));
    document.getElementById("times-color").value = timesColor;
    localStorage.setItem('times-color', colorKey);
}

// Color name without its shade
function getBaseColor(value) {
  return value.split("-")[0]; // "red-light" → "red"
}
// Show and apply the saved main text color on load
document.getElementById("times-color").value = timesColor;
applyTimesColor(timesColor);

// New main text color: apply it, unless it clashes with the buttons background
document.getElementById("times-color").addEventListener("change", (e) => {
    timesColor = e.target.value;
    applyTimesColor(timesColor);


  const timesBase = getBaseColor(timesColor);
  const bgBase = getBaseColor(buttonsBackground);

  if (timesBase === bgBase) {
    // Clash: switch to black on light buttons, white on dark ones
    const isLight =
      buttonsBackground.endsWith("-light") ||
      buttonsBackground.endsWith("-medium") ||
      buttonsBackground === "white";

    if (isLight) {
      timesColor = "black";
      applyTimesColor("black");
    } else {
      timesColor = "white";
      applyTimesColor("white");
    }
  } else {
    applyTimesColor(timesColor);
  }
});




// Show and apply the saved secondary text color on load
document.getElementById("text-color").value = textColor;
document.body.classList.remove(`theme-text-${textColor}`);
textColor = document.getElementById("text-color").value;
document.body.classList.add(`theme-text-${textColor}`);

// New secondary text color: swap the <body> class, unless it clashes with the secondary background
document.getElementById("text-color").addEventListener("change", () => {
    document.body.classList.remove(`theme-text-${textColor}`);
    textColor = document.getElementById("text-color").value;


  const timesBase = getBaseColor(textColor);
  const bgBase = getBaseColor(secondaryBackground);

  if (timesBase === bgBase) {
    // Clash: switch to black on light backgrounds, white on dark ones
    const isLight =
      secondaryBackground.endsWith("-light") ||
      secondaryBackground.endsWith("-medium") ||
      secondaryBackground === "white";

    if (isLight) {
        textColor = "black";
        document.body.classList.add(`theme-text-${textColor}`);
        localStorage.setItem("text-color", textColor);
    } else {
      textColor = "white";
        document.body.classList.add(`theme-text-${textColor}`);
        localStorage.setItem("text-color", textColor);
    }
    // Show the color actually used, not the one that clashed with the background
    document.getElementById("text-color").value = textColor;
  } else {
    document.body.classList.add(`theme-text-${textColor}`);
    localStorage.setItem("text-color", textColor);
    document.getElementById("text-color").value = textColor;
  }

});



// Load the saved choice; the dropdown's default (Press start) is only for the first visit
let inspectionStart = localStorage.getItem("inspectionStart") || document.getElementById("inspection-start").value;
localStorage.setItem("inspectionStart", inspectionStart);
document.getElementById("inspection-start").value = inspectionStart;
// The timer reads "inspectionStart" straight from localStorage, so saving is all a change needs
document.getElementById("inspection-start").addEventListener("change", () => {
    inspectionStart = document.getElementById("inspection-start").value;
    localStorage.setItem("inspectionStart", inspectionStart);
});

// Timer display (Show or Hide while solving); timer/timer.js reads the select itself
let timerDisplay = localStorage.getItem("timerDisplay") || "Show";
document.getElementById("timer-display").value = timerDisplay;
document.getElementById("timer-display").addEventListener("change", () => {
    timerDisplay = document.getElementById("timer-display").value;
    localStorage.setItem("timerDisplay", timerDisplay);
});

// Timer decimals (1, 2 or 3), loaded by settingsState.js; timer/timer.js reads timerSettObj on every update
document.getElementById("timer-decimals").value = timerSettObj.timerDecimals;
document.getElementById("timer-decimals").addEventListener("change", () => {
    // The select's values are text ("1", "2", "3"), so turn them into a number
    timerSettObj.timerDecimals = Number(document.getElementById("timer-decimals").value);
    localStorage.setItem("timerDecimals", timerSettObj.timerDecimals);
});

// Number of timer phases per solve, kept in timerObj.totalSolvePhases
const phaseInput = document.getElementById("phase-count");

// Set default value from state
phaseInput.value = timerObj.totalSolvePhases;

// Save every valid whole number of 1 or more
phaseInput.addEventListener("input", (e) => {
    const value = Number(e.target.value);

    if (!Number.isInteger(value) || value < 1) return;

    timerObj.totalSolvePhases = value;


    localStorage.setItem("totalSolvePhases", value);
});

// Load the saved phase count (Number(null) is 0, so a first visit keeps the default)
const savedPhases = Number(localStorage.getItem("totalSolvePhases"));

if (Number.isInteger(savedPhases) && savedPhases > 0) {
    timerObj.totalSolvePhases = savedPhases;
    document.getElementById("phase-count").value = savedPhases;
}

// Inspection type (WCA, Free, None), loaded by settingsState.js
document.getElementById("inspection-type").value = timerSettObj.inspectionType;
document.getElementById("inspection-type").addEventListener("change", () => {
    timerSettObj.inspectionType = document.getElementById("inspection-type").value;
    localStorage.setItem("inspectionType", timerSettObj.inspectionType);
});

// Delay flag (WCA 0.3 s hold, or None); exported, so the timer always sees the current value
let delayFlagType = localStorage.getItem("delayFlagType") || "WCA";
document.getElementById("delay-flag").value = delayFlagType;
document.getElementById("delay-flag").addEventListener("change", () => {
    delayFlagType = document.getElementById("delay-flag").value;
    localStorage.setItem("delayFlagType", delayFlagType);
});

// Time insertion setting (Timer or Typing)
let timeInsertion = localStorage.getItem("timeInsertion") || "Timer";
timerSettObj.timerFlag = timeInsertion === "Typing";

document.getElementById("time-insertion").value = timeInsertion;
document.getElementById("time-insertion").addEventListener("change", () => {
    setTimeInsertion(document.getElementById("time-insertion").value);
});

// Switch between Timer and Typing (the time insertion select and the Tab key both use this)
function setTimeInsertion(value) {
    timeInsertion = value;
    localStorage.setItem("timeInsertion", timeInsertion);
    document.getElementById("time-insertion").value = timeInsertion;
    // Fewest Moves and Multi-Blind keep the timer off whatever the setting says
    timerSettObj.timerFlag = timerSettObj.untimedEvent || timeInsertion === "Typing";
    updateTypingUI();
}

// Show the typed-time box in Typing mode, except on Fewest Moves and Multi-Blind
function updateTypingUI() {
    const container = document.getElementById("typing-container");
    if (!container) return;
    if (timeInsertion === "Typing" && !timerSettObj.untimedEvent) {
        container.style.display = "block";
        const input = document.getElementById("typed-time");
        if (input) input.focus();
    } else {
        container.style.display = "none";
    }
}

// This device (Settings → Data): the name saved on each solve as its "done at"
const deviceNameInput = document.getElementById("deviceNameInput");

// The type is known right away, so solves never lack a "done at"; the box shows it as the placeholder
deviceSettObj.detected = detectDeviceType();
deviceNameInput.value = deviceSettObj.name;
deviceNameInput.placeholder = deviceSettObj.detected;

// The model comes a moment later, and only on some devices; without one the type stays
detectDeviceModel().then(model => {
    if (!model) return;
    deviceSettObj.detected = model;
    deviceNameInput.placeholder = model;
});

// Save the name when the box loses focus or Enter is pressed; an empty box goes back to the detected one
deviceNameInput.addEventListener("change", () => {
    deviceSettObj.name = deviceNameInput.value.trim();
    deviceNameInput.value = deviceSettObj.name;   // show it without the spaces around it
    // Only keep the key while there's a name
    if (deviceSettObj.name) localStorage.setItem("deviceName", deviceSettObj.name);
    else localStorage.removeItem("deviceName");
});

export {
    delayFlagType,
    timeInsertion,
    setTimeInsertion,
    updateTypingUI,
    timerSettObj,
    getThemeVar
};
