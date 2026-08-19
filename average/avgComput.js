function computeAverage(solves, mode) {
    const times = solves.map(s => {
        if (s.penalty === "DNF") return Infinity;
        if (typeof s.penalty === "number") return s.time + s.penalty;
        return s.time;
    });

    let best = null;
    let worst = null;

    // =========================
    // BO3 (Best of 3)
    // =========================
    if (mode === "bo3") {
        const dnfs = times.filter(t => t === Infinity).length;
        if (dnfs >= 2) {
            return { dnf: true };
        }

        const sorted = [...times].sort((a, b) => a - b);
        best = sorted[0];
        worst = sorted[sorted.length - 1];

        // For BO3, avg is the mean of all 3 solves
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

    // =========================
    // BO5 (Best of 5)
    // =========================
    if (mode === "bo5") {
        // BO5 (BLD format)
        // Best single is the result, but we also compute Ao5 stats

        const sorted = [...times].sort((a, b) => a - b);
        best = sorted[0];
        worst = sorted[sorted.length - 1];

        // ---- Ao5 for the same 5 solves ----
        const trimmed = sorted.slice(1, 4);

        let avg = null;
        if (trimmed.includes(Infinity)) {
            avg = "DNF";
        } else {
            avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
        }

        // sigma still uses all 5
        const validTimes = times.filter(t => t !== Infinity);
        const meanAll = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
        const varianceAll = validTimes.reduce((sum, t) => sum + Math.pow(t - meanAll, 2), 0) / validTimes.length;
        const sigma = Math.sqrt(varianceAll);

        return {
            dnf: false,
            avg,      // ← now Ao5
            best,     // ← BLD result
            worst,
            sigma
        };

    }

    if (mode === "ao5") {
        const dnfs = times.filter(t => t === Infinity).length;
        if (dnfs >= 2) {
            return { dnf: true };
        }

        const sorted = [...times].sort((a, b) => a - b);

        best = sorted[0];
        worst = sorted[sorted.length - 1];

        // Trim for average only
        const trimmed = sorted.slice(1, 4);

        // =========================
        // Average (WCA style)
        // =========================
        let avg = null;
        if (trimmed.includes(Infinity)) {
            avg = "DNF";
        } else {
            avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;  
        }

        // =========================
        // σ using ALL 5 solves
        // =========================

        const validTimes = times.filter(t => t !== Infinity);

        const meanAll = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;

        const varianceAll = validTimes.reduce((sum, t) => sum + Math.pow(t - meanAll, 2), 0) / validTimes.length;

        const sigma = Math.sqrt(varianceAll);

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

// =========================
// FMC Ao3 (WCA rules)
// =========================

if (mode === "fmc3") {
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

    // ✅ sigma over move counts
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

// =========================
// GENERIC AON (ao5, ao12, ao100, etc)
// =========================
if (mode.startsWith("ao")) {

    const N = times.length;

    const dnfs = times.filter(t => t === Infinity).length;
    if (dnfs >= 2) return { dnf: true };

    const sorted = [...times].sort((a, b) => a - b);

    let trimCount = Math.floor(N * 0.05);
    if (N === 5) trimCount = 1;

    const trimmed = sorted.slice(trimCount, N - trimCount);

    let avg = null;
    if (trimmed.includes(Infinity)) {
        avg = "DNF";
    } else {
        avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
    }

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
    // =========================
    // MO3 (Mean of 3)
    // =========================
    const dnfs = times.filter(t => t === Infinity).length;
    if (dnfs >= 1) {
        return { dnf: true };
    }

    const avg = (times.reduce((a, b) => a + b, 0) / times.length);

    const variance = times.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / times.length;

    const sigma = Math.sqrt(variance);

    best = Math.min(...times);
    worst = Math.max(...times);

    return {
        dnf: false,
        avg,
        best,
        worst,
        sigma
    };
}

export { computeAverage };