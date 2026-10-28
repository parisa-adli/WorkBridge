import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port:3000,
    // the server's CORS allows only this origin, so fail instead of moving to 3001
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    // react-loader-spinner's ESM build default-imports CJS styled-components; Node interop breaks it unless Vite transforms it
    server: { deps: { inline: ['react-loader-spinner'] } },
  },
})
