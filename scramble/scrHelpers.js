import { scrdata } from "./scrData.js";

// Finds an event code in the scramble list: [csTimer type, default length (0 = csTimer's default)], or null
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

// The first category that lists this event ("WCA" for "333"), or null when Pro Timer doesn't have it
function getCategoryOfEvent(code) {
  for (const [category, scrambles] of scrdata) {
    // Dividers like ===WCA=== only hold a "blank" placeholder
    if (category.startsWith("===")) continue;
    if (scrambles.some(([, scrambleCode]) => scrambleCode === code)) return category;
  }
  return null;
}

// Events Cubisz can check (it only simulates a 3x3)
const CUBISZ_CATEGORIES = ["3x3x3", "3x3x3 CFOP", "3x3x3 Roux", "3x3x3 Mehta", "3x3x3 subsets"];
const CUBISZ_WCA_EVENTS = ["333", "333ni", "333fm", "333oh"];

// True when the event's scrambles are for a single 3x3, so Cubisz can apply them and check a solution
function isCubiszEvent(code) {
  if (CUBISZ_WCA_EVENTS.includes(code)) return true;
  return scrdata.some(([category, scrambles]) =>
    CUBISZ_CATEGORIES.includes(category) && scrambles.some(([, scrambleCode]) => scrambleCode === code)
  );
}

// Shrinks the scramble text 1px at a time until it fits its box (starting at 40px, or 30px on phones)
function autoFitText(vis) {
  const container = document.getElementById("scrambleContainer");
  const text = document.getElementById("scrambleDisplay");

  let fontSize = 40;

  // The phone picture is in use, so the screen is small
  if (vis.id === "scrambleVis2") fontSize = 30;
  text.style.fontSize = fontSize + "px";
  // Keep line breaks (Megaminx) and break long scrambles anywhere
  text.style.whiteSpace = "pre-wrap";
  text.style.wordBreak = "break-word";

  // Force reflow
  text.offsetHeight;

  // 50px of slack below the box before shrinking
  while (text.scrollHeight > container.clientHeight + 50) {
    fontSize -= 1;
    text.style.fontSize = fontSize + "px";
  }
}

// Splits a Megaminx scramble into lines, each ending at a U or U' move
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

  // Moves after the last U, if any
  if (line.length) out.push(line.join(" "));
  return out.join("\n");
}

export { 
  getScrambleConfig, 
  isCubiszEvent, 
  autoFitText, 
  formatMegaminx, 
  getCategoryOfEvent 
};