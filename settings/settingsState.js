// Saved inspection type, WCA on the first visit
const inspection = localStorage.getItem("inspectionType") || "WCA";

// Timer settings other folders read and change
const timerSettObj = {
  inspectionType: inspection,
  timerFlag: false,     // true when the timer is off (Typing mode, Fewest Moves or Multi-Blind)
  untimedEvent: false   // true on Fewest Moves and Multi-Blind, set by showTimeInsertion
};

export { timerSettObj };