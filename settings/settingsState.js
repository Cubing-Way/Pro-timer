// Saved inspection type, WCA on the first visit
const inspection = localStorage.getItem("inspectionType") || "WCA";

// Timer settings other folders read and change
const timerSettObj = {
  inspectionType: inspection,
  timerFlag: false,     // true when the timer is off (Typing mode, Fewest Moves or Multi-Blind)
  untimedEvent: false   // true on Fewest Moves and Multi-Blind, set by showTimeInsertion
};

// This device (Settings → Data): the name typed there, and what's used when it's empty
const deviceSettObj = {
  name: localStorage.getItem("deviceName") || "",   // "" when no name was typed
  detected: ""                                       // the device's type, then its model when the browser gives it (filled by settingsController.js)
};

export { timerSettObj, deviceSettObj };