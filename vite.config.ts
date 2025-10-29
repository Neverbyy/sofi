import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  // Настройка для Netlify (без префикса пути)
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://test.sofi-assistant.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy, _options) => {
          proxy.on('error', (_err, _req, _res) => {
            // Proxy error
          })
          proxy.on('proxyReq', (_proxyReq, _req, _res) => {
            // Proxy request
          })
          proxy.on('proxyRes', (_proxyRes, _req, _res) => {
            // Proxy response
          })
        }
      }
    }
  }
})
