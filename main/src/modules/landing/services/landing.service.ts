import type { ContactFormData } from '../types/landing.types';

/**
 * Simula envio do formulário de contato.
 * Em produção, substituir pelo endpoint real da API Ford.
 */
export async function submitContactForm(data: ContactFormData): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.info('[Ford One] Formulário enviado:', data);
      resolve();
    }, 1400);
  });
}
