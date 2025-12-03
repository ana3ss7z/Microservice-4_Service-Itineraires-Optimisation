import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Primary server (remote/production)
const PRIMARY_TARGET = "http://172.30.80.11:31030";
// Fallback server (local Docker)
const FALLBACK_TARGET = "http://localhost:8082";

// Check if primary server is available
const checkServer = async (url) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    await fetch(`${url}/api/routes/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return true;
  } catch {
    return false;
  }
};

export default defineConfig(async () => {
  let target = PRIMARY_TARGET;

  try {
    const isPrimaryAvailable = await checkServer(PRIMARY_TARGET);
    if (!isPrimaryAvailable) {
      console.log(
        `⚠️  Primary server (${PRIMARY_TARGET}) not available, using fallback: ${FALLBACK_TARGET}`
      );
      target = FALLBACK_TARGET;
    } else {
      console.log(`✅ Connected to primary server: ${PRIMARY_TARGET}`);
    }
  } catch {
    console.log(`⚠️  Using fallback server: ${FALLBACK_TARGET}`);
    target = FALLBACK_TARGET;
  }

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on("error", (err) => {
              console.log(`❌ Proxy error: ${err.message}`);
            });
          },
        },
      },
    },
  };
});
