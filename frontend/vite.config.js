import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// En Docker el backend se llama "backend"; fuera de Docker, localhost.
const target = process.env.VITE_PROXY_TARGET ?? "http://localhost:3000";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: { "/api": { target, changeOrigin: true } },
    watch: { usePolling: true }, // necesario para que los volúmenes de Docker detecten cambios
  },
});
