/**
 * @file main.tsx
 * @description Ponto de entrada da aplicação Ford One.
 * Monta o componente raiz (App) no elemento #root do index.html.
 * O React.StrictMode ativa verificações adicionais em desenvolvimento.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);