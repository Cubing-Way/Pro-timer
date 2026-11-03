import { scrdata } from "./scrData.js";

// The first category that lists this event ("WCA" for "333"), or null when Pro Timer doesn't have it
function getCategoryOfEvent(code) {
  for (const [category, scrambles] of scrdata) {
    if (scrambles.some(([, scrambleCode]) => scrambleCode === code)) return category;
  }
  return null;
}

// An event's name in the menu ("3x3x3" for "333"), or the code itself when Pro Timer doesn't list it
function getEventName(code) {
  for (const [category, scrambles] of scrdata) {
    // The first category that lists it gives its name (WCA's "3x3x3", not "random state (WCA)")
    const found = scrambles.find(([, scrambleCode]) => scrambleCode === code);
    if (found) return found[0];
  }
  return code;
}

// Events Cubisz can check (it only simulates a 3x3)
const CUBISZ_EVENTS = ["333", "333ni", "333fm", "333oh", "333ft"];
// 3x3 training events Pro Timer no longer has: solves saved on them keep their solution box
const OLD_3X3_EVENTS = [
  "333o", "edges", "corners",
  "pll", "oll", "lsll2", "ll", "zbll", "coll", "cll", "ell", "2gll", "zzll", "zbls", "eols", "wvls", "vls", "f2l", "eoline", "easyc", "easyxc",
  "sbrx", "cmll", "lse", "lsemu",
  "mt3qb", "mteole", "mttdr", "mt6cp", "mtcdrll", "mtl5ep", "ttll",
  "2gen", "2genl", "roux", "3gen_F", "3gen_L", "RrU", "333drud", "half", "lsll"
];

// True when the event's scrambles are for a single 3x3, so Cubisz can apply them and check a solution
function isCubiszEvent(code) {
  return CUBISZ_EVENTS.includes(code) || OLD_3X3_EVENTS.includes(code);
}

// True when Cubisz's review means something for the event: its engine and effort are for two hands solving with a speed method (so not one-handed, feet, blindfolded or Fewest Moves)
function isMetricsEvent(code) {
  return code === "333";
}

// Moves cubisz's cube can do; it skips any others, so a solution check on a scramble with them would be wrong
const CUBISZ_MOVE = /^([UDRLFB]w?|[MESxyz])['2]?$/;
// In Fewest Moves its cube also skips slice moves
const FMC_MOVE = /^([UDRLFB]w?|[xyz])['2]?$/;

// True when cubisz's cube can do every move of a scramble for this event
function isCubiszScramble(scramble, event) {
  const allowedMove = event === "333fm" ? FMC_MOVE : CUBISZ_MOVE;
  return scramble.split(" ").every((move) => allowedMove.test(move));
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

// Splits a Multi-Blind scramble ("1) … 2) …") into one scramble per cube
function parseMBLDScramble(scrambleText) {
  return scrambleText
    .split(/\d+\)/g)        // split at "1)", "2)", etc
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

export { 
  isCubiszEvent,
  isMetricsEvent,
  isCubiszScramble,
  autoFitText,
  formatMegaminx,
  parseMBLDScramble,
  getCategoryOfEvent,
  getEventName
};