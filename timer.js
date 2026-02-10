import { setTimerDisplay, lastTime } from "./main.js";

const timerObj = {
    timerPhase: 0,
    interval: 0,
    wcaInterval: 0,
    wcaDelayCount: false,
    inspecting: false,
    inspection: 0,
};

function timerPhases(delayFlagType) {
    if (timerObj.timerPhase !== 1) {
        timerObj.timerPhase++;
    } else if (timerObj.timerPhase === 1) {
        // Skip delay flag if delay flag type is None
        if (delayFlagType === "None") {
            setTimerDisplay('color', 'limeGreen');
            timerObj.timerPhase++;
        } else {
            setTimerDisplay('color', 'red');
            timerObj.wcaInterval = setInterval(() =>{
                setTimerDisplay('color', 'limeGreen');
                timerObj.wcaDelayCount++;
            }, 300);
        }
    }
}

function wcaDelayFlag() {
    if (timerObj.wcaDelayCount >= 1) {
        timerObj.timerPhase++;
        timerObj.wcaDelayCount = 0;
        clearInterval(timerObj.wcaInterval);
    } else {
        setTimerDisplay('color', '#eaeaf0')
        timerObj.wcaDelayCount = 0;
        clearInterval(timerObj.wcaInterval);          
    }
}

let seconds = 0;
let interval = null;
let running = false;

function inspection2() {
        if (!running) {
        // START
        running = true;
        setTimerDisplay('time', seconds);
        interval = setInterval(() => {
            seconds++;
                        setTimerDisplay('time', seconds);
                if (seconds === 8)  new Audio("./audio/8seconds.mp3").play();
                if (seconds === 12) new Audio("./audio/12seconds.mp3").play();
                if (seconds === 17) {
                    running = false;
                    clearInterval(interval);
                    interval = null;
                    seconds = 0;
                    if (lastTime) {
                        setTimerDisplay('time', lastTime);
                    } else {
                        setTimerDisplay('time', "0.00");
                    }
                }
        }, 1000);
    } else {
        // STOP
        running = false;
        clearInterval(interval);
        interval = null;
        seconds = 0;
            if (lastTime) {
                setTimerDisplay('time', lastTime);
            } else {
                setTimerDisplay('time', "0.00");
            }

    }
}

function inspection(inspecType) {

    timerObj.inspecting = true;

    const start = performance.now(); // real high-res time
    let lastSecond = -1;

    timerObj.interval = setInterval(() => {
        const elapsedMs = performance.now() - start;
        const seconds = Math.floor(elapsedMs / 1000);
        const secondsWithDecimals = elapsedMs / 1000;

        // Store the float value in timerObj.inspection
        timerObj.inspection = parseFloat(secondsWithDecimals.toFixed(2));

        if (inspecType === "WCA") {
            if (seconds !== lastSecond) {
                lastSecond = seconds;

                if (seconds === 8)  new Audio("./audio/8seconds.mp3").play();
                if (seconds === 12) new Audio("./audio/12seconds.mp3").play();
                if (seconds === 17) clearInterval(timerObj.interval);
            }
        }

        setTimerDisplay('time', seconds);
    }, 10); // interval frequency does NOT matter anymore
}


// Truncate (WCA-style) to 2 decimals
function truncate2(n) {
    return (Math.floor(n * 100) / 100).toFixed(2);
}

function formatTime(milisseconds) {
    let seconds = (milisseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    if (minutes < 1) {
        return truncate2(seconds);
    } else if (minutes >= 1) {
        seconds = (seconds - 60 * minutes)
        return `${minutes}: ${seconds < 10 ? '0' : ''}${truncate2(seconds)}`;
    } else if (minutes >= 60) {
        minutes = (minutes - 60 * hours)
        return `${hours}: ${minutes < 10 ? '0' : ''}${minutes}: ${seconds < 10 ? '0' : ''}${truncate2(seconds)}`;
    }
}

function startTimer(param) {
    setTimerDisplay('color', '#eaeaf0')
    clearInterval(timerObj.interval);
    timerObj.inspecting = false;
    if (param) {
        timerObj.timerPhase = 0;
        return;
    }
    const startTime = performance.now();
    timerObj.interval = setInterval(() =>{
        setTimerDisplay('time', formatTime(performance.now() - startTime));
    }, 10);
}

function stopTimer() {
    clearInterval(timerObj.interval);
    const endTime = document.getElementById('timer').innerHTML;
    timerObj.timerPhase = 0;
}

function skipInspectionStart() {
    clearInterval(timerObj.interval);
    clearInterval(timerObj.wcaInterval);
    timerObj.timerPhase = 0;
    timerObj.wcaDelayCount = 0;
    startTimer();
}

export { timerObj, timerPhases, wcaDelayFlag, inspection, inspection2, startTimer, stopTimer, skipInspectionStart }