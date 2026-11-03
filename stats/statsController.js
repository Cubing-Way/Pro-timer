import Chart from "chart.js/auto";
import { getCurrentSession } from "../session/sessionController.js";
import { averageObj, parseTimeToSeconds, classicStats } from "../average/avgController.js";
import { formatSecondsToTime, formatDisplayTime } from "../average/avgController.js";
import {
  pickBest,
  getAllSolvesFromSession,
  getStatisticsFromSolves,
  getRangeTimestamps,
  filterSolvesByRange,
  getNarrowestRangeWithSolves,
  filterAveragesByRange,
  getAveragesInRange,
  getLastRangeWithData,
  getSigmaGraphData,
  getTimeDistribution,
  getDistributionLabels,
  filterEmptyBuckets,
  generateSmartThresholds,
  buildAvgMaps,
  getReviewedSolves,
  getMetricsMethods,
  getMetricsAverages,
  getMetricsSeries,
  getStepAverages
} from "./statsHelpers.js";
import { escapeHtml, methodName, percent, signed, fixed } from "../metrics/metricsView.js";
import { findSolve, getBatchableSolves, onBatchChange, startBatch, stopBatch, getBatch, getBatchResult } from "../metrics/metricsController.js";

// Chart.js's first two colors, set by hand because a chart with any color of its own gets no default ones
const SERIES_COLORS = ["#36A2EB", "#FF6384"];
// The engine's color on every Cubisz chart, so it reads as the same thing on each
const ENGINE_COLOR = "#868C96";

// A new period redraws the page
document.getElementById("date-filter").addEventListener("change", () => {
  renderStatsPage();
});

// Another method redraws only the Cubisz section
document.getElementById("metrics-method-filter").addEventListener("change", () => {
  renderMetricsStats();
});

// The batch button starts a batch of the session's saved solutions, or stops the one under way
document.getElementById("metrics-batch-btn").addEventListener("click", () => {
  if (getBatch()) stopBatch();
  else startBatch(getSessionBatchableSolves());
});

// A batch redraws its line on every change, and the whole section when a solve's metrics arrive
onBatchChange((key) => {
  if (!statsPage.classList.contains("open")) return;
  if (key && findSolve(key)?.metrics) renderMetricsStats();
  else renderMetricsBatch();
});

// Open and close the statistics page (it's redrawn every time it opens)

const statsPage = document.getElementById("stats-page");
const openStatsBtn = document.getElementById("open-stats-btn");
const closeStatsBtn = document.getElementById("close-stats-btn");

openStatsBtn.addEventListener("click", () => {
  // Every solve of the current session, to find which periods have any
  const allSolves = getAllSolvesFromSession(getCurrentSession(), averageObj);
  // Open on the smallest period with solves (setting .value doesn't fire "change", so it's drawn once)
  document.getElementById("date-filter").value = getNarrowestRangeWithSolves(allSolves);
  renderStatsPage();
  statsPage.classList.add("open");
});

closeStatsBtn.addEventListener("click", () => {
  statsPage.classList.remove("open");
});

// Stats for the right sidebar (render/renderController.js)
// All-time stats of the current session: { bestTime, mean, sigma, bestAvg, solveCounter }
function getStatistics() {
  const session = getCurrentSession();
  const allSolves = getAllSolvesFromSession(session, averageObj);
  return getStatisticsFromSolves(allSolves, session, averageObj, classicStats);
}

// The same stats for the solves of the current day, week, month, semester or year
function getStatisticsByDate(range) {
  const session = getCurrentSession();
  const allSolves = getAllSolvesFromSession(session, averageObj);
  const filteredSolves = filterSolvesByRange(allSolves, range);

  const stats = getStatisticsFromSolves(filteredSolves, session, averageObj, classicStats);

// Classic mode: the best rolling ao5 that ends in the range
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
  // Block modes: the best finished average in the range
  const filteredAvgs = filterAveragesByRange(session, range);

  const ao5Arr = filteredAvgs
    .filter(a => a.average !== "DNF")
    .map(a => parseTimeToSeconds(a.average));

  stats.bestAvg = ao5Arr.length ? pickBest(ao5Arr, filteredSolves) : null;
}

  return stats;
}

// Fills the statistics page for the chosen period: overview cards, the 4 charts and the averages table
function renderStatsPage() {

  const range = document.getElementById("date-filter").value;
  const session = getCurrentSession();

  // Solves in the chosen period
  const allSolves = getAllSolvesFromSession(session, averageObj);
  const filteredSolves = filterSolvesByRange(allSolves, range);

// Buckets for the distribution chart
const thresholds = generateSmartThresholds();


const distribution = getTimeDistribution(filteredSolves, thresholds);
const distributionLabels = getDistributionLabels(thresholds);


    // Overview cards

  const filteredAverages = filterAveragesByRange(session, range);

  const stats = getStatisticsFromSolves(filteredSolves, session, averageObj, classicStats);

  // Best average among the ones finished in the period (getStatisticsFromSolves counts every average)
  const ao5Arr = filteredAverages
    .filter(a => a.average !== "DNF")
    .map(a => parseTimeToSeconds(a.average));

  stats.bestAvg = ao5Arr.length ? pickBest(ao5Arr, filteredSolves) : null;

  // Fill the five cards
  document.getElementById("stat-solves").innerHTML = `<span class="times-color-number">${stats.solveCounter}</span>`;
  document.getElementById("stat-best-time").innerHTML = `<span class="times-color-number">${formatSecondsToTime(stats.bestTime)}</span>`;
  document.getElementById("stat-mean").innerHTML = `<span class="times-color-number">${formatSecondsToTime(stats.mean)}</span>`;
  document.getElementById("stat-sigma").innerHTML = `<span class="times-color-number">${formatSecondsToTime(stats.sigma)}</span>`;
  document.getElementById("stat-best-avg").innerHTML = `<span class="times-color-number">${formatSecondsToTime(stats.bestAvg)}</span>`;

  // Averages table: emptied here, filled at the end


  const thead = document.getElementById("avg-table-head");
  const tbody = document.getElementById("avg-history-body");

  thead.innerHTML = "";
  tbody.innerHTML = "";

  // The table's averages: the ones finished in the chosen period, newest first like the rest of the app
  const inPeriod = new Set(filteredAverages);
  const tableAverages = session.averages.filter(block => inPeriod.has(block));

  // Find max solves in any block (3 or 5)
  let maxSolves = 0;
  tableAverages.forEach(b => {
    if (b.solves.length > maxSolves) maxSolves = b.solves.length;

 
  });


  // Times chart: every solve of the period, oldest first, with gaps for DNFs

  const existingChart = Chart.getChart("timesChart");
  if (existingChart) {
    existingChart.destroy(); // prevents duplicate charts
  }

const labels = [];
const times = [];

const sortedSolves = [...filteredSolves].sort(
  (a, b) => a.createdAt - b.createdAt
);

sortedSolves.forEach((solve, i) => {
  labels.push(i + 1);

  if (solve.penalty === "DNF") {
    times.push(null);
  } else if (typeof solve.penalty === "number") {
    times.push(solve.time + solve.penalty);
  } else {
    times.push(solve.time);
  }
});

  // Line chart of the times
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
// Comparison chart: this period's averages next to the closest earlier period that has averages

const existingComparison = Chart.getChart("comparisonChart");
if (existingComparison) {
  existingComparison.destroy();
}

// The current session (the same one as session above)
const sessionData2 = getCurrentSession();

// This period, and the closest earlier one with averages
const { start, end } = getRangeTimestamps(range);
const prevRange = getLastRangeWithData(sessionData2, range);

let currentAvgs = [];
let previousAvgs = [];

// Classic mode: the rolling ao5s of each period
if (averageObj.mode === "classic") {
  const history = classicStats.history.ao5;

  currentAvgs = history
    .filter(a => !start || (a.createdAt >= start && a.createdAt <= end))
    .map(a => a.avg === "DNF" ? null : a.avg);

  // No earlier range with data (or "All Time"): nothing to compare against
  previousAvgs = !prevRange.start ? [] : history
    .filter(a =>
      a.createdAt >= prevRange.start &&
      a.createdAt <= prevRange.end
    )
    .map(a => a.avg === "DNF" ? null : a.avg);

} else {
  // Block modes: the finished averages of each period
  currentAvgs = getAveragesInRange(sessionData2, start, end);
  // Null bounds would mean "every average", so no earlier range gives no previous data
  previousAvgs = !prevRange.start ? [] : getAveragesInRange(sessionData2, prevRange.start, prevRange.end);
}

// Compare the last blocks of both ranges; with no previous range, show all the current blocks
const compareLen = previousAvgs.length ? Math.min(currentAvgs.length, previousAvgs.length) : currentAvgs.length;

// slice(-0) would return everything, so an empty comparison is handled apart
const currentData = compareLen ? currentAvgs.slice(-compareLen) : [];
const previousData = compareLen ? previousAvgs.slice(-compareLen) : [];

// One label per compared pair of blocks
const comparisonLabels = Array.from(
  { length: compareLen },
  (_, i) => `Block ${i + 1}`
);

// Bar chart, one pair of bars per block
const comparisonCtx = document.getElementById("comparisonChart");

new Chart(comparisonCtx, {
  type: "bar",
  data: {
    labels: comparisonLabels, // "Block 1", "Block 2"…
    datasets: [
      {
        label: "Current Range (Avg Blocks)",
        data: currentData
      },
      {
        label: "Previous Range (Avg Blocks)",
        data: previousData
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

// σ chart: σ of each average in the period
let sigmaLabels = [];
let sigmas = [];

// Classic mode: σ of each rolling ao5
if (averageObj.mode === "classic") {
  const { start, end } = getRangeTimestamps(range);

  const filteredHistory = classicStats.history.ao5.filter(a =>
    !start || (a.createdAt >= start && a.createdAt <= end)
  );

  sigmaLabels = filteredHistory.map((_, i) => i + 1);
  sigmas = filteredHistory.map(a => a.sigma ?? null);

} else {
  // Block modes: σ of each finished average
  const sigmaData = getSigmaGraphData(filteredAverages);
  sigmaLabels = sigmaData.labels;
  sigmas = sigmaData.sigmas;
}

// Chart.js allows one chart per canvas, so the old one goes first
const existingSigma = Chart.getChart("sigmaChart");
if (existingSigma) {
  existingSigma.destroy();
}

// Line chart of the σ values
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

// Distribution chart: how many solves fall under each time
const existingDist = Chart.getChart("distributionChart");
if (existingDist) {
  existingDist.destroy();
}

const distCtx = document.getElementById("distributionChart");

// Only the buckets that have solves
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
          // Tooltip: count and percent of the period's solves
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

// Table header: solve and rolling averages in classic mode; type, result, best, worst, each solve and σ otherwise

// Classic mode header
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

  // Block modes header: one column per solve of the longest average
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


// Table rows
// Classic mode: one row per solve of the period, newest first, with the rolling averages that end at it
if (averageObj.mode === "classic") {

  // Rolling averages keyed by the time of their last solve
  const maps = buildAvgMaps(classicStats);

const sortedSolves = [...filteredSolves].sort(
  (a, b) => b.createdAt - a.createdAt
);

  sortedSolves.forEach((solve, i) => {
    const tr = document.createElement("tr");

    const solveTime = formatDisplayTime(solve);

    // The average in a map that ends at this solve, formatted
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

  // Block modes: one row per finished average of the period, newest first
  tableAverages.forEach(block => {
    const tr = document.createElement("tr");

    // Numbered by its place in the whole session (the oldest is #1), like the details pop-up
    let rowHtml = `
      <td><span class="times-color-number">${session.averages.length - session.averages.indexOf(block)}</span></td>
      <td>${block.mode.toUpperCase()}</td>
      <td><span class="times-color-number">${block.average}</span></td>
      <td><strong><span class="times-color-number">${block.best}</span></strong></td>
      <td><span class="times-color-number">${block.worst}</span></td>
    `;

    // One cell per solve
    block.solves.forEach(solve => {
      rowHtml += `<td><span class="times-color-number">${formatDisplayTime(solve)}</span></td>`;
    });

    rowHtml += `<td><span class="times-color-number">${block.sigma}</span></td>`;

    tr.innerHTML = rowHtml;
    tbody.appendChild(tr);
  });

}

// The Cubisz review section, for the same period
renderMetricsStats();
}

// Puts the review methods of the period in the picker and returns the one to show ("" = none)
function fillMethodPicker(methods) {
  const picker = document.getElementById("metrics-method-filter");
  const wanted = picker.value;

  picker.innerHTML = "";

  methods.forEach(name => {
    // Short names, unless two methods would look the same (like the settings panel)
    const clash = methods.filter(other => methodName(other) === methodName(name)).length > 1;
    picker.append(new Option(clash ? name : methodName(name), name));
  });

  // Keep the method already picked if this period has it, or else the most used
  picker.value = methods.includes(wanted) ? wanted : (methods[0] ?? "");
  // The full name, with its note in brackets, shows on hover
  picker.title = picker.value;
  picker.hidden = methods.length === 0;

  return picker.value;
}

// One line of a per-solve chart
function lineDataset(label, data, color) {
  return { label, data, borderColor: color, backgroundColor: color, tension: 0.25, spanGaps: true };
}

// The engine's level as a dashed line across a per-solve chart
function engineLevelDataset(label, value, count) {
  return {
    label,
    data: new Array(count).fill(value),
    borderColor: ENGINE_COLOR,
    // No fill, so the legend's box shows the dashes too
    backgroundColor: "transparent",
    borderDash: [6, 4],
    pointRadius: 0
  };
}

// Draws a chart from its type, data and axis titles (Chart.js allows one chart per canvas, so the old one goes first)
function drawMetricsChart(canvasId, type, labels, datasets, xTitle, yTitle) {
  Chart.getChart(canvasId)?.destroy();

  new Chart(document.getElementById(canvasId), {
    type,
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      },
      scales: {
        y: { title: { display: true, text: yTitle } },
        x: { title: { display: true, text: xTitle } }
      }
    }
  });
}

// One step's row in the section's table: its means next to the engine's, then the net
function stepAverageRowHtml(step) {
  return `
    <tr>
      <td>${escapeHtml(step.name)}</td>
      <td><span class="times-color-number">${fixed(step.moves, 1)} / ${fixed(step.engineMoves, 1)}</span></td>
      <td><span class="times-color-number">${fixed(step.effort, 1)} / ${fixed(step.engineEffort, 1)}</span></td>
      <td><span class="times-color-number">${signed(step.netEffort, 1)}</span></td>
    </tr>
  `;
}

// The current session's solves a batch can review, whatever the period
function getSessionBatchableSolves() {
  const session = getCurrentSession();
  return getBatchableSolves(getAllSolvesFromSession(session, averageObj), session.scrambleType);
}

// The batch line: the button with how many solves are waiting and what it does, or how the batch under way is going
function renderMetricsBatch() {
  const button = document.getElementById("metrics-batch-btn");
  const note = document.getElementById("metrics-batch-note");
  const batch = getBatch();

  // Under way: the button stops it
  if (batch) {
    button.hidden = false;
    button.disabled = batch.stopping;
    button.textContent = batch.stopping ? "Stopping…" : "Stop";
    note.textContent = batch.stopping
      ? "Finishing this solve, and its metrics will be kept."
      : `Solve ${batch.at} of ${batch.total}, on this device. ${batch.note}`;
    document.getElementById("metrics-batch").hidden = false;
    return;
  }

  const waiting = getSessionBatchableSolves().length;
  const result = getBatchResult();

  button.hidden = waiting === 0;
  button.disabled = false;
  button.textContent = `Review ${waiting} saved ${waiting === 1 ? "solve" : "solves"}`;
  // How the last batch went, then what the button does; it never uses the server, whose budget one batch would spend
  const hint = waiting ? "Solutions saved with no metrics yet. They run on this device, not the server: about 40 seconds each on a PC, with this page open." : "";
  note.textContent = [result, hint].filter(Boolean).join(" ");
  // Nothing to do or to say: no line
  document.getElementById("metrics-batch").hidden = !waiting && !result;
}

// Fills the Cubisz section for the chosen period and method: the batch line, the means, the 4 charts and the steps table
function renderMetricsStats() {
  renderMetricsBatch();

  const range = document.getElementById("date-filter").value;
  const allSolves = getAllSolvesFromSession(getCurrentSession(), averageObj);
  const filteredSolves = filterSolvesByRange(allSolves, range);
  const reviewed = getReviewedSolves(filteredSolves);
  const method = fillMethodPicker(getMetricsMethods(reviewed));
  const count = document.getElementById("metrics-count");
  const body = document.getElementById("metrics-stats-body");

  // No reviewed solves in the period: only say why, and where to find some
  body.hidden = reviewed.length === 0;
  if (reviewed.length === 0) {
    const sessionTotal = getReviewedSolves(allSolves).length;
    count.textContent = sessionTotal > 0
      ? `No reviewed solves in this period. This session has ${sessionTotal}, so try a longer period.`
      : "No reviewed solves yet. Press Submit on a solved 3x3 solution in Open Session to get its review.";
    return;
  }

  // Only one method at a time, since scores from different methods don't compare
  const solves = reviewed.filter(solve => solve.metrics.method === method);
  count.textContent = `${solves.length} of ${filteredSolves.length} solves reviewed with this method`;

  // The period's means
  const averages = getMetricsAverages(solves);
  document.getElementById("stat-effort-score").innerHTML = `<span class="times-color-number">${percent(averages.effortScore)}</span>`;
  document.getElementById("stat-move-score").innerHTML = `<span class="times-color-number">${percent(averages.moveScore)}</span>`;
  document.getElementById("stat-net-effort").innerHTML = `<span class="times-color-number">${signed(averages.netEffort, 1)}</span>`;
  document.getElementById("stat-execution").innerHTML = `<span class="times-color-number">${fixed(averages.execution, 2)}</span>`;
  document.getElementById("stat-tps").innerHTML = `<span class="times-color-number">${fixed(averages.tps, 2)}</span>`;

  // Per-solve charts, each with a figure that shares its axis
  const series = getMetricsSeries(solves);
  const solveCount = series.labels.length;

  drawMetricsChart("metricsScoresChart", "line", series.labels, [
    lineDataset("Effort score", series.effortScore, SERIES_COLORS[0]),
    lineDataset("Move score", series.moveScore, SERIES_COLORS[1]),
    engineLevelDataset("Engine", 100, solveCount)
  ], "Reviewed solve #", "Score (%)");

  drawMetricsChart("metricsNetChart", "line", series.labels, [
    lineDataset("Net effort", series.netEffort, SERIES_COLORS[0]),
    engineLevelDataset("Engine", 0, solveCount)
  ], "Reviewed solve #", "Net effort");

  drawMetricsChart("metricsPaceChart", "line", series.labels, [
    lineDataset("Execution (effort per second)", series.execution, SERIES_COLORS[0]),
    lineDataset("TPS (moves per second)", series.tps, SERIES_COLORS[1])
  ], "Reviewed solve #", "Per second");

  // Each step's mean effort next to the engine's
  const steps = getStepAverages(solves);

  drawMetricsChart("metricsStepsChart", "bar", steps.map(step => step.name), [
    { label: "You", data: steps.map(step => step.effort), backgroundColor: SERIES_COLORS[0] },
    { label: "Engine", data: steps.map(step => step.engineEffort), backgroundColor: ENGINE_COLOR }
  ], "Step", "Mean effort");

  // The steps table
  document.getElementById("metrics-steps-body").innerHTML = steps.map(stepAverageRowHtml).join("");
}


export { getStatistics, getStatisticsByDate, renderStatsPage };
