import { getCurrentSession } from "./session.js";
import { averageObj, parseTimeToSeconds, classicStats } from "./average.js";
import { formatSecondsToTime, formatDisplayTime, computeAverage } from "./average.js";

function getAveragesSource(session) {
  if (averageObj.mode === "classic") {
    return {
      ao5: classicStats.history.ao5,
      mo3: classicStats.history.mo3,
      ao12: classicStats.history.ao12,
      ao100: classicStats.history.ao100
    };
  }

  return null; // normal mode uses session.averages
}

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
    const { start, end } = getRangeTimestamps("day");

    const todayHistory = classicStats.history.ao5.filter(avg =>
      avg.createdAt >= start && avg.createdAt <= end &&
      avg.avg !== "DNF"
    );

    const bestToday = todayHistory.reduce((best, curr) => {
      if (!best || curr.avg < best.avg) return curr;
      return best;
    }, null);

    if (bestToday?.avg != null) {
      ao5Arr.push(bestToday.avg);
    }
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

  const validAvgs = ao5Arr.filter(v => v != null && !isNaN(v));
  const bestAvg = validAvgs.length ? Math.min(...validAvgs) : null;
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

  return session.averages
    .filter(avg => {
      const lastSolve = avg.solves[avg.solves.length - 1];
      if (!lastSolve || !lastSolve.createdAt) return false;

      return lastSolve.createdAt >= start && lastSolve.createdAt <= end;
    })
    .sort((a, b) => {
      const aTime = a.solves[a.solves.length - 1].createdAt;
      const bTime = b.solves[b.solves.length - 1].createdAt;
      return aTime - bTime;
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

if (averageObj.mode === "classic") {
  const { start, end } = getRangeTimestamps(range);

  const best = classicStats.history.ao5
    .filter(a =>
      a.avg !== "DNF" &&
      (!start || (a.createdAt >= start && a.createdAt <= end))
    )
    .reduce((best, curr) =>
      !best || curr.avg < best.avg ? curr : best,
    null);

  stats.bestAvg = best?.avg ?? null;

} else {
  const filteredAvgs = filterAveragesByRange(session, range);

  const ao5Arr = filteredAvgs
    .filter(a => a.average !== "DNF")
    .map(a => parseTimeToSeconds(a.average));

  stats.bestAvg = ao5Arr.length ? Math.min(...ao5Arr) : null;
}

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

  if (averageObj.mode === "classic") {
    const history = classicStats.history.ao5;

    history.forEach((avg, i) => {
      labels.push(i + 1);

      if (avg.avg === "DNF") {
        averages.push(null);
      } else {
        averages.push(avg.avg);
      }
    });

  } else {
    session.averages.forEach((avg, i) => {
      labels.push(i + 1);

      if (avg.average === "DNF") {
        averages.push(null);
      } else {
        averages.push(parseTimeToSeconds(avg.average));
      }
    });
  }

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

function getAveragesInRange(session, start, end) {
  return session.averages
    .filter(avg => {
      const lastSolve = avg.solves[avg.solves.length - 1];
      if (!lastSolve || !lastSolve.createdAt) return false;

      return (!start || lastSolve.createdAt >= start) &&
             (!end || lastSolve.createdAt <= end);
    })
    .map(avg => {
      if (avg.average === "DNF") return null;
      return parseTimeToSeconds(avg.average);
    });
}

function getLastRangeWithData(session, range, maxLookback = 10) {
  let { start, end } = getRangeTimestamps(range);

  if (!start) return { start: null, end: null };

  const duration = end - start;

  for (let i = 1; i <= maxLookback; i++) {
    const testStart = start - duration * i;
    const testEnd = start - duration * (i - 1);

    const hasData = session.averages.some(avg => {
      if (!avg.solves || avg.solves.length === 0) return false;

      const lastSolve = avg.solves[avg.solves.length - 1];
      if (!lastSolve.createdAt) return false;

      return lastSolve.createdAt >= testStart &&
             lastSolve.createdAt <= testEnd;
    });

    if (hasData) {
      return { start: testStart, end: testEnd };
    }
  }

  return { start: null, end: null }; // nothing found
}

function getSigmaGraphData(averagesArr) {
  const labels = [];
  const sigmas = [];

  averagesArr.forEach((block, i) => {
    labels.push(i + 1);

    if (!block || block.average === "DNF") {
      sigmas.push(null);
    } else {
      sigmas.push(block.sigma ?? null);
    }
  });

  return { labels, sigmas };
}

function getSubXDistribution(solves, threshold) {
  let subX = 0;
  let aboveX = 0;

  solves.forEach(solve => {
    let time = null;

    if (solve.penalty === "DNF") return; // ignore DNFs
    if (solve.penalty === "+2") time = solve.time + 2;
    else time = solve.time;

    if (time <= threshold) subX++;
    else aboveX++;
  });

  return { subX, aboveX };
}


function getTimeDistribution(solves, thresholds) {
  // Example thresholds: [10, 12, 14]

  const buckets = new Array(thresholds.length + 1).fill(0);

  solves.forEach(solve => {
    let time = null;

    if (solve.penalty === "DNF") return;
    if (solve.penalty === "+2") time = solve.time + 2;
    else time = solve.time;

    // find correct bucket
    let placed = false;

    for (let i = 0; i < thresholds.length; i++) {
      if (time <= thresholds[i]) {
        buckets[i]++;
        placed = true;
        break;
      }
    }

    if (!placed) {
      buckets[buckets.length - 1]++; // last bucket (above all)
    }
  });

  return buckets;
}

function getDistributionLabels(thresholds) {
  const labels = [];

  for (let i = 0; i < thresholds.length; i++) {
    const current = formatSecondsToTime(thresholds[i]);

    if (i === 0) {
      labels.push(`Sub ${current}`);
    } else {
      const prev = formatSecondsToTime(thresholds[i - 1]);
      labels.push(`Sub ${current}`);
    }
  }

  labels.push(`> ${formatSecondsToTime(thresholds[thresholds.length - 1])}`);

  return labels;
}

function filterEmptyBuckets(labels, data) {
  const filteredLabels = [];
  const filteredData = [];

  labels.forEach((label, i) => {
    if (data[i] > 0) {
      filteredLabels.push(label);
      filteredData.push(data[i]);
    }
  });

  return { labels: filteredLabels, data: filteredData };
}

function normalizeThresholds(thresholds) {
  return thresholds
    .map(t => {
      if (typeof t === "string") {
        return parseTimeToSeconds(t); // "1:30" → 90
      }
      return t; // already number
    })
    .filter(t => !isNaN(t))
    .sort((a, b) => a - b); // VERY IMPORTANT for buckets
}

function generateSmartThresholds() {
  const thresholds = [];

  function addRange(start, end, step) {
    for (let t = start + step; t <= end; t += step) {
      thresholds.push(t);
    }
  }

  // seconds
  addRange(0, 10, 0.5);        // 0–10s → 0.5s steps
  addRange(10, 20, 1);         // 10–20s → 1s steps
  addRange(20, 60, 5);         // 20–60s → 5s steps

  // minutes (in seconds)
  addRange(60, 120, 10);       // 1–2min → 10s steps
  addRange(120, 300, 30);      // 2–5min → 30s steps
  addRange(300, 600, 60);      // 5–10min → 1min steps
  addRange(600, 1800, 300);    // 10–30min → 5min steps
  addRange(1800, 3600, 600);   // 30–60min → 10min steps

  // hours (in seconds)
  addRange(3600, 18000, 1800); // 1–5h → 30min steps
  addRange(18000, 36000, 3600);// 5–10h → 1h steps

  return thresholds;
}

function buildAvgMaps() {
  const maps = {
    mo3: new Map(),
    ao5: new Map(),
    ao12: new Map(),
    ao100: new Map()
  };

  Object.keys(maps).forEach(key => {
    classicStats.history[key].forEach(avg => {
      maps[key].set(avg.createdAt, avg);
    });
  });

  return maps;
}

function renderStatsPage() {

  const range = document.getElementById("date-filter").value;
  const session = getCurrentSession();

  // 🔥 filtered data
  const allSolves = getAllSolvesFromSession(session);
  const filteredSolves = filterSolvesByRange(allSolves, range);

const thresholds = generateSmartThresholds();


const distribution = getTimeDistribution(filteredSolves, thresholds);
const distributionLabels = getDistributionLabels(thresholds);


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

const sortedSolves = [...filteredSolves].sort(
  (a, b) => a.createdAt - b.createdAt
);

sortedSolves.forEach((solve, i) => {
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
const prevRange = getLastRangeWithData(sessionData2, range);

let currentAvgs = [];
let previousAvgs = [];

if (averageObj.mode === "classic") {
  const history = classicStats.history.ao5;

  currentAvgs = history
    .filter(a => !start || (a.createdAt >= start && a.createdAt <= end))
    .map(a => a.avg === "DNF" ? null : a.avg);

  previousAvgs = history
    .filter(a => !prevRange.start || (
      a.createdAt >= prevRange.start &&
      a.createdAt <= prevRange.end
    ))
    .map(a => a.avg === "DNF" ? null : a.avg);

} else {
  currentAvgs = getAveragesInRange(sessionData2, start, end);
  previousAvgs = getAveragesInRange(sessionData2, prevRange.start, prevRange.end);
}

const minLen = Math.min(currentAvgs.length, previousAvgs.length);

const currentData = currentAvgs.slice(-minLen);
const previousData = previousAvgs.slice(-minLen);

const comparisonLabels = Array.from(
  { length: minLen },
  (_, i) => `Block ${sortedSolves.length - i}`
);

const comparisonCtx = document.getElementById("comparisonChart");
console.log("Current range:", start, end);
console.log("Previous range:", prevRange);

console.log("Current avgs:", currentAvgs);
console.log("Previous avgs:", previousAvgs);
new Chart(comparisonCtx, {
  type: "bar",
  data: {
    labels: comparisonLabels, // ✅ use new name
    datasets: [
      {
        label: "Current Range (Avg Blocks)",
        data: currentAvgs
      },
      {
        label: "Previous Range (Avg Blocks)",
        data: previousAvgs
      }
    ]
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
        text: "Average (seconds)"
      }
    }
    }
  }
});

let sigmaLabels = [];
let sigmas = [];

if (averageObj.mode === "classic") {
  const { start, end } = getRangeTimestamps(range);

  const filteredHistory = classicStats.history.ao5.filter(a =>
    !start || (a.createdAt >= start && a.createdAt <= end)
  );

  sigmaLabels = filteredHistory.map((_, i) => i + 1);
  sigmas = filteredHistory.map(a => a.sigma ?? null);

} else {
  const sigmaData = getSigmaGraphData(filteredAverages);
  sigmaLabels = sigmaData.labels;
  sigmas = sigmaData.sigmas;
}

const existingSigma = Chart.getChart("sigmaChart");
if (existingSigma) {
  existingSigma.destroy();
}

const sigmaCtx = document.getElementById("sigmaChart");

new Chart(sigmaCtx, {
  type: "line",
  data: {
    labels: sigmaLabels,
    datasets: [
      {
        label: "Consistency (σ)",
        data: sigmas,
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
          text: "Standard Deviation (seconds)"
        }
      },
      x: {
        title: {
          display: true,
          text: "Average Block #"
        }
      }
    }
  }
});

const existingSubX = Chart.getChart("subXChart");
if (existingSubX) {
  existingSubX.destroy();
}

const subXCtx = document.getElementById("subXChart");

const existingDist = Chart.getChart("distributionChart");
if (existingDist) {
  existingDist.destroy();
}

const distCtx = document.getElementById("distributionChart");

const { labels: finalLabels, data: finalData } =
  filterEmptyBuckets(distributionLabels, distribution);

new Chart(distCtx, {
  type: "pie",
  data: {
    labels: finalLabels,
    datasets: [
      {
        data: finalData
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = distribution.reduce((a, b) => a + b, 0);
            const value = context.raw;
            const percent = total
              ? ((value / total) * 100).toFixed(1)
              : 0;

            return `${context.label}: ${value} (${percent}%)`;
          }
        }
      }
    }
  }
});
  // =========================
  // BUILD HEADER
  // =========================

// =========================
// BUILD HEADER
// =========================

if (averageObj.mode === "classic") {

  thead.innerHTML = `
    <tr>
      <th>#</th>
      <th>Solve</th>
      <th>mo3</th>
      <th>ao5</th>
      <th>ao12</th>
      <th>ao100</th>
    </tr>
  `;

} else {

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

  headHtml += `<th>σ</th></tr>`;

  thead.innerHTML = headHtml;
}

  // =========================
  // BUILD ROWS
  // =========================

// =========================
// BUILD ROWS
// =========================
if (averageObj.mode === "classic") {

  const maps = buildAvgMaps();

const sortedSolves = [...filteredSolves].sort(
  (a, b) => b.createdAt - a.createdAt
);

  sortedSolves.forEach((solve, i) => {
    const tr = document.createElement("tr");

    const solveTime = formatDisplayTime(solve);

    function getVal(map) {
      const avg = map.get(solve.createdAt);
      if (!avg) return "-";
      if (avg.avg === "DNF") return "DNF";
      return formatSecondsToTime(avg.avg);
    }

    const mo3 = getVal(maps.mo3);
    const ao5 = getVal(maps.ao5);
    const ao12 = getVal(maps.ao12);
    const ao100 = getVal(maps.ao100);

    tr.innerHTML = `
      <td><span class="times-color-number">${i + 1}</span></td>
      <td><span class="times-color-number">${solveTime}</span></td>
      <td><span class="times-color-number">${mo3}</span></td>
      <td><span class="times-color-number">${ao5}</span></td>
      <td><span class="times-color-number">${ao12}</span></td>
      <td><span class="times-color-number">${ao100}</span></td>
    `;

    tbody.appendChild(tr);
  });

} else {

  session.averages.forEach((block, i) => {
    const tr = document.createElement("tr");

    let rowHtml = `
      <td><span class="times-color-number">${session.averages.length - i}</span></td>
      <td>${block.mode.toUpperCase()}</td>
      <td><span class="times-color-number">${block.average}</span></td>
      <td><strong><span class="times-color-number">${block.best}</span></strong></td>
      <td><span class="times-color-number">${block.worst}</span></td>
    `;

    block.solves.forEach(solve => {
      rowHtml += `<td><span class="times-color-number">${formatDisplayTime(solve)}</span></td>`;
    });

    rowHtml += `<td><span class="times-color-number">${block.sigma}</span></td>`;

    tr.innerHTML = rowHtml;
    tbody.appendChild(tr);
  });

}
}


export { getStatistcs, getStatisticsByDate, renderStatsPage };
