import { parseTimeToSeconds, formatSecondsToTime, isPointsSolves } from "../average/avgController.js";

// Best of a list: the lowest time, or the most points when the solves are Multi-Blind
function pickBest(values, solves) {
  return isPointsSolves(solves) ? Math.max(...values) : Math.min(...values);
}

// Milliseconds between UTC and local time (getTimezoneOffset), so ranges start at local midnight
function getUserOffsetMs(ts = Date.now()) {
  const offsetMinutes = new Date(ts).getTimezoneOffset();
  return offsetMinutes * 60 * 1000;
}

// Collecting solves
// Every solve of a session: the finished averages' solves, then the ones in progress
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

  // From the average in progress
  averageObj.solvesArray.forEach(s => all.push(s));

  return all;
}

// Stats from a list of solves
// Best single, mean, σ, solve count and best average: { bestTime, mean, sigma, bestAvg, solveCounter }
function getStatisticsFromSolves(solves, session, averageObj, classicStats) {
  let allSolvesArr = [];
  let ao5Arr = [];
  let solveCounter = 0;

  // Classic mode: today's best rolling ao5 counts as an average too
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
  // Every finished average that isn't a DNF (any mode, despite the name ao5Arr)

  session.averages.forEach(avg => {
    if (avg.mode !== "classic") {
      if (avg.average !== "DNF") ao5Arr.push(parseTimeToSeconds(avg.average));
    }
  });

  // Each solve's final value; DNFs only count towards the number of solves
  solves.forEach(solve => {

    if (solve.penalty == null) {
      allSolvesArr.push(solve.time);
      solveCounter++;
    } else if (typeof solve.penalty === "number") {
      // Penalties are saved as seconds (2, 4 … 12), not as "+2"
      allSolvesArr.push(solve.time + solve.penalty);
      solveCounter++;
    } else {
      // DNF
      solveCounter++;
    }
  });

  // No successful solve: nothing to compute
  if (allSolvesArr.length === 0) {
    return {
      bestTime: null,
      mean: null,
      sigma: 0,
      bestAvg: null,
      solveCounter
    };
  }

  // Best average, best single, mean and σ of the successful solves
  const validAvgs = ao5Arr.filter(v => v != null && !isNaN(v));
  const bestAvg = validAvgs.length ? pickBest(validAvgs, solves) : null;
  const bestTime = pickBest(allSolvesArr, solves);
  const mean = allSolvesArr.reduce((a, b) => a + b, 0) / allSolvesArr.length;
  const variance = allSolvesArr.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / allSolvesArr.length;
  const sigma = Math.sqrt(variance);

  return { bestTime, mean, sigma, bestAvg, solveCounter };
}

// Date ranges

// Start and end (ms) of the current day, week (from Sunday), month, semester or year in local time; start is null for all time
function getRangeTimestamps(range) {
  const now = Date.now();
  const offset = getUserOffsetMs(now);
  // Local time moved into the UTC fields, so the setUTC calls below work in local time
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

// Solves done in the current range
function filterSolvesByRange(solves, range) {
  const { start, end } = getRangeTimestamps(range);

  if (!start) return solves;

  return solves.filter(s => s.createdAt >= start && s.createdAt <= end);
}

// Smallest range (day, week, month, semester, year) that has solves, or all time, so the stats page doesn't open empty
function getNarrowestRangeWithSolves(solves) {
  // Smallest first, the same order as the period dropdown from the bottom up
  const ranges = ["day", "week", "month", "semester", "year"];
  // The first range with at least one solve
  const found = ranges.find(range => filterSolvesByRange(solves, range).length > 0);
  // No solves this year (or none at all): all time
  return found ?? "all";
}

// Averages whose last solve is in the current range, oldest first
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

// Results (seconds, null for DNF) of the averages finished between start and end, oldest first
function getAveragesInRange(session, start, end) {
  return session.averages
    .filter(avg => {
      const lastSolve = avg.solves[avg.solves.length - 1];
      if (!lastSolve || !lastSolve.createdAt) return false;

      return (!start || lastSolve.createdAt >= start) &&
             (!end || lastSolve.createdAt <= end);
    })
    .reverse() // session.averages is newest first; the charts want oldest first
    .map(avg => {
      if (avg.average === "DNF") return null;
      return parseTimeToSeconds(avg.average);
    });
}

// The closest earlier range of the same length that has averages (up to 10 back), for the comparison chart
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

// Labels (1, 2, 3…) and σ of each average for the σ chart; DNF averages leave a gap
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

// Counts the solves at or under each threshold, plus one bucket above the last; DNFs are skipped
function getTimeDistribution(solves, thresholds) {
  // Example thresholds: [10, 12, 14]

  const buckets = new Array(thresholds.length + 1).fill(0);

  solves.forEach(solve => {
    let time = null;

    if (solve.penalty === "DNF") return;
    if (typeof solve.penalty === "number") time = solve.time + solve.penalty;
    else time = solve.time;

    // The first threshold the time fits under
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

// Bucket labels: "Sub 10.00" for each threshold, then "> last"
function getDistributionLabels(thresholds) {
  const labels = [];

  for (let i = 0; i < thresholds.length; i++) {
    labels.push(`Sub ${formatSecondsToTime(thresholds[i])}`);
  }

  labels.push(`> ${formatSecondsToTime(thresholds[thresholds.length - 1])}`);

  return labels;
}

// Drops the buckets with no solves
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

// Bucket limits from 0.5 s up to 10 h, finer for fast times and coarser for slow ones
function generateSmartThresholds() {
  const thresholds = [];

  // Adds every step from start (not included) to end
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

// Classic mode's rolling averages keyed by the time of their last solve, to look up a solve's mo3 / ao5 / ao12 / ao100
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
  pickBest,
  getUserOffsetMs,
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
  buildAvgMaps
};
