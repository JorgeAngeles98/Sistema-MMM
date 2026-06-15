import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Redirige /api y /uploads al backend Express en dev
      "/api": "http://localhost:4000",
      "/uploads": "http://localhost:4000",
    },
  },
});
