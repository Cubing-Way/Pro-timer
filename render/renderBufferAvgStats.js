import { computeAverage, parseTimeToSeconds } from "../average/avgController.js";
import { wrapTimesValue } from "./renderHelpers.js";

function renderAvgStats({ type, solves, mode, block }, averageObj, classicStats, formatStatValue) {
    // type: "live" | "saved" | null

if (averageObj.mode === "classic") {

return `
    Best mo3: ${formatStatValue(classicStats.best.mo3?.avg) ?? wrapTimesValue("-")}
    <br>
    Best ao5: ${formatStatValue(classicStats.best.ao5?.avg) ?? wrapTimesValue("-")}
    <br>
    Best ao12: ${formatStatValue(classicStats.best.ao12?.avg) ?? wrapTimesValue("-")}
    <br>
    Best ao100: ${formatStatValue(classicStats.best.ao100?.avg) ?? wrapTimesValue("-")}
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

export { renderAvgStats };