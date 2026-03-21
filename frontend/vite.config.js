import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  // ✅ Allow access from devices on the same WiFi network
  server: {
    host: true,        // enables network access
    port: 5173,        // default Vite port
    strictPort: true
  }
});