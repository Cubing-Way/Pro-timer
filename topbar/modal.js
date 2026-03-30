import { getSessionAverages } from "../solve.js";
import { formatDisplayTime, computeAverage, formatSecondsToTime } from "../average.js";
import { modal } from "./topbarButtons.js";
import { formatStatValue } from "../render.js";
import { saveSessions } from "../session.js";
import { 
  mountCube, 
  setSize, 
  setView, 
  applyScramble, 
  applySolution, 
  getLastMoveCount, 
  checkSolved 
} from "../cubisz/api.js";

function wrapTimesValue(value) {
    return `<span class="times-color-number">${value}</span>`;
}

function openDetailsModal() {
    const averages = getSessionAverages();

    let html = `<h3 class="modal-title">Session averages</h3>`;
    window.modalBlocks = averages;

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
                            <button onclick="setPenalty(${blockIndex}, ${i}, null)">OK</button>
                            <button onclick="setPenalty(${blockIndex}, ${i}, '+2')">+2</button>
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

                    <div class="modal-scramble">
                       Solution: <input 
                            type="text" 
                            id="solution-input-${blockIndex}-${i}" 
                            placeholder="Enter solution"
                            value="${block.solves[i].solution || ''}"
                        />
                        <button onclick="submitSolution(${blockIndex}, ${i})">
                            Submit
                        </button>
                    </div>       
                    <div class="modal-scramble">
                        <span id="tps-${blockIndex}-${i}">Status: ${block.solves[i].status || '-'} | Moves: ${block.solves[i].moves || '-'} | TPS: ${block.solves[i].tps ? block.solves[i].tps.toFixed(2) : '-'}</span>
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

window.submitSolution = function(blockIndex, solveIndex) {
    const block = window.modalBlocks[blockIndex];
    const solve = block.solves[solveIndex];

    const input = document.getElementById(`solution-input-${blockIndex}-${solveIndex}`);
    const value = input.value;

    applyScramble(solve.scramble, true);
    applySolution(value, true);
    const moveCount = getLastMoveCount();
    const tps = moveCount / solve.time;
    const isSolved = checkSolved();
    const status = isSolved ? "Solved" : "DNF";

    solve.solution = value;
    solve.tps = tps;
    solve.moves = moveCount;
    solve.status = status;

    document.getElementById(`tps-${blockIndex}-${solveIndex}`).innerHTML = `Status: ${status} | Moves: ${moveCount} | TPS: ${tps.toFixed(2)}`;

    saveSessions();
};

export { openDetailsModal, modal };