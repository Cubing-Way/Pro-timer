import { averageObj, classicStats } from "../average/avgController.js";
import { getSessionAverages, getLastTwoSolves } from "../session/sessionController.js";
import { getStatistics, getStatisticsByDate } from "../stats/statsController.js";
import { getCurrentSession } from "../session/sessionController.js";
import { formatStatValue as formatStatValueWith, wrapTimesValue } from "./renderHelpers.js";
import { renderAvgStats } from "./renderBufferAvgStats.js";
import { renderCurrentAverage } from "./renderAvgBuffer.js";
import { renderHistoryList } from "./renderHistoryList.js";
import { renderStats } from "./statistics.js";
import { renderTimeDiff } from "./renderTimeDiff.js";


// formatStatValue with the current session filled in
function formatStatValue(value) {
    return formatStatValueWith(value, getCurrentSession);
}

// Redraws everything that shows solves (footer panels, history list, both stats panels); called after every change
function renderHistory() {
    const averages = getSessionAverages();
    // Session stats over all time and over today (stats/statsController.js)
    const stats = getStatistics();
    const todayStats = getStatisticsByDate("day")

    const currentContainer = document.getElementById("currentAverageValue");
    const historyContainer = document.getElementById("historyPanel");
    const doneContainer = document.getElementById("current-stats");
    const statisticsContainer = document.getElementById("stats");
    const todayStatsContainer = document.getElementById("today-stats");
    const timeDiffContainer = document.getElementById("time-diff");

    // What the footer shows: the average in progress if it has solves, else the newest saved one
    let currentType = null; // "live" | "saved"
    let currentBlock = null;

    if (averageObj.solvesArray.length > 0) {
        currentType = "live";
    } else if (averages.length > 0) {
        currentType = "saved";
        currentBlock = averages[0]; // newest
    }


    // Footer, left: the current average's solves
    if (currentContainer) {
        currentContainer.innerHTML = renderCurrentAverage
        (
            currentType, 
            currentBlock, 
            averageObj, 
            classicStats,
            formatStatValue,
        );
    }

    // Footer, right: the current average's stats
    if (doneContainer) {
        doneContainer.innerHTML = renderAvgStats({
            type: currentType,
            solves: averageObj.solvesArray,
            mode: averageObj.mode,
            block: currentBlock
        }, averageObj, classicStats, formatStatValue);
    }


    // Left sidebar: the other averages
    if (historyContainer) {
        historyContainer.innerHTML = renderHistoryList(averages, currentType, averageObj, formatStatValue);
    }

    // Right sidebar: all-time and today's stats
    if (statisticsContainer) {
        statisticsContainer.innerHTML = renderStats(stats, formatStatValue);
        todayStatsContainer.innerHTML = renderStats(todayStats, formatStatValue)
    }

    // Beside the timer: the last solve compared with the previous one
    if (timeDiffContainer) {
        timeDiffContainer.innerHTML = renderTimeDiff(getLastTwoSolves());
    }
}


export { 
    renderCurrentAverage, 
    renderHistoryList,
    renderStats,
    renderAvgStats,
    renderTimeDiff,
    renderHistory,
    formatStatValue,
    wrapTimesValue
};

