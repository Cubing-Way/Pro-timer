import { getCurrentSession } from "../session/session.js";
import { syncModeWithEvent } from "../topbar/topbarController.js"
import { displayScramble } from "../scramble/scramble.js";
import { timerSettObj } from "../settings/timerSetObj.js";
import { timeInsertion } from "../settings/settingsController.js";
import { timerObj } from "../timer/timerState.js";
import { handleFMC } from "./FMC.js";
import { handleMBLD } from "./MBLD.js";

const eventObj = {
    event: getCurrentSession().scrambleType || "333", 
};

let vis = null;
    if (window.innerWidth > 768) {
        vis = document.querySelector("#scrambleVis");
    } else {
        vis = document.querySelector("#scrambleVis2");
    }
    

    if (eventObj.event === "333fm" || eventObj.event === "r3ni") {
        timerSettObj.timerFlag = true;
        document.getElementById("typing-container").style.display = "none";
        document.querySelector(".timerOpt").style.display = "none";
    } else {
        document.querySelector(".timerOpt").style.display = "block";
        if (timeInsertion === "Typing") {
            document.getElementById("typing-container").style.display = "block";
            timerObj.timerFlag = true;
        } else {
            timerSettObj.timerFlag = false;
        }
    }

const eventSelect = document.getElementById("eventSelect");

// Default scramble
// Init scramble from session
const session = getCurrentSession();
eventObj.event = session.scrambleType || "333";
eventSelect.value = eventObj.event;


await displayScramble(eventObj.event, vis);

const display = document.getElementById("timer");
if (eventObj.event === "333fm") handleFMC(display);
if (eventObj.event === "r3ni") handleMBLD(display);


export { eventObj, vis };