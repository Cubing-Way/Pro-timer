import { computeAverage } from "../average/avgController.js";
import { wrapTimesValue } from "./renderHelpers.js";

function renderHistoryList(averages, currentType, averageObj, formatStatValue) {


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

export { renderHistoryList };