import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "react/build",
    emptyOutDir: true,
    manifest: true, // <-- Generate manifest.json
  },
  base: "/wp-content/themes/astra-child/react/build/",
  server: {
    proxy: {
      // All requests starting with /graphql will be proxied to your WordPress site
      "/graphql": {
        target: "https://cashbox.com.au", // Your local WordPress URL
        changeOrigin: true,
        secure: true, // Use false if your local WP is HTTP, not HTTPS
      },
      "/wp-json": {
        target: "https://cashbox.com.au",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
