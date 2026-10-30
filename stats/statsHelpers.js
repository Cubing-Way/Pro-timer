import { parseTimeToSeconds, formatSecondsToTime } from "../average/avgController.js";

function getUserOffsetMs(ts = Date.now()) {
  const offsetMinutes = new Date(ts).getTimezoneOffset();
  return offsetMinutes * 60 * 1000;
}

// ===============================
// COLLECT SOLVES
// ===============================
function getAllSolvesFromSession(session, averageObj) {
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
function getStatisticsFromSolves(solves, session, averageObj, classicStats) {
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
    labels.push(`Sub ${formatSecondsToTime(thresholds[i])}`);
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

function buildAvgMaps(classicStats) {
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

export {
  getUserOffsetMs,
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
};
