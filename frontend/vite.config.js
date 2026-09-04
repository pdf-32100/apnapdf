import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // dev convenience: /api and /uploads proxy to the backend
      "/api": "http://localhost:4000",
      "/uploads": "http://localhost:4000",
    },
  },
});
