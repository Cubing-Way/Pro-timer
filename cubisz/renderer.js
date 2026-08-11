// renderer.js
import { cube } from "./cube.js";

function injectCubeCSS() {
  if (document.getElementById("cubisz-css")) return;

  const link = document.createElement("link");
  link.id = "cubisz-css";
  link.rel = "stylesheet";

  // IMPORTANT: path relative to the JS file, not the page
  link.href = new URL("./style.css", import.meta.url).href;

  document.head.appendChild(link);
}

let facesToSquares = {};

export function mountRenderer(container) {
  injectCubeCSS();
  container.innerHTML = `
    <div id="cube-net">
      <div class="page-center">
        <div class="grid-container">
          <div id="whiteSquareGrid" class="grid"></div>
          <div id="orangeSquareGrid" class="grid"></div>
          <div id="greenSquareGrid" class="grid"></div>
          <div id="redSquareGrid" class="grid"></div>
          <div id="blueSquareGrid" class="grid"></div>
          <div id="yellowSquareGrid" class="grid"></div>
        </div>
      </div>
    </div>
  `;

  createGrid("whiteSquareGrid", "white-square");
  createGrid("orangeSquareGrid", "orange-square");
  createGrid("greenSquareGrid", "green-square");
  createGrid("redSquareGrid", "red-square");
  createGrid("blueSquareGrid", "blue-square");
  createGrid("yellowSquareGrid", "yellow-square");

  facesToSquares = {
    U: document.querySelectorAll('#whiteSquareGrid .square'),
    R: document.querySelectorAll('#redSquareGrid .square'),
    F: document.querySelectorAll('#greenSquareGrid .square'),
    D: document.querySelectorAll('#yellowSquareGrid .square'),
    L: document.querySelectorAll('#orangeSquareGrid .square'),
    B: document.querySelectorAll('#blueSquareGrid .square')
  };

  paint();
}

function createGrid(id, cls) {
  const grid = document.getElementById(id);
  for (let i = 0; i < 9; i++) {
    const s = document.createElement("div");
    s.className = `square ${cls}`;
    grid.appendChild(s);
  }
}

export function paint() {
  const colorMap = { W:'white', R:'red', G:'green', Y:'yellow', O:'orange', B:'blue' };
  for (const f in cube) {
    const squares = facesToSquares[f];
    for (let i = 0; i < 9; i++) {
      squares[i].className = `square ${colorMap[cube[f][i]]}-square`;
    }
  }
}

export function resize(size) {
  const gap = Math.round(size * 0.08);
  const padding = gap;

  document.querySelectorAll('.grid').forEach(g => {
    g.style.gridTemplateColumns = `repeat(3, ${size}px)`;
    g.style.gap = `${gap}px`;
    g.style.padding = `${padding}px`;
  });

  document.querySelectorAll('.square').forEach(s => {
    s.style.width = `${size}px`;
    s.style.height = `${size}px`;
  });

  // ✅ update cube depth dynamically
  const depth = (size * 3) + (gap * 2) + (padding * 2);
  document.documentElement.style.setProperty('--cube-depth', `${depth / 2}px`);
}

export function set3D(enabled) {
  const net = document.getElementById("cube-net");
  net.classList.toggle("cube3d", enabled);
}
