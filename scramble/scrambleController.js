import { csTimer } from "../main/cstimer.js";
import { setVisualizerScale } from "./scrVisualiser.js";
import { getScrambleConfig, isCubiszEvent, autoFitText, formatMegaminx } from "./scrHelpers.js";

let currentScramble = "";
let currentScrambleEvent = ""; // event code currentScramble was made for

async function displayScramble(event = "333", vis, length) {

    const config = getScrambleConfig(event);
    if (!config) return;

    const [type, rawLength] = config;

    const finalLength = length ?? rawLength; // 🔥 override if provided

    let scramble = await csTimer.getScramble(type, finalLength);


    const svg = await csTimer.getImage(scramble, type);

    currentScramble = scramble;
    currentScrambleEvent = event;

    vis.innerHTML = svg;

    adjustVisualizerSize(event, vis);

    const textEl = document.getElementById("scrambleDisplay");

    if (type === "mgmp") {
        textEl.textContent = formatMegaminx(scramble);
    } else {
        textEl.textContent = scramble;
    }

    autoFitText(vis);
}



// =========================
// Visualizer size per event
// =========================
function adjustVisualizerSize(event, vis) {
    const category = document.getElementById("categorySelect").value;
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

export { currentScramble, currentScrambleEvent, displayScramble, isCubiszEvent };