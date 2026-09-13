import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@data': path.resolve(__dirname, './src/data'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: [path.resolve(__dirname, 'src/test/setup.ts')],
    css: false,
    // Reset via config (não via beforeEach) — um mockReset() dentro de um
    // beforeEach do usuário, combinado com um mockImplementation que rejeita
    // no próprio teste, confunde a detecção de unhandled rejection do
    // Vitest/Node e falha o teste mesmo com o erro corretamente capturado.
    mockReset: true,
  },
});
