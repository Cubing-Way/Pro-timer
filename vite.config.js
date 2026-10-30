import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";

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
  // Web workers (csTimer's scrambler) are built as ES modules
  worker: {
    format: "es"
  },
  // Keep the built code readable
  build: {
    minify: false
  },
  plugins: [htmlIncludes()],
};
