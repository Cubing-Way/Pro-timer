import { csTimer } from "../main/cstimer.js";
import { setVisualizerScale } from "./scrVisualiser.js";
import { getScrambleConfig, isCubiszEvent, autoFitText, formatMegaminx } from "./scrHelpers.js";

// The scramble on screen; the next solve is saved with it
let currentScramble = "";
let currentScrambleEvent = ""; // event code currentScramble was made for
// Scrambles shown for the current event, oldest first; Previous / Next move through it
let scrambleHistory = [];
// Position in scrambleHistory of the scramble on screen
let historyIndex = -1;
// Most scrambles kept, so a long session doesn't keep every picture in memory
const MAX_HISTORY = 100;

// Gets a new scramble for an event from csTimer and shows its text and picture; length overrides the default (Multi-Blind cube count)
async function displayScramble(event = "333", vis, length) {
    // csTimer type and default length from scramble/scrData.js
    const config = getScrambleConfig(event);
    if (!config) return;

    const [type, rawLength] = config;

    const finalLength = length ?? rawLength; // override if provided

    let scramble = await csTimer.getScramble(type, finalLength);

    // Picture of the scrambled puzzle
    const svg = await csTimer.getImage(scramble, type);

    // Another event's scrambles are for another puzzle, so its history starts over
    if (event !== currentScrambleEvent) scrambleHistory = [];

    // Add the new scramble at the end and point at it
    scrambleHistory.push({ scramble, event, svg });
    // Past the limit, forget the oldest one
    if (scrambleHistory.length > MAX_HISTORY) scrambleHistory.shift();
    historyIndex = scrambleHistory.length - 1;

    showScramble(scrambleHistory[historyIndex], vis);
}

// Puts a saved scramble on screen: makes it the current one, draws its picture and writes its text
function showScramble(entry, vis) {
    currentScramble = entry.scramble;
    currentScrambleEvent = entry.event;

    vis.innerHTML = entry.svg;

    adjustVisualizerSize(entry.event, vis);

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

// Goes forward to a scramble already seen, or makes a new one when on the newest; length is the Multi-Blind cube count
async function nextScramble(event, vis, length) {
    if (historyIndex < scrambleHistory.length - 1) {
        historyIndex++;
        showScramble(scrambleHistory[historyIndex], vis);
    } else {
        await displayScramble(event, vis, length);
    }
}

// Scales and places the picture for the event's puzzle: setVisualizerScale(scale, right offset, bottom offset)
function adjustVisualizerSize(event, vis) {
    const category = document.getElementById("categorySelect").value;
    // WCA category: size by event
    if (category === "WCA") {
      if (
            ["333", "333ni", "333oh", "333fm"].includes(event)
        ) {
            setVisualizerScale(0.45, 75, 70, vis);
        } else if (event === "222so") {
            setVisualizerScale(0.6, -43, -10, vis);
        } else if (event === "pyrso") {
            setVisualizerScale(0.4, 55, 70, vis);
        }
        else if (["444wca", "444bld"].includes(event)) {
            setVisualizerScale(0.35, 130, 110, vis);
        } else if (event === "skbso") {
            setVisualizerScale(0.4, 65, 75, vis);
        }
        else if (["555wca", "555bld"].includes(event)) {
            setVisualizerScale(0.30, 165, 135, vis);
        }
        else if (event === "666wca") {
            setVisualizerScale(0.25, 180, 150, vis);
        } else if (event === "777wca") {
            setVisualizerScale(0.22, 195, 155, vis);
        }
        else if (event === "mgmp") {
            setVisualizerScale(0.5, 105, 40, vis);
        }
        else if (event === "clkwca") {
            setVisualizerScale(0.5, 60, 15, vis);
        } else if (event === "sqrs") {
            setVisualizerScale(0.4, 105, 55, vis);
        } else if (event === "r3ni") {
            setVisualizerScale(0.45, 105, 140, vis);
        }
    }

    // Other categories: size by puzzle
    if (
        [
        "3x3x3",
        "3x3x3 CFOP",
        "3x3x3 Roux",
        "3x3x3 Mehta",
        "Crazy Puzzle",
        "Helicopter Cube",
        "Redi Cube",
        "3x3x3 subsets"
    ].includes(category)) setVisualizerScale(0.45, 75, 70, vis);
    if (category === "2x2x2") setVisualizerScale(0.6, -43, -10, vis);
    if (["4x4x4", "4x4x4 Yau/Hoya"].includes(category)) setVisualizerScale(0.35, 130, 110, vis);;
    if (category === "5x5x5") setVisualizerScale(0.30, 165, 135, vis);
    if (category === "6x6x6") setVisualizerScale(0.25, 180, 150, vis);
    if (category === "7x7x7") setVisualizerScale(0.22, 195, 155, vis);
    if (category === "Clock") setVisualizerScale(0.5, 60, 15, vis);;
    if (["Megaminx", "Kilominx", "Gigaminx", "Pyraminx Crystal"].includes(category)) setVisualizerScale(0.5, 105, 40, vis);
    if (["Pyraminx", "Master Pyraminx"].includes(category)) setVisualizerScale(0.4, 55, 70, vis);
    if (category === "Skewb") setVisualizerScale(0.4, 65, 75, vis);
    if (["Square-1", "Square"].includes(category)) setVisualizerScale(0.4, 105, 55, vis);
    if (category === "15 puzzle") setVisualizerScale(0.4, 20, 55, vis);
    if (category === "8 puzzle") setVisualizerScale(0.5, -30, 20, vis);
    if (category === "FTO") setVisualizerScale(0.35, 125, 70, vis);
    if (category === "Icosahedron") setVisualizerScale(0.55, 105, 25, vis);
    if (category === "Relays") setVisualizerScale(0.45, 105, 140, vis);
}

export { 
    currentScramble, 
    currentScrambleEvent, 
    displayScramble, 
    previousScramble, 
    nextScramble, 
    isCubiszEvent 
};