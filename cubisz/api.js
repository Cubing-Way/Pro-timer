// api.js
import { resetCube, cloneCubeState, restoreCubeState, isSolved } from "./cube.js";
import { printScrambleMoves, getMoveCount, isFMC, setFMC } from "./scramble.js";
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


export { mountCube, setSize, setView, applyScramble, applySolution, getLastMoveCount, checkSolved, isFMC, setFMC }