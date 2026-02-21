import { timerObj } from "./timerState";
import { setTimerDisplay } from "./timerDOM";
import { startTimer, stopTimer } from "./timer.js";
import { averageOfN } from "../average.js";
import { currentScramble, displayScramble } from "../scramble.js";
import { timerSettObj } from "../settings/timerSetObj.js";
import { renderHistory } from "../render.js";
import { eventObj } from "../topbar/eventState.js";
import { vis } from "../topbar/event.js";
import { addAverageBlock } from "../solve.js";

let running = false;
let running2 = false;
let running3 = false;
function inspection2() { //Actually the whole timer not inspection
        if (!running && !running2 && !running3) {
        // START
        running = true;
        inspection();
    } else if (running && !running2){
            setTimerDisplay('color', 'red');
            timerObj.wcaInterval = setInterval(() =>{
                setTimerDisplay('color', 'limeGreen');
                timerObj.wcaDelayCount++;
            }, 300);
        running = false;
        running2 = true;
        // STOP

    } else if(!running && running2){
        if (timerObj.wcaDelayCount < 1) {
             running = true;
             running2 = false;
            timerObj.wcaDelayCount = 0;
            clearInterval(timerObj.wcaInterval);
            setTimerDisplay('color', '#eaeaf0')
             return;
        } else {
            setTimerDisplay('color', '#eaeaf0')
            timerObj.wcaDelayCount = 0;
            clearInterval(timerObj.wcaInterval);          
        }
        startTimer();
        running2 = false;
        running3 = true;
    }
    else if (running3){
        running3 = false;
        stopTimer();
                const block = averageOfN(document.getElementById("timer").innerHTML, currentScramble, timerObj.inspection, timerSettObj.inspectionType);
        
        if (block) {
            addAverageBlock(block);
            console.log(block)
        }

        renderHistory();
        displayScramble(eventObj.event, vis);
        running2 = false;
    }
}

document.addEventListener("keydown", (e) => {
    if(e.repeat) return;
    inspection2();
});

document.addEventListener("keyup", (e) => {
    if(e.repeat) return;
        if (running === false && running2 === true)
    inspection2();
});

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

export { inspection, inspection2 };