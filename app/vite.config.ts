import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    proxy: {
      '/api/riot-americas': {
        target: 'https://americas.api.riotgames.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/riot-americas/, ''),
      },
      '/api/riot-la1': {
        target: 'https://la1.api.riotgames.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/riot-la1/, ''),
      },
      '/api/leetify': {
        target: 'https://api-public.cs-prod.leetify.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/leetify/, ''),
      },
    },
  },
})

