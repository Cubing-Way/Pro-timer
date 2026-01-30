import { getSessionAverages } from "./solve.js";
import { formatDisplayTime } from "./average.js";

const modal = document.getElementById("detailsModal");
const modalBody = document.getElementById("modalBody");
const closeModalBtn = document.getElementById("closeModalBtn");

closeModalBtn.onclick = () => modal.classList.add("hidden");
modal.onclick = e => {
    if (e.target === modal) modal.classList.add("hidden");
};

function openDetailsModal() {
    const averages = getSessionAverages();

    let html = `<h3 class="modal-title">Session averages</h3>`;

    averages.forEach((block, blockIndex) => {
        html += `
            <div class="modal-average-card">
                <div class="modal-average-header">
                    <b>${block.mode} #${averages.length - blockIndex}: ${block.average}</b>
                </div>

                <div class="modal-solves">
        `;

        block.solves.forEach((s, i) => {
            html += `
                <div class="modal-solve-row">
                    <div class="modal-solve-main">
                        <span>#${i + 1}: ${formatDisplayTime(s)}</span>

                        <div class="modal-solve-actions">
                            <button onclick="setPenalty(${blockIndex}, ${i}, null)">OK</button>
                            <button onclick="setPenalty(${blockIndex}, ${i}, '+2')">+2</button>
                            <button onclick="setPenalty(${blockIndex}, ${i}, 'DNF')">DNF</button>
                            <button onclick="removeSolve(${blockIndex}, ${i})">✖</button>
                        </div>
                    </div>

                    <div class="modal-scramble">
                        ${block.solves[i].scramble}
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