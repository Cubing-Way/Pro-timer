import { computeAverage } from "../average/avgController.js";
import { wrapTimesValue } from "./renderHelpers.js";

// HTML of the left sidebar: past averages with their solves, or the solves in progress in classic mode
function renderHistoryList(averages, currentType, averageObj, formatStatValue) {


    let html = "";

    // Classic mode: every solve in progress, newest first, numbered from the oldest
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

    // Block modes: one entry per finished average, newest first
    for (let i = 0; i < averages.length; i++) {
        const block = averages[i];

        // Skip the one currently shown as current
        if (currentType === "saved" && i === 0) continue;

        // Title under the solves: mode and result (fmc3 is shown as ao3)
        let titleText = `${block.mode === "fmc3" ? "ao3" : block.mode}: ${wrapTimesValue(block.average)}`;

        // For bo3, show secondary mo3 average
        if (block.mode === "bo3") {
            const mo3Avg = computeAverage(block.solves, "mo3");
            // computeAverage marks a DNF mean with dnf: true and no avg
            const mo3Value = mo3Avg.dnf || mo3Avg.avg === "DNF" ? "DNF" : wrapTimesValue(formatStatValue(mo3Avg.avg));
            titleText = `${block.mode}: ${block.best} (mo3: ${wrapTimesValue(mo3Value)})`;
        }
        // For bo5, show secondary ao5 average
        else if (block.mode === "bo5") {
            const ao5Avg = computeAverage(block.solves, "ao5");
            const ao5Value = ao5Avg.dnf || ao5Avg.avg === "DNF" ? "DNF" : wrapTimesValue(formatStatValue(ao5Avg.avg));
            titleText = `${block.mode}: ${block.best} (ao5: ${wrapTimesValue(ao5Value)})`;
        }

        html += `
            <div class="history-block history-average">
                <div class="history-solves">
        `;

        // One line per solve, numbered within its average
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

export { renderHistoryList };