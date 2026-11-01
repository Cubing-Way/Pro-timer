// Saved inspection type, WCA on the first visit
const inspection = localStorage.getItem("inspectionType") || "WCA";
// Saved timer decimals (1, 2 or 3), 2 on the first visit
const decimals = Number(localStorage.getItem("timerDecimals")) || 2;

// Timer settings other folders read and change
const timerSettObj = {
  inspectionType: inspection,
  timerFlag: false,     // true when the timer is off (Typing mode, Fewest Moves or Multi-Blind)
  untimedEvent: false,  // true on Fewest Moves and Multi-Blind, set by showTimeInsertion
  timerDecimals: decimals   // decimals the timer shows (1, 2 or 3); solves are still saved with 2
};

// This device (Settings → Data): the name typed there, and what's used when it's empty
const deviceSettObj = {
  name: localStorage.getItem("deviceName") || "",   // "" when no name was typed
  detected: ""                                       // the device's type, then its model when the browser gives it (filled by settingsController.js)
};

export { timerSettObj, deviceSettObj };