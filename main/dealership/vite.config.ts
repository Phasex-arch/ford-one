import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Para GitHub Pages: coloque o nome do seu repositório em VITE_BASE
// Ex: se o repo for "ford-one", deixe '/ford-one/'
// Para domínio próprio (CNAME), deixe '/'
const base = process.env.VITE_BASE ?? '/';

export default defineConfig({
  plugins: [react()],
  base,
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.spec.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@data': path.resolve(__dirname, './src/data'),
    },
  },
});
