// Runs the inspection count on the timer: whole seconds on screen, the exact time in timerObj.inspection
function inspection(inspecType, setTimerDisplay, timerObj) {

    timerObj.inspecting = true;

    const start = performance.now(); // real high-res time
    // Last whole second handled, so each sound plays only once
    let lastSecond = -1;

    timerObj.interval = setInterval(() => {
        const elapsedMs = performance.now() - start;
        const seconds = Math.floor(elapsedMs / 1000);
        const secondsWithDecimals = elapsedMs / 1000;

        // Store the float value in timerObj.inspection
        timerObj.inspection = parseFloat(secondsWithDecimals.toFixed(2));

        // WCA inspection: "8 seconds" and "12 seconds" calls, and the count stops at 17 (DNF)
        if (inspecType === "WCA") {
            if (seconds !== lastSecond) {
                lastSecond = seconds;

                if (seconds === 8)  new Audio("./audio/8seconds.mp3").play();
                if (seconds === 12) new Audio("./audio/12seconds.mp3").play();
                if (seconds === 17) clearInterval(timerObj.interval);
            }
        }

        setTimerDisplay('time', seconds);
    }, 10); // the time comes from performance.now(), so how often this runs doesn't change it
}

export { inspection };
