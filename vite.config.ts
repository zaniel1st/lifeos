import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { URL, fileURLToPath } from 'url'

export default defineConfig({
  plugins: [react()],
  base: '/lifeos/',
  // If your files are nested inside a subfolder, this tells Vite to find them:
  root: './', 
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
