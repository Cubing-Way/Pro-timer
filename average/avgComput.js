import { isPointsSolves } from "./avgHelper.js";

// Best and worst of a block: lowest time, or most points for Multi-Blind; a DNF (Infinity) is always the worst
function bestAndWorst(times, higherIsBetter) {
    const valid = times.filter(t => t !== Infinity);
    if (valid.length === 0) return { best: Infinity, worst: Infinity };
    const hasDNF = valid.length < times.length;
    return {
        best: higherIsBetter ? Math.max(...valid) : Math.min(...valid),
        worst: hasDNF ? Infinity : (higherIsBetter ? Math.min(...valid) : Math.max(...valid))
    };
}

// Average of some solves in a mode: { dnf, avg, best, worst, sigma } in seconds (moves for FMC, points for Multi-Blind)
function computeAverage(solves, mode) {
    // Each solve's final value: time plus penalty, Infinity for a DNF
    const times = solves.map(s => {
        if (s.penalty === "DNF") return Infinity;
        if (typeof s.penalty === "number") return s.time + s.penalty;
        return s.time;
    });

    // Multi-Blind blocks are points, so their best is the highest value
    const higherIsBetter = isPointsSolves(solves);

    let best = null;
    let worst = null;

    // BO3 (best of 3): the result is the best attempt, avg is the mean of the successful ones
    if (mode === "bo3") {
        // Best of 3 only needs one success: it's a DNF when every attempt is
        const dnfs = times.filter(t => t === Infinity).length;
        if (dnfs === times.length) {
            return { dnf: true };
        }

        ({ best, worst } = bestAndWorst(times, higherIsBetter));

        // Mean and σ of the successful attempts
        const validTimes = times.filter(t => t !== Infinity);
        const avg = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
        const varianceAll = validTimes.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / validTimes.length;
        const sigma = Math.sqrt(varianceAll);

        return {
            dnf: false,
            avg,
            best,
            worst,
            sigma
        };
    }

    // BO5 (best of 5, 3x3 Blindfolded): the result is the best single, avg is the ao5 of the same solves
    if (mode === "bo5") {

        const sorted = [...times].sort((a, b) => a - b);
        ({ best, worst } = bestAndWorst(times, higherIsBetter));

        // Ao5: drop the best and worst, average the middle 3
        const trimmed = sorted.slice(1, 4);

        let avg = null;
        if (trimmed.includes(Infinity)) {
            avg = "DNF";
        } else {
            avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
        }

        // σ of all the successful solves
        const validTimes = times.filter(t => t !== Infinity);
        const meanAll = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
        const varianceAll = validTimes.reduce((sum, t) => sum + Math.pow(t - meanAll, 2), 0) / validTimes.length;
        const sigma = Math.sqrt(varianceAll);

        return {
            dnf: false,
            avg,      // the ao5
            best,     // the BLD result
            worst,
            sigma
        };

    }

    // AO5 (average of 5): drop the best and worst, average the middle 3; two DNFs make it a DNF
    if (mode === "ao5") {
        const dnfs = times.filter(t => t === Infinity).length;
        if (dnfs >= 2) {
            return { dnf: true };
        }

        // Fastest first, so a DNF (Infinity) is always last
        const sorted = [...times].sort((a, b) => a - b);

        best = sorted[0];
        worst = sorted[sorted.length - 1];

        // Trim for average only
        const trimmed = sorted.slice(1, 4);

        // Average (WCA style): a DNF among the middle 3 can't happen with one DNF, but stays safe
        let avg = null;
        if (trimmed.includes(Infinity)) {
            avg = "DNF";
        } else {
            avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
        }

        // σ of all the successful solves
        const validTimes = times.filter(t => t !== Infinity);

        const meanAll = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;

        const varianceAll = validTimes.reduce((sum, t) => sum + Math.pow(t - meanAll, 2), 0) / validTimes.length;

        const sigma = Math.sqrt(varianceAll);

        // 4 solves done: best and worst possible ao5 depending on the 5th solve
        if (sorted.length === 4) {
            const bpAo5 = (sorted[0] + sorted [1] + sorted[2]) / 3;
            const wpA05 = (sorted[3] + sorted[2] + sorted [1]) / 3;
            return {
                dnf: false,
                avg,
                best,
                worst,
                sigma,
                bpAo5,
                wpA05
            }
        }

        return {
            dnf: false,
            avg,
            best,
            worst,
            sigma
        };
    }

// FMC ao3 (WCA rules): mean of the 3 move counts; two DNFs make it a DNF

if (mode === "fmc3") {
    // Move counts, with the same penalty handling as times
    const values = solves.map(s => {
        if (s.penalty === "DNF") return Infinity;
        if (typeof s.penalty === "number") return s.time + s.penalty;
        return s.time;
    });

    const dnfs = values.filter(v => v === Infinity).length;

    if (dnfs >= 2) {
        return { dnf: true };
    }

    const valid = values.filter(v => v !== Infinity);

    // WCA FMC average rule
    const avg = valid.reduce((a, b) => a + b, 0) / valid.length;

    const best = Math.min(...valid);
    const worst = Math.max(...valid);

    // σ over move counts
    const meanAll = valid.reduce((a, b) => a + b, 0) / valid.length;
    const variance = valid.reduce((sum, v) => sum + Math.pow(v - meanAll, 2), 0) / valid.length;
    const sigma = Math.sqrt(variance);

    return {
        dnf: false,
        avg,
        best,
        worst,
        sigma
    };
}

// Other averages of N (ao12, ao100, used by classic mode): drop the best and worst 5% each, average the rest
if (mode.startsWith("ao")) {

    const N = times.length;

    // How many to drop on each side: 5% rounded up (1 for ao12, 5 for ao100)
    const trimCount = Math.ceil(N * 0.05);

    // DNFs sort last, so the average is only a DNF when there are more of them than the dropped worst solves
    const dnfs = times.filter(t => t === Infinity).length;
    if (dnfs > trimCount) return { dnf: true };

    const sorted = [...times].sort((a, b) => a - b);

    const trimmed = sorted.slice(trimCount, N - trimCount);

    let avg = null;
    if (trimmed.includes(Infinity)) {
        avg = "DNF";
    } else {
        avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
    }

    // σ of all the successful solves
    const validTimes = times.filter(t => t !== Infinity);
    const meanAll = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
    const variance = validTimes.reduce((sum, t) => sum + Math.pow(t - meanAll, 2), 0) / validTimes.length;
    const sigma = Math.sqrt(variance);

    return {
        dnf: false,
        avg,
        best: sorted[0],
        worst: sorted[sorted.length - 1],
        sigma
    };
}
    // MO3 (mean of 3, and anything else): plain mean; any DNF makes it a DNF
    const dnfs = times.filter(t => t === Infinity).length;
    if (dnfs >= 1) {
        return { dnf: true };
    }

    const avg = (times.reduce((a, b) => a + b, 0) / times.length);

    const variance = times.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / times.length;

    const sigma = Math.sqrt(variance);

    ({ best, worst } = bestAndWorst(times, higherIsBetter));

    return {
        dnf: false,
        avg,
        best,
        worst,
        sigma
    };
}

export { computeAverage };