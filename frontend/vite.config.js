import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss({
      optimize: { minify: false },
    }),
  ],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 2500,
  },
})