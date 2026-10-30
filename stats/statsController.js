import Chart from "chart.js/auto";
import { getCurrentSession } from "../session/sessionController.js";
import { averageObj, parseTimeToSeconds, classicStats } from "../average/avgController.js";
import { formatSecondsToTime, formatDisplayTime, computeAverage } from "../average/avgController.js";
import {
  getAllSolvesFromSession,
  getStatisticsFromSolves,
  getRangeTimestamps,
  filterSolvesByRange,
  filterAveragesByRange,
  getAveragesInRange,
  getLastRangeWithData,
  getSigmaGraphData,
  getTimeDistribution,
  getDistributionLabels,
  filterEmptyBuckets,
  generateSmartThresholds,
  buildAvgMaps
} from "./statsHelpers.js";

document.getElementById("date-filter").addEventListener("change", () => {
  renderStatsPage();
});

// ===============================
// Stats page
// ===============================

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

// ===============================
// PUBLIC API
// ===============================
function getStatistcs() {
  const session = getCurrentSession();
  const allSolves = getAllSolvesFromSession(session, averageObj);
  return getStatisticsFromSolves(allSolves, session, averageObj, classicStats);
}

function getStatisticsByDate(range) {
  const session = getCurrentSession();
  const allSolves = getAllSolvesFromSession(session, averageObj);
  const filteredSolves = filterSolvesByRange(allSolves, range);

  const stats = getStatisticsFromSolves(filteredSolves, session, averageObj, classicStats);

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

function renderStatsPage() {

  const range = document.getElementById("date-filter").value;
  const session = getCurrentSession();

  // 🔥 filtered data
  const allSolves = getAllSolvesFromSession(session, averageObj);
  const filteredSolves = filterSolvesByRange(allSolves, range);

const thresholds = generateSmartThresholds();


const distribution = getTimeDistribution(filteredSolves, thresholds);
const distributionLabels = getDistributionLabels(thresholds);


    // =========================
    // GLOBAL STATS
    // =========================

  const filteredAverages = filterAveragesByRange(session, range);

  const stats = getStatisticsFromSolves(filteredSolves, session, averageObj, classicStats);

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

  const maps = buildAvgMaps(classicStats);

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
