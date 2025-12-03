import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Primary server (remote/production)
const PRIMARY_TARGET = "http://172.30.80.11:31030";
// Fallback server (local Docker)
const FALLBACK_TARGET = "http://localhost:8082";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: FALLBACK_TARGET,
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          // Try primary server first, fallback to local on error
          proxy.on("error", (err, req, res) => {
            console.log(
              `⚠️  Proxy error with ${FALLBACK_TARGET}: ${err.message}`
            );
            console.log(`   Trying primary server: ${PRIMARY_TARGET}`);
          });
          proxy.on("proxyRes", (proxyRes, req) => {
            console.log(
              `✅ ${req.method} ${req.url} -> ${proxyRes.statusCode}`
            );
          });
        },
      },
    },
  },
});
