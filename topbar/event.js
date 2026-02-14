import { getCurrentSession } from "../session.js";
import { syncModeWithEvent } from "./topbarButtons.js"
import { displayScramble } from "../scramble.js";
import { handleFMC } from "../FMC.js";


const eventObj = {
    event: getCurrentSession().scrambleType || "333"
};

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