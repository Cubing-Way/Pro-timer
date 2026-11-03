// api.js
import { resetCube, cloneCubeState, restoreCubeState, isSolved } from "./cube.js";
import { printScrambleMoves, getMoveCount, setMoveCount, isFMC, setFMC } from "./scramble.js";
import { mountRenderer, paint, resize, set3D } from "./renderer.js";

let scrambledState = null;

function mountCube(div) {
  mountRenderer(div);
  paint();
}

function setSize(px) {
  resize(px);
}

function setView(mode) {
  set3D(mode === "3d");
}

function applyScramble(scr, skipPaint = false) {
  printScrambleMoves(scr, true);
  if (!skipPaint) paint();
  scrambledState = cloneCubeState();
}

function applySolution(sol, skipPaint = false) {
  restoreCubeState(scrambledState);
  printScrambleMoves(sol, false);
  if (!skipPaint) paint();
}

function getLastMoveCount() {
  return getMoveCount();
}

function checkSolved() {
  return isSolved();
}

// Checks a solution from a scramble and gives { moves, solved }; the cube, scrambledState, move count and FMC mode end as they were, and nothing is painted
function checkAside(scr, sol, fmc = false) {
  // What goes back afterwards (printScrambleMoves never touches scrambledState)
  const savedCube = cloneCubeState();
  const savedMoveCount = getMoveCount();
  const savedFMC = isFMC();

  try {
    // fmc: this check's own mode, so slice moves count the same whatever was in use
    setFMC(fmc);
    printScrambleMoves(scr, true);
    printScrambleMoves(sol, false);
    return { moves: getMoveCount(), solved: isSolved() };
  } finally {
    // Runs after the result is worked out, and even if a bad scramble throws
    restoreCubeState(savedCube);
    setMoveCount(savedMoveCount);
    setFMC(savedFMC);
  }
}


export { mountCube, setSize, setView, applyScramble, applySolution, getLastMoveCount, checkSolved, checkAside, isFMC, setFMC }