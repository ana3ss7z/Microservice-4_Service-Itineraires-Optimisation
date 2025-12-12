import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Primary server target
const PRIMARY_TARGET = "http://localhost:8082"; // Remote server
// Alternative servers (for manual fallback):
// const LOCAL_TARGET = "http://localhost:8082";     // Local Docker
// const BACKUP_TARGET = "http://172.30.80.11:31030"; // Backup remote

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
        // Increased timeout to accommodate longer processing requests
        timeout: 65000, // 65 seconds (more than client timeout to prevent early proxy timeout)
        proxyTimeout: 65000, // Also set proxy timeout
        onProxyReq: (req) => {
          console.log(
            `🔄 Request: ${req.method} ${req.url} -> ${PRIMARY_TARGET}`
          );
        },
        onProxyRes: (proxyRes, req) => {
          console.log(
            `✅ Response: ${req.method} ${req.url} -> ${proxyRes.statusCode}`
          );
        },
        onError: (err) => {
          console.error(`❌ Proxy error to ${PRIMARY_TARGET}:`, err.message);

          // Note: Vite proxy target cannot be changed dynamically without server restart
          // For runtime server switching, use client-side logic in api.js instead
          console.log(
            `💡 To switch servers, update PRIMARY_TARGET and restart dev server`
          );
        },
      },
    },
  },
});
