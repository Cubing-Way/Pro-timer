const sessionsObj = {
    sessions: JSON.parse(localStorage.getItem("sessions")) || {
        "Default": { averages: [] }
    },
    currentSession: localStorage.getItem("currentSession") || "Default",
    selectEl: document.getElementById("sessionSelect")
};

export { sessionsObj };