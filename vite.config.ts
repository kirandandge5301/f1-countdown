import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['.emergentagent.com', '.preview.emergentagent.com', '.preview.emergentcf.cloud', 'localhost', '127.0.0.1'],
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['.emergentagent.com', '.preview.emergentagent.com', '.preview.emergentcf.cloud', 'localhost', '127.0.0.1'],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
