import { getCurrentSession } from "./session.js";
import { averageObj, parseTimeToSeconds, classicStats } from "./average.js";
import { formatSecondsToTime, formatDisplayTime } from "./average.js";

function getUserOffsetMs(ts = Date.now()) {
  const offsetMinutes = new Date(ts).getTimezoneOffset();
  return offsetMinutes * 60 * 1000;
}

function startOfDayLocal(ts = Date.now()) {
  const offset = getUserOffsetMs(ts);

  const d = new Date(ts - offset); // shift to "local-like UTC"
  d.setUTCHours(0, 0, 0, 0);

  return d.getTime() + offset; // shift back
}

function endOfDayLocal(ts = Date.now()) {
  const offset = getUserOffsetMs(ts);

  const d = new Date(ts - offset);
  d.setUTCHours(23, 59, 59, 999);

  return d.getTime() + offset;
}

function daysAgoLocal(n) {
  const now = Date.now();
  const offset = getUserOffsetMs(now);

  const d = new Date(now - offset);
  d.setUTCDate(d.getUTCDate() - n);

  return d.getTime() + offset;
}

// ===============================
// COLLECT SOLVES
// ===============================
function getAllSolvesFromSession(session) {
  const all = [];

  // From finished averages
  session.averages.forEach(avg => {
    if (avg.mode !== "classic") {
      avg.solves.forEach(solve => {
        all.push(solve);
    });
    }
  });

  // From current rolling buffer
  averageObj.solvesArray.forEach(s => all.push(s));

  return all;
}

// ===============================
// PURE STATS ENGINE
// ===============================
function getStatisticsFromSolves(solves, session) {
  let allSolvesArr = [];
  let ao5Arr = [];
  let solveCounter = 0;

  if (averageObj.mode === "classic") {
    ao5Arr.push(classicStats.best.ao5)
  }
  // ao5 array

  session.averages.forEach(avg => {
    if (avg.mode !== "classic") {
      if (avg.average !== "DNF") ao5Arr.push(parseTimeToSeconds(avg.average));
    }
  });

  // process solves
  solves.forEach(solve => {

    if (solve.penalty === null) {
      allSolvesArr.push(solve.time);
      solveCounter++;
    } else if (solve.penalty === "+2") {
      allSolvesArr.push(solve.time + 2);
      solveCounter++;
    } else {
      // DNF
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

// ===============================
// FILTER BY DATE
// ===============================

function filterAveragesByRange(session, range) {
  const now = Date.now();
  let start, end;

  if (range === "today") {
    start = startOfDayLocal(now);
    end = endOfDayLocal(now);
  }

  if (range === "yesterday") {
    const y = daysAgoLocal(1);
    start = startOfDayLocal(y);
    end = endOfDayLocal(y);
  }

  if (range === "last7days") {
    start = daysAgoLocal(6);
    end = now;
  }

  return session.averages.filter(avg => {
    let lastSolve;
    lastSolve = avg.solves[avg.solves.length - 1];
    if (!lastSolve || !lastSolve.createdAt) return false;

    return lastSolve.createdAt >= start && lastSolve.createdAt <= end;
  });
}

function filterSolvesByRange(solves, range) {
  const now = Date.now();
  let start, end;

  if (range === "today") {
    start = startOfDayLocal(now);
    end = endOfDayLocal(now);
  }

  if (range === "yesterday") {
    const y = daysAgoLocal(1);
    start = startOfDayLocal(y);
    end = endOfDayLocal(y);
  }

  if (range === "last7days") {
    start = daysAgoLocal(6);
    end = now;
  }

  return solves.filter(s => s.createdAt >= start && s.createdAt <= end);
}

// ===============================
// PUBLIC API
// ===============================
function getStatistcs() {
  const session = getCurrentSession();
  const allSolves = getAllSolvesFromSession(session);
  return getStatisticsFromSolves(allSolves, session);
}

function getStatisticsByDate(range) {
  const session = getCurrentSession();
  const allSolves = getAllSolvesFromSession(session);
  const filteredSolves = filterSolvesByRange(allSolves, range);

  const stats = getStatisticsFromSolves(filteredSolves, session);

  const filteredAvgs = filterAveragesByRange(session, range);
  const ao5Arr = filteredAvgs
    .filter(a => a.average !== "DNF")
    .map(a => parseTimeToSeconds(a.average));

  stats.bestAvg = ao5Arr.length ? Math.min(...ao5Arr) : 0;

  return stats;
}

// ===============================
// RENDER PAGE (UNCHANGED)
// ===============================
function renderStatsPage() {
  // =========================
  // GLOBAL STATS
  // =========================

  const stats = getStatistcs();

  document.getElementById("stat-solves").innerHTML = `<span class="times-color-number">${stats.solveCounter}</span>`;
  document.getElementById("stat-best-time").innerHTML = `<span class="times-color-number">${formatSecondsToTime(stats.bestTime)}</span>`;
  document.getElementById("stat-mean").innerHTML = `<span class="times-color-number">${formatSecondsToTime(stats.mean)}</span>`;
  document.getElementById("stat-sigma").innerHTML = `<span class="times-color-number">${formatSecondsToTime(stats.sigma)}</span>`;
  document.getElementById("stat-best-avg").innerHTML = `<span class="times-color-number">${formatSecondsToTime(stats.bestAvg)}</span>`;

  // =========================
  // TABLE
  // =========================

  const session = getCurrentSession();
  const thead = document.getElementById("avg-table-head");
  const tbody = document.getElementById("avg-history-body");

  thead.innerHTML = "";
  tbody.innerHTML = "";

  // Find max solves in any block (3 or 5)
  let maxSolves = 0;
  session.averages.forEach(b => {
    if (b.solves.length > maxSolves) maxSolves = b.solves.length;
  });

  // =========================
  // BUILD HEADER
  // =========================

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

  // =========================
  // BUILD ROWS
  // =========================

  session.averages.forEach((block, i) => {
    const tr = document.createElement("tr");

    const isBOMode = block.mode === "bo3" || block.mode === "bo5";

    let rowHtml = `
      <td><span class="times-color-number">${session.averages.length - i}</span></td>
      <td>${block.mode.toUpperCase()}</td>
      <td><span class="times-color-number">${block.average}</span></td>
      <td><strong><span class="times-color-number">${block.best}</span></strong></td>
      <td><span class="times-color-number">${block.worst}</span></td>

    `;

    // Solves
    block.solves.forEach(solve => {
      rowHtml += `<td><span class="times-color-number">${formatDisplayTime(solve)}</span></td>`;
    });

    rowHtml += `<td><span class="times-color-number">${block.sigma}</span></td>`

    tr.innerHTML = rowHtml;
    tbody.appendChild(tr);
  });
}


export { getStatistcs, getStatisticsByDate, renderStatsPage };

