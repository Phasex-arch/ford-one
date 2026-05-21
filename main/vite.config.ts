import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  base: '/frontend/main/',

  plugins: [react()],

  resolve: {
    alias: {
      '@':        resolve(__dirname, 'src'),
      '@shared':  resolve(__dirname, 'src/shared'),
      '@modules': resolve(__dirname, 'src/modules'),
      '@styles':  resolve(__dirname, 'src/styles'),
      '@assets':  resolve(__dirname, 'src/assets'),
    },
  },

  css: {
    preprocessorOptions: {
      scss: { additionalData: '' },
    },
  },
});
