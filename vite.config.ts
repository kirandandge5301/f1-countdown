import fs from "fs"
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

const SAMPLE_MAX_BYTES = 5 * 1024 * 1024;

/** Dev server only: saves the share-card samples that /?studio&export=samples posts. */
function sampleExport(): Plugin {
  return {
    name: 'share-card-samples',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__samples', (req, res) => {
        const file = (req.url ?? '').replace(/^\//, '');
        const refuse = (code: number) => { res.statusCode = code; res.end(); };
        if (req.method !== 'POST' || !/^[a-z0-9-]+\.png$/.test(file)) return refuse(400);
        // Only this dev site's own page may post here, not another website open in the browser
        if (req.headers.origin !== `http://${req.headers.host}`) return refuse(403);
        const chunks: Buffer[] = [];
        let size = 0;
        req.on('data', (chunk: Buffer) => {
          size += chunk.length;
          if (size <= SAMPLE_MAX_BYTES) chunks.push(chunk);
        });
        req.on('end', () => {
          if (size > SAMPLE_MAX_BYTES) return refuse(413);
          const dir = path.resolve(__dirname, 'docs/share-cards/samples');
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(path.join(dir, file), Buffer.concat(chunks));
          refuse(204);
        });
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react(), sampleExport()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
