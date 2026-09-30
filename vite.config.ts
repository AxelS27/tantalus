import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'preview-project-pages',
      configurePreviewServer(server) {
        server.middlewares.use((request, _response, next) => {
          if (request.method === 'GET' && /^\/projects\/[a-z0-9-]+$/.test(request.url ?? '')) {
            request.url += '/index.html';
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '127.0.0.1',
    // Avoid caching an empty module while an editor is rewriting a source file.
    watch: {
      awaitWriteFinish: { stabilityThreshold: 150, pollInterval: 25 },
    },
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800,
  },
});
