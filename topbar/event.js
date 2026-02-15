import { getCurrentSession } from "../session.js";
import { syncModeWithEvent } from "./topbarButtons.js"
import { displayScramble } from "../scramble.js";
import { handleFMC } from "../FMC.js";
import { timerSettObj, timeInsertion } from "../settings/timerSett.js";
import { timerObj } from "../timer/timerState.js";

const eventObj = {
    event: getCurrentSession().scrambleType || "333"
};

    if (eventObj.event === "333fm") {
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
let vis = null;
    if (window.innerWidth > 768) {
        vis = document.querySelector("#scrambleVis");
    } else {
        vis = document.querySelector("#scrambleVis2");
    }
    
// Default scramble
// Init scramble from session
const session = getCurrentSession();
eventObj.event = session.scrambleType || "333";
eventSelect.value = eventObj.event;

syncModeWithEvent(eventObj.event);   // ✅

await displayScramble(eventObj.event, vis);

if (eventObj.event === "333fm") handleFMC();


export { eventObj, vis };