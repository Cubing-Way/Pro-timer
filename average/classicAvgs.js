import { computeAverage } from "./avgComput.js";

// Updates classic mode's rolling mo3, ao5, ao12 and ao100; recomputeBest rebuilds them all from every solve instead
function updateClassicStats(recomputeBest, averageObj, classicStats) {
// Full rebuild: after a penalty, a removed solve, a session change or switching to classic
if (recomputeBest) {
  const solves = averageObj.solvesArray;

  // Start the history over
  classicStats.history.mo3 = [];
  classicStats.history.ao5 = [];
  classicStats.history.ao12 = [];
  classicStats.history.ao100 = [];

  // Start the bests over
  classicStats.best.mo3 = null;
  classicStats.best.ao5 = null;
  classicStats.best.ao12 = null;
  classicStats.best.ao100 = null;

  // Slides a window of n solves over all of them, saving each average and keeping the best
  const rebuild = (n, key, modeName) => {
    for (let i = n; i <= solves.length; i++) {

      const window = solves.slice(i - n, i);
      const result = computeAverage(window, modeName);

      // One history entry: the average, its solves, and when its last solve was done
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

  // The current averages are the last ones of the rebuilt history
  classicStats.current.mo3 = classicStats.history.mo3.at(-1) ?? null;
  classicStats.current.ao5 = classicStats.history.ao5.at(-1) ?? null;
  classicStats.current.ao12 = classicStats.history.ao12.at(-1) ?? null;
  classicStats.current.ao100 = classicStats.history.ao100.at(-1) ?? null;

  // The rebuild already did everything the update below does
  return;
}
    // After one new solve: only the averages ending at it are new
    const solves = averageObj.solvesArray;

// Average of the last n solves (null if there aren't n yet), added to the history once
const updateRolling = (n, modeName) => {
    if (solves.length < n) return null;

    const window = solves.slice(-n);
    const result = computeAverage(window, modeName);

    const rollingAvg = {
        avg: result.dnf ? "DNF" : result.avg,
        best: result.best,
        worst: result.worst,
        sigma: result.sigma,
        solves: window,
        lastSolve: window[window.length - 1],
        createdAt: window[window.length - 1].createdAt
    };

    // Add it to the history, unless the last entry already ends at the same solve
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

    // Keeps a new average as the best of its size if it beats the old best (DNFs never do)
    const updateBest = (key, value) => {
        if (!value || value.avg == null || value.avg === "DNF") return;

        if (
            classicStats.best[key] == null ||
            value.avg < classicStats.best[key].avg
        ) {
            classicStats.best[key] = value;
        }
    };

    // Normal incremental update (recomputeBest already returned above)
    updateBest("mo3", mo3);
    updateBest("ao5", ao5);
    updateBest("ao12", ao12);
    updateBest("ao100", ao100);
}

export { updateClassicStats };