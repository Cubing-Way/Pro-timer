import { averageObj, parseTimeToSeconds, classicStats } from "../average/avgController.js";
import { formatSecondsToTime, computeAverage, formatDisplayTime } from "../average/avgController.js";
import { getSessionAverages } from "../session/solve.js";
import { getStatistcs, getStatisticsByDate } from "../no  separation/stats.js";
import { timerSettObj } from "../settings/settingsController.js";
import { getCurrentSession } from "../session/session.js";
import { formatStatValue } from "./renderHelpers.js";
import { renderAvgStats } from "./renderBufferAvgStats.js";
import { renderCurrentAverage } from "./renderAvgBuffer.js";
import { renderHistoryList } from "./renderHistoryList.js";
import { renderStats } from "./statistics.js";


function renderHistory() {
    const averages = getSessionAverages();
    const stats = getStatistcs();
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
        });
    }


    // Render HISTORY list
    if (historyContainer) {
        historyContainer.innerHTML = renderHistoryList(averages, currentType);
    }

    // Render SESSION stats
    if (statisticsContainer) {
        statisticsContainer.innerHTML = renderStats(stats);
        todayStatsContainer.innerHTML = renderStats(todayStats)
    }
}


export { 
    renderCurrentAverage, 
    renderHistoryList,
    renderStats, 
    renderAvgStats,
    renderHistory,
    formatStatValue
};

