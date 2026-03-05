import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- We need this back!

export default defineConfig({
  plugins: [
    react(),
    tailwindcss() // <-- And this tells Vite to compile your CSS!
  ],
  server: {
    proxy: {
      '/api-token': {
        target: 'https://login.microsoftonline.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-token/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
          });
        }
      },
      '/api-data': {
        target: 'https://growpath.sandbox.operations.eu.dynamics.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-data/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
          });
        }
      }
    }
  }
})