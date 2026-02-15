const timerSettObj = { inspectionType: localStorage.getItem("inspectionType") || "WCA", timerFlag: false, previousInspectionType:timerSettObj.inspectionType;  };

document.getElementById("inspection-type").value = timerSettObj.inspectionType;
document.getElementById("inspection-type").addEventListener("change", () => {
    previousInspectionType = timerSettObj.inspectionType;
    timerSettObj.inspectionType = document.getElementById("inspection-type").value;
    localStorage.setItem("inspectionType", timerSettObj.inspectionType);
});

let delayFlagType = localStorage.getItem("delayFlagType") || "WCA";
document.getElementById("delay-flag").value = delayFlagType;
document.getElementById("delay-flag").addEventListener("change", () => {
    delayFlagType = document.getElementById("delay-flag").value;
    localStorage.setItem("delayFlagType", delayFlagType);
});

// Time insertion setting (Timer or Typing)
let timeInsertion = localStorage.getItem("timeInsertion") || "Timer";
    if (timeInsertion === "Typing") {
        timerSettObj.timerFlag = true;
    } else {
        timerSettObj.timerFlag = false;
    }
    
document.getElementById("time-insertion").value = timeInsertion;
document.getElementById("time-insertion").addEventListener("change", () => {
    timeInsertion = document.getElementById("time-insertion").value;
    if (timeInsertion === "Typing") {
        timerSettObj.timerFlag = true;
    } else {
        timerSettObj.timerFlag = false;
    }
    localStorage.setItem("timeInsertion", timeInsertion);
    updateTypingUI();
});

function updateTypingUI() {
    const container = document.getElementById("typing-container");
    if (!container) return;
    if (timeInsertion === "Typing") {
        container.style.display = "block";
        const input = document.getElementById("typed-time");
        if (input) input.focus();
    } else {
        container.style.display = "none";
    }
}

export { 
    delayFlagType, 
    timeInsertion, 
    previousInspectionType, 
    updateTypingUI,
    timerSettObj
};