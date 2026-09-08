import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  build: { rollupOptions: { input: { shop: resolve('index.html'), editor: resolve('editor/index.html') } } },
  server: { port: 5173, strictPort: true },
});
