import { _ as __vitePreload } from "./preload-helper-DN2scbUx.js";
import { g as exposeAPI } from "./index-gQ5L7cms.js";
import "./index-6lt5Usf4.js";
if (exposeAPI.expose) {
  void __vitePreload(() => import("./inside-UWSZBO4Y-BgokJKAk.js"), true ? [] : void 0).then(() => {
    if (globalThis.postMessage) {
      globalThis.postMessage("comlink-exposed");
    } else {
      globalThis.process.getBuiltinModule("node:worker_threads").parentPort?.postMessage("comlink-exposed");
    }
  });
}
var WORKER_ENTRY_FILE_URL = import.meta.url;
export {
  WORKER_ENTRY_FILE_URL
};
