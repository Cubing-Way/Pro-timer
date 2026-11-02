import { cubing } from "../main/cubing.js";
import { cubingEvents } from "./scrData.js";
import {
     isCubiszEvent,
     autoFitText,
     formatMegaminx,
     parseMBLDScramble,
     getCategoryOfEvent,
     getEventName
} from "./scrHelpers.js";

// The scramble on screen; the next solve is saved with it
let currentScramble = "";
let currentScrambleEvent = ""; // event code currentScramble was made for
// Scrambles shown for the current event, oldest first; Previous / Next move through it
let scrambleHistory = [];
// Position in scrambleHistory of the scramble on screen
let historyIndex = -1;
// Most scrambles kept, so a long session doesn't keep them all in memory
const MAX_HISTORY = 100;
// Multi-Blind cube count when none is given
const MBLD_DEFAULT_CUBES = 5;
// A scramble taking longer than this (ms) shows a notice; shorter ones would only make the text flicker
const SLOW_SCRAMBLE_MS = 200;

// Gets a new scramble for an event from cubing.js and shows its text and picture; cubes is the Multi-Blind cube count
async function displayScramble(event = "333", vis, cubes = MBLD_DEFAULT_CUBES) {
    // cubing.js's event ID from scramble/scrData.js
    const cubingEvent = cubingEvents[event];
    if (!cubingEvent) return;

    // A puzzle's first scramble can take many seconds (Kilominx over 30): say so, and clear the old one so nobody scrambles their cube with it
    const slowNotice = setTimeout(() => {
        document.getElementById("scrambleDisplay").textContent = "Scrambling…";
        vis.innerHTML = "";
    }, SLOW_SCRAMBLE_MS);

    const scramble = event === "r3ni"
        ? await cubing.getMultiBlindScramble(cubes)
        : await cubing.getScramble(cubingEvent.eventId);

    clearTimeout(slowNotice);

    // Another event's scrambles are for another puzzle, so its history starts over
    if (event !== currentScrambleEvent) scrambleHistory = [];

    // Add the new scramble at the end and point at it
    scrambleHistory.push({ scramble, event });
    // Past the limit, forget the oldest one
    if (scrambleHistory.length > MAX_HISTORY) scrambleHistory.shift();
    historyIndex = scrambleHistory.length - 1;

    showScramble(scrambleHistory[historyIndex], vis);
}

// Puts a saved scramble on screen: makes it the current one, draws its picture and writes its text
function showScramble(entry, vis) {
    currentScramble = entry.scramble;
    currentScrambleEvent = entry.event;

    // Picture of the scrambled puzzle; Multi-Blind's shows the first cube
    const pictureScramble = entry.event === "r3ni" ? parseMBLDScramble(entry.scramble)[0] : entry.scramble;
    vis.innerHTML = cubing.getPicture(pictureScramble, cubingEvents[entry.event].puzzle);

    const textEl = document.getElementById("scrambleDisplay");

    // Megaminx scrambles get one line per row of moves
    if (entry.event === "mgmp") {
        textEl.textContent = formatMegaminx(entry.scramble);
    } else {
        textEl.textContent = entry.scramble;
    }

    // Previous is greyed out on the oldest scramble, since there's nothing before it
    document.getElementById("prevScrambleBtn").disabled = historyIndex <= 0;

    autoFitText(vis);
}

// Goes back to the scramble before the one on screen (nothing happens on the oldest)
function previousScramble(vis) {
    if (historyIndex <= 0) return;
    historyIndex--;
    showScramble(scrambleHistory[historyIndex], vis);
}

// Goes forward to a scramble already seen, or makes a new one when on the newest; cubes is the Multi-Blind cube count
async function nextScramble(event, vis, cubes) {
    if (historyIndex < scrambleHistory.length - 1) {
        historyIndex++;
        showScramble(scrambleHistory[historyIndex], vis);
    } else {
        await displayScramble(event, vis, cubes);
    }
}

export { 
    currentScramble, 
    currentScrambleEvent, 
    displayScramble, 
    previousScramble, 
    nextScramble, 
    isCubiszEvent,
    parseMBLDScramble,
    getCategoryOfEvent,
    getEventName
};