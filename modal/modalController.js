import { getSessionAverages, getCurrentSession, penalty2, remove2 } from "../session/sessionController.js";
import { computeAverage, formatSecondsToTime } from "../average/avgController.js";
import { averageObj, classicStats, updateClassicStats } from "../average/avgController.js";
import { formatStatValue, renderHistory, wrapTimesValue } from "../render/renderController.js";
import { saveSessions } from "../session/sessionController.js";
import { isCubiszEvent } from "../scramble/scrambleController.js";
import {
  applyScramble,
  applySolution,
  getLastMoveCount,
  checkSolved
} from "../cubisz/api.js";

const modal = document.getElementById("detailsModal");
const modalBody = document.getElementById("modalBody");
const closeModalBtn = document.getElementById("closeModalBtn");

// Averages shown in the modal, and the penalty counter of each solve (key: "blockIndex-solveIndex")
let modalBlocks = [];
const modalPenaltyCounters = {};

// Close with the button, or by clicking the dimmed backdrop around the box
closeModalBtn.onclick = () => modal.classList.add("hidden");
modal.onclick = e => {
    if (e.target === modal) modal.classList.add("hidden");
};

// Buttons inside the modal (it is rebuilt on every change)
modalBody.addEventListener("click", (e) => {
    const button = e.target.closest("button[data-action]");
    if (!button) return;

    // Which average and which of its solves the button belongs to
    const blockIndex = Number(button.dataset.block);
    const solveIndex = Number(button.dataset.solve);

    if (button.dataset.action === "ok") setPenalty(blockIndex, solveIndex, null);
    if (button.dataset.action === "plus2") setPenalty(blockIndex, solveIndex, 2, true);
    if (button.dataset.action === "dnf") setPenalty(blockIndex, solveIndex, "DNF");
    if (button.dataset.action === "remove") removeSolve(blockIndex, solveIndex);
    if (button.dataset.action === "solution") submitSolution(blockIndex, solveIndex);
});

// Builds the modal's HTML: one card per saved average (newest first) with its solves, then opens it
function openDetailsModal() {
    const averages = getSessionAverages();

    let html = `<h3 class="modal-title">Session averages</h3>`;
    modalBlocks = averages;

    averages.forEach((block, blockIndex) => {
        // Header: mode, average number (oldest is #1) and result
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

        // Card opening: header, then the solves list
        html += `
            <div class="modal-average-card">
                <div class="modal-average-header">
                    <b>${headerText}</b>
                </div>

                <div class="modal-solves">
        `;

        block.solves.forEach((s, i) => {
            // Start this solve's +2 counter at its current penalty
            const counterKey = `${blockIndex}-${i}`;
            let counter = 0;
            if (typeof s.penalty === 'number' && s.penalty > 0) {
                counter = s.penalty;
            }
            modalPenaltyCounters[counterKey] = counter;

            // The +2 button shows what the next click gives, like the top bar's
            const buttonText = `+${counter + 2}`;
            const solveData = `data-block="${blockIndex}" data-solve="${i}"`;

            // Cubisz only checks 3x3 solutions; solves saved before solves had an event use the session's event
            const canCheck = isCubiszEvent(s.event ?? getCurrentSession().scrambleType);
            // Solution box and its result (status, moves, TPS), only for 3x3 solves
            const solutionRows = canCheck ? `
                    <div class="modal-scramble">
                       Solution: <input
                            type="text"
                            id="solution-input-${blockIndex}-${i}"
                            placeholder="Enter solution"
                            value="${block.solves[i].solution || ''}"
                        />
                        <button data-action="solution" ${solveData}>
                            Submit
                        </button>
                    </div>
                    <div class="modal-scramble">
                        <span id="tps-${blockIndex}-${i}">Status: ${block.solves[i].status || '-'} | Moves: ${block.solves[i].moves || '-'} | TPS: ${block.solves[i].tps ? block.solves[i].tps.toFixed(2) : '-'}</span>
                    </div>
            ` : "";

            // Solve row: time, penalty buttons, scramble, inspection, date, solution
            html += `
                <div class="modal-solve-row">
                    <div class="modal-solve-main">
                        <span>#${i + 1}: ${formatStatValue(s)}</span>

                        <div class="modal-solve-actions">
                            <button data-action="ok" ${solveData}>OK</button>
                            <button id="plus2-${blockIndex}-${i}" data-action="plus2" ${solveData}>${buttonText}</button>
                            <button data-action="dnf" ${solveData}>DNF</button>
                            <button data-action="remove" ${solveData}>✖</button>
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
                    ${solutionRows}
                </div>
            `;
        });

        // Close the solves list and the card
        html += `
                </div>
            </div>
        `;
    });

    modalBody.innerHTML = html;
    modal.classList.remove("hidden");
}

// Sets a saved solve's penalty (null, a number of seconds or "DNF"); cycleMode makes +2 step through +2 … +12
function setPenalty(blockIndex, solveIndex, penalty, cycleMode = false) {
    let finalPenalty = penalty;

    if (cycleMode) {
        const counterKey = `${blockIndex}-${solveIndex}`;
        let counter = modalPenaltyCounters[counterKey] || 0;

        // After +12 the next click removes the penalty
        if (counter === 12) {
            counter = 0;
            finalPenalty = null;
        } else {
            counter += 2;
            finalPenalty = counter;
        }

        modalPenaltyCounters[counterKey] = counter;

        // Update button text - identical to topbar button
        const buttonEl = document.getElementById(`plus2-${blockIndex}-${solveIndex}`);
        if (buttonEl) {
            buttonEl.textContent = `+${counter + 2}`;
        }
    }

    // Change the solve and recompute its average, then save and redraw
    penalty2(blockIndex, solveIndex, finalPenalty);
    saveSessions();
    renderHistory();
    // Classic mode also recounts its rolling averages
    if (averageObj.mode === "classic") updateClassicStats(true);
    const session = getCurrentSession();
    session.classicStats = structuredClone(classicStats);
    // Rebuild the modal if it's open, so it shows the new numbers
    if (!modal.classList.contains("hidden")) {
        openDetailsModal();
    }
}

// Deletes a saved solve from its average, then recounts, saves and redraws
function removeSolve(blockIndex, solveIndex) {
    remove2(blockIndex, solveIndex)
    if(averageObj.mode === "classic") updateClassicStats(true);
    const session = getCurrentSession();
    session.classicStats = structuredClone(classicStats);
    saveSessions();
    renderHistory();
    if (!modal.classList.contains("hidden")) {
        openDetailsModal();
    }
}

// Checks a typed solution on cubisz: scramble, apply the moves, count them, and work out TPS
function submitSolution(blockIndex, solveIndex) {
    const block = modalBlocks[blockIndex];
    const solve = block.solves[solveIndex];

    const input = document.getElementById(`solution-input-${blockIndex}-${solveIndex}`);
    const value = input.value;

    // true (skipPaint): change cubisz's cube without repainting the FMC cube on the page
    applyScramble(solve.scramble, true);
    applySolution(value, true);
    const moveCount = getLastMoveCount();
    // Turns per second over the solve's time
    const tps = moveCount / solve.time;
    const isSolved = checkSolved();
    const status = isSolved ? "Solved" : "DNF";

    // Save the result on the solve
    solve.solution = value;
    solve.tps = tps;
    solve.moves = moveCount;
    solve.status = status;

    document.getElementById(`tps-${blockIndex}-${solveIndex}`).innerHTML = `Status: ${status} | Moves: ${moveCount} | TPS: ${tps.toFixed(2)}`;

    saveSessions();
}

export { openDetailsModal, setPenalty, removeSolve };