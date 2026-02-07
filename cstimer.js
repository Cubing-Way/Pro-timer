const worker = new Worker('/cstimer_module.js?worker_file&type=classic');

let msgid = 0;
const callbacks = {};

worker.onmessage = (e) => {
  const [id, , result] = e.data;
  callbacks[id]?.(result);
  delete callbacks[id];
};

function call(type, args = []) {
  return new Promise((resolve) => {
    msgid++;
    callbacks[msgid] = resolve;
    worker.postMessage([msgid, type, args]);
  });
}

export const csTimer = {
  getScramble: (type, len = 0) => call('scramble', [type, len]),
  getImage: (scramble, type) => call('image', [scramble, type]),
  setSeed: (seed) => call('seed', [seed]),
};
