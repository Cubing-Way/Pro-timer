import { getCurrentSession } from "./session.js";
import { averageObj, parseTimeToSeconds } from "./average.js";
import { formatSecondsToTime, formatDisplayTime } from "./average.js";

const BRAZIL_OFFSET_MINUTES = -180; // UTC-3
const BRAZIL_OFFSET_MS = BRAZIL_OFFSET_MINUTES * 60 * 1000;

function startOfDayBrazil(ts = Date.now()) {
  // shift to Brazil time
  const d = new Date(ts + BRAZIL_OFFSET_MS);
  d.setUTCHours(0, 0, 0, 0);
  // shift back to UTC
  return d.getTime() - BRAZIL_OFFSET_MS;
}

function endOfDayBrazil(ts = Date.now()) {
  const d = new Date(ts + BRAZIL_OFFSET_MS);
  d.setUTCHours(23, 59, 59, 999);
  return d.getTime() - BRAZIL_OFFSET_MS;
}

function daysAgoBrazil(n) {
  const d = new Date(Date.now() + BRAZIL_OFFSET_MS);
  d.setUTCDate(d.getUTCDate() - n);
  return d.getTime() - BRAZIL_OFFSET_MS;
}



// ===============================
// COLLECT SOLVES
// ===============================
function getAllSolvesFromSession(session) {
  const all = [];

  // From finished averages
  session.averages.forEach(avg => {
    avg.solves.forEach(solve => {
      all.push(solve);
    });
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

  // ao5 array
  session.averages.forEach(avg => {
    if (avg.average !== "DNF") ao5Arr.push(parseTimeToSeconds(avg.average));
  });

  // process solves
  solves.forEach(solve => {
    console.log(new Date(solve.createdAt))

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
function filterSolvesByRange(solves, range) {
  const now = Date.now();
  let start, end;

  if (range === "today") {
    start = startOfDayBrazil(now);
    end = endOfDayBrazil(now);
  }

  if (range === "yesterday") {
    const y = daysAgoBrazil(1);
    start = startOfDayBrazil(y);
    end = endOfDayBrazil(y);
  }

  if (range === "last7days") {
    start = daysAgoBrazil(6);
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
  const filtered = filterSolvesByRange(allSolves, range);
  return getStatisticsFromSolves(filtered, session);
}

// ===============================
// RENDER PAGE (UNCHANGED)
// ===============================
function renderStatsPage() {
  // =========================
  // GLOBAL STATS
  // =========================

  const stats = getStatistcs();

  document.getElementById("stat-solves").textContent = stats.solveCounter;
  document.getElementById("stat-best-time").textContent = formatSecondsToTime(stats.bestTime);
  document.getElementById("stat-mean").textContent = formatSecondsToTime(stats.mean);
  document.getElementById("stat-sigma").textContent = formatSecondsToTime(stats.sigma);
  document.getElementById("stat-best-avg").textContent = formatSecondsToTime(stats.bestAvg);

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

  let headHtml = `<tr><th>#</th><th>Type</th><th>Avg</th>`;

  for (let i = 0; i < maxSolves; i++) {
    headHtml += `<th>${i + 1}</th>`;
  }

  headHtml += `
    <th>Best</th>
    <th>Worst</th>
    <th>σ</th>
  </tr>`;

  thead.innerHTML = headHtml;

  // =========================
  // BUILD ROWS
  // =========================

  session.averages.forEach((block, i) => {
    const tr = document.createElement("tr");

    let rowHtml = `
      <td>${session.averages.length - i}</td>
      <td>${block.mode.toUpperCase()}</td>
      <td><strong>${block.average}</strong></td>
    `;

    // Solves
    block.solves.forEach(solve => {
      rowHtml += `<td>${formatDisplayTime(solve)}</td>`;
    });

    // Fill empty columns (for mo3)
    const missing = maxSolves - block.solves.length;
    for (let i = 0; i < missing; i++) {
      rowHtml += `<td></td>`;
    }

    // Summary columns
    rowHtml += `
      <td>${block.best}</td>
      <td>${block.worst}</td>
      <td>${block.sigma}</td>
    `;

    tr.innerHTML = rowHtml;
    tbody.appendChild(tr);
  });
}


export { getStatistcs, getStatisticsByDate, renderStatsPage };

