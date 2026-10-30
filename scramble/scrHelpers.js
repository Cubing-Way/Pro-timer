import { scrdata } from "./scrData.js";

function getScrambleConfig(code) {
  for (const [, scrambles] of scrdata) {
    for (const [, scrambleCode, length] of scrambles) {
      if (scrambleCode === code) {
        return [scrambleCode, length || 0];
      }
    }
  }
  return null;
}

// =========================
// Events Cubisz can check (it only simulates a 3x3)
// =========================
const CUBISZ_CATEGORIES = ["3x3x3", "3x3x3 CFOP", "3x3x3 Roux", "3x3x3 Mehta", "3x3x3 subsets"];
const CUBISZ_WCA_EVENTS = ["333", "333ni", "333fm", "333oh"];

// True when the event's scrambles are for a single 3x3, so Cubisz can apply them and check a solution
function isCubiszEvent(code) {
  if (CUBISZ_WCA_EVENTS.includes(code)) return true;
  return scrdata.some(([category, scrambles]) =>
    CUBISZ_CATEGORIES.includes(category) && scrambles.some(([, scrambleCode]) => scrambleCode === code)
  );
}

// =========================
// Auto-fit scramble text
// =========================
function autoFitText(vis) {
  const container = document.getElementById("scrambleContainer");
  const text = document.getElementById("scrambleDisplay");

  let fontSize = 40;

  if (vis.id === "scrambleVis2") fontSize = 30;
  text.style.fontSize = fontSize + "px";
  text.style.whiteSpace = "pre-wrap";
  text.style.wordBreak = "break-word";

  // Force reflow
  text.offsetHeight;

  while (text.scrollHeight > container.clientHeight + 50) {
    fontSize -= 1;
    text.style.fontSize = fontSize + "px";
  }
}

// =========================
// Megaminx formatting
// =========================
function formatMegaminx(scr) {
  const moves = scr.split(" ");
  let out = [];
  let line = [];

  for (const move of moves) {
    line.push(move);
    if (move === "U" || move === "U'") {
      out.push(line.join(" "));
      line = [];
    }
  }

  if (line.length) out.push(line.join(" "));
  return out.join("\n");
}

export { getScrambleConfig, isCubiszEvent, autoFitText, formatMegaminx };
