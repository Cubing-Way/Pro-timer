import { computeAverage } from "./avgComput.js";

function updateClassicStats(recomputeBest, averageObj, classicStats) {
if (recomputeBest) {
  const solves = averageObj.solvesArray;

  // 🔥 reset history
  classicStats.history.mo3 = [];
  classicStats.history.ao5 = [];
  classicStats.history.ao12 = [];
  classicStats.history.ao100 = [];

  // 🔥 reset best
  classicStats.best.mo3 = null;
  classicStats.best.ao5 = null;
  classicStats.best.ao12 = null;
  classicStats.best.ao100 = null;

  const rebuild = (n, key, modeName) => {
    for (let i = n; i <= solves.length; i++) {

      const window = solves.slice(i - n, i);
      const result = computeAverage(window, modeName);

      const entry = {
        avg: result.dnf ? "DNF" : result.avg,
        solves: window,
        lastSolve: window[window.length - 1],
        createdAt: window[window.length - 1].createdAt,
        sigma: result.sigma ?? null
      };

      classicStats.history[key].push(entry);

      // update best
      if (entry.avg !== "DNF") {
        if (
          classicStats.best[key] == null ||
          entry.avg < classicStats.best[key].avg
        ) {
          classicStats.best[key] = entry;
        }
      }
    }
  };

  rebuild(3, "mo3", "mo3");
  rebuild(5, "ao5", "ao5");
  rebuild(12, "ao12", "ao12");
  rebuild(100, "ao100", "ao100");

  // 🔥 set current from rebuilt history
  classicStats.current.mo3 = classicStats.history.mo3.at(-1) ?? null;
  classicStats.current.ao5 = classicStats.history.ao5.at(-1) ?? null;
  classicStats.current.ao12 = classicStats.history.ao12.at(-1) ?? null;
  classicStats.current.ao100 = classicStats.history.ao100.at(-1) ?? null;

  return; // 🚨 important: skip normal logic
}
    const solves = averageObj.solvesArray;

const updateRolling = (n, modeName) => {
    if (solves.length < n) return null;

    const window = solves.slice(-n);
    const result = computeAverage(window, modeName);

    const rollingAvg = {
        avg: result.dnf ? "DNF" : result.avg,
        best: result.best,
        worst: result.worst,
        sigma: result.sigma, // 🔥 ADD THIS
        solves: window,
        lastSolve: window[window.length - 1],
        createdAt: window[window.length - 1].createdAt
    };

    // 🔥 PUSH INTO HISTORY (avoid duplicates)
    const historyArr = classicStats.history[modeName];

    const lastEntry = historyArr[historyArr.length - 1];

    if (
        !lastEntry ||
        lastEntry.createdAt !== rollingAvg.createdAt
    ) {
        historyArr.push(rollingAvg);
    }

    return rollingAvg;
};

    // Current rolling values
    const mo3 = updateRolling(3, "mo3");
    const ao5 = updateRolling(5, "ao5");
    const ao12 = updateRolling(12, "ao12");
    const ao100 = updateRolling(100, "ao100");

    classicStats.current.mo3 = mo3;
    classicStats.current.ao5 = ao5;
    classicStats.current.ao12 = ao12;
    classicStats.current.ao100 = ao100;

    const updateBest = (key, value) => {
        if (!value || value.avg == null || value.avg === "DNF") return;

        if (
            classicStats.best[key] == null ||
            value.avg < classicStats.best[key].avg
        ) {
            classicStats.best[key] = value;
        }
    };

    // Normal incremental update
    if (!recomputeBest) {

        updateBest("mo3", mo3);
        updateBest("ao5", ao5);
        updateBest("ao12", ao12);
        updateBest("ao100", ao100);

    } else {

        // Reset best stats
        classicStats.best.mo3 = null;
        classicStats.best.ao5 = null;
        classicStats.best.ao12 = null;
        classicStats.best.ao100 = null;

    const recomputeBestAvg = (n, modeName) => {
        if (solves.length < n) return null;

        let best = null;
        let bestBlock = null;

        for (let i = n; i <= solves.length; i++) {

            const window = solves.slice(i - n, i);

            const result = computeAverage(window, modeName);

            if (result.dnf) continue;

            if (best === null || result.avg < best) {
                best = result.avg;

                bestBlock = {
                    avg: result.avg,
                    solves: window,
                    lastSolve: window[window.length - 1] // 🔥 THIS is the key
                };
            }
        }

        return bestBlock;
    };

        classicStats.best.mo3 = recomputeBestAvg(3, "mo3");
        classicStats.best.ao5 = recomputeBestAvg(5, "ao5");
        classicStats.best.ao12 = recomputeBestAvg(12, "ao12");
        classicStats.best.ao100 = recomputeBestAvg(100, "ao100");
    }

    console.log("solves length:", solves.length);
}

export { updateClassicStats };