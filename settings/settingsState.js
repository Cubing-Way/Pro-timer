const inspection = localStorage.getItem("inspectionType") || "WCA";

const timerSettObj = {
  inspectionType: inspection,
  timerFlag: false,     // true when the timer is off (Typing mode, Fewest Moves or Multi-Blind)
  untimedEvent: false   // true on Fewest Moves and Multi-Blind, set by showTimeInsertion
};

export { timerSettObj };
