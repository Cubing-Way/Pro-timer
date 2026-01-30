import { defineConfig } from "vite";

export default defineConfig({
  base: "/REPO_NAME/",
  server: {
    port: 3000,
  },
  worker: {
    format: "es",
  },
});
