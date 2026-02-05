import { setTimerDisplay } from "./main.js";

const timerObj = {
    timerPhase: 0,
    interval: 0,
    wcaInterval: 0,
    wcaDelayCount: false,
    inspecting: false,
    inspection: 0
};

function timerPhases() {
    if (timerObj.timerPhase !== 1) {
        timerObj.timerPhase++;
    } else if (timerObj.timerPhase === 1) {        
        setTimerDisplay('color', 'red');
        timerObj.wcaInterval = setInterval(() =>{
            setTimerDisplay('color', 'limeGreen');
            timerObj.wcaDelayCount++;
        }, 300);
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

function inspection() {
        timerObj.inspection = 0;
        timerObj.inspecting = true;
        setTimerDisplay('time', `${timerObj.inspection}`)
        timerObj.interval = setInterval(()=> {
            timerObj.inspection++;
            if (timerObj.inspection === 8) new Audio("./audio/8seconds.mp3").play();
            if (timerObj.inspection === 12) new Audio("./audio/12seconds.mp3").play();
            if (timerObj.inspection === 17) clearInterval(timerObj.interval);
            setTimerDisplay('time',  timerObj.inspection)
        }, 1000)
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

function startTimer() {
    setTimerDisplay('color', '#eaeaf0')
    clearInterval(timerObj.interval);
    timerObj.inspecting = false;
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

export { timerObj, timerPhases, wcaDelayFlag, inspection, startTimer, stopTimer }