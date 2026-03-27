import { averageObj, parseTimeToSeconds, classicStats } from "./average.js";
import { formatSecondsToTime, computeAverage, formatDisplayTime } from "./average.js";
import { getSessionAverages } from "./solve.js";
import { getStatistcs, getStatisticsByDate } from "./stats.js";
import { lastTime } from "./timer/timeTyping.js";
import { timerSettObj } from "./settings/timerSett.js";
import { eventObj } from "./topbar/eventState.js";

function wrapTimesValue(value) {
    return `<span class="times-color-number">${value}</span>`;
}

function formatStatValue(value) {
    if (value === undefined || value === null) return "-";
    if (value === Infinity || value === -Infinity || value === "DNF" || value.penalty === "DNF") return wrapTimesValue("DNF");

    if (value.time && eventObj.event === "r3ni") return wrapTimesValue(`${value.result} (${value.time} pts)`);

    if (value.time && eventObj.event === "333fm") return wrapTimesValue(`${value.time} moves`);

    if (eventObj.event === "r3ni") {
        const num = Number(value);

        if (!Number.isFinite(num)) return wrapTimesValue("DNF");

        return wrapTimesValue(`${Number.isInteger(num) ? num : num.toFixed(2)} pts`);
    }

    if (eventObj.event === "333fm") {
        const num = Number(value);

        if (!Number.isFinite(num)) return wrapTimesValue("DNF");

        return wrapTimesValue(`${num} moves`);
    }

    if (value.time && value.solvePhases) {
        const base = formatDisplayTime(value);
        const phases = value.solvePhases.length > 1
            ? " | " + value.solvePhases
                .map((phase, index) => wrapTimesValue(index + 1) + ": " + phase)
                .join(" | ")
            : "";
        return wrapTimesValue(base) + phases;
    } else if (value.time) {
        return wrapTimesValue(formatDisplayTime(value));
    }
    return wrapTimesValue(formatSecondsToTime(value));
}


function renderCurrentAverage(currentType, currentBlock) {
    let html = "";

    // =========================
    // CLASSIC MODE
    // =========================
    if (averageObj.mode === "classic") {

        const renderRow = (label, value) => `
            <div class="history-solve">
                ${label}: ${value != null ? formatStatValue(value) : "-"}
            </div>
        `;
        
        return `
            <div class="history-average current-average">
                ${renderRow("mo3", classicStats.current.mo3)}
                ${renderRow("ao5", classicStats.current.ao5)}
                ${renderRow("ao12", classicStats.current.ao12)}
                ${renderRow("ao100", classicStats.current.ao100)}
            </div>
        `;
    }

    if (currentType === "live") {
        html += `
            <div class="history-average current-average">
                <div class="history-solves">
        `;

        averageObj.solvesArray.forEach((s, i) => {
            html += `
                <div class="history-solve">
                    ${i + 1} - ${formatStatValue(s)}
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
                    ${i + 1} - ${formatStatValue(s)}
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
    if (lastTime && timerSettObj.timerFlag)
        document.getElementById("timer").textContent = lastTime;

    let html = "";

    // =========================
    // CLASSIC MODE → render solves
    // =========================
    if (averageObj.mode === "classic") {

        averageObj.solvesArray
            .slice()            // clone
            .reverse()          // newest first
            .forEach((solve, index) => {
                html += `
                    <div class="history-block history-solve">
                        ${averageObj.solvesArray.length - index}
                        - ${formatStatValue(solve)}
                    </div>
                `;
            });

        return html;
    }

    for (let i = 0; i < averages.length; i++) {
        const block = averages[i];

        // Skip the one currently shown as current
        if (currentType === "saved" && i === 0) continue;

        let titleText = `${block.mode === "fmc3" ? "ao3" : block.mode}: ${wrapTimesValue(block.average)}`;

        // For bo3, show secondary mo3 average
        if (block.mode === "bo3") {
            const mo3Avg = computeAverage(block.solves, "mo3");
            const mo3Value = mo3Avg.avg === "DNF" ? "DNF" : wrapTimesValue(formatStatValue(mo3Avg.avg));
            titleText = `${block.mode}: ${block.best} (mo3: ${wrapTimesValue(mo3Value)})`;
        }
        // For bo5, show secondary ao5 average
        else if (block.mode === "bo5") {
            const ao5Avg = computeAverage(block.solves, "ao5");
            const ao5Value = ao5Avg.avg === "DNF" ? "DNF" : wrapTimesValue(formatStatValue(ao5Avg.avg));
            titleText = `${block.mode}: ${block.best} (ao5: ${wrapTimesValue(ao5Value)})`;
        }

        html += `
            <div class="history-block history-average">
                <div class="history-solves">
        `;

        block.solves.forEach((s, idx) => {
            html += `
                <div class="history-solve">
                    ${idx + 1} - ${formatStatValue(s)}
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
        Best single: ${stats.bestTime !== Infinity ? formatStatValue(stats.bestTime) : "-"}
        <br>
        Best ao5: ${stats.bestAvg !== Infinity ? formatStatValue(stats.bestAvg) : "-"}
        <br>
        Session Mean: ${stats.mean ? formatStatValue(stats.mean) : "-"}
        <br>
        Session &sigma;: ${stats.sigma ? formatStatValue(stats.sigma) : "-"}
        <br>
        Solves: ${stats.solveCounter ? wrapTimesValue(stats.solveCounter) : "-"}
    `;
}

function renderAvgStats({ type, solves, mode, block }) {
    // type: "live" | "saved" | null

if (averageObj.mode === "classic") {

return `
    Best mo3: ${formatStatValue(classicStats.best.mo3) ?? "-"}
    <br>
    Best ao5: ${formatStatValue(classicStats.best.ao5) ?? "-"}
    <br>
    Best ao12: ${formatStatValue(classicStats.best.ao12) ?? "-"}
    <br>
    Best ao100: ${formatStatValue(classicStats.best.ao100) ?? "-"}
`;
}

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
                Best: ${formatStatValue(best)}
                <br>
                Worst: ${formatStatValue(worst)}
                <br>
                &sigma;: ${formatStatValue(sigma)}
                <hr>
                bpAo5: ${formatStatValue(bpAo5)}
                <br>
                wpAo5: ${formatStatValue(wpA05)}
            `;
        }

        return `                
            Best: ${formatStatValue(best)}
            <br>
            Worst: ${formatStatValue(worst)}
            <br>
            &sigma;: ${formatStatValue(sigma)}
        `;
    }

    if (type === "saved") {
        if (!block) return "";
console.log(block);
        return `                
            Best: ${formatStatValue(parseTimeToSeconds(block.best))}
            <br>
            Worst: ${formatStatValue(parseTimeToSeconds(block.worst))}
            <br>
            &sigma;: ${formatStatValue(parseTimeToSeconds(block.sigma))}
            <hr>
            ${block.mode === "fmc3" ? "ao3" : block.mode}: ${formatStatValue(parseTimeToSeconds(block.mode === "bo3" || block.mode === "bo5" ? block.best : block.average))}

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
    renderHistory,
    formatStatValue
};

