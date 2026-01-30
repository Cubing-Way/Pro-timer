
(function() {
    let startTime;
    let interval;
    let inspectionInterval;
    let solving = false;
    let solveFlag = false;
    let inspectionFlag = false;
    let inspecting = false;
    let wcaTimeout;
    let wcaFlag = true;

    function wcaToDebouncing(event) {
        if (event.key === ' ' && wcaFlag && inspecting) {
            clearTimeout(wcaTimeout);
            wcaTimeout = setTimeout(()=> {
                wcaFlag = false;
            }, 300)
        }
    }

    function wcaToDebouncing2(event) {
        if (event.key === ' ' && wcaFlag && inspecting) {
            wcaFlag = true;
        }
    }

    function keydownBoolean(event) {
        if (event.key = ' ' && !inspecting && inspectionFlag) { // Permits inspection() to be evoked
            inspectionFlag = false;
        }
        if (event.key = ' ' && !solving && solveFlag) { // Permits startTime() to be evoked
            solveFlag = false;
        }
    }

    function keyupBoolean(event) {
        if (event.key = ' ' && inspecting && wcaFlag) { // Prevents inspection() from being evoked
            inspectionFlag = true;
        }
        if (event.key = ' ' && solving) { // Prevents startTime() from being evoked
            solveFlag = true;
        }
    }

    function inspection(event) { // Inspection Function
        if (event.key = ' ' && !inspectionFlag) {
            let inspectionTime = 0;
            let sound1 = new Audio('https://ia904706.us.archive.org/1/items/203052-enjoypa-08/203052__enjoypa__08.wav');
            let sound2 = new Audio('https://ia904709.us.archive.org/19/items/203058-enjoypa-12/203058__enjoypa__12.wav'); 
            document.getElementById('timer').textContent = '0';
            inspectionInterval = setInterval(() => {              
                inspectionTime++;
                document.getElementById('timer').textContent = inspectionTime;
                if (inspectionTime === 8) sound1.play();
                if (inspectionTime === 12) sound2.play()
                if (inspectionTime === 15) console.log('15 seconds (+2)')
                if (inspectionTime === 17) {
                    console.log('17 seconds (DNF)')
                    endInspection();
                } 
            }, 1000);
            inspecting = true;
            inspectionFlag = true;         
        }
    }

    function endInspection() {
        clearInterval(inspectionInterval);
    }
    
    function startTimer(event) { // Start Time Function
        if (event.key === ' ' && !solving && !solveFlag && inspectionFlag && !wcaFlag) {
            endInspection();
            startTime = performance.now();
            interval = setInterval(() => {
                const timerElement = document.getElementById('timer')
                const currentTime = (performance.now() - startTime) / 1000;
                timerElement.textContent = currentTime.toFixed(2);
            }, 10);
            solving = true;
            wcaFlag = true;
        }
    }

    function stopTimer(event) { // Stop time Function
        if (event.key === ' ' && solving) {         
            const endTime = performance.now();
            const elapsedTime = (endTime - startTime) / 1000;
            const timerDuration = elapsedTime.toFixed(2);
            document.getElementById('timer').textContent = timerDuration;
            clearInterval(interval);
            inspectionFlag = true;
        }
    }

document.addEventListener('keydown', wcaToDebouncing);
document.addEventListener('keydown', wcaToDebouncing2);
document.addEventListener('keydown', keydownBoolean); // Adds all event listeners
document.addEventListener('keyup', keyupBoolean);
document.addEventListener('keyup', inspection);
document.addEventListener('keyup', startTimer);
document.addEventListener('keydown', stopTimer);
})();