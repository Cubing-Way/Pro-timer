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
      bestTime: null,
      mean: null,
      sigma: 0,
      bestAvg: null,
      solveCounter
    };
  }

  const bestAvg = ao5Arr.length ? Math.min(...ao5Arr) : null;
  const bestTime = Math.min(...allSolvesArr);
  const mean = allSolvesArr.reduce((a, b) => a + b, 0) / allSolvesArr.length;
  const variance = allSolvesArr.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / allSolvesArr.length;
  const sigma = Math.sqrt(variance);

  return { bestTime, mean, sigma, bestAvg, solveCounter };
}

// ===============================
// FILTER BY DATE
// ===============================

function getRangeTimestamps(range) {
  const now = Date.now();
  const offset = getUserOffsetMs(now);
  const localNow = new Date(now - offset);

  let start = null;
  let end = now;

  switch (range) {
    case "day": {
      localNow.setUTCHours(0, 0, 0, 0);
      start = localNow.getTime() + offset;
      break;
    }

    case "week": {
      const day = localNow.getUTCDay(); // 0 = Sunday
      localNow.setUTCDate(localNow.getUTCDate() - day);
      localNow.setUTCHours(0, 0, 0, 0);
      start = localNow.getTime() + offset;
      break;
    }

    case "month": {
      localNow.setUTCDate(1);
      localNow.setUTCHours(0, 0, 0, 0);
      start = localNow.getTime() + offset;
      break;
    }

    case "semester": {
      const month = localNow.getUTCMonth();
      const semesterStartMonth = month < 6 ? 0 : 6;
      localNow.setUTCMonth(semesterStartMonth, 1);
      localNow.setUTCHours(0, 0, 0, 0);
      start = localNow.getTime() + offset;
      break;
    }

    case "year": {
      localNow.setUTCMonth(0, 1);
      localNow.setUTCHours(0, 0, 0, 0);
      start = localNow.getTime() + offset;
      break;
    }

    case "all":
    default:
      start = null;
  }

  return { start, end };
}

function filterSolvesByRange(solves, range) {
  const { start, end } = getRangeTimestamps(range);

  if (!start) return solves;

  return solves.filter(s => s.createdAt >= start && s.createdAt <= end);
}

function filterAveragesByRange(session, range) {
  const { start, end } = getRangeTimestamps(range);

  if (!start) return session.averages;

  return session.averages.filter(avg => {
    const lastSolve = avg.solves[avg.solves.length - 1];
    if (!lastSolve || !lastSolve.createdAt) return false;

    return lastSolve.createdAt >= start && lastSolve.createdAt <= end;
  });
}

document.getElementById("date-filter").addEventListener("change", () => {
  renderStatsPage();
});
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

  stats.bestAvg = ao5Arr.length ? Math.min(...ao5Arr) : null;

  return stats;
}

import Chart from "chart.js/auto";

function getGraphData(session) {
  const solves = getAllSolvesFromSession(session);

  const labels = [];
  const times = [];

  solves.forEach((solve, i) => {
    labels.push(i + 1);

    if (solve.penalty === "DNF") {
      times.push(null);
    } else if (solve.penalty === "+2") {
      times.push(solve.time + 2);
    } else {
      times.push(solve.time);
    }
  });

  return { labels, times };
}


function getAverageGraphData(session) {
  const labels = [];
  const averages = [];

  session.averages.forEach((avg, i) => {
    labels.push(i + 1);

    if (avg.average === "DNF") {
      averages.push(null);
    } else {
      averages.push(parseTimeToSeconds(avg.average));
    }
  });

  return { labels, averages };
}

function getPreviousRange(range) {
  const now = Date.now();
  const { start, end } = getRangeTimestamps(range);

  if (!start) return { start: null, end: null };

  const duration = end - start;

  return {
    start: start - duration,
    end: start
  };
}

function filterSolvesCustomRange(solves, start, end) {
  if (!start) return solves;
  return solves.filter(s => s.createdAt >= start && s.createdAt <= end);
}
// ===============================
// RENDER PAGE (UNCHANGED)
// ===============================
function renderStatsPage() {
  const range = document.getElementById("date-filter").value;
  const session = getCurrentSession();

  // 🔥 filtered data
  const allSolves = getAllSolvesFromSession(session);
  const filteredSolves = filterSolvesByRange(allSolves, range);
    // =========================
    // GLOBAL STATS
    // =========================

  const filteredAverages = filterAveragesByRange(session, range);

  const stats = getStatisticsFromSolves(filteredSolves, session);

  // fix best avg based on filtered
  const ao5Arr = filteredAverages
    .filter(a => a.average !== "DNF")
    .map(a => parseTimeToSeconds(a.average));

  stats.bestAvg = ao5Arr.length ? Math.min(...ao5Arr) : null;

  document.getElementById("stat-solves").innerHTML = `<span class="times-color-number">${stats.solveCounter}</span>`;
  document.getElementById("stat-best-time").innerHTML = `<span class="times-color-number">${formatSecondsToTime(stats.bestTime)}</span>`;
  document.getElementById("stat-mean").innerHTML = `<span class="times-color-number">${formatSecondsToTime(stats.mean)}</span>`;
  document.getElementById("stat-sigma").innerHTML = `<span class="times-color-number">${formatSecondsToTime(stats.sigma)}</span>`;
  document.getElementById("stat-best-avg").innerHTML = `<span class="times-color-number">${formatSecondsToTime(stats.bestAvg)}</span>`;

  // =========================
  // TABLE
  // =========================


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
  // CHART
  // =========================

  const existingChart = Chart.getChart("timesChart");
  if (existingChart) {
    existingChart.destroy(); // prevents duplicate charts
  }

  const sessionData = getCurrentSession();
const labels = [];
const times = [];

filteredSolves.forEach((solve, i) => {
  labels.push(i + 1);

  if (solve.penalty === "DNF") {
    times.push(null);
  } else if (solve.penalty === "+2") {
    times.push(solve.time + 2);
  } else {
    times.push(solve.time);
  }
});

  const ctx = document.getElementById("timesChart");

  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Solve Times",
          data: times,
          tension: 0.25,
          spanGaps: true
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        y: {
          title: {
            display: true,
            text: "Time (seconds)"
          }
        },
        x: {
          title: {
            display: true,
            text: "Solve #"
          }
        }
      }
    }
  });
 // =========================
// COMPARISON CHART (AVERAGES AS UNITS)
// =========================

const existingComparison = Chart.getChart("comparisonChart");
if (existingComparison) {
  existingComparison.destroy();
}

// reuse sessionData OR rename
const sessionData2 = getCurrentSession();

// rename destructured variables
const { start, end } = getRangeTimestamps(range);
const prevRange = getPreviousRange(range);

// current vs previous
const currentSolves = filterSolvesCustomRange(allSolves, start, end);
const previousSolves = filterSolvesCustomRange(allSolves, prevRange.start, prevRange.end);

function toTimes(arr) {
  return arr.map(s => {
    if (s.penalty === "DNF") return null;
    if (s.penalty === "+2") return s.time + 2;
    return s.time;
  });
}



// current blocks
const currentBlocks = session.averages.filter(avg => {
  const last = avg.solves[avg.solves.length - 1];
  return last && last.createdAt >= start && last.createdAt <= end;
});

// previous blocks
const previousBlocks = session.averages.filter(avg => {
  const last = avg.solves[avg.solves.length - 1];
  return last && last.createdAt >= prevRange.start && last.createdAt <= prevRange.end;
});

// convert to seconds
function blockToValue(block) {
  if (block.average === "DNF") return null;
  return parseTimeToSeconds(block.average);
}

const currentValues = currentBlocks.map(blockToValue);
const previousValues = previousBlocks.map(blockToValue);

// labels
const maxLen = Math.max(currentValues.length, previousValues.length);
const comparisonLabels = Array.from({ length: maxLen }, (_, i) => `#${i + 1}`);

const comparisonCtx = document.getElementById("comparisonChart");

new Chart(comparisonCtx, {
  type: "bar",
  data: {
labels: comparisonLabels,
datasets: [
  {
    label: "Current",
    data: currentValues
  },
  {
    label: "Previous",
    data: previousValues
  }
],
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: true }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Time (seconds)"
        }
      }
    }
  }
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

