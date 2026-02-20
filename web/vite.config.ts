import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

const isAdmin = process.env.BUILD_TARGET === "admin";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "../assets",
    emptyOutDir: !isAdmin,
    rollupOptions: {
      input: isAdmin
        ? { admin: resolve(__dirname, "admin.html") }
        : resolve(__dirname, "index.html"),
      output: isAdmin
        ? {
            entryFileNames: "[name]-[hash].js",
            chunkFileNames: "[name]-chunk-[hash].js",
            assetFileNames: "[name]-[hash].[ext]",
          }
        : {
            entryFileNames: "main-[hash].js",
            chunkFileNames: "main-chunk-[hash].js",
            assetFileNames: "main-[hash].[ext]",
          },
    },
  },
  server: {
    port: 4444,
    open: false,
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});
