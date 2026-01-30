import {
  nodeEndpointPort
} from "./chunk-2AUSVPAU.js";
import {
  exposeAPI
} from "./chunk-7GUL3OBQ.js";
import "./chunk-XO3JAA3V.js";

// src/cubing/search/worker-workarounds/search-worker-entry.js
if (exposeAPI.expose) {
  await import("./inside-TJAQBDDY.js");
  const messagePort = globalThis.postMessage ? globalThis : await nodeEndpointPort();
  messagePort.postMessage("comlink-exposed");
}
var WORKER_ENTRY_FILE_URL = import.meta.url;
export {
  WORKER_ENTRY_FILE_URL
};
//# sourceMappingURL=search-worker-entry.js.map
