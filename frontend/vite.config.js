import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // load .env from tally-dashboard root (one level up from frontend/)
  const env = loadEnv(mode, path.resolve(__dirname, ".."), "");

  const backendPort  = env.BACKEND_PORT  || "8000";
  const frontendPort = parseInt(env.FRONTEND_PORT || "5173");

  return {
    plugins: [react()],
    server: {
      port: frontendPort,
      proxy: {
        "/api": {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
        },
      },
    },
  };
});
