import { csTimer } from "./cstimer.js";

let currentScramble = "";

// Map your event names → csTimer types
const CSTIMER_EVENTS = {
  "333": ["333", 0],
  "333oh": ["333", 0],
  "333fm": ["333fm", 0],
  "222": ["222so", 0],
  "444": ["444wca", 0],
  "555": ["555wca", 60],
  "666": ["666wca", 80],
  "777": ["777wca", 100],
  "333bf": ["333ni", 0],
  "444bf": ["444bld", 40],
  "555bf": ["555bld", 60],
  "333mbf": ["r3ni", 5],
  "minx": ["mgmp", 70],
  "pyram": ["pyrso", 10],
  "skewb": ["skbso", 0],
  "sq1": ["sqrs", 0],
  "clock": ["clkwca", 0]
};


// Main function you call whenever you need a new scramble
export async function displayScramble(event = "333", vis) {

 const [type, length] = CSTIMER_EVENTS[event];
  if (!type) return;

  // 1️⃣ Generate scramble
  const scramble = await csTimer.getScramble(type, length);

  // 2️⃣ Generate matching SVG
  const svg = await csTimer.getImage(scramble, type);

  currentScramble = scramble;

  // 3️⃣ Put SVG on screen
  const visEl = vis;
  visEl.innerHTML = svg;

  adjustVisualizerSize(event, vis);

  // 4️⃣ Display scramble text
  const textEl = document.getElementById("scrambleDisplay");

  if (event === "minx" || event === "megaminx") {
    textEl.textContent = formatMegaminx(scramble);
  } else {
    textEl.textContent = scramble;
  }

  autoFitText();
}

export { currentScramble };


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
function autoFitText() {
  const container = document.getElementById("scrambleContainer");
  const text = document.getElementById("scrambleDisplay");

  let fontSize = 40;
  text.style.fontSize = fontSize + "px";
  text.style.whiteSpace = "pre-wrap";
  text.style.wordBreak = "break-word";

  // Force reflow
  text.offsetHeight;

  while (text.scrollHeight > container.clientHeight) {
    fontSize -= 1;
    text.style.fontSize = fontSize + "px";
  }
}


// =========================
// Visualizer size per event
// =========================
function adjustVisualizerSize(event, vis) {
        let wrapper = null;
    if (vis.id === "scrambleVis") {
        if (
            ["333", "333bf", "333mbf", "333oh", "333fm"].includes(event)
        ) {
            setVisualizerScale(0.45, 75, 70, vis);
        } else if (event === "222") {
            setVisualizerScale(0.6, -43, -10, vis);
        } else if (event === "pyram") {
            setVisualizerScale(0.4, 55, 70, vis);
        }
        else if (["444", "444bf"].includes(event)) {
            setVisualizerScale(0.35, 130, 110, vis);
        } else if (event === "skewb") {
            setVisualizerScale(0.4, 65, 75, vis);
        }
        else if (["555", "555"].includes(event)) {
            setVisualizerScale(0.30, 165, 135, vis);
        }
        else if (event === "666") {
            setVisualizerScale(0.25, 180, 150, vis);
        } else if (event === "777") {
            setVisualizerScale(0.22, 195, 155, vis);
        }
        else if (event === "minx") {
            setVisualizerScale(0.5, 105, 40, vis);
        }
        else if (event === "clock") {
            setVisualizerScale(0.5, 60, 15, vis);
        } else if (event === "sq1") {
            setVisualizerScale(0.4, 105, 55, vis);  
        }
    } else {
        if (
            ["333", "333bf", "333mbf", "333oh", "333fm"].includes(event)
        ) {
            setVisualizerScale(0.45, 75, 70, vis);
        } else if (event === "222") {
            setVisualizerScale(0.6, -43, -10, vis);
        } else if (event === "pyram") {
            setVisualizerScale(0.4, 55, 70, vis);
        }
        else if (["444", "444bf"].includes(event)) {
            setVisualizerScale(0.35, 130, 110, vis);
        } else if (event === "skewb") {
            setVisualizerScale(0.4, 65, 75, vis);
        }
        else if (["555", "555"].includes(event)) {
            setVisualizerScale(0.30, 165, 135, vis);
        }
        else if (event === "666") {
            setVisualizerScale(0.25, 180, 150, vis);
        } else if (event === "777") {
            setVisualizerScale(0.22, 195, 155, vis);
        }
        else if (event === "minx") {
            setVisualizerScale(0.5, 105, 40, vis);
        }
        else if (event === "clock") {
            setVisualizerScale(0.5, 60, 15, vis);
        } else if (event === "sq1") {
            setVisualizerScale(0.4, 105, 55, vis);  
        }
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

