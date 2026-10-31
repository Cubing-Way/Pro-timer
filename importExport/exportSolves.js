// Pro Timer's backup file: building it and downloading it

// Wraps every session with a tag and a version, so an import can recognise the file
function buildExportFile(sessions) {
    return {
        app: "Pro Timer",        // the import checks this to know the file is ours
        version: 1,              // raise it if the file's shape ever changes
        exportedAt: Date.now(),  // when the backup was made (ms since 1970)
        sessions                 // every session by name, the same object as in localStorage
    };
}

// Makes the browser save an object as a .json file
function downloadJSON(obj, filename) {
    // The file's text, held in memory as a Blob
    const blob = new Blob([JSON.stringify(obj)], { type: "application/json" });
    // A temporary address that points at the Blob
    const url = URL.createObjectURL(blob);

    // A link with "download" saves what it points at instead of opening it
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    // Free the Blob once the download has started
    setTimeout(() => URL.revokeObjectURL(url), 0);
}

// File name with today's local date, like "pro-timer_2026-10-31.json"
function exportFileName() {
    const d = new Date();
    // Month and day padded to 2 digits (getMonth counts from 0)
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `pro-timer_${d.getFullYear()}-${month}-${day}.json`;
}

export { buildExportFile, downloadJSON, exportFileName };