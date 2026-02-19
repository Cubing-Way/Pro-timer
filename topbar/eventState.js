import { getCurrentSession } from "../session.js";

const eventObj = {
    event: getCurrentSession().scrambleType || "333"
};

export { eventObj };