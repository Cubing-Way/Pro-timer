// All sessions by name, loaded from localStorage ("Default" on a first visit), and which one is in use
const sessionsObj = {
    sessions: JSON.parse(localStorage.getItem("sessions")) || {
        "Default": { averages: [] }
    },
    currentSession: localStorage.getItem("currentSession") || "Default",
    order: JSON.parse(localStorage.getItem("sessionOrder")) || [],   // session names in the select's order (names missing from it go last)
    selectEl: document.getElementById("sessionSelect")   // the top bar's session select
};

export { sessionsObj };