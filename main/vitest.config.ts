import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@modules': resolve(__dirname, 'src/modules'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@assets': resolve(__dirname, 'src/assets'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: [resolve(__dirname, 'src/test/setup.ts')],
    css: false,
    mockReset: true,
    // O dealership vive aninhado em main/dealership com sua própria suíte —
    // sem isso, "npm test" aqui também executaria (e duplicaria) os testes
    // dele.
    exclude: ['**/node_modules/**', '**/dealership/**'],
  },
});
