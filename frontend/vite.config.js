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
          // Silent logging for debugging
        },
        onProxyRes: (proxyRes, req) => {
          // Silent logging for debugging
        },
        onError: (err) => {
          // Suppress error logging to prevent console spam when backend is down
          // console.error(`❌ Proxy error to ${PRIMARY_TARGET}:`, err.message);
          // console.log(`💡 Backend server not running. Start it with: mvn spring-boot:run`);
        },
      },
    },
  },
});
