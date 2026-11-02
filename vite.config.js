import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
// Makes the service worker that caches the app so it works offline
import { VitePWA } from "vite-plugin-pwa";

// Matches <include src="./path.html"></include> and captures the path
const INCLUDE_TAG = /<include src="([^"]+)"><\/include>/g;

// Swaps every include tag in some HTML for that file's contents, following includes inside included files too
function expandIncludes(html, fromDir) {
  return html.replace(INCLUDE_TAG, (_, src) => {
    // The path is relative to the file that has the include tag, like an import
    const file = resolve(fromDir, src);
    return expandIncludes(readFileSync(file, "utf8"), dirname(file));
  });
}

// Vite plugin that builds index.html out of the HTML pieces in each folder, in dev and in the build
function htmlIncludes() {
  return {
    name: "html-includes",
    // "pre" runs before Vite's own HTML handling, so it also sees the tags that came from included files
    transformIndexHtml: {
      order: "pre",
      handler: (html, ctx) => expandIncludes(html, dirname(ctx.filename)),
    },
    // Included files aren't modules Vite tracks, so reload the page by hand when any HTML file changes
    handleHotUpdate({ file, server }) {
      if (!file.endsWith(".html")) return;
      server.ws.send({ type: "full-reload" });
      return [];
    },
  };
}

export default {
  // The site is served from github.io/Pro-timer/, so every URL starts with /Pro-timer/
  base: "/Pro-timer/",
  // Dev server address: http://localhost:3000/Pro-timer/
  server: {
    port: 3000
  },
  // Vite's dev bundling moves cubing.js's files, and it then can't find its worker file
  optimizeDeps: {
    exclude: ["cubing"]
  },
  build: {
    // Keep the built code readable
    minify: false,
    // Vite's preload helper uses document when it has files to preload, and cubing.js's worker has no document
    modulePreload: false,
    rollupOptions: {
      output: {
        // That helper goes in its own file, or cubing.js's worker would load the app's main file to get it
        manualChunks: (id) => (id.includes("vite/preload-helper") ? "preload-helper" : undefined),
      },
    },
  },
  plugins: [
    htmlIncludes(),
    // Writes dist/sw.js at build time, with every built file in its precache list
    VitePWA({
      // A new version waits for the user's OK (offline/offlineController.js), so it never reloads mid-solve
      registerType: "prompt",
      // offline/offlineController.js registers the service worker itself
      injectRegister: false,
      // No web app manifest yet (it needs app icons), so the app isn't installable, only offline
      manifest: false,
      workbox: {
        // Precache the page, code, styles and the timer sounds (each sound is only requested when it plays)
        globPatterns: ["**/*.{js,css,html,mp3}"],
        // cubing.js's 3D pictures (three.js, almost 900 KB): the app only draws 2D ones, so they never load
        globIgnores: ["**/twisty-dynamic-3d-*.js"],
      },
    }),
  ],
};
