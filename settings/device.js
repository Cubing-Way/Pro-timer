// Where the app's own solves are done: the device's type and, when the browser tells it, its model

// iPads on iPadOS 13 or newer say "Macintosh" like a Mac, but Macs have no touch screen
function isIPad(userAgent) {
    return /iPad/.test(userAgent) || (/Macintosh/.test(userAgent) && navigator.maxTouchPoints > 1);
}

// A computer by its system: "Windows PC", "Mac", "Chromebook" or "Linux PC"; "Computer" when it's none of them
function computerType(userAgent) {
    // Chrome and Edge say the system in userAgentData ("Windows", "macOS"…); other browsers only in the user agent
    const system = navigator.userAgentData?.platform || userAgent;

    if (/Windows/.test(system)) return "Windows PC";
    // "macOS" in userAgentData, "Macintosh" in the user agent (iPads were already told apart by isIPad)
    if (/mac/i.test(system)) return "Mac";
    // Chromebooks say "CrOS" in the user agent, checked before Linux since ChromeOS is built on it
    if (/CrOS|Chrome OS|Chromium OS/.test(system)) return "Chromebook";
    if (/Linux/.test(system)) return "Linux PC";
    return "Computer";
}

// "Cellphone", "Tablet" or, on a computer, its system (computerType), from the user agent and the touch points
function detectDeviceType() {
    const userAgent = navigator.userAgent;   // the browser's text about itself and the device

    if (isIPad(userAgent)) return "Tablet";
    // Phones say "Mobi" (Chrome's "Mobile", Firefox's "Mobile;"), and iPhones say "iPhone"
    if (/Mobi|iPhone/.test(userAgent)) return "Cellphone";
    // Android without "Mobile" is a tablet
    if (/Android/.test(userAgent)) return "Tablet";
    return computerType(userAgent);
}

// The device's model ("Pixel 8", "iPhone", "iPad"), or null when the browser doesn't give it
async function detectDeviceModel() {
    // Only Chrome-based browsers have userAgentData; on Android they give the model when asked
    if (navigator.userAgentData) {
        try {
            const { model } = await navigator.userAgentData.getHighEntropyValues(["model"]);
            // Computers give an empty model
            if (model) return model;
        } catch {
            // The browser refused to tell it: try the user agent below
        }
    }

    // Safari (and every iOS browser) only tells which kind of Apple device it is
    const userAgent = navigator.userAgent;
    if (/iPhone/.test(userAgent)) return "iPhone";
    if (isIPad(userAgent)) return "iPad";
    return null;
}

export { detectDeviceType, detectDeviceModel };
