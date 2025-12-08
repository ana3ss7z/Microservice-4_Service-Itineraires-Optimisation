import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Primary server (remote)
const PRIMARY_TARGET = "http://172.30.80.11:31030";
// Fallback server (local Docker)
const FALLBACK_TARGET = "http://localhost:8082";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      "/api": {
        target: PRIMARY_TARGET,
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          // On error, switch to fallback server
          proxy.on("error", (err) => {
            console.log(`⚠️  Primary server error: ${err.message}`);
            console.log(`   Switching to fallback: ${FALLBACK_TARGET}`);

            // Update target to fallback for next requests
            options.target = FALLBACK_TARGET;
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
