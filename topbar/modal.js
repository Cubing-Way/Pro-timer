import { getSessionAverages } from "../solve.js";
import { formatDisplayTime, computeAverage, formatSecondsToTime } from "../average.js";
import { modal } from "./topbarButtons.js";
import { formatStatValue } from "../render.js";

function wrapTimesValue(value) {
    return `<span class="times-color-number">${value}</span>`;
}

function openDetailsModal() {
    const averages = getSessionAverages();

    let html = `<h3 class="modal-title">Session averages</h3>`;

    averages.forEach((block, blockIndex) => {
        let headerText = `${block.mode} #${wrapTimesValue(averages.length - blockIndex)}: ${wrapTimesValue(block.average)}`;

        // For bo3, show secondary mo3 average
        if (block.mode === "bo3") {
            const mo3Avg = computeAverage(block.solves, "mo3");
            const mo3Value = mo3Avg.avg === "DNF" ? "DNF" : formatSecondsToTime(mo3Avg.avg);
            headerText = `${block.mode} #${wrapTimesValue(averages.length - blockIndex)}: ${wrapTimesValue(block.average)} (mo3: ${wrapTimesValue(mo3Value)})`;
        }
        // For bo5, show secondary ao5 average
        else if (block.mode === "bo5") {
            const ao5Avg = computeAverage(block.solves, "ao5");
            const ao5Value = ao5Avg.avg === "DNF" ? "DNF" : formatSecondsToTime(ao5Avg.avg);
            headerText = `${block.mode} #${wrapTimesValue(averages.length - blockIndex)}: ${wrapTimesValue(block.average)} (ao5: ${wrapTimesValue(ao5Value)})`;
        }

        html += `
            <div class="modal-average-card">
                <div class="modal-average-header">
                    <b>${headerText}</b>
                </div>

                <div class="modal-solves">
        `;

        block.solves.forEach((s, i) => {
            html += `
                <div class="modal-solve-row">
                    <div class="modal-solve-main">
                        <span>#${i + 1}: ${formatStatValue(s)}</span>

                        <div class="modal-solve-actions">
                            <button onclick="setPenalty(${blockIndex}, ${i}, 2)">OK</button>
                            <button onclick="setPenalty(${blockIndex}, ${i}, 4)">+4</button>
                            <button onclick="setPenalty(${blockIndex}, ${i}, 6)">+6</button>
                            <button onclick="setPenalty(${blockIndex}, ${i}, 8)">+8</button>
                            <button onclick="setPenalty(${blockIndex}, ${i}, 10)">+10</button>
                            <button onclick="setPenalty(${blockIndex}, ${i}, 12)">+12</button>
                            <button onclick="setPenalty(${blockIndex}, ${i}, 'DNF')">DNF</button>
                            <button onclick="removeSolve(${blockIndex}, ${i})">✖</button>
                        </div>
                    </div>

                    <div class="modal-scramble">
                        Scramble: ${block.solves[i].scramble}
                    </div>
                    
                    <div class="modal-scramble">
                        Inspection: ${block.solves[i].inspection}
                    </div>


                    <div class="modal-scramble">
                        Date: ${new Date(block.solves[i].createdAt)}
                    </div>                    
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    modalBody.innerHTML = html;
    modal.classList.remove("hidden");
}

export { openDetailsModal, modal };