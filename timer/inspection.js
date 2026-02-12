import { timerObj } from "./timerState";
import { lastTime } from "./timeTyping.js";
import { setTimerDisplay } from "./timerDOM";

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

export { inspection, inspection2 };