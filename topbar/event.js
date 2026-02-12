import { getCurrentSession } from "../session.js";
import { syncModeWithEvent } from "./topbarButtons.js"
import { displayScramble } from "../scramble.js";


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

displayScramble(eventObj.event, vis);




export { eventObj, vis };