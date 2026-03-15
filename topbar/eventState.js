import { getCurrentSession } from "../session.js";

const eventObj = {
    event: getCurrentSession().scrambleType || "333", 
};

let vis = null;
    if (window.innerWidth > 768) {
        vis = document.querySelector("#scrambleVis");
    } else {
        vis = document.querySelector("#scrambleVis2");
    }
    

export { eventObj, vis };