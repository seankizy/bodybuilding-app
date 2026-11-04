import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execSync } from "node:child_process";

// Build stamp shown in the app (More menu, Data, mesocycle sheet) so we can tell
// which bundle the home screen app is really running.
const sha = (process.env.VERCEL_GIT_COMMIT_SHA || (() => { try { return execSync("git rev-parse HEAD").toString().trim(); } catch { return "local"; } })()).slice(0, 7);

export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_SHA__: JSON.stringify(sha),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
  server: {
    port: 3000,
  },
});
