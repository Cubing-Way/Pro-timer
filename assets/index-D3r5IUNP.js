(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const worker = new Worker(
  `${"/Pro-timer/"}cstimer_module.js?worker_file&type=classic`
);
let msgid = 0;
const callbacks = {};
worker.onmessage = (e) => {
  const [id, , result] = e.data;
  callbacks[id]?.(result);
  delete callbacks[id];
};
function call(type, args = []) {
  return new Promise((resolve) => {
    msgid++;
    callbacks[msgid] = resolve;
    worker.postMessage([msgid, type, args]);
  });
}
const csTimer = {
  getScramble: (type, len = 0) => call("scramble", [type, len]),
  getImage: (scramble, type) => call("image", [scramble, type]),
  setSeed: (seed) => call("seed", [seed]),
  setGlobal: (key, value) => call("set", [key, value])
};
const scrdata = [
  ["WCA", [
    ["3x3x3", "333", 0],
    ["2x2x2", "222so", 0],
    ["4x4x4", "444wca", 0],
    ["5x5x5", "555wca", 60],
    ["6x6x6", "666wca", 80],
    ["7x7x7", "777wca", 100],
    ["3x3 bld", "333ni", 0],
    ["3x3 fm", "333fm", 0],
    ["3x3 oh", "333oh", 0],
    ["clock", "clkwca", 0],
    ["megaminx", "mgmp", 70],
    ["pyraminx", "pyrso", 10],
    ["skewb", "skbso", 0],
    ["sq1", "sqrs", 0],
    ["4x4 bld", "444bld", 40],
    ["5x5 bld", "555bld", 60],
    ["3x3 mbld", "r3ni", 5]
  ]],
  ["===WCA===", [
    ["--", "blank", 0]
  ]],
  ["3x3x3", [
    ["random state (WCA)", "333", 0],
    ["random move", "333o", 25],
    ["edges only", "edges", 0],
    ["corners only", "corners", 0],
    ["3x3 ft", "333ft", 0]
  ]],
  ["3x3x3 CFOP", [
    ["PLL", "pll", 0],
    ["OLL", "oll", 0],
    ["last slot + last layer", "lsll2", 0],
    ["last layer", "ll", 0],
    ["ZBLL", "zbll", 0],
    ["COLL", "coll", 0],
    ["CLL", "cll", 0],
    ["ELL", "ell", 0],
    ["2GLL", "2gll", 0],
    ["ZZLL", "zzll", 0],
    ["ZBLS", "zbls", 0],
    ["EOLS", "eols", 0],
    ["WVLS", "wvls", 0],
    ["VLS", "vls", 0],
    ["cross solved", "f2l", 0],
    ["EOLine", "eoline", 0],
    ["easy cross", "easyc", 3],
    ["easy xcross", "easyxc", 4]
  ]],
  ["3x3x3 Roux", [
    ["2nd Block", "sbrx", 0],
    ["CMLL", "cmll", 0],
    ["LSE", "lse", 0],
    ["LSE &lt;M, U&gt;", "lsemu", 0]
  ]],
  ["3x3x3 Mehta", [
    ["3QB", "mt3qb", 0],
    ["EOLE", "mteole", 0],
    ["TDR", "mttdr", 0],
    ["6CP", "mt6cp", 0],
    ["CDRLL", "mtcdrll", 0],
    ["L5EP", "mtl5ep", 0],
    ["TTLL", "ttll", 0]
  ]],
  ["2x2x2", [
    ["random state (WCA)", "222so", 0],
    ["optimal", "222o", 0],
    ["3-gen", "2223", 25],
    ["EG", "222eg", 0],
    ["CLL", "222eg0", 0],
    ["EG1", "222eg1", 0],
    ["EG2", "222eg2", 0],
    ["TCLL+", "222tcp", 0],
    ["TCLL-", "222tcn", 0],
    ["TCLL", "222tc", 0],
    ["LS", "222lsall", 0],
    ["No Bar", "222nb", 0]
  ]],
  ["4x4x4", [
    ["WCA", "444wca", -40],
    ["random move", "444m", 40],
    ["SiGN", "444", 40],
    ["YJ", "444yj", 40],
    ["4x4x4 edges", "4edge", 0],
    ["R,r,U,u", "RrUu", 40],
    ["Last layer", "444ll", 0],
    ["ELL", "444ell", 0],
    ["Edge only", "444edo", 0],
    ["Center only", "444cto", 0]
  ]],
  ["4x4x4 Yau/Hoya", [
    ["UD center solved", "444ctud", 0],
    ["UD+3E solved", "444ud3c", 0],
    ["Last 8 dedges", "444l8e", 0],
    ["RL center solved", "444ctrl", 0],
    ["RLDX center solved", "444rlda", 0],
    ["RLDX cross solved", "444rlca", 0]
  ]],
  ["5x5x5", [
    ["WCA", "555wca", 60],
    ["SiGN", "555", 60],
    ["5x5x5 edges", "5edge", 8]
  ]],
  ["6x6x6", [
    ["WCA", "666wca", 80],
    ["SiGN", "666si", 80],
    ["prefix", "666p", 80],
    ["suffix", "666s", 80],
    ["6x6x6 edges", "6edge", 8]
  ]],
  ["7x7x7", [
    ["WCA", "777wca", 100],
    ["SiGN", "777si", 100],
    ["prefix", "777p", 100],
    ["suffix", "777s", 100],
    ["7x7x7 edges", "7edge", 8]
  ]],
  ["Clock", [
    ["WCA", "clkwca", 0],
    ["wca (old)", "clkwcab", 0],
    ["WCA w/o y2", "clknf", 0],
    ["jaap", "clk", 0],
    ["optimal", "clko", 0],
    ["concise", "clkc", 0],
    ["efficient pin order", "clke", 0]
  ]],
  ["Megaminx", [
    ["WCA", "mgmp", 70],
    ["Carrot", "mgmc", 70],
    ["old style", "mgmo", 70],
    ["2-generator R,U", "minx2g", 30],
    ["last slot + last layer", "mlsll", 0],
    ["PLL", "mgmpll", 0],
    ["Last Layer", "mgmll", 0]
  ]],
  ["Pyraminx", [
    ["random state (WCA)", "pyrso", 10],
    ["optimal", "pyro", 0],
    ["random move", "pyrm", 25],
    ["L4E", "pyrl4e", 0],
    ["4 tips", "pyr4c", 0],
    ["No bar", "pyrnb", 0]
  ]],
  ["Skewb", [
    ["random state (WCA)", "skbso", 0],
    ["optimal", "skbo", 0],
    ["random move", "skb", 25],
    ["No bar", "skbnb", 0]
  ]],
  ["Square-1", [
    ["random state (WCA)", "sqrs", 0],
    ["CSP", "sqrcsp", 0],
    ["PLL", "sq1pll", 0],
    ["face turn metric", "sq1h", 40],
    ["twist metric", "sq1t", 20]
  ]],
  ["===OTHER===", [
    ["--", "blank", 0]
  ]],
  ["15 puzzle", [
    ["random state URLD", "15prp", 0],
    ["random state ^<>v", "15prap", 0],
    ["random state Blank", "15prmp", 0],
    ["random move URLD", "15p", 80],
    ["random move ^<>v", "15pat", 80],
    ["random move Blank", "15pm", 80]
  ]],
  ["8 puzzle", [
    ["random state URLD", "8prp", 0],
    ["random state ^<>v", "8prap", 0],
    ["random state Blank", "8prmp", 0]
  ]],
  ["LxMxN", [
    ["1x3x3 (Floppy Cube)", "133", 0],
    ["2x2x3 (Tower Cube)", "223", 0],
    ["2x3x3 (Domino)", "233", 25],
    ["3x3x4", "334", 40],
    ["3x3x5", "335", 25],
    ["3x3x6", "336", 40],
    ["3x3x7", "337", 40],
    ["8x8x8", "888", 120],
    ["9x9x9", "999", 120],
    ["10x10x10", "101010", 120],
    ["11x11x11", "111111", 120],
    ["NxNxN", "cubennn", 12]
  ]],
  ["Gear Cube", [
    ["random state", "gearso", 0],
    ["optimal", "gearo", 0],
    ["random move", "gear", 10]
  ]],
  ["Kilominx", [
    ["random state", "klmso", 0],
    ["Pochmann", "klmp", 30]
  ]],
  ["Gigaminx", [
    ["Pochmann", "giga", 300]
  ]],
  ["Crazy Puzzle", [
    ["Crazy 3x3x3", "crz3a", 30]
  ]],
  ["Cmetrick", [
    ["Cmetrick", "cm3", 25],
    ["Cmetrick Mini", "cm2", 25]
  ]],
  ["Helicopter Cube", [
    ["Heli copter", "heli", 40],
    ["Curvy copter", "helicv", 40],
    ["2x2 Heli random move", "heli2x2", 70],
    ["2x2 Heli by group", "heli2x2g", 5]
  ]],
  ["Redi Cube", [
    ["random state", "rediso", 0],
    ["MoYu", "redim", 8],
    ["random move", "redi", 20]
  ]],
  ["Ivy cube", [
    ["random state", "ivyso", 0],
    ["optimal", "ivyo", 0],
    ["random move", "ivy", 10]
  ]],
  ["Master Pyraminx", [
    ["random state", "mpyrso", 0],
    ["random move", "mpyr", 42]
  ]],
  ["Pyraminx Crystal", [
    ["Pochmann", "prcp", 70],
    ["old style", "prco", 70]
  ]],
  ["Siamese Cube", [
    ["1x1x3 block", "sia113", 25],
    ["1x2x3 block", "sia123", 25],
    ["2x2x2 block", "sia222", 25]
  ]],
  ["Square", [
    ["Square-2", "sq2", 20],
    ["Super Square-1", "ssq1t", 20]
  ]],
  ["Super Floppy", [
    [" ", "sfl", 25]
  ]],
  ["UFO", [
    ["Jaap style", "ufo", 25]
  ]],
  ["FTO", [
    ["random state", "ftoso", 0],
    ["random move", "fto", 30],
    ["L3T", "ftol3t", 0],
    ["L3T+LBT", "ftol4t", 0]
  ]],
  ["Icosahedron", [
    ["Icosamate random move", "ctico", 60]
  ]],
  ["===SPECIAL===", [
    ["--", "blank", 0]
  ]],
  ["3x3x3 subsets", [
    ["2-generator R,U", "2gen", 0],
    ["2-generator L,U", "2genl", 0],
    ["Roux-generator M,U", "roux", 25],
    ["3-generator F,R,U", "3gen_F", 0],
    ["3-generator R,U,L", "3gen_L", 0],
    ["3-generator R,r,U", "RrU", 25],
    ["Domino Subgroup", "333drud", 0],
    ["half turns only", "half", 0],
    ["last slot + last layer (old)", "lsll", 15]
  ]],
  ["Bandaged Cube", [
    ["Bicube", "bic", 30],
    ["Square-1 /,(1,0)", "bsq", 25]
  ]],
  ["Relays", [
    ["lots of 3x3x3s", "r3", 5],
    ["234 relay", "r234", 0],
    ["2345 relay", "r2345", 0],
    ["23456 relay", "r23456", 0],
    ["234567 relay", "r234567", 0],
    ["234 relay (WCA)", "r234w", 0],
    ["2345 relay (WCA)", "r2345w", 0],
    ["23456 relay (WCA)", "r23456w", 0],
    ["234567 relay (WCA)", "r234567w", 0],
    ["Mini Guildford", "rmngf", 0]
  ]],
  ["===JOKES===", [
    ["--", "blank", 0]
  ]],
  ["1x1x1", [
    ["x y z", "111", 25]
  ]],
  ["-1x-1x-1", [
    [" ", "-1", 25]
  ]],
  ["1x1x2", [
    [" ", "112", 25]
  ]],
  ["LOL", [
    [" ", "lol", 25]
  ]],
  ["Derrick Eide", [
    [" ", "eide", 25]
  ]]
];
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
async function displayScramble(event = "333", vis2) {
  const config = getScrambleConfig(event);
  if (!config) return;
  const [type, rawLength] = config;
  let scramble;
  scramble = await csTimer.getScramble(type, rawLength);
  const svg = await csTimer.getImage(scramble, type);
  currentScramble = scramble;
  vis2.innerHTML = svg;
  adjustVisualizerSize(event, vis2);
  const textEl = document.getElementById("scrambleDisplay");
  if (type === "mgmp") {
    textEl.textContent = formatMegaminx(scramble);
  } else {
    textEl.textContent = scramble;
  }
  autoFitText(vis2);
}
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
function autoFitText(vis2) {
  const container = document.getElementById("scrambleContainer");
  const text = document.getElementById("scrambleDisplay");
  let fontSize = 40;
  if (vis2.id === "scrambleVis2") fontSize = 30;
  text.style.fontSize = fontSize + "px";
  text.style.whiteSpace = "pre-wrap";
  text.style.wordBreak = "break-word";
  text.offsetHeight;
  while (text.scrollHeight > container.clientHeight + 50) {
    fontSize -= 1;
    text.style.fontSize = fontSize + "px";
  }
}
function adjustVisualizerSize(event, vis2) {
  if (["333", "333ni", "r3ni", "333oh", "333fm"].includes(event)) {
    setVisualizerScale(0.45, 75, 70, vis2);
  } else if (event === "222so") {
    setVisualizerScale(0.6, -43, -10, vis2);
  } else if (event === "pyrso") {
    setVisualizerScale(0.4, 55, 70, vis2);
  } else if (["444wca", "444bld"].includes(event)) {
    setVisualizerScale(0.35, 130, 110, vis2);
  } else if (event === "skbso") {
    setVisualizerScale(0.4, 65, 75, vis2);
  } else if (["555wca", "555bld"].includes(event)) {
    setVisualizerScale(0.3, 165, 135, vis2);
  } else if (event === "666wca") {
    setVisualizerScale(0.25, 180, 150, vis2);
  } else if (event === "777wca") {
    setVisualizerScale(0.22, 195, 155, vis2);
  } else if (event === "mgmp") {
    setVisualizerScale(0.5, 105, 40, vis2);
  } else if (event === "clkwca") {
    setVisualizerScale(0.5, 60, 15, vis2);
  } else if (event === "sqrs") {
    setVisualizerScale(0.4, 105, 55, vis2);
  }
}
function setVisualizerScale(scale, right, bottom, vis2) {
  let wrapper = null;
  if (vis2.id === "scrambleVis") {
    wrapper = document.querySelector(".panel-cube");
    wrapper.style.transformOrigin = "bottom right";
    wrapper.style.transform = `scale(${scale})`;
    wrapper.style.position = "absolute";
    wrapper.style.right = `${right}px`;
    wrapper.style.bottom = `${bottom}px`;
    const canvas = document.getElementById("scrambleVis");
    const originalWidth = canvas.width || 600;
    const originalHeight = canvas.height || 400;
    wrapper.style.width = originalWidth * scale + "px";
    wrapper.style.height = originalHeight * scale + "px";
  } else {
    bottom += 50;
    wrapper = document.querySelector(".panel-cube2");
    wrapper.style.transformOrigin = "bottom center";
    wrapper.style.transform = `scale(${scale})`;
    wrapper.style.right = `${right}px`;
    wrapper.style.bottom = `${bottom}px`;
    const canvas = document.getElementById("scrambleVis");
    const originalWidth = canvas.width || 600;
    const originalHeight = canvas.height || 400;
    wrapper.style.width = originalWidth * scale + "px";
    wrapper.style.height = originalHeight * scale + "px";
  }
}
const averageObj = {
  mode: "ao5",
  solveCounter: 0,
  solvesArray: []
  // array of solve objects
};
const saved = JSON.parse(localStorage.getItem("cube_average_buffer"));
if (saved) Object.assign(averageObj, saved);
function parseTimeToSeconds(str) {
  if (typeof str === "number") return str;
  if (str.includes(":")) {
    const [m, s] = str.split(":");
    return parseInt(m, 10) * 60 + parseFloat(s);
  }
  return parseFloat(str);
}
function manageTime(time) {
  const t = Number(time);
  if (!Number.isFinite(t)) return "-";
  if (averageObj.mode === "fmc3") return `${Number.isInteger(time) ? time : time.toFixed(2)} moves`;
  return t.toFixed(2);
}
function formatIntoMinutes(num) {
  if (num >= 60) {
    const m = Math.floor(num / 60);
    const s = (num % 60).toFixed(2).padStart(5, "0");
    return `${m}:${s}`;
  }
  return num.toFixed(2);
}
function formatDisplayTime(solveObj) {
  if (solveObj.time == null) return "-";
  if (averageObj.mode === "fmc3") {
    if (solveObj.penalty === "DNF") return "DNF";
    if (solveObj.penalty === "+2") return `${solveObj.time + 2} moves (+2)`;
    return `${solveObj.time} moves`;
  }
  if (solveObj.penalty === "DNF") return "DNF";
  if (solveObj.penalty === "+2") return formatIntoMinutes(solveObj.time + 2) + " (+2)";
  return formatIntoMinutes(solveObj.time);
}
function formatSecondsToTime(sec) {
  if (sec === "DNF") return "DNF";
  sec = Number(sec);
  if (!Number.isFinite(sec)) return "DNF";
  if (sec >= 60) {
    const m = Math.floor(sec / 60);
    const s = (sec % 60).toFixed(2).padStart(5, "0");
    return `${m}:${s}`;
  }
  return manageTime(sec);
}
function computeAverage(solves, mode) {
  const times = solves.map((s) => {
    if (s.penalty === "DNF") return Infinity;
    if (s.penalty === "+2") return s.time + 2;
    return s.time;
  });
  let best = null;
  let worst = null;
  if (mode === "bo3") {
    const dnfs2 = times.filter((t) => t === Infinity).length;
    if (dnfs2 >= 2) {
      return { dnf: true };
    }
    const sorted = [...times].sort((a, b) => a - b);
    best = sorted[0];
    worst = sorted[sorted.length - 1];
    const validTimes = times.filter((t) => t !== Infinity);
    const avg2 = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
    const varianceAll = validTimes.reduce((sum, t) => sum + Math.pow(t - avg2, 2), 0) / validTimes.length;
    const sigma2 = Math.sqrt(varianceAll);
    return {
      dnf: false,
      avg: avg2,
      best,
      worst,
      sigma: sigma2
    };
  }
  if (mode === "bo5") {
    const sorted = [...times].sort((a, b) => a - b);
    best = sorted[0];
    worst = sorted[sorted.length - 1];
    const trimmed = sorted.slice(1, 4);
    let avg2 = null;
    if (trimmed.includes(Infinity)) {
      avg2 = "DNF";
    } else {
      avg2 = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
    }
    const validTimes = times.filter((t) => t !== Infinity);
    const meanAll = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
    const varianceAll = validTimes.reduce((sum, t) => sum + Math.pow(t - meanAll, 2), 0) / validTimes.length;
    const sigma2 = Math.sqrt(varianceAll);
    return {
      dnf: false,
      avg: avg2,
      // ← now Ao5
      best,
      // ← BLD result
      worst,
      sigma: sigma2
    };
  }
  if (mode === "ao5") {
    const dnfs2 = times.filter((t) => t === Infinity).length;
    if (dnfs2 >= 2) {
      return { dnf: true };
    }
    const sorted = [...times].sort((a, b) => a - b);
    best = sorted[0];
    worst = sorted[sorted.length - 1];
    const trimmed = sorted.slice(1, 4);
    let avg2 = null;
    if (trimmed.includes(Infinity)) {
      avg2 = "DNF";
    } else {
      avg2 = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
    }
    const validTimes = times.filter((t) => t !== Infinity);
    const meanAll = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
    const varianceAll = validTimes.reduce((sum, t) => sum + Math.pow(t - meanAll, 2), 0) / validTimes.length;
    const sigma2 = Math.sqrt(varianceAll);
    if (sorted.length === 4) {
      const bpAo5 = (sorted[0] + sorted[1] + sorted[2]) / 3;
      const wpA05 = (sorted[3] + sorted[2] + sorted[1]) / 3;
      return {
        dnf: false,
        avg: avg2,
        best,
        worst,
        sigma: sigma2,
        bpAo5,
        wpA05
      };
    }
    return {
      dnf: false,
      avg: avg2,
      best,
      worst,
      sigma: sigma2
    };
  }
  if (mode === "fmc3") {
    const values = solves.map((s) => {
      if (s.penalty === "DNF") return Infinity;
      if (s.penalty === "+2") return s.time + 2;
      return s.time;
    });
    const dnfs2 = values.filter((v) => v === Infinity).length;
    if (dnfs2 >= 2) {
      return { dnf: true };
    }
    const valid = values.filter((v) => v !== Infinity);
    const avg2 = valid.reduce((a, b) => a + b, 0) / valid.length;
    const best2 = Math.min(...valid);
    const worst2 = Math.max(...valid);
    const meanAll = valid.reduce((a, b) => a + b, 0) / valid.length;
    const variance2 = valid.reduce((sum, v) => sum + Math.pow(v - meanAll, 2), 0) / valid.length;
    const sigma2 = Math.sqrt(variance2);
    return {
      dnf: false,
      avg: avg2,
      best: best2,
      worst: worst2,
      sigma: sigma2
    };
  }
  const dnfs = times.filter((t) => t === Infinity).length;
  if (dnfs >= 1) {
    return { dnf: true };
  }
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const variance = times.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / times.length;
  const sigma = Math.sqrt(variance);
  best = Math.min(...times);
  worst = Math.max(...times);
  return {
    dnf: false,
    avg,
    best,
    worst,
    sigma
  };
}
function averageOfN(time, scramble, inspection3, inspectionType, isFMC = false) {
  let inspecPenalty = null;
  if (inspectionType === "WCA" || averageObj.mode === "fmc3") {
    if (inspection3 >= 15) inspecPenalty = "+2";
    if (inspection3 >= 17) inspecPenalty = "DNF";
  }
  let seconds2 = null;
  if (isFMC) {
    seconds2 = time.moveCount;
  } else {
    seconds2 = parseTimeToSeconds(time);
  }
  const solution = time.solution ? time.solution : null;
  averageObj.solvesArray.push({
    time: seconds2,
    penalty: inspecPenalty ? inspecPenalty : null,
    scramble,
    inspection: inspection3,
    createdAt: Date.now(),
    solution
  });
  console.log(averageObj.solvesArray[0]);
  averageObj.solveCounter++;
  let neededSolves = 3;
  if (averageObj.mode === "ao5" || averageObj.mode === "bo5") {
    neededSolves = 5;
  }
  if (averageObj.solveCounter === neededSolves) {
    const avgObj2 = computeAverage(averageObj.solvesArray, averageObj.mode);
    const block = {
      mode: averageObj.mode,
      average: avgObj2.avg === "DNF" ? "DNF" : formatSecondsToTime(avgObj2.avg),
      worst: formatSecondsToTime(avgObj2.worst),
      best: formatSecondsToTime(avgObj2.best),
      sigma: formatSecondsToTime(avgObj2.sigma),
      solves: structuredClone(averageObj.solvesArray)
    };
    averageObj.solvesArray = [];
    averageObj.solveCounter = 0;
    localStorage.setItem("cube_average_buffer", JSON.stringify(averageObj));
    return block;
  }
  localStorage.setItem("cube_average_buffer", JSON.stringify(averageObj));
  return null;
}
const sessionsObj = {
  sessions: JSON.parse(localStorage.getItem("sessions")) || {
    "Default": { averages: [] }
  },
  currentSession: localStorage.getItem("currentSession") || "Default",
  selectEl: document.getElementById("sessionSelect")
};
const session$1 = getCurrentSession();
averageObj.mode = session$1.mode || "ao5";
const modeSel = document.getElementById("modeSelect");
if (modeSel) modeSel.value = averageObj.mode;
function saveSessions() {
  localStorage.setItem("sessions", JSON.stringify(sessionsObj.sessions));
  localStorage.setItem("currentSession", sessionsObj.currentSession);
}
function getCurrentSession() {
  if (!sessionsObj.sessions[sessionsObj.currentSession]) {
    sessionsObj.sessions[sessionsObj.currentSession] = { averages: [] };
  }
  return sessionsObj.sessions[sessionsObj.currentSession];
}
function renderSessionSelect() {
  const select = sessionsObj.selectEl;
  select.innerHTML = "";
  Object.keys(sessionsObj.sessions).forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    if (name === sessionsObj.currentSession) opt.selected = true;
    select.appendChild(opt);
  });
  const sep = document.createElement("option");
  sep.disabled = true;
  sep.textContent = "────────────";
  select.appendChild(sep);
  select.appendChild(new Option("➕ New session...", "__new__"));
  select.appendChild(new Option("✏ Rename current...", "__rename__"));
  select.appendChild(new Option("🗑 Delete current...", "__delete__"));
}
function switchSession(name) {
  sessionsObj.currentSession = name;
  saveSessions();
  renderSessionSelect();
  document.dispatchEvent(new CustomEvent("sessionChanged"));
}
sessionsObj.selectEl.onchange = () => {
  const val = sessionsObj.selectEl.value;
  if (val === "__new__") {
    const name = prompt("New session name:");
    if (!name || sessionsObj.sessions[name]) {
      renderSessionSelect();
      return;
    }
    sessionsObj.sessions[name] = { averages: [] };
    switchSession(name);
    return;
  }
  if (val === "__rename__") {
    const oldName = sessionsObj.currentSession;
    const newName = prompt("Rename session:", oldName);
    if (!newName || newName === oldName || sessionsObj.sessions[newName]) {
      renderSessionSelect();
      return;
    }
    sessionsObj.sessions[newName] = sessionsObj.sessions[oldName];
    delete sessionsObj.sessions[oldName];
    switchSession(newName);
    return;
  }
  if (val === "__delete__") {
    if (Object.keys(sessionsObj.sessions).length === 1) {
      alert("You must have at least one session.");
      renderSessionSelect();
      return;
    }
    if (!confirm("Delete current session?")) {
      renderSessionSelect();
      return;
    }
    delete sessionsObj.sessions[sessionsObj.currentSession];
    const first = Object.keys(sessionsObj.sessions)[0];
    switchSession(first);
    return;
  }
  switchSession(val);
};
renderSessionSelect();
function clearAverages() {
  if (!confirm("Delete all averages in this session?")) return;
  const session2 = getCurrentSession();
  session2.averages = [];
  saveSessions();
  averageObj.solvesArray = [];
  averageObj.scramblesArray = [];
  averageObj.solveCounter = 0;
  localStorage.setItem("cube_average_buffer", JSON.stringify(averageObj));
}
function changedSession() {
  const session2 = getCurrentSession();
  averageObj.mode = session2.mode || "ao5";
  const sel = document.getElementById("modeSelect");
  if (sel) sel.value = averageObj.mode;
  averageObj.solvesArray = [];
  averageObj.scramblesArray = [];
  averageObj.solveCounter = 0;
}
function openDetailsModal() {
  const averages = getSessionAverages();
  let html = `<h3 class="modal-title">Session averages</h3>`;
  averages.forEach((block, blockIndex) => {
    let headerText = `${block.mode} #${averages.length - blockIndex}: ${block.average}`;
    if (block.mode === "bo3") {
      const mo3Avg = computeAverage(block.solves, "mo3");
      const mo3Value = mo3Avg.avg === "DNF" ? "DNF" : formatSecondsToTime(mo3Avg.avg);
      headerText = `${block.mode} #${averages.length - blockIndex}: ${block.average} (mo3: ${mo3Value})`;
    } else if (block.mode === "bo5") {
      const ao5Avg = computeAverage(block.solves, "ao5");
      const ao5Value = ao5Avg.avg === "DNF" ? "DNF" : formatSecondsToTime(ao5Avg.avg);
      headerText = `${block.mode} #${averages.length - blockIndex}: ${block.average} (ao5: ${ao5Value})`;
    }
    html += `
            <div class="modal-average-card">
                <div class="modal-average-header">
                    <b>${headerText}</b>
                </div>

                <div class="modal-solves">
        `;
    block.solves.forEach((s, i) => {
      html += `
                <div class="modal-solve-row">
                    <div class="modal-solve-main">
                        <span>#${i + 1}: ${formatDisplayTime(s)}</span>

                        <div class="modal-solve-actions">
                            <button onclick="setPenalty(${blockIndex}, ${i}, null)">OK</button>
                            <button onclick="setPenalty(${blockIndex}, ${i}, '+2')">+2</button>
                            <button onclick="setPenalty(${blockIndex}, ${i}, 'DNF')">DNF</button>
                            <button onclick="removeSolve(${blockIndex}, ${i})">✖</button>
                        </div>
                    </div>

                    <div class="modal-scramble">
                        ${block.solves[i].scramble}
                    </div>
                </div>
            `;
    });
    html += `
                </div>
            </div>
        `;
  });
  modalBody.innerHTML = html;
  modal.classList.remove("hidden");
}
function ensureSessionShape() {
  const session2 = getCurrentSession();
  if (!session2.averages) session2.averages = [];
}
function addAverageBlock(block) {
  ensureSessionShape();
  const session2 = getCurrentSession();
  session2.averages.unshift(block);
  saveSessions();
}
function getSessionAverages() {
  const session2 = getCurrentSession();
  return session2.averages || [];
}
function getLastSolveTarget() {
  if (averageObj.solvesArray.length > 0) {
    return {
      type: "current",
      solveIndex: averageObj.solvesArray.length - 1
    };
  }
  const averages = getSessionAverages();
  if (averages.length === 0) return null;
  const newestBlockIndex = 0;
  const newestBlock = averages[0];
  if (!newestBlock || newestBlock.solves.length === 0) return null;
  return {
    type: "saved",
    blockIndex: newestBlockIndex,
    solveIndex: newestBlock.solves.length - 1
  };
}
window.setPenalty = function(blockIndex, solveIndex, penalty) {
  penalty2(blockIndex, solveIndex, penalty);
  saveSessions();
  renderHistory();
  if (!modal.classList.contains("hidden")) {
    openDetailsModal();
  }
};
window.removeSolve = function(blockIndex, solveIndex) {
  remove2(blockIndex, solveIndex);
  saveSessions();
  renderHistory();
  localStorage.setItem("cube_average_buffer", JSON.stringify(averageObj));
  if (!modal.classList.contains("hidden")) {
    openDetailsModal();
  }
};
function penalty2(blockIndex, solveIndex, penalty) {
  const averages = getSessionAverages();
  const block = averages[blockIndex];
  block.solves[solveIndex].penalty = penalty;
  const newAvg = computeAverage(block.solves, block.mode).avg;
  block.average = newAvg === "DNF" ? "DNF" : formatSecondsToTime(newAvg);
  saveSessions();
}
function remove2(blockIndex, solveIndex) {
  const averages = getSessionAverages();
  if (blockIndex === -1) {
    if (solveIndex < 0 || solveIndex >= averageObj.solvesArray.length) return;
    averageObj.solvesArray.splice(solveIndex, 1);
    averageObj.solveCounter--;
    if (averageObj.solveCounter < 0) averageObj.solveCounter = 0;
    return;
  }
  const block = averages[blockIndex];
  if (blockIndex === 0 && averageObj.solvesArray.length === 0) {
    const newSolves = block.solves.filter((_, i) => i !== solveIndex);
    averageObj.solvesArray = structuredClone(newSolves);
    averageObj.solveCounter = newSolves.length;
    averages.splice(blockIndex, 1);
    modal.classList.add("hidden");
    saveSessions();
    return;
  }
  const choice = confirm(
    "This solve belongs to a finished average.\n\nOK = Replace this solve (reopen average)\nCancel = Delete the whole average"
  );
  if (choice) {
    const newSolves = block.solves.filter((_, i) => i !== solveIndex);
    averageObj.solvesArray = structuredClone(newSolves);
    averageObj.solveCounter = newSolves.length;
    averages.splice(blockIndex, 1);
    modal.classList.add("hidden");
    saveSessions();
    return;
  }
  if (!confirm("Delete the entire average? This cannot be undone.")) return;
  averages.splice(blockIndex, 1);
  saveSessions();
}
function applyPenaltyToLast(penalty) {
  const target = getLastSolveTarget();
  if (!target) return;
  if (target.type === "current") {
    averageObj.solvesArray[target.solveIndex].penalty = penalty;
  } else {
    window.setPenalty(target.blockIndex, target.solveIndex, penalty);
  }
}
function removeLastSolve() {
  const target = getLastSolveTarget();
  if (!target) return;
  if (target.type === "current") {
    window.removeSolve(-1, target.solveIndex, true);
  } else {
    window.removeSolve(target.blockIndex, target.solveIndex, true);
  }
}
const BRAZIL_OFFSET_MINUTES = -180;
const BRAZIL_OFFSET_MS = BRAZIL_OFFSET_MINUTES * 60 * 1e3;
function startOfDayBrazil(ts = Date.now()) {
  const d = new Date(ts + BRAZIL_OFFSET_MS);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime() - BRAZIL_OFFSET_MS;
}
function endOfDayBrazil(ts = Date.now()) {
  const d = new Date(ts + BRAZIL_OFFSET_MS);
  d.setUTCHours(23, 59, 59, 999);
  return d.getTime() - BRAZIL_OFFSET_MS;
}
function getAllSolvesFromSession(session2) {
  const all = [];
  session2.averages.forEach((avg) => {
    avg.solves.forEach((solve) => {
      all.push(solve);
    });
  });
  averageObj.solvesArray.forEach((s) => all.push(s));
  return all;
}
function getStatisticsFromSolves(solves, session2) {
  let allSolvesArr = [];
  let ao5Arr = [];
  let solveCounter = 0;
  session2.averages.forEach((avg) => {
    if (avg.average !== "DNF") ao5Arr.push(parseTimeToSeconds(avg.average));
  });
  solves.forEach((solve) => {
    if (solve.penalty === null) {
      allSolvesArr.push(solve.time);
      solveCounter++;
    } else if (solve.penalty === "+2") {
      allSolvesArr.push(solve.time + 2);
      solveCounter++;
    } else {
      solveCounter++;
    }
  });
  if (allSolvesArr.length === 0) {
    return {
      bestTime: 0,
      mean: 0,
      sigma: 0,
      bestAvg: 0,
      solveCounter
    };
  }
  const bestAvg = ao5Arr.length ? Math.min(...ao5Arr) : 0;
  const bestTime = Math.min(...allSolvesArr);
  const mean = allSolvesArr.reduce((a, b) => a + b, 0) / allSolvesArr.length;
  const variance = allSolvesArr.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / allSolvesArr.length;
  const sigma = Math.sqrt(variance);
  return { bestTime, mean, sigma, bestAvg, solveCounter };
}
function filterSolvesByRange(solves, range) {
  const now = Date.now();
  let start, end;
  {
    start = startOfDayBrazil(now);
    end = endOfDayBrazil(now);
  }
  return solves.filter((s) => s.createdAt >= start && s.createdAt <= end);
}
function getStatistcs() {
  const session2 = getCurrentSession();
  const allSolves = getAllSolvesFromSession(session2);
  return getStatisticsFromSolves(allSolves, session2);
}
function getStatisticsByDate(range) {
  const session2 = getCurrentSession();
  const allSolves = getAllSolvesFromSession(session2);
  const filtered = filterSolvesByRange(allSolves);
  return getStatisticsFromSolves(filtered, session2);
}
function renderStatsPage() {
  const stats = getStatistcs();
  document.getElementById("stat-solves").textContent = stats.solveCounter;
  document.getElementById("stat-best-time").textContent = formatSecondsToTime(stats.bestTime);
  document.getElementById("stat-mean").textContent = formatSecondsToTime(stats.mean);
  document.getElementById("stat-sigma").textContent = formatSecondsToTime(stats.sigma);
  document.getElementById("stat-best-avg").textContent = formatSecondsToTime(stats.bestAvg);
  const session2 = getCurrentSession();
  const thead = document.getElementById("avg-table-head");
  const tbody = document.getElementById("avg-history-body");
  thead.innerHTML = "";
  tbody.innerHTML = "";
  let maxSolves = 0;
  session2.averages.forEach((b) => {
    if (b.solves.length > maxSolves) maxSolves = b.solves.length;
  });
  let headHtml = `<tr>
  <th>#</th>
  <th>Type</th>
  <th>Avg</th>
  <th>Best</th>
  <th>Worst</th>

`;
  for (let i = 0; i < maxSolves; i++) {
    headHtml += `<th>${i + 1}</th>`;
  }
  headHtml += `  <th>σ</th></tr>`;
  thead.innerHTML = headHtml;
  session2.averages.forEach((block, i) => {
    const tr = document.createElement("tr");
    block.mode === "bo3" || block.mode === "bo5";
    let rowHtml = `
      <td>${session2.averages.length - i}</td>
      <td>${block.mode.toUpperCase()}</td>
      <td>${block.average}</td>
      <td><strong>${block.best}</strong></td>
      <td>${block.worst}</td>

    `;
    block.solves.forEach((solve) => {
      rowHtml += `<td>${formatDisplayTime(solve)}</td>`;
    });
    rowHtml += `<td>${block.sigma}</td>`;
    tr.innerHTML = rowHtml;
    tbody.appendChild(tr);
  });
}
const timerObj = {
  timerPhase: 0,
  interval: 0,
  wcaInterval: 0,
  wcaDelayCount: false,
  inspecting: false,
  inspection: 0
};
const inspection$1 = localStorage.getItem("inspectionType") || "WCA";
const timerSettObj = {
  inspectionType: inspection$1,
  timerFlag: false,
  previousInspectionType: inspection$1
};
document.getElementById("inspection-type").value = timerSettObj.inspectionType;
document.getElementById("inspection-type").addEventListener("change", () => {
  previousInspectionType = timerSettObj.inspectionType;
  timerSettObj.inspectionType = document.getElementById("inspection-type").value;
  localStorage.setItem("inspectionType", timerSettObj.inspectionType);
});
let delayFlagType = localStorage.getItem("delayFlagType") || "WCA";
document.getElementById("delay-flag").value = delayFlagType;
document.getElementById("delay-flag").addEventListener("change", () => {
  delayFlagType = document.getElementById("delay-flag").value;
  localStorage.setItem("delayFlagType", delayFlagType);
});
let timeInsertion = localStorage.getItem("timeInsertion") || "Timer";
if (timeInsertion === "Typing") {
  timerSettObj.timerFlag = true;
} else {
  timerSettObj.timerFlag = false;
}
document.getElementById("time-insertion").value = timeInsertion;
document.getElementById("time-insertion").addEventListener("change", () => {
  timeInsertion = document.getElementById("time-insertion").value;
  if (timeInsertion === "Typing") {
    timerSettObj.timerFlag = true;
  } else {
    timerSettObj.timerFlag = false;
  }
  localStorage.setItem("timeInsertion", timeInsertion);
  updateTypingUI();
});
function updateTypingUI() {
  const container = document.getElementById("typing-container");
  if (!container) return;
  if (timeInsertion === "Typing") {
    container.style.display = "block";
    const input = document.getElementById("typed-time");
    if (input) input.focus();
  } else {
    container.style.display = "none";
  }
}
let lastTime = null;
document.addEventListener("DOMContentLoaded", () => {
  updateTypingUI();
  const addBtn = document.getElementById("typed-time-add");
  const input = document.getElementById("typed-time");
  if (addBtn && input) {
    addBtn.addEventListener("click", () => {
      const raw = input.value.trim().replace(",", ".");
      if (!raw) return;
      const seconds2 = parseTimeToSeconds(raw);
      if (!Number.isFinite(seconds2)) {
        input.style.border = "2px solid #e74c3c";
        input.focus();
        setTimeout(() => input.style.border = "", 1500);
        return;
      }
      lastTime = formatSecondsToTime(seconds2);
      document.getElementById("timer").textContent = lastTime;
      const block = averageOfN(seconds2, currentScramble, timerObj.inspection, timerSettObj.inspectionType);
      if (block) addAverageBlock(block);
      renderHistory();
      displayScramble(eventObj.event, vis);
      input.value = "";
    });
    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        addBtn.click();
      }
    });
  }
});
function renderCurrentAverage(currentType, currentBlock) {
  let html = "";
  if (currentType === "live") {
    html += `
            <div class="history-average current-average">
                <div class="history-solves">
        `;
    averageObj.solvesArray.forEach((s, i) => {
      html += `
                <div class="history-solve">
                    ${i + 1} - ${formatDisplayTime(s)}
                </div>
            `;
    });
    html += `
                </div>
            </div>
        `;
  }
  if (currentType === "saved" && currentBlock) {
    html += `
            <div class="history-average current-average">
                <div class="history-solves">
        `;
    currentBlock.solves.forEach((s, i) => {
      html += `
                <div class="history-solve">
                    ${i + 1} - ${formatDisplayTime(s)}
                </div>
            `;
    });
    html += `
                </div>
            </div>
        `;
  }
  return html;
}
function renderHistoryList(averages, currentType) {
  if (lastTime && timerSettObj.timerFlag) document.getElementById("timer").textContent = lastTime;
  let html = "";
  for (let i = 0; i < averages.length; i++) {
    const block = averages[i];
    if (currentType === "saved" && i === 0) continue;
    let titleText = `${block.mode === "fmc3" ? "ao3" : block.mode}: ${block.average}`;
    if (block.mode === "bo3") {
      const mo3Avg = computeAverage(block.solves, "mo3");
      const mo3Value = mo3Avg.avg === "DNF" ? "DNF" : formatSecondsToTime(mo3Avg.avg);
      titleText = `${block.mode}: ${block.average} (mo3: ${mo3Value})`;
    } else if (block.mode === "bo5") {
      const ao5Avg = computeAverage(block.solves, "ao5");
      const ao5Value = ao5Avg.avg === "DNF" ? "DNF" : formatSecondsToTime(ao5Avg.avg);
      titleText = `${block.mode}: ${block.average} (ao5: ${ao5Value})`;
    }
    html += `
            <div class="history-block history-average">
                <div class="history-solves">
        `;
    block.solves.forEach((s, idx) => {
      html += `
                <div class="history-solve">
                    ${idx + 1} - ${formatDisplayTime(s)}
                </div>
            `;
    });
    html += `
                </div>
                <div class="history-title">
                    ${titleText}
                </div>
            </div>
        `;
  }
  return html;
}
function renderStats(stats) {
  return `
        Best single: ${stats.bestTime !== Infinity ? formatSecondsToTime(stats.bestTime) : "-"}
        <br>
        Best ao5: ${stats.bestAvg !== Infinity ? formatSecondsToTime(stats.bestAvg) : "-"}
        <br>
        Session Mean: ${stats.mean ? formatSecondsToTime(stats.mean) : "-"}
        <br>
        Session &sigma;: ${stats.sigma ? formatSecondsToTime(stats.sigma) : "-"}
        <br>
        Solves: ${stats.solveCounter ? stats.solveCounter : "-"}
    `;
}
function renderAvgStats({ type, solves, mode, block }) {
  if (type === "live") {
    if (!solves || solves.length === 0) return "";
    const avgObj2 = computeAverage(solves, mode);
    const best = avgObj2.best;
    const worst = avgObj2.worst;
    const sigma = avgObj2.sigma;
    const bpAo5 = avgObj2.bpAo5;
    const wpA05 = avgObj2.wpA05;
    if (solves.length === 4 && mode === "ao5") {
      return `                
                Best: ${formatSecondsToTime(best)}
                <br>
                Worst: ${formatSecondsToTime(worst)}
                <br>
                &sigma;: ${formatSecondsToTime(sigma)}
                <hr>
                bpAo5: ${formatSecondsToTime(bpAo5)}
                <br>
                wpAo5: ${formatSecondsToTime(wpA05)}
            `;
    }
    return `                
            Best: ${formatSecondsToTime(best)}
            <br>
            Worst: ${formatSecondsToTime(worst)}
            <br>
            &sigma;: ${formatSecondsToTime(sigma)}
        `;
  }
  if (type === "saved") {
    if (!block) return "";
    return `                
            Best: ${block.best}
            <br>
            Worst: ${block.worst}
            <br>
            &sigma;: ${block.sigma}
            <hr>
            ${block.mode === "fmc3" ? "ao3" : block.mode}: ${block.average}
        `;
  }
  return "";
}
function renderHistory() {
  const averages = getSessionAverages();
  const stats = getStatistcs();
  const todayStats = getStatisticsByDate();
  const currentContainer = document.getElementById("currentAverageValue");
  const historyContainer = document.getElementById("historyPanel");
  const doneContainer = document.getElementById("current-stats");
  const statisticsContainer = document.getElementById("stats");
  const todayStatsContainer = document.getElementById("today-stats");
  let currentType = null;
  let currentBlock = null;
  if (averageObj.solvesArray.length > 0) {
    currentType = "live";
  } else if (averages.length > 0) {
    currentType = "saved";
    currentBlock = averages[0];
  }
  if (currentContainer) {
    currentContainer.innerHTML = renderCurrentAverage(currentType, currentBlock);
  }
  if (doneContainer) {
    doneContainer.innerHTML = renderAvgStats({
      type: currentType,
      solves: averageObj.solvesArray,
      mode: averageObj.mode,
      block: currentBlock
    });
  }
  if (historyContainer) {
    historyContainer.innerHTML = renderHistoryList(averages, currentType);
  }
  if (statisticsContainer) {
    statisticsContainer.innerHTML = renderStats(stats);
    todayStatsContainer.innerHTML = renderStats(todayStats);
  }
}
const cube = {
  U: Array(9).fill("W"),
  R: Array(9).fill("R"),
  F: Array(9).fill("G"),
  D: Array(9).fill("Y"),
  L: Array(9).fill("O"),
  B: Array(9).fill("B")
};
function rotateFaceCW(face) {
  [
    face[0],
    face[1],
    face[2],
    face[3],
    face[4],
    face[5],
    face[6],
    face[7],
    face[8]
  ] = [
    face[6],
    face[3],
    face[0],
    face[7],
    face[4],
    face[1],
    face[8],
    face[5],
    face[2]
  ];
}
function M() {
  const u1 = cube.U[1], u4 = cube.U[4], u7 = cube.U[7];
  const f1 = cube.F[1], f4 = cube.F[4], f7 = cube.F[7];
  const d1 = cube.D[1], d4 = cube.D[4], d7 = cube.D[7];
  const b7 = cube.B[7], b4 = cube.B[4], b1 = cube.B[1];
  cube.F[1] = u1;
  cube.F[4] = u4;
  cube.F[7] = u7;
  cube.D[1] = f1;
  cube.D[4] = f4;
  cube.D[7] = f7;
  cube.B[7] = d1;
  cube.B[4] = d4;
  cube.B[1] = d7;
  cube.U[1] = b7;
  cube.U[4] = b4;
  cube.U[7] = b1;
}
function E() {
  const f3 = cube.F[3], f4 = cube.F[4], f5 = cube.F[5];
  const r3 = cube.R[3], r4 = cube.R[4], r5 = cube.R[5];
  const b3 = cube.B[3], b4 = cube.B[4], b5 = cube.B[5];
  const l3 = cube.L[3], l4 = cube.L[4], l5 = cube.L[5];
  cube.R[3] = f3;
  cube.R[4] = f4;
  cube.R[5] = f5;
  cube.B[3] = r3;
  cube.B[4] = r4;
  cube.B[5] = r5;
  cube.L[3] = b3;
  cube.L[4] = b4;
  cube.L[5] = b5;
  cube.F[3] = l3;
  cube.F[4] = l4;
  cube.F[5] = l5;
}
function S() {
  const u3 = cube.U[3], u4 = cube.U[4], u5 = cube.U[5];
  const r1 = cube.R[1], r4 = cube.R[4], r7 = cube.R[7];
  const d5 = cube.D[5], d4 = cube.D[4], d3 = cube.D[3];
  const l7 = cube.L[7], l4 = cube.L[4], l1 = cube.L[1];
  cube.R[1] = u3;
  cube.R[4] = u4;
  cube.R[7] = u5;
  cube.D[5] = r1;
  cube.D[4] = r4;
  cube.D[3] = r7;
  cube.L[7] = d5;
  cube.L[4] = d4;
  cube.L[1] = d3;
  cube.U[3] = l7;
  cube.U[4] = l4;
  cube.U[5] = l1;
}
function x() {
  R();
  M();
  M();
  M();
  L();
  L();
  L();
}
function y() {
  U();
  E();
  E();
  E();
  D();
  D();
  D();
}
function z() {
  F();
  S();
  B();
  B();
  B();
}
function resetCube() {
  cube.U.fill("W");
  cube.R.fill("R");
  cube.F.fill("G");
  cube.D.fill("Y");
  cube.L.fill("O");
  cube.B.fill("B");
}
function cloneCubeState() {
  return {
    U: [...cube.U],
    R: [...cube.R],
    F: [...cube.F],
    D: [...cube.D],
    L: [...cube.L],
    B: [...cube.B]
  };
}
function restoreCubeState(state) {
  cube.U = [...state.U];
  cube.R = [...state.R];
  cube.F = [...state.F];
  cube.D = [...state.D];
  cube.L = [...state.L];
  cube.B = [...state.B];
}
function U() {
  rotateFaceCW(cube.U);
  const f0 = cube.F[0], f1 = cube.F[1], f2 = cube.F[2];
  const r0 = cube.R[0], r1 = cube.R[1], r2 = cube.R[2];
  const b0 = cube.B[0], b1 = cube.B[1], b2 = cube.B[2];
  const l0 = cube.L[0], l1 = cube.L[1], l2 = cube.L[2];
  cube.F[0] = r0;
  cube.F[1] = r1;
  cube.F[2] = r2;
  cube.R[0] = b0;
  cube.R[1] = b1;
  cube.R[2] = b2;
  cube.B[0] = l0;
  cube.B[1] = l1;
  cube.B[2] = l2;
  cube.L[0] = f0;
  cube.L[1] = f1;
  cube.L[2] = f2;
}
function D() {
  rotateFaceCW(cube.D);
  const f6 = cube.F[6], f7 = cube.F[7], f8 = cube.F[8];
  const r6 = cube.R[6], r7 = cube.R[7], r8 = cube.R[8];
  const b6 = cube.B[6], b7 = cube.B[7], b8 = cube.B[8];
  const l6 = cube.L[6], l7 = cube.L[7], l8 = cube.L[8];
  cube.R[6] = f6;
  cube.R[7] = f7;
  cube.R[8] = f8;
  cube.B[6] = r6;
  cube.B[7] = r7;
  cube.B[8] = r8;
  cube.L[6] = b6;
  cube.L[7] = b7;
  cube.L[8] = b8;
  cube.F[6] = l6;
  cube.F[7] = l7;
  cube.F[8] = l8;
}
function R() {
  rotateFaceCW(cube.R);
  const u2 = cube.U[2], u5 = cube.U[5], u8 = cube.U[8];
  const f2 = cube.F[2], f5 = cube.F[5], f8 = cube.F[8];
  const d2 = cube.D[2], d5 = cube.D[5], d8 = cube.D[8];
  const b6 = cube.B[6], b3 = cube.B[3], b0 = cube.B[0];
  cube.B[6] = u2;
  cube.B[3] = u5;
  cube.B[0] = u8;
  cube.D[2] = b6;
  cube.D[5] = b3;
  cube.D[8] = b0;
  cube.F[2] = d2;
  cube.F[5] = d5;
  cube.F[8] = d8;
  cube.U[2] = f2;
  cube.U[5] = f5;
  cube.U[8] = f8;
}
function L() {
  rotateFaceCW(cube.L);
  const u0 = cube.U[0], u3 = cube.U[3], u6 = cube.U[6];
  const f0 = cube.F[0], f3 = cube.F[3], f6 = cube.F[6];
  const d0 = cube.D[0], d3 = cube.D[3], d6 = cube.D[6];
  const b8 = cube.B[8], b5 = cube.B[5], b2 = cube.B[2];
  cube.F[0] = u0;
  cube.F[3] = u3;
  cube.F[6] = u6;
  cube.D[0] = f0;
  cube.D[3] = f3;
  cube.D[6] = f6;
  cube.B[8] = d0;
  cube.B[5] = d3;
  cube.B[2] = d6;
  cube.U[0] = b8;
  cube.U[3] = b5;
  cube.U[6] = b2;
}
function F() {
  rotateFaceCW(cube.F);
  const u6 = cube.U[6], u7 = cube.U[7], u8 = cube.U[8];
  const r0 = cube.R[0], r3 = cube.R[3], r6 = cube.R[6];
  const d2 = cube.D[2], d1 = cube.D[1], d0 = cube.D[0];
  const l8 = cube.L[8], l5 = cube.L[5], l2 = cube.L[2];
  cube.R[0] = u6;
  cube.R[3] = u7;
  cube.R[6] = u8;
  cube.D[2] = r0;
  cube.D[1] = r3;
  cube.D[0] = r6;
  cube.L[8] = d2;
  cube.L[5] = d1;
  cube.L[2] = d0;
  cube.U[6] = l8;
  cube.U[7] = l5;
  cube.U[8] = l2;
}
function B() {
  rotateFaceCW(cube.B);
  const u0 = cube.U[0], u1 = cube.U[1], u2 = cube.U[2];
  const r2 = cube.R[2], r5 = cube.R[5], r8 = cube.R[8];
  const d8 = cube.D[8], d7 = cube.D[7], d6 = cube.D[6];
  const l0 = cube.L[0], l3 = cube.L[3], l6 = cube.L[6];
  cube.U[0] = r2;
  cube.U[1] = r5;
  cube.U[2] = r8;
  cube.R[2] = d8;
  cube.R[5] = d7;
  cube.R[8] = d6;
  cube.D[6] = l0;
  cube.D[7] = l3;
  cube.D[8] = l6;
  cube.L[0] = u2;
  cube.L[3] = u1;
  cube.L[6] = u0;
}
function isSolved() {
  for (const face in cube) {
    const first = cube[face][0];
    for (let i = 1; i < 9; i++) {
      if (cube[face][i] !== first) {
        return false;
      }
    }
  }
  return true;
}
let _moveCount = 0;
function getMoveCount() {
  return _moveCount;
}
function printScrambleMoves(scr, shouldReset = true) {
  const displayedScramble = scr;
  const moves = displayedScramble.split(" ");
  const moveFunctions = {
    "U": U,
    "U'": () => {
      U();
      U();
      U();
    },
    "U2": () => {
      U();
      U();
    },
    "D": D,
    "D'": () => {
      D();
      D();
      D();
    },
    "D2": () => {
      D();
      D();
    },
    "R": R,
    "R'": () => {
      R();
      R();
      R();
    },
    "R2": () => {
      R();
      R();
    },
    "L": L,
    "L'": () => {
      L();
      L();
      L();
    },
    "L2": () => {
      L();
      L();
    },
    "F": F,
    "F'": () => {
      F();
      F();
      F();
    },
    "F2": () => {
      F();
      F();
    },
    "B": B,
    "B'": () => {
      B();
      B();
      B();
    },
    "B2": () => {
      B();
      B();
    },
    "y": y,
    "y'": () => {
      y();
      y();
      y();
    },
    "y2": () => {
      y();
      y();
    },
    "x": x,
    "x'": () => {
      x();
      x();
      x();
    },
    "x2": () => {
      x();
      x();
    },
    "z": z,
    "z'": () => {
      z();
      z();
      z();
    },
    "z2": () => {
      z();
      z();
    }
  };
  if (shouldReset) resetCube();
  _moveCount = 0;
  moves.forEach((move) => {
    const func = moveFunctions[move];
    if (func) {
      func();
      if (!["y", "y'", "y2", "x", "x'", "x2", "z", "z'", "z2"].includes(move)) _moveCount++;
    }
  });
}
function injectCubeCSS() {
  if (document.getElementById("cubisz-css")) return;
  const link = document.createElement("link");
  link.id = "cubisz-css";
  link.rel = "stylesheet";
  link.href = new URL("data:text/css;base64,LnBhZ2UtY2VudGVyLCAjY3ViZS13cmFwcGVyIHsNCiAgcG9zaXRpb246IHJlbGF0aXZlOyAgICAgICAgICAvKiByZW1vdmUgZnJvbSBkb2N1bWVudCBmbG93ICovDQogIGluc2V0OiAwOyAgICAgICAgICAgICAgICAgLyogZnVsbCB2aWV3cG9ydCAqLw0KICBkaXNwbGF5OiBncmlkOw0KICBwbGFjZS1pdGVtczogY2VudGVyOyAgICAgIC8qIHRydWUgY2VudGVyICovDQogIHBvaW50ZXItZXZlbnRzOiBub25lOyAgICAgLyogYWxsb3cgY2xpY2tzIG91dHNpZGUgY3ViZSAqLw0KfQ0KDQouZ3JpZC1jb250YWluZXIgew0KICBwb2ludGVyLWV2ZW50czogYXV0bzsgICAgIC8qIGN1YmUgaXMgY2xpY2thYmxlICovDQogIGRpc3BsYXk6IGdyaWQ7DQogIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDQsIG1heC1jb250ZW50KTsNCiAgZ3JpZC10ZW1wbGF0ZS1yb3dzOiByZXBlYXQoMywgbWF4LWNvbnRlbnQpOw0KICB3aWR0aDogZml0LWNvbnRlbnQ7DQogIGhlaWdodDogZml0LWNvbnRlbnQ7DQp9DQoNCg0KICAuZ3JpZCB7DQogICAgZGlzcGxheTogZ3JpZDsNCiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgzLCA2MHB4KTsgLyogMyBjb2x1bW5zIG9mIDYwcHggZWFjaCAqLw0KICAgIGdhcDogNXB4OyAvKiBnYXAgYmV0d2VlbiB0aGUgc3F1YXJlcyAqLw0KICAgIGJvcmRlcjogMnB4IHNvbGlkIGJsYWNrOyAvKiBBZGQgYSBibGFjayBib3JkZXIgKi8NCiAgICBtYXJnaW46IC0ycHg7DQogICAgcGFkZGluZzogNXB4OyAvKiBPcHRpb25hbCBwYWRkaW5nIGluc2lkZSB0aGUgYm9yZGVyICovDQogICAgYmFja2dyb3VuZC1jb2xvcjogYmxhY2s7DQogIH0NCg0KICAuc3F1YXJlIHsNCiAgICB3aWR0aDogNThweDsgLyogd2lkdGggb2YgZWFjaCBzcXVhcmUgKi8NCiAgICBoZWlnaHQ6IDYwcHg7IC8qIGhlaWdodCBvZiBlYWNoIHNxdWFyZSAqLw0KICB9DQoNCiAgLndoaXRlLXNxdWFyZSB7DQogICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7DQogIH0NCg0KICAub3JhbmdlLXNxdWFyZSB7DQogICAgYmFja2dyb3VuZC1jb2xvcjogb3JhbmdlOw0KICB9DQoNCiAgLmdyZWVuLXNxdWFyZSB7DQogICAgYmFja2dyb3VuZC1jb2xvcjogZ3JlZW47DQogIH0NCg0KICAucmVkLXNxdWFyZSB7DQogICAgYmFja2dyb3VuZC1jb2xvcjogcmVkOw0KICB9DQoNCiAgLmJsdWUtc3F1YXJlIHsNCiAgICBiYWNrZ3JvdW5kLWNvbG9yOiBibHVlOw0KICB9DQoNCiAgLnllbGxvdy1zcXVhcmUgew0KICAgIGJhY2tncm91bmQtY29sb3I6IHllbGxvdzsNCiAgfQ0KIA0KDQoNCiN3aGl0ZVNxdWFyZUdyaWQgIHsgZ3JpZC1jb2x1bW46IDI7IGdyaWQtcm93OiAxOyB9DQojb3JhbmdlU3F1YXJlR3JpZCB7IGdyaWQtY29sdW1uOiAxOyBncmlkLXJvdzogMjsgfQ0KI2dyZWVuU3F1YXJlR3JpZCAgeyBncmlkLWNvbHVtbjogMjsgZ3JpZC1yb3c6IDI7IH0NCiNyZWRTcXVhcmVHcmlkICAgIHsgZ3JpZC1jb2x1bW46IDM7IGdyaWQtcm93OiAyOyB9DQojYmx1ZVNxdWFyZUdyaWQgICB7IGdyaWQtY29sdW1uOiA0OyBncmlkLXJvdzogMjsgfQ0KI3llbGxvd1NxdWFyZUdyaWQgeyBncmlkLWNvbHVtbjogMjsgZ3JpZC1yb3c6IDM7IH0NCg0KI2N1c3RvbS1zY3JhbWJsZSwgI2N1c3RvbS1zb2x2ZSB7DQogIHdpZHRoOiAzMCU7DQp9DQoNCi8qID09PT09PT09PT09PT09PT09PT09PT09PT0gKi8NCi8qIDNEIE1PREUgKGRvZXMgTk9UIGFmZmVjdCAyRCkgKi8NCi8qID09PT09PT09PT09PT09PT09PT09PT09PT0gKi8NCg0KLnBhZ2UtY2VudGVyew0KICBwZXJzcGVjdGl2ZTogMTAwMHB4OyAvKiBuZWVkZWQgZm9yIDNEICovDQp9DQoNCi8qIHdoZW4gM0QgaXMgYWN0aXZlLCBraWxsIHRoZSBncmlkIGxheW91dCAqLw0KLmN1YmUzZCAuZ3JpZC1jb250YWluZXJ7DQogIGRpc3BsYXk6IGJsb2NrOw0KICBwb3NpdGlvbjogcmVsYXRpdmU7DQogIHRyYW5zZm9ybS1zdHlsZTogcHJlc2VydmUtM2Q7DQogIHdpZHRoOiAyMDBweDsNCiAgaGVpZ2h0OiAyMDBweDsNCg0KICB0cmFuc2Zvcm06IHJvdGF0ZVgoLTI1ZGVnKSByb3RhdGVZKC0zNWRlZyk7DQp9DQoNCg0KLyogYWxsIGZhY2VzIHN0YWNrIGluIHNhbWUgb3JpZ2luICovDQouY3ViZTNkIC5ncmlkew0KICBwb3NpdGlvbjogYWJzb2x1dGU7DQogIHRvcDogNTAlOw0KICBsZWZ0OiA1MCU7DQogIHRyYW5zZm9ybS1vcmlnaW46IGNlbnRlciBjZW50ZXI7DQogIHRyYW5zaXRpb246IHRyYW5zZm9ybSAwLjZzIGVhc2U7DQogIGJhY2tncm91bmQtY29sb3I6IGJsYWNrOw0KfQ0KDQovKiBSRUFMIGN1YmUgZGVwdGggKGRlcGVuZHMgb24gc3RpY2tlciBzaXplKSAqLw0KOnJvb3R7DQogIC0tY3ViZS1kZXB0aDogNDhweDsNCn0NCg0KLyogRlJPTlQgKGdyZWVuKSAqLw0KLmN1YmUzZCAjZ3JlZW5TcXVhcmVHcmlkew0KICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKSByb3RhdGVZKDBkZWcpIHRyYW5zbGF0ZVoodmFyKC0tY3ViZS1kZXB0aCkpOw0KfQ0KDQovKiBCQUNLIChibHVlKSAqLw0KLmN1YmUzZCAjYmx1ZVNxdWFyZUdyaWR7DQogIHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpIHJvdGF0ZVkoMTgwZGVnKSB0cmFuc2xhdGVaKHZhcigtLWN1YmUtZGVwdGgpKTsNCn0NCg0KLyogUklHSFQgKHJlZCkgKi8NCi5jdWJlM2QgI3JlZFNxdWFyZUdyaWR7DQogIHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpIHJvdGF0ZVkoOTBkZWcpIHRyYW5zbGF0ZVoodmFyKC0tY3ViZS1kZXB0aCkpOw0KfQ0KDQovKiBMRUZUIChvcmFuZ2UpICovDQouY3ViZTNkICNvcmFuZ2VTcXVhcmVHcmlkew0KICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKSByb3RhdGVZKC05MGRlZykgdHJhbnNsYXRlWih2YXIoLS1jdWJlLWRlcHRoKSk7DQp9DQoNCi8qIFRPUCAod2hpdGUpICovDQouY3ViZTNkICN3aGl0ZVNxdWFyZUdyaWR7DQogIHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpIHJvdGF0ZVgoOTBkZWcpIHRyYW5zbGF0ZVoodmFyKC0tY3ViZS1kZXB0aCkpOw0KfQ0KDQovKiBCT1RUT00gKHllbGxvdykgKi8NCi5jdWJlM2QgI3llbGxvd1NxdWFyZUdyaWR7DQogIHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpIHJvdGF0ZVgoLTkwZGVnKSB0cmFuc2xhdGVaKHZhcigtLWN1YmUtZGVwdGgpKTsNCn0NCi8qIEZJWCB2ZXJ0aWNhbCBjZW50ZXJpbmcgT05MWSBpbiAzRCBtb2RlICovDQouY3ViZTNkLnBhZ2UtY2VudGVyew0KICBwb3NpdGlvbjogZml4ZWQ7DQogIGluc2V0OiAwOw0KICBkaXNwbGF5OiBmbGV4Ow0KICBhbGlnbi1pdGVtczogY2VudGVyOw0KICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsNCn0NCg==", import.meta.url).href;
  document.head.appendChild(link);
}
let facesToSquares = {};
function mountRenderer(container) {
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
    U: document.querySelectorAll("#whiteSquareGrid .square"),
    R: document.querySelectorAll("#redSquareGrid .square"),
    F: document.querySelectorAll("#greenSquareGrid .square"),
    D: document.querySelectorAll("#yellowSquareGrid .square"),
    L: document.querySelectorAll("#orangeSquareGrid .square"),
    B: document.querySelectorAll("#blueSquareGrid .square")
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
function paint() {
  const colorMap = { W: "white", R: "red", G: "green", Y: "yellow", O: "orange", B: "blue" };
  for (const f in cube) {
    const squares = facesToSquares[f];
    for (let i = 0; i < 9; i++) {
      squares[i].className = `square ${colorMap[cube[f][i]]}-square`;
    }
  }
}
function resize(size) {
  const gap = Math.round(size * 0.08);
  const padding = gap;
  document.querySelectorAll(".grid").forEach((g) => {
    g.style.gridTemplateColumns = `repeat(3, ${size}px)`;
    g.style.gap = `${gap}px`;
    g.style.padding = `${padding}px`;
  });
  document.querySelectorAll(".square").forEach((s) => {
    s.style.width = `${size}px`;
    s.style.height = `${size}px`;
  });
  const depth = size * 3 + gap * 2 + padding * 2;
  document.documentElement.style.setProperty("--cube-depth", `${depth / 2}px`);
}
function set3D(enabled) {
  const net = document.getElementById("cube-net");
  net.classList.toggle("cube3d", enabled);
}
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
function applyScramble(scr) {
  printScrambleMoves(scr, true);
  paint();
  scrambledState = cloneCubeState();
}
function applySolution(sol) {
  restoreCubeState(scrambledState);
  printScrambleMoves(sol, false);
  paint();
}
function getLastMoveCount() {
  return getMoveCount();
}
function checkSolved() {
  return isSolved();
}
const ONE_HOUR = 60 * 60;
let remainingTime = ONE_HOUR;
let intervalId = null;
const display = document.getElementById("timer");
const startBtn = document.getElementById("countdown");
const stopBtn = document.getElementById("submit-moves");
function formatTime$1(seconds2) {
  const hrs = String(Math.floor(seconds2 / 3600)).padStart(2, "0");
  const mins = String(Math.floor(seconds2 % 3600 / 60)).padStart(2, "0");
  const secs = String(seconds2 % 60).padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
}
function updateDisplay() {
  display.textContent = formatTime$1(remainingTime);
}
function startTimer2() {
  if (intervalId !== null) {
    stopTimer2();
    return;
  }
  intervalId = setInterval(() => {
    document.getElementById("countdown").textContent = "Stop attempt";
    remainingTime--;
    updateDisplay();
    if (remainingTime <= 0) {
      stopTimer2();
    }
  }, 1e3);
}
function stopTimer2() {
  document.getElementById("countdown").textContent = "Start attempt";
  remainingTime = ONE_HOUR;
  updateDisplay();
  clearInterval(intervalId);
  intervalId = null;
}
startBtn.addEventListener("click", startTimer2);
stopBtn.addEventListener("click", stopTimer2);
let solutionFlag = false;
function handleFMC() {
  document.getElementById("penaltyOkBtn").style.display = "none";
  document.getElementById("penaltyPlus2Btn").style.display = "none";
  document.getElementById("penaltyDnfBtn").style.display = "none";
  document.getElementById("removeLastBtn").style.display = "none";
  document.getElementById("submit-moves").style.display = "block";
  document.getElementById("fmc-cube").style.display = "block";
  document.getElementById("fmc-solution").style.display = "block";
  document.getElementById("fmc-solution-test").style.display = "block";
  document.getElementById("fmc-move-count").style.display = "block";
  document.getElementById("fmc-form").style.display = "flex";
  document.getElementById("countdown").style.display = "block";
  document.getElementById("typing-container").style.display = "none";
  document.getElementById("timer").style.fontSize = "50px";
  document.getElementById("touchOverlay").style.display = "none";
  updateDisplay();
  mountCube(document.getElementById("fmc-cube"));
  setSize(28);
  setView("3d");
  applyScramble(currentScramble);
  solutionFlag = false;
}
document.getElementById("fmc-solution").addEventListener("input", (e) => {
  e.preventDefault();
  applySolution(e.target.value.trim());
  solutionFlag = true;
});
let moveCount = null;
document.getElementById("fmc-form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (solutionFlag) {
    moveCount = getLastMoveCount();
    document.getElementById("fmc-move-count").innerHTML = `${moveCount} moves 
      <br>
      Result: ${checkSolved() ? "Solved" : "DNF"}`;
  } else {
    document.getElementById("fmc-move-count").innerHTML = `no moves`;
  }
});
document.getElementById("submit-moves").addEventListener("click", async () => {
  if (document.getElementById("fmc-solution").value !== "") {
    moveCount = getLastMoveCount();
  } else {
    alert("Submit needs a solution");
    return;
  }
  const fmcObj = {
    moveCount,
    solution: document.getElementById("fmc-solution").value
  };
  if (!checkSolved()) timerObj.inspection = 17;
  const block = averageOfN(fmcObj, currentScramble, timerObj.inspection, timerSettObj.inspectionType, true);
  if (block) addAverageBlock(block);
  renderHistory();
  await displayScramble(eventObj.event, vis);
  applyScramble(currentScramble);
  document.getElementById("fmc-solution").value = "";
});
const categorySelect = document.getElementById("categorySelect");
const eventSelect$1 = document.getElementById("eventSelect");
const validCategories = scrdata.filter(
  ([name]) => !name.startsWith("===")
);
categorySelect.innerHTML = "";
eventSelect$1.innerHTML = "";
validCategories.forEach(([categoryName]) => {
  const option = document.createElement("option");
  option.value = categoryName;
  option.textContent = categoryName;
  categorySelect.appendChild(option);
});
function restoreSelectorsFromSession() {
  const session2 = getCurrentSession();
  if (session2.category) {
    categorySelect.value = session2.category;
  } else {
    categorySelect.selectedIndex = 0;
  }
  categorySelect.dispatchEvent(new Event("change"));
  if (session2.scrambleType) {
    eventSelect$1.value = session2.scrambleType;
  }
  eventSelect$1.dispatchEvent(new Event("change"));
}
categorySelect.addEventListener("change", () => {
  const session2 = getCurrentSession();
  session2.category = categorySelect.value;
  saveSessions();
  eventSelect$1.innerHTML = "";
  const category = validCategories.find(
    ([name]) => name === categorySelect.value
  );
  if (!category) return;
  const [, scrambles] = category;
  scrambles.forEach(([label, code]) => {
    if (code === "blank") return;
    const option = document.createElement("option");
    option.value = code;
    option.textContent = label;
    eventSelect$1.appendChild(option);
  });
});
restoreSelectorsFromSession();
eventSelect$1.addEventListener("change", async () => {
  const session2 = getCurrentSession();
  session2.event = eventSelect$1.value;
  eventObj.event = eventSelect$1.value;
  if (eventObj.event === "333fm") {
    timerSettObj.timerFlag = true;
    document.getElementById("typing-container").style.display = "none";
    document.querySelector(".timerOpt").style.display = "none";
  } else {
    document.querySelector(".timerOpt").style.display = "block";
    if (timeInsertion === "Typing") {
      document.getElementById("typing-container").style.display = "block";
      timerObj.timerFlag = true;
    } else {
      timerSettObj.timerFlag = false;
    }
  }
  session2.scrambleType = eventObj.event;
  saveSessions();
  syncModeWithEvent(eventObj.event);
  if (eventObj.event.includes("bf")) {
    document.getElementById("penaltyOkBtn").style.display = "block";
    document.getElementById("penaltyPlus2Btn").style.display = "block";
    document.getElementById("penaltyDnfBtn").style.display = "block";
    document.getElementById("removeLastBtn").style.display = "block";
    document.getElementById("submit-moves").style.display = "none";
    document.getElementById("fmc-cube").style.display = "none";
    document.getElementById("fmc-solution").style.display = "none";
    document.getElementById("fmc-solution-test").style.display = "none";
    document.getElementById("fmc-move-count").style.display = "none";
    document.getElementById("fmc-form").style.display = "none";
    document.getElementById("countdown").style.display = "none";
    if (vis === document.querySelector("#scrambleVis")) {
      document.getElementById("timer").style.fontSize = "140px";
    } else {
      document.getElementById("timer").style.fontSize = "72px";
    }
    document.getElementById("timer").textContent = "0.00";
    timerSettObj.previousInspectionType = timerSettObj.inspectionType;
    timerSettObj.inspectionType = "None";
    document.getElementById("inspection-type").value = "None";
    localStorage.setItem("inspectionType", "None");
  } else if (eventObj.event === "333fm") ;
  else {
    document.getElementById("penaltyOkBtn").style.display = "block";
    document.getElementById("penaltyPlus2Btn").style.display = "block";
    document.getElementById("penaltyDnfBtn").style.display = "block";
    document.getElementById("removeLastBtn").style.display = "block";
    document.getElementById("submit-moves").style.display = "none";
    document.getElementById("fmc-cube").style.display = "none";
    document.getElementById("fmc-solution").style.display = "none";
    document.getElementById("fmc-solution-test").style.display = "none";
    document.getElementById("fmc-move-count").style.display = "none";
    document.getElementById("fmc-form").style.display = "none";
    document.getElementById("countdown").style.display = "none";
    if (vis === document.querySelector("#scrambleVis")) {
      document.getElementById("timer").style.fontSize = "140px";
    } else {
      document.getElementById("timer").style.fontSize = "72px";
    }
    document.getElementById("timer").textContent = "0.00";
    timerSettObj.inspectionType = timerSettObj.previousInspectionType;
    document.getElementById("inspection-type").value = timerSettObj.previousInspectionType;
    localStorage.setItem("inspectionType", timerSettObj.previousInspectionType);
  }
  await displayScramble(eventObj.event, vis);
  if (eventObj.event === "333fm") handleFMC();
});
const modeSelectEl = document.getElementById("modeSelect");
if (modeSelectEl) {
  modeSelectEl.addEventListener("change", (ev) => {
    const val = ev.target.value;
    const session2 = getCurrentSession();
    averageObj.mode = val;
    session2.mode = val;
    saveSessions();
    renderHistory();
  });
}
function getDefaultModeForEvent(event) {
  if (event === "333bf") return "bo5";
  if (event === "444bf") return "bo3";
  if (event === "555bf") return "bo3";
  if (["666", "777"].includes(event)) return "mo3";
  if (event === "333fm") return "fmc3";
  return "ao5";
}
function syncModeWithEvent(event) {
  const session2 = getCurrentSession();
  const desiredMode = getDefaultModeForEvent(event);
  if (averageObj.mode !== desiredMode) {
    averageObj.mode = desiredMode;
    session2.mode = desiredMode;
    const sel = document.getElementById("modeSelect");
    if (sel) sel.value = desiredMode;
    averageObj.solvesArray = [];
    averageObj.solveCounter = 0;
    saveSessions();
  }
}
const modal = document.getElementById("detailsModal");
document.getElementById("modalBody");
const closeModalBtn = document.getElementById("closeModalBtn");
closeModalBtn.onclick = () => modal.classList.add("hidden");
modal.onclick = (e) => {
  if (e.target === modal) modal.classList.add("hidden");
};
const statsPage = document.getElementById("stats-page");
const openStatsBtn = document.getElementById("open-stats-btn");
const closeStatsBtn = document.getElementById("close-stats-btn");
openStatsBtn.addEventListener("click", () => {
  renderStatsPage();
  statsPage.classList.add("open");
});
closeStatsBtn.addEventListener("click", () => {
  statsPage.classList.remove("open");
});
document.addEventListener("sessionChanged", async () => {
  const session2 = getCurrentSession();
  if (session2.category) {
    categorySelect.value = session2.category;
    categorySelect.dispatchEvent(new Event("change"));
  }
  eventObj.event = session2.scrambleType || "333";
  eventSelect$1.value = session2.event || "333";
  eventSelect$1.dispatchEvent(new Event("change"));
  if (eventObj.event === "333fm") {
    await displayScramble(eventObj.event, vis);
    handleFMC();
    return;
  } else {
    document.getElementById("penaltyOkBtn").style.display = "block";
    document.getElementById("penaltyPlus2Btn").style.display = "block";
    document.getElementById("penaltyDnfBtn").style.display = "block";
    document.getElementById("removeLastBtn").style.display = "block";
    document.getElementById("submit-moves").style.display = "none";
    document.getElementById("fmc-cube").style.display = "none";
    document.getElementById("fmc-solution").style.display = "none";
    document.getElementById("fmc-solution-test").style.display = "none";
    document.getElementById("fmc-move-count").style.display = "none";
    document.getElementById("fmc-form").style.display = "none";
    document.getElementById("countdown").style.display = "none";
    if (vis === document.querySelector("#scrambleVis")) {
      document.getElementById("timer").style.fontSize = "140px";
    } else {
      document.getElementById("timer").style.fontSize = "72px";
    }
    document.getElementById("timer").textContent = "0.00";
  }
  await displayScramble(eventObj.event, vis);
});
const avgObj = {
  modeSelect: document.getElementById("modeSelect"),
  clearBtn: document.getElementById("clearBtn"),
  openSessionBtn: document.getElementById("modal-button"),
  penaltyOkBtn: document.getElementById("penaltyOkBtn"),
  penaltyPlus2Btn: document.getElementById("penaltyPlus2Btn"),
  penaltyDnfBtn: document.getElementById("penaltyDnfBtn"),
  removeLastBtn: document.getElementById("removeLastBtn")
};
document.querySelectorAll("button").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.blur();
  });
});
document.querySelectorAll("select").forEach((select) => {
  select.addEventListener("change", () => {
    select.blur();
  });
});
document.addEventListener("sessionChanged", () => {
  changedSession();
  renderHistory();
});
avgObj.clearBtn.onclick = () => {
  clearAverages();
  renderHistory();
};
avgObj.openSessionBtn.onclick = openDetailsModal;
avgObj.penaltyOkBtn.onclick = () => {
  applyPenaltyToLast(null);
  renderHistory();
};
avgObj.penaltyPlus2Btn.onclick = () => {
  applyPenaltyToLast("+2");
  renderHistory();
};
avgObj.penaltyDnfBtn.onclick = () => {
  applyPenaltyToLast("DNF");
  renderHistory();
};
avgObj.removeLastBtn.onclick = () => removeLastSolve();
renderHistory();
document.getElementById("scramble-button").addEventListener("click", () => {
  if (timerDOMObj.scrDisplayFlag) {
    document.querySelector(".panel-cube2").style.display = "none";
    document.getElementById("scramble-button").innerHTML = "Scramble visualizer";
    document.getElementById("scramble-button").style.justifySelf = "center";
    timerDOMObj.scrDisplayFlag = false;
    return;
  }
  timerDOMObj.scrDisplayFlag = true;
  document.querySelector(".panel-cube2").style.display = "grid";
  document.getElementById("scramble-button").style.justifySelf = "left";
  document.getElementById("scramble-button").innerHTML = "close";
});
const eventObj = {
  event: getCurrentSession().scrambleType || "333"
};
if (eventObj.event === "333fm") {
  timerSettObj.timerFlag = true;
  document.getElementById("typing-container").style.display = "none";
  document.querySelector(".timerOpt").style.display = "none";
} else {
  document.querySelector(".timerOpt").style.display = "block";
  if (timeInsertion === "Typing") {
    document.getElementById("typing-container").style.display = "block";
    timerObj.timerFlag = true;
  } else {
    timerSettObj.timerFlag = false;
  }
}
const eventSelect = document.getElementById("eventSelect");
let vis = null;
if (window.innerWidth > 768) {
  vis = document.querySelector("#scrambleVis");
} else {
  vis = document.querySelector("#scrambleVis2");
}
const session = getCurrentSession();
eventObj.event = session.scrambleType || "333";
eventSelect.value = eventObj.event;
syncModeWithEvent(eventObj.event);
await displayScramble(eventObj.event, vis);
if (eventObj.event === "333fm") handleFMC();
function timerPhases(delayFlagType2) {
  if (timerObj.timerPhase !== 1) {
    timerObj.timerPhase++;
  } else if (timerObj.timerPhase === 1) {
    if (delayFlagType2 === "None") {
      setTimerDisplay("color", "limeGreen");
      timerObj.timerPhase++;
    } else {
      setTimerDisplay("color", "red");
      timerObj.wcaInterval = setInterval(() => {
        setTimerDisplay("color", "limeGreen");
        timerObj.wcaDelayCount++;
      }, 300);
    }
  }
}
function wcaDelayFlag() {
  if (timerObj.wcaDelayCount >= 1) {
    timerObj.timerPhase++;
    timerObj.wcaDelayCount = 0;
    clearInterval(timerObj.wcaInterval);
  } else {
    setTimerDisplay("color", "#eaeaf0");
    timerObj.wcaDelayCount = 0;
    clearInterval(timerObj.wcaInterval);
  }
}
let seconds = 0;
let interval = null;
let running = false;
function inspection2() {
  if (!running) {
    running = true;
    setTimerDisplay("time", seconds);
    interval = setInterval(() => {
      seconds++;
      setTimerDisplay("time", seconds);
      if (seconds === 8) new Audio("./audio/8seconds.mp3").play();
      if (seconds === 12) new Audio("./audio/12seconds.mp3").play();
      if (seconds === 17) {
        running = false;
        clearInterval(interval);
        interval = null;
        seconds = 0;
        if (lastTime) {
          setTimerDisplay("time", lastTime);
        } else {
          setTimerDisplay("time", "0.00");
        }
      }
    }, 1e3);
  } else {
    running = false;
    clearInterval(interval);
    interval = null;
    seconds = 0;
    if (lastTime) {
      setTimerDisplay("time", lastTime);
    } else {
      setTimerDisplay("time", "0.00");
    }
  }
}
function inspection(inspecType) {
  timerObj.inspecting = true;
  const start = performance.now();
  let lastSecond = -1;
  timerObj.interval = setInterval(() => {
    const elapsedMs = performance.now() - start;
    const seconds2 = Math.floor(elapsedMs / 1e3);
    const secondsWithDecimals = elapsedMs / 1e3;
    timerObj.inspection = parseFloat(secondsWithDecimals.toFixed(2));
    if (inspecType === "WCA") {
      if (seconds2 !== lastSecond) {
        lastSecond = seconds2;
        if (seconds2 === 8) new Audio("./audio/8seconds.mp3").play();
        if (seconds2 === 12) new Audio("./audio/12seconds.mp3").play();
        if (seconds2 === 17) clearInterval(timerObj.interval);
      }
    }
    setTimerDisplay("time", seconds2);
  }, 10);
}
function truncate2(n) {
  return (Math.floor(n * 100) / 100).toFixed(2);
}
function formatTime(milisseconds) {
  let seconds2 = milisseconds / 1e3;
  let minutes = Math.floor(seconds2 / 60);
  let hours = Math.floor(minutes / 60);
  if (minutes < 1) {
    return truncate2(seconds2);
  } else if (minutes >= 1) {
    seconds2 = seconds2 - 60 * minutes;
    return `${minutes}: ${seconds2 < 10 ? "0" : ""}${truncate2(seconds2)}`;
  } else if (minutes >= 60) {
    minutes = minutes - 60 * hours;
    return `${hours}: ${minutes < 10 ? "0" : ""}${minutes}: ${seconds2 < 10 ? "0" : ""}${truncate2(seconds2)}`;
  }
}
function startTimer(param) {
  setTimerDisplay("color", "#eaeaf0");
  clearInterval(timerObj.interval);
  timerObj.inspecting = false;
  const startTime = performance.now();
  timerObj.interval = setInterval(() => {
    setTimerDisplay("time", formatTime(performance.now() - startTime));
  }, 10);
}
function stopTimer() {
  clearInterval(timerObj.interval);
  document.getElementById("timer").innerHTML;
  timerObj.timerPhase = 0;
}
const timerDOMObj = {
  scrDisplayFlag: false
};
function setTimerDisplay(colorOrTime, content) {
  if (colorOrTime === "color") {
    document.getElementById("timer").style.color = content;
  } else if (colorOrTime === "time") {
    document.getElementById("timer").textContent = content;
  }
}
function showOnlyTimerSafe() {
  const timer = document.getElementById("timer");
  const overlay2 = document.getElementById("touchOverlay");
  if (!timer || !overlay2) return;
  function hideRecursively(element) {
    if (element === timer || element === overlay2) return;
    if (element.contains(timer)) {
      [...element.children].forEach(hideRecursively);
    } else {
      element.classList.add("focus-hidden");
    }
  }
  hideRecursively(document.body);
}
function restoreUI() {
  document.querySelectorAll(".focus-hidden").forEach((el) => {
    el.classList.remove("focus-hidden");
  });
}
document.getElementById("touchOverlay").addEventListener("touchstart", (e) => {
  const touchTarget = e.target;
  if (touchTarget && touchTarget.closest && (touchTarget.closest("input") || touchTarget.closest("#typing-container"))) {
    return;
  }
  e.preventDefault();
  if (e.repeat || timerSettObj.timerFlag) return;
  if (timerDOMObj.scrDisplayFlag) {
    document.querySelector(".panel-cube2").style.display = "none";
    document.getElementById("scramble-button").style.justifySelf = "center";
    document.getElementById("scramble-button").innerHTML = "Scramble visualizer";
    timerDOMObj.scrDisplayFlag = false;
    return;
  }
  if (timerObj.timerPhase === 0 && timerSettObj.inspectionType === "None") {
    timerObj.timerPhase = 1;
  }
  timerPhases(delayFlagType);
  if (timerObj.timerPhase === 1 && !timerObj.inspecting && timerSettObj.inspectionType !== "None") {
    inspection(timerSettObj.inspectionType);
  }
  if (timerObj.timerPhase === 3) {
    stopTimer();
    const block = averageOfN(document.getElementById("timer").innerHTML, currentScramble, timerObj.inspection, timerSettObj.inspectionType);
    if (block) {
      addAverageBlock(block);
    }
    renderHistory();
    displayScramble(eventObj.event, vis);
    restoreUI();
  }
});
document.getElementById("touchOverlay").addEventListener("touchend", (e) => {
  const touchTarget = e.target;
  if (touchTarget && touchTarget.closest && (touchTarget.closest("input") || touchTarget.closest("#typing-container"))) {
    return;
  }
  e.preventDefault();
  if (e.repeat) return;
  if (timerObj.timerPhase === 1) {
    wcaDelayFlag();
  }
  if (timerObj.timerPhase === 2) {
    startTimer();
    showOnlyTimerSafe();
  }
});
document.getElementById("touchOverlay").addEventListener("touchstart", () => {
  if (!timerSettObj.timerFlag) return;
  if (eventObj.event === "333fm") return;
  inspection2();
});
document.getElementById("inspection-btn").addEventListener("click", () => {
  if (!timerSettObj.timerFlag) return;
  if (eventObj.event === "333fm") return;
  inspection2();
});
document.addEventListener("keydown", (e) => {
  if (!timerSettObj.timerFlag) return;
  if (e.code !== "Space" || e.repeat) return;
  if (eventObj.event === "333fm") return;
  inspection2();
});
function isTyping() {
  const el = document.activeElement;
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable;
}
document.addEventListener("keydown", (e) => {
  if (e.key === " ") {
    if (e.repeat || timerSettObj.timerFlag || isTyping()) return;
    e.preventDefault();
    if (timerObj.timerPhase === 0 && timerSettObj.inspectionType === "None") {
      timerObj.timerPhase = 1;
    }
    timerPhases(delayFlagType);
  }
  if (e.key === " " && timerObj.timerPhase === 1 && !timerObj.inspecting && timerSettObj.inspectionType !== "None") {
    inspection(timerSettObj.inspectionType);
  }
  if (e.key === " " && timerObj.timerPhase === 3) {
    stopTimer();
    const block = averageOfN(document.getElementById("timer").innerHTML, currentScramble, timerObj.inspection, timerSettObj.inspectionType);
    if (block) {
      addAverageBlock(block);
      console.log(block);
    }
    renderHistory();
    displayScramble(eventObj.event, vis);
    restoreUI();
  }
});
document.addEventListener("keyup", (e) => {
  if (e.key !== " ") return;
  e.preventDefault();
  if (e.repeat) return;
  if (timerObj.timerPhase === 1) {
    wcaDelayFlag();
  }
  if (timerObj.timerPhase === 2) {
    startTimer();
    showOnlyTimerSafe();
  }
});
function bindVisibilityToggle(selectId, targetClass) {
  const select = document.getElementById(selectId);
  const targets = document.querySelectorAll(`.${targetClass}`);
  if (!select || targets.length === 0) return;
  const storageKey = `visibility-${selectId}`;
  const savedValue = localStorage.getItem(storageKey);
  if (savedValue) {
    select.value = savedValue;
  }
  function apply() {
    const isShown = select.value === "show";
    targets.forEach((el) => {
      el.style.display = isShown ? "" : "none";
    });
    localStorage.setItem(storageKey, select.value);
  }
  select.addEventListener("change", apply);
  apply();
}
bindVisibilityToggle("toggle-scramble-visualizer", "panel-cube");
bindVisibilityToggle("toggle-statistics", "right-sidebar");
bindVisibilityToggle("toggle-session-history", "left-sidebar");
bindVisibilityToggle("toggle-scramble-text", "scramble-container");
bindVisibilityToggle("toggle-penalty-bar", "penalty-bar");
bindVisibilityToggle("toggle-average-preview", "main-footer");
const overlay = document.getElementById("settingsOverlay");
const openBtn = document.getElementById("settingsBtn");
const closeBtn = document.getElementById("closeSettings");
openBtn.addEventListener("click", () => {
  overlay.classList.add("open");
});
closeBtn.addEventListener("click", () => {
  overlay.classList.remove("open");
});
