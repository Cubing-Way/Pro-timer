import { averageObj, classicStats } from "../average/avgController.js";
import { getSessionAverages } from "../session/sessionController.js";
import { getStatistics, getStatisticsByDate } from "../stats/statsController.js";
import { getCurrentSession } from "../session/sessionController.js";
import { formatStatValue as formatStatValueWith, wrapTimesValue } from "./renderHelpers.js";
import { renderAvgStats } from "./renderBufferAvgStats.js";
import { renderCurrentAverage } from "./renderAvgBuffer.js";
import { renderHistoryList } from "./renderHistoryList.js";
import { renderStats } from "./statistics.js";


function formatStatValue(value) {
    return formatStatValueWith(value, getCurrentSession);
}

function renderHistory() {
    const averages = getSessionAverages();
    const stats = getStatistics();
    const todayStats = getStatisticsByDate("day")

    const currentContainer = document.getElementById("currentAverageValue");
    const historyContainer = document.getElementById("historyPanel");
    const doneContainer = document.getElementById("current-stats");
    const statisticsContainer = document.getElementById("stats");
    const todayStatsContainer = document.getElementById("today-stats");

    // Decide what is CURRENT
    let currentType = null; // "live" | "saved"
    let currentBlock = null;

    if (averageObj.solvesArray.length > 0) {
        currentType = "live";
    } else if (averages.length > 0) {
        currentType = "saved";
        currentBlock = averages[0]; // newest
    }


    // Render CURRENT preview
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

    // Render DONE / LIVE STATS panel
    if (doneContainer) {
        doneContainer.innerHTML = renderAvgStats({
            type: currentType,
            solves: averageObj.solvesArray,
            mode: averageObj.mode,
            block: currentBlock
        }, averageObj, classicStats, formatStatValue);
    }


    // Render HISTORY list
    if (historyContainer) {
        historyContainer.innerHTML = renderHistoryList(averages, currentType, averageObj, formatStatValue);
    }

    // Render SESSION stats
    if (statisticsContainer) {
        statisticsContainer.innerHTML = renderStats(stats, formatStatValue);
        todayStatsContainer.innerHTML = renderStats(todayStats, formatStatValue)
    }
}


export { 
    renderCurrentAverage, 
    renderHistoryList,
    renderStats, 
    renderAvgStats,
    renderHistory,
    formatStatValue,
    wrapTimesValue
};

