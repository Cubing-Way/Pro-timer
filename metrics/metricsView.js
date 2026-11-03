// HTML of a reviewed solve's metrics, for the session pop-up

// Text made safe to put inside HTML, attributes included
function escapeHtml(text) {
    const box = document.createElement("div");
    box.textContent = text;
    return box.innerHTML.replaceAll('"', "&quot;");
}

// A method's name without its note in brackets
function methodName(name) {
    return name.replace(/\s*\(.*\)\s*$/, "");
}

// A score as a percentage, where the engine is 100% ("—" = no score: no step had moves of yours)
function percent(score) {
    return score === null ? "—" : `${Math.round(score * 100)}%`;
}

// A figure with its sign, since below 0 means better than the engine ("—" = no figure)
function signed(value, decimals) {
    if (value === null) return "—";
    return `${value > 0 ? "+" : ""}${value.toFixed(decimals)}`;
}

// A figure with a set number of decimals ("—" = no figure, like the pace figures of a solve with no time)
function fixed(value, decimals) {
    return value === null ? "—" : value.toFixed(decimals);
}

// One tile: its name, value and small note, and what it means when hovered
function tileHtml(label, value, note, meaning) {
    return `
        <div class="metrics-tile" title="${meaning}">
            <div class="metrics-tile-label">${label}</div>
            <div class="metrics-tile-value">${value}</div>
            <div class="metrics-tile-note">${note}</div>
        </div>
    `;
}

// One step's table row: your moves and effort beside the engine's pick, or which step already solved it
function stepRowHtml(step) {
    const name = escapeHtml(step.name);
    if (step.solvedBy) return `<tr><td>${name}</td><td colspan="3">solved with ${escapeHtml(step.solvedBy)}</td></tr>`;
    return `
        <tr>
            <td>${name}</td>
            <td>${step.moves ?? "—"} / ${step.engineMoves}</td>
            <td>${fixed(step.effort, 1)} / ${fixed(step.engineEffort, 1)}</td>
            <td>${signed(step.netEffort, 1)}</td>
        </tr>
    `;
}

// A solve's metrics: the method and the link to its full analysis, the tiles, then a table of its steps
function metricsHtml(m, link) {
    const netNote = m.netTime === null ? "below 0 = better" : `≈ ${signed(m.netTime, 2)} s at your pace`;
    const engineNote = m.engineTime === null ? "engine's own solve" : `≈ ${m.engineTime.toFixed(2)} s at your pace`;
    return `
        <div class="metrics">
            <div class="metrics-title">
                <span title="${escapeHtml(m.method)}">Cubisz review · ${escapeHtml(methodName(m.method))}</span>
                <a class="metrics-link" href="${escapeHtml(link)}" target="_blank" rel="noopener">Full analysis on Cubisz</a>
            </div>
            <div class="metrics-tiles">
                ${tileHtml("Effort score", percent(m.effortScore), "engine = 100%", "The engine's pick over yours, in effort, averaged over your steps: above 100% = easier to turn than the engine's picks")}
                ${tileHtml("Move score", percent(m.moveScore), "engine = 100%", "The engine's pick over yours, in moves, averaged over your steps: above 100% = fewer moves than the engine's picks")}
                ${tileHtml("Net effort", signed(m.netEffort, 1), netNote, "Your steps against the engine's picks, counting what each step left for the next ones: below 0 = better")}
                ${tileHtml("Execution", fixed(m.execution, 2), "effort per second", "Effort per second: TPS weighted by how hard your moves are to turn")}
                ${tileHtml("Your effort", m.effort.toFixed(1), `${m.moves} moves`, "How hard your whole solution is to turn, in easy turns: an R or a U flick is 1, regrips and awkward moves cost more")}
                ${tileHtml("Engine's solve", m.engineEffort.toFixed(1), engineNote, `The engine's own solve from the same scramble: ${m.engineMoves} moves`)}
            </div>
            <table class="metrics-steps">
                <thead>
                    <tr><th>Step</th><th>Moves / engine</th><th>Effort / engine</th><th>Net</th></tr>
                </thead>
                <tbody>
                    ${m.steps.map(stepRowHtml).join("")}
                </tbody>
            </table>
        </div>
    `;
}

// A short line under the solution, while a review runs or when it failed
function metricsNoteHtml(text) {
    return `<div class="modal-scramble">${escapeHtml(text)}</div>`;
}

// The line on an average's card: its mean effort score, how many of its solves that covers, and their method (nothing = none reviewed)
function averageMetricsHtml(figures, solveCount) {
    if (!figures) return "";
    return `
        <div class="modal-average-stats" title="${escapeHtml(figures.method)}">
            Effort score: ${percent(figures.effortScore)} (${figures.count}/${solveCount} solves, ${escapeHtml(methodName(figures.method))})
        </div>
    `;
}

export { escapeHtml, methodName, percent, signed, fixed, metricsHtml, metricsNoteHtml, averageMetricsHtml };
