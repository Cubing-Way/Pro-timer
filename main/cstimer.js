// csTimer's scrambler runs in a web worker, so generating scrambles never freezes the page
const worker = new Worker(
  `${import.meta.env.BASE_URL}cstimer_module.js?worker_file&type=classic`
);

// Id of the last request sent to the worker
let msgid = 0;
// Resolve function of each request still waiting for an answer, by id
const callbacks = {};

// The worker answers [id, type, result]: resolve that request's promise and forget it
worker.onmessage = (e) => {
  const [id, , result] = e.data;
  callbacks[id]?.(result);
  delete callbacks[id];
};

// Sends one request to the worker and returns a promise of its answer
function call(type, args = []) {
  return new Promise((resolve) => {
    msgid++;
    callbacks[msgid] = resolve;
    worker.postMessage([msgid, type, args]);
  });
}

// What the app can ask csTimer for
export const csTimer = {
  // Scramble of a csTimer type ("333", "pll"…); len is the length for types that take one
  getScramble: (type, len = 0) => call('scramble', [type, len]),
  // SVG picture of a scrambled puzzle
  getImage: (scramble, type) => call('image', [scramble, type]),
  // Seed for the random scrambles
  setSeed: (seed) => call('seed', [seed]),
  // Changes one of csTimer's global options
  setGlobal: (key, value) => call('set', [key, value]),
};
