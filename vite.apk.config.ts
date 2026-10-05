import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  base: "./",
  publicDir: false,
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, "apk/index.html"),
    },
    outDir: path.resolve(__dirname, "android/app/src/main/assets"),
    emptyOutDir: true,
  },
})
