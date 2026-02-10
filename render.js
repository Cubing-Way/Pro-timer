import { averageObj } from "./average.js";
import { parseTimeToSeconds, formatSecondsToTime, computeAverage, formatDisplayTime } from "./average.js";
import { getSessionAverages } from "./solve.js";
import { getStatistcs, getStatisticsByDate } from "./stats.js";
import { lastTime, timerFlag } from "./main.js";

function renderCurrentAverage(currentType, currentBlock) {
    let html = "";

    if (currentType === "live") {
        html += `
            <div class="history-average current-average">
                <div class="history-solves">
        `;

        averageObj.solvesArray.forEach((s, i) => {
            html += `
                <div class="history-solve">
                    ${i + 1} - ${formatDisplayTime(s)}
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    }

    if (currentType === "saved" && currentBlock) {
        html += `
            <div class="history-average current-average">
                <div class="history-solves">
        `;



        currentBlock.solves.forEach((s, i) => {
            html += `
                <div class="history-solve">
                    ${i + 1} - ${formatDisplayTime(s)}
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    }

    return html;
}

function renderHistoryList(averages, currentType) {
    if (lastTime && timerFlag) document.getElementById("timer").textContent = lastTime;
    let html = "";

    for (let i = 0; i < averages.length; i++) {
        const block = averages[i];

        // Skip the one currently shown as current
        if (currentType === "saved" && i === 0) continue;

        let titleText = `${block.mode}: ${block.average}`;

        // For bo3, show secondary mo3 average
        if (block.mode === "bo3") {
            const mo3Avg = computeAverage(block.solves, "mo3");
            const mo3Value = mo3Avg.avg === "DNF" ? "DNF" : formatSecondsToTime(mo3Avg.avg);
            titleText = `${block.mode}: ${block.average} (mo3: ${mo3Value})`;
        }
        // For bo5, show secondary ao5 average
        else if (block.mode === "bo5") {
            const ao5Avg = computeAverage(block.solves, "ao5");
            const ao5Value = ao5Avg.avg === "DNF" ? "DNF" : formatSecondsToTime(ao5Avg.avg);
            titleText = `${block.mode}: ${block.average} (ao5: ${ao5Value})`;
        }

        html += `
            <div class="history-block history-average">
                <div class="history-solves">
        `;

        block.solves.forEach((s, idx) => {
            html += `
                <div class="history-solve">
                    ${idx + 1} - ${formatDisplayTime(s)}
                </div>
            `;
        });

        html += `
                </div>
                <div class="history-title">
                    ${titleText}
                </div>
            </div>
        `;
    }

    return html;
}

function renderStats(stats) {
    return `
        Best single: ${stats.bestTime !== Infinity ? formatSecondsToTime(stats.bestTime) : "-"}
        <br>
        Best ao5: ${stats.bestAvg !== Infinity ? formatSecondsToTime(stats.bestAvg) : "-"}
        <br>
        Session Mean: ${stats.mean ? formatSecondsToTime(stats.mean) : "-"}
        <br>
        Session &sigma;: ${stats.sigma ? formatSecondsToTime(stats.sigma) : "-"}
        <br>
        Solves: ${stats.solveCounter ? stats.solveCounter : "-"}
    `;
}

function renderStats2(stats) {
    return `
        Best single: ${stats.bestTime !== Infinity ? formatSecondsToTime(stats.bestTime) : "-"}
        <br>
        Best ao5: ${stats.bestAvg !== Infinity ? formatSecondsToTime(stats.bestAvg) : "-"}
        <br>
        Session Mean: ${stats.mean ? formatSecondsToTime(stats.mean) : "-"}
        <br>
        Session &sigma;: ${stats.sigma ? formatSecondsToTime(stats.sigma) : "-"}
        <br>
        Solves: ${stats.solveCounter ? stats.solveCounter : "-"}
    `;
}

function renderAvgStats({ type, solves, mode, block }) {
    // type: "live" | "saved" | null

    if (type === "live") {
        if (!solves || solves.length === 0) return "";

        const avgObj = computeAverage(solves, mode);

        const best = avgObj.best;
        const worst = avgObj.worst;
        const sigma = avgObj.sigma;
        const bpAo5 = avgObj.bpAo5;
        const wpA05 = avgObj.wpA05;

        if (solves.length === 4 && mode === "ao5") {
            return `                
                Best: ${formatSecondsToTime(best)}
                <br>
                Worst: ${formatSecondsToTime(worst)}
                <br>
                &sigma;: ${formatSecondsToTime(sigma)}
                <hr>
                bpAo5: ${formatSecondsToTime(bpAo5)}
                <br>
                wpAo5: ${formatSecondsToTime(wpA05)}
            `;
        }

        return `                
            Best: ${formatSecondsToTime(best)}
            <br>
            Worst: ${formatSecondsToTime(worst)}
            <br>
            &sigma;: ${formatSecondsToTime(sigma)}
        `;
    }

    if (type === "saved") {
        if (!block) return "";

        return `                
            Best: ${block.best}
            <br>
            Worst: ${block.worst}
            <br>
            &sigma;: ${block.sigma}
            <hr>
            ${block.mode}: ${block.average}
        `;
    }

    return "";
}

// ===============================
// Rendering
// ===============================

function renderHistory() {
    const averages = getSessionAverages();
    const stats = getStatistcs();
    const todayStats = getStatisticsByDate("today")

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
        currentContainer.innerHTML = renderCurrentAverage(currentType, currentBlock);
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
    renderHistory
};

