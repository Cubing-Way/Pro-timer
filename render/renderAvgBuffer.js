import { wrapTimesValue } from "./renderHelpers.js";

// HTML of the footer's left panel: the average in progress (live), the newest saved one (saved), or classic mode's rolling averages
function renderCurrentAverage
    (
        currentType, 
        currentBlock, 
        averageObj, 
        classicStats,
        formatStatValue,
    ) {
    let html = "";

    // Classic mode: the current mo3, ao5, ao12 and ao100
    if (averageObj.mode === "classic") {

        // One "label: value" line
        const renderRow = (label, value) => `
            <div class="history-solve">
                ${label}: ${value != null ? wrapTimesValue(formatStatValue(value)) : wrapTimesValue("-")}
            </div>
        `;
        
        return `
            <div class="history-average current-average">
                ${renderRow("mo3", classicStats.current.mo3?.avg)}
                ${renderRow("ao5", classicStats.current.ao5?.avg)}
                ${renderRow("ao12", classicStats.current.ao12?.avg)}
                ${renderRow("ao100", classicStats.current.ao100?.avg)}
            </div>
        `;
    }

    // Live: the solves of the average in progress
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

    // Saved: the solves of the newest finished average
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

export { renderCurrentAverage };