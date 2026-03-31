import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'

export default defineConfig({
  plugins: [
    react(),
    viteCommonjs(), // transforms CJS → ESM at serve time
  ],
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