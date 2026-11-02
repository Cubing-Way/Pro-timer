// Talks to Cubisz's engine in a hidden iframe: sends a solve and gets its metrics back, one solve at a time

// Cubisz's engine page: the local dev server while developing, the live site once built
const ENGINE_URL = import.meta.env.DEV ? "http://localhost:5173/engine.html" : "https://cubing-way.github.io/cubisz/engine.html";
const ENGINE_ORIGIN = new URL(ENGINE_URL).origin;
// Cubisz's site, in the same folder as the engine page
const SITE_URL = new URL("./", ENGINE_URL).href;

// How long the engine page gets to load (ms)
const LOAD_LIMIT = 30000;
// How long one review gets, for slow devices (ms)
const REVIEW_LIMIT = 300000;
// How long the engine stays loaded with nothing to do, before it's removed to free its memory (ms)
const IDLE_LIMIT = 120000;

// The hidden iframe, a promise for when it's ready, and what tells that promise (all null = not loaded)
let frame = null;
let frameReady = null;
let markReady = null;
// Timer that removes the engine when it's been idle
let idleTimer = null;

// Reviews asked for, the one under way first: { id, solve, onProgress, resolve, reject, timer }
const queue = [];
// The id of the next review, to match the engine's answers to it
let nextId = 1;
// What receives the method list when it arrives (null = none asked for)
let methodsListener = null;

// Removes the engine after a while with nothing to do; a new review stops the countdown
function startIdleCountdown() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(removeFrame, IDLE_LIMIT);
}

// Removes the iframe, which stops the engine and frees its memory
function removeFrame() {
    frame?.remove();
    frame = null;
    frameReady = null;
    markReady = null;
}

// Loads the iframe if it isn't loaded; resolves once the engine page says it's ready
function loadFrame() {
    if (frameReady) return frameReady;
    frameReady = new Promise((resolve, reject) => {
        // No answer in time: the site can't be reached (a failed iframe doesn't report an error)
        const timer = setTimeout(() => {
            removeFrame();
            reject(new Error("Cubisz can't be reached"));
        }, LOAD_LIMIT);
        markReady = () => {
            clearTimeout(timer);
            resolve();
        };
        frame = document.createElement("iframe");
        frame.src = ENGINE_URL;
        frame.hidden = true;
        frame.title = "Cubisz engine";
        document.body.append(frame);
    });
    return frameReady;
}

// Ends the review under way with a result or an error, then starts the next
function finishReview(settle, value) {
    const review = queue.shift();
    clearTimeout(review.timer);
    settle(value);
    runNextReview();
}

// Sends the first review waiting to the engine, or starts the idle countdown when there's none
function runNextReview() {
    const review = queue[0];
    if (!review) {
        startIdleCountdown();
        return;
    }
    clearTimeout(idleTimer);
    loadFrame().then(
        () => {
            // Past the limit the engine is stopped, since it may still be working
            review.timer = setTimeout(() => {
                removeFrame();
                finishReview(review.reject, new Error("The review took too long"));
            }, REVIEW_LIMIT);
            frame.contentWindow.postMessage({ type: "cubisz-review", id: review.id, ...review.solve }, ENGINE_ORIGIN);
        },
        (error) => finishReview(review.reject, error),
    );
}

// Messages from the engine page: only that page's are read
window.addEventListener("message", ({ data, origin, source }) => {
    if (origin !== ENGINE_ORIGIN || !frame || source !== frame.contentWindow) return;
    if (data.type === "cubisz-ready") {
        markReady?.();
        return;
    }
    if (data.type === "cubisz-methods") {
        methodsListener?.({ methods: data.methods, start: data.start });
        methodsListener = null;
        return;
    }
    const review = queue[0];
    // An answer with no id means the engine itself failed, so it ends the review under way
    if (!review || (data.id !== undefined && data.id !== review.id)) return;
    if (data.type === "cubisz-progress") review.onProgress(data);
    if (data.type === "cubisz-metrics") finishReview(review.resolve, data.metrics);
    if (data.type === "cubisz-error") finishReview(review.reject, new Error(data.message));
});

// Asks Cubisz which engine methods can be picked; resolves with { methods: their full names, start: the one used when none is picked }
async function requestMethods() {
    // A failed iframe takes the whole load limit to notice, so offline fails right away
    if (!navigator.onLine) throw new Error("You're offline");
    await loadFrame();
    // Only a list was needed, so the engine doesn't stay loaded for it
    if (!queue.length) startIdleCountdown();
    return new Promise((resolve) => {
        methodsListener = resolve;
        frame.contentWindow.postMessage({ type: "cubisz-methods" }, ENGINE_ORIGIN);
    });
}

// The address of a solve's full analysis on Cubisz's site; the solve goes after the #, so it stays in the browser, and its saved engine runs (JSON text) let the site rebuild the review with no engine call
function analysisLink({ scramble, solution, time, method, runs }) {
    const link = new URLSearchParams({ scramble, solution, time, method, runs });
    return `${SITE_URL}#${link}`;
}

// Asks for a solve's metrics ({ scramble, solution, time, method }; method "" = the one Cubisz starts on); onProgress hears { run, runs, step } as the engine goes; resolves with the metrics
function requestMetrics(solve, onProgress) {
    // A failed iframe takes the whole load limit to notice, so offline fails right away
    if (!navigator.onLine) return Promise.reject(new Error("You're offline, and reviews need Cubisz's site"));
    return new Promise((resolve, reject) => {
        queue.push({ id: nextId++, solve, onProgress, resolve, reject, timer: null });
        // Nothing under way: this one starts now
        if (queue.length === 1) runNextReview();
    });
}

export { requestMetrics, requestMethods, analysisLink };
