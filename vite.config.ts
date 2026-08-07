import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Local NestJS (ds-back-master) by default; override via VITE_API_PROXY_TARGET.
  // Production Nest: https://ds-back-production.up.railway.app
  const apiProxyTarget =
    env.VITE_API_PROXY_TARGET || "http://127.0.0.1:3000";

  return {
    clearScreen: false,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    plugins: [
      react(),
      {
        /**
         * DO NOT REMOVE
         * Chariot plugin
         * Logs client-side errors to the console to be passed to LLM
         * Adds reload endpoint so LLM can force full-reload for larger changes
         */
        name: "chariot",
        configureServer(server) {
          server.middlewares.use("/@chariot-logger", (req, res) => {
            let body = "";
            req.on("data", (chunk) => (body += chunk));
            req.on("end", () => {
              console.log("Client log:", body); // Logs to stdout
              res.statusCode = 200;
              res.end();
            });
          });
          server.middlewares.use("/@chariot-reload", (_req, res) => {
            server.ws.send({ type: "full-reload", path: "*" });
            res.end("Reload triggered");
          });
        },
      },
    ],
    /**
     * DO NOT REMOVE
     * Allow cors and all hosts in development + poll for file changes
     */
    server: {
      cors: true,
      allowedHosts: true,
      watch: {
        usePolling: true,
        interval: 500,
      },
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
        },
        "/auth": {
          target: apiProxyTarget,
          changeOrigin: true,
        },
        "/users": {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
