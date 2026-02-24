import { csTimer } from "./cstimer.js";
import { scrdata } from "./topbar/scrData.js";

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


let currentScramble = "";

export async function displayScramble(event = "333", vis, length) {

    const config = getScrambleConfig(event);
    if (!config) return;

    const [type, rawLength] = config;

    const finalLength = length ?? rawLength; // 🔥 override if provided

    let scramble = await csTimer.getScramble(type, finalLength);


    const svg = await csTimer.getImage(scramble, type);

    currentScramble = scramble;

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
// Visualizer size per event
// =========================
function adjustVisualizerSize(event, vis) {
        if (
            ["333", "333ni", "r3ni", "333oh", "333fm"].includes(event)
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
        }
}

function setVisualizerScale(scale, right, bottom, vis) {
      let wrapper = null;
    if (vis.id === "scrambleVis") {
        wrapper = document.querySelector(".panel-cube");
        // Set transform scale
        wrapper.style.transformOrigin = "bottom right"; // Important!
        wrapper.style.transform = `scale(${scale})`;
        wrapper.style.position = "absolute";
        wrapper.style.right = `${right}px`;
        wrapper.style.bottom = `${bottom}px`;

        // Optional: update wrapper layout size to avoid clipping
        const canvas = document.getElementById("scrambleVis");
        const originalWidth = canvas.width || 600;  // fallback to default csTimer size
        const originalHeight = canvas.height || 400;
        
        wrapper.style.width = originalWidth * scale + "px";
        wrapper.style.height = originalHeight * scale + "px";
    } else {
        bottom += 50;
        wrapper = document.querySelector(".panel-cube2");
        // Set transform scale
        wrapper.style.transformOrigin = "bottom center"; // Important!
        wrapper.style.transform = `scale(${scale})`;

        wrapper.style.right = `${right}px`;
        wrapper.style.bottom = `${bottom}px`;
                // Optional: update wrapper layout size to avoid clipping
        const canvas = document.getElementById("scrambleVis");
        const originalWidth = canvas.width || 600;  // fallback to default csTimer size
        const originalHeight = canvas.height || 400;
        
        wrapper.style.width = originalWidth * scale + "px";
        wrapper.style.height = originalHeight * scale + "px";
    }

}

export {currentScramble}