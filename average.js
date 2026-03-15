const averageObj = {
  mode: "ao5",
  solveCounter: 0,
  solvesArray: [] // array of solve objects
};

const classicStats = {
    current: {
        mo3: null,
        ao5: null,
        ao12: null,
        ao100: null
    },
    best: {
        mo3: null,
        ao5: null,
        ao12: null,
        ao100: null
    }
};




function parseTimeToSeconds(str) {
    if (str == null) {
        console.log(str)
        return null;
    };   // 🔥 prevents crash
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
    if (solveObj.time == null) return "-";   // ✅ safety

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

function updateClassicStats(recomputeBest = false) {

    const solves = averageObj.solvesArray;

    const updateRolling = (n, modeName) => {
        if (solves.length < n) return null;

        const result = computeAverage(
            solves.slice(-n),
            modeName
        );

        if (result.dnf) return "DNF";

        return result.avg;
    };

    // Current rolling values
    const mo3 = updateRolling(3, "mo3");
    const ao5 = updateRolling(5, "ao5");
    const ao12 = updateRolling(12, "ao12");
    const ao100 = updateRolling(100, "ao100");

    classicStats.current.mo3 = mo3;
    classicStats.current.ao5 = ao5;
    classicStats.current.ao12 = ao12;
    classicStats.current.ao100 = ao100;

    const updateBest = (key, value) => {
        if (value == null) return;

        if (
            classicStats.best[key] == null ||
            value < classicStats.best[key]
        ) {
            classicStats.best[key] = value;
        }
    };

    // Normal incremental update
    if (!recomputeBest) {

        updateBest("mo3", mo3);
        updateBest("ao5", ao5);
        updateBest("ao12", ao12);
        updateBest("ao100", ao100);

    } 
    else {

        // Reset best stats
        classicStats.best.mo3 = null;
        classicStats.best.ao5 = null;
        classicStats.best.ao12 = null;
        classicStats.best.ao100 = null;

        const recomputeBestAvg = (n, modeName) => {

            if (solves.length < n) return null;

            let best = null;

            for (let i = n; i <= solves.length; i++) {

                const result = computeAverage(
                    solves.slice(i - n, i),
                    modeName
                );

                if (result.dnf) return "DNF";

                if (best === null || result.avg < best) {
                    best = result.avg;
                }
            }

            return best;
        };

        classicStats.best.mo3 = recomputeBestAvg(3, "mo3");
        classicStats.best.ao5 = recomputeBestAvg(5, "ao5");
        classicStats.best.ao12 = recomputeBestAvg(12, "ao12");
        classicStats.best.ao100 = recomputeBestAvg(100, "ao100");
    }

    console.log("solves length:", solves.length);
}

function computeAverage(solves, mode) {
    const times = solves.map(s => {
        if (s.penalty === "DNF") return Infinity;
        if (s.penalty === "+2") return s.time + 2;
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
        if (s.penalty === "+2") return s.time + 2; // +2 moves
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

function averageOfN(
    time, 
    scramble, 
    inspection, 
    inspectionType, 
    isFMC = false, 
    modeFlag = false, 
    isMBLD = false,
    solvePhases
) {

    let inspecPenalty = null;

    if (inspectionType === "WCA" || averageObj.mode === "fmc3") {
        if (inspection >= 15) inspecPenalty = "+2"; 
        if (inspection >= 17) inspecPenalty = "DNF";
    }

    let seconds = null; 
    if (isFMC) {
        seconds = time.moveCount;
    } else if (isMBLD) {
        seconds = time.points;
     if (seconds <= 0) {
        inspecPenalty = "DNF";
    }
    } else {
        seconds = parseTimeToSeconds(time);
    }

    const solution = time.solution ? time.solution : null;

    if (!modeFlag) {
        averageObj.solvesArray.push({
            time: seconds,
            result: time.result, 
            penalty: inspecPenalty ? inspecPenalty : null,
            scramble: scramble,
            inspection,
            createdAt: Date.now(),
            solution,
            solvePhases
        });

        averageObj.solveCounter++;
    }

    // =========================
    // CLASSIC MODE (rolling ao5)
    // =========================

    if (averageObj.mode === "classic") {
        if (!modeFlag) updateClassicStats();
        
        const relevantSolves = averageObj.solvesArray.slice(-5);
        if (classicStats.current.ao5 !== null) {
            return {
                    mode: "classic",
                    average: classicStats.current.ao5,
                    solves: structuredClone(relevantSolves)
                };
        } else {
            return null;
        }
    }
    // Determine how many solves needed for this mode
    let neededSolves = 3; // default for mo3 and bo3
    if (averageObj.mode === "ao5" || averageObj.mode === "bo5") {
        neededSolves = 5;
    }

    if (averageObj.solveCounter >= neededSolves) {

        const relevantSolves = averageObj.solvesArray.slice(0, neededSolves);

        const avgObj = computeAverage(relevantSolves, averageObj.mode);

        const block = {
            mode: averageObj.mode,
            average: avgObj.avg === "DNF" ? "DNF" : formatSecondsToTime(avgObj.avg),
            worst: formatSecondsToTime(avgObj.worst),
            best: formatSecondsToTime(avgObj.best),
            sigma: formatSecondsToTime(avgObj.sigma),
            solves: structuredClone(relevantSolves)
        };

        // remove only used solves
        averageObj.solvesArray = averageObj.solvesArray.slice(neededSolves);
        averageObj.solveCounter = averageObj.solvesArray.length;

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
    updateClassicStats,
    averageObj,
    averageOfN,
    classicStats   // 👈 add this
};
