import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Keep the old REACT_APP_* variable names working (see src/lib/config.ts)
  envPrefix: ["VITE_", "REACT_APP_"],
  server: { port: 3000 },
  preview: { port: 3000 },
  build: {
    // Same output folder as CRA, so Dockerfile.frontend and `serve -s build` stay unchanged
    outDir: "build",
    sourcemap: false,
  },
});
