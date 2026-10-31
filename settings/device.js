// Where the app's own solves are done: the device's type and, when the browser tells it, its model

// iPads on iPadOS 13 or newer say "Macintosh" like a Mac, but Macs have no touch screen
function isIPad(userAgent) {
    return /iPad/.test(userAgent) || (/Macintosh/.test(userAgent) && navigator.maxTouchPoints > 1);
}

// "Computer", "Cellphone" or "Tablet", from the user agent and the touch points
function detectDeviceType() {
    const userAgent = navigator.userAgent;   // the browser's text about itself and the device

    if (isIPad(userAgent)) return "Tablet";
    // Phones say "Mobi" (Chrome's "Mobile", Firefox's "Mobile;"), and iPhones say "iPhone"
    if (/Mobi|iPhone/.test(userAgent)) return "Cellphone";
    // Android without "Mobile" is a tablet
    if (/Android/.test(userAgent)) return "Tablet";
    return "Computer";
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
