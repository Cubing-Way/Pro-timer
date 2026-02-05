// ✅ Import the generator from cubing (relative path to Vite-friendly ESM)
let CubingScramble = null;

async function loadCubing() {
  if (CubingScramble) return CubingScramble;

  try {
    CubingScramble = await import(
      "https://cdn.cubing.net/js/cubing/scramble"
    );
    await import("https://cdn.cubing.net/js/cubing/twisty");
    return CubingScramble;
  } catch (e) {
    console.error("Cubing failed to load:", e);
    return null;
  }
}

let currentScramble = ""; // 👈 GLOBAL CURRENT SCRAMBLE


// Generates and returns a scramble string
async function generate3x3Scramble(event = "333") {
  const cubing = await loadCubing();

  if (!cubing) {
    return "Scramble unavailable on this device";
  }

  const scramble = await cubing.randomScrambleForEvent(event);
  let scrStr = scramble.toString();

  if (event === "minx" || event === "megaminx") {
    scrStr = formatMegaminxScramble(scrStr);
  }

  return scrStr;
}


// Insert line breaks after each U move
function formatMegaminxScramble(scr) {
  const moves = scr.split(" ");
  let out = [];
  let line = [];

  for (const move of moves) {
    line.push(move);

    // Megaminx U moves are: U or U'
    if (move === "U" || move === "U'") {
      out.push(line.join(" "));
      line = [];
    }
  }

  // Push remaining moves (if any)
  if (line.length) {
    out.push(line.join(" "));
  }

  return out.join("\n");
}

async function displayScramble(event, vis) {
    const scr = await generate3x3Scramble(event);
    if (scr) {
    if (event === "333" ||
        event === "222" ||
        event === "333bf" ||
        event === "333mbf" ||
        event === "333oh" ||
        event === "333fm" ||
        event === "pyram"
    ) {
        document.getElementById("scrambleVis").style.width = "180px";
        document.getElementById("scrambleVis").style.height = "180px";
        document.getElementById("scrambleVis").style.right = "20px";
        document.getElementById("scrambleVis").style.bottom = "10px";
    } else if (event === "skewb") {
        document.getElementById("scrambleVis").style.width = "230px";
        document.getElementById("scrambleVis").style.height = "230px";
        document.getElementById("scrambleVis").style.right = "0px";
        document.getElementById("scrambleVis").style.bottom = "-20px";
    } else if 
        ( 
            event === "444" ||
            event === "444bf" ||
            event === "skewb"
        ) {
            document.getElementById("scrambleVis").style.width = "230px";
            document.getElementById("scrambleVis").style.height = "230px";
            document.getElementById("scrambleVis").style.right = "0px";
            document.getElementById("scrambleVis").style.bottom = "-20px";
        } else if (event === "sq1") {
            document.getElementById("scrambleVis").style.width = "230px";
            document.getElementById("scrambleVis").style.height = "230px";
            document.getElementById("scrambleVis").style.right = "-20px";
            document.getElementById("scrambleVis").style.bottom = "20px";
        } else if (
            event === "555" ||
            event === "666" ||
            event === "555bf" ||
            event === "777"
        ) {
            document.getElementById("scrambleVis").style.width = "250px";
            document.getElementById("scrambleVis").style.height = "250px";
            document.getElementById("scrambleVis").style.right = "0px";
            document.getElementById("scrambleVis").style.bottom = "-20px";
        } else if (event === "minx") {
            document.getElementById("scrambleVis").style.width = "250px";
            document.getElementById("scrambleVis").style.height = "250px";
            document.getElementById("scrambleVis").style.right = "20px";
            document.getElementById("scrambleVis").style.bottom = "-40px";   
        } else if (event === "clock") {
            document.getElementById("scrambleVis").style.width = "300px";
            document.getElementById("scrambleVis").style.height = "300px";
            document.getElementById("scrambleVis").style.right = "0px";
            document.getElementById("scrambleVis").style.bottom = "-50px";
        }
    }


    currentScramble = scr;

    const container = document.getElementById("scrambleContainer");
    const text = document.getElementById("scrambleDisplay");

    // =========================
    // Format for display
    // =========================

    let displayScr = scr;

    if (event === "minx" || event === "megaminx") {
        displayScr = formatMegaminxForDisplay(scr);
    }

    text.textContent = displayScr;

    // Keep original scramble for visualizer



    vis.scramble = scr;
    vis.event = `${event}`;

    // =========================
    // Auto-fit to height
    // =========================

    let fontSize = 40;
    text.style.fontSize = fontSize + "px";

    text.style.whiteSpace = "pre-wrap";   // IMPORTANT: allow newlines
    text.style.wordBreak = "break-word";

    // Force reflow
    text.offsetHeight;

    while (text.scrollHeight > container.clientHeight) {
        fontSize -= 1;
        text.style.fontSize = fontSize + "px";
    }
}

function formatMegaminxForDisplay(scr) {
    const moves = scr.split(" ");
    let out = [];
    let line = [];

    for (const move of moves) {
        line.push(move);

        // Break line after each U or U'
        if (move === "U" || move === "U'") {
            out.push(line.join(" "));
            line = [];
        }
    }

    // Remaining moves
    if (line.length) {
        out.push(line.join(" "));
    }

    return out.join("\n");
}

export { generate3x3Scramble, displayScramble, currentScramble };
