import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    // Увеличиваем лимит chunk size чтобы убрать warning
    chunkSizeWarningLimit: 1500,
    // Минификация с esbuild (быстрее чем terser)
    minify: 'esbuild',
    // Параллельная сборка модулей
    target: 'es2020',
    rollupOptions: {
      output: {
        // Разбиваем большие библиотеки на отдельные chunks
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
        },
      },
    },
  },
});