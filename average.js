const averageObj = {
  mode: "ao5",
  solveCounter: 0,
  solvesArray: [] // array of solve objects
};

function parseTimeToSeconds(str) {
    if (typeof str === "number") return str;
    if (str.includes(":")) {
        const [m, s] = str.split(":");
        return parseInt(m, 10) * 60 + parseFloat(s);
    }
    return parseFloat(str);
}

function manageTime(time) {
    const t = Number(time);
    if (!Number.isFinite(t)) return "-";
    return t.toFixed(2);
}

function formatIntoMinutes(num) {
    if (num >= 60) {
        const m = Math.floor(num / 60);
        const s = (num % 60).toFixed(2).padStart(5, "0");
        return `${m}:${s}`;
    }
    return num.toFixed(2);
}

function formatDisplayTime(solveObj) {
    if (solveObj.penalty === "DNF") return "DNF";
    if (solveObj.penalty === "+2") return formatIntoMinutes(solveObj.time + 2) + " (+2)";
    return formatIntoMinutes(solveObj.time);
}

function formatSecondsToTime(sec) {
    if (sec === "DNF") return "DNF";

    sec = Number(sec);               // 🔥 normalize here

    if (!Number.isFinite(sec)) return "DNF";

    if (sec >= 60) {
        const m = Math.floor(sec / 60);
        const s = (sec % 60).toFixed(2).padStart(5, "0");
        return `${m}:${s}`;
    }

    return manageTime(sec);
}

function formatSolveTime(solve) {
    if (solve.penalty === "DNF") return "DNF";
    if (solve.penalty === "+2") return (solve.time + 2).toFixed(2) + " (+2)";
    return solve.time.toFixed(2);
}

function computeAverage(solves, mode) {
    const times = solves.map(s => {
        if (s.penalty === "DNF") return Infinity;
        if (s.penalty === "+2") return s.time + 2;
        return s.time;
    });

    let best = null;
    let worst = null;

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
    // MO3
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

function averageOfN(time, scramble, inspection) {

    let inspecPenalty = null
    if (inspection === 16) {
        inspecPenalty = "+2"
    } else if (inspection === 17) {
        inspecPenalty = "DNF"
    }

    const seconds = parseTimeToSeconds(time);

    averageObj.solvesArray.push({
        time: seconds,
        penalty: inspecPenalty ? inspecPenalty : null,
        scramble: scramble,
        inspection,
        createdAt: Date.now()
    });

    averageObj.solveCounter++;

    const needed = averageObj.mode === "ao5" ? 5 : 3;

    if (averageObj.solveCounter === needed) {
        const avgObj = computeAverage(averageObj.solvesArray, averageObj.mode);

        const block = {
            mode: averageObj.mode,
            average: avgObj.avg === "DNF" ? "DNF" : formatSecondsToTime(avgObj.avg),
            worst: formatSecondsToTime(avgObj.worst),
            best: formatSecondsToTime(avgObj.best),
            sigma: formatSecondsToTime(avgObj.sigma),

            // 👇 single source of truth
            solves: structuredClone(averageObj.solvesArray)
        };

        // reset buffer
        averageObj.solvesArray = [];
        averageObj.solveCounter = 0;

        return block;
    }

    return null;
}

export {
    parseTimeToSeconds,
    formatSecondsToTime,
    formatSolveTime,
    computeAverage,
    formatDisplayTime,
    averageObj,
    averageOfN   // 👈 add this
};
