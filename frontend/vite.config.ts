import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const apiTarget = process.env.SENTINEL_API_BASE ?? "http://localhost:8000";
const evalMode = process.env.SENTINEL_EVAL_MODE === "1";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: "../data/public",
  build: {
    chunkSizeWarningLimit: 3000, // 3MB limit
  },
  server: {
    // Benchmark containers never edit frontend source or public assets. Keep
    // the development watcher and HMR for local development, but disable both
    // in evaluation runs so every trial does not install thousands of file
    // watches for the immutable data/public tree. Dynamic application state
    // still arrives through the existing /api polling requests.
    watch: evalMode ? null : undefined,
    hmr: evalMode ? false : undefined,
    // Trial containers get a generated hostname, so no fixed list can match.
    // The server is only reachable from its own trial's isolated network.
    allowedHosts: true,
    proxy: {
      "/api": {
        target: apiTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
