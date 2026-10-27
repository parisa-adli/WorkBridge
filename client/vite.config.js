import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port:3000,
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    // react-loader-spinner's ESM build default-imports CJS styled-components; Node interop breaks it unless Vite transforms it
    server: { deps: { inline: ['react-loader-spinner'] } },
  },
})
