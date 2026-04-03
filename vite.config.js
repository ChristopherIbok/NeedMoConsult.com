import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), // transforms CJS → ESM at serve time
  viteCommonjs(), cloudflare()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: [
      '@cloudflare/realtimekit-react',
      '@cloudflare/realtimekit-react-ui',
    ],
  },
  build: {
    target: 'esnext',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
})