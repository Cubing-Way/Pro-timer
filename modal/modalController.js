import { getSessionAverages, getCurrentSession, penalty2, remove2 } from "../session/sessionController.js";
import { computeAverage, formatSecondsToTime, parseTimeToSeconds } from "../average/avgController.js";
import { averageObj, classicStats, updateClassicStats, getNeededSolves } from "../average/avgController.js";
import { formatStatValue, renderHistory, wrapTimesValue } from "../render/renderController.js";
import { saveSessions } from "../session/sessionController.js";
import { isCubiszEvent } from "../scramble/scrambleController.js";
import { showLastSolve } from "../timer/timerController.js";
import { shortDate, droppedIndexes, averageShareText, solveShareText, shareOrCopy } from "./shareText.js";
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
// Each card's header and stats HTML by blockIndex (-1 for the average in progress), for its Share button
let modalCardHeaders = {};

// How long a Share button shows how it went ("Copied") before going back to "Share" (ms)
const SHARE_FEEDBACK_TIME = 1500;

// The box that scrolls (the modal itself is the dimmed backdrop)
const modalContent = modal.querySelector(".modal-content");

// Cards and solves drawn per batch
const MODAL_BATCH_SIZE = 30;
// How close to the bottom of the box (px) scrolling draws the next batch
const MODAL_LOAD_DISTANCE = 300;

// Everything the modal can show, in order: { type: "card", html } or { type: "solve", s, i, blockIndex }
let modalItems = [];
// How many of modalItems are on screen
let modalDrawnCount = 0;
// Solves list of the last card drawn, where the next solves go
let currentSolvesList = null;

// Close with the button, or by clicking the dimmed backdrop around the box
closeModalBtn.onclick = () => modal.classList.add("hidden");
modal.onclick = e => {
    if (e.target === modal) modal.classList.add("hidden");
};

// Scrolling near the bottom draws the next solves
modalContent.addEventListener("scroll", drawWhileNearBottom);

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
    if (button.dataset.action === "share-average") shareAverage(button, blockIndex);
    if (button.dataset.action === "share-solve") shareSolve(button, blockIndex, solveIndex);
});

// The solves of a card: the average in progress's for -1, else the saved average's
function blockSolves(blockIndex) {
    return blockIndex === -1 ? averageObj.solvesArray : modalBlocks[blockIndex].solves;
}

// Shows how a share went on its button for a moment, then puts "Share" back; closing the share sheet changes nothing
function showShareResult(button, result) {
    const labels = { shared: "Shared", copied: "Copied", failed: "Couldn't copy" };
    if (!labels[result]) return;
    button.textContent = labels[result];
    setTimeout(() => button.textContent = "Share", SHARE_FEEDBACK_TIME);
}

// Shares an average: its card's header and stats, then every solve with all its details
async function shareAverage(button, blockIndex) {
    const { title, stats } = modalCardHeaders[blockIndex];
    // The mode decides which solves go in parentheses
    const mode = blockIndex === -1 ? averageObj.mode : modalBlocks[blockIndex].mode;
    const text = averageShareText(title, stats, blockSolves(blockIndex), mode);
    showShareResult(button, await shareOrCopy(text));
}

// Shares one solve with all its details
async function shareSolve(button, blockIndex, solveIndex) {
    const text = solveShareText(blockSolves(blockIndex)[solveIndex]);
    showShareResult(button, await shareOrCopy(text));
}

// HTML of one solve row: a line with its number, time and scramble that opens to its buttons, scramble, inspection, date, done at, with and, for 3x3, the solution box
function solveRowHtml(s, i, blockIndex, dropped) {
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
                    value="${s.solution || ''}"
                />
                <button data-action="solution" ${solveData}>
                    Submit
                </button>
            </div>
            <div class="modal-scramble">
                <span id="tps-${blockIndex}-${i}">Status: ${s.status || '-'} | Moves: ${s.moves || '-'} | TPS: ${s.tps ? s.tps.toFixed(2) : '-'}</span>
            </div>
    ` : "";

    // Where it was done, only for solves that have it (solves saved before it existed don't)
    const doneAtRow = s.doneAt ? `
            <div class="modal-scramble">
                Done at: ${s.doneAt}
            </div>
    ` : "";

    // How the time was entered (Timer or Typing), only for solves that have it (older, FMC, Multi-Blind and imported ones don't)
    const doneWithRow = s.doneWith ? `
            <div class="modal-scramble">
                With: ${s.doneWith}
            </div>
    ` : "";

    // The time, in parentheses when its average drops it (best and worst of an ao5)
    const timeHtml = dropped ? `(${formatStatValue(s)})` : formatStatValue(s);

    // Solve row: a <details> whose <summary> line opens and closes it; data-key finds it again after a redraw (see refreshDetailsModal)
    return `
        <details class="modal-solve-row" data-key="${s.createdAt}|${s.time}">
            <summary class="modal-solve-main">
                <span class="modal-solve-number">#${i + 1}</span>
                <span class="modal-solve-time">${timeHtml}</span>
                <span class="modal-solve-preview">${s.scramble}</span>
            </summary>

            <div class="modal-solve-actions">
                <button data-action="ok" ${solveData}>OK</button>
                <button id="plus2-${blockIndex}-${i}" data-action="plus2" ${solveData}>${buttonText}</button>
                <button data-action="dnf" ${solveData}>DNF</button>
                <button data-action="remove" ${solveData}>✖</button>
                <button data-action="share-solve" ${solveData}>Share</button>
            </div>

            <div class="modal-scramble">
                Scramble: ${s.scramble}
            </div>

            <div class="modal-scramble">
                Inspection: ${s.inspection}
            </div>

            <div class="modal-scramble">
                Date: ${shortDate(s.createdAt)}
            </div>
            ${doneAtRow}
            ${doneWithRow}
            ${solutionRows}
        </details>
    `;
}

// HTML of the best / worst / σ line under an average's result
function statsLineHtml(best, worst, sigma) {
    return `
        <div class="modal-average-stats">
            Best: ${formatStatValue(best)} | Worst: ${formatStatValue(worst)} | &sigma;: ${formatStatValue(sigma)}
        </div>
    `;
}

// HTML of an average card with its header, stats line and Share button, and an empty solves list the solves are drawn into
function cardHtml(headerText, statsLine, blockIndex, extraClass = "") {
    // Saved for the Share button, which shares the header as shown
    modalCardHeaders[blockIndex] = { title: headerText, stats: statsLine };
    return `
        <div class="modal-average-card${extraClass}">
            <div class="modal-average-header">
                <div>
                    <b>${headerText}</b>
                    ${statsLine}
                </div>
                <button class="modal-share-btn" data-action="share-average" data-block="${blockIndex}">Share</button>
            </div>

            <div class="modal-solves"></div>
        </div>
    `;
}

// Lists every card and solve the modal can show: the average in progress first, then the saved ones newest first
function buildModalItems() {
    const averages = getSessionAverages();
    const items = [];
    modalBlocks = averages;
    // cardHtml fills it again for the cards of this build
    modalCardHeaders = {};

    // The average in progress (the session's buffer) goes first, above the finished ones
    const bufferSolves = averageObj.solvesArray;
    if (bufferSolves.length > 0) {
        let bufferHeader;
        // Classic's buffer is the whole session (the sidebar already has its stats), so it gets no stats line
        let bufferStats = "";
        if (averageObj.mode === "classic") {
            // Classic keeps every solve in the buffer, so just count them
            bufferHeader = `classic: ${wrapTimesValue(bufferSolves.length)} solves`;
        } else {
            // Solves done out of solves needed, like "ao5 in progress: 3/5"
            bufferHeader = `${averageObj.mode} in progress: ${wrapTimesValue(`${bufferSolves.length}/${getNeededSolves(averageObj.mode)}`)}`;
            // One solve left in an ao5: also the best and worst possible result, like the footer
            if (averageObj.mode === "ao5" && bufferSolves.length === 4) {
                const ao5Avg = computeAverage(bufferSolves, "ao5");
                // Two DNFs already make both of them a DNF
                bufferHeader += ` (bpAo5: ${formatStatValue(ao5Avg.dnf ? "DNF" : ao5Avg.bpAo5)}, wpAo5: ${formatStatValue(ao5Avg.dnf ? "DNF" : ao5Avg.wpA05)})`;
            }
            // Best, worst and σ of the solves so far, like the footer
            const liveAvg = computeAverage(bufferSolves, averageObj.mode);
            bufferStats = statsLineHtml(liveAvg.best, liveAvg.worst, liveAvg.sigma);
        }

        // Same card as a finished average; blockIndex -1 tells the buttons it's the average in progress
        items.push({ type: "card", html: cardHtml(bufferHeader, bufferStats, -1, " modal-buffer-card") });
        // An average in progress drops nothing yet, but droppedIndexes checks that itself
        const bufferDropped = droppedIndexes(bufferSolves, averageObj.mode);
        bufferSolves.forEach((s, i) => items.push({ type: "solve", s, i, blockIndex: -1, dropped: bufferDropped.has(i) }));
    }

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

        // The block's saved best, worst and σ (formatted strings, parsed back to seconds like the footer does)
        const blockStats = statsLineHtml(parseTimeToSeconds(block.best), parseTimeToSeconds(block.worst), parseTimeToSeconds(block.sigma));

        // The card, then one item per solve
        items.push({ type: "card", html: cardHtml(headerText, blockStats, blockIndex) });
        // Solves the average drops, shown in parentheses
        const dropped = droppedIndexes(block.solves, block.mode);
        block.solves.forEach((s, i) => items.push({ type: "solve", s, i, blockIndex, dropped: dropped.has(i) }));
    });

    return items;
}

// Draws modalItems until count of them are on screen: a card goes into the modal, a solve into the last card drawn
function drawItemsUpTo(count) {
    const end = Math.min(count, modalItems.length);
    while (modalDrawnCount < end) {
        const item = modalItems[modalDrawnCount];
        if (item.type === "card") {
            modalBody.insertAdjacentHTML("beforeend", item.html);
            // The next solves belong to this card
            currentSolvesList = modalBody.lastElementChild.querySelector(".modal-solves");
        } else {
            currentSolvesList.insertAdjacentHTML("beforeend", solveRowHtml(item.s, item.i, item.blockIndex, item.dropped));
        }
        modalDrawnCount++;
    }
}

// Draws more batches while the bottom of the box is close (also fills a box the first batch didn't)
function drawWhileNearBottom() {
    // Hidden, the box has no height, so it would draw everything
    if (modal.classList.contains("hidden")) return;
    while (modalDrawnCount < modalItems.length) {
        // Space left below what's visible
        const distanceToBottom = modalContent.scrollHeight - modalContent.scrollTop - modalContent.clientHeight;
        if (distanceToBottom > MODAL_LOAD_DISTANCE) return;
        drawItemsUpTo(modalDrawnCount + MODAL_BATCH_SIZE);
    }
}

// Rebuilds the items from the session and draws the first count of them under the title
function drawModal(count) {
    modalItems = buildModalItems();
    modalDrawnCount = 0;
    modalBody.innerHTML = `<h3 class="modal-title">Session averages</h3>`;
    drawItemsUpTo(count);
}

// Opens the modal at the top, with only the first batch drawn (Open Session button)
function openDetailsModal() {
    // Shown first, so drawWhileNearBottom can measure the box
    modal.classList.remove("hidden");
    drawModal(MODAL_BATCH_SIZE);
    modalContent.scrollTop = 0;
    drawWhileNearBottom();
}

// Redraws the open modal after a change, with as many solves drawn, the same rows open and the same scroll position
function refreshDetailsModal() {
    if (modal.classList.contains("hidden")) return;
    const scrollTop = modalContent.scrollTop;
    // Solve rows open before the redraw (a +2 is clicked inside an open row), by date and time so they're found even if their average moved
    const openKeys = [...modalBody.querySelectorAll("details[open]")].map(row => row.dataset.key);
    drawModal(modalDrawnCount);
    // Open them again, before scrolling back, since open rows are taller
    openKeys.forEach(key => modalBody.querySelector(`details[data-key="${key}"]`)?.setAttribute("open", ""));
    modalContent.scrollTop = scrollTop;
    drawWhileNearBottom();
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

    // Change the solve and recompute its average
    penalty2(blockIndex, solveIndex, finalPenalty);
    // Classic mode also recounts its rolling averages, before they're saved and drawn
    if (averageObj.mode === "classic") updateClassicStats(true);
    const session = getCurrentSession();
    session.classicStats = structuredClone(classicStats);
    saveSessions();
    renderHistory();
    // Rebuild the modal if it's open, so it shows the new numbers
    refreshDetailsModal();
}

// Deletes a saved solve from its average, then recounts, saves and redraws
function removeSolve(blockIndex, solveIndex) {
    remove2(blockIndex, solveIndex)
    if(averageObj.mode === "classic") updateClassicStats(true);
    const session = getCurrentSession();
    session.classicStats = structuredClone(classicStats);
    saveSessions();
    renderHistory();
    showLastSolve();
    // Rebuild the modal if it's open, without the removed solve
    refreshDetailsModal();
}

// Checks a typed solution on cubisz: scramble, apply the moves, count them, and work out TPS
function submitSolution(blockIndex, solveIndex) {
    // A solve of the average in progress (blockIndex -1) is in the buffer, the others in their saved average
    const solve = blockSolves(blockIndex)[solveIndex];

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